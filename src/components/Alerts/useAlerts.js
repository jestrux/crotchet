import { useState } from "react";
import { randomId } from "../../utils";

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
			const oldCallback = alert.callback || (() => {});
			alert.callback = (...args) => resolve(oldCallback(...args));
		});

		setAlerts([
			...(alerts || []),
			{
				...alert,
				id: randomId(),
				open: true,
			},
		]);

		return promise;
	};

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
	};
}
