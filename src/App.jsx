import Button from "./components/Button";
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
		<div className="h-screen flex flex-col bg-canvas text-content">
			<div className="z-10 py-1.5 pl-3 pr-2.5 flex items-center justify-between">
				<div className="flex justify-center items-center pr-16">
					<h1 className="text-2xl leading-none font-bold font-serif">
						Crotchet
					</h1>

					<span className="ml-2 font-sans text-xl leading-none opacity-50">
						&mdash; <span>iPF Softwares</span>
					</span>
				</div>

				<div className="flex items-center space-x-2">
					<Button
						className="h-8 border-content/30 mr-3s"
						rounded="full"
					>
						<svg
							className="w-3.5 mr-2"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M0 0h24v24H0z" fill="none" />
							<path d="M22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z" />
						</svg>
						Customize
					</Button>

					<button
						type="button"
						className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						aria-expanded="false"
						aria-haspopup="true"
					>
						<span className="sr-only">Open user menu</span>
						<img
							className="h-10 w-10 rounded-full"
							src="https://s3-alpha.figma.com/profile/143ad103-eea4-4a5a-b8db-e64143205d69"
							alt=""
						/>
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto max-w-[1500px] mx-auto">
				<Widgets />
			</div>
		</div>
	);
}

export default App;
