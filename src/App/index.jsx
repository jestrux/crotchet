import Widgets from "../Widgets";
import IPFWidgets from "../iPFWidgets";
import { useAppContext } from "../providers/AppProvider";
import Dropdown from "../components/Dropdown";
import useKeyDetector from "../hooks/useKeyDetector";
import usePreferenceEditor from "../components/usePreferenceEditor";

const MenuItem = ({ active, label, onClick = () => {} }) => {
	const regex_emoji =
		/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;
	const containsEmoji = regex_emoji.test(label);

	return (
		<button
			className={`${
				active
					? "bg-content/5 border-content/5 dark:bg-content/10 dark:border-content/10"
					: "border-transparent"
			} h-8 group flex items-center justify-center gap-1.5 border rounded-full py-2.5 px-4 text-content/10 dark:text-transparent`}
			style={{ minWidth: "100px" }}
			onClick={onClick}
		>
			{containsEmoji && (
				<span className="leading-none text-content -ml-1">
					{label.toString().substring(0, 2)}
				</span>
			)}
			<span
				className="text-xs leading-none font-bold text-content"
				style={{ opacity: active ? 1 : 0.7 }}
			>
				{containsEmoji ? label.toString().substring(2) : label}
			</span>
		</button>
	);
};

const AppNavigation = () => {
	const { currentPage, setCurrentPage } = useAppContext();
	const { user } = useAppContext();
	const pages = [{ label: "Home" }, ...user.pages];

	if (pages.length < 2) return null;

	return (
		<div className="pointer-events-auto inline-flex justify-center items-center mr-12 p-1 rounded-full bg-card/80 backdrop-blur dark:border border-content/5 shadow">
			{pages.map((page, index) => (
				<MenuItem
					key={index}
					active={page.label === currentPage}
					onClick={() => setCurrentPage(page.label)}
					label={page.label}
				/>
			))}
		</div>
	);
};

function App() {
	const { user, currentPage, logout } = useAppContext();
	const { editUserPreferences } = usePreferenceEditor();
	const lightWallpaper =
		"https://images.unsplash.com/photo-1682687981974-c5ef2111640c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxNjE2NXwxfDF8c2VhcmNofDh8fHdhbGxwYXBlcnxlbnwwfHx8fDE2ODQ1NzU5MDJ8MA&ixlib=rb-4.0.3&q=80&w=1080";
	// const darkWallpaper =
	// 	"https://images.unsplash.com/photo-1506794778225-cbf6c8df4c5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
	const darkWallpaper =
		"https://images.unsplash.com/photo-1488767136043-c1eb91ca932d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

	useKeyDetector({
		key: "Cmd + /",
		action: editUserPreferences,
	});

	const pages = [
		{ label: "Home", simpleGrid: user.preferences?.simpleGrid },
		...user.pages,
	];

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

			<div
				className={`
				${user.preferences.hideTopNav ? "hidden" : "flex"}
				pointer-events-none sticky top-1 z-50 h-14 items-center justify-between`}
			>
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
			</div>

			<div className="max-w-[1500px] mx-auto mb-8 p-3 lg:p-5 xl:p-8">
				{pages.map((page, index) => {
					if (currentPage !== page.label) return null;

					return (
						<div key={index}>
							{/* <Widgets
								onCustomize={editUserPreferences}
								onLogout={logout}
							/> */}
							<IPFWidgets page={page} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default App;
