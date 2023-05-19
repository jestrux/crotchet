import ListItem from "../components/ListItem";
import Loader from "../components/Loader";
import { useAirtableFetch } from "../hooks/useAirtable";

const ListWidget = ({ table, filters, orderBy, limit, ...props }) => {
	const { isLoading, data } = useAirtableFetch({
		table,
		filters,
		orderBy,
		limit,
		refetchOnWindowFocus: true,
	});

	try {
		props = JSON.parse(props);
	} catch (error) {
		props = props;
	}

	// console.log("List: ", data);

	return (
		<div>
			{isLoading ? (
				<div className="relative h-8">
					<Loader scrimColor="transparent" size={25} />
				</div>
			) : (
				<div className="pb-2">
					{data.map((entry, index) => {
						return <ListItem key={index} data={entry} {...props} />;
					})}
				</div>
			)}
		</div>
	);
};

export default ListWidget;
