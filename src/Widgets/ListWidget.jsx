import ListItem from "../components/ListItem";
import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";

function dateFromString(date) {
	const parsed = Date.parse(date);
	if (!isNaN(parsed)) {
		return parsed;
	}

	return Date.parse(date.replace(/-/g, "/").replace(/[a-z]+/gi, " "));
}

const formatDate = (
	value,
	formatting = { month: "short", day: "numeric", year: "numeric" }
) => {
	if (!value) return value;

	return new Intl.DateTimeFormat("en-US", formatting).format(
		new Date(dateFromString(value))
	);
};

const _parse = function (text, data) {
	let parsedText = text.split("::").map((t) => {
		t = t.trim();
		let [text, format] = t.split("|").map((t) => t.trim());
		text = _get(data, text);

		if (format === "date") return formatDate(text);

		return text;
	});

	return parsedText;
};

const _get = function (o, s) {
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

function isSameDay(d1, d2) {
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getDate() === d2.getDate() &&
		d1.getMonth() === d2.getMonth()
	);
}

const ListWidget = ({ widget, filters, orderBy }) => {
	const { isLoading, data: rawData } = useFetch({
		model: widget.model,
	});
	let props;
	try {
		props = JSON.parse(widget.props);
	} catch (error) {
		props = widget.props;
	}

	let data = [];
	if (rawData?.length) {
		data = !filters?.length
			? rawData
			: rawData.filter((entry) => {
					return filters.every((f) => {
						const [filter, value] = Object.entries(f)[0];
						return value.split("|").some((comparison) => {
							let value = _get(entry, filter);
							if (comparison.indexOf("today") !== -1) {
								const diff =
									(new Date(value).getTime() - Date.now()) /
									86400 /
									1000;

								const sameDay = isSameDay(
									new Date(),
									new Date(value)
								);

								if (comparison.indexOf("=") !== -1 && sameDay) {
									return true;
								}

								if (comparison.indexOf("<") !== -1) {
									if (sameDay) return false;

									return diff < 0;
								}

								if (comparison.indexOf(">") !== -1) {
									if (sameDay) return false;

									return diff > 0;
								}

								return (
									Math.abs(diff) < 1 &&
									new Date().getDate() ===
										new Date(value).getDate()
								);
							}

							return value === comparison;
						});
					});
			  });

		if (orderBy?.length) {
			data = data.sort((a, b) => {
				const v1 = _get(a, orderBy);
				const v2 = _get(b, orderBy);

				return v1.localeCompare(v2);

				// if (v1 > v2) return 1;
				// if (v2 > v1) return -1;

				// return 0;
			});
		}
	}

	return (
		<div>
			{isLoading ? (
				<div className="relative h-8">
					<Loader scrimColor="transparent" size={25} />
				</div>
			) : (
				<div className="pb-2">
					{data.map((entry, index) => {
						const image = _get(entry, props.image);
						const title = _get(entry, props.title);
						const subtitle = _parse(props.subtitle, entry);
						const leading = _get(entry, props.leading);
						const status = _get(entry, props.status);
						const action = _get(entry, props.action);

						return (
							<ListItem
								key={index}
								image={image}
								title={title}
								subtitle={subtitle}
								status={status}
								leading={leading}
								action={action}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ListWidget;
