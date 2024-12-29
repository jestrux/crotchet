import { useAppContext } from "@/crotchet/providers/AppProvider";
import { useDataLoader } from "@/crotchet/hooks";
import { Widget } from "@/crotchet/components";
import MobileNav from "./Nav";
import Page from "./Page";
import PageSection from "@/crotchet/providers/AppScaffold/Page/PageSection";

const HomePage = () => {
	// useOnInit(() => {
	// 	queryDb("__crotchetHomeWidgets", {
	// 		onChange: setWidgets,
	// 	});
	// });

	const quickActions = [
		{
			// title: "Project",
			type: "actions",
			data: [
				{
					icon: window.UI.svg(
						"M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z"
					),
					label: "Departments",
				},
				{
					icon: window.UI.svg(
						"M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
					),
					label: "Settings",
				},
				{
					icon: window.UI.svg(
						"M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
					),
					label: "Admins",
					handler: () => window.pushPage("setHeroCallsheets"),
				},
				{
					icon: window.UI.svg(
						"M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
					),
					label: "Scenes",
				},
				{
					icon: window.UI.svg(
						"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
					),
					label: "Locations",
					handler: () => window.pushPage("setHeroCallsheets"),
				},
			],
		},
		// {
		// 	title: "People",
		// 	type: "actions",
		// 	meta: {
		// 		inline: true,
		// 	},
		// 	data: [
		// 		{
		// 			icon: window.UI.svg(
		// 				"M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
		// 			),
		// 			label: "Crew",
		// 		},
		// 		{
		// 			icon: window.UI.svg(
		// 				"M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
		// 			),
		// 			label: "Talent",
		// 			handler: () => window.pushPage("setHeroCallsheets"),
		// 		},
		// 		{
		// 			icon: window.UI.svg(
		// 				"M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
		// 			),
		// 			label: "Clients",
		// 		},
		// 	],
		// },
	];

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
		<div>
			<div className="mt-4 mb-5">
				<h2 className="text-3xl font-bold">Hey Walter,</h2>
				<p>Here's how things are looking</p>
			</div>

			<div className="-mx-0.5 grid grid-cols-2 lg:grid-cols-5 gap-5">
				{/* {quickActions?.map((section, index) => (
					<div key={index} className="col-span-2">
						<PageSection key={index} {...section} />
					</div>
				))} */}
				{shortcuts && (
					<div className="col-span-2">
						<PageSection type="actions" data={shortcuts} />
					</div>
				)}

				{widgets?.map((widget) => (
					<div key={widget._id} className="py-1 col-span-2">
						<Widget {...widget} />
					</div>
				))}

				{sections?.map((section, index) => (
					<div key={index} className="col-span-2">
						<PageSection
							key={index}
							{...section}
							// onSectionLoaded={onSectionLoaded}
						/>
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
