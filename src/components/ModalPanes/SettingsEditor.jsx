import { useState } from "react";
import { camelCaseToSentenceCase } from "../../utils";
import FormField from "../DynamicForm/FormField";

export default function SettingsEditor({ pane }) {
	const [settings, setSettings] = useState(pane.settings);

	const updateSetting = (key, value) => {
		if (value === undefined) value = !settings[key];

		const newSettings = {
			...settings,
			[key]: value,
		};

		setSettings(newSettings);

		if (pane.onSave) pane.onSave({ [key]: value });
	};

	return (
		<div className="px-4 mt-5 mb-6 flex flex-col gap-5">
			{Object.keys(settings).map((field, index) => {
				const value = settings[field];

				return (
					<FormField
						key={index}
						field={{
							type: "boolean",
							name: field,
							label: camelCaseToSentenceCase(field),
							value,
						}}
						onChange={(val) => updateSetting(field, val[field])}
					/>
				);
			})}
		</div>
	);
}
