import useFetch from "../hooks/useFetch";
import ActivitiesWidget from "./ActivitiesWidget";
import AnnouncementsWidget from "./AnnouncementsWidget";
import TimerWidget from "./TimerWidget";
import GithubContributionsWidget from "./GithubContributionsWidget";
import MusicWidget from "./MusicWidget";
import StayLiquidWidget from "./StayLiquidWidget";

const WidgetWrapper = ({
	children,
	widget: Widget,
	width,
	aspectRatio = 1 / 1,
	flex,
}) => {
	return (
		<div
			className="rounded-2xl bg-card shadow-md overflow-y-hidden relative"
			style={{
				width,
				flex,
				aspectRatio,
			}}
		>
			<div className="h-full">
				{children ? children : Widget ? <Widget /> : <span></span>}
			</div>
		</div>
	);
};

const Widgets = () => {
	const { isLoading, data: widgets } = useFetch({
		model: "Widgets",
	});

	return (
		<div className="items-start flex gap-5 py-5 px-6 relative">
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
										You ordered Pilau with Matunda
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
										Next meeting is in 5 minutes.
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
										2 pending tasks from yesterday
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex-1 flex gap-5 items-start">
				<div className="flex flex-col gap-5" style={{ flex: 1 }}>
					<WidgetWrapper widget={StayLiquidWidget} />
					<WidgetWrapper />
					<WidgetWrapper />
				</div>
				<div className="flex flex-col gap-5" style={{ flex: 2 }}>
					<WidgetWrapper
						aspectRatio={2 / 1}
						widget={AnnouncementsWidget}
					/>
					<WidgetWrapper
						aspectRatio={1 / 1}
						widget={ActivitiesWidget}
					/>
				</div>
				<div className="flex flex-col gap-5" style={{ flex: 2 }}>
					<WidgetWrapper aspectRatio={2 / 1} />
					<div className="flex gap-5">
						<WidgetWrapper widget={TimerWidget} flex={1} />
						<WidgetWrapper
							flex={1}
							widget={GithubContributionsWidget}
						/>
					</div>
					<WidgetWrapper aspectRatio={2 / 1} widget={MusicWidget} />
				</div>
			</div>
		</div>
	);
};

export default Widgets;
