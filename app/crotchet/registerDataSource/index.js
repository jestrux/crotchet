import { shuffle } from "lodash";
import { getterFields, sourceGet } from "../hooks/useSourceGet";
import {
	camelCaseToSentenceCase,
	cleanObject,
	dispatch,
	onDesktop,
	randomId,
} from "@/crotchet/utils";
import dataSourceProviders, {
	getCrotchetDataSourceProvider,
} from "./dataSourceProviders";

const updateDataSourceWidget = async (name, key, value) => {
	if (onDesktop()) return;

	const { WidgetsBridgePlugin } = await import(
		"capacitor-widgetsbridge-plugin"
	);

	const dataSources = window.dataSources;
	const validDataSources = Object.keys(dataSources)
		.filter((key) => ["db"].includes(dataSources[key]?.provider))
		.join(", ");

	if (!validDataSources.includes(name)) return;

	if (key && value) {
		try {
			await window.syncWidgetData(
				name + key,
				_.pick(value, ["video", "image", "title", "subtitle", "url"])
			);
		} catch (error) {
			//
		}

		return;
	}

	try {
		await window.syncWidgetData("dataSources", validDataSources);
	} catch (error) {
		//
	}

	const source = dataSources[name];

	if (!_.isFunction(source.get)) return;

	const data = await source.get();

	if (!data.length) return;

	try {
		await window.syncWidgetData(name + "Stat", {
			title: source.label,
			subtitle: data.length + " records",
		});
	} catch (error) {
		// console.log("Update widget: error: ", error);
	}

	const latest = data[0];
	if (latest?.title) {
		const latestData = {
			video: latest.video,
			image: latest.image,
			title: latest.title,
			subtitle: latest.subtitle,
			url: latest.url,
			_id: latest._id,
		};

		try {
			await window.syncWidgetData(name + "Latest", latestData);
		} catch (error) {
			//
		}
	}

	// Store first 6 items for LatestList
	const latestList = data.slice(0, 6).map((item) => ({
		video: item.video,
		image: item.image,
		title: item.title,
		subtitle: item.subtitle,
		url: item.url,
		_id: item._id,
	}));

	if (latestList.length > 0) {
		try {
			await window.syncWidgetData(name + "LatestList", latestList);
		} catch (error) {
			//
		}
	}

	const random = shuffle(shuffle(data))[0];

	if (random?.title) {
		const randomData = {
			video: random.video,
			image: random.image,
			title: random.title,
			subtitle: random.subtitle,
			url: random.url,
			_id: random._id,
		};

		try {
			await window.syncWidgetData(name + "Random", randomData);
		} catch (error) {
			//
		}
	}

	// Store 6 random items for RandomList
	const shuffledData = shuffle(shuffle(data));
	const randomList = shuffledData.slice(0, 12).map((item) => ({
		video: item.video,
		image: item.image,
		title: item.title,
		subtitle: item.subtitle,
		url: item.url,
		_id: item._id,
	}));

	if (randomList.length > 0) {
		try {
			await window.syncWidgetData(name + "RandomList", randomList);
		} catch (error) {
			//
		}
	}

	return;
};

export default function registerDataSource(provider, name, props = {}) {
	if (!window.dataSources) window.dataSources = {};

	if (provider.startsWith("crotchet://")) {
		const _source = getCrotchetDataSourceProvider(
			provider.replace("crotchet://", ""),
			name,
			_.omit(props, getterFields)
		);

		if (!_source) return;

		props = {
			...props,
			..._source,
			..._.pick(props, getterFields),
		};
	}

	const label = camelCaseToSentenceCase(
		name.replace("-", " ").replace("_", " ")
	);

	let getter, insertRow, updateRow, deleteRow, listenForUpdates;
	const sourceProvider =
		provider == "custom"
			? props
			: dataSourceProviders(provider, { name, ...props });

	if (typeof sourceProvider == "function") getter = sourceProvider;
	else if (typeof props.handler == "function") getter = props.handler;
	else if (typeof sourceProvider.fetch == "function") {
		getter = sourceProvider.fetch;
		insertRow = sourceProvider.insertRow;
		updateRow = sourceProvider.updateRow;
		deleteRow = sourceProvider.deleteRow;
		listenForUpdates = sourceProvider.listenForUpdates;
	}

	if (!getter) return console.error(`Unkown data provider: ${provider}`);

	const handler = async (payload) => getter(payload);

	const get = ({ shuffle, limit, first, single, ...payload } = {}) =>
		sourceGet(
			{
				handler,
				..._.pick(props, getterFields),
			},
			{
				..._.pick(props, getterFields),
				shuffle,
				limit,
				first,
				single,
				...payload,
			}
		);

	const latest = async (payload = {}) =>
		await get({ single: true, ...payload });

	const random = async (payload = {}) => {
		const res = await get({ random: true, single: true, ...payload });
		setTimeout(() => {
			updateDataSourceWidget(name, "Random", res);
		}, 300);
		return res;
	};

	const source = {
		..._.omit(props, getterFields),
		icon: props.icon,
		_id: randomId(),
		provider,
		name,
		label,
		..._.pick(props, getterFields),
		handler,
		get,
		random,
		latest,
		insertRow,
		updateRow,
		deleteRow,
		listenForUpdates,
		entryActions: props.entryActions,
		entryAction: props.entryAction,
	};

	window.dataSources[name] = source;

	setTimeout(() => {
		updateDataSourceWidget(name);
		dispatch("datasources-updated", name);
	}, 10);

	const pendingDataSources = window.pendingDataSources?.[name];

	if (pendingDataSources) {
		pendingDataSources.forEach(([provider, childName, props], index) => {
			registerDataSource(provider, childName, props);
			delete window.pendingDataSources[name][index];
		});

		window.pendingDataSources = cleanObject(window.pendingDataSources);
	}
}
