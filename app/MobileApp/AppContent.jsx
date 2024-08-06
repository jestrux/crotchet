import { useAppContext } from "@/crotchet/providers/AppProvider";
import { useDataLoader } from "@/crotchet/hooks";
import { Widget } from "@/crotchet/components";
import MobileNav from "./Nav";
import Page from "./Page";

const HomePage = () => {
	// useOnInit(() => {
	// 	queryDb("__crotchetHomeWidgets", {
	// 		onChange: setWidgets,
	// 	});
	// });

	const { data: widgets } = useDataLoader({
		handler: () => {
			if (window.widgets) return _.values(window.widgets);

			return [];
		},
		listenForUpdates: (callback = () => {}) => {
			const event = "widgets-updated";
			window.addEventListener(event, callback, false);
			return () => window.removeEventListener(event, callback, false);
		},
	});

	return (
		<div>
			<div className="mt-8 mb-6">
				<h2 className="text-3xl font-bold">Hey Walter,</h2>
				<p>Here's how things are looking</p>
			</div>

			<div className="-mx-0.5 grid grid-cols-2 lg:grid-cols-4 gap-3">
				{widgets?.map((widget) => (
					<div key={widget._id} className="col-span-2">
						<Widget {...widget} />
					</div>
				))}
			</div>
		</div>
	);
};

export default function AppContent() {
	const { pages, popPage } = useAppContext();
	const rootPage = {
		id: "root",
		_id: "root",
		type: "detail",
		content: <HomePage />,
	};

	return (
		<>
			<Page page={rootPage} isOpen={!pages.length} />

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

			<MobileNav />
		</>
	);
}
