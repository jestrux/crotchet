import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { matchSorter } from "match-sorter";
import ReactTextareaAutosize from "react-autosize-textarea";
import parseFormFields from "./parseFormFields";

import {
	camelCaseToSentenceCase,
	loadExternalAsset,
	objectField,
	objectFieldChoices,
	randomId,
	someTime,
} from "@/crotchet/utils";
import {
	useDebounce,
	useThrottle,
	useOnInit,
	useEventListener,
	useDataLoader,
} from "@/crotchet/hooks";
import { Loader, Switch } from "@/crotchet/components";
import ThemeBg from "@/DesktopApp/ThemeBg";
import ActionGrid from "../ActionGrid";

function useSearch(data, term) {
	const throttledTerm = useThrottle(term, 100);

	return useMemo(
		() => (!data || term.trim() === "" ? data : matchSorter(data, term)),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[throttledTerm, data]
	);
}

const useDefferedValue = (__value, { defaultValue, args } = {}) => {
	const { data, isLoading } = useDataLoader({
		handler: async () => {
			if (!__value) return null;

			if (typeof __value == "function") return await __value(args);

			return __value;
		},
		initialData: defaultValue,
	});

	return { data, isLoading };
};

const KeyValueInput = ({
	choices: _choices,
	focused,
	defaultValue,
	onChange,
}) => {
	const inputRef = useRef();
	const [searchQuery] = useState("");
	const [value, setValue] = useState(useRef(defaultValue).current);
	const debouncedValue = useDebounce(value, 500);
	const { data: allChoices } = useDefferedValue(_choices, {
		args: value,
	});
	const choices = useSearch(allChoices, searchQuery);

	useEffect(() => {
		onChange(debouncedValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue]);

	useEffect(() => {
		if (focused && inputRef.current) {
			setTimeout(() => {
				inputRef.current.focus();
			}, 100);
		}
	}, [focused]);

	return (
		<select
			ref={inputRef}
			className="unstyled border-none bg-transparent w-full py-1.5 px-3 placeholder:text-content/20"
			value={value}
			onChange={(e) => {
				const v = e.target.value;

				setValue(v);
				onChange(v);
			}}
		>
			<option value=""></option>
			{choices &&
				choices.map((choice, index) => (
					<option className="py-1 px-3" key={index} value={choice}>
						{choice}
					</option>
				))}
		</select>
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
	const { data: choices } = useDefferedValue(_choices, {
		args: { data: __data },
		label: "Choices",
	});
	const { data: schema } = useDefferedValue(_schema, {
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
		} catch (error) {
			//
		}
	};

	const addRow = (index) => {
		if (index != undefined && index != entries.length - 1) return;

		setEntries([...entries, ["", ""]]);
		setFocusedRow(entries.length);
	};

	const removeRow = (index) => {
		if (entries.length > 1) {
			setEntries(entries.filter((_, i) => i !== index));
			setFocusedRow(index - 1);
		}
	};

	const filteredChoices = (choices, usedChoices, value) => {
		return [
			...new Set([
				...choices.filter((choice) => !usedChoices.includes(choice)),
				...(!value?.length || !choices.includes(value) ? [] : [value]),
			]),
		];
	};

	const entryKeys = entries.map(([key]) => key);
	const entryValues = entries.map(([, value]) => value);
	const keyChoices = (value) =>
		!schema ? null : filteredChoices(Object.keys(schema), entryKeys, value);

	return (
		<div>
			<input type="hidden" name={props.name} value={_value} readOnly />

			<div className="border border-content/20 rounded-md">
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
										focused={index == focusedRow}
										placeholder="key"
										defaultValue={key}
										choices={keyChoices(key)}
										onChange={(v) => {
											const resetValue =
												schema && choices;
											onChangeEntry(
												[v, resetValue ? "" : val],
												index
											);
										}}
										onAddRow={() => addRow(index)}
										onRemoveRow={() => removeRow(index)}
									/>
								) : (
									<span className="block py-1.5 px-3">
										{key}
									</span>
								)}
							</div>

							<div className="border-r border-content/10"></div>

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
					);
				})}
			</div>

			<div className="mt-3">
				<button
					type="button"
					className="text-primary inline-flex items-center gap-2 text-sm/none"
					onClick={() => addRow()}
				>
					<svg
						className="size-4"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 4.5v15m7.5-7.5h-15"
						/>
					</svg>
					Add Row
				</button>
			</div>
		</div>
	);
};

