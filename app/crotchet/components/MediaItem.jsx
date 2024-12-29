import { Loader } from "@/crotchet/components";
import { useActionClick, useLongPress } from "@/crotchet/hooks";
import openUrl from "@/crotchet/open-url";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import clsx from "clsx";

export default function MediaItem({
	video,
	image,
	url,
	share,
	actions,
	// meta = {},
	onClick,
	onHold,
	onDoubleClick,
}) {
	const gestures = useLongPress(() => {
		if (!_.isFunction(onHold) && !share && !actions?.length) return;

		Haptics.impact({ style: ImpactStyle.Medium });

		if (_.isFunction(onHold)) return onHold();

		if (actions?.length) {
			return window.openChoicePicker({
				// title: "Switch Project",
				choices: actions,
			});
		}

		openUrl(share);
	});
	const { loading: actionLoading, onClick: handleClick } = useActionClick({
		handler: onClick,
		url,
	});

	return (
		<div
			{...gestures}
			onClick={handleClick}
			onDoubleClick={onDoubleClick}
			className="size-full relative"
		>
			<div
				className={clsx(
					" bg-content/10 border border-content/10 overflow-hidden"
				)}
			>
				<img
					className={"absolute size-full object-cover"}
					src={image?.length ? image : video}
					alt=""
				/>

				{video?.length && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
						<div className="relative size-11 flex items-center justify-center rounded-full overflow-hidden bg-white">
							<svg
								className="ml-px size-5 relative text-black"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
								/>
							</svg>
						</div>
						{/* <svg
							className="ml-px size-11 relative text-white/80"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
							/>
						</svg> */}
					</div>
				)}
			</div>

			{actionLoading && (
				<div className="absolute right-0 inset-y-0 p-1 backdrop-blur-sm">
					<Loader className="opacity-50" size={20} />
				</div>
			)}
		</div>
	);
}
