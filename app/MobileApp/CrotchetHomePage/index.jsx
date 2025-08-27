import AppContent from "./AppContent";
import ReceiveShareIntent from "./ReceiveShareIntent";

export default function CrotchetHomePage() {
	return (
		<>
			<div className="pointer-events-none">
				<div
					className="dark:hidden bg-cover fixed inset-x-0 bottom-0 bg-top h-1/2 blur"
					style={{
						"--tw-blur": "blur(380px)",
						backgroundImage: `url(img/light-wallpaper.jpg)`,
					}}
				></div>

				<div
					className="hidden dark:block bg-cover bg-center fixed inset-0 blur"
					style={{
						"--tw-blur": "blur(150px)",
						backgroundImage: `url(img/dark-wallpaper.jpg)`,
					}}
				></div>
			</div>

			<div className="relative">
				<AppContent />
			</div>

			<ReceiveShareIntent />
		</>
	);
}
