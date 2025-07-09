import clsx from "clsx";
import { MutliGestureButton } from ".";

export default function PreviewCard({
	image,
	video,
	url,
	label,
	title: _title,
	subtitle,
	color,
	aspectRatio,
	loading,
}) {
	aspectRatio = aspectRatio ? aspectRatio.replace(":", "/") : "";
	const title = _title || label;
	const handleClick = () => {
		if (url) window.openUrl(url);
	};

	if (loading) {
		return (
			<div className="bg-card/90 rounded-xl overflow-hidden w-full bg-card border border-content/10 shadow-lg">
				<div className="animate-pulse">
					<div
						className="relative flex-shrink-0 overflow-hidden w-full bg-content/10 rounded-t-xl"
						style={{
							aspectRatio: "2/1.3",
						}}
					/>

					<div className="p-3 space-y-2">
						<div className="h-1.5 bg-content/10 rounded w-2/3" />
						<div className="h-1.5 bg-content/5 rounded w-1/2" />
					</div>
				</div>
			</div>
		);
	}

	const content = () => {
		return (
			<div className="bg-card/90 rounded-xl overflow-hidden w-full bg-card border border-content/10 shadow-lg">
				<div
					className="mb-1 relative flex-shrink-0 overflow-hidden w-full bg-content/10"
					style={{
						// aspectRatio,
						...(color
							? {
									backgroundColor: color,
									color: "white",
							  }
							: {}),
					}}
				>
					{(image || video) && (
						<>
							<img
								className={
									"w-full object-cover pointer-events-none bg-content/10"
								}
								style={{
									aspectRatio,
									maxHeight:
										"calc(100vh - 360px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
								}}
								src={image ? image : video}
								alt=""
							/>

							{video && (
								<div className="absolute inset-0 bg-black/50 dark:bg-black/80 text-white flex items-center justify-center">
									<div className="size-12 flex items-center justify-center rounded-full overflow-hidden bg-white text-black">
										<svg
											className="size-8 ml-0.5"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
										</svg>
									</div>
								</div>
							)}
						</>
					)}
				</div>

				{(title || subtitle) && (
					<div className="pt-1 pb-2 px-3">
						{title?.length > 0 && (
							<h5 className="text-sm text-content font-semibold first-letter:capitalize">
								{title}
							</h5>
						)}
						{subtitle?.toString().length > 0 && (
							<p className="text-sm line-clamp-1 opacity-75">
								{subtitle}
							</p>
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<MutliGestureButton
			className={clsx("w-full text-left flex items-center relative")}
			onClick={handleClick}
		>
			{content()}
		</MutliGestureButton>
	);
}
