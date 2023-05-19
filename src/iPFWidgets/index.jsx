import ListWidget from "../components/ListWidget";
import WidgetWrapper from "../components/WidgetWrapper";
import { useAuth } from "../providers/AuthProvider";

export default function IPFWidgets() {
	const { user } = useAuth();

	return (
		<div className="grid grid-cols-4 gap-8 py-4">
			<WidgetWrapper aspectRatio="auto">
				<ListWidget
					widgetProps={{ title: "Pending tasks" }}
					table="tasks"
					checkbox="done"
				/>
			</WidgetWrapper>

			<WidgetWrapper aspectRatio="auto">
				<ListWidget
					widgetProps={{ title: "Projects tasks" }}
					table="projects"
					title="name"
					subtitle="team_names"
					status="status"
					filters={{
						team_lead_name: user.name,
						status: "!complete",
					}}
				/>
			</WidgetWrapper>
		</div>
	);
}
