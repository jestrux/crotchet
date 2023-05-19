import { useRef, useState } from "react";
import * as Airtable from "airtable";
import { useMutation, useQuery } from "@tanstack/react-query";
import airtableFilter from "./airtable-filter";
import { randomId } from "../../utils";

const API_KEY = "key7rYj7BDKm9wwS2";
const DB_ID = "appnobMFeViOdmZsV";
const db = new Airtable({ apiKey: API_KEY }).base(DB_ID);

window.DEV_MODE = false;

export class AirtableService {
	records = [];

	constructor({ table } = {}) {
		this.table = table;
		this.cacheKey = "CROTCHET_CACHE_" + table;
	}

	set __cachedData(value) {
		if (!window.DEV_MODE) return;
		localStorage[this.cacheKey] = JSON.stringify([value, Date.now()]);
	}

	get __cachedData() {
		if (!window.DEV_MODE) return null;

		// Localstorage fails in incognito mode
		try {
			const [records, lastCacheTime] = JSON.parse(
				localStorage[this.cacheKey] || "[]"
			);
			if (records?.length && lastCacheTime?.toString().length) {
				const cacheAge =
					(Date.now() - new Date(lastCacheTime)) / 1000 / 60;
				if (cacheAge > 10) localStorage.removeItem(this.cacheKey);

				return records;
			}
		} catch (error) {}

		return null;
	}

	all() {
		return this.records;
	}

	filterByType(typeFilter) {
		if (!typeFilter?.length) return this.records;

		return this.records.filter(({ Type }) => typeFilter == Type);
	}

	async fetch({ filters } = {}) {
		console.log(`Fetching data for ${this.table}...`);
		// if (!this.table) return;

		return new Promise((resolve, reject) => {
			// Basic caching to prevent rate limiting from Airtable
			// during development

			try {
				const cachedRecords = this.__cachedData;
				if (cachedRecords?.length) {
					resolve(cachedRecords);
					return;
				}

				db(this.table)
					.select({
						// filterByFormula:
						// 	"AND(email='wakyj07@gmail.com',password='123')",
						filterByFormula: airtableFilter(filters),
					})
					.firstPage((err, records) => {
						if (err) {
							console.error(
								`Error etching data for ${this.table}...`,
								err
							);
							reject(err);
							return;
						}

						records = records
							.map((record) => record?.fields || record)
							.map((entry) => {
								return Object.entries(entry).reduce(
									(agg, [key, value]) => {
										if (
											value &&
											Array.isArray(value) &&
											value.length === 1 &&
											(key.indexOf("_") !== -1 ||
												value[0].indexOf("recd") === 0)
										)
											value = value[0];

										return {
											...agg,
											[key]: value,
										};
									},
									{}
								);
							});

						this.__cachedData = JSON.stringify([
							records,
							Date.now(),
						]);
						resolve(records);
					});
			} catch (error) {
				reject(error);
			}
		});
	}

	async store() {
		const payload = {
			records: [
				{
					fields: {
						Name: "Freight",
					},
				},
				{
					fields: {
						Name: "Elevetor",
					},
				},
			],
		};

		const res = await fetch({
			url: `https://api.airtable.com/v0/appnobMFeViOdmZsV/pipelines?api_key=${API_KEY}`,
			method: "POST",
			body: JSON.stringify(payload),
		});
		const data = await res.json();
		return data;
	}
}

const processAirtableData = ({ data = [], orderBy, limit = 500, first }) => {
	if (first) return data.length ? data[0] : null;
	return data.slice(0, limit);
};

export function useAirtableFetch({
	table,
	cacheKey,
	refetchOnWindowFocus = false,
	filters,
	orderBy,
	limit,
	first,
	onSuccess = () => {},
	onError = () => {},
}) {
	const [props, setProps] = useState({
		cacheKey,
		refetchOnWindowFocus,
		filters,
		orderBy,
		limit,
		first,
		onSuccess,
		onError,
	});
	const successResolver = useRef(() => {});

	const cacher = useRef(randomId());
	const instance = useRef(new AirtableService({ table }));
	const query = useQuery(
		[props.cacheKey || cacher.current],
		async () => {
			let res;
			try {
				res = await instance.current.fetch({ filters });
			} catch (error) {
				console.log("Fetch error: ", error);
			}

			return res;
		},
		{
			refetchOnWindowFocus: props.refetchOnWindowFocus,
			onSuccess: (data) => {
				const res = processAirtableData({
					data,
					...props,
				});

				props.onSuccess(res);
				successResolver.current(res);
			},
			onError,
		}
	);

	const data = processAirtableData({
		data: query.data,
		...props,
	});

	const refetch = (newProps) => {
		setProps({ ...props, ...newProps });
		query.refetch();

		return new Promise((resolve) => (successResolver.current = resolve));
	};

	return {
		...query,
		data,
		processing: query.isLoading || query.isRefetching,
		refetch,
	};
}

export function useAirtableMutation({
	table,
	cacheKey,
	refetchOnWindowFocus = false,
	filters,
	orderBy,
	limit,
	first,
	onSuccess = () => {},
	onError = () => {},
}) {
	const props = {
		cacheKey,
		refetchOnWindowFocus,
		filters,
		orderBy,
		limit,
		first,
	};

	const successResolver = useRef(() => {});
	const errorResolver = useRef(() => {});
	const instance = useRef(new AirtableService({ table }));
	const query = useMutation({
		mutationFn: (filters) => instance.current.fetch({ filters }),
		onSuccess: (data) => {
			const res = processAirtableData({
				data,
				...props,
			});

			onSuccess(res);
			successResolver.current(res);
		},
		onError: (...params) => {
			onError(...params);
			successResolver.current(...params);
		},
	});

	const data = processAirtableData({
		data: query.data,
		...props,
	});

	const mutate = (payload) => {
		const promise = new Promise((res, rej) => {
			successResolver.current = res;
			errorResolver.current = rej;
		});

		query.mutate(payload);

		return promise;
	};

	return {
		...query,
		processing: query.isLoading,
		data,
		mutate,
	};
}
