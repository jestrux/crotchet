import { useEffect } from "react";
import { useHistory, useRouteMatch, useLocation } from "react-router";
import PageProvider from "./PageProvider";
import { useDataLoader } from "@/crotchet/hooks";

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

	return <PageProvider page={page} />;
}

export default function BaseNavPage({ page, slug }) {
	const matches = useRouteMatch(slug);
	const { push, replace } = useHistory();

	window.openRootPage = (page) => {
		console.log("Open root page: ", page);
		replace(page);
	};

	useEffect(() => {
		if (!matches || !slug) return;

		window.openPage = (page) => {
			push({
				pathname: slug + "/page",
				state: { page },
			});
		};
	}, [matches]);

	return <BaseNavPageContent page={page} />;
}
