import { createContext, useContext } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";
import logo from "../images/logo.png";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import { randomId } from "../utils";

const AuthContext = createContext({
	user: {},
	logout: () => {},
});

export function AuthProvider({ children }) {
	const [user, setUser] = useLocalStorageState("authUser");
	const { processing, refetch } = useFetch({
		model: "Users",
		refetchOnWindowFocus: false,
	});

	const handleLogin = async (e) => {
		e.preventDefault();
		const user = await refetch({
			filters: {
				email: e.target.email.value,
			},
			first: true,
		});

		if (user) setUser(user);
	};

	const logout = () => setUser(null);

	return (
		<AuthContext.Provider value={{ user, logout }}>
			{user ? (
				children
			) : (
				<form onSubmit={handleLogin}>
					<div className="h-screen flex items-center max-w-lg mx-auto">
						<div className="p-10 rounded-lg w-full bg-content/[0.02] border border-content/20 flex flex-col gap-5">
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
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
