import useFetch from "../hooks/useFetch";
import { AuthProvider } from "../providers/AuthProvider";
import App from "./";

// Test sheet
// https://docs.google.com/spreadsheets/d/1xkgPzQYmgndKFy1D6j4ZbZSc5wx0Z3lIP0zlp7FC20Q/edit#gid=1776932801
const AppWrapper = () => {
	return (
		<AuthProvider>
			<App />
		</AuthProvider>
	);
};

export default AppWrapper;