const PreferencesEditor = ({
	name,
	value: data,
	fields: _fields,
	onChange,
}) => {
	const [gridKey, setGridKey] = useState(randomId());
	const [fields, setFields] = useState(parseFormFields(_fields, data));
	const handleFieldClick = async (field) => {
		let value = data[field.name];
		let newValue;

		if (field.type == "radio") {
			newValue = await window.openChoicePicker({
				choices: objectFieldChoices(field.choices).map((choice) => {
					choice.selected = field.multiple
						? value.includes(choice.value)
						: value == choice.value;
					return choice;
				}),
			});
		}

		if (!newValue || newValue == value) return;

		const updatedData = {
			...data,
			[field.name]: newValue,
		};

		onChange(updatedData);
		setFields(parseFormFields(_fields, updatedData));

		setGridKey(randomId());
	};

	return (
		<>
			<input
				type="hidden"
				name={name}
				value={JSON.stringify(data || {})}
				readOnly
			/>
			<ActionGrid
				type="inline"
				key={gridKey}
				data={fields.map((field) => {
					let trailing = field.value;
					const selectedChoice = field.choices?.find(
						(c) => c.value == field.value
					);
					if (selectedChoice) trailing = selectedChoice.label;

					field.trailing = trailing;
					field.handler = () => handleFieldClick(field);
					return field;
				})}
			/>
		</>
	);
};

const Select = ({ value, name, optional, choices: _choices, onChange }) => {
	const { data: choices, isLoading } = useDefferedValue(_choices);
	return (
		<div className="relative">
			<select
				onChange={onChange}
				value={value}
				name={name}
				required={!optional}
				disabled={isLoading}
			>
				<option value="" disabled={!optional}>
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
							{camelCaseToSentenceCase(choice.label || choice)}
						</option>
					);
				})}
			</select>

			{isLoading && (
				<div className="absolute right-2 inset-y-2 bg-card flex items-center justify-center">
					<Loader size={24} className="opacity-20" />
				</div>
			)}
		</div>
	);
};

const ImageField = ({ value, name, meta, optional, onChange }) => {
	const defaultState = {
		preview: null,
		value: null,
		isFace: meta?.isFace,
		uploading: false,
		uploadPercent: 0,
		error: "There was an error when uploading the file.",
	};
	const [
		{ error, value: _value, preview: _preview, uploadPercent },
		setData,
	] = useState({ ...defaultState, value });
	const preview = _value || _preview;
	const refId = useRef(randomId());
	const previewRef = useRef(null);
	const uploaderRef = useRef(null);
	const elRef = useRef(null);

	const handleChange = (data = {}) => {
		if (data?.preview) previewRef.current = data.preview;
		setData((oldData) => ({ ...oldData, ...data, value: data.src }));
		if (data?.src) onChange(data.src);
	};

	const handleReset = (e) => {
		e.stopPropagation();
		setData(defaultState);
	};

	const loadUploader = async () => {
		try {
			await loadExternalAsset(
				"https://raw.githubusercontent.com/jestrux/file-uploader/main/dist/file-uploader.umd.cjs"
			);

			uploaderRef.current = window.FileUploader(elRef.current, {
				uploadUrl: meta?.uploadUrl,
				s3: meta?.s3,
				onChange: handleChange,
				upload: async () => {
					await someTime(200);
					return previewRef.current;
				},
			});

			elRef.current.setAttribute("data-initialized", true);
		} catch (error) {
			console.log("Failed to load editor: ", error);
		}
	};

	useOnInit(() => {
		loadUploader();
	});

	return (
		<div className="group w-full relative -mt-1" ref={elRef}>
			<ThemeBg
				overlay
				className="hidden group-data-[initialized=true]:flex h-16 items-center bg-card border border-content/20 relative rounded-lg overflow-hidden"
			>
				<div
					className={clsx(
						"absolute inset-0 flex flex-col items-center justify-center border-[3px] border-dashed border-transparent group-data-[dragover=true]:border-content/10",
						preview
							? "hidden"
							: "hidden group-data-[status=idle]:flex group-data-[status=success]:flex"
					)}
				>
					<span className="opacity-40 group-data-[dragover=true]:opacity-80 transition text-sm">
						Drop your file here to upload it.
					</span>

					<label
						className="cusror-pointer relative text-sm/none text-primary px-1.5 py-1"
						onClick={() =>
							document.body.classList.add(
								`get-file-${refId.current}`
							)
						}
					>
						or select a file
						<input type="file" hidden />
					</label>
				</div>

				<div className="hidden group-data-[status=loading]:flex flex-col pt-1 gap-1.5 items-center justify-center absolute inset-0">
					<svg
						className="animate-spin size-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="2"
						stroke="currentColor"
					>
						<circle className="opacity-25" cx="12" cy="12" r="11" />
						<circle
							cx="12"
							cy="12"
							r="11"
							strokeDasharray="100"
							strokeDashoffset="80"
						/>
					</svg>

					<div className="text-xs uppercase tracking-widest opacity-50">
						Uploading...
						{uploadPercent ? `${uploadPercent}%` : ""}
					</div>
				</div>

				<div className="hidden group-data-[status=error]:flex flex-col gap-1.5 items-center justify-center absolute inset-0 text-center bg-red-100 text-red-900">
					<div className="size-8 bg-black/10 rounded-full flex items-center justify-center">
						<svg
							className="size-4 mb-0.5"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
						</svg>
					</div>
					<p className="text-black/70 text-sm">{error}</p>
					<button
						type="button"
						onClick={handleReset}
						className="absolute z-10 right-1 top-1 size-8 rounded-full opacity-50 hover:opacity-80 transition flex items-center justify-center"
					>
						<svg
							className="w-6 h-6 text-black"
							viewBox="0 0 24 24"
							fill="currentColor"
							style={{
								filter: "drop-shadow(0 0 2px rgba(0,0,0,0.3))",
							}}
						>
							<path
								fillRule="evenodd"
								d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>

				<a
					href={preview}
					target="_blank"
					title={preview}
					className={clsx(
						"group relative p-1 h-full overflow-hidden flex items-center gap-1.5",
						!preview
							? "hidden"
							: "hidden group-data-[status=idle]:flex group-data-[status=success]:flex"
					)}
					rel="noreferrer"
				>
					<div
						className={clsx(
							"h-full aspect-[1/1] flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-content/10",
							meta?.isFace ? "rounded-full" : "rounded"
						)}
					>
						<img
							src={preview}
							alt=""
							className="absolute inset-0 size-full object-cover"
						/>
					</div>
					<div className="min-w-0 space-y-2">
						<h3 className="text-sm/none truncate">{preview}</h3>
						<p className="text-xs/none truncate opacity-50">
							( Click to see image )
						</p>
					</div>

					<button
						type="button"
						onClick={handleReset}
						className="absolute z-10 right-1 top-1 opacity-0 group-hover:opacity-50 hover:opacity-80 transition flex items-center justify-center"
					>
						<svg
							className="w-5 h-5"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</a>
			</ThemeBg>

			<ReactTextareaAutosize
				type="text"
				name={name}
				className="group-data-[initialized=true]:hidden"
				value={value}
				required={!optional}
			/>
		</div>
	);
};

