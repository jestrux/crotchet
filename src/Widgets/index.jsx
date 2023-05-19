import ActivitiesWidget from "./ActivitiesWidget";
import AnnouncementsWidget from "./AnnouncementsWidget";
import TimerWidget from "./TimerWidget";
import GithubContributionsWidget from "./GithubContributionsWidget";
import MusicWidget from "./MusicWidget";
import StayLiquidWidget from "./StayLiquidWidget";
import PollWidget from "./PollWidget";
import ListWidget from "../components/ListWidget";
import WidgetWrapper from "../components/WidgetWrapper";
import FoodWidget from "./FoodWidget";
import PerformanceWidget from "./PerformanceWidget";
import UserPerformanceWidget from "./UserPerformanceWidget";
import PingsWidget from "./PingsWidget";
import UserStatusWidget from "./UserStatusWidget";
import { useAuth } from "../providers/AuthProvider";

const Widgets = () => {
	const { user } = useAuth();

	// const userImage = "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNjE2NXwwfDF8c2VhcmNofDR8fHN1bnJpc2V8ZW58MHx8fHwxNjYyNzk1ODM3&ixlib=rb-1.2.1&q=80&w=400";
	const coverImage =
		"https://images.unsplash.com/photo-1540175951029-16f54532b0eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNjE2NXwwfDF8c2VhcmNofDI4Nnx8ZmFsbHxlbnwwfHx8fDE2NjI5NTkxMzY&ixlib=rb-1.2.1&q=80&w=1080";

	return (
		<div className="grid md:grid-cols-2 lg:flex items-start gap-5 relative">
			<div className="md:sticky md:top-0 w-full lg:w-[380px] flex-shrink-0">
				<div className="relative z-10 rounded-2xl bg-card shadow-md overflow-y-hidden">
					<div
						className="relative bg-card"
						style={{ height: "170px" }}
					>
						<img
							className="absolute inset-0 h-full w-full object-cover"
							src={coverImage}
							alt=""
						/>

						<div className="absolute inset-0 sbg-black/60 bg-gradient-to-b from-transparent via-95% via-card/95 to-card flex items-end">
							<div className="w-full px-5 flex sflex-col md:flex-row sjustify-center md:justify-start stext-center md:text-left items-center">
								<img
									className="flex-shrink-0 h-16 w-16 object-cover object-top rounded-full bg-content/10 border-2 border-content/10"
									src={user.image}
									alt=""
								/>

								<div className="pt-2 ml-4 flex items-end">
									<div className="w-full">
										<h2 className="mb-1 text-lg leading-none font-bold font-serif">
											{user.name}
										</h2>
										<p className="text-sm flex items-center">
											<span className="opacity-70">
												Entertainment
												{/* Here's how you're looking... */}
											</span>

											<span className="mx-1.5 font-bold opacity-70">
												&middot;
											</span>
											<button className="opacity-70 hover:opacity-100 underline h-5 text-xs leading-none flex items-center">
												Change profile
											</button>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="p-5 flex flex-col gap-3 sdivide-y divide-content/10">
						<div className="hidden md:block">
							<h3 className="mb-0.5 text-xs font-bold uppercase tracking-wide opacity-50">
								Overdue tasks
							</h3>

							<ListWidget
								table="tasks"
								title="title"
								subtitle="type::project::due|date"
								status="status"
								orderBy="due"
								filters={{
									status: "in progress|pending|blocked",
									// due: "<today", // causes bug on Safari
								}}
								limit={5}
							/>
						</div>

						<div className="hidden md:block">
							<h3 className="mb-0.5 text-xs font-bold uppercase tracking-wide opacity-50">
								Pings and alerts
							</h3>

							<ListWidget
								table="pings"
								image="sender_image"
								title="content"
								subtitle="sender_name"
								action="link"
								filters={{
									recepient_name: user.name,
								}}
								limit={3}
							/>
						</div>

						<div className="">
							<h3 className="mb-2 text-xs font-bold uppercase tracking-wide opacity-50">
								Quick actions
							</h3>

							<div className="grid grid-cols-2 gap-1.5">
								<button className="text-content/50 hover:text-content/80 text-xs leading-none uppercase tracking-wide font-bold py-3.5 w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded">
									Open an issue
								</button>
								<button className="text-content/50 hover:text-content/80 text-xs leading-none uppercase tracking-wide font-bold py-3.5 w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded">
									Ping someone
								</button>
								<button className="text-content/50 hover:text-content/80 text-xs leading-none uppercase tracking-wide font-bold py-3.5 w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded">
									Announcement
								</button>
								<button className="text-content/50 hover:text-content/80 text-xs leading-none uppercase tracking-wide font-bold py-3.5 w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded">
									Schedule meeting
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex-1 flex flex-col xl:grid grid-cols-4 desktop:grid-cols-5 gap-5 items-start">
				<div
					className="col-span-4 desktop:col-span-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 desktop:flex flex-col gap-5"
					style={{ flex: 1 }}
				>
					<WidgetWrapper widget={StayLiquidWidget} />
					<WidgetWrapper widget={FoodWidget} />
					<WidgetWrapper widget={PollWidget} />
					<WidgetWrapper aspectRatio={3.5 / 1} flex={1} />
				</div>
				<div className="w-full col-span-2 flex flex-col gap-5">
					<div className="flex gap-3">
						<WidgetWrapper
							aspectRatio={2.8 / 1}
							flex={1}
							widget={UserPerformanceWidget}
						/>
						<WidgetWrapper
							aspectRatio={2.8 / 1}
							flex={1}
							widget={UserStatusWidget}
						/>
					</div>
					<WidgetWrapper
						aspectRatio={2 / 1}
						widget={PerformanceWidget}
					/>
					<WidgetWrapper
						aspectRatio={1 / 1.03}
						widget={ActivitiesWidget}
					/>
				</div>
				<div className="w-full col-span-2 flex flex-col gap-5">
					<WidgetWrapper
						aspectRatio={2 / 1}
						widget={AnnouncementsWidget}
					/>
					<WidgetWrapper aspectRatio={5.5 / 1} widget={PingsWidget} />
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
