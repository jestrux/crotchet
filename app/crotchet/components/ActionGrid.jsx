import clsx from "clsx";
import { useDataLoader, useActionClick } from "@/crotchet/hooks";
import { MutliGestureButton } from "@/crotchet/components";
import { useRef, useState } from "react";
import { randomId } from "@/crotchet/utils";
import DragAndDropList from "./DragAndDropList";
import { onActionClick } from "@/crotchet/hooks/useActionClick";
import { icon as UIicon } from "@/crotchet/providers/ui";

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
		<div className="size-[18px] flex items-center justify-center">
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
	showDefaultBackground,
	sortable = false,
	selectable = false,
	editable = false,
	min,
	max,
	onChange = () => {},
	onClose = () => {},
	alignment,
}) {
	const allActions = useRef([]);
	const [actions, setActions] = useState([]);
	const { loading } = useDataLoader({
		handler: data,
		onSuccess: (v) => {
			const actions = v.map((action) => {
				return {
					__gridId: randomId("gridAction"),
					...action,
				};
			});

			allActions.current = actions;

			return setActions(
				!editable ? actions : actions.filter((a) => a.selected)
			);
		},
	});

	const handleAdd = async () => {
		// Check if we're at max capacity
		if (max !== undefined && actions.length >= max) {
			return;
		}

		window.openChoicePicker({
			title: title
				? `Add${title ? ` ${title}` : ""}`
				: "Select one or more",
			noHeading: false,
			inset: false,
			selectable: "multiple",
			choices: allActions.current.filter((a) => !a.selected),
			// .map((a) => {
			// 	a.value = a.__gridId;
			// 	return a;
			// }),
			onChange: (choices) => {
				const selectedActions = _.map(
					_.filter(choices, "selected"),
					"value"
				);

				allActions.current = allActions.current.map((a) => {
					if (selectedActions.includes(a.value)) a.selected = true;
					return a;
				});

				let newActions = _.filter(allActions.current, "selected");

				// Enforce max limit
				if (max !== undefined && newActions.length > max) {
					newActions = newActions.slice(0, max);
					// Update allActions to reflect the trimmed selection
					const trimmedIds = newActions.map(a => a.__gridId);
					allActions.current = allActions.current.map((a) => {
						if (!trimmedIds.includes(a.__gridId)) a.selected = false;
						return a;
					});
				}

				setActions(() => {
					onChange(newActions);
					return newActions;
				});
			},
		});
	};

	const handleReorder = (newActions) => {
		setActions(() => {
			onChange(newActions);
			allActions.current = [
				...newActions,
				...allActions.current.filter((a) => !a.selected),
			];
			return newActions;
		});
	};

	const handleClick = (action) => {
		if (editable) {
			// Check if we're at minimum and trying to remove
			if (min !== undefined && actions.length <= min) {
				return;
			}

			allActions.current = allActions.current.map((a) => {
				if (a.__gridId == action.__gridId) a.selected = false;
				return a;
			});

			const newActions = _.filter(allActions.current, "selected");
			onChange(newActions);
			setActions(newActions);

			return;
		}

		if (selectable) {
			const isMultiSelect = selectable == "multiple";

			setActions((actions) => {
				// Count currently selected
				const currentlySelected = actions.filter(a => a.selected).length;
				const isActionSelected = action.selected;

				// Check constraints for multi-select
				if (isMultiSelect) {
					// If trying to deselect and at minimum, prevent it
					if (isActionSelected && min !== undefined && currentlySelected <= min) {
						return actions;
					}
					// If trying to select and at maximum, prevent it
					if (!isActionSelected && max !== undefined && currentlySelected >= max) {
						return actions;
					}
				}

				const newActions = actions.map((a) => {
					if (a.__gridId == action.__gridId) {
						a.selected = editable
							? false
							: isMultiSelect
							? !a.selected
							: true;
					} else if (!isMultiSelect) a.selected = false;
					return a;
				});

				onChange(newActions);

				return newActions;
			});

			return;
		}

		if (!action.handler) {
			if (typeof entryAction == "function")
				action.handler = entryAction(action);
			const onClick = onActionClick(action);

			if (onClick) {
				onClose(action?.handler ? null : action?.value ?? action);
				return onClick();
			}
		}

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
		if (typeof action.icon == "string") action.icon = UIicon(action.icon);
		action.icon = action.icon || fallbackIcon;

		// Calculate constraints dynamically based on current selection
		const currentSelectedCount = actions.filter(a => a.selected).length;
		const isCurrentlyAtMax = max !== undefined && currentSelectedCount >= max;
		const isCurrentlyAtMin = min !== undefined && currentSelectedCount <= min;

		// Determine if this item should have reduced opacity
		const isUnselectedAtMax = selectable && !action.selected && isCurrentlyAtMax;
		const itemOpacity = isUnselectedAtMax ? "opacity-40" : "";

		showDefaultBackground = showDefaultBackground ?? !typeWrap;
		const colorClasses = showDefaultBackground
			? []
			: !action.color
			? [
					"bg-content/5 border-stroke",
					"dark:bg-content/5 dark:border-content/10",
			  ]
			: [
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
					className={clsx(
						"w-full h-12 text-left flex items-center gap-3 pl-4 pr-2.5",
						action.destructive ? "text-red-500" : "",
						itemOpacity
					)}
				>
					{action.icon && (
						<div
							className={clsx(
								"-ml-2 -mr-1.5 size-7 rounded-full flex items-center justify-center",
								...colorClasses
							)}
						>
							<div
								className={clsx(
									"flex items-center justify-center",
									!showDefaultBackground
										? "size-3.5"
										: "size-[18px]"
								)}
							>
								<Icon icon={action.icon} />
							</div>
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

					{(!hideTrailing ||
						editable ||
						selectable ||
						action.selected) && (
						<>
							{editable ? (
								<svg
									className={clsx(
										"ml-auto size-[18px] text-red-500",
										{ "opacity-30": isCurrentlyAtMin }
									)}
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z" />
								</svg>
							) : selectable ? (
								<svg
									className={clsx("ml-auto size-[18px]", {
										"opacity-20": !action.selected && !isCurrentlyAtMax,
										"opacity-10": !action.selected && isCurrentlyAtMax,
										"opacity-30": action.selected && isCurrentlyAtMin,
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
					className="bg-card border border-content/10 rounded-lg py-2 px-3 flex flex-col gap-1 items-start"
				>
					{action.icon && (
						<div
							className={clsx(
								"size-8 rounded-full flex items-center justify-center",
								...colorClasses
							)}
						>
							<div
								className={clsx(
									"flex items-center justify-center",
									!showDefaultBackground
										? "size-3.5"
										: "-ml-1.5 size-[18px]"
								)}
							>
								<Icon icon={action.icon} />
							</div>
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
						<div className="size-4 flex items-center justify-center">
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

	// Calculate constraints for buttons (add/remove)
	const isAtMax = max !== undefined && actions.length >= max;

	if (!actions?.length) {
		if (editable) {
			return (
				<>
					{title && (
						<div
							className={clsx(
								"flex items-center",
								{
									"font-semibold px-1.5 mb-1":
										!editable && !smallTitle,
								},
								editable || smallTitle
									? "opacity-50 px-1"
									: "text-xl"
							)}
						>
							{title}
						</div>
					)}

					<button
						type="button"
						className={clsx(
							"w-full rounded-2xl bg-card text-content/50 border border-content/2 h-12 flex items-center justify-center gap-1",
							{ "opacity-30 cursor-not-allowed": isAtMax }
						)}
						onClick={handleAdd}
						disabled={isAtMax}
					>
						<svg
							className="size-6"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
						</svg>
						<span>Add{title ? ` ${title}` : ""}</span>
					</button>
				</>
			);
		}
		return null;
	}

	return (
		<div className="relative">
			{title && (
				<div className="flex items-center justify-between">
					<div
						className={clsx(
							"flex items-center",
							editable || smallTitle
								? "opacity-50 px-1"
								: "font-semibold px-1.5 mb-1"
						)}
					>
						{title}
					</div>

					{editable && (
						<button
							type="button"
							className={clsx(
								"sabsolute -top-6 right-0 h-6 px-1.5 flex items-center justify-center text-sm font-medium opacity-50",
								{ "opacity-20 cursor-not-allowed": isAtMax }
							)}
							onClick={handleAdd}
							disabled={isAtMax}
						>
							<svg
								className="size-5"
								fill="currentColor"
								viewBox="0 0 16 16"
							>
								<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
							</svg>
							Add
						</button>
					)}
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
					className={clsx(
						{ "flex gap-x-1.5 gap-y-2 flex-wrap": typeWrap },
						typeWrap && alignment == "center"
							? "justify-center"
							: "justify-start",
						typeInline
							? flat
								? "rounded-lg overflow-hidden divide-y divide-content/[0.03]"
								: "rounded-2xl bg-card border border-content/2 overflow-hidden divide-y divide-content/5"
							: "",
						{ "grid grid-cols-3 gap-1.5": !typeWrap && !typeInline }
					)}
				>
					{!sortable && !editable && (
						<>
							{actions.map((action, index) => (
								<ActionItem
									key={action._id + " " + index}
									action={action}
								/>
							))}
						</>
					)}

					{(sortable || editable) && (
						<DragAndDropList
							items={actions}
							getId={(item) => item.__gridId}
							onReorder={handleReorder}
							renderItem={(action) => (
								<div className="-ml-3">
									<ActionItem action={action} />
								</div>
							)}
						/>
					)}
				</div>
			)}

			{!title && editable && (
				<button
					type="button"
					className={clsx(
						"h-9 w-full px-1.5 flex items-center justify-center font-medium opacity-50",
						{ "opacity-20 cursor-not-allowed": isAtMax }
					)}
					onClick={handleAdd}
					disabled={isAtMax}
				>
					<svg
						className="size-6"
						fill="currentColor"
						viewBox="0 0 16 16"
					>
						<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
					</svg>
					Add
				</button>
			)}
		</div>
	);
}
