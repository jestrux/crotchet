const { Tray, Menu, app, globalShortcut } = require("electron");
const { getWriteableFile, readFile } = require("./files");

module.exports = function Crotchet() {
	this.defaultSize = { width: 750, height: 480 };
	this.tray = null;
	this.showWindow = isDev;
	this.menuItems = {};
	this.fullScreenTimeout = { then: (resolve) => setTimeout(resolve, 40) };

	this.setMainWindow = (window) => {
		this.mainWindow = window;
		this.registerShortcuts();
	};

	this.getScripts = async () =>
		readFile({ path: appDir("scripts/index.js") });

	this.registerShortcuts = () => {
		globalShortcut.register("Alt+/", () => {
			this.toggleWindow();
		});
		globalShortcut.register("Alt+Shift+d", async () => {
			const file = await getWriteableFile(appDir("index.js"));
			const code = file.contents;
			const inDev = code.indexOf("const openDevTools = true;") != -1;
			file.save(
				inDev
					? file.contents.replace(
							"const openDevTools = true;",
							"const openDevTools = false;"
					  )
					: file.contents.replace(
							"const openDevTools = false;",
							"const openDevTools = true;"
					  )
			);
		});
	};

	this.socketEmit = (event, payload, background) =>
		this.windowEmit("socket", { event, payload }, background);

	this.windowEmit = (event, payload, background) =>
		this.mainWindow.webContents.send(event, payload, background);

	this.toggleWindow = (show) => {
		if (show == undefined) show = !this.showWindow;

		if (show) this.mainWindow.show();
		else {
			this.mainWindow.hide();
			app.hide();
		}

		this.showWindow = show;

		return show;
	};

	this.setMenuItems = (items = [], { replace = false } = {}) => {
		const defaultItems = [
			{ label: "About", role: "about" },
			{ label: "Quit", role: "quit" },
		];

		if (items) {
			if (replace) this.menuItems = {};
			items.forEach((item) => (this.menuItems[item.label] = item));
		}

		if (this.tray) this.tray.destroy();

		this.tray = new Tray(appDir("IconTemplate.png"));

		this.tray.setContextMenu(
			Menu.buildFromTemplate([
				{
					label: "Show app",
					type: "checkbox",
					checked: this.showWindow,
					click: (event) => this.toggleWindow(event.checked),
				},
				...Object.values(this.menuItems).map((item) => {
					return {
						...item,
					};
				}),
				{ type: "separator" },
				...defaultItems,
			])
		);
	};

	this.addMenuItems = (items, { replace = false } = {}) => {
		this.setMenuItems(
			Object.entries(items).map(([key, item]) => {
				if (item.shortcut) {
					item.accelerator = item.shortcut;

					globalShortcut.register(item.shortcut, () => {
						this.windowEmit("menu-item-click", key);
					});
				}

				return {
					...item,
					click: () => this.windowEmit("menu-item-click", key),
				};
			}),
			{ replace }
		);
	};
};
