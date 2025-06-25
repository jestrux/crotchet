import { NavButton, MutliGestureButton, Input } from "@/crotchet/components";
import { useDataLoader, useHideFloatingUI } from "@/crotchet/hooks";
import { onActionClick } from "@/crotchet/hooks/useActionClick";
import useKeyboard from "@/crotchet/hooks/useKeyboard";
import { dispatch, getPreference, isValidAction } from "@/crotchet/utils";
import clsx from "clsx";
import {
	motion,
	useAnimate,
	useDragControls,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import FloatingRemote from "../FloatingRemote";
import { useMobileActions } from "./useMobileActions";

export const BottomNavButton = ({
	disabled,
	icon,
	action,
	label,
	activeIcon: _activeIcon,
	selected,
	onClick,
	onHold,
}) => {
	const activeIcon = _activeIcon || icon;
	const activeClass = "bg-content/5 border-content/10 text-content/70";
	const inActiveClass =
		"bg-content/5 lg:bg-transparent border-transparent text-content/70";
	const handleClick = () => {
		if (typeof onClick == "function") onClick();
	};

	return (
		<MutliGestureButton
			className={clsx(
				"flex-shrink-0 focus:outline-none rounded-full border inline-flex items-center justify-center text-center text-sm font-bold",
				selected
					? "h-[42px] px-8 gap-2"
					: "gap-1.5 h-11 w-11 lg:w-auto lg:px-3.5",
				{ "flex-1": selected && action == "Search" },
				selected ? activeClass : inActiveClass,
				disabled || selected ? "" : "pointer-events-auto"
			)}
			style={
				action == "Home"
					? {
							background:
								"linear-gradient(45deg, #d3ffff, #f2ddb0)",
							color: "#3E3215",
					  }
					: {}
			}
			onHold={onHold}
			onClick={handleClick}
		>
			<span
				className={clsx(
					selected ? "size-5" : "size-6 slg:size-5 opacity-70"
				)}
			>
				{selected ? activeIcon : icon}
			</span>

			{label && (
				<span
					className={clsx({
						"hidden lg:inline": !selected,
					})}
				>
					{label}
				</span>
			)}
		</MutliGestureButton>
	);
};

const QuickActions = ({ menuItems }) => {
	const menuItem = ({ label, color, colorDark, icon }) => {
		const colorClasses = [
			color
				? `bg-[${color}]/10 text-[${color}] border-[${color}]/5`
				: "bg-content/5 border-stroke",
			colorDark
				? `dark:bg-[${colorDark}]/10 dark:text-[${colorDark}] dark:border-[${colorDark}]/5`
				: "sdark:bg-content/5 sdark:text-content sdark:border-content/10",
		];

		return (
			<div className="relative inline-flex items-center gap-1.5 bg-card dark:bg-content/5 shadow-sm dark:border border-stroke rounded-xl">
				<div
					className={clsx(
						"relative ml-1 my-1 size-8 rounded-lg flex items-center justify-center border",
						...colorClasses
					)}
				>
					<div className="size-4">{icon}</div>
				</div>

				<div className="relative mr-3 stext-sm text-[10px] uppercase font-semibold tracking-widest opacity-75">
					{label}
				</div>
			</div>
		);
	};

	return (
		<div className="mt-4 px-3.5 pb-0.5">
			<div className="flex gap-x-2 gap-y-2.5 flex-wrap justify-start">
				{menuItems.map(menuItem)}
			</div>
		</div>
	);
};

const NavActions = ({
	actionSections,
	pinnedActions,
	searchQuery,
	onCollapse,
}) => {
	const { KeyboardPlaceholder } = useKeyboard();
	const wrapper = useRef(null);

	return (
		<div ref={wrapper} className="overflow-auto">
			<div onClick={onCollapse}>
				{!searchQuery?.length && (
					<QuickActions menuItems={pinnedActions} />
				)}

				{!actionSections?.length && searchQuery?.length > 0 && (
					<div className="flex flex-col items-center justify-center select-none py-12 truncate text-lg text-content/30 text-center font-medium">
						<svg
							className="mb-5 size-8 opacity-80"
							fill="currentColor"
							viewBox="0 0 16 16"
						>
							<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
						</svg>

						<span>No results found matching </span>
						<strong className="text-content/70">
							{searchQuery}
						</strong>
					</div>
				)}

				{actionSections.map(([section, actions], index) => {
					return (
						<div
							key={"section" + index}
							className={clsx({
								"mb-4": index != actionSections.length - 1,
							})}
						>
							{section && section != "undefined" && (
								<span className="mt-5 mb-1.5 uppercase tracking-wide text-xs font-semibold opacity-50 px-7 flex items-center">
									{section}
								</span>
							)}

							{actions.map((action) => {
								action.icon = (
									<svg
										className="size-[18px] opacity-80"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
									>
										{action.icon || (
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
											/>
										)}
									</svg>
								);

								return (
									<NavButton
										className="px-6 gap-[11px]"
										key={
											action._id ||
											action.__id + "action-" + index
										}
										action={action}
									/>
								);
							})}
						</div>
					);
				})}

				<KeyboardPlaceholder />
			</div>
		</div>
	);
};

const NavItems = ({
	expanded,
	dragging,
	bottomNavHidden,
	onExpand,
	dragControls,
}) => {
	const navItems = [
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
					/>
				</svg>
			),
			action: "Remote",
			label: "Remote",
			handler: () => dispatch("open-remote-controller"),
		},
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
					/>
				</svg>
			),
			label: "Pages",
			action: "Pages",
		},
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
					/>
				</svg>
			),
			action: "Home",
		},
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
					/>
				</svg>
			),
			label: "Search",
			action: "Search",
		},
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
					/>
				</svg>
			),
			action: "Customize",
			label: "Customize",
		},
		{
			icon: (
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
						clipRule="evenodd"
					/>
				</svg>
			),
			action: "Profile",
			label: "Profile",
		},
	];

	const { data } = useDataLoader({
		handler: async () => {
			const [floating, hidden, pinnedItems] = await Promise.all([
				(
					await getPreference("appNavBehavior", "Regular")
				)?.toLowerCase() == "floating",
				(
					await getPreference("appNavVisibility", "Visible")
				)?.toLowerCase() == "hidden",
				await getPreference("appNavItems", [
					"Remote",
					"Search",
					"Profile",
				]),
			]);

			const items = pinnedItems.map((item) => {
				return navItems.find(({ action }) => action == item);
			});

			return { items, hidden, floating };
		},
		listenForUpdates: ["app-navigation-updated"],
	});

	if (!data) return null;

	const { items, hidden, floating } = data;
	const minWidth = 260;

	const baseWrapperClassName =
		"pointer-events-none z-50 fixed inset-x-0 flex items-center justify-center";
	const baseContainerClassName = `min-w-[${minWidth}] border dark:border border-content/5 shadow-sm bg-stone-100/95 dark:bg-card/95 backdrop-blur-sm overflow-hidden`;
	const baseItemClassName =
		"flex items-center justify-between max-w-sm mx-auto";

	const dynamicWrapperClassName = floating
		? "bottom-[env(safe-area-inset-bottom)]"
		: "bottom-0 lg:bottom-8 lg:mb-[env(safe-area-inset-bottom)]";
	const dynamicContainerClassName = floating
		? "px-1.5 w-auto rounded-full"
		: "px-2 lg:px-1.5 w-full lg:w-auto lg:rounded-full";
	const dynamicItemClassName = floating
		? "h-14 px-0 pt-0 mb-0 gap-2"
		: "h-[50px] lg:h-14 px-1 md:px-3 lg:px-0 pt-4 lg:pt-0 mb-[env(safe-area-inset-bottom)] lg:mb-0 gap-4 lg:gap-2";

	const wrapperClassName = `${baseWrapperClassName} ${dynamicWrapperClassName}`;
	const containerClassName = `${baseContainerClassName} ${dynamicContainerClassName}`;
	const itemClassName = `${baseItemClassName} ${dynamicItemClassName}`;

	const hideNav = expanded || dragging || bottomNavHidden;

	return (
		<>
			<motion.div
				className="mx-auto fixed pointer-events-auto sbg-blue-500 inset-x-0 z-50"
				style={{
					height: hidden ? 56 : 64,
					width: hidden
						? minWidth - 60
						: floating
						? minWidth + 20
						: "auto",
					bottom: 0,
					marginBottom: `env(safe-area-inset-bottom)`,
				}}
				onPointerDown={(e) => {
					dragControls.start(e);
				}}
				animate={{
					opacity: hideNav ? 0 : 1,
					y: hideNav ? "10%" : 0,
				}}
				onClick={() => (hidden ? null : onExpand())}
			>
				{!hidden && (
					<MutliGestureButton
						className="size-full"
						onHold={() => {
							window.openChoicePicker({
								title: "Change page",
								emptyStateMessage:
									"You haven't created any pages",
							});
						}}
					/>
				)}
			</motion.div>

			<motion.div
				className={wrapperClassName}
				animate={{
					opacity: hideNav || hidden ? 0 : 1,
					y: hideNav || hidden ? "10%" : 0,
				}}
			>
				<div className={containerClassName}>
					<div className={itemClassName}>
						{items.map((item, index) => {
							const isMainAction = ["home", "search"].includes(
								item.action?.toLowerCase()
							);
							return (
								<BottomNavButton
									key={item.action + "" + index}
									{...item}
									disabled={expanded}
									selected={isMainAction}
									onClick={() => {
										if (isMainAction) onExpand();
										else if (isValidAction(item))
											onActionClick(item)();
										else {
											window.openActionSheet({
												title: item.action,
												content:
													item.action +
													" and its details will go here...",
											});
										}
									}}
								/>
							);
						})}
					</div>
				</div>
			</motion.div>
		</>
	);
};

