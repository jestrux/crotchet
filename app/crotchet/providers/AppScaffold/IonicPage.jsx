import {
	IonButtons,
	IonBackButton,
	IonHeader,
	IonContent,
	IonToolbar,
	IonTitle,
	IonPage,
	IonButton,
	IonProgressBar,
	IonSegment,
	IonSegmentButton,
	IonLabel,
	IonFooter,
} from "@ionic/react";
import { usePageContext } from "./PageProvider";
import DropdownMenu from "@/crotchet/components/DropdownMenu";
import IonicPageContent from "./IonicPageContent";
import clsx from "clsx";

export default function IonicPage({ inModal, dismiss }) {
	const {
		pageFilter,
		pageTab,
		setPageTab,
		toolbar: _toolbar,
		type,
		tabs: _tabs,
		condensingTitle,
		title: _title,
		pageResolving,
		actions: _actions,
	} = usePageContext();

	const pageType = type();
	const tabs = _tabs();
	const title = _title();
	const actions = _actions();
	const isMain = ({ priority, icon, type }) =>
		type == "primary" || (priority && icon);
	const mainActions = _.filter(actions, isMain);
	const menuActions = _.filter(actions, _.negate(isMain));
	const toolbar = _toolbar();

	return (
		<IonPage>
			<IonHeader translucent mode="ios">
				<IonToolbar {...(inModal ? { mode: "ios" } : { mode: "md" })}>
					<IonButtons slot="start">
						{inModal ? (
							<IonButton
								color="medium"
								onClick={() => dismiss(null, "cancel")}
							>
								Cancel
							</IonButton>
						) : (
							<IonBackButton text="" />
						)}
					</IonButtons>
					{title && <IonTitle ce>{title}</IonTitle>}
					<IonButtons slot="end" className="pr-2">
						{mainActions?.length > 0 &&
							mainActions.map((action, index) => (
								<button
									key={index}
									size="small"
									onClick={action.handler}
									color="primary"
									className={`ml-3 px-1 inline-flex gap-0.5 items-center ${
										action.type == "primary" &&
										"text-primary"
									}`}
								>
									<div className="size-5 flex items-center">
										{action.icon}
									</div>

									{action.label && (
										<span className="sml-1">
											{action.label}
										</span>
									)}
								</button>
							))}
						{menuActions?.length > 0 && (
							<div className="ml-1">
								<DropdownMenu choices={menuActions}>
									<IonButton size="small" fill="clear">
										<div className="size-7">
											{window.UI.icon("more", {
												size: 28,
											})}
										</div>
									</IonButton>
								</DropdownMenu>
							</div>
						)}
					</IonButtons>
				</IonToolbar>

				{tabs?.length && (
					<div className="-mt-3">
						<IonToolbar
							{...(inModal ? { mode: "ios" } : { mode: "md" })}
						>
							<IonSegment
								value={pageTab}
								onIonChange={(e) => setPageTab(e.detail.value)}
							>
								{tabs.map((tab) => (
									<IonSegmentButton
										key={tab.__id}
										value={tab.value}
									>
										<IonLabel>{tab.label}</IonLabel>
									</IonSegmentButton>
								))}
							</IonSegment>
						</IonToolbar>
					</div>
				)}

				{pageResolving && <IonProgressBar type="indeterminate" />}
			</IonHeader>

			<IonContent fullscreen>
				{/* {title && condensingTitle() && !inModal && (
					<IonHeader collapse="condense" mode="ios">
						<IonToolbar>
							<IonTitle size="large">{title}</IonTitle>
						</IonToolbar>
					</IonHeader>
				)} */}

				{!pageType && <div className="h-5"></div>}

				{!pageResolving && (
					<IonicPageContent key={[pageFilter, pageTab].join(" ")} />
				)}

				<div className="h-16"></div>
			</IonContent>

			{toolbar && !pageResolving && (
				<IonFooter mode="ios" translucent>
					<IonToolbar className="flex items-center justify-center gap-4 px-2">
						{toolbar.map((action, index) => {
							return (
								<div
									key={index}
									className={clsx(
										"text-primary translate-y-1 h-10 flex items-center justify-center gap-2 bg-content/[0.03] rounded-md",
										action.flex ? "flex-1" : "w-10"
									)}
									onClick={action.handler}
								>
									<div className="size-5">{action.icon}</div>
									<IonLabel>{action.label}</IonLabel>
								</div>
							);
						})}
					</IonToolbar>
				</IonFooter>
			)}
		</IonPage>
	);
}
