import {
	getUserPreferences,
	removeToken,
	saveToken,
	someTime,
	withLoader,
} from "@/crotchet/utils";

const manageTokens = () => {
	return window.openModal({
		title: "Manage Tokens",
		listenForUpdates: "tokens-updated",
		resolve: async () => {
			await someTime(200);
			return Object.entries((await getUserPreferences()) || {}).reduce(
				(agg, [label, value]) => {
					if (label.startsWith("token-")) {
						agg[label.replace("token-", "")] = {
							label: label.replace("token-", ""),
							value: value?.value,
						};
					}

					return agg;
				},
				{}
			);
		},
		noPadding: true,
		actions: ({ pageData }) => [
			{
				icon: window.UI.svg(
					"M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25",
					{ size: "20" }
				),
				label: "Load Tokens",
				handler: async () => {
					try {
						const res = await window.readClipboard();
						const tokens = res?.value?.split("\n");
						if (
							!res ||
							!res?.type.indexOf("text") == -1 ||
							!tokens?.length
						)
							return window.showToast("Invalid token values");

						return withLoader(async () => {
							for (const token of tokens) {
								const [key, value] = token
									.split("=")
									.map(_.trim);
								await saveToken(key, value);
							}
							window.dispatch("tokens-updated");
						}, tokens.length + " tokens Loaded");
					} catch (error) {
						window.showAlert(error);
					}
				},
			},
			{
				icon: window.UI.icon("copy"),
				label: "Copy Tokens",
				handler: () =>
					window.copyToClipboard(
						_.entries(pageData).map(
							([key, { value }]) => `${key}=${value}\n`
						)
					),
			},
			{
				icon: window.UI.icon("clear"),
				label: "Clear Tokens",
				destructive: true,
				handler: () =>
					withLoader(async () => {
						for (const key of _.keys(pageData)) {
							await removeToken(key);
						}
						window.dispatch("tokens-updated");
					}, "Tokens Cleared"),
			},
		],
		action: () => ({
			icon: window.UI.icon("add", { strokeWidth: 3.5 }),
			type: "block",
			label: "New Token",
			handler: () =>
				window.openAlertForm({
					fields: {
						key: { label: "Token Name" },
						value: { label: "Token Value" },
					},
					action: {
						label: "Save Token",
						handler: (res) => {
							if (window.objectIsEmpty(res)) return null;

							return window.withLoader(
								saveToken(res.key, res.value).then(() =>
									window.dispatch("tokens-updated")
								),
								"Token Saved"
							);
						},
					},
				}),
		}),
		content: ({ pageData }) => ({
			type: "preferences",
			data: pageData,
			meta: {
				onChange: saveToken,
				onRemove: removeToken,
			},
		}),
	});
};

const appSettings = () => {
	return window.openPage({
		title: "App Settings",
		resolve: async () => {
			await someTime();

			return [
				{
					title: "Manage Tokens",
					onClick: manageTokens,
				},
			];
		},
		content: ({ pageData }) => ({
			type: "list",
			data: pageData,
		}),
	});
};

export default function homePageActions() {
	return [
		{
			label: "App Settings",
			// icon: window.UI.svg(
			// 	"M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z",
			// 	{
			// 		size: 16,
			// 	}
			// ),
			handler: appSettings,
		},
	];
}
