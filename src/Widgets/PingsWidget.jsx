import Widget from "../components/Widget";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../providers/AuthProvider";

const PingsWidget = () => {
	const { user } = useAuth();
	const { data } = useFetch({
		model: "Pings",
		filters: {
			"target.email": user.email,
		},
	});

	return (
		<Widget>
			<div className="h-full flex items-center">
				<div className="ml-1 mr-2 font-semibold">Recent pings</div>
				<div className="flex-1 flex justify-end items-center space-x-2">
					{data?.map(({ sender }, i) => {
						return (
							<div
								key={i}
								className="w-10 h-10 rounded-full bg-content/10 border border-content/10 relative"
								style={{ zIndex: data.length - i }}
							>
								<img
									className="rounded-full object-cover w-full h-full z-10"
									src={sender.image}
									alt=""
								/>

								<img
									className="scale-105 opacity-25 -bottom-1 blur absolute rounded-full object-cover w-full h-full"
									src={sender.image}
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

export default PingsWidget;
