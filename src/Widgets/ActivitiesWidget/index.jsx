import Widget from "../../components/Widget";
import ListWidget from "../ListWidget";

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
			<div className="h-full pt-1 pl-4 pr-3 overflow-y-auto">
				<ListWidget
					widget={{
						model: "Tasks",
						props: {
							title: "task",
							subtitle: "due|date::type::project",
							status: "status",
						},
					}}
					filters={[
						{ status: "in progress|pending" },
					]}
				/>
			</div>
		</Widget>
	);
};

export default ActivitiesWidget;
