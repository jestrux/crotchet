const { Notification, nativeImage } = require("electron");

module.exports = function showToast({ text, image }) {
	try {
		const icon = image ? nativeImage.createFromDataURL(image) : null;
		const n = new Notification({ body: text, icon });
		n.show();
	} catch (error) {
		console.error("Show toast error: ", error);
	}
};