const ContentEditableField = ({ value, name, optional, onChange }) => {
	const editorRef = useRef(null);
	const textareaRef = useRef(null);
	const handleChange = (cm) => {
		const value = cm.getValue();
		onChange(value);
		textareaRef.current.value = value;
	};

	const setTheme = () => {
		editorRef.current.setOption(
			"theme",
			document.body.classList.contains("dark") ? "bongzilla" : "default"
		);
	};

	const loadEditor = async () => {
		try {
			await loadExternalAsset(
				"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.35.0/codemirror.js"
			);
			await Promise.all(
				[
					"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.35.0/codemirror.css",
					"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.35.0/mode/javascript/javascript.js",
					"https://cdn.jsdelivr.net/npm/code-mirror-themes@1.0.0/themes/bongzilla.min.css",
				].map((item) =>
					loadExternalAsset(item, {
						name: "codemirror-resource-" + item.split("/").at(-1),
					})
				)
			);

			editorRef.current = window.CodeMirror.fromTextArea(
				textareaRef.current,
				{
					mode: "javascript",
					lineNumbers: true,
					onChange: handleChange,
				}
			);
			editorRef.current.setSize("auto", "auto");
			setTheme();
		} catch (error) {
			console.log("Failed to load editor: ", error);
		}
	};

	useEventListener("theme-changed", setTheme);

	useOnInit(() => {
		loadEditor();
	});

	return (
		<div className="w-full">
			<textarea
				name={name}
				ref={textareaRef}
				className="w-full min-h-screen"
				defaultValue={value}
				required={!optional}
			></textarea>
		</div>
	);
};

