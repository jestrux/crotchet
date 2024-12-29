import clsx from "clsx";
import { useLongPress } from "@/crotchet/hooks";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import openUrl from "@/crotchet/open-url";

export default function GridListItem({
	masonry,
	previewOnly,
	icon,
	image,
	video,
	url,
	title,
	subtitle,
	color,
	// aspectRatio = "16/9",
	share,
	meta = {},
	actions,
	onClick,
	onHold,
	onDoubleClick,
}) {
	const aspectRatio = "2/1.3";
	const inset = meta?.inset;
	const imagePlaceholder = meta?.imagePlaceholder;
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

	const handleClick = () => {
		if (typeof onClick == "function") onClick();
		else if (url) window.openUrl(url);
	};

	const content = () => {
		if (masonry) {
			return (
				<div className="w-full relative">
					{(image?.length || video?.length) && (
						<div
							className="relative flex-shrink-0 bg-content/10 border border-stroke rounded overflow-hidden w-full"
							style={{ aspectRatio, backgroundColor: color }}
						>
							<img
								className="w-full"
								src={image?.length ? image : video}
								alt=""
							/>

							{video?.length && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-card">
										<div className="absolute inset-0 bg-content/60"></div>
										<svg
											className="w-4 ml-0.5 relative text-canvas"
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
								</div>
							)}
						</div>
					)}
				</div>
			);
		}

		return (
			<div
				className={clsx(
					"min-h-full w-full space-y-1 sp-2 spb-1",
					icon?.length > 0 ? "items-center" : "items-start",
					{
						"bg-card border border-content/10 rounded-lg overflow-hidden":
							inset,
					}
				)}
			>
				{icon ? (
					<div className="flex items-center justify-center">
						{icon}
					</div>
				) : (
					<div
						className={clsx(
							"rounded-md mb-1 relative flex-shrink-0 overflow-hidden w-full bg-content/10",
							{ "dark:border rounded-lg": !inset }
						)}
						style={{
							aspectRatio,
							...(color
								? {
										backgroundColor: color,
										color: "white",
								  }
								: {}),
						}}
					>
						{(image || video || imagePlaceholder) && (
							<>
								{image == "placeholder" ? (
									<div className="h-full flex items-center justify-center">
										<svg
											className="size-8"
											viewBox="0 0 24 24"
											fill="none"
											strokeWidth={1.5}
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
											/>
										</svg>
									</div>
								) : image || video ? (
									<img
										className={
											"absolute size-full object-cover pointer-events-none"
										}
										src={image ? image : video}
										alt=""
									/>
								) : (
									<div className="h-full flex items-center justify-center opacity-60">
										{imagePlaceholder}
									</div>
								)}

								{video && (
									<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
										<div className="relative w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-card">
											<div className="absolute inset-0 bg-content/60"></div>
											<svg
												className="w-4 ml-0.5 relative text-canvas"
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
									</div>
								)}
							</>
						)}
					</div>
				)}

				{!previewOnly && (
					<div
						className={clsx(
							"flex-1 min-w-0 space-y-0.5",
							icon?.length && "text-center",
							inset
								? "min-h-8 flex flex-col justify-center px-1 pt-0.5 pb-2.5"
								: "spx-1.5"
						)}
					>
						{title?.length > 0 && (
							<h5 className="truncate text-content font-medium first-letter:capitalize">
								{title}
							</h5>
						)}
						{subtitle?.toString().length > 0 && (
							<p className="text-sm/none truncate opacity-75">
								{subtitle}
							</p>
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<a
			{...gestures}
			onClick={handleClick}
			onDoubleClick={onDoubleClick}
			className={clsx(
				"lg:group w-full text-left flex items-center relative",
				masonry && "py-2"
			)}
		>
			{content()}
		</a>
	);
}
