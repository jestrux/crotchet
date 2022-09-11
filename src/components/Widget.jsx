const Widget = ({
	noPadding,
	title,
	icon,
	actions,
	actionButton,
	children,
}) => {
	return (
		<div className="h-full flex flex-col relative">
			{title?.length && (
				<div className="relative z-30 flex-shrink-0 h-10 flex items-center px-3.5 bg-content/5 text-content/50">
					<span className="uppercase tracking-wide text-[13px] font-bold">
						{title}
					</span>
				</div>
			)}

			<div
				className="flex-1 overflow-hidden"
				style={{ padding: noPadding ? 0 : "0.5rem 0.875rem" }}
			>
				{children}
			</div>

			{(icon || actions?.length) && (
				<div className="absolute right-2 top-2 z-30 flex items-center gap-2">
					<div className="flex items-center gap-2">
						{actions &&
							actions.map((action, index) => {
								return (
									<button
										title={action.label}
										key={index}
										className="curo w-6 h-6 border border-content/10 text-content rounded-full flex items-center justify-center"
										onClick={action.onClick}
									>
										{action.icon}
									</button>
								);
							})}
					</div>
					{icon && (
						<div className="w-6 h-6 bg-content/10 text-content rounded-full flex items-center justify-center">
							{icon}
						</div>
					)}
				</div>
			)}

			{actionButton && (
				// <div className={`${noPadding && "px-12"}`}>
				<div className="mb-2.5 px-2">
					<button className="text-content/70 hover:text-content text-[10px] leading-none uppercase font-semibold py-3.5 w-full text-center border border-content/5 hover:border-content/20 bg-content/5 rounded">
						{actionButton}
					</button>
				</div>
			)}
		</div>
	);
};

export default Widget;
