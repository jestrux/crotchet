const fs = require("fs");
const { app, shell, dialog } = require("electron");
const path = require("path");
const appDir = (...subPaths) => path.join(__dirname, "../", ...subPaths);
const buildDir = (...subPaths) => appDir("app", ...subPaths);

const readDir = ({ path: _path, name }) =>
	new Promise((res, rej) => {
		const actualPath = _path ? _path : appDir(`/Crotchet/${name}`);

		fs.readdir(actualPath, (err, files) => {
			if (err) return rej(err);

			Promise.all(
				files.map((file) =>
					readFile({ path: path.resolve(actualPath, file) }).then(
						(contents) => ({
							name: file.split(".").at(0),
							contents,
						})
					)
				)
			).then(res);
		});
	});

const readFile = ({ path, folder, name }) =>
	new Promise((res) => {
		const actualPath = path
			? path
			: folder
			? `${app.getPath(folder)}/${name}`
			: `${app.getPath("userData")}/Crotchet/${name}`;

		fs.readFile(actualPath, "utf8", (err, data) => res(err ? null : data));
	});

const getFile = ({ read, properties = [] }) =>
	new Promise((res) =>
		dialog
			.showOpenDialog({ properties: ["openFile", ...properties] })
			.then((r) => {
				if (r.canceled || !r.filePaths?.length) return res(null);

				const multiple = properties.includes("multiSelections");
				const path = multiple ? r.filePaths : r.filePaths[0];

				if (!multiple && read) {
					return readFile({ path }).then((contents) => {
						res({
							path,
							contents,
						});
					});
				}

				res(path);
			})
	);

const writeFile = ({ name, path, contents, folder, open }) => {
	const actualPath = path
		? path
		: folder
		? `${app.getPath(folder)}/${name}`
		: `${app.getPath("userData")}/Crotchet/${name}`;
	const pathArray = actualPath.split("/");
	const destinationFolder = pathArray
		.filter((_, i) => i != pathArray.length - 1)
		.join("/");

	return new Promise((res) => {
		if (!path && !folder && !fs.existsSync(destinationFolder))
			fs.mkdir(destinationFolder, { recursive: true }, () => {});

		fs.writeFile(actualPath, contents, (err) => {
			if (!err && open) shell.showItemInFolder(actualPath);
			res(!err);
		});
	});
};

const getWriteableFile = async (path) => {
	const res = path
		? await readFile({ path }).then((contents) =>
				contents ? { path, contents } : { path }
		  )
		: await getFile({ properties: ["openFile"], read: true });

	if (!res?.path) return;

	const { path: _path, contents } = res;

	return {
		path: _path,
		contents,
		save: (contents, { open = false } = {}) =>
			writeFile({ path: _path, contents, open }),
	};
};

module.exports = {
	appDir,
	buildDir,
	getFile,
	getWriteableFile,
	readDir,
	readFile,
	writeFile,
};
