export default function registerPlatformUtils({
	showToast,
	readClipboard,
	copyToClipboard,
	getFile,
	readFile,
	writeFile,
	readNetworkFile,
	share,
} = {}) {
	Object.assign(window, {
		...(showToast ? { showToast } : {}),
		readClipboard,
		copyToClipboard,
		getFile,
		readFile,
		writeFile,
		readNetworkFile,
		share,
	});
}
