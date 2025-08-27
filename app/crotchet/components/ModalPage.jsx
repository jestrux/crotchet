import { motion } from "framer-motion";
import { Portal } from "@reach/portal";
import { useDataLoader, useEventListener } from "@/crotchet/hooks";
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
	type,
	preview,
	actions: _actions,
	entryActions,
	entryAction,
	layout,
	resolve,
	selectable = false,
	searchable = false,
	title: _title,
	content: _content,
	actionsTitle,
	placeholder = "Search...",
	emptyStateMessage = "Nothing in here",
	onClose = () => {},
	onSearch,
}) {
	const inputRef = useRef(null);
	const scrollViewRef = useRef(null);

	const focusSearchInput = (delay = 80) => {
		setTimeout(() => {
			inputRef.current.focus();
		}, delay);
	};

	const blurSearchInput = () => {
		inputRef.current?.blur();
	};

	const handleClear = () => {
		setSearchQuery("");
		handleSearch("");
		if (inputRef.current?.getAttribute("is-focused")) focusSearchInput(0);
	};

	const [searchQuery, setSearchQuery] = useState("");
	const [canDrag, setCanDrag] = useState(false);
	const [loadingFromSearch, setLoadingFromSearch] = useState(false);
	const [data, setData] = useState([]);
	const { KeyboardPlaceholder } = useKeyboard();
	const {
		data: _data,
		showLoader,
		loading: _loading,
	} = useDataLoader({
		// delayLoader: true,
		handler: resolve,
		onSuccess: (res) => {
			setData(res);
		},
	});

	const handleSearch = (value) => {
		setSearchQuery(value);
		scrollViewRef.current.scrollTop = 0;

		if (onSearch) {
			if (!value.length) return setData(_data || []);

			setLoadingFromSearch(true);
			return onSearch(value).then((res) => {
				setData(res);
				setLoadingFromSearch(false);
			});
		}

		setData(
			matchSorter(_data || [], searchQuery, {
				keys: ["title", "label", "subtitle", "tags"],
			})
		);
	};

	const evaluate = (item, payload, defaultValue) => {
		if (!item) return defaultValue;
		return typeof item == "function" ? item(payload) ?? defaultValue : item;
	};

	const loading = loadingFromSearch || _loading;
	const context = {
		data,
		pageData: data,
		pageResolving: loading,
		loading,
		showLoader,
	};
	const title = evaluate(_title, context);
	const content = evaluate(_content, context);
	const actions = evaluate(_actions, context);
	const isPreview = type == "preview";
	const noContent = isPreview || (!content && !loading && !data?.length);
	const titleAndSearch = title?.length && searchable;

	useLayoutEffect(() => {
		focusSearchInput();
		setTimeout(() => {
			setCanDrag(
				scrollViewRef.current?.scrollHeight <= window.innerHeight
			);
		}, 1000);
	}, []);

	useEventListener("alerts-changed", () => {
		blurSearchInput();
	});

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
					placeholder={placeholder}
					value={searchQuery}
					debounce={onSearch ? 500 : 0}
					onEnter={blurSearchInput}
					onChange={handleSearch}
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
		if (loading && !isPreview) {
			return (
				<div className="flex justify-center py-4">
					{showLoader && <Loader size={40} />}
				</div>
			);
		}

		if (content && !isPreview) return content;

		if (data?.length && !isPreview) {
			return (
				<>
					{["grid", "masonry"].includes(layout) ? (
						<div className="w-full overflow-x-hidden py-1 px-2">
							<GridList
								data={data}
								gap="0.5rem"
								masonry={layout == "masonry"}
								entryActions={entryActions}
								entryAction={entryAction}
								onSelect={
									selectable ? (data) => onClose(data) : null
								}
							/>
						</div>
					) : (
						<div className="w-full overflow-x-hidden py-1 px-4">
							<ListView
								data={data}
								entryActions={entryActions}
								entryAction={entryAction}
								onSelect={
									selectable ? (data) => onClose(data) : null
								}
							/>
						</div>
					)}
				</>
			);
		}

		if (isPreview) preview = data;

		return (
			<>
				<div
					className="mt-auto w-full px-6 flex flex-col"
					style={{
						paddingBottom:
							"calc(env(safe-area-inset-bottom) + 4rem)",
					}}
				>
					{preview || actions ? (
						<motion.div
							className="flex flex-col gap-2"
							initial={{
								y: "20%",
								opacity: 0,
							}}
							animate={{
								y: 0,
								opacity: 1,
							}}
							drag="y"
							dragListener={canDrag}
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
							{preview && (
								<PreviewCard loading={loading} {...preview} />
							)}
							{actions && (
								<div
									className={clsx(
										{
											"scale-90":
												preview && !actionsTitle,
										},
										{ "mt-6": actionsTitle }
									)}
								>
									<ActionGrid
										key={
											actions &&
											JSON.stringify(
												actions.map((a) => a.name)
											)
										}
										title={actionsTitle}
										hideTrailing
										type="inline"
										data={actions}
									/>
								</div>
							)}
						</motion.div>
					) : (
						<div className="py-24 flex items-center justify-center opacity-50 text-xl">
							{emptyStateMessage}
						</div>
					)}

					<div className="h-8"></div>
					{
						<motion.button
							className={clsx(
								"bg-stone-100/80 dark:bg-card/80 backdrop-blur dark:backdrop-blur-lg fixed bottom-0 inset-x-0 mt-6 mx-auto size-12 border border-content/20 rounded-lg flex gap-1 items-center justify-center",
								!actionsTitle ? "mb-8" : "mb-12"
							)}
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
					}
				</div>
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
								paddingBottom: titleAndSearch ? "1px" : "",
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

							{titleAndSearch && (
								<div className="relative px-3 -mx-px -mt-2 mb-2.5">
									{searchInput()}
								</div>
							)}
						</div>
					</div>
				)}

				<div
					ref={scrollViewRef}
					className="fixed inset-0 overflow-y-auto"
					style={{
						paddingTop: noContent ? "" : "env(safe-area-inset-top)",
						paddingBottom: "env(safe-area-inset-bottom",
					}}
				>
					<div
						className={clsx(
							titleAndSearch ? "pt-[90px]" : "pt-14",
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
