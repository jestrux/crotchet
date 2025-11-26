import "../../@types/index";

const appIcon = UI.svg([
	"M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z",
	"M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z",
]);

const openQrCodePage = (text = "") =>
	openPage({
		type: "detail",
		title: text,
		externalAssets: [
			{
				url: "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
				name: "qrcode.js",
			},
		],
		content: ({ pageResolving }) => {
			if (pageResolving) return null;

			return UI.component({
				content: `
                        <div class="absolute inset-0 flex items-center justify-center"
                            x-data="{
                                init() {
                                    new QRCode(this.$refs.qrCode, {
                                        text: '${text}',
                                        width: 256,
                                        height: 256,
                                        colorDark: '#000000',
                                        colorLight: '#ffffff',
                                        correctLevel: QRCode.CorrectLevel.L,
                                    });
                                },
                            }"
                        >
                            <div x-ref="qrCode" class="p-4 rounded-lg"></div>
                        </div>
                    `,
			});
		},
		action: {
			label: "Copy Link",
			handler: () => copyToClipboard(text, "Copied to clipboard"),
		},
	});

registerAction("QrCodeGenerator", {
	icon: appIcon,
	desktopOnly: true,
	global: true,
	handler: async ({ url }) => {
		url =
			url ||
			(await openForm({
				field: {
					label: "Link",
					defaultValue: await readClipboard().then(({ value } = {}) =>
						isValidUrl(value) ? value : ""
					),
					action: {
						handler: async (url = "") => {
							if (!url?.length) throw "Link is required";

							if (!isValidUrl(url))
								throw `${url} is not a vaild link`;

							return url;
						},
					},
				},
			}));

		if (!url) return;

		return openQrCodePage(url);
	},
});

registerAction("QrCodeGeneratorShare", {
	icon: appIcon,
	context: "share",
	label: "QrCode Generator",
	match: "text",
	desktopOnly: true,
	handler: ({ text }) => openQrCodePage(text),
});
