import Widget from "../components/Widget";

const TimerWidget = ({ widget }) => {
	const icon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.8}
			stroke="currentColor"
			className="w-3.5"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	);

	return (
		<Widget title="Timer" icon={icon}>
			<div className="px-5 pt-3"></div>
		</Widget>
	);
};

export default TimerWidget;
