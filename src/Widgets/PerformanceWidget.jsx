import Widget from "../components/Widget";
import useFetch from "../hooks/useFetch";
import ListWidget from "./ListWidget";

const PerformanceWidget = () => {
	// const { isLoading, data } = useFetch({
	// 	model: "Performance",
	// 	orderBy: "progress",
	// });

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
			{/* <p className="opacity-50 text-sm leading-relaxed py-3 px-8 text-center">
				Performance widget with live, rich data based on your activities coming soon.
			</p> */}

			<div className="pt-1 pl-3.5 pr-2">
				<ListWidget
					model="Performance"
					image="user.image"
					title="user.name"
					subtitle="user.department::billed"
					progress="progress"
					filters={[{"user.name": "!Walter Kimaro"}]}
				/>
			</div>
		</Widget>
	);
};

export default PerformanceWidget;
