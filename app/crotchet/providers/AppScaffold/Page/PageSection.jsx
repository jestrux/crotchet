import { useState } from "react";
import GridList from "@/crotchet/components/GridList";
import ActionGrid from "@/crotchet/components/ActionGrid";
import { sourceGet } from "@/crotchet";
import { randomId } from "@/crotchet/utils";
import { useDataLoader } from "@/crotchet/hooks";
import PreferenceEditor from "@/crotchet/components/PreferenceEditor";

export default function PageSection({
	title,
	type,
	pageData,
	data: _data,
	source,
	meta = {},
	onSectionLoaded = () => {},
}) {
	const [dataRef, setDataRef] = useState();
	const { data } = useDataLoader({
		handler: source ? () => sourceGet(source, meta) : _data || pageData,
		listenForUpdates: source?.listenForUpdates,
		onUpdate: () => {
			setDataRef(randomId());
		},
		onSuccess: onSectionLoaded,
	});
	const sourceProps = _.pick(source, [
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
				type={meta?.inline ? "inline" : "grid"}
				data={data}
				key={dataRef}
			/>
		);
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
