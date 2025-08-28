const os = require("os");
const fs = require("fs");
const path = require("path");

function getIp() {
	const nets = os.networkInterfaces();
	const results = Object.create(null);
	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			// 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
			const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
			if (net.family === familyV4Value && !net.internal) {
				if (!results[name]) {
					results[name] = [];
				}
				results[name].push(net.address);
			}
		}
	}

	return results?.en0?.[0] ?? null;
}

const capacitorConfig = {
	appId: "tz.co.crotchet",
	appName: "Crotchet",
	webDir: "build",
	server: {
		androidScheme: "https",
	},
	electron: {
		customUrlScheme: "crotchet",
		trayIconAndMenuEnabled: true,
		splashScreenEnabled: false,
		splashScreenImageName: "splash.png",
		hideMainWindowOnLaunch: false,
		deepLinkingEnabled: true,
		deepLinkingCustomProtocol: "crotchet",
	},
};

if (process.env.NODE_ENV == "dev") {
	capacitorConfig.server.url = `http://${getIp()}:5170`;
	capacitorConfig.server.cleartext = true;
}

const baseConfigPath = path.resolve(__dirname, "mobile/capacitor.config.json");
const iosConfigPath = path.resolve(
	__dirname,
	"mobile/ios/App/App/capacitor.config.json"
);

fs.writeFileSync(baseConfigPath, JSON.stringify(capacitorConfig, null, 4));
fs.writeFileSync(iosConfigPath, JSON.stringify(capacitorConfig, null, 4));
