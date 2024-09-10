import lodash from "lodash";
import moment from "moment";
import * as utils from "./crotchet/utils";
import * as firebaseUtils from "./crotchet/providers/firebase";
import * as UI from "./crotchet/providers/ui";
import * as crotchetThings from "./crotchet";

Object.assign(window, {
	...utils,
	_: lodash,
	moment,
	...crotchetThings,
	...firebaseUtils,
	UI,
});

utils.dispatch("crotchet-ready");

const installExtensions = (extensions) => {
	if (!extensions?.length) return;

	window.extensionsSet = true;

	extensions
		.filter(
			(extension) =>
				extension?.name?.length && extension?.contents?.length
		)
		.forEach(({ name, contents }) => {
			const existingScript = document.querySelector(
				`[data-crotchet-extension="${name}"]`
			);

			if (existingScript) existingScript.remove();

			const asset = document.createElement("script");
			asset.innerHTML = `
				(() => { ${contents.replace(
					'import "../@types/index";',
					'//import "../@types/index";'
				)} })();
			`;

			asset.setAttribute("data-crotchet-extension", name);
			document.body.appendChild(asset);
		});

	// window.showToast("Extensions installed!!");
	utils.dispatch("extensions-updated");
	setTimeout(() => {
		utils.dispatch("app-actions-updated");
	}, 300);
};

setTimeout(() => {
	if (utils.onDesktop()) {
		document
			.querySelectorAll("[data-crotchet-extension]")
			.forEach((extension) => {
				const name = extension.getAttribute("data-crotchet-extension");
				const contents = extension.innerHTML;

				firebaseUtils.dbInsert(
					"__crotchetExtensions",
					{
						name,
						contents,
					},
					{
						rowId: name,
					}
				);
			});
	} else {
		utils.getFromCache("__crotchetExtensions").then((res) => {
			installExtensions(res);

			firebaseUtils.watchDb("__crotchetExtensions", (res) => {
				installExtensions(res);
				utils.cache("__crotchetExtensions", res);
			});
		});
	}
}, 500);
