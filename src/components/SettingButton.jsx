import { useState } from "react";
import Switch from "./Switch";
import { camelCaseToSentenceCase } from "../utils";

export default function SettingButton({ label, value, onChange }) {
	const [_value, setValue] = useState(value);
	const handleChange = (newValue) => {
		setValue(newValue);
		onChange(newValue);
	};

	return (
		<label className="cursor-pointer hover:bg-content/5 px-3 py-2.5 rounded flex items-center justify-between gap-2 focus:outline-none">
			<span
				className="inline-block first-letter:capitalize"
				htmlFor={label}
			>
				{camelCaseToSentenceCase(label)}
			</span>

			<Switch
				checked={_value}
				value={_value}
				onChange={(e) => handleChange(e.target.checked)}
				name={label}
			/>
		</label>
	);
}
