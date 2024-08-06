import { NavButton, MutliGestureButton } from "@/crotchet/components";
import { useDataLoader } from "@/crotchet/hooks";
import useKeyboard from "@/crotchet/hooks/useKeyboard";
import clsx from "clsx";
import {
	motion,
	useAnimate,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const BottomNavButton = ({
	disabled,
	icon,
	action,
	activeIcon: _activeIcon,
	selected,
	onClick,
	onHold,
}) => {
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

const NavActions = ({ expanded, onCollapse }) => {
	const { data: actions, refetch } = useDataLoader({
		handler: window.globalActions,
		listenForUpdates: (callback = () => {}) => {
			window.addEventListener("extensions-updated", callback, false);

			return () => {
				window.addEventListener("extensions-updated", callback, false);
			};
		},
	});

	useEffect(() => {
		refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [expanded]);

	if (!actions?.length) return null;

	return (
		<div className="mt-3" onClick={onCollapse}>
			{actions.map((action) => {
				action.icon = (
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

				return (
					<NavButton
						className="px-4"
						key={action._id}
						action={action}
					/>
				);
			})}
		</div>
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
	const [dragging, setDragging] = useState(false);
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
				className="fixed inset-x-0 max-w-xl mx-auto bottom-0 bg-stone-100/95 dark:bg-card/85 backdrop-blur-sm overflow-hidden z-50"
				style={{
					bottom: expanded
						? `calc(-35vh + ${56}px + env(safe-area-inset-bottom) * 0.6)`
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
				onDrag={() => {
					var delta = ratio.get();
					if (expanded && delta >= 0.02) inputRef.current.blur();
					setDragging(delta >= 0.02);
				}}
				onDragEnd={() => {
					var delta = ratio.get();
					if (delta >= 0.02) setExpanded(!expanded);
					setDragging(false);
				}}
			>
				<motion.div
					style={{
						opacity: ratio,
						pointerEvents: expanded ? "none" : "",
					}}
				>
					<div className="m-3 relative border dark:border border-stroke shadow-sm rounded-full">
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
					</div>

					<NavActions
						expanded={expanded}
						onCollapse={() => setExpanded(false)}
					/>
				</motion.div>
			</motion.div>

			<div
				className={clsx(
					"pointer-events-none z-50 fixed inset-x-8 bottom-0 flex items-center justify-between gap-4 transition",
					(expanded || dragging) && "opacity-0"
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
						disabled={expanded}
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
