import { camelCaseToSentenceCase, randomId } from "@/crotchet/utils";

export default function parseFormFields(fields, data) {
	if (!fields) return;

	return Object.entries(fields).map(([name, value]) => {
		let { type, label, choices, defaultValue, ...fieldProps } =
			typeof value == "object" ? value : { type: value };

		let dataValue = data?.[name];

		let computedDefaultValue = dataValue ?? defaultValue;

		if (!computedDefaultValue && type == "date")
			computedDefaultValue = window.moment(new Date()).format("y-MM-DD");

		// if (
		// 	choices &&
		// 	Array.isArray(choices) &&
		// 	!objectFieldChoices(choices)
		// 		.map(({ value }) => value)
		// 		.includes(computedDefaultValue)
		// )
		// 	choices.push(computedDefaultValue);

		if (["true", "false", true, false].includes(computedDefaultValue))
			type = "boolean";

		return {
			__id: randomId(),
			name,
			label: label ?? camelCaseToSentenceCase(name),
			type,
			choices,
			defaultValue: computedDefaultValue,
			value: computedDefaultValue,
			...fieldProps,
		};
	});
}
