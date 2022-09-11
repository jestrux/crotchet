import { useState } from "react";
import Widget from "../components/Widget";
import { useIntervalWithPercent } from "../hooks/useInterval";

const toHms = (number) => {
	const sec_num = parseInt(number, 10); // don't forget the second param
	let hrs = Math.floor(sec_num / 3600);
	let mins = Math.floor((sec_num - hrs * 3600) / 60);
	let secs = sec_num - hrs * 3600 - mins * 60;

	return [
		...(hrs > 0 ? [hrs.toString().padStart(2, "0")] : []),
		mins.toString().padStart(2, "0"),
		secs.toString().padStart(2, "0"),
	].join(":");
};

const TimerWidget = ({ widget }) => {
	const [duration, setDuration] = useState(30);
	const { progress, value, runInterval, cancelInterval, reset } =
		useIntervalWithPercent(
			() => {
				reset();
			},
			{ delay: duration * 1000, autoStart: false }
		);

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

	const actions = [
		progress == 0 || progress == 100
			? {
					icon: (
						<svg
							viewBox="0 0 24 24"
							fill="currentColor"
							className="pl-0.5 w-3.5 h-3.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
							/>
						</svg>
					),
					label: "Start timer",
					onClick: runInterval,
			  }
			: {
					icon: (
						<svg
							viewBox="0 0 24 24"
							fill="currentColor"
							className="w-3.5 h-3.5"
						>
							<path
								fillRule="evenodd"
								d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
								clipRule="evenodd"
							/>
						</svg>
					),
					label: "Stop timer",
					onClick: reset,
			  },
	];

	const handleSetDuration = (dur) => {
		reset();
		setDuration(dur);
		document
			.querySelector("#timerWidgetContent")
			.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Widget noPadding title="Timer" icon={icon} actions={actions}>
			<div id="timerWidgetContent" className="h-full overflow-y-auto">
				<div
					className={`${
						progress > 0 && "pb-6 h-full"
					} pt-2 flex items-center justify-center`}
				>
					<span className="text-5xl leading-none font-black pr-0.5">
						{progress > 0
							? toHms((duration * 1000 - value) / 1000)
							: toHms(duration)}
					</span>
				</div>

				<div className="px-5 border-t border-content/20 mt-3 pt-4 grid grid-cols-2 gap-2">
					{[30, 60, 300, 600, 900, 1800].map((dur) => {
						return (
							<button
								key={dur}
								className={`
								${dur == duration ? "text-canvas bg-content" : ""}
								border border-content/20 py-1 font-bold rounded-full
								`}
								onClick={() => handleSetDuration(dur)}
							>
								{toHms(dur)}
							</button>
						);
					})}
				</div>
			</div>
		</Widget>
	);
};

export default TimerWidget;
