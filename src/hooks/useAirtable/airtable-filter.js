function isSameDay(d1, d2) {
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getDate() === d2.getDate() &&
		d1.getMonth() === d2.getMonth()
	);
}

function replaceMultiple(str, matches, replacement) {
	matches.forEach((match) => {
		str = str.replace(new RegExp(match, "g"), replacement);
	});

	return str;
}

function dataFilterer(field, comparison) {
	if (field === undefined || comparison === undefined) return "";

	if (comparison.indexOf("today") !== -1)
		comparison = comparison.replace("today", Date.now());

	if (comparison.indexOf("!") !== -1)
		return `NOT(${field} = '${comparison.replace("!", "")}')`;

	const actualComparison = replaceMultiple(
		comparison,
		["<", ">", "="],
		""
	).trim();

	if (comparison.indexOf("<=") !== -1) comparison = "<=";
	else if (comparison.indexOf(">=") !== -1) comparison = ">=";
	else if (comparison.indexOf("<") !== -1) comparison = "<";
	else if (comparison.indexOf(">") !== -1) comparison = ">";
	else comparison = "=";

	return `${field} ${comparison} '${actualComparison}'`;
}

export default function airtableFilter(filters) {
	let _filters = Object.entries(filters || {}).map(([field, filter]) => {
		const hasAnd = filter.indexOf("&") !== -1;
		const hasOr = filter.indexOf("|") !== -1;
		const wrapperCondition = () => {
			if (!hasAnd && !hasOr) return dataFilterer(field, filter);

			const chunks = filter
				.split(hasAnd ? "&" : "|")
				.map((filter) => dataFilterer(field, filter))
				.join(",");

			return `${hasAnd ? "AND" : "OR"}(${chunks})`;
		};

		const filterString = wrapperCondition();

		return filterString;
	});

	if (!_filters?.length) return "";

	return _filters.length > 1 ? `AND(${_filters.join(", ")})` : _filters[0];
}
