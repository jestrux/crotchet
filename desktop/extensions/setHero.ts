import "../@types/index";

const querySetHero = async (endpoint) => {
	let baseUrl, companyId, bearerToken, url;

	try {
		baseUrl = await getToken("SETHERO-BASE-URL");
		if (!baseUrl) return null;

		companyId = await getToken("SETHERO-COMPANY-ID");
		if (!companyId) return null;

		bearerToken = await getToken("SETHERO-API-TOKEN");
		if (!bearerToken) return null;

		url = `${baseUrl}/companies/${companyId}${endpoint}`;
		return await networkRequest(url, {
			bearerToken,
		});
	} catch (error) {
		showAlert(url + "\n" + bearerToken);
	}
};

const projectColors = [
	"#3b82f6", // blue
	"#22c55e", // green
	"#f59e0b", // amber
	"#f43f5e", // pink
	"#84cc16", // lime
	"#6b21a8", // purple
	"#06b6d4", // cyan
	"#2e1065", // violet
	"#92400e", // brown
];

registerDataSource("custom", "setHeroProjects", {
	listenForUpdates: "tokens-updated",
	fetch: () => querySetHero("/projects"),
	entryAction: (item) =>
		openPage({
			title: "Edit Project",
			resolve: () => {
				console.log("Edit project: ", item);
				return item._id;
			},
			content: (payload) => {
				console.log("Project detail: ", payload);
				return [];
			},
		}),
	formFields: {
		title: "text",
		plan_type: {
			label: "Plan Type",
			type: "radio",
			choices: [
				{
					label: "Short Shoot",
					value: "short",
				},
				{
					label: "Long Shoot",
					value: "long",
				},
			],
			defaultValue: "short",
		},
		color: {
			type: "radio",
			choiceType: "color",
			choices: projectColors,
			defaultValue: projectColors[0],
		},
	},
	mapEntry(item) {
		return {
			..._.pick(item, [
				"id",
				"title",
				"company_id",
				"update_date",
				"use_24hour_time",
			]),
			_id: item.id,
			image: item.logo_url,
			subtitle: item.plan_type,
			color: item.color_primary,
		};
	},
	layoutProps: {
		layout: "grid",
		aspectRatio: "1/0.8",
		meta: {
			inset: true,
			imagePlaceholder: UI.svg(
				"m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z",
				{ size: "28px" }
			),
		},
	},
	filters: [
		{ label: "All", value: "" },
		{ label: "Short Shoot", value: "short" },
		{ label: "Long Shoot", value: "long" },
	],
	actions: () => [window.actions.addSetHeroProject],
	entryActions: (item) => {
		return [
			{
				label: "Edit Project",
				handler: () => window.actions.editSetHeroProject.handler(item),
			},
			{
				label: "Delete Project",
				destructive: true,
				handler: async () => {
					const confirmed = await window.confirmDangerousAction();

					if (!confirmed) return;

					window.withLoader(
						window.dataSources.setHeroProjects.deleteRow(item._id),
						"Project deleted"
					);
				},
			},
			...(!onDesktop() ? [] : [window.actions.addSetHeroProject]),
		];
	},
});

registerAction("addSetHeroProject", async () =>
	window.openAlertForm({
		title: "New Project",
		fields: window.dataSources.setHeroProjects.formFields,
		action: {
			label: "Create",
			handler: (project) =>
				window.withLoader(
					window.dataSources.setHeroProjects.insertRow(project),
					"Project added"
				),
		},
	})
);

registerAction("editSetHeroProject", async (project) =>
	window.openAlertForm({
		title: "Edit Project",
		data: _.omit(project, ["icon"]),
		fields: window.dataSources.setHeroProjects.formFields,
		action: {
			label: "Save",
			handler: (project) =>
				window.withLoader(
					window.dataSources.setHeroProjects.updateRow(
						project._id,
						project
					),
					"Project updated"
				),
		},
	})
);

registerDataSource("custom", "setHeroCallsheets", {
	listenForUpdates: "tokens-updated",
	fetch: () =>
		querySetHero("/callsheets").then((res) => {
			return _.flatten(
				(res || []).map((item) => {
					return (item.callsheets || []).map((cs) => {
						return {
							...cs,
							project_title: item.title,
						};
					});
				})
			);
		}),
	formFields: {
		date: "date",
		project: {
			type: "choice",
			choices: () =>
				window.dataSources.setHeroProjects.get().then((res) =>
					!res
						? null
						: res.map((p) => ({
								...p,
								label: p.title,
								value: p.title,
						  }))
				),
		},
	},
	orderBy: "date,desc",
	mapEntry(item) {
		return {
			...item,
			_id: item.id,
			title: window.formatDate(item.date),
			subtitle: [item.project_title, item.schedule_name].join(" - "),
		};
	},
	layoutProps: {
		layout: "grid",
		aspectRatio: "1/0.8",
		meta: {
			inset: true,
			imagePlaceholder: UI.svg(
				"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z",
				{ size: "40px", opacity: 0.7 }
			),
		},
	},
	actions: () => [window.actions.addSetHeroCallsheet],
	entryActions: (item) => {
		return [
			{
				label: "Edit Callsheet",
				handler: () =>
					window.actions.editSetHeroCallsheet.handler(item),
			},
			{
				label: "Delete Callsheet",
				destructive: true,
				handler: async () => {
					const confirmed = await window.confirmDangerousAction();

					if (!confirmed) return;

					window.withLoader(
						window.dataSources.setHeroCallsheets.deleteRow(
							item._id
						),
						"Callsheet deleted"
					);
				},
			},
			...(!onDesktop() ? [] : [window.actions.addSetHeroCallsheet]),
		];
	},
	entryAction: (item) =>
		openPage({
			title: "Edit Callsheet",
			resolve: () => {
				console.log("Edit Callsheet: ", item);
				return item._id;
			},
			content: (payload) => {
				console.log("Callsheet detail: ", payload);
				return [];
			},
		}),
});

