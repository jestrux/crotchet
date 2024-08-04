import PageProvider from "@/crotchet/providers/PageProvider";
import DetailPage from "./DetailPage";
import ErrorBoundary from "@/crotchet/components/ErrorBoundary";
import { useAppContext } from "@/crotchet/providers/AppProvider";

function PageContent() {
	return (
		<div className="fixed inset-0 overflow-auto overscroll-none">
			<DetailPage />
		</div>
	);
}

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
