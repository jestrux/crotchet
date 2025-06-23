import { useAppContext } from "@/crotchet/providers/AppProvider";
import { useDataLoader } from "@/crotchet/hooks";
import { Widget } from "@/crotchet/components";
import MobileNav from "./Nav";
import Page from "./Page";
import PageSection from "@/crotchet/providers/AppScaffold/Page/PageSection";
import { BottomNavPlaceholder } from "@/crotchet/providers/AppScaffold/Page/PageNav";
import RemoteController from "@/crotchet/providers/Remote/RemoteController";
import { useMobileActions } from "./useMobileActions";
import ActionGrid from "@/crotchet/components/ActionGrid";
import { getPreference } from "@/crotchet/utils";

const HomePage = () => {
	const { data: shortcuts } = useDataLoader({
		handler: () => {
			if (window.globalActions)
				return window
					.globalActions()
					.filter((item) => item.context == "shortcut");

			return [];
		},
		listenForUpdates: "app-actions-updated",
	});

	const { actionSections } = useMobileActions();

	const { data: homePageContent } = useDataLoader({
		handler: async () => {
			const content = await getPreference("homePageContent", []);
			return content
				.map(({ name }) => {
					if (name.toString().startsWith("widget") && window.widgets)
						return {
							type: "widget",
							content: window.widgets[name.substring(6)] ?? null,
						};
					else if (
						name.toString().startsWith("section") &&
						window.sections
					)
						return {
							type: "section",
							content: window.sections[name.substring(7)] ?? null,
						};

					return null;
				})
				.filter((i) => i.content);
		},
		listenForUpdates: [
			"sections-updated",
			"widgets-updated",
			"home-page-content-updated",
		],
	});

	return (
		<div
			className="flex gap-5 p-6 lg:p-8 fixed inset-0 overflow-auto overscroll-none"
			style={{
				marginTop: "env(safe-area-inset-top)",
			}}
		>
			<div className="hidden lg:block sticky top-0 h-full w-1/3 max-w-[400px] bg-yellow-500 dark:bg-card shadow rounded-2xl overflow-hidden">
				<div className="h-full flex flex-col relative overflow-hidden">
					<div className="mt-5 w-full px-4 ml-0.5">
						<h2 className="text-3xl font-bold">Hey Walter,</h2>
						<p>Here's how things are looking</p>
					</div>

					<div className="mt-4 mx-3 flex-1 space-y-4 overflow-auto">
						{shortcuts && (
							<ActionGrid
								title="Shorcuts"
								smallTitle
								data={shortcuts}
								type="inline"
								fallbackIcon={
									<svg
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
										/>
									</svg>
								}
							/>
						)}

						{actionSections.map(([section, actions], index) => {
							return (
								<ActionGrid
									key={"section" + index}
									title={section}
									smallTitle
									data={actions}
									type="inline"
									fallbackIcon={
										<svg
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
											/>
										</svg>
									}
								/>
							);
						})}
					</div>

					<div className="contents">
						<RemoteController flat />
					</div>
				</div>
			</div>

			<div className="pt-1 flex-1">
				<div className="lg:hidden mb-6">
					<div className="mb-5">
						<h2 className="text-3xl font-bold">Hey Walter,</h2>
						<p>Here's how things are looking</p>
					</div>

					{shortcuts && (
						<PageSection type="actions" data={shortcuts} />
					)}
				</div>

				<div className="grid gap-6 max-w-xl mx-auto">
					{homePageContent?.map((entry, index) =>
						entry.type == "section" ? (
							<PageSection
								key={entry.content._id + index}
								{...entry.content}
							/>
						) : (
							<Widget
								key={entry.content._id + index}
								{...entry.content}
							/>
						)
					)}

					<BottomNavPlaceholder />
				</div>
			</div>
		</div>
	);
};

export default function AppContent() {
	const { pages, popPage } = useAppContext();

	return (
		<>
			<HomePage />

			{pages.map((page) => (
				<Page
					key={page.id}
					isOpen={page.id == pages.at(-1).id}
					page={page}
					onClose={(data) => popPage(page.id, data)}
				>
					{page.content}
				</Page>
			))}

			<div className="lg:hidden">
				<MobileNav />
			</div>
		</>
	);
}
