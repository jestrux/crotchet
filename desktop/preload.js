/* global document */
const { ipcRenderer, contextBridge } = require("electron");
const getIp = require("./utils/getIp");
const { appDir, readDir } = require("./modules/files");

const readFile = (props) => ipcRenderer.invoke("read-file", props);

const writeFile = (contents) => ipcRenderer.invoke("write-file", contents);

contextBridge.exposeInMainWorld(
	"onCrotchetReady",
	async ({ queryDb, dbInsert }) => {
		const dbExtensions = await queryDb("__crotchetExtensions");
		const devExtensions = await queryDb("__crotchetDevExtensions");

		const installExtension = ({ name, contents }) => {
			const asset = document.createElement("script");
			asset.innerHTML = `
					(() => { ${contents.replace("import", "//import")} })();
				`;
			asset.setAttribute("data-crotchet-extension", name);
			document.body.appendChild(asset);
		};

		if (devExtensions?.length) {
			devExtensions.forEach(({ name, contents }) =>
				installExtension({ name, contents })
			);
		}

		readDir({ path: appDir("extensions") }).then((res) => {
			if (res) {
				res.filter(
					(res) => res?.name?.length && res?.contents?.length
				).forEach(({ name, contents, updatedAt }) => {
					installExtension({ name, contents });

					const dbExtension = dbExtensions.find(
						(dbExtension) => dbExtension.name === name
					);

					// Check if we need to update the database
					const shouldUpdate = true;
					// const shouldUpdate =
					// 	!dbExtension ||
					// 	(dbExtension.updatedAt &&
					// 		updatedAt &&
					// 		new Date(updatedAt) >
					// 			new Date(dbExtension.updatedAt));

					if (shouldUpdate) {
						console.log(
							"Updating extension in DB: ",
							name,
							updatedAt,
							dbExtension?.updatedAt
						);
						dbInsert(
							"__crotchetExtensions",
							{
								name,
								contents,
								updatedAt,
							},
							{
								rowId: name,
							}
						);
					}
				});
			}
		});

		// Sync extensions from Firebase to local filesystem
		if (dbExtensions?.length) {
			dbExtensions.forEach(({ name, contents, isLocal, updatedAt }) => {
				if (isLocal)
					return console.log(
						`Don't sync ${name}, it's a local extension under app/public/extensions`
					);

				const extensionPath = appDir("extensions", name + ".ts");

				// Check if file exists and compare timestamps
				readFile({ path: extensionPath }).then((localFile) => {
					const shouldUpdate =
						!localFile ||
						(localFile.updatedAt &&
							updatedAt &&
							new Date(updatedAt) >
								new Date(localFile.updatedAt));

					if (shouldUpdate) {
						console.log(
							"Updating extension locally: ",
							name,
							localFile?.updatedAt,
							updatedAt
						);
						writeFile({
							path: extensionPath,
							contents: contents,
							updatedAt: updatedAt,
						});
					}
				});
			});
		}
	}
);

window.addEventListener("open-url", (e) => {
	ipcRenderer.send("open-url", e.detail);
});

window.addEventListener("socket-emit", (e) => {
	const { event, payload } = e.detail;
	ipcRenderer.send("socket-emit", { event, payload });
});

window.addEventListener("socket-broadcast", (e) => {
	const { event, payload } = e.detail;
	ipcRenderer.send("socket-broadcast", { event, payload });
});

window.addEventListener("get-file", (e) => {
	const [key, props] = e.detail;
	document.body.classList.add(`get-file-${key}`);
	ipcRenderer.invoke("get-file", props).then((result) => {
		document.body.classList.remove(`get-file-${key}`);
		window.dispatchEvent(
			new CustomEvent(`get-file-${key}`, { detail: result })
		);
	});
});

window.addEventListener("read-file", (e) => {
	const key = e.detail?.key;
	document.body.classList.add(`get-file-${key}`);
	ipcRenderer.invoke("read-file", e.detail).then((result) => {
		document.body.classList.remove(`get-file-${key}`);
		window.dispatchEvent(
			new CustomEvent(`read-file-${key}`, {
				detail: result,
			})
		);
	});
});

window.addEventListener("write-file", (e) =>
	ipcRenderer.invoke("write-file", e.detail)
);

window.addEventListener("read-network-file", (e) => {
	const [key, props] = e.detail;
	ipcRenderer
		.invoke("read-network-file", props)
		.then((result) =>
			window.dispatchEvent(new CustomEvent(key, { detail: result }))
		);
});

window.addEventListener("scan-network", (e) => {
	const [key, props] = e.detail;
	ipcRenderer
		.invoke("scan-network", props)
		.then((result) =>
			window.dispatchEvent(new CustomEvent(key, { detail: result }))
		);
});

window.addEventListener("restore", () => ipcRenderer.send("restore"));

ipcRenderer.on("floating-window-event", function (_, props) {
	window.dispatchEvent(
		new CustomEvent("floating-window-event-" + props._id, { detail: props })
	);
});

window.addEventListener("DOMContentLoaded", () => {
	document.body.classList.add("on-electron");
	document.body.setAttribute("data-socket-url", `http://${getIp()}:3127`);
});

ipcRenderer.on("background-window", function () {
	window.addEventListener("load", () => {
		document.body.classList.add("is-background-window");
	});
});

ipcRenderer.on("menu-item-click", function (_, itemId) {
	window.dispatchEvent(new CustomEvent(`menu-item-click:${itemId}`));
});

window.addEventListener("crotchet-dekstop-ready", function () {
	ipcRenderer.send("crotchet-ready");
});

ipcRenderer.on("initialize-app", function (_, props) {
	window.__crotchetAppInitialized = true;
	return window.dispatchEvent(
		new CustomEvent("initialize-app", { detail: props })
	);
});

ipcRenderer.on("socket", function (_, props) {
	window.dispatchEvent(new CustomEvent("socket", { detail: props }));
});
