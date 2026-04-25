const fs = require("fs");
const path = require("path");

const contentScripts = [];

const registerContentScript = ({ match, script }) => {
	contentScripts.push({ match, script });
};

const injectContentScripts = (window, url) => {
	const matches = contentScripts.filter(({ match }) => match(url));
	matches.forEach(({ script }) => window.webContents.executeJavaScript(script));
};

// Parse the ==CrotchetScript== metadata block from a script file
const parseMetadata = (source) => {
	const blockMatch = source.match(/\/\/ ==CrotchetScript==([\s\S]*?)\/\/ ==\/CrotchetScript==/);
	if (!blockMatch) return null;
	const meta = { name: null, match: [] };
	for (const line of blockMatch[1].split("\n")) {
		const m = line.match(/\/\/ @(\w+)\s+(.+)/);
		if (!m) continue;
		const [, key, value] = m;
		if (key === "match") meta.match.push(new RegExp(value.trim()));
		else meta[key] = value.trim();
	}
	return meta;
};

// Load all scripts from content_scripts/ directory
const contentScriptsDir = path.join(__dirname, "..", "content_scripts");
if (fs.existsSync(contentScriptsDir)) {
	fs.readdirSync(contentScriptsDir)
		.filter((f) => f.endsWith(".js"))
		.forEach((filename) => {
			const filePath = path.join(contentScriptsDir, filename);
			const script = fs.readFileSync(filePath, "utf8");
			const meta = parseMetadata(script);
			if (!meta || !meta.match.length) {
				console.warn(`[contentScripts] ${filename} missing metadata block or @match, skipping`);
				return;
			}
			registerContentScript({
				name: meta.name || filename,
				match: (url) => meta.match.some((rx) => rx.test(url)),
				script,
			});
		});
}

module.exports = { contentScripts, registerContentScript, injectContentScripts };
