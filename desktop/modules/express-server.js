const express = require("express");
const fs = require("fs");
const http = require("http");
const getIp = require("../utils/getIp");

module.exports = function expressServer() {
	// const key = fs.readFileSync(appDir("cert/key.pem"));
	// const cert = fs.readFileSync(appDir("cert/cert.pem"));
	// const server = https.createServer(
	// 	{
	// 		key,
	// 		cert,
	// 		passphrase: "crotchet",
	// 	},
	// 	expressApp
	// );
	const expressApp = express();
	const server = http.createServer(expressApp);

	expressApp.set("views", buildDir());

	expressApp.use(
		express.static(buildDir(), {
			setHeaders: (res, path) => {
				const pathArray = path.split(".");
				const extension = pathArray.pop();

				if (extension === "js")
					res.set("Content-Type", "text/javascript");
				else if (extension === "css")
					res.set("Content-Type", "text/css");
			},
		})
	);

	// Express setup
	expressApp.use(express.json());

	expressApp.get("/", async (_, res) => {
		res.send(getIp());
	});

	expressApp.get("/:app", async (req, res) => {
		const appJSFile = (await fs.promises.readdir(buildDir("assets"))).find(
			(file) => file.endsWith(".js") && file.startsWith("index")
		);

		res.render("index", {
			appJSFile,
			title: req.query.title,
			__crotchet: JSON.stringify({
				app: {
					scheme: req.params.app,
					props: req.query,
				},
			}),
		});
	});

	return server;
};
