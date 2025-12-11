import { registerAction } from "@/crotchet";

export default function localNotification() {
	const icon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 16 16"
			fill="currentColor"
		>
			<path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
		</svg>
	);

	registerAction("showLocalNotification", {
		label: "Notify Me",
		global: true,
		mobileOnly: true,
		color: "#8B5CF6",
		icon,
		handler: async () => {
			try {
				// Get notification title
				const title = await window.openFloatingForm(
					"Notification Title",
					"Test Notification"
				);

				if (!title) return;

				// Get notification message
				const message = await window.openFloatingForm(
					"Notification Message",
					"Hello from Crotchet!"
				);

				if (!message) return;

				// Send local notification
				window.showLocalNotification(title, message);

				// Hide app and let notification appear
				window.hideApp();
			} catch (error) {
				window.showToast(
					error?.message || "Error sending notification"
				);
			}
		},
	});
}
