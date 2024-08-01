import PageProvider from "@/crotchet/providers/PageProvider";
import DetailPage from "./DetailPage";
import ErrorBoundary from "@/crotchet/components/ErrorBoundary";
import { useAppContext } from "@/crotchet/providers/AppProvider";

function PageContent() {
	return (
		<>
			<div className="fixed inset-0 overflow-auto overscroll-none">
				<DetailPage />

				<div style={{ height: 60 }}>&nbsp;</div>
			</div>

			<div
				className="z-50 bg-stone-100/85 dark:bg-card/85 fixed bottom-0 inset-x-0 md:max-w-lg mx-auto border-t border-content/5 pointer-events-auto focus:outline-none w-full backdrop-blur"
				style={{
					height: "76px",
					paddingBottom: "calc(env(safe-area-inset-bottom) * 0.6)",
				}}
			></div>
		</>
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
