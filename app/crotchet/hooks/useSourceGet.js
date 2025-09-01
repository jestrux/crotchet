import { useRef, useState } from "react";
import { matchSorter } from "match-sorter";
import { cleanObject, shuffle, withCache } from "@/crotchet/utils";

export const getterFields = [
	"limit",
	"single",
	"first",
	"random",
	"shuffle",
	"fieldMap",
	"mapEntry",
	"mapEntry",
	"entryActions",
	"entryAction",
	"orderBy",
	"searchable",
	"searchFields",
	"searchQuery",
];

import useOnInit from "./useOnInit";

export const sourceGet = async (source, props = {}) => {
	if (typeof source == "function") source = { handler: source };
	if (typeof source == "string") source = window.dataSources[source];

	const payload = _.omit(props, getterFields);
	let {
		limit,
		single,
		first,
		random,
		shuffle: shuffleResults,
		orderBy,
		mapEntry,
		entryActions,
		entryAction,
		searchable,
		searchFields = ["title", "subtitle", "tags"],
		searchQuery,
	} = _.pick({ ...source, ...props }, getterFields);

	let handler;

	if ([typeof source?.get, typeof source?.handler].includes("function")) {
		handler = typeof source.get == "function" ? source.get : source.handler;
	}

	if (typeof handler != "function") return null;

	let res;

	if (props.cacheKey) {
		res = await withCache(
			props.cacheKey,
			async () => await handler(payload),
			{
				invalidate: props.invalidateCache,
				cacheDuration: props.cacheDuration ?? 60,
			}
		);
	} else res = await handler(payload);

	if (!Array.isArray(res)) return res;

	const validFilters = cleanObject(props.filters || {});

	const mapSourceEntry = (entry) => {
		if (typeof mapEntry == "function")
			entry = { ...entry, ...mapEntry(entry) };

		if (typeof entryAction == "function") entry.action = entryAction(entry);
		if (typeof entryActions == "function")
			entry.actions = entryActions(entry);

		return entry;
	};
	if (
		Object.values(validFilters).length > 0
		// && ![true, false].includes(source.filterable)
	) {
		res = res.reduce((agg, entry) => {
			entry = mapSourceEntry(entry);

			const matches = Object.entries(validFilters).every(
				([key, value]) =>
					value?.toString().toLowerCase() ==
					entry[key]?.toString().toLowerCase()
			);

			return [...agg, ...(matches ? [entry] : [])];
		}, []);
	} else res = res.map(mapSourceEntry);

	if (searchable !== false && res?.length && searchQuery?.length) {
		res = matchSorter(res, searchQuery, {
			keys: searchFields,
		});
	}

	if (orderBy) res = _.orderBy(res, ...orderBy.split(","));

	if (random == true || shuffleResults) res = shuffle(shuffle(res));

	if (single || first) return res[0];

	if (limit) return res.slice(0, limit);

	return res;
};

export default function useSourceGet(
	source,
	{ delayLoader = 500, shuffle, single, ...props } = {}
) {
	const loadingRef = useRef();
	const [res, setRes] = useState({
		loading: false,
		showLoader: false,
		data: null,
		error: null,
		refetch: () => doFetch(true),
	});

	const onChange = (newState) => {
		setRes((res) => ({
			...res,
			...newState,
		}));
	};

	const doFetch = async (fromRefetch) => {
		if (!source) return;

		onChange({
			error: null,
			loading: !fromRefetch,
		});

		loadingRef.current = setTimeout(() => {
			onChange({
				showLoader: !fromRefetch,
			});
		}, delayLoader);

		try {
			const data = await sourceGet(source, {
				fromRefetch,
				single,
				shuffle,
				...props,
			});
			onChange({
				showLoader: false,
				loading: false,
				data,
			});
		} catch (error) {
			// console.log("Fetch error: ", error);
			onChange({
				showLoader: false,
				loading: false,
				error: error.toString(),
			});
		} finally {
			if (loadingRef.current) clearInterval(loadingRef.current);
		}
	};

	useOnInit(() => doFetch());

	return res;
}
