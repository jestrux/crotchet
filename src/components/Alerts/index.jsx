import { Children, cloneElement } from "react";
import Button from "../Button";
import Modal, { MessageModal } from "../Modal";

export { default as useAlerts } from "./useAlerts";

export default function AlertsWrapper({ alerts }) {
	function renderActions(alert) {
		if (!alert.actions?.length) return;

		return (
			<div className="w-full flex gap-2">
				<Button
					className="flex-1"
					rounded="md"
					size="sm"
					onClick={() => alert.close(alert.actions[0])}
				>
					<span className="opacity-60">{alert.actions[0]}</span>
				</Button>

				<Button
					className="flex-1"
					rounded="md"
					size="sm"
					onClick={() => alert.close(alert.actions[1])}
				>
					<span
						className={
							alert.actionType === "danger" ? "text-red-500" : ""
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
					showOverlayBg: alert.showOverlayBg,
					hideCloseButton: alert.hideCloseButton,
					isOpen: alert.open,
					size: alert.size,
					invisible: alert.hidden,
					onClose: () => alert.close(),
				};

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
		</>
	);
}
