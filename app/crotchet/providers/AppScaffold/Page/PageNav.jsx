import MutliGestureButton from "@/crotchet/components/MutliGestureButton";
import clsx from "clsx";
import { motion } from "framer-motion";
import useHideFloatingUI from "./useHideFloatingUI";

export const BottomNavPlaceholder = () => {
	return (
		<div
			style={{
				height: "80px",
				marginBottom: "env(safe-area-inset-bottom)",
			}}
		>
			&nbsp;
		</div>
	);
};

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
	const activeClass =
		"bg-primary/[0.08] text-primary dark:bg-content/[0.08] dark:text-content";
	const inActiveClass = "dark:border-transparent text-content/50";
	const handleClick = () => {
		if (typeof onClick == "function") onClick();
	};

	return (
		<MutliGestureButton
			className={clsx(
				"h-[42px] flex-1 px-4 gap-2 flex-shrink-0 focus:outline-none rounded-full inline-flex items-center justify-center text-center text-sm lg:text-sm font-bold",
				selected ? activeClass : inActiveClass,
				disabled ? "" : "pointer-events-auto"
			)}
			onHold={onHold}
			onClick={handleClick}
		>
			<span className={"-ml-0.5 size-[18px] lg:size-5"}>
				{selected ? activeIcon : icon}
			</span>

			<span
				className={clsx({
					"shidden lg:inline": !selected,
				})}
			>
				{label || action}
			</span>
		</MutliGestureButton>
	);
};

export default function PageNav({ nav, activePage, setActivePage }) {
	const hideFloatingUI = useHideFloatingUI();

	if (!nav?.length) return null;

	return (
		<div className="@container-normal fixed inset-x-0 pointer-events-none">
			<div className="pointer-events-auto fixed left-0 top-48 bottom-64 w-24 px-2 hidden @md:flex flex-col gap-14 items-center justify-center">
				{nav?.map((item, index) => {
					const selected = index == activePage;
					return (
						<button
							key={item.label + "" + index}
							className={clsx(
								"w-full flex flex-col gap-1.5 items-center justify-center",
								selected ? "" : "opacity-50"
							)}
							onClick={() => setActivePage(index)}
						>
							<span className="size-6">{item.icon}</span>
							<span className="text-xs/none">{item.label}</span>
						</button>
					);
				})}
			</div>

			<motion.div
				className="@md:hidden pointer-events-none z-50 fixed inset-x-0 bottom-0 lg:bottom-12 lg:mb-[env(safe-area-inset-bottom)] flex items-center justify-center"
				animate={{
					opacity: hideFloatingUI ? 0 : 1,
					y: hideFloatingUI ? "3%" : 0,
				}}
				style={{
					marginBottom: "calc(env(safe-area-inset-bottom)*-0.3)",
				}}
			>
				<div className="border dark:border border-content/5 shadow-sm bg-stone-100/95 dark:bg-card/95 backdrop-blur-sm w-full lg:w-auto min-w-96 px-2 lg:rounded-full overflow-hidden">
					<div className="h-14 px-3 lg:px-0 mb-[env(safe-area-inset-bottom)] lg:mb-0 flex items-center justify-between gap-4 lg:gap-2 lg:max-w-sm mx-auto">
						{nav.map((item, index) => {
							return (
								<BottomNavButton
									key={item.label + "" + index}
									{...item}
									selected={index == activePage}
									onClick={() => setActivePage(index)}
								/>
							);
						})}
					</div>
				</div>
			</motion.div>
		</div>
	);
}
