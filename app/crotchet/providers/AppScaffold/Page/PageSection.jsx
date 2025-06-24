import { useRef, useState } from "react";
import GridList from "@/crotchet/components/GridList";
import ActionGrid from "@/crotchet/components/ActionGrid";
import { sourceGet } from "@/crotchet";
import { randomId } from "@/crotchet/utils";
import { useDataLoader } from "@/crotchet/hooks";
import PreferenceEditor from "@/crotchet/components/PreferenceEditor";
import ListView from "@/crotchet/components/ListView";

export default function PageSection({
	title,
	type = "list",
	data: _data,
	source,
	resolve,
	meta = {},
	onSectionLoaded = () => {},
	...props
}) {
	const state = useRef({});
	const setState = (key, value) => {
		state.current[key] = value;
	};
	const [dataRef, setDataRef] = useState();
	const { data } = useDataLoader({
		handler: resolve
			? async () => {
					const res = await (typeof resolve == "function"
						? resolve({ state: state.current, setState })
						: Promise.resolve(true));

					return res;
			  }
			: source
			? () => sourceGet(source, meta)
			: _data,
		listenForUpdates: source?.listenForUpdates,
		onUpdate: () => {
			setDataRef(randomId());
		},
		onSuccess: onSectionLoaded,
	});
	const sourceProps = _.pick({ ...source, ...props }, [
		"entryAction",
		"entryActions",
		"layoutProps",
	]);

	if (!data) return null;

	if (type == "preferences")
		return <PreferenceEditor data={data} {...meta} key={dataRef} />;

	if (!data?.length) return null;

	if (type == "actions") {
		return (
			<ActionGrid
				{...sourceProps}
				{...meta}
				title={title}
				type={
					meta.style ? meta.style : meta?.inline ? "inline" : "grid"
				}
				data={data}
				key={dataRef}
			/>
		);
	}

	if (type == "list") {
		return (
			<ListView
				{...sourceProps}
				{...meta}
				title={title}
				data={data}
				key={dataRef}
				showDefaultBackground
			/>
		);

		// return (
		// 	<ActionGrid
		// 		{...sourceProps}
		// 		{...meta}
		// 		title={title}
		// 		type="inline"
		// 		data={data}
		// 		key={dataRef}
		// 		showDefaultBackground
		// 	/>
		// );
	}

	if (type == "grid") {
		return (
			<GridList
				{...sourceProps}
				{...meta}
				title={title}
				data={data}
				key={dataRef}
			/>
		);
	}

	return null;
}
