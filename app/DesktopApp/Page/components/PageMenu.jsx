import { useState, useRef, useCallback, forwardRef } from "react";
import clsx from "clsx";

import {
	useOnClickOutside,
	usePopper,
	useOnInit,
	useEventListener,
	useKeyDetector,
} from "@/crotchet/hooks";
import { randomId, dispatch, sectionedChoices } from "@/crotchet/utils";
import ThemeBg from "@/DesktopApp/ThemeBg";
import CommandKey from "./CommandKey";

const PageMenuContent = forwardRef(function PageMenuContent(
	{ idRef, choices, width, selected, onSelect, onOpen, onClose },
	containerRef
) {
	const [query, setQuery] = useState("");
	const [activeChoice, setActiveChoice] = useState();
	const inputRef = useRef(null);
	const choiceSections = sectionedChoices(choices, query);

	const getContainer = () => inputRef.current.closest("#menuContent");

	const handleSelect = (value) => {
		onSelect(value);
	};

	useOnInit(() => {
		onOpen();
		setTimeout(() => {
			if (inputRef.current) inputRef.current.focus();
			onNavigate(selected);
		});
	});

	useEventListener("click", () => {
		if (inputRef.current) inputRef.current.focus();
	});

	useEventListener(`key-` + idRef.current, (_, key) => {
		if (key == "Escape") return handleEscape();

		if (key == "Enter") return handleSelect(activeChoice);

		onNavigate(key.replace("Arrow", "").toLowerCase());
	});

	const onKey = (e) => {
		dispatch(`key-` + idRef.current, e.key);
	};

	useKeyDetector({
		key: ["Escape", "Enter", "ArrowUp", "ArrowDown"],
		action: onKey,
	});

	const onNavigate = (value) => {
		const options = getContainer().querySelectorAll("[data-choice]");

		if (!options?.length) return setActiveChoice(null);

		const values = Array.from(options).map((option) =>
			option.getAttribute("data-choice")
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

		setActiveChoice(value);

		if (value == values[0])
			getContainer().querySelector("#scrollArea").scrollTop = 0;
		else options[values.indexOf(value)]?.scrollIntoView();
	};

	const handleEscape = () => {
		if (!query?.length) return onClose();

		setQuery("");
		setTimeout(() => onNavigate());
	};

	return (
		<ThemeBg
			overlay
			id="menuContent"
			className="z-[9999] absolute w-56 rounded-md overflow-hidden border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-xs"
			style={{ width }}
			ref={containerRef}
		>
			<div className="sticky top-0">
				<input
					ref={inputRef}
					type="text"
					className="placeholder:text-content/30 z-10 !rounded-none border-0 border-b !border-content/10"
					placeholder="Type to search"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setTimeout(() => onNavigate());
					}}
				/>
			</div>

			<div
				id="scrollArea"
				className="relative p-1 max-h-60 overflow-auto"
			>
				{!choiceSections?.length && (
					<div className="rounded relative cursor-default select-none py-2 truncate text-[14px] text-content/30 text-center font-medium">
						No results
					</div>
				)}

				{choiceSections.map(([section, choices], idx) => {
					return (
						<div
							key={section + "idx"}
							className={clsx("-mx-1 px-1", {
								"mb-1 pb-1 border-b border-content/[0.07]":
									idx != choiceSections.length - 1,
							})}
						>
							{section && section != "undefined" && (
								<div
									className={clsx(
										"mb-1 text-[11px]/none tracking-wider uppercase font-medium text-content/40 pl-2",
										idx == 0 ? "mt-1" : "mt-3"
									)}
								>
									{section}
								</div>
							)}

							{choices.map((choice) => {
								const active = activeChoice == choice.value;
								return (
									<button
										type="button"
										key={choice.__id}
										data-choice={choice.value}
										className={clsx(
											"w-full flex items-center gap-1 rounded relative cursor-default select-none p-2 truncate text-[14px] font-medium",
											active
												? "bg-content/10 text-content/70"
												: "text-content/60 hover:bg-content/5 hover:text-content/70"
										)}
										onClick={() =>
											handleSelect(choice.value)
										}
									>
										<span
											className={`${
												choice.destructive
													? "text-red-600"
													: ""
											}`}
										>
											{choice.label}
										</span>

										{choice.shortcut && (
											<span className="ml-auto flex items-center">
												<CommandKey
													label={choice.shortcut}
												/>
											</span>
										)}
									</button>
								);
							})}
						</div>
					);
				})}
			</div>
		</ThemeBg>
	);
});

export default function PageMenu({
	width = "180px",
	plain = false,
	selected,
	choices = [],
	onChange = () => {},
	trigger,
}) {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef();
	const idRef = useRef("menu-open-" + randomId());
	const [triggerRef, containerRef] = usePopper({
		placement: "bottom-end",
		strategy: "fixed",
		modifiers: [{ name: "offset", options: { offset: [0, 10] } }],
	});

	const handleSelect = (value) => {
		onChange(value);
		onClose();
	};

	const onClose = () => {
		if (!open) return;

		setOpen(false);
		doProcess(false);
		setTimeout(() => {
			dispatch("menu-closed");
		}, 20);
	};

	const onToggle = () => {
		setOpen((open) => {
			doProcess(!open);
			return !open;
		});
	};

	const doProcess = useCallback((open) => {
		const pageWrapper = wrapperRef.current?.closest("#pageWrapper");

		if (!pageWrapper) return;

		if (open) pageWrapper.classList.add(idRef.current);
		if (!open) {
			wrapperRef.current.querySelector(`#menuTriggerButton`).blur();

			setTimeout(() => {
				pageWrapper.classList.remove(idRef.current);
			});
		}
	}, []);

	useOnClickOutside(wrapperRef, onClose);

	return (
		<div
			ref={wrapperRef}
			// style={{ width }}
		>
			<div className="relative flex justify-end">
				<button
					ref={triggerRef}
					id="menuTriggerButton"
					className={
						trigger
							? ""
							: `relative w-full cursor-default rounded-md h-9 pl-2 focus:outline-none focus-visible:border-content/20 text-xs font-medium
                                ${
									plain
										? " text-right pr-5 opacity-60"
										: " border border-content/20 pr-10 text-left"
								}
                                `
					}
					onClick={() => {
						onToggle();
					}}
				>
					{trigger ? (
						trigger
					) : (
						<>
							<span className="block truncate opacity-90">
								Choose One
							</span>

							<span
								className={`pointer-events-none absolute inset-y-0 right-0 flex items-center ${
									plain ? " " : " pr-1 opacity-70"
								}`}
							>
								<svg
									className={` ${
										plain
											? " text-right h-4 w-4 "
											: " ml-0.5 opacity-60 h-5 w-5 "
									}`}
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
									/>
								</svg>
							</span>
						</>
					)}
				</button>

				{/* <Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
					show={open}
				> */}
				{open && (
					<PageMenuContent
						ref={containerRef}
						idRef={idRef}
						choices={choices}
						width={width}
						selected={selected}
						onSelect={handleSelect}
						onOpen={() => doProcess(true)}
						onClose={() => {
							onClose();
						}}
					/>
				)}
				{/* </Transition> */}
			</div>
		</div>
	);
}
