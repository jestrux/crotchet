import clsx from "clsx";
import { useActionClick, useDataLoader } from "@/crotchet/hooks";
import Loader from "./Loader";
import { onActionClick } from "@/crotchet/hooks/useActionClick";
import { getFromCache, cache } from "@/crotchet/utils";

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
						{icon}
						{label}
					</button>

					{loading && <Loader fillParent size={26} thickness={8} />}
				</div>
			) : (
				<div className="p-3 border-t border-content/10 relative">
					<button
						className={`${
							button.styling?.text === "primary" && "text-primary"
						} focus:outline-none h-[38px] flex items-center justify-center gap-2 text-content/50 hover:text-content/[0.65] transition-colors text-xs leading-none uppercase tracking-wider font-bold py-3.5 w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded`}
						onClick={handleClick}
					>
						{icon}
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
	name,
	title,
	icon,
	background,
	color,
	actions: _actions,
	children,
	resolve,
	content: _content,
	actionButton: _actionButton,
	onClick,
}) {
	const { loading: loadingCache, data: cachedData } = useDataLoader({
		handler: !name ? null : getFromCache(name),
	});

	const { data: actualData, loading: loadingData } = useDataLoader({
		handler: async () => {
			const res = await (typeof resolve == "function"
				? resolve({})
				: Promise.resolve(true));

			if (name?.length && res) cache(name, res);

			return res;
		},
		listenForUpdates: (callback = () => {}) => {
			const event = "firebase-table-updated:readingList";
			window.addEventListener(event, callback, false);
			return () => window.removeEventListener(event, callback, false);
		},
	});

	const evaluate = (item, payload, defaultValue) => {
		if (!item) return defaultValue;
		return typeof item == "function" ? item(payload) ?? defaultValue : item;
	};

	const data = actualData || cachedData;
	const loading = loadingCache || loadingData;
	const content = evaluate(_content, { data, loading });
	const actions = evaluate(_actions, { data, loading }, []);
	const actionButton = evaluate(_actionButton, { data, loading }, []);

	const aspectRatio = {
		small: "1/0.75",
		wide: "2/0.8",
		large: "4/1",
	}[size || "wide"];

	return (
		<div className="rounded-2xl bg-card shadow-md border border-content/10 overflow-hidden relative">
			<div
				className="h-full flex flex-col relative text-content/60"
				{...(typeof onClick == "function" ? { onClick } : {})}
			>
				{(icon || title?.length > 0) && (
					<div className="rounded-t-2xl relative z-10 flex-shrink-0 h-10 flex items-center gap-1.5 px-3.5 bg-content/5">
						{icon && (
							<span className="-ml-1.5 w-6 h-6 bg-content/10 rounded-full flex items-center justify-center">
								{icon}
							</span>
						)}

						<span className="uppercase tracking-wide text-xs font-bold opacity-80">
							{title}
						</span>
					</div>
				)}

				{actions?.length > 0 && (
					<div className="absolute right-2 top-2 z-10 flex items-center gap-2">
						<div
							className="flex items-center gap-2"
							style={{ color: color?.length ? color : "" }}
						>
							{actions.map((action, index) => {
								return (
									<button
										title={action.label}
										key={index}
										className={clsx(
											"relative focus:outline-none w-6 h-6 transition-colors rounded-full flex items-center justify-center",
											"ring-1 ring-white/5",
											{
												"bg-content/[0.08] dark:bg-content/15 border border-content/10":
													!color?.length,
											},
											action.className || ""
										)}
										onClick={onActionClick(action)}
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

										<span className="relative">
											{action.icon}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				)}

				<div
					className="flex-1 overflow-hidden bg-cover bg-center flex flex-col"
					style={{
						background: !background?.length ? "" : background,
						color: color?.length ? color : "",
						aspectRatio,
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
		</div>
	);
}
