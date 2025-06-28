import { motion } from "framer-motion";
import { Portal } from "@reach/portal";
import { useDataLoader } from "@/crotchet/hooks";
import Loader from "@/crotchet/components/Loader";

import clsx from "clsx";
import useKeyboard from "../hooks/useKeyboard";
import ListView from "./ListView";
import { useLayoutEffect, useRef, useState } from "react";
import { matchSorter } from "match-sorter";
import { Input } from ".";
import GridList from "./GridList";
import PreviewCard from "./PreviewCard";
import ActionGrid from "./ActionGrid";

export default function ModalPage({
	preview,
	actions,
	layout,
	resolve,
	searchable = false,
	title: _title,
	content: _content,
	emptyStateMessage = "Nothing in here",
	onClose = () => {},
}) {
	const inputRef = useRef(null);
	const scrollViewRef = useRef(null);

	const focusSearchInput = (delay = 80) => {
		setTimeout(() => {
			inputRef.current.focus();
		}, delay);
	};

	const handleClear = () => {
		setSearchQuery("");

		const input = inputRef.current;

		if (input?.getAttribute("is-focused")) inputRef.current?.focus();
	};

	const [searchQuery, setSearchQuery] = useState("");
	const { KeyboardPlaceholder } = useKeyboard();
	const {
		data: _data,
		showLoader,
		loading,
	} = useDataLoader({
		delayLoader: true,
		handler: resolve,
	});
	const data = matchSorter(_data || [], searchQuery, {
		keys: ["title", "label", "subtitle", "tags"],
	});

	const evaluate = (item, payload, defaultValue) => {
		if (!item) return defaultValue;
		return typeof item == "function" ? item(payload) ?? defaultValue : item;
	};

	const context = { data, loading, showLoader };
	const title = evaluate(_title, context);
	const content = evaluate(_content, context);

	const noContent = !content && !loading && !data?.length;

	useLayoutEffect(() => {
		focusSearchInput();
	}, []);

	const searchInput = () => {
		return (
			<div className="relative">
				<svg
					className="absolute inset-0 my-auto left-2.5 size-5 opacity-30"
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
					className="h-9 pl-9 w-full text-lg font-medium border-none dark:border border-stroke shadow dark:shadow-sm bg-card/80 dark:bg-content/5 text-content/80 ring-transparent focus:ring-0 rounded-lg placeholder:text-content/30 focus:outline-none"
					placeholder="Search..."
					value={searchQuery}
					onEnter={() => {
						inputRef.current.blur();
					}}
					onChange={(value) => {
						setSearchQuery(value);
						scrollViewRef.current.scrollTop = 0;
					}}
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
		);
	};

	const pageContent = () => {
		if (loading) {
			return (
				<div className="flex justify-center py-4">
					{showLoader && <Loader size={40} />}
				</div>
			);
		}

		if (content) return content;

		if (data?.length) {
			return (
				<>
					{layout == "grid" ? (
						<div className="w-full overflow-x-hidden py-1 px-2">
							<GridList data={data} gap="0.5rem" />
						</div>
					) : (
						<div className="w-full overflow-x-hidden py-1 px-4">
							<ListView data={data} />
						</div>
					)}
				</>
			);
		}

		return (
			<>
				<motion.div
					className="mt-auto w-full px-6 flex flex-col"
					drag="y"
					dragConstraints={{
						top: 0,
						bottom: 0.2,
					}}
					dragElastic={{
						top: 0,
						bottom: 0.2,
					}}
					onDragEnd={(_, info) => {
						if (info.offset.y > 0) onClose();
					}}
				>
					{preview || actions ? (
						<motion.div
							className="flex flex-col gap-6"
							initial={{
								y: "20%",
								opacity: 0,
							}}
							animate={{
								y: 0,
								opacity: 1,
							}}
						>
							{preview && <PreviewCard {...preview} />}
							{actions && (
								<div className={clsx({ "scale-90": preview })}>
									<ActionGrid type="inline" data={actions} />
								</div>
							)}
						</motion.div>
					) : (
						<div className="py-24 flex items-center justify-center opacity-50 text-xl">
							{emptyStateMessage}
						</div>
					)}

					<motion.button
						className="mt-12 mb-8 mx-auto size-12 border border-content/20 rounded-lg flex gap-1 items-center justify-center"
						onClick={() => onClose()}
						initial={{
							opacity: 0,
							scale: 0.5,
						}}
						animate={{
							opacity: 1,
							scale: 1,
						}}
						transition={{
							delay: 0.06,
						}}
					>
						<svg
							className="size-8 opacity-70"
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
					</motion.button>
				</motion.div>
			</>
		);
	};

	return (
		<Portal>
			<motion.div
				className={clsx(
					"fixed inset-0 z-[999] max-w-lg mx-auto",
					noContent
						? "bg-stone-100/80 dark:bg-card/80 backdrop-blur dark:backdrop-blur-lg"
						: "bg-stone-100/95 dark:bg-card/95 backdrop-blur dark:backdrop-blur-lg"
				)}
				initial={{
					y: "1%",
					opacity: 0,
				}}
				animate={{
					y: 0,
					opacity: 1,
					scale: 1,
				}}
				transition={{
					duration: 0.1,
				}}
				onClick={() => (noContent ? onClose() : {})}
			>
				{!noContent && (
					<div className="fixed top-0 inset-x-0 z-50">
						<div
							className="relative"
							style={{
								paddingTop: "env(safe-area-inset-top)",
							}}
						>
							{/* <div
								className="absolute inset-0 -sbottom-4 bg-stone-100/80 dark:bg-card/80 backdrop-blur-lg"
								style={{
									mask: `linear-gradient(black, black 90%, transparent)`,
								}}
							/> */}
							<div className="absolute inset-0 bg-stone-100/95 dark:bg-card/95 backdrop-blur-[6px]" />

							<div className="relative h-14 px-4 flex items-center justify-between gap-2">
								<h3 className="text-xl truncate font-bold first-letter:uppercase">
									{title}
								</h3>

								{!title?.length && searchable && (
									<div className="flex-1 -mx-2.5">
										{searchInput()}
									</div>
								)}

								<button
									className="h-8 -mr-4 px-4 flex-shrink-0 ml-auto flex gap-1 items-center justify-center rounded-lg"
									onClick={() => onClose()}
								>
									<span className="opacity-75">Cancel</span>
								</button>
							</div>

							{title?.length && searchable && (
								<div className="relative px-3 -mx-px -mt-2 mb-2.5">
									{searchInput()}
								</div>
							)}
						</div>
					</div>
				)}

				<div
					ref={scrollViewRef}
					className={clsx("fixed inset-0", {
						"overflow-y-auto": !noContent,
					})}
					style={{
						paddingTop: "env(safe-area-inset-top)",
						paddingBottom: "env(safe-area-inset-bottom)",
					}}
				>
					<div
						className={clsx(
							searchable && title?.length ? "pt-[84px]" : "pt-14",
							{
								"h-full flex items-center justify-center":
									noContent,
							}
						)}
					>
						{pageContent()}
					</div>
					<KeyboardPlaceholder noMargin />
				</div>
			</motion.div>
		</Portal>
	);
}
