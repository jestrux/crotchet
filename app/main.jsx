import "./init";

import { lazy } from "react";
import ReactDOM from "react-dom/client";
import AppProvider from "./crotchet/providers/AppProvider";

const App = lazy(() =>
	import(window.onDesktop() ? "./DesktopApp" : "./MobileApp")
);

ReactDOM.createRoot(document.getElementById("root")).render(
	<AppProvider>
		<App />
	</AppProvider>
);
