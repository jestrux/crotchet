import "../../@types/index";

registerAction("sendEmail", {
	global: true,
	desktopOnly: true,
	handler: async (payload) => {
		const handler = async (res) => {
			if (
				_.compact(_.values(_.pick(res, ["to", "message", "subject"])))
					.length != 3
			)
				throw "Some fields are missing";

			await fetch(
				"https://us-central1-letterplace-c103c.cloudfunctions.net/api/mailer",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						to: res.to,
						message: {
							subject: res.subject,
							text: res.message,
						},
					}),
				}
			);

			return res;
		};
		const successMessage = (res) => `Email sent to ${res.to}`;
		const errorMessage = (err) => err || "Email not sent";

		var res = await openForm({
			title: "Send Email",
			data: {
				subject: "Crotchet Mail",
				to: "wakyj07@gmail.com",
				message: "Howdy Partner!",
				...(payload || {}),
			},
			fields: {
				to: "email",
				subject: "text",
				message: "text",
			},
			// action: {
			// 	label: "Send Email",
			// 	handler: handler,
			// 	successMessage,
			// 	errorMessage,
			// },
		});

		if (!res) return;

		return withLoader(() => handler(res), {
			successMessage,
			errorMessage,
		});
	},
});

registerAction("crotchetAppData", {
	global: true,
	desktopOnly: true,
	url: `crotchet://socket/run?command=open /Users/waky/Library/Application\\ Support/Electron/Crotchet`,
});

registerAction("crotchetFirebase", {
	global: true,
	desktopOnly: true,
	url: `crotchet://socket/run?command=open https://console.firebase.google.com/u/0/project/letterplace-c103c/firestore/databases/-default-/data/~2F__db~2F__crotchetExtensions?fb_gclid=CjwKCAiA-ty8BhA_EiwAkyoa3wWtyAXXVINn-puxha8loFtxpREcnM1_rMT3j3BUjytvEQqvsvJnjxoCfGYQAvD_BwE`,
});

registerAction("webExperiments", {
	global: true,
	desktopOnly: true,
	section: "Web Experiments",
	url: `crotchet://socket/run?command=open web-experiments://`,
});

registerAction("webExperimentsCreateApp", {
	label: "Create App",
	global: true,
	desktopOnly: true,
	section: "Web Experiments",
	url: `crotchet://socket/run?command=open web-experiments://create-app`,
});

registerAction("webExperimentsConvertToPdf", {
	label: "Convert to PDF",
	global: true,
	desktopOnly: true,
	section: "Web Experiments",
	url: `crotchet://socket/run?command=open web-experiments://convert/to-pdf`,
});

registerAction("webExperimentsConvertCodeToScreenshot", {
	label: "Code to Screenshot",
	global: true,
	desktopOnly: true,
	section: "Web Experiments",
	url: `crotchet://socket/run?command=open web-experiments://convert/code-to-screenshot`,
});

registerAction("webExperimentsPromptFun", {
	label: "Prompt Fun",
	global: true,
	desktopOnly: true,
	section: "Web Experiments",
	url: `crotchet://socket/run?command=open web-experiments://ai/prompt-fun`,
});

registerAction("setHero", {
	global: true,
	desktopOnly: true,
	handler: () => {
		const date = moment().startOf("iweek").subtract(7, "days");
		const iso = (d) => d.toISOString().split("T").shift();

		return openUrl(
			`https://www.upwork.com/nx/wm/workroom/31953978/timesheet?timesheetDate=
			${iso(date)}&workdiaryDate=${iso(date.add(2, "days"))}`
		);
	},
});

registerAction("raycastTest", {
	global: true,
	desktopOnly: true,
	url: `crotchet://socket/run?command=code /Users/waky/Documents/raycast/raycast-test/`,
});

registerAction("kitTest", {
	global: true,
	desktopOnly: true,
	url: `crotchet://socket/run?command=code /Users/waky/.kenv`,
});

const getThemes = ({
	filter = "",
	savePreference = (key, value) => {},
	inlineActions = false,
} = {}) => {
	const defaultThemes = {
		"System Default": { colorScheme: "system" },
		"Default Dark": { colorScheme: "dark" },
		"Default Light": { colorScheme: "light" },
		"Make Lemonade": { colorScheme: "dark", tintColor: "#4d7c0f" },
		"Kingsley Shacklebolt": { colorScheme: "dark", tintColor: "#7e22ce" },
		"Oceanic View": { colorScheme: "dark", tintColor: "#0e7490" },
		"Orange Brat": { colorScheme: "dark", tintColor: "#c2410c" },
		"Roses are Red": { colorScheme: "dark", tintColor: "#be123c" },
	};

	const themes = Object.keys(defaultThemes).reduce((agg, name) => {
		const themeProps = defaultThemes[name];
		themeProps.name = name;
		let { colorScheme } = themeProps;
		colorScheme = colorScheme?.toLowerCase();

		const handler = async () => {
			await savePreference("crotchet-app-theme", themeProps);
			window["crotchet-app-theme"] = themeProps;
			dispatch("crotchet-app-theme-updated");
			dispatch("with-loader-status-change", {
				status: "success",
				message: `Theme set to ${name}`,
			});
		};

		const theme = {
			label: name,
			value: name,
			...(inlineActions
				? { section: "Set Theme", handler }
				: {
						action: () => ({
							label: "Select Theme",
							handler,
						}),
				  }),
		};

		// @ts-ignore
		if (!filter || filter == colorScheme) agg.push(theme);

		return agg;
	}, []);

	if (filter) console.log("App themes choices...", filter, themes);

	return themes;
};

