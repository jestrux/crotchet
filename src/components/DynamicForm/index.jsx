import { useEffect, useRef, useState } from "react";
import FormField from "./FormField";
import { parseFields } from "../../utils";
import { useAppContext } from "../../providers/AppProvider";
import { useAirtableMutation } from "../../hooks/useAirtable";

export default function DynamicForm({ pane, onClose, onSubmit }) {
	const { withToast } = useAppContext();
	const { mutateAsync } = useAirtableMutation({
		table: pane.table,
		action: pane.data?._rowId ? "update" : "create",
	});
	const fields = parseFields(pane.fields, pane.data);
	const [data, setData] = useState(
		"data",
		Object.entries(pane.fields).reduce((agg, [key, { defaultValue }]) => {
			if (defaultValue && agg[key] === undefined) agg[key] = defaultValue;
			return agg;
		}, pane.data || {})
	);

	const formRef = useRef(null);
	const submitButtonRef = useRef();

	const handleSubmit = async (e) => {
		e.preventDefault();
		let newData = fields.reduce((agg, field) => {
			const formField = e.target[field.name];

			if (!formField) return agg;

			let value =
				field.type === "boolean"
					? formField?.checked
					: formField?.value;

			if (field.type === "authUser") value = [value];

			agg = { ...agg, [field.name]: value };

			return agg;
		}, {});
		const fieldKeys = Object.keys(pane.fields);
		const mergedValues = Object.entries(pane.data || {}).reduce(
			(agg, [key, value]) => {
				if (!fieldKeys.includes(key)) agg[key] = value;

				return agg;
			},
			newData
		);

		Object.entries(mergedValues).forEach(([key, value]) => {
			if (value === undefined) delete mergedValues[key];
		});

		const onSave = pane.table ? mutateAsync : pane.onSave;

		if (typeof onSave == "function") {
			try {
				const res = await withToast(
					Promise.resolve(onSave(mergedValues)),
					pane.successMessage || "Success!"
				);
				onClose(res);
			} catch (error) {
				console.log("Save error: ", error);
			}
		} else {
			onClose(mergedValues);
		}
	};

	if (typeof onSubmit == "function") {
		onSubmit(() => {
			submitButtonRef.current.click();
		});
	}

	useEffect(() => {
		const timeout = setTimeout(() => {
			const firstInput =
				formRef.current?.querySelector("input, textarea");
			if (firstInput) firstInput.focus();
		}, 20);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<form ref={formRef} id="theForm" onSubmit={handleSubmit}>
			<div className="flex flex-col gap-5">
				{fields.map((field, key) => {
					if (field.show && !field.show(data)) return null;

					return (
						<FormField
							key={key}
							field={field}
							onChange={(newProps) =>
								setData({ ...data, ...newProps })
							}
						/>
					);
				})}
			</div>

			<button ref={submitButtonRef} type="submit" className="hidden" />
		</form>
	);
}
