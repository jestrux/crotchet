import { useRef } from "react";
import PageFilters from "./components/PageFilters";
import { usePageContext } from "@/crotchet/providers/PageProvider";
import PageContent from "./components/PageContent";
import { Form } from "@/crotchet/components";
import { randomId, dispatch, withLoader } from "@/crotchet/utils";
import MediaItem from "@/crotchet/components/MediaItem";
// import ActionPage from "./ActionPage";

export default function DetailPage() {
	const {
		page,
		title,
		content,
		pageResolving,
		pageData,
		setMainAction,
		mainAction,
		onOpen,
		onClose,
		preview,
	} = usePageContext();
	const formId = useRef(randomId("form"));
	const popoverTitleRef = useRef(null);
	const pageHasFields =
		[typeof page.fields, typeof page.field].includes("function") ||
		Object.keys(page.fields ?? {}).length > 0 ||
		page.field;

	onOpen(() => {
		setTimeout(() => {
			if (pageHasFields) {
				const firstInput = document.querySelector(
					"#popoverContent input, #popoverContent textarea"
				);
				if (firstInput) firstInput.focus();

				let action = page?.action;
				if (typeof action == "function")
					action = action({ page, pageData });

				setMainAction({
					...(action
						? {
								...action,
								__originalHandler: action.handler,
						  }
						: {}),

					handler: () => {
						document
							.querySelector(`#${formId.current} [type="submit"]`)
							?.click();
					},
				});
			}
		}, 20);
	});

	const renderPage = () => {
		// let content = _content();
		// if (pageHasFields) content = <FormPage page={page} />;
		// return <ActionPage page={page}>{content}</ActionPage>;

		if (pageHasFields) {
			const horizontalLayout = !preview && !page?.fullWidth;
			return (
				<div
					className={
						page?.noPadding ? "" : horizontalLayout ? "p-8" : "p-4"
					}
				>
					<Form
						{...page}
						horizontalLayout={horizontalLayout}
						data={pageData}
						formId={formId.current}
						onChange={(data) => {
							dispatch("page-data-changed-" + page?._id, data);
							if (page.onChange) page.onChange(data);
						}}
						onSubmit={async (values) => {
							values = _.keys(values).includes("formField")
								? values.formField
								: values;

							const pageAction = mainAction();
							let res = values;
							if (
								typeof pageAction.__originalHandler ==
								"function"
							) {
								res = await withLoader(
									() => pageAction.__originalHandler(values),
									{
										successMessage:
											pageAction.successMessage,
										errorMessage: pageAction.errorMessage,
									}
								);

								if (!res) return;
							}

							onClose(res);
						}}
					/>
				</div>
			);
		}

		if (page.type == "preview") return <MediaItem {...(pageData || {})} />;

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

				<span className="w-full text-base font-bold truncate">
					{title}
				</span>

				{!pageResolving && <PageFilters />}
			</div>

			<PageContent>{renderPage()}</PageContent>
		</>
	);
}