registerAction("addSetHeroCallsheet", () =>
	window.openAlertForm({
		title: "New Callsheet",
		fields: window.dataSources.setHeroCallsheets.formFields,
		action: {
			label: "Create",
			handler: (callsheet) =>
				window.withLoader(
					window.dataSources.setHeroCallsheets.insertRow(callsheet),
					"Callsheet added"
				),
		},
	})
);

registerAction("editSetHeroCallsheet", (callsheet) =>
	window.openAlertForm({
		title: "Edit Callsheet",
		data: callsheet,
		fields: window.dataSources.setHeroCallsheets.formFields,
		action: {
			label: "Save",
			handler: (callsheet) =>
				window.withLoader(
					window.dataSources.setHeroCallsheets.updateRow(
						callsheet._id,
						callsheet
					),
					"Callsheet updated"
				),
		},
	})
);

registerWidget("setHeroProjects", {
	title: "SetHero Projects",
	resolve: () => dataSources.setHeroProjects.get(),
	content: UI.list,
	actions: () => [
		{
			label: "Add Project",
			icon: UI.icon("add"),
			handler: window.actions.addSetHeroProject,
		},
	],
	listenForUpdates: "firebase-table-updated:setHeroProjects",
});

registerWidget("setHeroCallsheets", {
	title: "SetHero Callsheets",
	resolve: () => dataSources.setHeroCallsheets.get(),
	content: UI.list,
	actions: () => [
		{
			label: "Add Callsheet",
			icon: UI.icon("add"),
			handler: window.actions.addSetHeroCallsheet.handler,
		},
	],
	listenForUpdates: "firebase-table-updated:setHeroCallsheet",
});

registerPage("setHeroCallsheets", {
	title: "Callsheets",
	content: () => ({
		type: "grid",
		source: window.dataSources.setHeroCallsheets,
	}),
});

registerPage("setHeroHome", {
	nav: [
		{
			icon: window.UI.svg(
				"m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
			),
			label: "Home",
			page: {
				resolve: () => {
					return {
						company: "Red Line Studios",
					};
				},
				title: ({ pageData }) => {
					if (!pageData?.company) return null;
					return pageData.company;
				},
				content: () => [
					{
						type: "actions",
						data: [
							{
								icon: window.UI.svg(
									"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
								),
								label: "Calendar",
							},
							{
								icon: window.UI.svg(
									"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
								),
								label: "Callsheets",
								handler: () => pushPage("setHeroCallsheets"),
							},
							{
								icon: window.UI.svg(
									"m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
								),
								label: "Projects",
								handler: () => openRootPage("projects"),
							},
							{
								icon: window.UI.svg(
									"M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25"
								),
								label: "Contacts",
							},
							{
								icon: window.UI.svg(
									"M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
								),
								label: "Team",
							},
						],
					},
					{
						title: "Latest Projects",
						type: "actions",
						source: window.dataSources.setHeroProjects,
						meta: {
							limit: 3,
							columns: 3,
							fallbackIcon: window.UI.svg(
								"m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
							),
						},
					},
					{
						title: "Recent Callsheets",
						type: "grid",
						source: window.dataSources.setHeroCallsheets,
						meta: {
							limit: 4,
						},
					},
				],
				action: {
					label: "Add",
					icon: window.UI.svg("M12 4.5v15m7.5-7.5h-15", {
						strokeWidth: 3.5,
					}),
					handler: () =>
						window
							.openChoicePicker({
								choices: [
									{
										label: "New Project",
										value: "addSetHeroProject",
									},
									{
										label: "New Callsheet",
										value: "addSetHeroCallsheet",
									},
								],
							})
							.then((choice) =>
								window.actions[choice]?.handler?.()
							),
				},
			},
		},
		{
			icon: window.UI.svg(
				"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
			),
			label: "Callsheets",
			page: {
				title: "Callsheets",
				content: () => [
					{
						type: "grid",
						source: window.dataSources.setHeroCallsheets,
						meta: {
							fallbackIcon: window.UI.svg(
								"m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
							),
						},
					},
				],
				action: () => ({
					label: "Callsheet",
					icon: window.UI.svg("M12 4.5v15m7.5-7.5h-15", {
						strokeWidth: 3.5,
					}),
					handler: window.actions.addSetHeroCallsheet,
				}),
			},
		},
		{
			icon: window.UI.svg(
				"M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
			),
			label: "Projects",
			page: {
				title: "Projects",
				content: () => [
					{
						type: "grid",
						source: window.dataSources.setHeroProjects,
						meta: {
							fallbackIcon: window.UI.svg(
								"m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
							),
						},
					},
				],
				action: () => ({
					label: "Project",
					icon: window.UI.svg("M12 4.5v15m7.5-7.5h-15", {
						strokeWidth: 3.5,
					}),
					handler: window.actions.addSetHeroProject,
				}),
			},
		},
		{
			icon: window.UI.svg(
				"M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
			),
			label: "People",
			page: {
				title: "People",
				content: () => [
					{
						type: "grid",
						source: window.dataSources.setHeroCallsheets,
					},
				],
				action: () => ({
					label: "Callsheet",
					icon: window.UI.svg("M12 4.5v15m7.5-7.5h-15", {
						strokeWidth: 3.5,
					}),
					handler: window.actions.addSetHeroCallsheet,
				}),
			},
		},
	],
});

setCrotchetApp({
	name: "SetHero",
	colors: {
		primary: "#003376",
		primaryDark: "#4680d5",
	},
	homePage: "setHeroHome",
});
