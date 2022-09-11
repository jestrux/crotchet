import useFetch from "../hooks/useFetch";
import ActivitiesWidget from "./ActivitiesWidget";
import AnnouncementsWidget from "./AnnouncementsWidget";
import TimerWidget from "./TimerWidget";
import GithubContributionsWidget from "./GithubContributionsWidget";
import MusicWidget from "./MusicWidget";
import StayLiquidWidget from "./StayLiquidWidget";
import PollWidget from "./PollWidget";
import ListWidget from "./ListWidget";
import FoodWidget from "./FoodWidget";
import PerformanceWidget from "./PerformanceWidget";

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
							<p className="opacity-80">
								Here's how you're looking...
							</p>
						</div>

						<div className="mt-4 pt-3 border-t border-content/10">
							<h3 className="mb-0.5 text-sm font-semibold opacity-60">
								Overdue tasks
							</h3>

							<ListWidget
								widget={{
									model: "Tasks",
									props: {
										title: "task",
										subtitle: "type::project::due|date",
										status: "status",
									},
								}}
								orderBy="due"
								filters={[
									{ status: "in progress|pending|blocked" },
									{ due: "<today" },
								]}
							/>
						</div>

						<div className="mt-1 pt-3 border-t border-content/10">
							<h3 className="mb-0.5 text-sm font-semibold opacity-60">
								Pings and alerts
							</h3>

							<ListWidget
								widget={{
									model: "Pings",
									props: {
										image: "sender.image",
										title: "content",
										subtitle: "sender.name",
									},
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="flex-1 flex gap-5 items-start">
				<div className="flex flex-col gap-5" style={{ flex: 1 }}>
					<WidgetWrapper widget={StayLiquidWidget} />
					<WidgetWrapper widget={FoodWidget} />
					<WidgetWrapper widget={PollWidget} />
				</div>
				<div className="flex flex-col gap-5" style={{ flex: 2 }}>
					<WidgetWrapper
						aspectRatio={2 / 1}
						widget={PerformanceWidget}
					/>
					<WidgetWrapper
						aspectRatio={1 / 1}
						widget={ActivitiesWidget}
					/>
				</div>
				<div className="flex flex-col gap-5" style={{ flex: 2 }}>
					<WidgetWrapper
						aspectRatio={2 / 1}
						widget={AnnouncementsWidget}
					/>
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
