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
