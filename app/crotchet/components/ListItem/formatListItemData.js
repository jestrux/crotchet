import { formatDate, toHms } from "@/utils";

export const _format = function (data, t) {
	try {
		t = t.trim();
		let [text, format] = t.split("|").map((t) => t.trim());
		text = _get(data, text);

		if (format === "date") return formatDate(text);

		if (format === "time") return toHms(text);

		if (format === "cleanString")
			return text.replaceAll("-", " ").replaceAll("_", " ");

		return text;
	} catch (error) {
		//
	}
};

export const _parse = function (text, data) {
	if (!text?.length) return "";

	let parsedText = text.split("::").map((t) => {
		return _format(data, t);
	});

	return parsedText;
};

export const _get = function (o, _s) {
	if (!o || !_s) return null;

	let s = _s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
	s = s.replace(/^\./, ""); // strip a leading dot
	var a = s.split(".");
	var matched = false;
	for (var i = 0, n = a.length; i < n; ++i) {
		var k = a[i];
		if (k in o) {
			o = o[k];
			matched = true;
		} else {
			return;
		}
	}

	return matched ? o : _s;
};

export default function formatListItemData({
	data,
	icon = "icon",
	video = "video",
	image = "image",
	title = "title",
	subtitle,
	status,
	// status = "status",
	trailing,
	progress,
	// progress = "progress",
	action: _action = "url",
}) {
	return {
		icon: _get(data, icon),
		video: _format(data, video),
		image: _format(data, image),
		title: _format(data, title),
		subtitle: (_parse(subtitle, data) || []).filter((s) => s ?? false),
		trailing: _format(data, trailing),
		status: _get(data, status),
		action: _get(data, _action),
		progress: _get(data, progress),
	};
}
