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
} from "@ionic/react";
import { usePageContext } from "./PageProvider";
import DropdownMenu from "@/crotchet/components/DropdownMenu";
import IonicPageContent from "./IonicPageContent";

export default function IonicPage({ inModal, dismiss }) {
	const {
		pageTab,
		tabs: _tabs,
		condensingTitle,
		title: _title,
		pageResolving,
		actions: _actions,
	} = usePageContext();
	const tabs = _tabs();
	const title = _title();
	const actions = _actions();

	return (
		<IonPage>
			<IonHeader translucent mode="ios">
				<IonToolbar {...(inModal ? { mode: "ios" } : {})}>
					<IonButtons slot="start">
						{inModal ? (
							<IonButton
								color="medium"
								onClick={() => dismiss(null, "cancel")}
							>
								Cancel
							</IonButton>
						) : (
							<IonBackButton></IonBackButton>
						)}
					</IonButtons>
					{title && <IonTitle ce>{title}</IonTitle>}
					<IonButtons slot="end">
						{actions?.length > 0 && (
							<DropdownMenu choices={actions}>
								<IonButton size="small" fill="clear">
									<div className="size-7">
										{window.UI.icon("more", { size: 28 })}
									</div>
								</IonButton>
							</DropdownMenu>
						)}
					</IonButtons>

					{tabs?.length && (
						<IonSegment value={pageTab}>
							{tabs.map((tab) => (
								<IonSegmentButton
									key={tab.__id}
									value={tab.value}
								>
									<IonLabel>{tab.label}</IonLabel>
								</IonSegmentButton>
							))}
						</IonSegment>
					)}

					{pageResolving && <IonProgressBar type="indeterminate" />}
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen>
				{title && condensingTitle() && !inModal && (
					<IonHeader collapse="condense" mode="ios">
						<IonToolbar>
							<IonTitle size="large">{title}</IonTitle>
						</IonToolbar>
					</IonHeader>
				)}

				{!pageResolving && <IonicPageContent />}
			</IonContent>
		</IonPage>
	);
}
