import { useQuery } from "@tanstack/react-query";

function sheetToJson(sheet = []) {
	let json = [];
	if (sheet && sheet.length && sheet.flat().length > 1) {
		const columns = sheet.shift();
		json = sheet.reduce((agg, entry) => {
			const row = entry.reduce((agg, entry, index) => {
				let columnName = columns[index];
				let value = entry;

				if(columnName.indexOf(":") !== -1){
					const [model, column] = columnName.split(":");
					value = window.users.find((({name}) => name === entry));
					columnName = column;
				}

				return { ...agg, [columnName]: value };
			}, {});
			return [...agg, row];
		}, []);
	}

	return json;
}

function useFetch({ model = "Users", refetchOnWindowFocus = true }) {
	const fetchModel = async () => {
		const baseUrl =
			"https://sheets.googleapis.com/v4/spreadsheets/1xkgPzQYmgndKFy1D6j4ZbZSc5wx0Z3lIP0zlp7FC20Q/values";
		const url = `${baseUrl}/${model}?key=AIzaSyDj7idwa2BYKnuwRDH70ztjNNjA4-6fShU`;

		const res = await fetch(url);
		const data = await res.json();
		const response = sheetToJson(data.values);

		if (model === "Users") window.users = response;

		return response;
	};

	const query = useQuery([model], fetchModel, {
		refetchOnWindowFocus,
	});

	return { ...query };
}

export default useFetch;
