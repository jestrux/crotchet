import { Fragment, useState, useRef, useCallback, forwardRef } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import CommandKey from "./CommandKey";
import useKeyDetector from "../hooks/useKeyDetector";
import { randomId } from "../utils";
import useOnClickOutside from "../hooks/useOnClickOutside";

export default forwardRef(function Menu(
	{
		width = "180px",
		plain = false,
		onTopMenu = false,
		choices = [],
		value,
		onChange = () => {},
	},
	forwardedRef
) {
	const actionKey = "Shift + L";
	const wrapperRef = useRef();
	const idRef = useRef("pier-menu-open-" + randomId());
	const closedRef = useRef();
	const triggerRef = useRef();
	const [selected, setSelected] = useState(value);
	if (forwardedRef) forwardedRef.current = triggerRef.current;

	const handleSelect = (value) => {
		setSelected(value);
		onChange(value);
	};

	const restoreFocus = () => {
		const popover = triggerRef.current
			?.closest("#spotlightSearchWrapper")
			.querySelector("#popoverContent");
		popover.focus();
	};

	const doProcess = useCallback((open) => {
		const spotlightParent = triggerRef.current?.closest(
			"#spotlightSearchWrapper"
		);

		if (closedRef.current == !open || !spotlightParent) return;

		closedRef.current = !open;

		if (open) spotlightParent.classList.add(idRef.current);
		if (!open) {
			setTimeout(() => {
				spotlightParent.classList.remove(idRef.current);
				restoreFocus();
			}, 200);
		}
	}, []);

	useKeyDetector({
		key: actionKey,
		action: () => (onTopMenu ? triggerRef.current.click() : null),
	});

	useOnClickOutside(
		wrapperRef,
		() => closedRef.current == false && triggerRef.current.click()
	);

	return (
		<div ref={wrapperRef} style={{ width }}>
			<Listbox value={selected} onChange={handleSelect}>
				{({ open }) => {
					doProcess(open);

					return (
						<div className="relative">
							<Listbox.Button
								ref={triggerRef}
								id="menuTriggerButton"
								className={`relative w-full cursor-default rounded-md h-9 pl-2.5 focus:outline-none focus-visible:border-content/20 text-xs font-medium
                                ${
									plain
										? " text-right pr-5 opacity-60"
										: " border border-content/20 pr-10 text-left"
								}
                                `}
							>
								<span className="block truncate opacity-90">
									{selected}
								</span>

								<span
									className={`pointer-events-none absolute inset-y-0 right-0 flex items-center ${
										plain ? " " : " pr-1 opacity-70"
									}`}
								>
									{onTopMenu && (
										<CommandKey label={actionKey} />
									)}

									<ChevronUpDownIcon
										className={` ${
											plain
												? " text-right h-4 w-4 "
												: " ml-0.5 opacity-60 h-5 w-5 "
										}`}
										aria-hidden="true"
									/>
								</span>
							</Listbox.Button>
							<Transition
								as={Fragment}
								leave="transition ease-in duration-100"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<Listbox.Options className="z-10 pier-spotlight-actions absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-card py-1 border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-xs">
									{choices.map((choice, choiceIdx) => (
										<Listbox.Option
											key={choiceIdx}
											className={({ active }) =>
												`relative cursor-default select-none py-2 pl-2.5 pr-10 ${
													active ? "bg-content/5" : ""
												}`
											}
											value={choice}
										>
											{({ selected, active }) => (
												<>
													<span
														className={`block truncate text-xs font-semibold ${
															selected || active
																? ""
																: "text-content/50"
														}`}
													>
														{choice}
													</span>
													{selected ? (
														<span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
															<CheckIcon
																className="h-3.5 w-3.5"
																aria-hidden="true"
																strokeWidth={
																	2.8
																}
															/>
														</span>
													) : null}
												</>
											)}
										</Listbox.Option>
									))}
								</Listbox.Options>
							</Transition>
						</div>
					);
				}}
			</Listbox>
		</div>
	);
});
