import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../../providers/AppProvider";
import Switch from "../Switch";
import { camelCaseToSentenceCase, objectField, randomId } from "../../utils";
import useDebounce from "../../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
// import ReactTextareaAutosize from "react-textarea-autosize";
// import TextareaMarkdown from "textarea-markdown-editor";

import {
	Combobox,
	ComboboxInput,
	ComboboxPopover,
	ComboboxList,
	ComboboxOption,
} from "@reach/combobox";
import { useThrottle } from "../../hooks/useThrottle";
import { matchSorter } from "match-sorter";

function useSearch(data, term) {
	const throttledTerm = useThrottle(term, 100);

	return useMemo(
		() => (!data || term.trim() === "" ? data : matchSorter(data, term)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[throttledTerm, data]
	);
}

const useDefferedValue = (
	__value,
	{ defaultValue, dependencies, args } = {}
) => {
	const { current: _id } = useRef(randomId());
	const { data } = useQuery(
		[
			_id,
			__value,
			JSON.stringify(args),
			...[dependencies ? dependencies : []],
		],
		async () => {
			if (!__value) return null;

			if (typeof __value == "function") return await __value(args);

			return __value;
		},
		{
			cacheTime: 0,
			initialData: defaultValue,
		}
	);

	return data;
};

const supportedKeyValueFieldTypes = [
	"text",
	"email",
	"url",
	// "password",
	// "number",
	"date",
	// "datetime-local",
	// "month",
	// "search",
	// "tel",
	// "time",
	// "week",
	// "checkbox",
	// "radio",
];

const KeyValueInput = ({
	choices: _choices,
	fieldProps,
	focused,
	onAddRow,
	onRemoveRow,
	placeholder,
	defaultValue,
	onChange,
}) => {
	const inputRef = useRef();
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [value, setValue] = useState(useRef(defaultValue).current);
	const debouncedValue = useDebounce(value, 500);
	const allChoices = useDefferedValue(_choices, {
		args: value,
	});
	const choices = useSearch(allChoices, searchQuery);

	useEffect(() => {
		onChange(debouncedValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);

	useEffect(() => {
		if (focused) inputRef.current.focus();
	}, [focused]);

	const disableKeyAction = (e) => {
		e.preventDefault();
		e.stopPropagation();
		return false;
	};

	return (
		<Combobox
			className="relative"
			openOnFocus
			onSelect={(v) => {
				setValue(v);
				onChange(v);
				setTimeout(() => {
					if (inputRef.current) inputRef.current.blur();
				}, 20);
			}}
		>
			<ComboboxInput
				ref={inputRef}
				className="w-full py-1.5 px-3 placeholder:text-content/20"
				type={
					fieldProps?.type &&
					supportedKeyValueFieldTypes.includes(fieldProps.type)
						? fieldProps.type
						: "text"
				}
				style={{
					textAlign: "left",
					outline: "none",
					border: "none",
					background: "transparent",
				}}
				placeholder={placeholder}
				value={value}
				onFocus={() => {
					setShowSuggestions(true);
					setSearchQuery("");
				}}
				onChange={(e) => {
					setValue(e.target.value);
					setSearchQuery(e.target.value);
				}}
				onKeyUp={(e) => {
					if (e.key === "Escape") return disableKeyAction(e);

					if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
						onAddRow();
						return disableKeyAction(e);
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
						const state = e.target.getAttribute("data-state");
						if (state != "navigating") e.preventDefault();
						e.stopPropagation();
						return false;
					}

					if (e.key === "Backspace" && e.target.value.trim() === "") {
						onRemoveRow();
						return disableKeyAction(e);
					}
				}}
			/>

			{choices && showSuggestions && (
				<ComboboxPopover
					id="popoverContent"
					portal={false}
					className="absolute z-[999] rounded overflow-y-auto bg-popup border border-content/10 shadow w-full min-h-[35px] max-h-[160px] focus:outline-none"
				>
					<span className="block text-sm opacity-40 mt-2 mb-0.5 px-3">
						{choices.length ? "Select one" : "No matches"}
					</span>
					<ComboboxList>
						{choices.map((choice, index) => (
							<ComboboxOption
								className="py-1 px-3"
								key={index}
								value={choice}
							/>
						))}
					</ComboboxList>
				</ComboboxPopover>
			)}
		</Combobox>
	);
};

const KeyValueEditor = ({
	__data,
	editable = true,
	value,
	schema: _schema,
	choices: _choices,
	onChange,
	...props
}) => {
	const choices = useDefferedValue(_choices, {
		args: { data: __data },
		label: "Choices",
	});
	const schema = useDefferedValue(_schema, {
		args: __data,
	});
	const [focusedRow, setFocusedRow] = useState(-1);
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
			setFocusedRow(entries.length);
		}
	};

	const removeRow = (index) => {
		if (entries.length > 1) {
			setEntries(entries.filter((_, i) => i !== index));
			setFocusedRow(index - 1);
		}
	};

	const filteredChoices = (choices, usedChoices, value) => {
		return [
			...choices.filter((choice) => !usedChoices.includes(choice)),
			...(!value?.length ? [] : [value]),
		].sort();
	};

	const entryKeys = entries.map(([key]) => key);
	const entryValues = entries.map(([, value]) => value);

	return (
		<div className="border border-content/20 rounded-md">
			<input type="hidden" name={props.name} value={_value} readOnly />

			{entries.map(([key, val, _id], index) => {
				let fieldProps;
				if (schema?.[key] != undefined) {
					fieldProps = schema[key];
					fieldProps =
						typeof fieldProps == "object"
							? fieldProps
							: { type: fieldProps };
				}

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
									role="key"
									focused={index == focusedRow}
									placeholder="key"
									defaultValue={key}
									choices={
										!schema
											? null
											: (value) =>
													filteredChoices(
														Object.keys(schema),
														entryKeys,
														value
													)
									}
									onChange={(v) => {
										const resetValue = schema && choices;
										onChangeEntry(
											[v, resetValue ? "" : val],
											index
										);
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
								role="value"
								{...(!choices && fieldProps
									? { fieldProps }
									: {})}
								{...(schema && choices ? { key } : {})}
								choices={
									!choices
										? null
										: (value) =>
												filteredChoices(
													choices,
													entryValues,
													value
												)
								}
								focused={index == focusedRow && !editable}
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

const Select = ({ value, name, optional, choices: _choices, onChange }) => {
	const choices = useDefferedValue(_choices);
	return (
		<div>
			<select
				onChange={onChange}
				value={value}
				name={name}
				required={!optional}
			>
				<option
					value=""
					disabled={!optional}
					// disabled={!optional && value?.toString().length}
				>
					Choose one
				</option>
				{choices?.map((choice, index) => {
					if (!choice) return null;
					return (
						<option
							key={index}
							value={choice.value || choice}
							required={!optional}
						>
							{choice.label || choice}
						</option>
					);
				})}
			</select>
		</div>
	);
};

const Field = ({ field, value, onChange, __data }) => {
	const [focused, setFocused] = useState();

	switch (field.type) {
		case "keyvalue":
			return (
				<KeyValueEditor
					{...field}
					{...(field.meta || {})}
					value={value}
					onChange={onChange}
					__data={__data}
				/>
			);

		case "boolean":
			return (
				<div>
					<label
						htmlFor={field.label}
						className="cursor-pointer inline-flex items-center gap-2"
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
				</div>
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
				<Select
					{...field}
					{...(field.meta || {})}
					value={value}
					onChange={onChange}
				/>
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

export default function FormField({
	className,
	__data,
	field,
	onChange = () => {},
}) {
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
						htmlFor={field.label}
					>
						{field.label}
					</label>
				)}

				<Field
					__data={__data}
					field={field}
					value={value}
					onChange={handleChange}
				/>
			</div>

			{field.hint && field.hint.length && (
				<p className="text-sm">
					Hint: <span className="opacity-75">{field.hint}</span>
				</p>
			)}
		</div>
	);
}
