import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import {
	IonLabel,
	IonRouterOutlet,
	IonTabBar,
	IonTabButton,
	IonTabs,
	IonApp,
} from "@ionic/react";

import BaseNavPage from "./BaseNavPage";

import "./ionic-styles";

const AppTabs = ({ app }) => {
	const { nav } = app;

	return (
		<IonTabs>
			<IonRouterOutlet>
				{nav.map((item, index) => {
					const slug = item.slug || item.label?.toLowerCase();

					return (
						<Route
							key={["main", item.slug, index].join(" ")}
							path={`/app/:tab(${slug})`}
							exact
						>
							<BaseNavPage
								page={item.page}
								slug={`/app/${slug}`}
							/>
						</Route>
					);
				})}

				{nav.map((item, index) => {
					const slug = item.slug || item.label?.toLowerCase();
					return (
						<Route
							key={["main", slug, index].join(" ")}
							path={`/app/:tab(${slug})/page`}
							component={BaseNavPage}
						/>
					);
				})}

				<Redirect
					path="/app"
					exact
					to={"/app/" + (nav[0].slug || nav[0].label?.toLowerCase())}
				/>
			</IonRouterOutlet>
			<IonTabBar slot="bottom">
				{nav.map((item, index) => {
					const slug = item.slug || item.label?.toLowerCase();
					return (
						<IonTabButton
							key={[slug, index].join(" ")}
							tab={slug}
							href={`/app/${slug}`}
						>
							<div className="size-6">{item.icon}</div>
							<IonLabel>{item.label}</IonLabel>
						</IonTabButton>
					);
				})}
			</IonTabBar>
		</IonTabs>
	);
};

export default function AppScaffold({ rootPage: app } = {}) {
	return (
		<IonApp>
			<IonReactRouter>
				<IonRouterOutlet>
					<Route exact path="/page" component={BaseNavPage} />
					<Route path="/app" render={() => <AppTabs app={app} />} />
					<Redirect path="/" exact to="/app" />
				</IonRouterOutlet>
			</IonReactRouter>
		</IonApp>
	);
}
