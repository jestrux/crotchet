import { useRef, useState } from "react";
import Switch from "./Switch";
import { camelCaseToSentenceCase } from "../utils";
import ComboboxItem from "./ComboboxItem";

export default function SettingButton({ label, value, onChange }) {
	const labelRef = useRef();
	const [_value, setValue] = useState(value);
	const handleChange = (newValue) => {
		setValue(newValue);
		onChange(newValue);
	};

	return (
		<ComboboxItem
			label={camelCaseToSentenceCase(label)}
			value={label}
			onSelect={() => labelRef.current.click()}
			trailing={
				<label ref={labelRef}>
					<Switch
						checked={_value}
						value={_value}
						onChange={handleChange}
						name={label}
					/>
				</label>
			}
		/>
	);
}
