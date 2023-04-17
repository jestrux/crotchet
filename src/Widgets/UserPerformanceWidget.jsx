import Widget from "../components/Widget";
import ListWidget from "./ListWidget";

const UserPerformanceWidget = () => {
	return (
		<Widget noScroll>
			<ListWidget
				model="Performance"
				title="user.name"
				subtitle="user.department::billed"
				progress="progress"
				filters={{
					"user.name": "Walter Kimaro",
				}}
			/>
		</Widget>
	);
};

export default UserPerformanceWidget;
