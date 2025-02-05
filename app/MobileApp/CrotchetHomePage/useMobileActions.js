import { useDataLoader } from "@/crotchet/hooks";
import { sectionedChoices } from "@/crotchet/utils";
import { useState } from "react";

export const useMobileActions = () => {
	const [searchQuery, setSearchQuery] = useState();
	const { data: actions, refetch } = useDataLoader({
		handler: window.globalActions,
		listenForUpdates: "extensions-updated",
	});

	const actionSections = sectionedChoices(
		[
			...[
				{
					label: "Add Widgets",
					handler: () => {
						window.openActionSheet({
							title: "Add Widgets",
							content: "Add Widgets details will go here...",
						});
					},
					pinned: 1,
					section: "Home Page",
				},
				{
					label: "Manage Widgets",
					handler: () => {
						window.openActionSheet({
							title: "Manage Widgets",
							content: "Manage Widgets details will go here...",
						});
					},
					pinned: 1,
					section: "Home Page",
				},
				{
					label: "Customize Navigation",
					handler: () => {
						window.openActionSheet({
							title: "Customize Navigation",
							content:
								"Customize Navigation details will go here...",
						});
					},
					pinned: 1,
					section: "Home Page",
				},
				{
					label: "Create Page",
					handler: () => {
						window.openActionSheet({
							title: "Create Page",
							content: "Create Page details will go here...",
						});
					},
					pinned: 1,
					section: "All Actions",
				},
				{
					label: "Manage Pages",
					handler: () => {
						window.openActionSheet({
							title: "Manage Pages",
							content: "Manage Pages details will go here...",
						});
					},
					pinned: 1,
					section: "All Actions",
				},
			],
			...(actions || []).reduce((agg, a) => {
				if (!a.context) {
					agg.push({
						...a,
						pinned: 0,
						section: "All Actions",
					});
				}

				return agg;
			}, []),
		],
		searchQuery
	);

	return {
		searchQuery,
		setSearchQuery,
		actions,
		actionSections,
		refetch,
	};
};
