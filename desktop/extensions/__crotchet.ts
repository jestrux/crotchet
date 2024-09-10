import "../../@types/index";

registerAction("clipboard", {
	global: true,
	mobileOnly: true,
	handler: async () => {
		try {
			const { type, value } = await readClipboard();
			const { payload, preview } =
				processShareData(value, type, {
					fromClipboard: true,
				}) || {};

			if (!payload) return showToast("Nothing in clipboard");

			return openActionSheet({
				title: "Select an action",
				payload,
				preview,
			});
		} catch (error) {
			showToast(error);
			// console.log("Clipboard error: ", error);
		}
	},
});

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

registerAction("remote", {
	global: true,
	mobileOnly: true,
	handler: async () =>
		openActionSheet({
			title: "Remote",
			content: "Remote apps will go here...",
		}),
});

registerAction("searchHeroIcons", {
	global: true,
	shortcut: "Shift+Alt+H",
	url: `crotchet://search/heroIcons`,
	tags: ["svg", "icon", "search"],
});
