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
import { onActionClick } from "@/crotchet/hooks/useActionClick";
import { useKeyDetector } from "@/crotchet/hooks";
import { dispatch } from "@/crotchet/utils";

const PageContentWrapper = () => {
	const { page, title, pageResolving, isOpen, actions } = usePageContext();
	const pageId = page?._id;
	const actionShortcutMap = (actions || []).reduce((agg, action) => {
		if (action.shortcut) agg[action.shortcut] = onActionClick(action);
		return agg;
	}, {});

	useEffect(() => {
		if (window.onDesktop()) {
			const actionNames = (actions || []).reduce((agg, action) => {
				if (action.label && action.remote)
					agg.push({
						..._.pick(action, [
							"id",
							"label",
							"shortLabel",
							"shortcut",
						]),
						// ...action,
						pageId,
					});
				return agg;
			}, []);

			window.dispatch("socket-broadcast", {
				event:
					!isOpen || !actionNames.length
						? "remote-page-closed"
						: "remote-page-changed",
				payload: {
					page: {
						_id: pageId,
						title,
						actions: actionNames,
					},
				},
			});
		}
	}, [title, isOpen, actions, pageId]);

	useKeyDetector({
		key: Object.keys(actionShortcutMap),
		action: (_, key) => {
			if (!isOpen || !actionShortcutMap[key]) return;

			dispatch("command-matched-" + pageId);
			actionShortcutMap[key]();
		},
	});

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
