const {
	Tray,
	Menu,
	app,
	globalShortcut,
	BrowserWindow,
	screen,
} = require("electron");
const { getWriteableFile, readFile } = require("./files");
const { contentScripts, injectContentScripts } = require("./contentScripts");

module.exports = function Crotchet() {
	this.defaultSize = { width: 750, height: 480 };
	this.tray = null;
	this.showWindow = true;
	this.menuItems = {};
	this.floatingWindows = {};
	this.fullScreenTimeout = { then: (resolve) => setTimeout(resolve, 40) };

	this.initialize = (mainWindow) => {
		this.mainWindow = mainWindow;
		this.registerShortcuts();
	};

	this.processDeepLink = () => {
		if (this.deeplinkingUrl) {
			this.toggleWindow(true);
			this.socketEmit("open-url", this.deeplinkingUrl);
			this.deeplinkingUrl = null;
			return;
		}
	};

	this.handleDeepLink = (url) => {
		this.deeplinkingUrl = url;
		if (this.webAppInitialized) this.processDeepLink();
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
		const window = !windowId
			? this.mainWindow
			: this.floatingWindows?.[windowId]?.window;

		if (window) window.webContents?.send(event, payload);
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
		const pendingExternalWindow = Object.values(this.floatingWindows).find(
			({ pending }) => pending
		);
		if (pendingExternalWindow) {
			this.floatingWindows[pendingExternalWindow._id] = {
				...pendingExternalWindow,
				pending: false,
			};

			return this.windowEmit(
				"initialize-app",
				pendingExternalWindow.payload || {},
				pendingExternalWindow._id
			);
		}

		if (this.deeplinkingUrl) this.processDeepLink();

		this.windowEmit("initialize-app", {
			pageId: "root",
		});

		this.webAppInitialized = true;
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

	this.emitFloatingWindowAction = (windowId, action, payload = {}) => {
		this.windowEmit("socket", {
			event: "floating-window-action",
			payload: { _id: windowId, action, ...payload },
		});
	};

	this.openFloatingWindow = (payload = {}) => {
		const {
			background = "#FFFFFF",
			width: windowWidth = 400,
			height: windowHeight = 300,
		} = payload.window || {};

		try {
			const { width, height } = screen.getPrimaryDisplay().bounds;
			const x = Math.round(width - windowWidth - width * 0.02);
			const y = Math.round(height * 0.08);
			const windowId =
				payload._id || "window-" + Math.random().toString(36).slice(2);

			let window = this.floatingWindows[windowId]?.window;
			if (window?.isDestroyed()) {
				delete this.floatingWindows[windowId];
				window = null;
			}
			if (!window) {
				window = new BrowserWindow({
					backgroundColor: background,
					// titleBarStyle: "hidden",
					titleBarStyle: "hiddenInset",
					title: payload.title,
					width: windowWidth,
					height: windowHeight,
					x,
					y,
					// frame: false,
					// show: false,
					// frame: false,
					// transparent: true,
					resizable: false,
					fullscreenable: false,
					minimizable: false,
					maximizable: false,
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

				window.on("close", () => {
					this.emitFloatingWindowAction(windowId, "close");
					delete this.floatingWindows[windowId];
				});

				if (payload.url) {
					const inject = async () => {
						if (window.isDestroyed()) return;
						const currentUrl = window.webContents.getURL();
						if (!contentScripts.some(({ match }) => match(currentUrl))) return;
						const currentData = this.floatingWindows[windowId]?.payload?.data || {};
						await window.webContents.executeJavaScript(
							`window.__crotchetData = ${JSON.stringify({ ...currentData, _id: windowId })};`
						);
						injectContentScripts(window, currentUrl);
					};
					window.webContents.on("did-finish-load", inject);
				}

				if (payload.url) window.loadURL(payload.url);
				else if (isDev) window.loadURL("http://localhost:5170/");
				else window.loadFile(buildDir("index.html"));

				this.floatingWindows[windowId] = {
					_id: windowId,
					payload,
					pending: !payload.url,
					window,
				};

				// window.webContents.openDevTools({ mode: "detach" });
				// window.setHiddenInMissionControl(true);

				return;
			}

			// Re-use existing window
			if (payload.url) {
				this.floatingWindows[windowId].payload = payload;
				window.loadURL(payload.url);
			} else {
				this.emitFloatingWindowAction(windowId, "init");
			}
		} catch (error) {
			console.log("Open external window error: ", error);
		}
	};

	this.closeFloatingWindow = (windowId) => {
		const window = this.floatingWindows?.[windowId]?.window;
		if (window) window.close();
	};
};
