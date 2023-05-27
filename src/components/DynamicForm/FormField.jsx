import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../providers/AppProvider";
import Switch from "../Switch";
import { camelCaseToSentenceCase, objectField, randomId } from "../../utils";
import useDebounce from "../../hooks/useDebounce";
// import ReactTextareaAutosize from "react-textarea-autosize";
// import TextareaMarkdown from "textarea-markdown-editor";

const KeyValueInput = ({
	autoFocus,
	onAddRow,
	onRemoveRow,
	placeholder,
	defaultValue,
	onChange,
}) => {
	const [value, setValue] = useState(useRef(defaultValue).current);
	const debouncedValue = useDebounce(value, 500);

	useEffect(() => {
		onChange(debouncedValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);

	return (
		<input
			autoFocus={autoFocus}
			className="w-full py-1.5 px-3 placeholder:text-content/20"
			style={{
				textAlign: "left",
				outline: "none",
				border: "none",
				background: "transparent",
			}}
			placeholder={placeholder}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onKeyUp={(e) => {
				if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
					e.preventDefault();
					e.stopPropagation();
					onAddRow();
					return false;
				}

				if (e.key === "Backspace" && (e.metaKey || e.shiftKey)) {
					e.preventDefault();
					e.stopPropagation();
					onRemoveRow();
					return false;
				}
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			}}
		/>
	);
};

const KeyValueEditor = ({ editable = true, value, onChange, ...props }) => {
	const [_value, setValue] = useState("");
	const [entries, setEntries] = useState(Object.entries(value || { "": "" }));

	const onChangeEntry = ([newKey, newValue], updatedIndex) => {
		const newEntries = entries.map(([key, value, _id], index) => {
			if (!_id) _id = randomId();

			if (index === updatedIndex) return [newKey, newValue, _id];
			return [key, value, _id];
		});

		const newObject = newEntries.reduce((agg, [key, value]) => {
			return {
				...agg,
				[key]: value,
			};
		}, {});

		setEntries(newEntries);
		onChange(newObject);

		try {
			setValue(JSON.stringify(newObject));
		} catch (error) {}
	};

	const addRow = (index) => {
		if (index === entries.length - 1) {
			setEntries([...entries, ["", ""]]);
		}
	};

	const removeRow = (index) => {
		if (entries.length > 1)
			setEntries(entries.filter((_, i) => i !== index));
	};

	return (
		<div className="border border-content/20 rounded-md overflow-hidden">
			<input type="hidden" name={props.name} value={_value} readOnly />

			{entries.map(([key, val, _id], index) => {
				return (
					<div
						key={index + (_id ?? "")}
						className={`text-sm ${
							index < entries.length - 1 &&
							"border-b border-content/10"
						}`}
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1px 1fr",
						}}
					>
						<div
							className={`${
								!editable &&
								"bg-content/[0.04] text-content/50 pointer-events-none"
							}`}
						>
							{editable ? (
								<KeyValueInput
									autoFocus
									placeholder="key"
									defaultValue={key}
									onChange={(v) => {
										onChangeEntry([v, val], index);
									}}
									onAddRow={() => addRow(index)}
									onRemoveRow={() => removeRow(index)}
								/>
							) : (
								<span className="block py-1.5 px-3">{key}</span>
							)}
						</div>

						<div className="border-r border-content/10"></div>

						<div className="">
							<KeyValueInput
								autoFocus={!editable}
								placeholder="value"
								defaultValue={val}
								onChange={(v) => {
									onChangeEntry([key, v], index);
								}}
								onAddRow={() => addRow(index)}
								onRemoveRow={() => removeRow(index)}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};

const Field = ({ field, value, onChange }) => {
	const [focused, setFocused] = useState();

	switch (field.type) {
		case "keyvalue":
			return (
				<KeyValueEditor
					{...field}
					{...(field.meta || {})}
					value={value}
					onChange={onChange}
				/>
			);

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

						const choiceLabel = objectField(choice, "label");
						const choiceValue = objectField(choice, "value");
						const selected = choiceValue === value;
						const hasFocus = choiceValue === focused;
						const customRenderer =
							typeof field.renderChoice == "function";

						return (
							<label
								key={index}
								className={`
								hover:bg-content/10 cursor-pointer border border-content/20 text-xs leading-none px-2 py-1.5 rounded relative
							${
								selected
									? "bg-content/5 pointer-events-none"
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

								{customRenderer ? (
									field.renderChoice(choiceValue, selected)
								) : (
									<div className="inline-flex items-center gap-1.5 mr-0.5">
										<svg
											className={`w-3.5 h-3.5 ${
												selected
													? "text-primary"
													: "text-content/40"
											}`}
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<circle
												cx="12"
												cy="12"
												r="11"
												stroke="currentColor"
												fill={
													selected
														? "currentColor"
														: "none"
												}
												strokeWidth="2"
											/>

											{selected && (
												<path
													transform="translate(3 3) scale(0.7)"
													d="M4.5 12.75l6 6 9-13.5"
													stroke="white"
													fill="none"
													strokeWidth="3"
												/>
											)}
										</svg>
										{camelCaseToSentenceCase(choiceLabel)}
									</div>
								)}
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
						<option
							value=""
							disabled={
								!field.optional && value?.toString().length
							}
						>
							Choose one
						</option>
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
					autoFocus
					className="placeholder:text-content/20"
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

		// if (["fields", "filters"].includes(field.name))
		// 	console.log(field.name, value);

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
				{field.type !== "boolean" && !field.hideLabel && (
					<label
						className="inline-block first-letter:capitalize mb-1"
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
