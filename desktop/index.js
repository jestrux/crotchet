const path = require("path");
const {
	electronAppUniversalProtocolClient,
} = require("electron-app-universal-protocol-client");
const Crotchet = require("./modules/crotchet");
const { app, BrowserWindow } = require("electron");

global.isDev = process.env.NODE_ENV == "dev";
let mainWindow = null;
const PROTOCOL = "crotchet";
const crotchetApp = new Crotchet();

global.appDir = (...subPaths) => path.join(__dirname, ...subPaths);
global.buildDir = (...subPaths) => appDir("app", ...subPaths);
global.crotchetApp = crotchetApp;

const expressServer = require("./modules/express-server");
const socketServer = require("./modules/socket-server");
const getIp = require("./utils/getIp");
const { kv } = require("./utils/backend");
const server = expressServer();

socketServer(server);

server.listen(3127, () => {
	console.log("Listen on the port 3127...");
});

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		// backgroundColor: "#FFF",
		// titleBarStyle: "hidden",
		width: 750,
		height: 480,
		show: true,
		frame: false,
		transparent: true,
		resizable: isDev,
		minimizable: false,
		webPreferences: {
			devTools: true,
			nodeIntegration: true,
			preload: appDir("preload.js"),
		},
	});

	mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
	// mainWindow.setHiddenInMissionControl(true);

	let lastIpAddress;
	const syncBaseUrl = () => {
		const ipAddress = getIp();
		if (lastIpAddress == ipAddress) return;
		lastIpAddress = ipAddress;

		const socketUrl = `http://${getIp()}:3127`;
		kv("__desktopBaseUrl", socketUrl);
		mainWindow.webContents.executeJavaScript(
			/*js*/ `
				localStorage.__onDesktop = true;
				localStorage.__floatingWindow = false;
				localStorage.__dataSocketUrl = '${socketUrl}';
				document.body.setAttribute("base-url", '${socketUrl}');
			`,
			true
		);
	};

	setInterval(syncBaseUrl, 5000);
	syncBaseUrl();

	if (isDev) {
		try {
			const openDevTools = false;
			if (openDevTools) {
				setTimeout(() => {
					mainWindow.webContents.openDevTools({ mode: "detach" });
					setTimeout(() => crotchetApp.toggleWindow(true), 500);
				});
			}
			mainWindow.webContents.executeJavaScript(
				openDevTools
					? "localStorage.openDevTools = true"
					: "localStorage.removeItem('openDevTools')",
				true
			);

			mainWindow.loadURL("http://localhost:5170/");

			require("electron-reloader")(module);
		} catch (e) {
			//
			console.log("Launch error: ", e);
		}
	} else {
		// mainWindow.loadFile(buildDir("index.html"));
		mainWindow.loadURL("http://localhost:3127/");
		app.setLoginItemSettings({
			openAtLogin: true,
			openAsHidden: false,
		});
	}

	crotchetApp.initialize(mainWindow);
};

// Usually you want to run only one instance of your app to handle all requests in one context
if (!app.requestSingleInstanceLock()) app.exit(0);

app.whenReady().then(async () => {
	app.setName("Crotchet");

	electronAppUniversalProtocolClient.on(
		"request",
		crotchetApp.handleDeepLink
	);

	await electronAppUniversalProtocolClient.initialize({
		protocol: PROTOCOL,
		mode: isDev ? "development" : "production",
	});

	crotchetApp.setMenuItems();
	createMainWindow();
});

app.on("window-all-closed", () => {});

app.dock.hide();
