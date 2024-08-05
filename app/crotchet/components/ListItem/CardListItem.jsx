import { useState } from "react";
import { openUrl, Loader } from "@/crotchet";
import { useLongPress } from "@/hooks/useLongPress";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export default function CardListItem({
	icon,
	image,
	video,
	url,
	title,
	subtitle,
	trailing,
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
		return (
			<>
				<div className="flex-shrink-0 h-20 w-24 bg-content/5 rounded border border-content/[0.01] overflow-hidden relative flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-8 opacity-50"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
						/>
					</svg>

					{icon?.length ? (
						<div
							className="mr-2.5"
							dangerouslySetInnerHTML={{ __html: icon }}
						/>
					) : (
						(image?.length || video?.length) && (
							<>
								<img
									className={
										"absolute size-full object-cover"
									}
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
							</>
						)
					)}
				</div>

				<div className="flex-1 mr-3 min-w-0 space-y-2">
					{title?.length > 0 && (
						<h5 className="text-content text-sm/none font-medium line-clamp-1 first-letter:capitalize">
							{title}
						</h5>
					)}
					{subtitle?.toString().length > 0 && (
						<p className="text-xs/none line-clamp-1">{subtitle}</p>
					)}
				</div>

				<div className="self-stretch flex-shrink-0 ml-auto flex items-center gap-2">
					{trailing?.toString().length > 0 && (
						<span className="text-sm opacity-60">{trailing}</span>
					)}
				</div>
			</>
		);
	};

	return (
		<a
			{...gestures}
			onClick={handleClick}
			onDoubleClick={onDoubleClick}
			className="lg:group relative w-full text-left bg-card rounded-md p-2 lg:p-4 border border-stroke shadow-sm flex items-center gap-3 lg:gap-6 focus:outline-none"
		>
			{content()}

			{actionLoading && (
				<div className="absolute right-0 inset-y-0 p-1 backdrop-blur-sm">
					<Loader className="opacity-50" size={20} />
				</div>
			)}
		</a>
	);
}
