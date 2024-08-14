import {
	dbDelete,
	dbInsert,
	dbUpdate,
	queryDb,
} from "@/crotchet/providers/firebase";
import { crawlUrl } from "@/crotchet/providers/crawler";

export const getCrotchetDataSourceProvider = (parent, name, props) => {
	const parentSource = window.dataSources?.[parent];

	if (!parentSource) {
		if (!window.pendingDataSources) {
			window.pendingDataSources = {
				[parent]: [],
			};
		}

		const pendingParent = window.pendingDataSources[parent];

		if (!pendingParent) window.pendingDataSources[parent] = [];

		window.pendingDataSources[parent] = [
			...pendingParent,
			[`crotchet://${parent}`, name, props],
		];

		return;
	}

	const parentProps = _.omit(parentSource, ["label", "name"]);
	const _source = typeof props == "function" ? { handler: props } : props;
	return {
		...parentProps,
		..._source,
		handler: (payload = {}) =>
			parentProps.handler({ ...props, ...payload }),
	};
};

export default function dataSourceProviders(provider, props = {}) {
	return {
		db: {
			fetch: () => queryDb(props.table || props.name),
			insertRow: (data) => dbInsert(props.table || props.name, data),
			updateRow: (rowId, data) =>
				dbUpdate(props.table || props.name, rowId, data),
			deleteRow: (rowId) => dbDelete(props.table || props.name, rowId),
			listenForUpdates: (callback = () => {}) => {
				window.addEventListener(
					`firebase-table-updated:${props.table || props.name}`,
					callback,
					false
				);

				return () =>
					window.removeEventListener(
						`firebase-table-updated:${props.table || props.name}`,
						callback,
						false
					);
			},
		},
		crawler: {
			fetch: () => crawlUrl(props.url, props.matcher),
		},
	}[provider];
}
