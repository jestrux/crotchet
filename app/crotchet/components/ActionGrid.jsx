import clsx from "clsx";
import { useDataLoader, useActionClick } from "@/crotchet/hooks";
import { MutliGestureButton } from "@/crotchet/components";

function ActionButton({
	action,
	className,
	children,
	propagate = true,
	onClick,
	onHold,
}) {
	const { onClick: _onClick } = useActionClick(action, {
		propagate,
	});

	return (
		<MutliGestureButton
			onClick={onClick || _onClick}
			onHold={onHold}
			className={clsx("relative", className)}
		>
			{children}
		</MutliGestureButton>
	);
}

const Icon = ({ icon, fallback }) => {
	if (icon && typeof icon == "string")
		icon = <div dangerouslySetInnerHTML={{ __html: icon }}></div>;

	return icon ?? fallback;
};

export default function ActionGrid({
	title,
	type,
	data,
	fallbackIcon,
	color: _color,
	maxLines,
	colorDark: _colorDark,
	entryAction,
	entryActions,
	hideTrailing = false,
	payload,
	onClose = () => {},
}) {
	const { loading, data: actions } = useDataLoader({ handler: data });

	const handleClick = (action) => {
		const onClick =
			typeof action.onClick == "function"
				? action.onClick
				: typeof entryAction == "function"
				? () => entryAction(action)
				: null;

		if (onClick) return onClick();

		onClose(action?.handler ? null : action?.value || action);
		action?.handler?.(payload);
	};

	const typeInline = type == "inline";
	const typeGrid = type == "grid";
	const typeWrap = type == "wrap";

	const ActionItem = ({ action }) => {
		const color = action.color ?? _color;
		const colorDark = action.colorDark ?? _colorDark;
		const onHold =
			typeof action.onHold == "function"
				? action.onHold
				: typeof entryActions != "function"
				? null
				: () =>
						window.openActionSheet({
							actions: entryActions(action),
							preview: _.pick(action, [
								"icon",
								"image",
								"video",
								"title",
								"subtitle",
							]),
						});

		action.icon = action.icon || fallbackIcon;

		const colorClasses = [
			color
				? `bg-[${color}]/10 text-[${color}] border-[${color}]/5`
				: "bg-content/5 border-stroke",
			colorDark
				? `dark:bg-[${colorDark}]/10 dark:text-[${colorDark}] dark:border-[${colorDark}]/5`
				: "dark:bg-content/5 dark:text-content dark:border-content/10",
		];

		if (typeInline)
			return (
				<ActionButton
					action={action}
					onClick={() => handleClick(action)}
					onHold={onHold}
					className="w-full h-12 flex items-center gap-3 pl-4 pr-2.5"
				>
					{action.icon && (
						<div className="size-5">
							<Icon icon={action.icon} />
						</div>
					)}

					<div className="first-letter:capitalize">{action.label || action.title}</div>

					{!hideTrailing && (
						<svg
							className="ml-auto size-5 opacity-20"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m8.25 4.5 7.5 7.5-7.5 7.5"
							/>
						</svg>
					)}
				</ActionButton>
			);

		if (typeGrid)
			return (
				<ActionButton
					action={action}
					onHold={onHold}
					onClick={() => handleClick(action)}
					className="bg-card shadow border-content/10 border-x border-t dark:border-b rounded-lg py-2 px-3 flex flex-col gap-1.5 items-start"
				>
					{action.icon && (
						<div
							className="size-8 rounded-full p-1.5 bg-content/5"
							style={
								action.color
									? {
											backgroundColor: action.color,
											color: "white",
									  }
									: {}
							}
						>
							<Icon icon={action.icon} />
						</div>
					)}

					<div className="text-left text-xs line-clamp-1 font-semibold">
						{action.label || action.title}
					</div>
				</ActionButton>
			);

		if (typeWrap) {
			return (
				<ActionButton
					action={action}
					onHold={onHold}
					className="inline-flex items-center gap-1.5 bg-card dark:bg-content/5 shadow dark:border border-stroke rounded-full"
				>
					<div
						className={clsx(
							"ml-2 my-2 size-9 rounded-full flex items-center justify-center border",
							...colorClasses
						)}
					>
						<div className="size-4">
							<Icon icon={action.icon} />
						</div>
					</div>

					<div className="mr-5 text-xs/none">{action.label}</div>
				</ActionButton>
			);
		}

		return (
			<ActionButton
				key={action._id}
				action={action}
				className="flex flex-col gap-2 bg-card dark:bg-content/5 shadow dark:border border-stroke p-4 rounded-lg"
			>
				<div
					className={clsx(
						"size-9 rounded-full flex items-center justify-center border",
						...colorClasses
					)}
				>
					<div className="size-3.5">
						<Icon icon={action.icon} />
					</div>
				</div>
				<div className="w-full">
					<div className="text-left text-xs/none truncate">
						{action.label}
					</div>
				</div>
			</ActionButton>
		);
	};

	if (loading) return null;

	if (!actions?.length) return null;

	return (
		<div>
			{title && (
				<div className="px-1 mb-1">
					<h2 className="text-xl font-semibold">{title}</h2>
				</div>
			)}

			{typeWrap && maxLines ? (
				<div className="-mx-4 px-4 space-y-1.5 overflow-x-auto">
					{_.chunk(actions, Math.ceil(actions.length / maxLines)).map(
						(actions, index) => (
							<div
								key={index}
								className="flex gap-x-1.5 gap-y-2 justify-start"
							>
								{actions.map((action, index) => {
									return (
										<div
											key={action._id + index}
											className="flex-shrink-0"
										>
											<ActionItem
												key={action._id}
												action={action}
											/>
										</div>
									);
								})}
							</div>
						)
					)}
				</div>
			) : (
				<div
					className={
						typeWrap
							? "flex gap-x-1.5 gap-y-2 flex-wrap justify-start"
							: typeInline
							? "bg-card dark:bg-content/5 shadow border-t dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5"
							: "grid grid-cols-3 gap-2"
					}
				>
					{actions.map((action, index) => (
						<ActionItem
							key={action._id + " " + index}
							action={action}
						/>
					))}
				</div>
			)}
		</div>
	);
}
