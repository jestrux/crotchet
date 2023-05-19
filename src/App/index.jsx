import Widgets from "../Widgets";
import IPFWidgets from "../iPFWidgets";
import { useAuth } from "../providers/AuthProvider";

function App() {
	const { logout } = useAuth();

	return (
		<div className="h-screen flex flex-col bg-canvas text-content">
			<div className="z-10 w-full max-w-[1500px] mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex justify-center items-center pr-16">
					<h1 className="text-2xl leading-none font-bold font-serif">
						Crotchet
					</h1>

					{/* <span className="ml-2 font-sans text-xl leading-none opacity-50">
						&mdash; <span>iPF Softwares</span>
					</span> */}
				</div>

				<div className="flex items-center space-x-2">
					<button className="h-8 px-4 text-content/50 hover:text-content/80 text-xs leading-none uppercase tracking-wide font-bold flex items-center justify-center text-center border border-content/10 hover:border-content/20 bg-content/5 rounded">
						<svg
							className="w-3.5 mr-2 -ml-1"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M0 0h24v24H0z" fill="none" />
							<path d="M22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z" />
						</svg>
						Customize
					</button>

					<button
						className="h-8 px-4 text-content/50 hover:text-content/80 text-xs leading-none uppercase tracking-wide font-bold flex items-center justify-center text-center border border-content/10 hover:border-content/20 bg-content/5 rounded"
						onClick={logout}
					>
						Logout
					</button>
				</div>
			</div>

			<div className="w-full max-w-[1500px] mx-auto flex-1 overflow-y-auto pb-8 px-4">
				<IPFWidgets />
			</div>
		</div>
	);
}

export default App;
