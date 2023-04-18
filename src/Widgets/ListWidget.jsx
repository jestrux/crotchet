import ListItem from "../components/ListItem";
import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";

const ListWidget = ({ model, filters, orderBy, limit, ...props }) => {
	const { isLoading, data } = useFetch({
		model,
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
