const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const {  exec } = require("child_process");
const { app } = require("electron");

// Find nvm node bin dir by reading ~/.nvm/versions/node directly
function nvmNodeBin() {
	try {
		const nvmVersionsDir = path.join(require("os").homedir(), ".nvm", "versions", "node");
		const versions = fs.readdirSync(nvmVersionsDir)
			.filter((v) => v.startsWith("v"))
			.sort((a, b) => parseInt(b.slice(1)) - parseInt(a.slice(1)));
		if (versions.length) return path.join(nvmVersionsDir, versions[0], "bin");
	} catch (e) {}
	return null;
}
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

	expressApp.get("/proxy", async (req, res) => {
		const targetUrl = req.query.url;
		if (!targetUrl) return res.status(400).send("Missing url");

		try {
			const response = await fetch(targetUrl, {
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					"Accept-Language": "en-US,en;q=0.9",
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				},
			});

			let html = await response.text();
			const origin = new URL(targetUrl).origin;

			const { contentScripts } = require("../contentScripts");
			const matching = contentScripts.filter(({ match }) => match(targetUrl));

			const data = {};
			if (req.query.start != null) data.start = Number(req.query.start);
			if (req.query.end != null) data.end = Number(req.query.end);
			if (req.query._id) data._id = req.query._id;
			if (req.query.noControls) data.noControls = true;

			// <base> must be first in <head> so all subsequent relative resource URLs resolve to the target origin
			html = html.replace(/<head([^>]*)>/i, `<head$1>\n<base href="${origin}/">`);

			const scripts = [
				`<script>window.__crotchetData = ${JSON.stringify(data)};</script>`,
				...matching.map(({ script }) => `<script>\n${script}\n</script>`),
			].join("\n");

			html = html.includes("</head>")
				? html.replace("</head>", scripts + "\n</head>")
				: scripts + html;

			res.removeHeader("Content-Security-Policy");
			res.removeHeader("X-Frame-Options");
			res.removeHeader("Cross-Origin-Opener-Policy");
			res.set("Content-Type", "text/html; charset=utf-8");
			res.send(html);
		} catch (e) {
			res.status(500).send("Proxy error: " + e.message);
		}
	});

	expressApp.get("/youtube-url", (req, res) => {
		const { id } = req.query;
		if (!id) return res.status(400).json({ error: "Missing id" });

		const url = `https://www.youtube.com/watch?v=${id}`;
		const nodeBin = nvmNodeBin();
		const pathPrefix = nodeBin ? `PATH="${nodeBin}:$PATH" ` : "";
		const cmd = `${pathPrefix}python3 -m yt_dlp --js-runtimes node --cookies-from-browser chrome --get-url --format "best[ext=mp4]/best" "${url}"`;
		exec(cmd, (err, stdout) => {
			if (err) return res.status(500).json({ error: err.message });
			const videoUrl = stdout.trim().split("\n")[0];
			if (!videoUrl) return res.status(500).json({ error: "No URL extracted" });
			res.json({ url: videoUrl });
		});
	});

	expressApp.get("/tv-pages", (_, res) => {
		const dir = path.join(app.getPath("userData"), "Crotchet", "tv-data");
		try {
			const sections = fs.readdirSync(dir)
				.filter((f) => f.endsWith(".json"))
				.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
			res.json(sections);
		} catch (_) {
			res.json([]);
		}
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
