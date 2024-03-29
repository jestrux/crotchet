import Widget from "../../components/Widget";
import ListWidget from "../../components/ListWidget";

const ActivitiesWidget = () => {
	return (
		<Widget
			noPadding
			title="Your activities"
			icon={
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-3.5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
					/>
				</svg>
			}
		>
			<div className="pt-1 pl-4 pr-3">
				<ListWidget
					table="tasks"
					title="title"
					subtitle="type::project_name::due|date"
					status="status"
					filters={{
						assignee_name: "authUserName",
						status: "in progress|pending|blocked",
						// due: "<today", // causes bug on Safari
					}}
				/>
			</div>
		</Widget>
	);
};

export default ActivitiesWidget;
