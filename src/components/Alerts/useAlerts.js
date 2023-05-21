import { useState } from "react";
import { randomId } from "../../utils";
import ActionPane from "../ModalPanes/ActionPane";

export default function useAlerts() {
	const [alerts, setAlerts] = useState([]);

	const hideAlert = (alertId) => {
		setAlerts(
			alerts.map((alert) => {
				if (alert.id === alertId) return { ...alert, open: false };
				return alert;
			})
		);

		setTimeout(() => {
			setAlerts(alerts.filter(({ id }) => id !== alertId));
		}, 300);
	};

	const showAlert = (alert) => {
		const promise = new Promise((resolve) => {
			const oldCallback = alert.callback || ((data) => data);
			alert.callback = (data) => resolve(oldCallback(data));
		});

		const alertId = randomId();
		setAlerts([
			...(alerts || []),
			{
				...alert,
				id: alertId,
				open: true,
				close(data) {
					alert.callback(data);
					hideAlert();
				},
			},
		]);

		return promise;
	};

	function openActionDialog(props) {
		const defaultProps = {
			title: "",
			type: "form",
			action: "Submit",
			successMessage: "Success",
		};

		return showAlert({
			hideCloseButton: !!props?.title?.length,
			size: props.dialogSize ?? "md",
			content: <ActionPane pane={{ ...defaultProps, ...props }} />,
		});
	}

	function confirmAction(userProps = {}) {
		const alert = {
			type: "confirm",
			size: "xs",
			title: "Are you sure?",
			message: "This action can not be undone",
			cancelText: "Cancel",
			okayText: "Yes, Continue",
			...(userProps || {}),
		};

		alert.actions = [alert.cancelText, alert.okayText];
		alert.callback = (action) => action === alert.okayText;

		return showAlert(alert);
	}

	return {
		alerts,
		confirmAction,
		showAlert,
		hideAlert,
		openActionDialog,
	};
}
