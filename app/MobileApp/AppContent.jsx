import Page from "./Page";
import { hideApp } from "@/crotchet/utils";
import { useAppContext } from "@/crotchet/providers/AppProvider";
import { Button } from "@/crotchet/components";

export default function AppContent() {
	const { pages, popPage } = useAppContext();
	const rootPage = {
		id: "root",
		_id: "root",
		type: "detail",
		// resolve: () => {
		// 	return true;
		// },
		content: () => (
			<Button
				onClick={() =>
					window.openPage({
						title: "Second Page",
						type: "detail",
						content: <p>Second page!!</p>,
					})
				}
			>
				Open second page
			</Button>
		),
	};

	return (
		<>
			<Page
				page={rootPage}
				isOpen={!pages.length}
				onClose={() => hideApp()}
			/>

			{pages.map((page) => (
				<Page
					key={page.id}
					isOpen={page.id == pages.at(-1).id}
					page={page}
					onClose={(data) => popPage(page.id, data)}
				>
					{page.content}
				</Page>
			))}
		</>
	);
}
