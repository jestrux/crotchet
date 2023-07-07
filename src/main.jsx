// Inspirations
// Clickup: https://clickup.com/v3
// Mobile app: https://www.apple.com/v/home-app/d/images/overview/renovated_startframe__csnon7hxcioi_large_2x.jpg

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import AppWrapper from "./App/Wrapper";
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AppWrapper />
		</QueryClientProvider>
	</React.StrictMode>
);
