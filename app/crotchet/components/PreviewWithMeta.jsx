import clsx from "clsx";

export default function PreviewWithMeta({
	video,
	image,
	title,
	subtitle,
	description,
	metadata: _metadata,
	layout,
}) {
	const metadata = () => {
		if (!_metadata) return null;

		try {
			return (
				<div className="border-t divide-y divide-content/5 text-sm">
					{Object.entries(_metadata).map(([label, value], index) => (
						<div
							key={index}
							className="flex gap-16 items-center justify-between py-2 px-4"
						>
							<span className="opacity-70 capitalize flex-shrink-0">
								{label}
							</span>
							<span className="opacity-85 flex-1 truncates line-clamp-1 text-right">
								{value}
							</span>
						</div>
					))}
				</div>
			);
		} catch (error) {
			console.log("Metadata error: ", error, _metadata);
		}

		return null;
	};

	const preview = (
		<>
			{(title || subtitle) && (
				<div className="p-4">
					{title && <h1 className="text-2xl font-medium">{title}</h1>}
					{subtitle && (
						<p className="mt-1 text-content/85">{subtitle}</p>
					)}
				</div>
			)}

			{metadata()}

			{description && (
				<p
					className={
						"border-t p-4 text-sm text-content/70 font-light leading-loose"
					}
				>
					{description}
				</p>
			)}
		</>
	);

	const portrait = layout == "portrait";

	return (
		<div
			className={clsx(
				"absolute size-full",
				portrait ? "overflow-auto" : "grid grid-cols-2"
			)}
		>
			<div
				className="relative pointer-events-none bg-content/10"
				style={
					portrait
						? {
								aspectRatio: "16/9",
						  }
						: {}
				}
			>
				<img
					className={"size-full object-cover"}
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
					</div>
				)}
			</div>
			<div className={clsx({ "h-full overflow-auto": !portrait })}>
				{preview}
			</div>
		</div>
	);
}
