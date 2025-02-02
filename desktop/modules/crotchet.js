const {
	Tray,
	Menu,
	app,
	globalShortcut,
	BrowserWindow,
	screen,
} = require("electron");
const { getWriteableFile, readFile } = require("./files");

module.exports = function Crotchet() {
	this.defaultSize = { width: 750, height: 480 };
	this.tray = null;
	this.showWindow = isDev;
	this.menuItems = {};
	this.externalWindows = {};
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

	this.socketEmit = (event, payload, windowId) =>
		this.windowEmit("socket", { event, payload }, windowId);

	this.windowEmit = (event, payload, windowId) => {
		let window = this.mainWindow;
		if (windowId) window = this.externalWindows[windowId].window;
		window.webContents?.send(event, payload);
	};

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

	this.initializeWindow = () => {
		const pendingExternalWindow = Object.values(this.externalWindows).find(
			({ pending }) => pending
		);
		if (pendingExternalWindow) {
			this.externalWindows[pendingExternalWindow._id] = {
				...pendingExternalWindow,
				pending: false,
			};

			return this.windowEmit(
				"initialize-app",
				pendingExternalWindow.payload || {},
				pendingExternalWindow._id
			);
		}

		this.windowEmit("initialize-app", {
			pageId: "root",
		});
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

	this.openExternalWindow = (payload = {}) => {
		console.log("Open external window: ", payload);

		try {
			const { width, height } = screen.getPrimaryDisplay().workAreaSize;
			const windowWidth = 400;
			const windowHeight = 300;
			// const windowWidth = 600;
			// const windowHeight = 800;
			const randomId = "window-" + Math.random().toString(36).slice(2);
			const window = new BrowserWindow({
				// backgroundColor: "#FFF",
				// titleBarStyle: "hidden",
				width: windowWidth,
				height: windowHeight,
				x: width - windowWidth - width * 0.2,
				y: height * 0.2,
				// frame: false,
				// show: false,
				// frame: false,
				// transparent: true,
				// resizable: isDev,
				// minimizable: false,
				alwaysOnTop: true,
				webPreferences: {
					devTools: true,
					nodeIntegration: true,
					preload: appDir("preload.js"),
				},
			});

			window.setVisibleOnAllWorkspaces(true, {
				visibleOnFullScreen: true,
			});
			// window.setHiddenInMissionControl(true);
			// window.webContents.openDevTools({ mode: "detach" });

			if (isDev) window.loadURL("http://localhost:5173/");
			else window.loadFile(buildDir("index.html"));

			this.externalWindows[randomId] = {
				_id: randomId,
				payload,
				pending: true,
				window,
			};
		} catch (error) {
			console.log("Open external window error: ", error);
		}
	};
};
