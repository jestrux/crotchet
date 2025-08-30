export default function registerPlatformUtils({
	showToast,
	readClipboard,
	copyToClipboard,
	copyImage,
	getFile,
	readFile,
	writeFile,
	readNetworkFile,
	share,
	oauthRedirectUrl,
} = {}) {
	Object.assign(window, {
		...(showToast ? { showToast } : {}),
		readClipboard,
		copyToClipboard,
		copyImage,
		getFile,
		readFile,
		writeFile,
		readNetworkFile,
		share,
		oauthRedirectUrl,
	});
}
