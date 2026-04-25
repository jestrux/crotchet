const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { getBackendBaseUrl } = require("../utils/backend");

const getTvDataDir = () => path.join(app.getPath("userData"), "Crotchet", "tv-data");

const writePage = (page) => {
	const dir = getTvDataDir();
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, `${page.name}.json`), JSON.stringify(page));
};

const readPages = () => {
	const dir = getTvDataDir();
	try {
		return fs.readdirSync(dir)
			.filter((f) => f.endsWith(".json"))
			.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
	} catch (_) {
		return [];
	}
};

const toHms = (secs) => {
	if (!secs) return "0:00";
	const h = Math.floor(secs / 3600);
	const m = Math.floor((secs % 3600) / 60);
	const s = Math.floor(secs % 60);
	if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	return `${m}:${String(s).padStart(2, "0")}`;
};

const applyTemplate = (template, entry) =>
	template.replace(/\{(\w+)\}/g, (_, key) => entry[key] != null ? entry[key] : "");

// Like applyTemplate but URL-encodes values that are themselves URLs
const applyUrlTemplate = (template, entry) =>
	template.replace(/\{(\w+)\}/g, (_, key) => {
		const val = entry[key] != null ? String(entry[key]) : "";
		return /^https?:\/\//.test(val) ? encodeURIComponent(val) : val;
	});

const normalizeEntry = (entry, fields) => {
	if (fields) {
		// Enrich entry with computed fields available for template substitution
		const enriched = {
			...entry,
			cropStart: entry.crop?.[0] ?? '',
			cropEnd: entry.crop?.[1] ?? '',
		};
		return {
			_id: enriched._id || enriched.id,
			title: fields.title ? (enriched[fields.title] || enriched.title) : (enriched.title || enriched.name),
			video: fields.videoTemplate ? applyTemplate(fields.videoTemplate, enriched) : enriched.video,
			image: fields.imageTemplate ? applyTemplate(fields.imageTemplate, enriched) : enriched.image,
			url: fields.urlTemplate ? applyUrlTemplate(fields.urlTemplate, enriched) : enriched.url,
			subtitle: fields.subtitleTemplate
				? applyTemplate(fields.subtitleTemplate, enriched)
				: fields.subtitleCrop && enriched.crop?.length === 2
					? `${toHms(enriched.crop[0])} - ${toHms(enriched.crop[1])}`
					: enriched.subtitle,
			crop: enriched.crop,
		};
	}
	return {
		_id: entry._id || entry.id,
		title: entry.title || entry.name,
		subtitle: entry.subtitle,
		image: entry.image,
		video: entry.video,
		url: entry.url,
	};
};

module.exports = function createTvHandlers(io) {
	return {
		"tv-source-registered": async ({ name, label, icon, fields, table, orderBy, items: preloadedItems, layout } = {}) => {
			if (!name || (!table && !preloadedItems)) return;

			try {
				let raw;

				if (preloadedItems) {
					raw = preloadedItems;
				} else {
					const effectiveOrderBy = orderBy || "updatedAt,desc";
					const url = `${getBackendBaseUrl()}/db/${table}?orderBy=${effectiveOrderBy}`;
					const data = await fetch(url).then((r) => r.json());
					raw = Array.isArray(data) ? data : (data?.data || []);

					const [sortField, sortDir] = effectiveOrderBy.split(",");
					const toNum = (v) => {
						if (v?.seconds != null) return v.seconds;
						if (typeof v === "number") return v / 1000;
						if (typeof v === "string") return Date.parse(v) / 1000;
						return 0;
					};
					raw.sort((a, b) => {
						const diff = toNum(a[sortField]) - toNum(b[sortField]);
						return sortDir === "desc" ? -diff : diff;
					});
				}

				const items = raw.map((e) => normalizeEntry(e, fields)).filter((i) => i._id && i.title);
				writePage({ name, label, icon, layout, items });
				io.emit("tv-pages-updated", readPages());
				console.log(`TV page updated: ${name} (${items.length} items)`);
			} catch (e) {
				console.log(`TV page fetch error (${name}):`, e.message);
			}
		},
	};
};
