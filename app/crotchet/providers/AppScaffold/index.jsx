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

import { useHistory } from "react-router";
import BaseNavPage from "./BaseNavPage";

import "./ionic-styles";
import homePageActions from "./homePageActions";
import { getPage } from "@/crotchet";
import { ErrorBoundary } from "@/crotchet/components";

const AppRoot = ({ app }) => {
	let { nav: _nav, ...rootPage } = app;
	let nav = [];

	if (!_nav) {
		rootPage.appActions = homePageActions;
		return <BaseNavPage page={rootPage} />;
	}

	if (_nav) {
		if (typeof _nav == "function") _nav = _nav();

		nav = _nav.map((item, index) => {
			item.slug = item.slug || item.label?.toLowerCase();
			item.page = item.page || {};

			if (index == 0) item.page.appActions = homePageActions;

			return item;
		});
	}

	return (
		<ErrorBoundary>
			<IonTabs>
				<IonRouterOutlet>
					{nav.map((item, index) => (
						<Route
							key={["main", item.slug, index].join(" ")}
							path={`/app/:tab(${item.slug})`}
							exact
						>
							<BaseNavPage
								page={item.page}
								nav
								slug={`/app/${item.slug}`}
							/>
						</Route>
					))}

					{nav.map((item, index) => (
						<Route
							key={["main", item.slug, index].join(" ")}
							path={`/app/:tab(${item.slug})/page`}
							component={BaseNavPage}
						/>
					))}

					<Redirect path="/app" exact to={"/app/" + nav[0].slug} />
				</IonRouterOutlet>
				<IonTabBar slot="bottom" translucent mode="ios">
					{nav.map((item, index) => (
						<IonTabButton
							key={[item.slug, index].join(" ")}
							tab={item.slug}
							href={`/app/${item.slug}`}
						>
							<div className="size-6">{item.icon}</div>
							<IonLabel>{item.label}</IonLabel>
						</IonTabButton>
					))}
				</IonTabBar>
			</IonTabs>
		</ErrorBoundary>
	);
};

function AppScaffoldContent({ app } = {}) {
	const { push, replace } = useHistory();

	window.openRootPage = app?.nav ? (page) => replace(page) : window.openPage;

	window.openPage = (page) => {
		const pageName = getPage(page);
		return push({
			pathname: "/page/" + pageName,
			state: { page: pageName },
		});
	};

	window.pushPage = (page) => {
		const pageName = getPage(page);
		return push({
			pathname: "/page/" + pageName,
			state: { page: pageName },
		});
	};

	return (
		<IonRouterOutlet>
			<Route path="/page/:id" component={BaseNavPage} />
			<Route path="/app" render={() => <AppRoot app={app} />} />
			<Redirect path="/" exact to="/app" />
		</IonRouterOutlet>
	);
}

export default function AppScaffold({ rootPage: app } = {}) {
	return (
		<ErrorBoundary>
			<IonApp>
				<IonReactRouter>
					<AppScaffoldContent app={app} />
				</IonReactRouter>
			</IonApp>
		</ErrorBoundary>
	);
}
