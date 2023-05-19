import { AuthProvider } from "../providers/AuthProvider";
import App from "./";

// Test sheet
// https://docs.google.com/spreadsheets/d/1xkgPzQYmgndKFy1D6j4ZbZSc5wx0Z3lIP0zlp7FC20Q/edit#gid=1776932801
const AppWrapper = () => {
	const samples = [
		{
			user_name: "Walter Kimaro",
		},
		{
			user_name: "!Walter Kimaro",
		},
		{
			"recepient_name": "Walter Kimaro", // "user_email",
		},
		{
			status: "in progress|pending",
			// due: "<today"
		},
	];
	// console.log(samples.map(airtableFilter));

	return (
		<AuthProvider>
			<App />
		</AuthProvider>
	);
};

export default AppWrapper;
