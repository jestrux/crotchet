import Widget from "../components/Widget";

const PollWidget = () => {
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
				d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
			/>
		</svg>
	);

	const actions = [
		{
			label: "Add poll",
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-3.5 h-3.5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 4.5v15m7.5-7.5h-15"
					/>
				</svg>
			),
			onClick() {
				alert("Create a poll");
			},
		},
	];

	return <Widget title="Polls" icon={icon} actions={actions} actionButton>
        <p className="opacity-50 text-sm py-2 text-center">
            No active polls found.
        </p>
    </Widget>;
};

export default PollWidget;
