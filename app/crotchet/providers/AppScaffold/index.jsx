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

export default function AppScaffold({ rootPage: _rootPage } = {}) {
	const { nav } = _rootPage;

	return (
		<IonApp>
			<IonReactRouter>
				<IonTabs>
					<IonRouterOutlet>
						{nav.map((item, index) => {
							const slug = item.slug || item.label?.toLowerCase();

							return (
								<Route
									key={["main", item.slug, index].join(" ")}
									path={`/:tab(${slug})`}
									exact
								>
									<BaseNavPage
										page={item.page}
										slug={`/${slug}`}
									/>
								</Route>
							);
						})}

						{nav.map((item, index) => {
							const slug = item.slug || item.label?.toLowerCase();
							return (
								<Route
									key={["main", slug, index].join(" ")}
									path={`/:tab(${slug})/page`}
									component={BaseNavPage}
								/>
							);
						})}

						<Redirect
							path="/"
							exact
							to={nav[0].slug || nav[0].label?.toLowerCase()}
						/>
					</IonRouterOutlet>
					<IonTabBar slot="bottom">
						{nav.map((item, index) => {
							const slug = item.slug || item.label?.toLowerCase();
							return (
								<IonTabButton
									key={[slug, index].join(" ")}
									tab={slug}
									href={`/${slug}`}
								>
									<div className="size-6">{item.icon}</div>
									<IonLabel>{item.label}</IonLabel>
								</IonTabButton>
							);
						})}
					</IonTabBar>
				</IonTabs>
			</IonReactRouter>
		</IonApp>
	);
}
