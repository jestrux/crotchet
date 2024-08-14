import { useState } from "react";
import clsx from "clsx";

export default function Switch({ checked, ...props }) {
	const [_checked, setValue] = useState(checked);
	const [, setFocused] = useState(false);

	return (
		<label className="cursor-pointer flex justify-start items-center first-letter:uppercase text-content/10">
			<span
				className={clsx(
					"transition-colors w-10 bg-current rounded-full overflow-hidden relative flex items-center border border-current p-px",
					checked ? "text-primary" : "text-content/10"
				)}
			>
				<span
					className={clsx(
						"block rounded-full bg-white size-5 transition-transform",
						{ "translate-x-4": checked }
					)}
				></span>
			</span>

			<input
				{..._.omit(props, ["type", "value"])}
				type="checkbox"
				className="pointer-events-none opacity-0 absolute"
				defaultChecked={_checked}
				onChange={(e) => {
					const newValue = e.target.checked;
					setValue(newValue);
					typeof props.onChange == "function" &&
						props.onChange(newValue);
				}}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>
		</label>
	);
}
