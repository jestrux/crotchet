import lodash from "lodash";
import moment from "moment";
import * as utils from "./crotchet/utils";
import * as firebaseUtils from "./crotchet/providers/firebase";
import * as colorUtils from "./crotchet/providers/color";
import * as UI from "./crotchet/providers/ui";
import * as crotchet from "./crotchet";
import "./crotchet/providers/socket";
import { crawlUrl } from "./crotchet/providers/crawler";

const { __initializeCrotchet, ...crotchetThings } = crotchet;

Object.assign(window, {
	...utils,
	_: lodash,
	moment,
	...colorUtils,
	...crotchetThings,
	...firebaseUtils,
	crawlUrl,
	UI,
});

__initializeCrotchet();

if (window.onCrotchetReady) {
	window.onCrotchetReady({
		queryDb: firebaseUtils.queryDb,
		dbInsert: firebaseUtils.dbInsert,
		inDevMode: utils.devMode(),
	});
}

const installExtension = async (
	{ name, url, contents },
	{ sync = false } = {}
) => {
	const existingScript = document.querySelector(
		`[data-crotchet-extension="${name}"]`
	);

	if (existingScript) existingScript.remove();

	const asset = document.createElement("script");

	if (!contents && url) contents = await fetch(url).then((res) => res.text());

	if (contents) {
		asset.innerHTML = `
			(() => { ${contents.replace("import", "//import")} })();
		`;
	}

	if (sync) {
		console.log("Syncing local extension: ", name);
		firebaseUtils.dbInsert(
			"__crotchetDevExtensions",
			{
				name,
				url,
				contents,
				isLocal: true,
				updatedAt: new Date().toISOString(),
			},
			{
				rowId: name,
			}
		);
	}

	asset.setAttribute("data-crotchet-extension", name);
	document.body.appendChild(asset);
};

if (utils.devMode()) {
	if (import.meta.hot) {
		import.meta.hot.on("reload-extension", (data) =>
			installExtension(data, { sync: true })
		);
	}
}

const installExtensions = (extensions) => {
	if (!extensions?.length) return;

	window.extensionsSet = true;

	extensions
		.filter(
			(extension) =>
				extension?.name?.length && extension?.contents?.length
		)
		.forEach(installExtension);

	// window.showToast("Extensions installed!!");
	utils.dispatch("extensions-updated");
	setTimeout(() => {
		utils.dispatch("app-actions-updated");
	}, 300);
};

if (utils.onDesktop()) {
	utils.onDesktopInitialize().then(({ isFloatingWindow }) => {
		window.__isFloatingWindow = isFloatingWindow;
		if (isFloatingWindow) return;
	});
} else {
	setTimeout(() => {
		utils
			.withCache(
				"__crotchetExtensions",
				() => firebaseUtils.queryDb("__crotchetExtensions"),
				{
					cacheDuration: 20,
				}
			)
			.then((res) => {
				installExtensions(res);
			});
		firebaseUtils.watchDb("__crotchetExtensions", (res) => {
			installExtensions(res);
		});
		// firebaseUtils.watchDb("__crotchetDevExtensions", (res) => {
		// 	window.showActionSheetAlert("Extensions updated!");
		// 	installExtensions(res);
		// });
	}, 500);
}
