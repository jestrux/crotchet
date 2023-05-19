import Widget from "../components/Widget";
import { useAuth } from "../providers/AuthProvider";
import ListWidget from "../components/ListWidget";

const UserPerformanceWidget = () => {
	const { user } = useAuth();

	return (
		<Widget noScroll>
			<div className="h-full flex items-center">
				<div className="w-full pt-2 pl-1">
					<ListWidget
						table="performance"
						title="user_name"
						subtitle="user_department::billed"
						progress="progress"
						filters={{
							user_name: user.name,
						}}
					/>
				</div>
			</div>
		</Widget>
	);
};

export default UserPerformanceWidget;
