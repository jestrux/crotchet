import IPFWidgets from "../iPFWidgets";
import { useAppContext } from "../providers/AppProvider";
import Dropdown from "../components/Dropdown";

const MenuItem = ({ active, children, onClick = () => {} }) => {
	return (
		<button
			className={`${
				active
					? "bg-content/5 dark:bg-content/10 border-content/10"
					: "border-transparent"
			} h-8 group flex items-center border rounded-full py-2.5 px-6 text-content/10 dark:text-transparent`}
			style={{
				boxShadow: !active ? "" : "inset 1px 1px 5px currentColor",
			}}
			onClick={onClick}
		>
			<span
				className="text-xs leading-none font-bold text-content"
				style={{ opacity: active ? 1 : 0.5 }}
			>
				{children}
			</span>
		</button>
	);
};

const AppNavigation = () => {
	const { currentPage, setCurrentPage } = useAppContext();
	const pages = ["Home", "Reports", "Learning"];

	// return null;

	return (
		<div className="pointer-events-auto inline-flex justify-center items-center mr-12 p-1 rounded-full bg-card/80 backdrop-blur dark:border border-content/5 shadow">
			{pages.map((page, index) => (
				<MenuItem
					key={index}
					active={page === currentPage}
					onClick={() => setCurrentPage(page)}
				>
					{page}
				</MenuItem>
			))}
		</div>
	);
};

function App() {
	const { user, updateUser, logout, openActionDialog } = useAppContext();
	const lightWallpaper =
		"https://images.unsplash.com/photo-1682687981974-c5ef2111640c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxNjE2NXwxfDF8c2VhcmNofDh8fHdhbGxwYXBlcnxlbnwwfHx8fDE2ODQ1NzU5MDJ8MA&ixlib=rb-4.0.3&q=80&w=1080";
	// const darkWallpaper =
	// 	"https://images.unsplash.com/photo-1506794778225-cbf6c8df4c5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
	const darkWallpaper =
		"https://images.unsplash.com/photo-1488767136043-c1eb91ca932d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

	const editUserPreferences = () => {
		const preferences = user.preferences;

		openActionDialog({
			type: "settings",
			title: "Edit preferences",
			settings: preferences,
			onSave(updatedProps) {
				updateUser({
					preferences: {
						...preferences,
						...updatedProps,
					},
				});
				return updatedProps;
			},
		});
	};

	return (
		<div className="min-h-screen bg-canvas text-content">
			{user.preferences?.wallpaper && (
				<div className="pointer-events-none">
					<div
						className="bg-cover fixed inset-0 dark:hidden"
						style={{
							backgroundImage: `url("${lightWallpaper}")`,
						}}
					></div>
					<div
						className="bg-cover fixed inset-0 hidden dark:block"
						style={{
							backgroundImage: `url("${darkWallpaper}")`,
						}}
					></div>
				</div>
			)}

			<div className="pointer-events-none sticky top-1 z-50 h-14 flex items-center justify-between">
				<div className="pointer-events-auto flex justify-center items-center pl-3 pr-5 h-11 rounded-r-full bg-card/80 backdrop-blur dark:border border-l-0 border-content/5 shadow">
					<h1 className="text-lg leading-none font-bold font-serif">
						Crotchet
					</h1>
				</div>

				<AppNavigation />

				<Dropdown
					className="pointer-events-auto"
					options={["Customize", "Logout"]}
					onSelect={(_, index) => {
						if (index === 0) {
							editUserPreferences();
						} else logout();
					}}
				>
					<div className="w-full">
						<img
							className="flex-shrink-0 h-10 aspect-square object-cover object-top rounded-full bg-content/10 border-2 border-content/10"
							src={user.image}
							alt=""
						/>
					</div>
				</Dropdown>

				<div className="hidden sflex items-center space-x-2">
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

			<div
				className="max-w-[1500px] mx-auto mb-8 p-3 lg:p-5 xl:p-8"
				style={
					{
						// minHeight: "1000px",
					}
				}
			>
				<IPFWidgets />
			</div>
		</div>
	);
}

export default App;
