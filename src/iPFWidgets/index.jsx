import ListWidget from "../components/ListWidget";
import ActionPane from "../components/ModalPanes/ActionPane";
import WidgetWrapper from "../components/WidgetWrapper";
import { useAppContext } from "../providers/AppProvider";

export default function IPFWidgets() {
	const { user, openFormDialog } = useAppContext();
	const newTaskHandler = () => {
		return openFormDialog({
			title: "Add new task",
			action: "Save task",
			successMessage: "Task saved",
			table: "tasks",
			fields: {
				title: "text",
				assignee: "authUser",
			},
		});
	};

	return (
		<div className="grid items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5 xl:gap-8 py-2">
			<WidgetWrapper aspectRatio="auto">
				<ListWidget
					widgetProps={{
						title: "Daily tasks",
						actions: [
							{
								icon: (
									<svg
										fill="none"
										className="w-3.5"
										viewBox="0 0 24 24"
										strokeWidth={2}
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 4.5v15m7.5-7.5h-15"
										/>
									</svg>
								),
								label: "New task",
								onClick: newTaskHandler,
							},
						],
					}}
					table="tasks"
					checkbox="done"
					removable
				/>
			</WidgetWrapper>

			<WidgetWrapper aspectRatio="auto">
				<ListWidget
					widgetProps={{ title: "Projects" }}
					table="projects"
					title="name"
					subtitle="team_names"
					status="status"
					filters={{
						team_lead_name: user.name,
					}}
				/>
			</WidgetWrapper>
		</div>
	);
}
