import MutliGestureButton from "@/crotchet/components/MutliGestureButton";
import useKeyboard from "@/crotchet/hooks/useKeyboard";
import clsx from "clsx";
import {
	motion,
	useAnimate,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { useRef, useState } from "react";

export const BottomNavButton = ({
	disabled,
	icon,
	action,
	activeIcon: _activeIcon,
	selected,
	onClick,
	onHold,
}) => {
	// const icon = apps?.[page]?.icon;
	const activeIcon = _activeIcon || icon;
	const activeClass =
		"bg-content/5 dark:bg-content/10 border-content/5 dark:border-content/15 text-content";
	const inActiveClass = "opacity-70 border-transparent";
	const handleClick = () => {
		if (typeof onClick == "function") onClick();
	};

	return (
		<MutliGestureButton
			className={clsx(
				"flex-shrink-0 focus:outline-none rounded-full border inline-flex items-center justify-center h-9 w-16 px-2.5 text-center text-xs uppercase font-bold",
				selected ? activeClass : inActiveClass,
				disabled ? "" : "pointer-events-auto"
			)}
			style={
				action == "home" && selected
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
			<span className={clsx("size-5", !selected && "opacity-70")}>
				{selected ? activeIcon : icon}
			</span>
		</MutliGestureButton>
	);
};

export default function MobileNav() {
	useKeyboard();

	const [scope, animate] = useAnimate();
	const inputRef = useRef(null);
	const [navItems] = useState([
		{ action: "" },
		{
			icon: (
				<svg
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.8}
					stroke="currentColor"
					className="h-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
					/>
				</svg>
			),
			action: "home",
		},
		{ action: "" },
	]);
	const [hidePinnedMenu, setHidePinnedMenu] = useState(false);
	const [currentPage, setCurrentPage] = useState("home");
	const [expanded, _setExpanded] = useState(false);
	const y = useMotionValue(0);
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

	const handleExpand = () => {
		const res = animate([[scope.current, { y: -300, dur: 0.5 }]]);

		setTimeout(() => {
			res.cancel();
			setExpanded(true);
		}, 100);
	};

	const handleCollapse = () => {
		inputRef.current.blur();

		setTimeout(() => {
			const res = animate([[scope.current, { y: 300, dur: 0.5 }]]);

			setTimeout(() => {
				setExpanded(false);
				res.cancel();
			}, 50);
		}, 50);
	};

	const setExpanded = (newValue) => {
		if (newValue) {
			inputRef.current.style.pointerEvents = "auto";
			inputRef.current.focus();
		} else {
			inputRef.current.style.pointerEvents = "";
		}

		setHidePinnedMenu(newValue);
		_setExpanded(newValue);
	};

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
				onClick={handleCollapse}
			/>

			<motion.div
				ref={scope}
				className="fixed inset-x-0 bottom-0 bg-stone-100/85 dark:bg-card/85 overflow-hidden z-50"
				style={{
					bottom: expanded
						? `calc(-40vh + ${56}px + env(safe-area-inset-bottom) * 0.6)`
						: `calc(-100vh + ${56}px + env(safe-area-inset-bottom) * 0.6)`,
					height: "100vh",
					y,
					borderTopLeftRadius: borderRadius,
					borderTopRightRadius: borderRadius,
				}}
				drag="y"
				dragConstraints={{
					top: expanded ? 0 : 1,
					bottom: expanded ? 1 : 0,
				}}
				dragTransition={{
					bounceStiffness: 20000,
					bounceDamping: 20000,
				}}
				// dragElastic={{
				// 	top: !expanded ? 0.1 : false,
				// 	bottom: !expanded ? false : 0.1,
				// }}
				onDrag={() => {
					var delta = ratio.get();
					if (expanded && delta >= 0.2) inputRef.current.blur();
					setHidePinnedMenu(true);
				}}
				onDragEnd={() => {
					var delta = ratio.get();
					if (delta >= 0.2) setExpanded(!expanded);
				}}
			>
				<div className="p-3">
					<motion.div
						className="relative border dark:border border-stroke shadow-sm rounded-full"
						style={{
							opacity: ratio,
							pointerEvents: "none",
						}}
					>
						<svg
							className="absolute top-0 left-3 bottom-0 my-auto size-5 opacity-30"
							viewBox="0 0 24 24"
							fill="none"
							strokeWidth={2}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
							/>
						</svg>

						<input
							ref={inputRef}
							className="h-12 pl-10 w-full text-lg/none bg-card dark:bg-content/5 text-content/50 border-none ring-transparent focus:ring-0 rounded-full placeholder:text-content/40 focus:outline-none"
							placeholder="Search..."
						/>
					</motion.div>

					{/* {expanded && <KeyboardPlaceholder />} */}
				</div>
			</motion.div>

			<div
				className={clsx(
					"pointer-events-none z-50 fixed inset-x-8 bottom-0 flex items-center justify-between gap-4 transition",
					hidePinnedMenu && "opacity-0"
				)}
				style={{
					height: "56px",
					paddingBottom: "env(safe-area-inset-bottom)",
				}}
			>
				{navItems.map((item, index) => (
					<BottomNavButton
						key={item.action + index}
						action={item.action}
						icon={item.icon}
						activeIcon={item.activeIcon}
						disabled={hidePinnedMenu}
						selected={currentPage == item.action}
						// onHold={
						// 	page == "home" && currentPage == page
						// 		? () =>
						// 				openUrl(
						// 					"crotchet://action/remote"
						// 				)
						// 		: null
						// }
						onClick={() => {
							if (currentPage != item.action)
								setCurrentPage(item.action);
							else if (item.action == "home") handleExpand();
						}}
					/>
				))}
			</div>
		</>
	);
}
