import { useState } from "react";
import { useAppContext } from "../../providers/AppProvider";
// import ReactTextareaAutosize from "react-textarea-autosize";
// import TextareaMarkdown from "textarea-markdown-editor";

const Switch = (props) => {
	return <input type="checkbox" {...props} />;
};

const Field = ({ field, value, onChange }) => {
	switch (field.type) {
		case "boolean":
			return (
				<div className="flex items-center gap-2">
					<Switch
						id={field.label}
						size="md"
						checked={value}
						onChange={onChange}
						name={field.name}
					/>

					<label
						className="inline-block first-letter:capitalize"
						htmlFor={field.label}
					>
						{field.label}
					</label>
				</div>
			);

		case "radio":
			return (
				<div
					className={`flex items-center flex-wrap ${
						typeof field.renderChoice == "function"
							? "gap-3"
							: "gap-6"
					}`}
				>
					{field.choices?.map((choice, index) => {
						if (!choice) return null;

						const choiceValue = choice?.value || choice;
						const selected = choiceValue === value;
						const customRenderer =
							typeof field.renderChoice == "function";

						return (
							<label key={index} className="cursor-pointer">
								<input
									className={
										customRenderer ? "hidden" : "inline"
									}
									type="radio"
									name={field.name}
									value={choiceValue}
									checked={selected}
									onChange={() => onChange(choiceValue)}
								/>

								{typeof field.renderChoice == "function"
									? field.renderChoice(choiceValue, selected)
									: choiceValue}
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

export default function FormField({ field, onChange = () => {} }) {
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

	return (
		<div>
			<div>
				{field.type !== "boolean" && (
					<label
						className="inline-block first-letter:capitalize"
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
