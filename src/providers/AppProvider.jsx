import { createContext, useContext } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";
import logo from "../images/logo.png";
import Loader from "../components/Loader";
import {
	useAirtableMutation,
	useDelayedAirtableFetch,
} from "../hooks/useAirtable";

const AppContext = createContext({
	currentPage: "Home",
	setCurrentPage: (page) => {},
	user: {},
	logout: () => {},
	updateUser: (newProps = {}) => {},
	showAlert: () => {},
	confirmAction: ({
		type = "confirm",
		size = "xs",
		title = "Are you sure?",
		message = "This action can not be undone",
		cancelText = "Cancel",
		okayText = "Yes, Continue",
	}) => {},
});

export function AppProvider({ children, value = {} }) {
	const { mutate: mutateUser } = useAirtableMutation({ table: "users" });

	const [currentPage, setCurrentPage] = useLocalStorageState(
		"currentPage",
		"Home"
	);
	const [user, setUser] = useLocalStorageState("authUser");
	const { processing, mutate } = useDelayedAirtableFetch({
		table: "users",
		first: true,
	});

	const handleLogin = async (e) => {
		e.preventDefault();
		const user = await mutate({
			email: e.target.email.value,
		});

		if (user) setUser(user);
	};

	const updateUser = (newProps) => {
		const updatedUser = { ...user, ...newProps };
		mutateUser({
			rowId: user._rowId,
			payload: newProps,
		});
		setUser(updatedUser);
	};

	const logout = () => setUser(null);

	return (
		<AppContext.Provider
			value={{
				...value,
				user,
				updateUser,
				logout,
				currentPage,
				setCurrentPage,
			}}
		>
			{user ? (
				children
			) : (
				<form onSubmit={handleLogin}>
					<div className="h-screen flex items-center max-w-lg mx-auto">
						<div className="p-10 rounded-lg w-full bg-card dark:bg-content/[0.02] border border-content/20 flex flex-col gap-5">
							<div className="mb-2 flex flex-col gap-4">
								<img
									className="w-10 inline-block"
									src={logo}
									alt=""
								/>
								<h2 className="text-2xl leading-none font-serif font-bold">
									Crotchet Login
								</h2>
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="opacity-80">
									Email Address
								</label>
								<input
									type="email"
									name="email"
									required
									className="h-12 px-3.5 mx-px placeholder:text-content/30 rounded bg-transparent border-content/20 focus:border-content/20 focus:ring-content/50"
									placeholder="E.g. john@example.com"
								/>
							</div>

							<button
								type="submit"
								className={`relative overflow-hidden text-content/50 hover:text-content/80 text-sm leading-none uppercase tracking-wider font-bold h-11 flex items-center justify-center w-full text-center border border-content/10 hover:border-content/20 bg-content/5 rounded
									${processing && "pointer-events-none"}
								`}
							>
								Login
								{processing && (
									<Loader size={26} thickness={8} />
								)}
							</button>
						</div>
					</div>
				</form>
			)}
		</AppContext.Provider>
	);
}

export function useAppContext() {
	return useContext(AppContext);
}
