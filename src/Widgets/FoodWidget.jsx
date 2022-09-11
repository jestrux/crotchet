import Widget from "../components/Widget";

const FoodWidget = () => {
	const icon = (
		<svg fill="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5">
			<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
		</svg>
	);

	return (
		<Widget title="Lunch order" icon={icon}>
			<p className="opacity-50 text-sm py-2 text-center">
				You haven't placed your order for today.
			</p>
		</Widget>
	);
};

export default FoodWidget;
