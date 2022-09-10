import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";
import MusicWidget from "./MusicWidget";

const WidgetWrapper = ({
	noPadding,
	children,
	width,
	aspectRatio = 1 / 1,
	flex,
}) => {
	return (
		<div
			className="p-5 rounded-2xl bg-card shadow-md overflow-y-hidden"
			style={{
				width,
				flex,
				aspectRatio,
				padding: noPadding ? 0 : "1.25rem",
			}}
		>
			{children}
		</div>
	);
};

const Widgets = () => {
	const { isLoading, data: widgets } = useFetch({
		model: "Widgets",
	});

	if (isLoading) return <Loader scrimColor="transparent" />;

	return (
		<div className="items-start flex gap-5 py-5 px-6 relative">
			{
				widgets && (
					<>
						<div
							className="flex-shrink-0"
							style={{ height: "600px", width: "360px" }}
						>
							<div className="rounded-2xl bg-card shadow-md overflow-y-hidden">
								<img
									className="aspect-video object-cover"
									src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNjE2NXwwfDF8c2VhcmNofDR8fHN1bnJpc2V8ZW58MHx8fHwxNjYyNzk1ODM3&ixlib=rb-1.2.1&q=80&w=400"
									alt=""
								/>

								<div className="py-3 px-5">
									<div className="">
										<h2 className="text-xl font-semibold">
											Hey Walter,
										</h2>
										<p className="opacity-60">
											Here's how you're looking...
										</p>
									</div>

									<div className="mt-4 -mx-5 px-5 space-y-4">
										<div className="flex items-start">
											<div className="flex-shrink-0 mr-2 -mt-1">
												😋
											</div>
											<div className="flex-1">
												<h2 className="text-base leading-none mb-0.5">
													Lunch order
												</h2>
												<p className="text- opacity-50">
													You ordered Pilau with
													Matunda
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="flex-shrink-0 mr-2 -mt-1">
												🗓
											</div>
											<div className="flex-1">
												<h2 className="text-base leading-none mb-0.5">
													Upcoming meetings
												</h2>
												<p className="text- opacity-50">
													Next meeting is in 5
													minutes.
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="flex-shrink-0 mr-2 -mt-1">
												📋
											</div>
											<div className="flex-1">
												<h2 className="text-base leading-none mb-0.5">
													Pending tasks
												</h2>
												<p className="text- opacity-50">
													2 pending tasks from
													yesterday
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="flex-1 flex gap-5 items-start">
							<div
								className="flex flex-col gap-5"
								style={{ flex: 1 }}
							>
								<WidgetWrapper />
								<WidgetWrapper />
								<WidgetWrapper />
							</div>
							<div
								className="flex flex-col gap-5"
								style={{ flex: 2 }}
							>
								<WidgetWrapper aspectRatio={2 / 1} />
								<WidgetWrapper aspectRatio={1 / 1} />
							</div>
							<div
								className="flex flex-col gap-5"
								style={{ flex: 2 }}
							>
								<WidgetWrapper aspectRatio={2 / 1} />
								<div className="flex gap-5">
									<WidgetWrapper flex={1} />
									<WidgetWrapper flex={1} />
								</div>
								<WidgetWrapper noPadding aspectRatio={2 / 1}>
									<MusicWidget />
								</WidgetWrapper>
							</div>
						</div>
					</>
				)
				// widgets.map((widget) => {
				// 	return (
				// 		<>
				// 			{widget.size === "small" && <SmallWidget />}
				// 			{widget.size === "medium" && <LandscapeWidget />}
				// 			{widget.size === "large" && <LargeWidget />}
				// 			{/* <Widget widget={widget} /> */}
				// 		</>
				// 	);
				// })
			}
		</div>
	);
};

export default Widgets;
