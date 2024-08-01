import { useAppContext } from "@/crotchet/providers/AppProvider";
import PageProvider, {
	usePageContext,
} from "@/crotchet/providers/PageProvider";
import ErrorBoundary from "@/crotchet/components/ErrorBoundary";

import SearchPage from "./SearchPage";
import PageLoader from "./components/PageLoader";
import PageActionBar from "./components/PageActionBar";
import DetailPage from "./DetailPage";

export const PageContent = () => {
	const { page, pageResolving } = usePageContext();

	return (
		<>
			{page?.type == "search" && <SearchPage />}

			{page?.type != "search" && (
				<DetailPage />
			)}

			{pageResolving && (
				<div className="fixed top-14 inset-x-0 z-50 pointer-events-none">
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
				<PageContent />
			</ErrorBoundary>
		</PageProvider>
	);
}
