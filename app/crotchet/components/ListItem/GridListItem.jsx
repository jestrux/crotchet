import clsx from "clsx";
import { useState } from "react";
import { openUrl, Loader } from "@/crotchet";
import { useLongPress } from "@/hooks/useLongPress";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export default function GridListItem({
	grid,
	masonry,
	previewOnly,
	icon,
	image,
	video,
	url,
	title,
	subtitle,
	color,
	width,
	height,
	onClick,
	onHold,
	share,
	onDoubleClick,
}) {
	const gestures = useLongPress(() => {
		if (!_.isFunction(onHold) && !share) return;

		Haptics.impact({ style: ImpactStyle.Medium });

		if (_.isFunction(onHold)) return onHold();

		openUrl(share);
	});

	const [actionLoading, setActionLoading] = useState(false);
	const handleClick = async () => {
		const clickHandlerSet = typeof onClick == "function";

		setActionLoading(true);

		try {
			if (clickHandlerSet) await Promise.resolve(onClick());
			else if (url) await Promise.resolve(openUrl(url));
		} catch (error) {
			//
		}

		setActionLoading(false);
	};

	const content = () => {
		if (masonry) {
			return (
				<div className="w-full relative">
					{(image?.length || video?.length) && (
						<div
							className="relative flex-shrink-0 bg-content/10 border border-stroke rounded overflow-hidden w-full"
							style={
								width && height
									? {
											aspectRatio: `${width}/${height}`,
											backgroundColor: color,
									  }
									: { backgroundColor: color }
							}
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
					"min-h-full w-full flex flex-col gap-2",
					icon?.length > 0 ? "items-center" : "items-start"
				)}
			>
				{icon?.length ? (
					<div
						className="flex items-center justify-center"
						dangerouslySetInnerHTML={{ __html: icon }}
					/>
				) : (
					<div className="relative flex-shrink-0 bg-content/10 border border-stroke rounded overflow-hidden w-full aspect-[16/9]">
						{(image?.length || video?.length) && (
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
								) : (
									<img
										className={
											"absolute size-full object-cover pointer-events-none"
										}
										src={image?.length ? image : video}
										alt=""
									/>
								)}
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
							</>
						)}
					</div>
				)}

				{!previewOnly && (
					<div
						className={clsx(
							"flex-1 min-w-0 space-y-1",
							icon?.length && "text-center"
						)}
					>
						{title?.length > 0 && (
							<h5 className="line-clamp-1 text-content text-sm/none font-medium first-letter:capitalize">
								{title}
							</h5>
						)}
						{subtitle?.toString().length > 0 && (
							<p
								className={clsx(
									"text-xs/none line-clamp-1",
									title?.length && "mt-1.5"
								)}
							>
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
				!grid && "py-2"
			)}
		>
			{content()}

			{actionLoading && (
				<div className="absolute inset-0 p-1 backdrop-blur-sm">
					<Loader className="opacity-50" size={20} />
				</div>
			)}
		</a>
	);
}
