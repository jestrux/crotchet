import ListItem from "./ListItem";
import Loader from "./Loader";
import { useAirtableFetch } from "../hooks/useAirtable";
import Widget from "./Widget";

const ListWidget = ({
	table,
	filters,
	orderBy,
	limit,
	widgetProps = {},
	children,
	...props
}) => {
	const { isLoading, data } = useAirtableFetch({
		table,
		filters,
		orderBy,
		limit,
		refetchOnWindowFocus: true,
	});

	// console.log("List: ", data);

	return (
		<Widget {...widgetProps}>
			{isLoading ? (
				<div className="relative h-8">
					<Loader scrimColor="transparent" size={25} />
				</div>
			) : (
				<div className="pb-2">
					{data.map((entry, index) => {
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
