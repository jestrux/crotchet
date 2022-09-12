import ListItem from "../components/ListItem";
import Widget from "../components/Widget";
import useFetch from "../hooks/useFetch";

const UserPerformanceWidget = () => {
	const { isLoading, data } = useFetch({
		model: "Performance",
		orderBy: "progress",
		first: true,
		filters: [
			{
				"user.name": "Walter Kimaro",
			},
		],
	});

	return (
		<Widget>
			{data && (
				<ListItem
					data={data}
					title="user.name"
					subtitle="user.department::billed"
					progress="progress"
				/>
			)}
		</Widget>
	);
};

export default UserPerformanceWidget;
