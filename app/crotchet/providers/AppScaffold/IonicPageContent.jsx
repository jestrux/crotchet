import PageSection from "./Page/PageSection";
import { useDataLoader } from "@/crotchet/hooks";
import { usePageContext } from "./PageProvider";
import clsx from "clsx";
import { useState } from "react";
import { randomId } from "@/crotchet/utils";
import { IonItem, IonLabel, IonList } from "@ionic/react";
import GridList from "@/crotchet/components/GridList";
import { MutliGestureButton } from "@/crotchet/components";

const PageAction = () => {
	const { mainAction, scaffold } = usePageContext();
	const action = mainAction();

	if (!action) return null;

	const insetBottom = scaffold.nav ? 0 : 32;

	return (
		<div className="@container-normal fixed inset-x-0 pointer-events-none">
			<div className="hidden @md:flex items-center justify-center fixed top-14 mt-1 left-0 w-24 px-2">
				<button
					className="pointer-events-auto bg-primary text-on-primary shadow dark:border-content/20 size-14 flex items-center justify-center gap-2 rounded-full focus:outline-none"
					onClick={action.handler}
				>
					<span className="size-7">{action.icon}</span>
				</button>
			</div>

			<button
				className="@md:hidden pointer-events-auto bg-primary text-on-primary dark:bg-content dark:text-inverted shadow border border-content/5 dark:border-content/20 fixed bottom-4 right-5 mx-auto z-50 h-11 flex items-center justify-center gap-2 rounded-full px-3.5 focus:outline-none"
				onClick={action.handler}
				style={{
					marginBottom: `${insetBottom}px`,
				}}
			>
				<span className="size-5">{action.icon}</span>
				<span className="mr-1 text-base/none tracking-wide font-semibold">
					{action.label}
				</span>
			</button>
		</div>
	);
};

function IonicPageContent({ onSectionLoaded }) {
	const [pageDataRef, setPageDataRef] = useState(randomId());
	const { page, content: _content, onDataUpdated } = usePageContext();
	const { data: content } = useDataLoader({
		handler: _content,
	});

	onDataUpdated(() => setPageDataRef(randomId()));

	if (!content) return null;

	const pageContent = _.isArray(content) ? content : [content];

	return (
		<>
			<div
				key={pageDataRef}
				className={clsx("max-w-4xl mx-auto space-y-8", {
					"px-5": !page?.noPadding,
				})}
			>
				{/* <div className="py-12 flex justify-center">
                        <Loader />
                    </div> */}
				<div className="space-y-8">
					{pageContent.map((section, index) => (
						<PageSection
							key={index}
							{...section}
							onSectionLoaded={onSectionLoaded}
						/>
					))}
				</div>
			</div>
			<PageAction />
		</>
	);
}

export default function IonicPageContentWrapper({ onSectionLoaded }) {
	const { page, pageData, type } = usePageContext();
	const pageType = type();

	const onClick =
		typeof page?.entryAction != "function"
			? null
			: (action) =>
					window.openActionSheet({
						actions: page.entryAction(action),
						preview: _.pick(action, [
							"icon",
							"image",
							"video",
							"title",
							"subtitle",
						]),
					});
	const onHold =
		typeof page?.entryActions != "function"
			? null
			: (action) =>
					window.openActionSheet({
						actions: page.entryActions(action),
						preview: _.pick(action, [
							"icon",
							"image",
							"video",
							"title",
							"subtitle",
						]),
					});

	if (pageData?.length && ["list", "grid"].includes(pageType)) {
		return (
			<>
				{pageType == "list" && (
					<IonList
						lines="none"
						color="none"
						className="p-0 divide-y divide-content/10 bg-transparent"
					>
						{pageData.map((item) => (
							<MutliGestureButton
								key={item._id}
								className="w-full text-left"
								onClick={onClick}
								onHold={onHold}
							>
								<IonItem color="none">
									<IonLabel>
										<div className="text-lg font-semibold">
											{item.title}
										</div>
										<div className="text-sm opacity-60">
											{item.subtitle}
										</div>
									</IonLabel>
								</IonItem>
							</MutliGestureButton>
						))}
					</IonList>
				)}

				{pageType == "grid" && (
					<div className="p-3">
						<GridList
							data={pageData}
							columns={2}
							{...page?.layoutProps}
							entryAction={page?.entryAction}
							entryActions={page?.entryActions}
						/>
					</div>
				)}

				<PageAction />
			</>
		);
	}

	return <IonicPageContent onSectionLoaded={onSectionLoaded} />;
}