const Field = ({ field, value, onChange, __data }) => {
	const [focused, setFocused] = useState();

	switch (field.type) {
		case "preferences":
			return (
				<PreferencesEditor
					{...field}
					{...(field.meta || {})}
					value={value}
					onChange={onChange}
					__data={__data}
				/>
			);

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
				<div className="pt-2">
					<label
						htmlFor={field.name}
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
							id={field.name}
							size="md"
							checked={value}
							onChange={onChange}
							name={field.name}
						/>

						<span
							className="inline-block first-letter:capitalize"
							htmlFor={field.name}
						>
							{camelCaseToSentenceCase(field.label)}
						</span>
					</label>
				</div>
			);

		case "radio": {
			return (
				<>
					<ActionGrid
						type="inline"
						smallTitle={true}
						data={objectFieldChoices(field.choices).map(
							(choice) => {
								choice.selected = field.multiple
									? value.includes(choice.value)
									: value == choice.value;
								return choice;
							}
						)}
						sortable={field.sortable}
						selectable={field.multiple ? "multiple" : "single"}
						onChange={(choices) => {
							const values = _.filter(choices, "selected").map(
								({ value }) => value
							);
							onChange(field.multiple ? values : values?.[0]);
						}}
					/>
					<input type="hidden" name={field.name} value={value} />
				</>
			);
			if (field.choiceType == "color") {
				field.renderChoice = (choice, selected) => {
					return `
					<span class="rounded-full bg-gray-500 inline-block p-0.5" style="width: 30px; height: 30px; background: ${choice}">
						<span class="border-2 border-${
							selected ? "white" : "transparent"
						} rounded-full w-full h-full block"></span>
					</span>
				`;
				};
			}

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
						let choiceRender;

						if (customRenderer) {
							choiceRender = customRenderer
								? field.renderChoice(choiceValue, selected)
								: null;

							if (typeof choiceRender == "string") {
								choiceRender = (
									<div
										dangerouslySetInnerHTML={{
											__html: choiceRender,
										}}
									></div>
								);
							}
						}

						return (
							<label
								key={index}
								className={clsx(
									customRenderer
										? ""
										: "hover:bg-content/10 cursor-pointer border border-content/20 text-xs leading-none px-2 py-1.5 rounded relative",
									customRenderer
										? ""
										: selected
										? "bg-content/10 pointer-events-none"
										: hasFocus
										? "border-content/50 bg-content/10"
										: "text-content/70"
								)}
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
									choiceRender
								) : (
									<div className="inline-flex items-center gap-1.5 mr-0.5">
										<svg
											className={`w-3.5 h-3.5 ${
												selected
													? "text-primary dark:text-white"
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
													className="text-on-primary dark:text-black"
													transform="translate(3 3) scale(0.7)"
													d="M4.5 12.75l6 6 9-13.5"
													stroke="currentColor"
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
		}

		case "choice":
			return (
				<Select
					{...field}
					{...(field.meta || {})}
					value={value}
					onChange={onChange}
				/>
			);

		case "contentEditable":
			return (
				<ContentEditableField
					{...field}
					{...(field.meta || {})}
					value={value}
					onChange={onChange}
				/>
			);

		case "image":
			return (
				<ImageField
					{...field}
					{...(field.meta || {})}
					value={value}
					onChange={onChange}
				/>
			);

		default: {
			let fieldType = field.type || "text";
			if (["image"].includes(fieldType)) fieldType = "text";

			if (fieldType == "long text") {
				return (
					<ReactTextareaAutosize
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

			const meta = field.meta || {};

			return (
				<input
					className={clsx(
						"block bg-transparent",
						meta?.flat
							? "border-none shadow-none text-lg placeholder:text-content/25"
							: "placeholder:text-content/20",
						meta.bold
							? "font-semibold"
							: meta.flat
							? "font-medium"
							: ""
					)}
					id={field.name}
					placeholder={field.placeholder}
					type={fieldType}
					size="md"
					name={field.name}
					value={value}
					onChange={onChange}
					required={!field.optional}
					style={
						!field.meta?.flat
							? {}
							: {
									border: "none",
									boxShadow: "none",
							  }
					}
				/>
			);
		}
	}
};

export default function FormField({
	className,
	__data,
	required,
	field,
	horizontal,
	onChange = () => {},
}) {
	field.optional = field.optional ?? !(field.required ?? required);
	const [value, setValue] = useState(field.value ?? field.defaultValue ?? "");
	const handleChange = (e) => {
		let value = e;
		if (e?.target) {
			const el = e.target;
			value = ["checkbox", "radio"].includes(el.type)
				? el.checked
				: el.value;
		}

		setValue(value);
		onChange({ [field.name]: value });
	};

	useEffect(() => {
		setValue(field.value ?? field.defaultValue ?? "");
	}, [field.__id]);

	if (field.type === "hidden")
		return <input type="hidden" name={field.name} defaultValue={value} />;

	return (
		<div className={`@container  ${className}`}>
			<div
				className={`flex flex-col gap-px ${
					horizontal
						? "@lg:grid grid-cols-12 @lg:gap-3 @lg:items-center"
						: ""
				}`}
			>
				{horizontal && <div className="col-span-1"></div>}
				{field.type !== "boolean" && !field.hideLabel && (
					<label
						className={`inline-block first-letter:capitalize ${
							horizontal
								? "col-span-3 text-right text-sm leading-tight"
								: ""
						}`}
						htmlFor={field.name}
					>
						{camelCaseToSentenceCase(field.label)}
					</label>
				)}

				<div className="col-span-6">
					<Field
						__data={__data}
						field={field}
						value={value}
						onChange={handleChange}
					/>
				</div>
				{horizontal && <div className="col-span-2"></div>}
			</div>

			{field.hint && field.hint.length && (
				<p className="text-sm">
					Hint: <span className="opacity-75">{field.hint}</span>
				</p>
			)}
		</div>
	);
}
