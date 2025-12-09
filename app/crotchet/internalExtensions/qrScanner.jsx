import { registerAction } from "@/crotchet";

export default function qrScanner() {
	const icon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
			/>
		</svg>
	);

	registerAction("qrScanner", {
		label: "Scan QR Code",
		global: true,
		mobileOnly: true,
		color: "#10B981",
		icon,
		handler: async () => {
			try {
				const result = await window.scanQRCode();
				const { payload, preview } = window.processShareData(result);

				if (!payload) return window.showToast("Nothing in QR Code");

				let data = {
					...payload,
					...preview,
				};

				if (data.url && !data.image) {
					const res = await window.crawlUrl(data.url);
					if (res.meta) {
						data.image = res.meta.image;
						data.title = res.meta.title;
						data.description = res.meta.description;
					}
				} else {
					return window.openActionSheet({
						title: "QR Code Result",
						noHeading: false,
						inset: false,
						emptyStateMessage: result,
					});

					// Open form with scanned value
					return window.openPage({
						fullScreen: true,
						title: "QR Code",
						type: "form",
						fields: {
							qrCode: {
								label: "QR Code",
								type: "contentEditable",
							},
						},
						content: ({ pageData }) =>
							window.UI.component({
								content: `
								<pre>${pageData?.description}</pre>
								<pre>Fallback: ${result.ScanResult}</pre>
							`,
							}),
						resolve: () => ({
							qrCode: result.ScanResult,
						}),
					});
				}

				// alert(JSON.stringify(data));

				return window.openPage({
					type: "preview",
					// title: "Select an action",
					// payload,
					// preview,
					resolve: () => data,
					actions: () => window.getShareActions(data),
				});
			} catch (error) {
				window.showToast(error);
				// console.log("Clipboard error: ", error);
			}
		},
	});
}
