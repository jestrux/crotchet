import Button from "../Button";
import Modal, { MessageModal } from "../Modal";

export { default as useAlerts } from "./useAlerts";

export default function AlertsWrapper({ alerts, hideAlert }) {
	function handleClose(alert, action) {
		const alertId = alert.id;

		alert.callback(action);

		setTimeout(() => hideAlert(alertId), 100);
	}

	function renderActions(alert) {
		return (
			<div className="w-full flex gap-2">
				<Button
					className="flex-1"
					rounded="md"
					size="sm"
					onClick={() => handleClose(alert, alert.actions[0])}
				>
					<span className="opacity-60">{alert.actions[0]}</span>
				</Button>

				<Button
					className="flex-1"
					rounded="md"
					size="sm"
					onClick={() => handleClose(alert, alert.actions[1])}
				>
					<span
						className={
							alert.actionType == "danger" ? "text-red-500" : ""
						}
					>
						{alert.actions[1]}
					</span>
				</Button>
			</div>
		);
	}

	return (
		<>
			{alerts.map((alert) => {
				const props = {
					hideCloseButton: alert.hideCloseButton,
					isOpen: alert.open,
					size: alert.size,
					onClose: () => handleClose(alert, alert.actions?.[0]),
				};

				if (alert.content) {
					return (
						<Modal
							dismissible={alert.dismissible ?? true}
							key={alert.id}
							{...props}
						>
							{alert.content}
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
		</>
	);
}
