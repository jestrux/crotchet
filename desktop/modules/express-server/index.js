const express = require("express");
const fs = require("fs");
// const path = require("path");
// const https = require("https");
const http = require("http");
const getIp = require("../../utils/getIp");
const crawlRouter = require("./crawl");

module.exports = function expressServer() {
	const expressApp = express();
	const server = http.createServer(expressApp);
	// const server = https.createServer(
	// 	{
	// 		key: fs.readFileSync(path.resolve(__dirname, "cert/server.key")),
	// 		cert: fs.readFileSync(path.resolve(__dirname, "cert/server.cert")),
	// 		passphrase: "crotchet",
	// 	},
	// 	expressApp
	// );

	expressApp.use((req, res, next) => {
		res.set("Access-Control-Allow-Origin", "*");
		next();
	});

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

	expressApp.use("/crawl", crawlRouter);

	return server;
};
