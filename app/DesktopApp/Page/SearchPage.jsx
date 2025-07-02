import { useState, useRef } from "react";
import clsx from "clsx";

import PageFilters from "./components/PageFilters";
import { usePageContext } from "@/crotchet/providers/PageProvider";
import {
	isValidAction,
	objectFieldChoices,
	sectionedChoices,
} from "@/crotchet/utils";
import PageGrid from "./components/PageGrid";
import PageListItem from "./components/PageListItem";
import { onActionClick } from "@/crotchet/hooks/useActionClick";
import { Input } from "@/crotchet/components";

const layoutDetails = (page) => {
	const {
		layout,
		columns: columnString = 3,
		aspectRatio = "1/1",
	} = {
		...(page?.layoutProps || { layout: page.layout }),
	};
	const columnMap = columnString
		.toString()
		.split(",")
		.reduce(
			(agg, col) => {
				const [columns, screen = "xs"] = col.split(":").reverse();

				return {
					...agg,
					[screen]: Number(columns),
				};
			},
			{ xs: 1 }
		);

	const columns =
		columnMap["2xl"] ||
		columnMap["xl"] ||
		columnMap["lg"] ||
		columnMap["md"] ||
		columnMap["sm"] ||
		columnMap["xs"];

	const grid = ["grid", "masonry"].includes(layout);

	return {
		grid,
		masonry: layout == "masonry",
		aspectRatio,
		columns,
	};
};

