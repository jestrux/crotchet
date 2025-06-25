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
import { getPreference, randomId } from "@/crotchet/utils";
import { useState } from "react";

const HomePage = () => {
	const [shortcutsKey, setShortcutsKey] = useState(randomId());

	const { data: shortcuts } = useDataLoader({
		handler: async () => {
			const shortcuts = await getPreference("homePageShortcuts", [
				"clipboard",
			]);

			const shortcutStyle = await getPreference(
				"homePageShortcutStyle",
				"grid"
			);

			if (!shortcuts.length || !window.globalActions) return [];

			const mappedShortctuts = shortcuts
				.reduce((agg, name) => {
					const action = window.actions[name];
					if (action) {
						// eslint-disable-next-line no-unused-vars
						const { color, ...actionWithoutColor } = action;
						agg.push(
							shortcutStyle == "grid"
								? actionWithoutColor
								: action
						);
					}
					return agg;
				}, [])
				.filter((a) => a);

			setShortcutsKey(randomId());

			return { list: mappedShortctuts, style: shortcutStyle };
		},
		listenForUpdates: [
			"app-actions-updated",
			"home-page-shortcuts-updated",
		],
	});

	const { data: homePageContent } = useDataLoader({
		handler: async () => {
			const content = await getPreference("homePageContent", []);

			return content
				.map((nameWithType) => {
					let content;
					const [type, name] = nameWithType.split("~#~");

					if (type == "widget")
						content =
							(window.widgets && window.widgets[name]) ?? null;
					else if (type == "section")
						content =
							(window.sections && window.sections[name]) ?? null;

					return {
						type,
						name: nameWithType,
						content,
					};
				})
				.filter((i) => i.content);
		},
		listenForUpdates: [
			"sections-updated",
			"widgets-updated",
			"home-page-content-updated",
		],
	});

	const { actionSections } = useMobileActions();

	return (
		<div className="flex gap-5 p-6 lg:p-8 fixed inset-0 overflow-auto overscroll-none">
			<div className="hidden lg:block sticky top-0 h-full w-1/3 max-w-[400px] bg-yellow-500 dark:bg-card shadow rounded-2xl overflow-hidden">
				<div className="h-full flex flex-col relative overflow-hidden">
					<div className="mt-5 w-full px-4 ml-0.5">
						<h2 className="text-3xl font-bold">Hey Walter,</h2>
						<p>Here's how things are looking</p>
					</div>

					<div className="mt-4 mx-3 flex-1 space-y-4 overflow-auto">
						{shortcuts && (
							<ActionGrid
								key={shortcutsKey}
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
				<div
					className="sticky -mx-6 -top-6 z-[999] backdrop-blur-[3px]"
					style={{
						height: "env(safe-area-inset-top)",
						mask: `linear-gradient(black, black, transparent)`,
					}}
				></div>

				<div className="lg:hidden mb-6">
					<div className="mb-5">
						<h2 className="text-3xl font-bold">Hey Walter,</h2>
						<p>Here's how things are looking</p>
					</div>

					{shortcuts && (
						<PageSection
							key={shortcutsKey}
							type="actions"
							data={shortcuts.list}
							meta={{
								style: shortcuts.style,
								fallbackIcon: (
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
								),
							}}
						/>
					)}
				</div>

				<div className="grid gap-6 max-w-xl mx-auto">
					{homePageContent?.map((entry, index) =>
						entry.type == "section" ? (
							<PageSection
								key={entry.name + index}
								{...entry.content}
							/>
						) : (
							<Widget
								key={entry.name + index}
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
