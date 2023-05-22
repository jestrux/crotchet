import { useState } from "react";

export default function Switch({ type, value, checked, ...props }) {
	const [_checked, setValue] = useState(checked);
	const [focused, setFocused] = useState(false);

	return (
		<label
			className={`${
				_checked ? "text-primary" : "text-transparent"
			} focus-within:ring-[3px] border border-current overflow-hidden relative flex items-center bg-neutral-200 dark:bg-neutral-700 rounded-full`}
			style={{
				height: "20px",
				width: "34px",
			}}
		>
			<span
				className="transition-all rounded-l-full h-full bg-current"
				style={{
					opacity: _checked ? 1 : 0,
					width: _checked ? "100%" : 0,
				}}
			></span>

			<span className="transition-all flex-shrink-0 py-px px-px rounded-r-full bg-current h-full flex">
				<span className="transition-all h-full aspect-square rounded-full bg-white border border-content/10"></span>
			</span>

			<input
				{...props}
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
