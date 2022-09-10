import { useEffect } from "react";
import Loader from "./components/Loader";
import useFetch from "./hooks/useFetch";
import Widgets from "./Widgets";

// Test sheet
// https://docs.google.com/spreadsheets/d/1xkgPzQYmgndKFy1D6j4ZbZSc5wx0Z3lIP0zlp7FC20Q/edit#gid=1776932801
function App() {
	const { isLoading, data } = useFetch({
		model: "Users",
		refetchOnWindowFocus: false,
	});

	return (
		<div className="min-h-screen bg-canvas text-content">
			<div className="pt-5 px-6">
				<h1 className="text-2xl font-bold font-serif">Crotchet</h1>
			</div>
			{isLoading ? <Loader scrimColor="transparent" /> : <Widgets />}
		</div>
	);
}

export default App;
