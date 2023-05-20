import Widget from "../components/Widget";
import { useAppContext } from "../providers/AppProvider";
import ListWidget from "../components/ListWidget";

const PerformanceWidget = () => {
	const { user } = useAppContext();

	const icon = (
		<svg
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			className="w-3.5 h-3.5"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
			/>
		</svg>
	);

	return (
		<Widget noPadding title="Team performance" icon={icon}>
			<div className="pt-1 pl-3.5 pr-2">
				<ListWidget
					table="performance"
					image="user_image"
					title="user_name"
					subtitle="user_department::billed"
					progress="progress"
					filters={{
						user_name: "!" + user.name,
					}}
				/>
			</div>
		</Widget>
	);
};

export default PerformanceWidget;
