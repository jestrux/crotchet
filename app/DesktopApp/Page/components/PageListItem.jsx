const defaultPageListItemLeading = (
	<svg
		className="mt-0.5 w-4 h-4 opacity-80"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
		/>
	</svg>
);

function PageListItem({
	leading = defaultPageListItemLeading,
	trailing = "",
	children,
	label,
	value,
	className = "",
	focused,
	onClick,
}) {
	return (
		<div
			data-reach-combobox-option
			data-selected={focused || null}
			data-highlighted={focused || null}
			data-value={value}
			className={className}
			onClick={onClick}
		>
			{typeof children == "function" ? (
				children()
			) : (
				<div
					className={`${className} h-12 flex items-center gap-3 pl-4 pr-2 text-base leading-none`}
				>
					{leading != null && (
						<div className="w-5 flex-shrink-0">{leading}</div>
					)}
					<div className="flex-1 truncate">{children || label}</div>
					{
						<span
							className={`flex-shrink-0 ml-auto text-sm ${
								typeof trailing == "string" && "opacity-40"
							}`}
						>
							{trailing}
						</span>
					}
				</div>
			)}
		</div>
	);
}

PageListItem.LeadingIcon = defaultPageListItemLeading;

PageListItem.NavIcon = (
	<svg
		className="size-4"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={2}
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
		/>
	</svg>
);

export default PageListItem;
