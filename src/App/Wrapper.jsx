import { AppProvider } from "../providers/AppProvider";
import AlertsWrapper, { useAlerts } from "../components/Alerts";
import App from "./";

// Test sheet
// https://docs.google.com/spreadsheets/d/1xkgPzQYmgndKFy1D6j4ZbZSc5wx0Z3lIP0zlp7FC20Q/edit#gid=1776932801
const AppWrapper = () => {
	const alertThings = useAlerts();

	return (
		<AppProvider
			value={{
				showAlert: alertThings.showAlert,
				confirmAction: alertThings.confirmAction,
				openFormDialog: alertThings.openFormDialog,
				openSettingsDialog: alertThings.openSettingsDialog,
			}}
		>
			<App />

			<div className="fixed isolate translate-x-1 z-[9999]">
				<AlertsWrapper {...alertThings} />
			</div>
		</AppProvider>
	);
};

export default AppWrapper;