registerAction("appTheme", {
	global: true,
	icon: UI.svg(
		"M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
	),
	actions: () =>
		getThemes({
			savePreference: savePreference,
			inlineActions: true,
		}),
	handler: async () => {
		await openPage({
			title: "Set App Theme",
			placeholder: "Type to search themes",
			type: "search",
			filter: {
				field: "type",
				defaultValue: "",
			},
			filters: [{ label: "All", value: "" }, "Dark", "Light", "System"],
			resolve: ({ filters }) => {
				const filter = filters?.type?.toLowerCase();
				return getThemes({ filter, savePreference });
			},
		});
	},
});

// registerAction("remote", {
// 	global: true,
// 	mobileOnly: true,
// 	handler: async () =>
// 		openActionSheet({
// 			title: "Remote",
// 			content: "Remote apps will go here...",
// 		}),
// });

registerAction("searchHeroIcons", {
	global: true,
	desktopOnly: true,
	shortcut: "Shift+Alt+H",
	url: `crotchet://search/heroIcons`,
	tags: ["svg", "icon", "search"],
});

registerAction("samsungRemote", {
	global: true,
	desktopOnly: true,
	handler: async () => {
		const tvIp = await openPage({
			resolve: async () => {
				const foundDevices = await scanNetwork();

				if (foundDevices.length === 0)
					return showToast("No Samsung TVs found on network");

				console.log("Devices: ", foundDevices);

				// @ts-ignore
				return foundDevices.map(({ ip }) => ({
					label: `Samsung TV (${ip})`,
					// value: ip,
					action: {
						label: "Select",
						handler: () => {
							// console.log("Selected TV: ", ip);
							// closePage(ip);
							dispatch("close-page", ip);
						},
					},
				}));
			},
		});

		if (!tvIp) return console.log("No TV IP:", tvIp);

		console.log("TV IP:", tvIp);

		// Create WebSocket connection to TV
		const ws = new WebSocket(
			`ws://${tvIp}:8001/api/v2/channels/samsung.remote.control?name=${encodeURIComponent(
				"CrotchetRemote"
			)}`
		);

		ws.onopen = () => {
			showToast("Connected to TV!");

			// Send initial handshake
			ws.send(
				JSON.stringify({
					method: "ms.channel.connect",
					params: {
						device: {
							id: "CrotchetRemote",
							name: "Crotchet Remote",
							type: "native",
						},
					},
				})
			);
		};

		ws.onerror = (error) => {
			showToast("Failed to connect to TV");
			console.error("WebSocket error:", error);
		};

		ws.onclose = () => {
			showToast("Disconnected from TV");
		};

		// Return remote control interface
		const remoteControl = {
			sendKey: (key) => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(
						JSON.stringify({
							method: "ms.remote.control",
							params: {
								Cmd: "Click",
								DataOfCmd: key,
								Option: false,
								TypeOfRemote: "SendRemoteKey",
							},
						})
					);
				} else {
					showToast("Not connected to TV");
				}
			},
			disconnect: () => {
				ws.close();
			},
		};

		console.log("Remote control: ", remoteControl);

		return remoteControl;
	},
});

registerAction("editIpfApp", {
	global: true,
	desktopOnly: true,
	handler: async () => {
		const url =
			"https://firebasestorage.googleapis.com/v0/b/letterplace-c103c.appspot.com/o/crotchet-uploads%2Ffile-ipf-os-app.json?alt=media&token=5670f9c6-417f-4c1a-a3cd-471815050659";
		return openPage({
			listenForUpdates: "ipf-app-updated",
			title: "Edit iPF App",
			resolve: async () => {
				const data = await readNetworkFile(url).then((res) =>
					JSON.parse(res)
				);

				const updateApp = () =>
					uploadStringAsFile(JSON.stringify(data), {
						type: "application/json",
						name: "ipf-os-app.json",
					}).then(() => dispatch("ipf-app-updated"));

				return [
					{
						label: "App Color",
						trailing: `
							<div class="rounded-full size-6" style="background-color: ${data.color};"></div>
						`,
						section: "App",
						action: {
							label: "Change Color",
							handler: () => {
								const newColor =
									"#" +
									Math.floor(
										Math.random() * 16777215
									).toString(16);

								data.colorDark = tinycolor(newColor)
									.clone()
									.toString();

								while (
									tinycolor.readability(
										"#1f2937",
										data.colorDark
									) < 3.5
								) {
									data.colorDark = tinycolor(data.colorDark)
										.brighten(5)
										.saturate(10)
										.toString();
								}

								data.color = tinycolor(newColor)
									.clone()
									.toString();

								while (
									tinycolor.readability(
										"#FFFFFF",
										data.color
									) < 4.5
								) {
									data.color = tinycolor(data.color)
										.darken(10)
										.toString();
								}

								console.log(
									"Select color",
									data.color,
									data.colorDark
								);

								return withLoader(() => updateApp(), {
									successMessage: "App color updated",
									errorMessage: "App color not updated",
								});
							},
						},
					},
					{
						label: "Default Page",
						trailing: `
							<div class="rounded-full size-6" style="background-color: ${data.color};"></div>
						`,
						section: "App",
						action: {
							label: "Change Default Page",
							handler: () => {
								console.log("Select default page", data);
								data.settings.mainPage = 2;
								return withLoader(() => updateApp(), {
									successMessage: "Default page updated",
									errorMessage: "Default page not updated",
								});
							},
						},
					},
					...(data.pages || []).map((page) => ({
						label: page.name,
						section: "Pages",
						action: {
							label: "Customize",
							handler: () => {
								console.log("Customize page", page);
							},
						},
					})),
				];
			},
		});
	},
});
