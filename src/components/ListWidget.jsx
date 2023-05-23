import ListItem from "./ListItem";
import Loader from "./Loader";
import { useAirtableFetch } from "../hooks/useAirtable";
import Widget from "./Widget";
import useLocalStorageState from "../hooks/useLocalStorageState";
import { useEffect } from "react";

const ListWidget = ({
	cacheData = false,
	page,
	table,
	filters,
	orderBy,
	limit,
	widgetProps,
	children,
	noPadding = true,
	...props
}) => {
	if (widgetProps === undefined) widgetProps = { noPadding };

	const [data, setData] = useLocalStorageState(
		!cacheData ? null : `${page ?? ""} ${widgetProps?.title || table}`
	);
	const { isLoading, refetch } = useAirtableFetch({
		table,
		filters,
		orderBy,
		limit,
		refetchOnWindowFocus: true,
		onSuccess: setData,
	});

	useEffect(() => {
		document.addEventListener("widgets-updated", refetch, false);

		return () => {
			document.removeEventListener("widgets-updated", refetch, false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Widget {...widgetProps} refresh={refetch}>
			{!data?.length && isLoading ? (
				<div className="relative h-8">
					<Loader scrimColor="transparent" size={25} />
				</div>
			) : (
				<div className="pb-2">
					{data &&
						data.map((entry, index) => {
							return typeof children == "function" ? (
								children(entry)
							) : (
								<ListItem
									key={index}
									data={entry}
									table={table}
									{...props}
								/>
							);
						})}
				</div>
			)}
		</Widget>
	);
};

export default ListWidget;
