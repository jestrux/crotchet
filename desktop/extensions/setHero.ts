import "../@types/index";

const querySetHero = async (endpoint, { prefixCompany = false } = {}) => {
	let baseUrl, companyId, bearerToken, url;

	try {
		baseUrl = await getToken("SETHERO-BASE-URL");
		if (!baseUrl) return null;

		companyId = await getPreference("sethero-active-company");
		if (!companyId) return null;

		bearerToken = await getToken("SETHERO-API-TOKEN");
		if (!bearerToken) return null;

		url = prefixCompany
			? `${baseUrl}/companies/${companyId}${endpoint}`
			: `${baseUrl}${endpoint}`;

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
	fetch: () => querySetHero("/projects", { prefixCompany: true }),
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
			fallbackIcon: window.UI.svg(
				"m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
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
		querySetHero("/callsheets", { prefixCompany: true }).then(
			async (res) => {
				const projectId = await getPreference("sethero-active-project");

				const cs = _.flatten(
					(res || []).map((item) => {
						return (item.callsheets || []).map((cs) => {
							return {
								...cs,
								update_date: item.last_modified,
								project_title: item.title,
							};
						});
					})
				);

				return _.filter(cs, ["project_id", projectId]);
			}
		),
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
	orderBy: "update_date,desc",
	mapEntry(item) {
		return {
			...item,
			_id: item.id,
			title: window.formatDate(item.date),
			subtitle: item.schedule_name,
		};
	},
	layoutProps: {
		layout: "grid",
		aspectRatio: "1/0.8",
		meta: {
			inset: true,
			imagePlaceholder: UI.svg(
				"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z",
				{ size: "35px", opacity: 0.7 }
			),
			fallbackIcon: window.UI.svg(
				"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
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
	entryAction: (item) => window.actions.editSetHeroCallsheet.handler(item),
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

registerAction("editSetHeroCallsheet", (callsheet) => {
	return openPage({
		title: callsheet.title,
		condensingTitle: false,
		resolve: async () => {
			const baseUrl = `/projects/${callsheet.project_id}/callsheets/${callsheet.id}`;
			let [sections, fields] = await Promise.all([
				querySetHero(`${baseUrl}/sections`),
				querySetHero(`${baseUrl}/section_fields`),
			]);

			sections = _.orderBy(
				sections,
				["order_num", "order_time"],
				["asc", "asc"]
			).map((section) => {
				const type = section.section_slug;
				try {
					if (section.settings)
						section.settings = JSON.parse(section.settings);
				} catch (error) {}

				return {
					...section,
					type,
					title: section.section_title,
					fields: fields.reduce((agg, field) => {
						if (field.cs_section_id == section.id) {
							try {
								if (field.settings)
									field.settings = JSON.parse(field.settings);
							} catch (error) {}

							agg.push(field);
						}

						return agg;
					}, []),
				};
			});

			return {
				header: _.find(sections, ["type", "header"]),
				sections: _.filter(sections, ({ type }) => type != "header"),
			};
		},
		content: ({ pageData }) => {
			if (!pageData) return;

			return [
				{
					type: "list",
					title: "Callsheet Header",
					data: [pageData.header],
					entryAction: (header) => {
						openPage({
							tabs: ["Left", "Center", "Right"],
							content: ({ pageTab }) => {
								const fields = _.filter(header?.fields, [
									"group_slug",
									pageTab,
								]);

								console.log("Edit header...", fields, pageTab);

								return [];
							},
							toolbar: ({ pageTab }) => {
								return [
									{
										icon: UI.icon("add"),
										label: "Add header section",
										flex: true,
										handler: async () => {
											console.log(
												"Add header section to: ",
												pageTab
											);

											let type = await openChoicePicker([
												{
													icon: UI.icon("image"),
													value: "image",
												},
												{
													icon: UI.svg(
														"M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5"
													),
													value: "text",
												},
											]);

											if (type == "image") {
												type = await openChoicePicker([
													{
														icon: UI.svg(
															"M4.745 3A23.933 23.933 0 0 0 3 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.78 1.5 5.817 1.5 9s-.533 6.22-1.5 9M8.25 8.885l1.444-.89a.75.75 0 0 1 1.105.402l2.402 7.206a.75.75 0 0 0 1.104.401l1.445-.889m-8.25.75.213.09a1.687 1.687 0 0 0 2.062-.617l4.45-6.676a1.688 1.688 0 0 1 2.062-.618l.213.09"
														),
														label: "Project Logo",
														value: "@projectLogo",
													},
													{
														icon: UI.svg(
															"M4.745 3A23.933 23.933 0 0 0 3 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.78 1.5 5.817 1.5 9s-.533 6.22-1.5 9M8.25 8.885l1.444-.89a.75.75 0 0 1 1.105.402l2.402 7.206a.75.75 0 0 0 1.104.401l1.445-.889m-8.25.75.213.09a1.687 1.687 0 0 0 2.062-.617l4.45-6.676a1.688 1.688 0 0 1 2.062-.618l.213.09"
														),
														label: "Company Logo",
														value: "@companyLogo",
													},
													{
														icon: UI.svg(
															"M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
														),
														label: "Upload",
														value: "upload",
													},
												]);
											}

											if (!type) return null;

											showToast(
												`Add ${type} to ${pageTab}`
											);
										},
									},
								];
							},
						});
					},
					meta: {
						fallbackIcon: UI.icon(),
					},
				},
				{
					type: "list",
					title: "Callsheet Sections",
					data: pageData.sections,
					entryAction: (entry) => {
						console.log("Section clicked: ", entry);
					},
					meta: {
						fallbackIcon: UI.icon(),
					},
				},
			];
		},
		toolbar: () => {
			return [
				{
					icon: UI.icon("add"),
					label: "Add page section",
					flex: true,
					handler: async () => {
						console.log("Add page section");
						const type = await openChoicePicker([
							{
								icon: UI.svg(
									"M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
								),
								label: "Custom Banner",
								value: "custom-note",
							},
							{
								icon: UI.icon("minus"),
								label: "Page Break",
								value: "page-break",
							},
						]);

						if (!type) return null;

						showToast(`Add ${type} page section`);
					},
				},
			];
		},
	});
});

registerDataSource("custom", "setHeroContacts", {
	listenForUpdates: "tokens-updated",
	fetch: () => querySetHero("/people", { prefixCompany: true }),
	orderBy: "first",
	mapEntry(item) {
		return {
			...item,
			_id: item.id,
			title: _.compact([item.first, item.last]).join(" "),
			subtitle: _.compact([item.email, item.phone]).join(","),
		};
	},
	layoutProps: {
		layout: "list",
		aspectRatio: "1/0.8",
		meta: {
			inset: true,
			imagePlaceholder: UI.svg(
				"M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
				{ size: "40px", opacity: 0.7 }
			),
		},
	},
	actions: () => [window.actions.addSetHeroContact],
	entryActions: (item) => {
		return [
			{
				label: "Edit Contact",
				handler: () => window.actions.editSetHeroContact.handler(item),
			},
			{
				label: "Delete Contact",
				destructive: true,
				handler: async () => {
					const confirmed = await window.confirmDangerousAction();

					if (!confirmed) return;

					window.withLoader(
						window.dataSources.setHeroContacts.deleteRow(item._id),
						"Contact deleted"
					);
				},
			},
			...(!onDesktop() ? [] : [window.actions.addSetHeroContact]),
		];
	},
	entryAction: (item) => window.actions.editSetHeroContact.handler(item),
});

registerAction("addSetHeroContact", () =>
	window.openAlertForm({
		title: "New Contact",
		fields: window.dataSources.setHeroContacts.formFields,
		action: {
			label: "Create",
			handler: (contact) =>
				window.withLoader(
					window.dataSources.setHeroContacts.insertRow(contact),
					"Contact added"
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

registerAction("setHeroLogout", {
	label: "Logout",
	handler: async () => {
		await saveToken("SETHERO-BASE-URL", null);
		await saveToken("SETHERO-API-TOKEN", null);
		await savePreference("sethero-active-project", null);
		await savePreference("sethero-active-company", null);

		await someTime(100);
		dispatch("sethero-auth-changed");
	},
});

registerPage("setHeroHome", {
	resolve: async () => {
		const tokens = await Promise.all([
			await getToken("SETHERO-BASE-URL"),
			await getToken("SETHERO-API-TOKEN"),
		]);

		return _.compact(tokens).length > 0;
	},
	listenForUpdates: "sethero-auth-changed",
	// title: ({ pageResolving, pageData }) => {
	// 	if (pageResolving || pageData) return null;
	// 	return "SetHero";
	// },
	actions: ({ pageResolving }) => {
		if (pageResolving) return null;
		return [window.actions.setHeroLogout];
	},
	content: ({ pageResolving, pageData }) => {
		if (pageResolving || pageData) return null;

		return {
			type: "list",
			title: "Set Hero",
			data: [
				{
					label: "Login to Get Started",
					onClick: () => {
						window.openAlertForm({
							title: "SetHero Login",
							fields: {
								baseUrl: "text",
								authToken: "text",
							},
							action: {
								handler: async (res) => {
									if (!res) return null;

									let { baseUrl, authToken } = res;

									baseUrl =
										baseUrl.at(-1) == "/"
											? baseUrl.slice(0, -1)
											: baseUrl;

									try {
										const url = `${baseUrl}/companies`;
										const companies = await networkRequest(
											url,
											{
												bearerToken: authToken,
											}
										);

										await saveToken(
											"SETHERO-BASE-URL",
											baseUrl
										);
										await saveToken(
											"SETHERO-API-TOKEN",
											authToken
										);

										await savePreference(
											"sethero-active-project",
											null
										);

										await savePreference(
											"sethero-active-company",
											companies[0].id
										);

										await someTime(100);
										dispatch("sethero-auth-changed");

										return true;
									} catch (error) {
										window.showToast("Invalid credentials");
										return null;
									}
								},
							},
						});
					},
				},
			],
		};
	},
	nav: ({ pageResolving, pageData }) => {
		if (pageResolving || !pageData) return null;

		return [
			{
				icon: window.UI.svg(
					"m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
				),
				label: "Home",
				page: {
					resolve: async () =>
						await querySetHero("/projects", {
							prefixCompany: true,
						}).then(async (projects) => {
							let projectId = await getPreference(
								"sethero-active-project"
							);

							if (!projectId) {
								projectId = projects[0].id;
								savePreference(
									"sethero-active-project",
									projectId
								);
							}

							const activeProject = _.find(projects, [
								"id",
								projectId,
							]);

							return activeProject;
						}),
					listenForUpdates: "active-project-changed",
					icon: ({ pageData }) => {
						if (!pageData) return null;

						return {
							label: pageData.title,
							image: pageData.image_url,
							handler: () =>
								window
									.openChoicePicker({
										title: "Switch Project",
										choices: async () => {
											const res =
												await window.dataSources.setHeroProjects.get();

											return res.map((item) => {
												const selected =
													item.id == pageData.id;
												return {
													label: item.title,
													value: item.id,
													selected,
												};
											});
										},
									})
									.then(async (value) => {
										if (!value) return;
										await savePreference(
											"sethero-active-project",
											value
										);
										dispatch("active-project-changed");
									}),
						};
					},
					title: ({ pageData }) => {
						if (!pageData?.title) return null;

						return pageData.title;
					},
					actions: ({ pageResolving }) => {
						if (pageResolving) return null;
						return [
							{
								label: "Change Company",
								handler: () => {
									window.showToast("Change company");
								},
							},
							window.actions.setHeroLogout,
						];
					},
					content: () => [
						{
							title: "Project",
							type: "actions",
							data: [
								{
									icon: window.UI.svg(
										"M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z"
									),
									label: "Departments",
								},
								{
									icon: window.UI.svg(
										"M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
									),
									label: "Settings",
								},
								{
									icon: window.UI.svg(
										"M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
									),
									label: "Admins",
									handler: () =>
										pushPage("setHeroCallsheets"),
								},
							],
						},
						{
							title: "People",
							type: "list",
							data: [
								{
									icon: window.UI.svg(
										"M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
									),
									label: "Crew",
								},
								{
									icon: window.UI.svg(
										"M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
									),
									label: "Talent",
									handler: () =>
										pushPage("setHeroCallsheets"),
								},
								{
									icon: window.UI.svg(
										"M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
									),
									label: "Clients",
								},
							],
						},
						{
							title: "Data",
							type: "list",
							data: [
								{
									icon: window.UI.svg(
										"M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
									),
									label: "Scenes",
								},
								{
									icon: window.UI.svg(
										"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
									),
									label: "Locations",
									handler: () =>
										pushPage("setHeroCallsheets"),
								},
							],
						},
						{
							title: "Recent Callsheets",
							type: "grid",
							source: window.dataSources.setHeroCallsheets,
							meta: {
								limit: 4,
								fallbackIcon: window.UI.svg(
									"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
								),
							},
						},
					],
				},
			},
			{
				icon: window.UI.svg(
					"M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
				),
				label: "Callsheets",
				page: {
					title: "Callsheets",
					entryAction:
						window.dataSources.setHeroCallsheets.entryAction,
					entryActions:
						window.dataSources.setHeroCallsheets.entryActions,
					layoutProps:
						window.dataSources.setHeroCallsheets.layoutProps,
					resolve: () => window.dataSources.setHeroCallsheets.get(),
					filter: "grid",
					actions: ({ pageFilter, setPageFilter }) => {
						const viewIcons = {
							grid: UI.svg(
								"M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z",
								{ size: 22 }
							),

							list: UI.svg(
								"M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
								{ size: 22 }
							),

							calendar: UI.svg(
								"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z",
								{ size: 22 }
							),
						};

						return [
							{
								type: "primary",
								label: "Add",
								icon: window.UI.icon("add"),
								handler: window.actions.addSetHeroCallsheet,
							},
							{
								priority: true,
								icon: viewIcons[pageFilter ?? "grid"],
								handler: () =>
									window
										.openChoicePicker({
											// title: "Select View",
											choices: [
												{
													icon: viewIcons.grid,
													value: "grid",
												},
												{
													icon: viewIcons.list,
													value: "list",
												},
												// {
												// 	icon: viewIcons.calendar,
												// 	value: "calendar",
												// },
											],
										})
										.then((filter) =>
											setPageFilter(filter || pageFilter)
										),
							},
						];
					},
					type: ({ pageData, pageFilter }) => {
						console.log("Page filter: ", pageFilter);
						return pageFilter;
					},
				},
			},
			{
				icon: window.UI.svg(
					"M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
				),
				label: "People",
				page: {
					title: "People",
					type: "list",
					tabs: ["Talent", "Clients", "Crew"],
					resolve: ({ pageTab }) => {
						// const fields = _.filter(header?.fields, [
						// 	"group_slug",
						// 	pageTab,
						// ]);
						return window.dataSources.setHeroContacts.get();
					},
					entryAction: window.dataSources.setHeroContacts.entryAction,
					entryActions:
						window.dataSources.setHeroContacts.entryActions,
					actions: () => [
						{
							type: "primary",
							label: "Add",
							icon: window.UI.icon("add"),
							handler: window.actions.addSetHeroContact,
						},
					],
				},
			},
		];
	},
});

// setCrotchetApp({
// 	name: "SetHero",
// 	colors: {
// 		primary: "#003376",
// 		primaryDark: "#4680d5",
// 	},
// 	homePage: "setHeroHome",
// });
