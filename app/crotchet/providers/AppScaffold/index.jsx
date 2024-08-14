import { useState } from "react";

import { useDataLoader } from "@/crotchet/hooks";
import { randomId } from "@/crotchet/utils";

import NavRootProvider from "./NavRootProvider";
import PageNav from "./Page/PageNav";

export default function AppScaffold({ rootPage: _rootPage } = {}) {
	const [activePage, setActivePage] = useState(0);
	const { nav, pages: _pages = [], ...rootPage } = _rootPage;
	const { data: pages } = useDataLoader(() => {
		return (_pages || []).map((page) => {
			const id = randomId();

			return {
				...page,
				id,
				_id: id,
			};
		});
	});

	return (
		<div
			data-app-scaffold="true"
			className="fixed inset-0 overflow-hidden flex @container"
		>
			<div className="w-24 hidden @md:flex flex-col items-center border-r border-content/10">
				<div className="h-48"></div>

				<div className="flex-1"></div>

				<div className="h-64"></div>
			</div>

			<div className="flex-1 h-screen overflow-y-auto">
				<NavRootProvider
					isOpen={activePage == 0}
					scaffold={{ nav }}
					rootPage={rootPage}
				/>

				{pages?.map((page, index) => {
					<NavRootProvider
						isOpen={activePage == index}
						scaffold={{ nav }}
						rootPage={page}
					/>;
				})}

				<PageNav {...{ nav, activePage, setActivePage }} />
			</div>
		</div>
	);
}
