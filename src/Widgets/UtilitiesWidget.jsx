import Widget from "../components/Widget";
import useFetch from "../hooks/useFetch";

const UtilitiesWidget = () => {
	const { isLoading, data } = useFetch({
		model: "Users",
		filters: [
			{
				name: "!Walter Kimaro",
			},
		],
	});

	return (
		<Widget>
			<div className="h-full flex items-center">
				<div className="ml-1 mr-2 font-semibold">Recent pings</div>
				<div className="flex-1 flex justify-end items-center space-x-2">
					{data?.map((user, i) => {
						return (
							<div
								key={i}
								className="w-10 h-10 rounded-full border-2 border-double border-content/90 relative"
								style={{ zIndex: data.length - i }}
							>
								<img
									className="rounded-full object-cover w-full h-full z-10"
									src={user.image}
									alt=""
								/>

								<img
									className="scale-105 opacity-25 -bottom-1 blur absolute rounded-full object-cover w-full h-full"
									src={user.image}
									alt=""
								/>
							</div>
						);
					})}
				</div>
			</div>
		</Widget>
	);
};

export default UtilitiesWidget;
