import { useState, Children, cloneElement, useRef } from "react";
import {
	Modal,
	MessageModal,
	Button,
	ActionSheet,
} from "@/crotchet/components";
import { dispatch, isReactComponent, randomId } from "@/crotchet/utils";
import ErrorBoundary from "../components/ErrorBoundary";
import { useOnInit } from "@/crotchet/hooks";

const ToastMessage = ({ message, onClose, duration = 3000 }) => {
	const toastTimerRef = useRef();

	useOnInit(() => {
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

		toastTimerRef.current = setTimeout(() => {
			onClose(null);
		}, duration);
	}, []);

	return (
		<div
			className="fixed inline-flex items-center top-14 h-7s py-2 px-3 z-[999999] bg-content/95 text-on-content text-xs drop-shadow-sm rounded-full -translate-x-1/2 left-1/2"
			style={{
				marginTop: "env(safe-area-inset-top)",
			}}
		>
			{message}
		</div>
	);
};

export function AlertsWrapper() {
	const { alerts, ...alertThings } = useAlerts();

	Object.assign(window, alertThings);

	function renderActions(alert) {
		if (!alert.actions?.length) return;

		return (
			<div className="w-full flex gap-2">
				<Button
					variant="outline"
					className="flex-1"
					size="sm"
					onClick={() => alert.close(alert.actions[0])}
				>
					{alert.actions[0]}
				</Button>

				<Button
					className="flex-1"
					size="sm"
					color={alert.dangerous ? "danger" : null}
					onClick={() => alert.close(alert.actions[1])}
				>
					{alert.actions[1]}
				</Button>
			</div>
		);
	}

	return (
		<ErrorBoundary className="py-32 z-50">
			{alerts.map((alert) => {
				const props = {
					showOverlayBg: alert.showOverlayBg,
					hideCloseButton: alert.hideCloseButton,
					isOpen: alert.open,
					size: alert.size,
					invisible: alert.hidden,
					onClose: () => alert.close(),
				};

				if (alert.type == "toast") {
					return (
						<ToastMessage
							key={alert.id}
							message={alert.message}
							onClose={(data) => alert.close(data)}
						/>
					);
				}

				if (alert.type == "sheet") {
					return (
						<ActionSheet
							key={alert.id}
							{...alert}
							onClose={(data) => alert.close(data)}
						>
							{Children.map(alert.content, (child) => {
								return !isReactComponent(child)
									? child
									: cloneElement(child, {
											dismiss: alert.close,
											onClose: alert.close,
									  });
							})}
						</ActionSheet>
					);
				}

				if (alert.content) {
					return (
						<Modal
							dismissible={alert.dismissible ?? true}
							key={alert.id}
							{...props}
						>
							{Children.map(alert.content, (child) =>
								cloneElement(child, { onClose: alert.close })
							)}
						</Modal>
					);
				}

				return (
					<MessageModal
						key={alert.id}
						{...props}
						title={alert.title}
						message={alert.message}
						actions={renderActions(alert)}
					/>
				);
			})}
		</ErrorBoundary>
	);
}

export function useAlerts() {
	const [alerts, setAlerts] = useState([]);

	const notifyParent = (id, status) => {
		const spotlightParent = document.querySelector("[data-current-page]");

		if (!spotlightParent) return console.log("No parent found!!");

		if (status) spotlightParent.classList.add(`alert-open-${id}`);
		else {
			setTimeout(() => {
				spotlightParent.classList.remove(`alert-open-${id}`);
				dispatch("alert-closed");
			}, 300);
		}
	};

	const hideAlert = (alertId) => {
		setAlerts((alerts) => alerts.filter(({ id }) => id !== alertId));
		notifyParent(alertId, false);
	};

	const showAlert = (alert) => {
		alert = typeof alert == "string" ? { message: alert } : alert;
		const promise = new Promise((resolve) => {
			const oldCallback = alert.callback || ((data) => data);
			alert.callback = (data) => resolve(oldCallback(data));
		});

		const id = randomId();

		alert = {
			...alert,
			id,
			open: true,
			close(data) {
				alert.callback(data);
				hideAlert(alert.id);
			},
		};

		if (alert.replace) alerts.at(-1)?.callback();

		setAlerts((alerts) => {
			const currentValue = !alert.replace
				? alerts
				: alerts.filter(({ id }) => id !== alerts.at(-1)?.id);

			notifyParent(id, true);

			return [...currentValue, alert];
		});

		if (typeof alert.onCreate == "function") alert.onCreate(alert);

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
			...(props.dialogProps ?? {}),
			content: { ...defaultProps, ...props },
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
			hideCloseButton: true,
		};

		alert.actions = [alert.cancelText, alert.okayText];
		alert.callback = (action) => action === alert.okayText;

		return showAlert(alert);
	}

	function confirmDangerousAction() {
		return confirmAction({ dangerous: true });
	}

	const openActionSheet = (userProps = {}) =>
		showAlert({
			...userProps,
			type: "sheet",
		});

	const showToast = (...message) =>
		showAlert({
			message: [...message].join(" "),
			type: "toast",
		});

	return {
		alerts,
		confirmAction,
		confirmDangerousAction,
		showAlert,
		hideAlert,
		openActionDialog,
		openActionSheet,
		showToast,
	};
}
