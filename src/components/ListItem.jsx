const Status = ({ status }) => {
	return (
		<div
			className={`
			${status == "complete" && "bg-green-500 text-white"}
			${status == "in progress" && "bg-yellow-500 text-black"}
			${status == "blocked" && "bg-red-500 text-white"}
			${!["in progress", "complete", "blocked"].includes(status) && "bg-content/10"}
			font-bold py-1.5 px-2 rounded-full border border-content/5 text-[8px] leading-none uppercase
		`}
		>
			{status}
		</div>
	);
};

const ListItem = ({ image, title, subtitle, status, leading, action }) => {
	return (
		<a
			{...(!action?.length ? {} : { href: action })}
			target="_blank"
			className={`group py-2 w-full text-left flex items-center relative`}
			rel="noreferrer"
		>
			{action?.length > 0 && (
				<div className="transition opacity-0 group-hover:opacity-100 absolute inset-0 -mx-5 bg-content/5"></div>
			)}

			{image?.length && (
				<img
					className={`${
						subtitle?.length && "mt-0.5s"
					} mr-2 flex-shrink-0 border rounded-full w-8 h-8 object-cover`}
					src={image}
					alt=""
				/>
			)}

			<div className="flex-1 mr-3 min-w-0">
				{title?.length > 0 && (
					<h5 className="text-sm leading-none font-medium truncate mb-1.5">
						{title}
					</h5>
				)}
				{subtitle?.length > 0 && (
					<p
						className={`${
							title?.length ? "text-xs opacity-60" : "text-sm"
						} leading-none truncate`}
					>
						{subtitle.map((s, i) => {
							return (
								<>
									<span>
										{s.charAt(0).toUpperCase()}
										{s.substring(1)}
									</span>
									{i !== subtitle.length - 1 && (
										<span className="mx-2s mr-2 leading-none">
											{i !== 0 &&
											i === subtitle.length - 2 ? (
												<span className="font-light ml-2">
													&mdash;
												</span>
											) : (
												<span>,</span>
											)}
										</span>
									)}
								</>
							);
						})}
					</p>
				)}
			</div>

			<div className="self-stretch flex-shrink-0 ml-auto flex items-center">
				{status?.length && (
					<div className="self-start">
						<Status status={status} />
					</div>
				)}

				{leading?.length && (
					<span className="text-sm opacity-60">{leading}</span>
				)}

				{action?.length > 0 &&
					(action.indexOf("whatsapp") !== -1 ? (
						<svg
							fill="currentColor"
							className="w-4 h-4 opacity-30 group-hover:opacity-60 transition"
							viewBox="0 0 24 24"
						>
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
						</svg>
					) : (
						<svg
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="2"
							stroke="currentColor"
							className="w-4 h-4 opacity-30 group-hover:opacity-60 transition"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.25 4.5l7.5 7.5-7.5 7.5"
							/>
						</svg>
					))}
			</div>
		</a>
	);
};

export default ListItem;
