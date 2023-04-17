import Widget from "../components/Widget";
import ListWidget from "./ListWidget";

const UserPerformanceWidget = () => {
	return (
		<Widget noScroll>
			<div className="h-full flex items-center">
				<div className="w-full pt-2 pl-1">
					<ListWidget
						model="Performance"
						title="user.name"
						subtitle="user.department::billed"
						progress="progress"
						filters={{
							"user.name": "Walter Kimaro",
						}}
					/>
				</div>
			</div>
		</Widget>
	);
};

export default UserPerformanceWidget;
