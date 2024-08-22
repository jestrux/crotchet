import { useEffect } from "react";
import { useHistory, useRouteMatch, useLocation } from "react-router";
import PageProvider from "./PageProvider";
import { useDataLoader } from "@/crotchet/hooks";
import { getPage } from "@/crotchet";

function BaseNavPageContent(props) {
	const { state = {} } = useLocation();
	const _page = props.page || state?.page;
	const { data: page } = useDataLoader({
		handler: async () => {
			const page = _page;

			if (typeof page != "string") return page;

			if (!window.pages?.[page]) {
				const event = "page-registered-" + page;
				await new Promise((resolve) => {
					const handler = async () => {
						window.removeEventListener(event, handler);
						resolve();
					};

					window.addEventListener(event, handler);
				});
			}

			return window.pages?.[page];
		},
	});

	if (!page) return null;

	return <PageProvider page={page} scaffold={{ nav: props.nav }} />;
}

export default function BaseNavPage({ nav, page, slug }) {
	const matches = useRouteMatch(slug);
	const { push } = useHistory();

	useEffect(() => {
		if (page && (!matches || !slug)) return;

		window.pushPage = (page) => {
			const pageName = getPage(page);
			push({
				pathname: slug + "/page/" + pageName,
				state: { page: pageName },
			});
		};
	}, [matches]);

	return <BaseNavPageContent page={page} nav={nav} />;
}
