import { useRef, useState } from "react";
import {
	IonButtons,
	IonButton,
	IonHeader,
	IonContent,
	IonToolbar,
	IonTitle,
	IonPage,
	IonModal,
} from "@ionic/react";

import { usePageContext } from "@/crotchet/providers/AppScaffold/PageProvider";
import IonicPage from "../providers/AppScaffold/IonicPage";

const IonicModalForm = ({ children, dismiss }) => {
	const { title: _title, mainAction } = usePageContext();
	const stateRef = useRef(null);

	const title = _title();
	const action = mainAction();

	return (
		<IonPage>
			<IonHeader mode="ios">
				<IonToolbar mode="ios">
					<IonButtons slot="start">
						<IonButton
							color="medium"
							onClick={() => dismiss(null, "cancel")}
						>
							Cancel
						</IonButton>
					</IonButtons>
					<IonTitle>{title}</IonTitle>
					<IonButtons slot="end">
						{action && (
							<IonButton
								onClick={() =>
									dismiss(stateRef.current, "confirm")
								}
								strong={true}
							>
								{action?.label || "Submit"}
							</IonButton>
						)}
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding" fullscreen>
				{typeof children == "function"
					? children({
							updateState: (value) => (stateRef.current = value),
							dismiss,
					  })
					: children}
			</IonContent>
		</IonPage>
	);
};

export default function IonicModal({ children }) {
	const [isOpen, setIsOpen] = useState(true);
	const { page } = usePageContext();

	async function dismiss(payload) {
		if (!payload) return setIsOpen(false);

		const res = await page.onSubmit(payload);

		console.log("Submit res: ",res);

		if (res === null) return;

		setIsOpen(false);
	}

	return (
		<IonModal isOpen={isOpen}>
			{page?.type == "form" && (
				<IonicModalForm dismiss={dismiss}>{children}</IonicModalForm>
			)}
			{page?.type != "form" && <IonicPage inModal dismiss={dismiss} />}
		</IonModal>
	);
}
