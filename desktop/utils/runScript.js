// const electron = require("electron");
// const dialog = electron.dialog;
const child_process = require("child_process");

module.exports = function runScript(command, args, callback) {
	callback =
		typeof callback === "function"
			? callback
			: (...args) => console.log(...args);

	var child = child_process.exec(command, {
		shell: true,
		...(args?.cwd ? { cwd: args.cwd } : {}),
	});
	// var child = child_process.spawn(command, args, {
	// 	encoding: "utf8",
	// 	shell: true,
	// });

	child.on("error", (error) => {
		// dialog.showMessageBox({
		// 	title: "Title",
		// 	type: "warning",
		// 	message: "Error occured.\r\n" + error,
		// });
		callback({ error: error });
	});

	child.stdout.setEncoding("utf8");
	child.stdout.on("data", (data) => {
		//Here is the output
		data = data.toString();
		console.log(data);
	});

	child.stderr.setEncoding("utf8");
	child.stderr.on("data", (data) => {
		// Return some data to the renderer process with the mainprocess-response ID
		// mainWindow.webContents.send("mainprocess-response", data);
		callback({ data });
	});

	child.on("close", (code) => {
		switch (code) {
			case 0:
				// dialog.showMessageBox({
				// 	title: "Title",
				// 	type: "info",
				// 	message: "End process.\r\n",
				// });
				callback({ exit: 0 });
				break;
		}
	});

	if (typeof callback === "function") callback({ exit: 1 });
};
