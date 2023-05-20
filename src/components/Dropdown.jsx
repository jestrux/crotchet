import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function Dropdown({
	children,
	className = "",
	options = [],
	onSelect = () => {},
}) {
	return (
		<Listbox>
			<div className={`${className} relative mr-3`}>
				<Listbox.Button className="focus:outline-none">
					{children}
				</Listbox.Button>

				<Transition
					as={Fragment}
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<Listbox.Options className="z-10 absolute right-0 mt-1 max-h-60 w-[200px] overflow-auto rounded-lg bg-card py-1 border border-content/10 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-xs">
						{options.map((option, index) => (
							<Listbox.Option
								key={index}
								className="text-content/80 px-5 py-2 hover:bg-content/5 transition-colors cursor-pointer"
								onClick={() => onSelect(option, index)}
							>
								{option}
							</Listbox.Option>
						))}
					</Listbox.Options>
				</Transition>
			</div>
		</Listbox>
	);
}
