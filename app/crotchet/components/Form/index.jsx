import { Fragment, useEffect, useRef, useState } from "react";
import { useOnInit } from "@/crotchet/hooks";
import { Button } from "@/crotchet/components";
import FormField from "./FormField";
import parseFormFields from "./parseFormFields";

const fieldIsVisible = (field, data) => {
	if (!field) return false;

	const hiddenByData = field.show && !field.show(data);
	const invisibleField = field.type === "hidden";

	return !hiddenByData && !invisibleField;
};

export default function Form({
	onClose = () => {},
	fieldsRequired = true,
	horizontalLayout = false,
	formId,
	onChange,
	onSubmit,
	...props
}) {
	const [loading, setLoading] = useState(false);
	const allData = props.data
		? props.data
		: props.field && props.field.value
		? { formField: props.field.value }
		: {};
	const allFields = props.fields
		? props.fields
		: props.field
		? { formField: props.field }
		: {};
	const [fields] = useState(parseFormFields(allFields, allData));
	const [data, setData] = useState(
		Object.entries(allFields).reduce(
			(agg, [key, { defaultValue, value }]) => ({
				...agg,
				[key]: value ?? defaultValue,
			}),
			allData || {}
		)
	);

	const formRef = useRef(null);

	const processFieldValues = () => {
		const form = formRef.current;

		if (!form) return null;

		let newData = fields.reduce((agg, field) => {
			const formField = form[field.name];

			if (!formField || field.helper) return agg;

			let value = formField.value;

			if (field.type == "boolean") value = formField.checked;

			if (field.type == "radio" && field.multiple)
				value = value?.split(",");

			if (field.type == "preferences") {
				try {
					value = JSON.parse(value);
				} catch (error) {
					value = null;
				}
			}

			if (field.type === "authUser") value = [value];

			try {
				if (field.type === "keyvalue") value = JSON.parse(value);
			} catch (error) {
				//
			}

			if (typeof field.validate == "function" && !field.validate(value))
				throw `Invalid value for ${field.name}`;

			agg = { ...agg, [field.name]: value };

			return agg;
		}, {});
		const fieldKeys = Object.keys(allFields);
		const mergedValues = Object.entries(allData || {}).reduce(
			(agg, [key, value]) => {
				if (!fieldKeys.includes(key)) agg[key] = value;

				return agg;
			},
			newData
		);

		Object.entries(mergedValues).forEach(([key, value]) => {
			if (value === undefined) delete mergedValues[key];
		});

		const res =
			fieldKeys.length == 1 && fieldKeys[0] == "formField"
				? mergedValues.formField
				: mergedValues;

		return res;
	};

	const handleChange = () => {
		if (typeof onChange == "function") onChange(processFieldValues());
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const savedValues = processFieldValues();

		if (typeof onSubmit == "function") {
			try {
				setLoading(true);
				await onSubmit(savedValues);
				setLoading(false);
			} catch (error) {
				setLoading(false);
			}
		} else onClose(savedValues);

		// 	// try {
		// 	// 	const res = await withToast(
		// 	// 		Promise.resolve(onSubmit(mergedValues)),
		// 	// 		pane.successMessage || "Success!"
		// 	// 	);
		// 	// 	onClose(res);
		// 	// } catch (error) {
		// 	// 	console.log("Save error: ", error);
		// 	// }
		// } else {
		// 	onClose(mergedValues);
		// }
	};

	useOnInit(() => {
		handleChange();
	});

	useEffect(() => {
		const timeout = setTimeout(() => {
			const firstInput =
				formRef.current?.querySelector("input, textarea");
			if (firstInput) {
				firstInput.focus();
				if (Object.keys(allFields).length == 1) firstInput.select();
			}
		}, 20);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<form ref={formRef} id={formId} onSubmit={handleSubmit}>
			<div
				className={`grid grid-cols-12 items-start ${
					horizontalLayout ? "gap-6" : "gap-3"
				}`}
			>
				{fields.map((field, index) => {
					if (typeof field.show == "function" && !field.show(data))
						return null;

					const key =
						typeof field.key == "function" && field.key(data);

					let widthClass =
						{
							full: "col-span-12",
							half: "col-span-6",
							third: "col-span-4",
						}[field.width ?? "full"] || "col-span-12";

					return (
						<Fragment key={index}>
							{field?.group &&
								fields[index - 1]?.group !== field.group && (
									<div
										className={`col-span-12 flex items-center gap-3 -mx-5 mt-1 ${
											!field.noMargin &&
											!field.hideLabel &&
											"-mb-1.5"
										}`}
									>
										<span className="w-2 h-2 rounded-full bg-content/50"></span>

										<h5 className="text-content/50 py-1.5 pr-2 text-xs leading-none uppercase tracking-widest font-bold">
											{field.group}
										</h5>

										<span className="flex-1 border-t"></span>
									</div>
								)}
							<FormField
								horizontal={horizontalLayout}
								{...(key ? { key } : {})}
								className={` ${widthClass} ${
									field.noMargin && "-mt-3"
								}`}
								required={fieldsRequired}
								field={field}
								__data={data}
								onChange={(newProps) => {
									setData((data) => ({
										...data,
										...newProps,
									}));

									setTimeout(handleChange, 50);
								}}
							/>

							{field?.group &&
								!fields[index + 1]?.group &&
								fields[index + 1] &&
								fieldIsVisible(fields[index + 1], data) && (
									<hr className="col-span-12 mt-1 -mx-5" />
								)}
						</Fragment>
					);
				})}
			</div>

			<div className={formId ? "hidden" : "mt-5"}>
				<Button type="submit" loading={loading} className="w-full">
					{props.action?.label || "Submit"}
				</Button>
			</div>
		</form>
	);
}
