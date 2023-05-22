import { useEffect } from "react";
import ListWidget from "../components/ListWidget";
import WidgetWrapper from "../components/WidgetWrapper";
import { useDelayedAirtableFetch } from "../hooks/useAirtable";
import { useAppContext } from "../providers/AppProvider";
import useLocalStorageState from "../hooks/useLocalStorageState";

export default function IPFWidgets() {
	const { user, currentPage } = useAppContext();
	const [widgets, setWidgets] = useLocalStorageState(
		"authUserWidgets" + currentPage ?? "Home"
	);
	const { fetch } = useDelayedAirtableFetch({
		table: "widgets",
	});
	const widgetSchema = {
		type: "list",
		label: "Projects",
		table: "projects",
		title: "name",
		subtitle: "team_names",
		status: "status",
		filters: {
			team_lead_name: "authUserName",
		},
		actions: {
			"New task": {
				fields: {
					title: "text",
					assignee: "authUser",
				},
			},
		},
	};

	const fetchWidgets = async () => {
		const res = await fetch({
			filters: {
				owner_name: "authUserName|all",
				page: currentPage ?? "Home",
			},
		});
		const widgets = res
			.filter(({ properties }) => properties?.length)
			.map(({ label, properties }) => {
				return {
					label,
					...JSON.parse(properties),
				};
			});

		setWidgets(widgets);
	};

	useEffect(() => {
		document.addEventListener("widgets-updated", fetchWidgets, false);

		return () => {
			document.removeEventListener(
				"widgets-updated",
				fetchWidgets,
				false
			);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	useEffect(() => {
		// setWidgets([]);
		fetchWidgets();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	if (!widgets) return null;

	return (
		<div className="grid items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5 xl:gap-8 py-2">
			{widgets.map((widget, index) => {
				const { label, actions, ...props } = widget;
				let actionArray = Object.entries(actions || {});
				actionArray = !actionArray.length
					? null
					: actionArray.map(([label, action]) => {
							action.label = label;

							if (!action.table) action.table = props.table;
							if (!action.icon) action.icon = "add";
							if (!action.type) action.type = "form";

							return action;
					  });

				return (
					<WidgetWrapper
						key={index}
						aspectRatio={user.preferences?.simpleGrid ? 1 : "auto"}
					>
						<ListWidget
							widgetProps={{
								title: label,
								actions: actionArray,
							}}
							{...props}
						/>
					</WidgetWrapper>
				);
			})}
		</div>
	);
}
