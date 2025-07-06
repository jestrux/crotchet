import clsx from "clsx";
import { useActionClick, useDataLoader } from "@/crotchet/hooks";
import Loader from "./Loader";
import { onActionClick } from "@/crotchet/hooks/useActionClick";
import { useRef } from "react";
import { motion } from "framer-motion";

function ActionButton({ button, propagate = true }) {
	const { loading, onClick } = useActionClick(button, {
		propagate,
	});

	if (!button?.label) return null;

	const { styling, fixed = true, icon, label } = button || {};

	const handleClick = () => {
		onClick(button);
	};

	return (
		<>
			{fixed ? (
				<div className="-mx-1.5 -mb-0.5 p-3s sborder-t border-content/10 relative">
					<button
						className={`${
							styling?.text === "primary" && "text-primary"
						} focus:outline-none h-[40px] flex items-center justify-center gap-2 text-content/50 hover:text-content/[0.65] transition-colors text-[11px] leading-none uppercase tracking-wider font-bold py-3.5 w-full text-center border border-content/5 hover:border-content/20 bg-content/5 roundeds`}
						onClick={handleClick}
					>
						<span className="size-4 flex items-center justify-center">
							{icon}
						</span>
						{label}
					</button>

					{loading && (
						<Loader
							showScrim={false}
							fillParent
							size={26}
							thickness={8}
						/>
					)}
				</div>
			) : (
				<div className="p-3 border-t border-content/10 relative">
					<button
						className={`${
							button.styling?.text === "primary" && "text-primary"
						} focus:outline-none h-[38px] flex items-center justify-center gap-2 text-content/50 hover:text-content/[0.65] transition-colors text-xs leading-none uppercase tracking-wider font-bold py-3.5 w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded`}
						onClick={handleClick}
					>
						<span className="size-4 flex items-center justify-center">
							{icon}
						</span>
						{label}
					</button>

					{loading && <Loader fillParent size={26} thickness={8} />}
				</div>
			)}
		</>
	);
}

export default function Widget({
	size,
	title: _title,
	icon,
	background,
	color,
	actions: _actions,
	children,
	resolve,
	content: _content,
	actionButton: _actionButton,
	onClick,
	onSwipe,
	listenForUpdates,
}) {
	const state = useRef({});
	const setState = (key, value) => {
		state.current[key] = value;
	};
	const { data, refetch, loading } = useDataLoader({
		handler: async () => {
			const res = await (typeof resolve == "function"
				? resolve({ state: state.current, setState })
				: Promise.resolve(true));

			return res;
		},
		listenForUpdates,
	});

	const evaluate = (item, payload, defaultValue) => {
		if (!item) return defaultValue;
		return typeof item == "function" ? item(payload) ?? defaultValue : item;
	};

	const context = { data, loading, state, setState, refetch };
	const title = evaluate(_title, context);
	const content = evaluate(_content, context);
	const actions = evaluate(_actions, context, []);
	const actionButton = evaluate(_actionButton, context, []);
	const canDrag = typeof onSwipe == "function";

	const aspectRatio = {
		small: "1/0.75",
		wide: "2/1.02",
		large: "4/1",
	}[size || "wide"];

	return (
		<motion.div
			className={clsx(
				"rounded-2xl bg-card border border-content/10 overflow-hidden relative",
				canDrag ? "shadow-xl" : "shadow-md"
			)}
			drag
			dragListener={canDrag}
			dragConstraints={{
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			}}
			dragElastic={{ left: 0.2, right: 0.2, top: 0.2, bottom: 0.2 }}
			onDragEnd={(_, info) => {
				if (typeof onSwipe != "function") return;

				setTimeout(() => {
					onSwipe({
						...context,
						direction: info.offset > 0 ? 1 : -1,
					});
				}, 10);
			}}
		>
			<div
				className="h-full flex flex-col relative text-content/60"
				style={{
					aspectRatio,
				}}
			>
				{(icon || title?.length > 0) && (
					<div className="rounded-t-2xl relative z-10 flex-shrink-0 h-10 flex items-center gap-1.5 px-3.5 bg-content/5">
						{icon && (
							<span className="-ml-1.5 size-6 bg-content/10 rounded-full flex items-center justify-center">
								{icon}
							</span>
						)}

						<span className="uppercase tracking-wide text-xs font-bold opacity-80">
							{title}
						</span>
					</div>
				)}

				{actions?.length > 0 && (
					<div className="absolute right-1.5 top-1 z-10">
						<div
							className="flex items-center gap-1"
							style={{ color: color?.length ? color : "" }}
						>
							{actions.map((action, index) => {
								return (
									<button
										title={action.label}
										key={index}
										className={clsx(
											"relative focus:outline-none size-7 transition-colors rounded-full flex items-center justify-center",
											// "ring-1 ring-white/5",
											// {
											// 	"bg-content/[0.08] dark:bg-content/15 border border-content/10":
											// 		!color?.length,
											// },
											action.className || ""
										)}
										onClick={() =>
											onActionClick(action)(context)
										}
										style={{
											color: !color?.length
												? ""
												: color == "white"
												? "black"
												: "white",
										}}
									>
										{color?.length && (
											<span
												className="absolute inset-0 border rounded-full"
												style={{
													borderColor:
														color == "white"
															? "rgba(255,255,255,0.1)"
															: "rgba(0,0,0,0.1)",
													background: color,
												}}
											></span>
										)}

										<span className="relative size-4 flex items-center justify-center">
											{action.icon}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				)}

				<div
					{...(typeof onClick == "function"
						? { onClick: () => onClick(context) }
						: {})}
					className="flex-1 overflow-hidden bg-cover bg-center flex flex-col"
					style={{
						background: !background?.length ? "" : background,
						color: color?.length ? color : "",
						// aspectRatio,
					}}
				>
					{/* <div className="flex-1">
						{content && (
							<WidgetContent
								inset={!noPadding}
								data={data}
								loading={loading || _loading}
								content={content}
							/>
						)}
					</div> */}

					{content ? content : children}
				</div>

				{actionButton && <ActionButton button={actionButton} />}
			</div>
		</motion.div>
	);
}
