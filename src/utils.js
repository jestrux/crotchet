export const randomId = () => Math.random().toString(36).slice(2);

export const isEmptyObj = (obj) => Object.keys(obj).length === 0;

export const dateFromString = (date) => {
	const parsed = Date.parse(date);
	if (!isNaN(parsed)) {
		return parsed;
	}

	return Date.parse(date.replace(/-/g, "/").replace(/[a-z]+/gi, " "));
};

export const formatDate = (
	value,
	formatting = { month: "short", day: "numeric", year: "numeric" }
) => {
	if (!value) return value;

	return new Intl.DateTimeFormat("en-US", formatting).format(
		new Date(dateFromString(value))
	);
};

export const _parse = function (text, data) {
	if (!text?.length) return "";

	let parsedText = text.split("::").map((t) => {
		t = t.trim();
		let [text, format] = t.split("|").map((t) => t.trim());
		text = _get(data, text);

		if (format === "date") return formatDate(text);

		return text;
	});

	return parsedText;
};

export const _get = function (o, s) {
	if (!o || !s) return null;

	s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
	s = s.replace(/^\./, ""); // strip a leading dot
	var a = s.split(".");
	for (var i = 0, n = a.length; i < n; ++i) {
		var k = a[i];
		if (k in o) {
			o = o[k];
		} else {
			return;
		}
	}
	return o;
};

export const simulateClick = (cb) => {
	const btn = document.createElement("button");
	btn.innerText = "Button";
	btn.style.display = "none";
	document.body.appendChild(btn);

	btn.addEventListener("click", cb);

	btn.click();

	setTimeout(() => {
		btn.remove();
	}, 200);
};

export const objectFieldChoices = (choices) =>
	choices.map((choice) => {
		const label = objectField(choice, "label");
		return {
			tempId: label,
			label: label,
			...(typeof choice == "object" ? choice : {}),
		};
	});

export const objectField = (object, field) => {
	return typeof object == "object" ? object?.[field] : object;
};

export const objectAsLabelValue = (object) => {
	return Object.entries(object).map(([label, value]) => ({ label, value }));
};

export const camelCaseToSentenceCase = (text) => {
	if (!text || !text.length) return "";
	const result = text.replace(/([A-Z]{1,})/g, " $1");
	return result.charAt(0).toUpperCase() + result.slice(1);
};

export const parseFields = (fields, data) => {
	if (!fields) return;

	return Object.entries(fields).map(([name, value]) => {
		let { type, label, choices, defaultValue, ...fieldProps } =
			typeof value == "object" ? value : { type: value };

		let dataValue = data?.[name];

		const computedDefaultValue = dataValue ?? defaultValue;

		if (choices && !choices.includes(computedDefaultValue))
			choices.push(computedDefaultValue);

		return {
			__id: "id" + randomId(),
			name,
			label: label || name,
			type,
			choices,
			defaultValue: computedDefaultValue,
			value: computedDefaultValue,
			...fieldProps,
		};
	});
};
