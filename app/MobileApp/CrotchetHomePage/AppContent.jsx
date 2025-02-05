import { useAppContext } from "@/crotchet/providers/AppProvider";
import { useDataLoader } from "@/crotchet/hooks";
import { Widget } from "@/crotchet/components";
import MobileNav from "./Nav";
import Page from "./Page";
import PageSection from "@/crotchet/providers/AppScaffold/Page/PageSection";
import { BottomNavPlaceholder } from "@/crotchet/providers/AppScaffold/Page/PageNav";
import RemoteController from "@/crotchet/providers/Remote/RemoteController";

const HomePage = () => {
	const { data: shortcuts } = useDataLoader({
		handler: () => {
			if (window.globalActions)
				return window
					.globalActions()
					.filter((item) => item.context == "shortcut");

			return [];
		},
		listenForUpdates: "extensions-updated",
	});

	const { data: sections } = useDataLoader({
		handler: () => {
			if (window.sections) return _.values(window.sections);

			return [];
		},
		listenForUpdates: "sections-updated",
	});

	const { data: widgets } = useDataLoader({
		handler: () => {
			if (window.widgets) return _.values(window.widgets);

			return [];
		},
		listenForUpdates: "widgets-updated",
	});

	return (
		<div
			className="flex gap-5 p-6 lg:p-8 fixed inset-0 overflow-auto overscroll-none"
			style={{
				marginTop: "env(safe-area-inset-top)",
			}}
		>
			<div className="hidden lg:block sticky top-0 h-full w-1/3 max-w-[400px] bg-yellow-500 dark:bg-card shadow rounded-2xl overflow-hidden">
				<div className="min-h-full relative p-5 overflow-hidden">
					<div className="mb-5">
						<h2 className="text-3xl font-bold">Hey Walter,</h2>
						<p>Here's how things are looking</p>
					</div>

					{shortcuts && (
						<PageSection type="actions" data={shortcuts} />
					)}

					<div className="absolute inset-x-0 bottom-0">
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
					{widgets?.map((widget) => (
						<Widget key={widget._id} {...widget} />
					))}

					{sections?.map((section, index) => (
						<PageSection
							key={index}
							{...section}
							// onSectionLoaded={onSectionLoaded}
						/>
					))}

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
