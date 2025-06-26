import clsx from "clsx";
import { useDataLoader, useActionClick } from "@/crotchet/hooks";
import { MutliGestureButton } from "@/crotchet/components";
import { useState } from "react";
import { randomId } from "@/crotchet/utils";
import DragAndDropList from "./DragAndDropList";

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
	if (icon && typeof icon == "string") {
		icon =
			icon.indexOf("<svg") != -1 ? (
				<svg className="size-7">{icon}</svg>
			) : (
				<div dangerouslySetInnerHTML={{ __html: icon }}></div>
			);
	}

	return (
		<div className="size-4 flex items-center justify-center">
			{icon ?? fallback}
		</div>
	);
};

export default function ActionGrid({
	flat = false,
	title,
	smallTitle = false,
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
	showDefaultBackground = false,
	sortable = false,
	selectable = false,
	onChange = () => {},
	onClose = () => {},
}) {
	const [actions, setActions] = useState([]);
	const { loading } = useDataLoader({
		handler: data,
		onSuccess: (v) =>
			setActions(
				v.map((action) => {
					return {
						__gridId: randomId("gridAction"),
						...action,
					};
				})
			),
	});

	const handleReorder = (newActions) => {
		setActions(() => {
			onChange(newActions);
			return newActions;
		});
	};

	const handleClick = (action) => {
		if (selectable) {
			const isMultiSelect = selectable == "multiple";

			setActions((actions) => {
				const newActions = actions.map((a) => {
					if (a.__gridId == action.__gridId)
						a.selected = isMultiSelect ? !a.selected : true;
					else if (!isMultiSelect) a.selected = false;
					return a;
				});

				onChange(newActions);

				return newActions;
			});
			return;
		}
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
					className="w-full h-12 text-left flex items-center gap-3 pl-4 pr-2.5"
				>
					{action.icon && (
						<div
							className={clsx(
								"-ml-2 -mr-1.5 size-7 rounded-full flex items-center justify-center",
								{
									"bg-content/5": showDefaultBackground,
								}
							)}
							style={
								action.color
									? {
											background: action.color,
											color: "white",
									  }
									: {}
							}
						>
							<Icon icon={action.icon} />
						</div>
					)}

					<div className="flex flex-col flex-1">
						<div className="first-letter:capitalize text-[15px] font-medium">
							{action.label || action.title}
						</div>
						{action.subtitle && (
							<div className="first-letter:capitalize text-xs/none opacity-50 mb-1.5">
								{action.subtitle}
							</div>
						)}
					</div>

					{(!hideTrailing || selectable || action.selected) && (
						<>
							{selectable ? (
								<svg
									className={clsx("ml-auto size-4", {
										"opacity-20": !action.selected,
									})}
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path
										d={
											action.selected
												? "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
												: "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
										}
									/>
								</svg>
							) : action.trailing ? (
								<span className="opacity-50">
									{action.trailing}
								</span>
							) : (
								<svg
									className={clsx("ml-auto size-5", {
										"opacity-20": !action.selected,
									})}
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d={
											action.selected
												? "m4.5 12.75 6 6 9-13.5"
												: "m8.25 4.5 7.5 7.5-7.5 7.5"
										}
									/>
								</svg>
							)}
						</>
					)}
				</ActionButton>
			);

		if (typeGrid)
			return (
				<ActionButton
					action={action}
					onHold={onHold}
					onClick={() => handleClick(action)}
					className="bg-card border border-content/10 rounded-lg py-2 px-3 flex flex-col gap-1.5 items-start"
				>
					{action.icon && (
						<div
							className="size-8 rounded-full flex items-center justify-center bg-content/5"
							style={
								action.color
									? {
											background: action.color,
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
				<div
					className={clsx(
						"font-semibold px-1.5 mb-1 flex items-center",
						!smallTitle
							? "text-xl"
							: "uppercase tracking-wide text-xs opacity-50"
					)}
				>
					{title}
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
							? flat
								? "rounded-lg overflow-hidden divide-y divide-content/[0.03]"
								: "bg-card border border-content/2 rounded-lg overflow-hidden divide-y divide-content/5"
							: "grid grid-cols-3 gap-2"
					}
				>
					{!sortable && (
						<>
							{actions.map((action, index) => (
								<ActionItem
									key={action._id + " " + index}
									action={action}
								/>
							))}
						</>
					)}

					{sortable && (
						<DragAndDropList
							items={actions}
							getId={(item) => item.__gridId}
							onReorder={handleReorder}
							renderItem={(action) => (
								<ActionItem action={action} />
							)}
						/>
					)}
				</div>
			)}
		</div>
	);
}
