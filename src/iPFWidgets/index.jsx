import ListWidget from "../components/ListWidget";
import WidgetWrapper from "../components/WidgetWrapper";
import { useAppContext } from "../providers/AppProvider";

export default function IPFWidgets() {
	const { user, showAlert } = useAppContext();

	const newTaskHandler = async () => {
		// alert("Add new task");
		const res = await showAlert({
			size: "xl",
			// dismissible: false,
			// hideCloseButton: true,
			content: <div>New task form</div>,
			callback: () => "rueful",
		});
		console.log("After confirm: ", res);
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
								label: "new task",
								onClick: newTaskHandler,
							},
						],
					}}
					table="tasks"
					checkbox="done"
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
