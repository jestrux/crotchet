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
	} = usePageContext();
	const isPreviewPage = page.type == "preview";
	const previewContent = _.pick(pageData || {}, ["title", "subtitle"]);
	let preview = _preview;

	if (isPreviewPage && !objectIsEmpty(previewContent)) {
		preview = (
			<div className="p-4 space-y-2">
				<h1 className="font-medium">{previewContent.title}</h1>
				<p className="text-sm text-content/50">
					{previewContent.subtitle}
				</p>
			</div>
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