export default function MobileNav() {
	useKeyboard();

	const bottomNavHidden = useHideFloatingUI();
	const [scope, animate] = useAnimate();
	const inputRef = useRef(null);
	const {
		searchQuery,
		setSearchQuery,
		actionSections,
		pinnedActions,
		refetch,
	} = useMobileActions();
	const [dragging, setDragging] = useState(false);
	const [expanded, _setExpanded] = useState(false);
	const y = useMotionValue(0);
	const controls = useDragControls();

	const ratio = useTransform(
		y,
		expanded ? [300, 0] : [-300, 0],
		expanded ? [0, 1] : [1, 0]
	);
	const borderRadius = useTransform(
		y,
		expanded ? [300, 0] : [-300, 0],
		expanded ? [0, 32] : [32, 0]
	);

	const handleExpand = async () => {
		const parent = inputRef.current
			.closest(".bottom-nav")
			.getBoundingClientRect();

		setExpanded(true);

		animate(
			scope.current,
			{
				y: [parent.height * 0.3, 0],
				dur: 0.1,
			},
			{
				type: "spring",
				bounce: 0.1,
				duration: 0.3,
				// ease: "easeInOut",
			}
		);

		focusInput();
	};

	const focusInput = (delay = 80) => {
		if (!delay) {
			inputRef.current.style.pointerEvents = "auto";
			inputRef.current.focus();
			return;
		}

		setTimeout(() => {
			inputRef.current.style.pointerEvents = "auto";
			inputRef.current.focus();
		}, delay);
	};

	const handleClear = () => {
		setSearchQuery("");

		const input = inputRef.current;

		if (input?.getAttribute("is-focused")) inputRef.current?.focus();
	};

	const handleCollapse = async (blurInput) => {
		if (blurInput == true) {
			inputRef.current.blur();
			inputRef.current.style.pointerEvents = "";
		}

		setSearchQuery("");

		const parent = inputRef.current
			.closest(".bottom-nav")
			.getBoundingClientRect();

		const res = animate(scope.current, {
			y: parent.height * 0.6,
			dur: 0.1,
		});

		setTimeout(() => {
			setExpanded(false);
			res.cancel();
			animate(
				scope.current,
				{ y: 0 },
				{
					duration: 0,
					ease: "none",
				}
			);
		}, 50);
	};

	const handleToggle = () => {
		if (expanded) handleCollapse();
		else handleExpand();
	};

	const setExpanded = (newValue) => {
		if (newValue) {
			// inputRef.current.style.pointerEvents = "auto";
			// inputRef.current.focus();
		} else inputRef.current.style.pointerEvents = "";

		_setExpanded(newValue);
	};

	useEffect(() => {
		refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [expanded]);

	return (
		<>
			<motion.div
				className={clsx(
					"fixed inset-0 bg-black/20 dark:bg-black/80 z-50",
					expanded ? "pointer-events-auto" : "pointer-events-none"
				)}
				style={{
					opacity: ratio,
				}}
				onClick={() => handleCollapse()}
			/>

			<style>
				{
					/*css*/ `
					.bottom-nav {
						--inset-bottom: calc(64px + env(safe-area-inset-bottom) * 0.6);
						bottom: calc(-100vh + var(--inset-bottom));
					}
					.bottom-nav.expanded {
						bottom: calc(-35vh + var(--inset-bottom));
					}

					@media (min-width: 1024px) {
						.bottom-nav:not(.expanded) {
							--inset-bottom: calc(100px + env(safe-area-inset-bottom) * 0.6);
						}
					}
				`
				}
			</style>

			<motion.div
				ref={scope}
				className={clsx(
					"pointer-events-none sbg-red-500 bottom-nav fixed inset-x-0 mx-auto z-50 overflow-hidden",
					{ expanded: expanded },
					dragging || expanded
						? "bg-stone-100/95 dark:bg-card/95 backdrop-blur-sm max-w-xl"
						: "max-w-96"
				)}
				style={{
					height: "100vh",
					y,
					borderTopLeftRadius: borderRadius,
					borderTopRightRadius: borderRadius,
				}}
				drag="y"
				dragControls={controls}
				// dragListener={!expanded}
				dragListener={false}
				dragElastic={{
					top: expanded ? 0 : 0.5,
					bottom: !expanded ? 0 : 0.5,
				}}
				dragConstraints={{
					top: expanded ? 0 : 1,
					bottom: expanded ? 1 : 0,
				}}
				// dragTransition={{
				// 	bounceStiffness: 20000,
				// 	bounceDamping: 20000,
				// }}
				onDrag={() => {
					var delta = ratio.get();
					// if (expanded && delta <= 0.75)
					inputRef.current.blur();
					setDragging(delta >= 0.02);
				}}
				onDragEnd={() => {
					var delta = ratio.get();

					setDragging(false);

					if (
						(expanded && delta >= 0.9) ||
						(!expanded && delta <= 0.1)
					) {
						if (expanded) focusInput(300);
						return;
					}

					handleToggle();
				}}
			>
				<motion.div
					style={{
						opacity: ratio,
						pointerEvents: !expanded ? "none" : "",
					}}
				>
					<div
						className="sticky top-0 pt-2 z-50"
						onPointerDown={(e) => {
							controls.start(e);
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mx-2 relative border dark:border border-stroke shadow-sm rounded-full">
							<svg
								className="absolute top-0 left-3 bottom-0 my-auto size-5 opacity-30"
								viewBox="0 0 24 24"
								fill="none"
								strokeWidth={2.5}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
								/>
							</svg>

							<Input
								ref={inputRef}
								className="h-12 pl-10 w-full text-lg/none font-semibold bg-card dark:bg-content/5 text-content/80 border-none ring-transparent focus:ring-0 rounded-full placeholder:text-content/30 focus:outline-none"
								placeholder="Search..."
								value={searchQuery}
								onChange={setSearchQuery}
							/>

							{searchQuery && (
								<button
									className="pointer-events-auto absolute -inset-y-0.5 right-0 aspect-[1/1] flex items-center justify-center"
									onClick={handleClear}
								>
									<svg
										className="w-4 opacity-50"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={2}
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18 18 6M6 6l12 12"
										></path>
									</svg>
								</button>
							)}
						</div>
					</div>

					<div
						className={clsx(
							"sticky top-0 h-[60vh] overscroll-none",
							{ "pointer-events-auto": expanded },
							{ "overflow-auto": actionSections?.length }
						)}
						onPointerDown={(e) => {
							if (actionSections?.length) return;
							controls.start(e);
						}}
					>
						<NavActions
							{...{
								actionSections,
								pinnedActions,
								searchQuery,
								onCollapse: handleCollapse,
							}}
						/>
					</div>
				</motion.div>
			</motion.div>

			<NavItems
				onExpand={handleExpand}
				{...{ expanded, dragging, bottomNavHidden }}
				dragControls={controls}
			/>

			<FloatingRemote
				{...{
					onCollapse: handleCollapse,
					expanded,
					dragging,
					focusInput,
				}}
			/>
		</>
	);
}
