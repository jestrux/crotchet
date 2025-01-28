import { useRef } from "react";
import PageFilters from "./components/PageFilters";
import { usePageContext } from "@/crotchet/providers/PageProvider";
import PageContent from "./components/PageContent";
// import ActionPage from "./ActionPage";
// import FormPage from "./FormPage";

export default function DetailPage() {
	const { page, title, content, pageResolving, onOpen, onClose } = usePageContext();
	const popoverTitleRef = useRef(null);

	onOpen(() => {
		setTimeout(() => {
			if (page?.type == "form") {
				const firstInput = document.querySelector(
					"#popoverContent input, #popoverContent textarea"
				);
				if (firstInput) firstInput.focus();
			}
		}, 20);
	});

	const renderPage = () => {
		// const pageHasFields =
		// 	[typeof page.fields, typeof page.field].includes("function") ||
		// 	Object.keys(page.fields ?? {}).length > 0 ||
		// 	page.field;

		// let content = _content();
		// if (pageHasFields) content = <FormPage page={page} />;
		// return <ActionPage page={page}>{content}</ActionPage>;

		return content;
	};

	return (
		<>
			<div
				ref={popoverTitleRef}
				id="popoverTitle"
				className="h-14 px-4 flex items-center border-b border-content/10 z-10 relative"
			>
				{typeof onClose == "function" && (
					<button
						type="button"
						className="flex-shrink-0 -ml-1.5 mr-2.5 bg-content/10 rounded flex items-center justify-center w-7 h-7"
						onClick={onClose}
					>
						<svg
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-3.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
							/>
						</svg>
					</button>
				)}

				<span className="w-full text-base font-bold">
					{title}
				</span>

				{!pageResolving && <PageFilters />}
			</div>

			<PageContent>{renderPage()}</PageContent>
		</>
	);
}
