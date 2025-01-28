import { useAppContext } from "@/crotchet/providers/AppProvider";
import PageProvider, {
	usePageContext,
} from "@/crotchet/providers/PageProvider";
import ErrorBoundary from "@/crotchet/components/ErrorBoundary";

import SearchPage from "./SearchPage";
import PageLoader from "./components/PageLoader";
import PageActionBar from "./components/PageActionBar";
import DetailPage from "./DetailPage";
import { useEffect } from "react";

const PageContentWrapper = () => {
	const { page, title, pageResolving, isOpen, actions } = usePageContext();
	const pageId = page?._id;

	useEffect(() => {
		if (window.onDesktop()) {
			if (!isOpen) return;

			const actionNames = (actions || []).reduce((agg, action) => {
				if (action.label && action.remote)
					agg.push({
						..._.pick(action, ["id", "label", "shortLabel"]),
						// ...action,
						pageId,
					});
				return agg;
			}, []);

			// console.log("Page actions: ", actionNames);
			window.dispatch("socket-broadcast", {
				event: "page-remote-actions",
				payload: {
					actions: actionNames,
					page: {
						title,
					},
				},
			});
		}
	}, [title, isOpen, actions, pageId]);

	return (
		<>
			{page?.type == "search" && <SearchPage />}

			{page?.type != "search" && <DetailPage />}

			{pageResolving && (
				<div className="fixed top-14 inset-x-0 z-[999] pointer-events-none">
					<PageLoader />
				</div>
			)}

			<PageActionBar />
		</>
	);
};

export default function Page({ isOpen, page, onClose = () => {} }) {
	const { popToRoot } = useAppContext();
	const handleClose = ({ popAll } = {}) => {
		if (popAll) return popToRoot();
		onClose();
	};

	return (
		<PageProvider isOpen={isOpen} page={page} onClose={handleClose}>
			<ErrorBoundary
				className="p-6"
				style={{ marginTop: "env(safe-area-inset-top)" }}
				onReset={() => window.location.reload()}
			>
				<PageContentWrapper />
			</ErrorBoundary>
		</PageProvider>
	);
}