export default function SearchPage() {
	const {
		isOpen,
		page,
		pageData,
		pageResolving,
		pageDataVersion,
		setMainAction,
		setActions,
		onOpen,
		onBlur,
		onClose,
		onCommandMatched,
		onReady,
		onDataUpdated,
		onClick,
		onEscape,
		onNavigateDown,
		onNavigateUp,
		onSearch,
	} = usePageContext();
	const commandMatchedRef = useRef(false);
	const activeChoiceIndexRef = useRef(null);
	const [activeChoice, _setActiveChoice] = useState();
	const [query, setQuery] = useState("");
	const containerRef = useRef(null);
	const inputRef = useRef(null);
	const { grid, aspectRatio, columns, masonry } = layoutDetails(page);
	const resultsRef = useRef([]);
	const [searchResults, _setSearchResults] = useState([]);
	const setSearchResults = (results) => {
		resultsRef.current = results;
		_setSearchResults(results);
		navigateToStart();
		// setTimeout(() => navigateToStart(), 300);
	};

	const choices = pageData || [];
	const choiceSections = searchResults.length
		? sectionedChoices(searchResults, "")
		: sectionedChoices(choices, query);

	const getContainer = () => containerRef.current;

	const getActionForValue = (value, choices) => {
		const choice = objectFieldChoices(choices).find(
			(choice) => choice.value == value
		);
		let action, actions;

		if (choice) {
			action = choice.action
				? choice.action
				: typeof page.entryAction == "function"
				? page.entryAction(choice)
				: isValidAction(choice)
				? { ...choice, label: "Select" }
				: null;

			actions = choice.actions
				? choice.actions
				: typeof page.entryActions == "function"
				? page.entryActions(choice)
				: null;
		}

		return [action, actions];
	};

	const handleSelect = (value) => {
		const [action] = getActionForValue(
			value,
			resultsRef.current.length ? resultsRef.current : choices
		);
		onActionClick(action)();
		navigate(value);
	};

	const setActiveChoice = (value, index) => {
		_setActiveChoice(value);

		activeChoiceIndexRef.current = index;

		const [action, actions] = getActionForValue(
			value,
			resultsRef.current.length ? resultsRef.current : choices
		);
		setMainAction(action);
		setActions(actions);
	};

	onClick(() => {
		if (inputRef.current) inputRef.current.focus();
	});

	const focusInput = () => {
		if (inputRef.current) inputRef.current.select();
	};

	const clearSearchQuery = () => {
		inputRef.current.value = "";
		setQuery("");
		setSearchResults([]);
	};

	const navigateToStart = (focus) => {
		setTimeout(() => navigate());
		if (focus) focusInput();
	};

	const navigate = (value) => {
		const container = getContainer();
		const scrollArea = container.querySelector("#scrollArea");

		const options = container.querySelectorAll(
			"[data-reach-combobox-option]"
		);
		const activeChoice = container
			.querySelector("[data-reach-combobox-option][data-selected]")
			?.getAttribute("data-value");

		if (!options?.length) return setActiveChoice(null);

		const values = Array.from(options).map((option) =>
			option.getAttribute("data-value")
		);

		if (!value) value = values[0];
		else if (["up", "down"].includes(value)) {
			let index = values.findIndex((value) => value === activeChoice);

			if (index == -1) index = 0;
			else if (value == "down")
				index = index == options.length - 1 ? 0 : index + 1;
			else if (value == "up")
				index = index == 0 ? options.length - 1 : (index = index - 1);

			value = values[index];
		}

		setActiveChoice(value, values.indexOf(value));

		if (value == values[0]) scrollArea.scrollTop = 0;
		else {
			const el = options[values.indexOf(value)];

			if (!el) return;

			const elementInView = (
				el,
				containerEl,
				{ offsetTop = 6, offsetBottom = 6 } = {}
			) => {
				const rect = el.getBoundingClientRect();
				const parent = containerEl.getBoundingClientRect();
				const top = parent.top + offsetTop;
				const bottom = parent.bottom - offsetBottom;
				const deltaTop = rect.top - top;
				const deltaBottom = bottom - rect.bottom;

				return [
					deltaTop >= 0 && deltaBottom >= 0,
					deltaTop < 0 ? deltaTop : -deltaBottom,
				];
			};

			try {
				const [inView, elementPosition] = elementInView(el, scrollArea);

				if (!inView) {
					scrollArea.scrollTo(
						0,
						scrollArea.scrollTop + elementPosition
					);
				}

				return;
			} catch (error) {
				//
			}

			el.scrollIntoView();
		}
	};

	const handleEscape = ({ popAll } = {}) => {
		if (!isOpen) return;

		if (query.length) {
			clearSearchQuery();
			navigateToStart();

			if (popAll && typeof onPopAll == "function") onClose({ popAll });

			return;
		}

		onClose({ popAll });
	};

	const handleSearch = (query) => {
		setSearchResults([]);
		setQuery(query);

		onSearch(query).then((results) => {
			setSearchResults(results);
		});
	};

	onBlur(() => {
		if (inputRef.current) inputRef.current.blur();
	});

	onOpen(() => {
		if (!activeChoice) navigateToStart("select");
		focusInput();
	});

	onReady(() => navigateToStart());

	onDataUpdated((newData) => {
		const newChoicesValues = sectionedChoices(newData, query, {
			valuesOnly: true,
		});

		const newSelection =
			newChoicesValues[activeChoiceIndexRef.current]?.value;

		if (!newSelection) return navigateToStart();

		setTimeout(() => navigate(newSelection));
	});

	onNavigateDown(() => navigate("down"));

	onNavigateUp(() => navigate("up"));

	onEscape((payload) => handleEscape(payload));

	onCommandMatched(() => (commandMatchedRef.current = true));

	return (
		<div ref={containerRef}>
			<div className="h-14 px-4 flex items-center comboboxData.isExpanded border-b border-content/10 z-10 relative">
				{typeof onClose == "function" && page?.id != "root" && (
					<button
						type="button"
						className="flex-shrink-0 -ml-1.5 mr-2.5 bg-content/10 rounded flex items-center justify-center w-7 h-7"
						onClick={onClose}
					>
						<svg
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-3.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
							/>
						</svg>
					</button>
				)}

				<Input
					type="text"
					ref={inputRef}
					className="popover-input bg-transparent h-full flex-1 border-none shadow-none px-0 py-3 text-xl focus:outline-none placeholder-content/30"
					placeholder={page?.placeholder || "Type to search actions"}
					debounce={page?.onSearch ? 500 : 0}
					value={query}
					onChange={(query) => {
						if (commandMatchedRef.current)
							return (commandMatchedRef.current = false);

						if (!isOpen) return;

						handleSearch(query);
					}}
				/>

				<PageFilters />
			</div>

			<div
				id="scrollArea"
				className="relative overflow-auto"
				style={{ height: "calc(100vh - 100px)" }}
			>
				{!pageResolving && (
					<>
						{!choiceSections?.length && query?.length > 0 && (
							<div className="absolute inset-0 pb-12 flex flex-col items-center justify-center select-none truncate text-lg text-content/30 text-center font-medium">
								<svg
									className="mb-5 size-8 opacity-80"
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
								</svg>

								<span>No results found matching </span>
								<strong className="text-content/70">
									{query}
								</strong>
							</div>
						)}
						{choiceSections.map(([section, choices], idx) => {
							if (grid) {
								return (
									<PageGrid
										key={
											section + "" + idx + pageDataVersion
										}
										aspectRatio={aspectRatio}
										masonry={masonry}
										columns={columns}
										choices={choices}
										selected={activeChoice}
										onSelect={handleSelect}
									/>
								);
							}

							return (
								<div
									key={section + "" + idx}
									className={clsx({
										"border-b border-content/5":
											idx != choiceSections.length - 1,
									})}
								>
									{section && section != "undefined" && (
										<span className="mt-5 mb-1 uppercase tracking-wide text-xs font-semibold opacity-50 px-4 flex items-center">
											{section}
										</span>
									)}

									{choices.map((choice) => {
										const { icon, image, video, trailing } =
											choice;

										return (
											<PageListItem
												key={choice.__id}
												className="cursor-default"
												trailing={
													trailing?.length ? (
														<div
															className="mr-2"
															dangerouslySetInnerHTML={{
																__html: trailing,
															}}
														/>
													) : icon?.length ? (
														<div
															className="mr-2"
															dangerouslySetInnerHTML={{
																__html: icon,
															}}
														/>
													) : (
														(image?.length ||
															video?.length) && (
															<div className="mr-2 h-8 relative flex-shrink-0 bg-content/10 border border-content/10 overflow-hidden aspect-[1.3/1] rounded">
																<img
																	className={
																		"absolute size-full object-cover"
																	}
																	src={
																		image?.length
																			? image
																			: video
																	}
																	alt=""
																/>

																{video?.length && (
																	<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
																		<div className="relative size-3 flex items-center justify-center rounded-full overflow-hidden bg-card">
																			<div className="absolute inset-0 bg-content/60"></div>
																			<svg
																				className="size-3 ml-0.5 relative text-canvas"
																				viewBox="0 0 24 24"
																				fill="currentColor"
																			>
																				<path
																					strokeLinecap="round"
																					strokeLinejoin="round"
																					d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
																				/>
																			</svg>
																		</div>
																	</div>
																)}
															</div>
														)
													)
												}
												label={choice.label}
												value={choice.value}
												focused={
													activeChoice == choice.value
												}
												onClick={() =>
													handleSelect(choice.value)
												}
											/>
										);
									})}
								</div>
							);
						})}
					</>
				)}
			</div>
		</div>
	);
}
