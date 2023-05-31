// Inspirations
// Clickup: https://clickup.com/v3
// Mobile app: https://www.apple.com/v/home-app/d/images/overview/renovated_startframe__csnon7hxcioi_large_2x.jpg

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import reportWebVitals from "./reportWebVitals";
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
