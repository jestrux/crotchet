import { useQuery } from "@tanstack/react-query";
import { _get } from "../utils";
import { useCallback, useRef, useState } from "react";

function sheetToJson(sheet = []) {
	let json = [];
	if (sheet && sheet.length && sheet.flat().length > 1) {
		const columns = sheet.shift();
		json = sheet.reduce((agg, entry) => {
			const row = entry.reduce((agg, entry, index) => {
				let columnName = columns[index];
				let value = entry;

				if (columnName.indexOf(":") !== -1) {
					const [model, column] = columnName.split(":");
					value = window.users.find(({ name }) => name === entry);
					columnName = column;
				}

				return { ...agg, [columnName]: value };
			}, {});
			return [...agg, row];
		}, []);
	}

	return json;
}

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

function dataFilterer(value, comparison) {
	if (comparison.indexOf("today") !== -1) {
		const diff = (new Date(value).getTime() - Date.now()) / 86400 / 1000;

		const sameDay = isSameDay(new Date(), new Date(value));

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
			new Date().getDate() === new Date(value).getDate()
		);
	}

	if (comparison.indexOf("!") !== -1) return `!${value}` !== comparison;

	const actualComparison = replaceMultiple(
		comparison,
		["<", ">", "="],
		""
	).trim();

	if (comparison.indexOf("<=") !== -1) return value <= actualComparison;

	if (comparison.indexOf(">=") !== -1) return value >= actualComparison;

	if (comparison.indexOf("<") !== -1) return value < actualComparison;

	if (comparison.indexOf(">") !== -1) return value > actualComparison;

	return value === comparison;
}

function processData({ data = [], filters, orderBy, limit, first }) {
	let processedData = [...data];
	filters = Object.entries(filters || {});

	if (processedData?.length) {
		processedData = !filters?.length
			? processedData
			: processedData.filter((row) =>
					filters.every(([field, filter]) => {
						const value = _get(row, field);
						const [data, filterMethod] =
							filter.indexOf("|") !== -1
								? [filter.split("|"), "some"]
								: [filter.split("&"), "every"];

						return data[filterMethod]((comparison) =>
							dataFilterer(value, comparison)
						);
					})
			  );

		if (orderBy?.length) {
			const [order, dir] = orderBy.split("|").map((s) => s.trim());
			processedData = processedData.sort((a, b) => {
				const valueA = _get(a, order);
				const valueB = _get(b, order);

				return dir === "desc"
					? valueA.localeCompare(valueB)
					: valueB.localeCompare(valueA);
			});
		}

		if (limit) processedData = processedData.slice(0, limit);
	}

	if (first) return processedData.length ? processedData[0] : null;

	return processedData;
}

function useFetch({
	cacheKey,
	model = "Users",
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
		model,
		refetchOnWindowFocus,
		filters,
		orderBy,
		limit,
		first,
		onSuccess,
		onError,
	});
	const successResolver = useRef(() => {});

	const fetchModel = useCallback(async () => {
		const baseUrl =
			"https://sheets.googleapis.com/v4/spreadsheets/1xkgPzQYmgndKFy1D6j4ZbZSc5wx0Z3lIP0zlp7FC20Q/values";
		const url = `${baseUrl}/${props.model}?key=AIzaSyDj7idwa2BYKnuwRDH70ztjNNjA4-6fShU`;

		const res = await fetch(url);
		const data = await res.json();
		const response = sheetToJson(data.values);

		if (props.model === "Users") window.users = response;

		return response;
	}, [props.model]);

	const query = useQuery([props.cacheKey || props.model], fetchModel, {
		refetchOnWindowFocus: props.refetchOnWindowFocus,
		onSuccess: (data) => {
			const res = processData({
				data,
				...props,
			});

			props.onSuccess(res);
			successResolver.current(res);
		},
		onError,
	});

	const data = processData({
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

export default useFetch;
