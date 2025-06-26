import clsx from "clsx";
import { MutliGestureButton } from ".";

export default function PreviewCard({
	icon,
	image,
	video,
	url,
	label,
	title: _title,
	subtitle,
	color,
}) {
	const title = _title || label;
	const aspectRatio = "2/1";
	const handleClick = () => {
		if (url) window.openUrl(url);
	};

	const content = () => {
		return (
			<div
				className={clsx(
					"bg-card/90 rounded-xl overflow-hidden w-full space-y-1 bg-card border border-content/10 shadow-lg",
					icon?.length > 0 ? "items-center" : "items-start"
				)}
			>
				{icon ? (
					<div className="flex items-center justify-center">
						{icon}
					</div>
				) : (
					<div
						className="mb-1 relative flex-shrink-0 overflow-hidden w-full bg-content/10"
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
						{(image || video) && (
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
										src={image ? image : video}
										alt=""
									/>
								)}

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
				)}

				{(title || subtitle) && (
					<div className="pt-1.5 pb-2.5 px-4">
						{title?.length > 0 && (
							<h5 className="truncate text-content font-semibold first-letter:capitalize">
								{title}
							</h5>
						)}
						{subtitle?.toString().length > 0 && (
							<p className="truncate opacity-75">{subtitle}</p>
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
