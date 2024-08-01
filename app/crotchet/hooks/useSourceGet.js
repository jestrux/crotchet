import { useRef, useState } from "react";
import { matchSorter } from "match-sorter";
import { cleanObject, shuffle } from "@/crotchet/utils";

export const getterFields = [
	"limit",
	"single",
	"first",
	"random",
	"shuffle",
	"fieldMap",
	"mapEntry",
	"orderBy",
	"searchable",
	"searchFields",
	"searchQuery",
	"filters",
];

import useOnInit from "./useOnInit";

export const sourceGet = async (source, props = {}) => {
	if (typeof source == "function") source = { handler: source };

	const payload = _.omit(props, getterFields);
	let {
		limit,
		single,
		first,
		random,
		shuffle: shuffleResults,
		orderBy,
		mapEntry,
		searchable,
		searchFields = ["title", "subtitle", "tags"],
		searchQuery,
		filters,
	} = _.pick({ ...source, ...props }, getterFields);

	let handler;

	if ([typeof source?.get, typeof source?.handler].includes("function")) {
		handler = typeof source.get == "function" ? source.get : source.handler;
		// random = random || source.random;
		// single = single || source.single;
		// first = first || source.first;
		// searchable = searchable || source.searchable;
		// searchFields = searchFields || source.searchFields;
		// searchQuery = searchQuery || source.searchQuery;
	}

	if (typeof handler != "function") return null;

	let res = await handler(payload);

	if (!Array.isArray(res)) return res;

	const validFilters = cleanObject(filters);
	if (
		Object.values(validFilters).length > 0
		// && ![true, false].includes(source.filterable)
	) {
		res = res.reduce((agg, entry) => {
			if (typeof source.mapEntry == "function")
				entry = { ...entry, ...source.mapEntry(entry) };

			const matches = Object.entries(validFilters).every(
				([key, value]) =>
					value?.toString().toLowerCase() ==
					entry[key]?.toString().toLowerCase()
			);

			return [...agg, ...(matches ? [entry] : [])];
		}, []);
	} else if (typeof source.mapEntry == "function") res = res.map(mapEntry);

	if (searchable !== false && res?.length && searchQuery?.length) {
		res = matchSorter(res, searchQuery, {
			keys: searchFields,
		});
	}

	if (orderBy) res = _.orderBy(res, ...orderBy.split(","));

	if (random || shuffleResults) res = shuffle(shuffle(res));

	if (single || first) return res[0];

	if (limit) return res.slice(0, limit);

	return res;
};

export default function useSourceGet(
	source,
	{ delayLoader = true, shuffle, single, ...props } = {}
) {
	const loadingRef = useRef();
	const [res, setRes] = useState({
		loading: false,
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

		// if (res.loading) return null;

		onChange({
			error: null,
			// data: null,
		});

		loadingRef.current = setTimeout(
			() => {
				onChange({
					loading: !fromRefetch,
				});
			},
			delayLoader ? 1500 : 0
		);

		try {
			const data = await sourceGet(source, {
				fromRefetch,
				single,
				shuffle,
				...props,
			});
			onChange({
				loading: false,
				data,
			});
		} catch (error) {
			// console.log("Fetch error: ", error);
			onChange({
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
