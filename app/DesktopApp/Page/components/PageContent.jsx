import { usePageContext } from "@/crotchet/providers/PageProvider";
import ThemeBg from "@/DesktopApp/ThemeBg";
import clsx from "clsx";
import { objectIsEmpty } from "@/crotchet/utils";

export default function PageContent({ children }) {
	const {
		preview: _preview,
		isOpen,
		fullScreen,
		pageResolving,
		page,
		pageData,
		setActions,
		setMainAction,
		onReady,
	} = usePageContext();
	const isPreviewPage = page.type == "preview";
	const previewContent = _.pick(pageData || {}, [
		"title",
		"description",
		"subtitle",
		"metadata",
		"action",
		"actions",
	]);
	let preview = _preview;

	onReady((data) => {
		if (page.type == "preview") {
			if (data?.action) setMainAction(data.action);
			if (data?.actions) setActions(data.actions);
		}
	});

	const metadata = () => {
		if (!previewContent.metadata) return null;

		try {
			return (
				<div className="border-b divide-y divide-content/5 text-sm">
					{Object.entries(previewContent.metadata).map(
						([label, value], index) => (
							<div
								key={index}
								className="flex gap-16 items-center justify-between py-2 px-4"
							>
								<span className="opacity-70 capitalize flex-shrink-0">
									{label}
								</span>
								<span className="opacity-85 flex-1 truncates line-clamp-1 text-right">
									{value}
								</span>
							</div>
						)
					)}
				</div>
			);
		} catch (error) {
			console.log("Metadata error: ", error, previewContent.metadata);
		}

		return null;
	};

	if (isPreviewPage && !objectIsEmpty(previewContent)) {
		preview = (
			<>
				{(previewContent.title || previewContent.subtitle) && (
					<div className="p-4 border-b">
						{previewContent.title && (
							<h1 className="text-2xl font-medium">
								{previewContent.title}
							</h1>
						)}
						{previewContent.subtitle && (
							<p className="mt-1 text-content/85">
								{previewContent.subtitle}
							</p>
						)}
					</div>
				)}

				{metadata()}

				{previewContent.description && (
					<p
						className={
							"p-4 text-sm text-content/70 font-light leading-loose"
						}
					>
						{previewContent.description}
					</p>
				)}
			</>
		);
	}

	return (
		<ThemeBg className="relative" style={{ height: "calc(100vh - 100px)" }}>
			<div
				id="scrollArea"
				className={clsx(
					"relative overflow-auto",
					preview ? (isPreviewPage ? "w-1/2" : "w-5/12") : ""
				)}
				style={{ height: "calc(100vh - 100px)" }}
			>
				{!pageResolving && isOpen && (
					<>
						<div
							className={clsx("h-full", {
								"fixed inset-0 z-[999]": fullScreen,
							})}
						>
							<ThemeBg className="h-full">{children}</ThemeBg>
						</div>

						{preview && (
							<div
								className={clsx(
									"fixed top-14 bottom-11 right-0 overflow-hidden border-l border-content/10 overflow-y-auto",
									isPreviewPage ? "w-1/2" : "w-7/12"
								)}
							>
								<div className="relative size-full">
									{preview}
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</ThemeBg>
	);
}
