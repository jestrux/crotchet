import IPFWidgets from "../iPFWidgets";
import { useAppContext } from "../providers/AppProvider";
import Dropdown from "../components/Dropdown";
import useKeyDetector from "../hooks/useKeyDetector";
import { useRef } from "react";
import ActionPane from "../components/ModalPanes/ActionPane";
import NavigationButton from "../components/NavigationButton";
import { useAirtableMutation } from "../hooks/useAirtable";
import SettingButton from "../components/SettingButton";
import ComboboxItem from "../components/ComboboxItem";

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

const PreferencesEditor = (props) => {
	const { user, confirmAction, updateUser, currentPage, setCurrentPage } =
		useAppContext();
	const preferences = user.preferences;

	const { mutateAsync } = useAirtableMutation({
		table: "widgets",
		action: "create",
	});

	return (
		<ActionPane {...props} hideCloseButton>
			<div className="-m-4">
				<SettingButton
					label="simpleGrid"
					value={preferences?.simpleGrid}
					onChange={(simpleGrid) =>
						updateUser({
							preferences: { ...preferences, simpleGrid },
						})
					}
				/>

				<SettingButton
					label="wallpaper"
					value={preferences?.wallpaper}
					onChange={(wallpaper) =>
						updateUser({
							preferences: { ...preferences, wallpaper },
						})
					}
				/>

				{currentPage !== "Home" && (
					<ComboboxItem
						value="Delete current page"
						className="w-full cursor-pointer hover:bg-content/5 px-3 py-2.5 rounded flex items-center justify-between gap-2 focus:outline-none"
						onSelect={async () => {
							if (
								!(await confirmAction({
									message:
										"This will also delete your widgets in this page.",
								}))
							)
								return;

							setCurrentPage("Home");
							updateUser({
								pages: user.pages.filter(
									({ label }) => label !== currentPage
								),
							});
							props.onClose();
						}}
						trailing="Click to delete"
					/>
				)}

				<NavigationButton
					inset
					// replace
					title="Add page"
					fields={{
						label: "text",
					}}
					onSave={(page) => {
						updateUser({ pages: [...user.pages, page] });
						setCurrentPage(page.label);
					}}
				/>

				<NavigationButton
					inset
					// replace
					title={
						"Add widget " +
						(currentPage !== "Home" ? " to " + currentPage : "")
					}
					fields={{
						label: {
							type: "text",
							width: "half",
							optional: true,
						},
						table: {
							type: "text",
							width: "half",
						},
						filterable: {
							label: "Filter data",
							type: "boolean",
							helper: true,
						},
						filters: {
							hideLabel: true,
							type: "keyvalue",
							noMargin: true,
							show: (data) => data.filterable,
						},
						fields: {
							label: "Field mappings",
							type: "keyvalue",
							defaultValue: {
								title: "",
								subtitle: "",
								image: "",
								progress: "",
								status: "",
								action: "",
							},
							meta: {
								editable: false,
							},
						},
						checkable: {
							label: "Is checklist",
							type: "boolean",
							width: "half",
							helper: true,
						},
						checkbox: {
							hideLabel: true,
							placeholder: "Check field...",
							width: "half",
							show: (data) => data.checkable,
						},
						removable: "boolean",
						hasAction: {
							label: "Widget action",
							type: "boolean",
							width: "half",
							helper: true,
						},
						actionLabel: {
							hideLabel: true,
							type: "text",
							width: "half",
							placeholder: "Action label",
							show: (data) => data.hasAction,
						},
						actionFields: {
							label: "Action fields",
							type: "keyvalue",
							// hideLabel: true,
							// noMargin: true,
							show: (data) => data.hasAction,
						},
						page: {
							type: "hidden",
							defaultValue: currentPage,
						},
						owner: "authUser",
					}}
					onSave={(data) => {
						let {
							label,
							page,
							owner,
							filters,
							fields,
							actionLabel,
							actionFields,
							...properties
						} = data;

						try {
							fields = JSON.parse(fields ?? {});
						} catch (error) {
							fields = {};
						}

						try {
							filters = JSON.parse(filters ?? {});
						} catch (error) {
							filters = {};
						}

						try {
							actionFields = JSON.parse(actionFields ?? {});
						} catch (error) {
							actionFields = null;
						}

						properties = {
							...properties,
							...fields,
							filters,
							...(actionLabel &&
							actionFields &&
							Object.keys(actionFields).length
								? {
										actions: {
											[actionLabel]: {
												fields: actionFields,
											},
										},
								  }
								: {}),
						};

						const payload = {
							label,
							page,
							owner,
							// properties,
							properties: JSON.stringify(properties),
						};

						// console.log("Payload: ", payload);

						return mutateAsync(payload);
					}}
					onSuccess={() =>
						document.dispatchEvent(
							new CustomEvent("widgets-updated")
						)
					}
				/>
			</div>
		</ActionPane>
	);
};

function App() {
	const preferencesAlertRef = useRef();
	const { user, currentPage, logout, showAlert } = useAppContext();
	const lightWallpaper =
		"https://images.unsplash.com/photo-1682687981974-c5ef2111640c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxNjE2NXwxfDF8c2VhcmNofDh8fHdhbGxwYXBlcnxlbnwwfHx8fDE2ODQ1NzU5MDJ8MA&ixlib=rb-4.0.3&q=80&w=1080";
	// const darkWallpaper =
	// 	"https://images.unsplash.com/photo-1506794778225-cbf6c8df4c5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
	const darkWallpaper =
		"https://images.unsplash.com/photo-1488767136043-c1eb91ca932d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

	const editUserPreferences = () => {
		if (preferencesAlertRef.current) {
			preferencesAlertRef.current.close();
			preferencesAlertRef.current = null;
			return;
		}

		showAlert({
			// 	type: "settings",
			// title: "Edit preferences",
			// hideCloseButton: true,
			// showOverlayBg: false,
			dismissible: false,
			content: <PreferencesEditor />,
			onCreate(alert) {
				preferencesAlertRef.current = alert;
			},
			callback(data) {
				preferencesAlertRef.current = null;
				return data;
			},
		});
	};

	useKeyDetector({
		key: "Cmd + /",
		action: editUserPreferences,
	});

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
				<IPFWidgets key={currentPage} />
			</div>
		</div>
	);
}

export default App;
