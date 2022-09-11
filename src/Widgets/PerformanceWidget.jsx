import Widget from "../components/Widget";

const PerformanceWidget = () => {
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
		<Widget title="Live performance" icon={icon}>
			<p className="opacity-50 text-sm leading-relaxed py-3 px-8 text-center">
				Performance widget with live, rich data based on your activities coming soon.
			</p>
		</Widget>
	);
};

export default PerformanceWidget;
