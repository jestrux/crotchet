/* global document */
const { ipcRenderer } = require("electron");
const getIp = require("./utils/getIp");
const { appDir, readDir } = require("./modules/files");

window.addEventListener("crotchet-ready", () => {
	readDir({ path: appDir("extensions") }).then((res) => {
		if (res) {
			res.filter(
				(res) => res?.name?.length && res?.contents?.length
			).forEach(({ name, contents }) => {
				const asset = document.createElement("script");
				asset.innerHTML = contents.replace(
					`import "../@types/index";`,
					`//import "../@types/index";`
				);
				asset.setAttribute("data-crotchet-extension", name);
				document.body.appendChild(asset);
			});
		}
	});
	// readFile({ path: appDir("extensions/index.ts") }).then((contents) => {
	// 	const asset = document.createElement("script");
	// 	asset.innerHTML = contents;
	// 	document.body.appendChild(asset);
	// });
});

window.addEventListener("open-url", (e) => {
	ipcRenderer.send("open-url", e.detail);
});

window.addEventListener("socket-emit", (e) => {
	const { event, payload } = e.detail;
	ipcRenderer.send("socket-emit", { event, payload });
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

window.addEventListener("restore", () => ipcRenderer.send("restore"));

window.addEventListener("toggle-app", (e) => {
	ipcRenderer.send("toggle-app-window", e.detail);
});

window.addEventListener("toggle-background-window", (e) => {
	ipcRenderer.send("toggle-background-window", e.detail);
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

ipcRenderer.on("socket", function (_, props) {
	window.dispatchEvent(new CustomEvent("socket", { detail: props }));
});
