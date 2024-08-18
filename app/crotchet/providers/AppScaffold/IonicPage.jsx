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
} from "@ionic/react";
import { usePageContext } from "./PageProvider";
import DropdownMenu from "@/crotchet/components/DropdownMenu";
import IonicPageContent from "./IonicPageContent";

export default function IonicPage({ inModal, dismiss }) {
	const {
		title: _title,
		pageResolving,
		actions: _actions,
	} = usePageContext();
	const title = _title();
	const actions = _actions();

	return (
		<IonPage>
			<IonHeader translucent>
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

					{pageResolving && <IonProgressBar type="indeterminate" />}
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen>
				{title && !inModal && (
					<IonHeader collapse="condense">
						<IonToolbar>
							<IonTitle size="large">{title}</IonTitle>
						</IonToolbar>
					</IonHeader>
				)}

				<IonicPageContent />
			</IonContent>
		</IonPage>
	);
}
