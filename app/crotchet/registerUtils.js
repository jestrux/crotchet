export default function registerPlatformUtils({
	showToast,
	readClipboard,
	copyToClipboard,
	getFile,
	readFile,
	writeFile,
	share,
} = {}) {
	Object.assign(window, {
		showToast,
		readClipboard,
		copyToClipboard,
		getFile,
		readFile,
		writeFile,
		share,
	});
}
