import { useState } from "react";
import { useAppContext } from "../../providers/AppProvider";
import Switch from "../Switch";
import { camelCaseToSentenceCase } from "../../utils";
// import ReactTextareaAutosize from "react-textarea-autosize";
// import TextareaMarkdown from "textarea-markdown-editor";

const Field = ({ field, value, onChange }) => {
	const [focused, setFocused] = useState();

	switch (field.type) {
		case "boolean":
			return (
				<label
					htmlFor={field.label}
					className="cursor-pointer flex items-center gap-2"
					style={{
						...(field.meta?.rightAligned
							? {
									flexDirection: "row-reverse",
									justifyContent: "space-between",
							  }
							: {}),
					}}
				>
					<Switch
						id={field.label}
						size="md"
						checked={value}
						onChange={onChange}
						name={field.name}
					/>

					<span
						className="inline-block first-letter:capitalize"
						htmlFor={field.label}
					>
						{field.label}
					</span>
				</label>
			);

		case "radio":
			return (
				<div
					className={`flex items-center flex-wrap gap-1.5 ${
						typeof field.renderChoice == "function"
							? "gap-3s"
							: "gap-6s"
					}`}
				>
					{field.choices?.map((choice, index) => {
						if (!choice) return null;

						const choiceValue = choice?.value || choice;
						const selected = choiceValue === value;
						const hasFocus = choiceValue === focused;
						const customRenderer =
							typeof field.renderChoice == "function";

						return (
							<label
								key={index}
								className={`
							cursor-pointer border border-content/20 text-xs leading-none px-2 py-1.5 rounded relative
							${
								selected
									? "bg-content/10"
									: hasFocus
									? "border-content/50 bg-content/10"
									: "text-content/70"
							}
							`}
							>
								<input
									className="pointer-events-none opacity-0 absolute"
									type="radio"
									name={field.name}
									value={choiceValue}
									checked={selected}
									required={!field.optional}
									onChange={() => onChange(choiceValue)}
									onFocus={() => setFocused(choiceValue)}
								/>

								{typeof field.renderChoice == "function"
									? field.renderChoice(choiceValue, selected)
									: camelCaseToSentenceCase(choiceValue)}
							</label>
						);
					})}
				</div>
			);

		case "choice":
			return (
				<div>
					<select
						onChange={onChange}
						value={value}
						name={field.name}
						required={!field.optional}
					>
						<option value="">Choose one</option>
						{field.choices?.map((choice, index) => {
							if (!choice) return null;
							return (
								<option
									key={index}
									value={choice.value || choice}
									required={!field.optional}
								>
									{choice.label || choice}
								</option>
							);
						})}
					</select>
				</div>
			);

		default: {
			let fieldType = field.type || "text";
			if (["image"].includes(fieldType)) fieldType = "text";

			return (
				<input
					id={field.label}
					placeholder={field.placeholder}
					type={fieldType}
					size="md"
					name={field.name}
					value={value}
					onChange={onChange}
					required={!field.optional}
				/>
			);
		}
	}
};

export default function FormField({ className, field, onChange = () => {} }) {
	const { user } = useAppContext();
	const [value, setValue] = useState(field.value ?? field.defaultValue ?? "");
	const handleChange = (e) => {
		let value = e;
		if (e.target) {
			const el = e.target;
			value = ["checkbox", "radio"].includes(el.type)
				? el.checked
				: el.value;
		}

		setValue(value);
		onChange({ [field.name]: value });
	};

	if (field.type === "authUser")
		return (
			<input type="hidden" name={field.name} defaultValue={user._rowId} />
		);

	if (field.type === "hidden")
		return <input type="hidden" name={field.name} defaultValue={value} />;

	return (
		<div className={`${className}`}>
			<div>
				{field.type !== "boolean" && (
					<label
						className="inline-block first-letter:capitalize mb-1 pl-1"
						mb={0}
						htmlFor={field.label}
					>
						{field.label}
					</label>
				)}

				<Field field={field} value={value} onChange={handleChange} />
			</div>

			{field.hint && field.hint.length && (
				<p className="text-sm">
					Hint: <span className="opacity-75">{field.hint}</span>
				</p>
			)}
		</div>
	);
}
