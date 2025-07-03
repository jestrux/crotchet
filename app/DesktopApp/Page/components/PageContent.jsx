import { usePageContext } from "@/crotchet/providers/PageProvider";
import ThemeBg from "@/DesktopApp/ThemeBg";
import clsx from "clsx";

export default function PageContent({ children }) {
	const { preview, isOpen, fullScreen, pageResolving } = usePageContext();

	return (
		<div
			id="scrollArea"
			className="relative overflow-auto"
			style={{ height: "calc(100vh - 100px)" }}
		>
			{!pageResolving && isOpen && (
				<>
					{preview ? (
						<div
							className={clsx("h-full", {
								"fixed inset-0 z-[999]": fullScreen,
							})}
						>
							<ThemeBg className="grid grid-cols-12 h-full">
								<div className="col-span-5 ">{children}</div>
								<div className="col-span-7 overflow-hidden p-0.5 relative border-l border-content/10 overflow-y-auto">
									{preview}
								</div>
							</ThemeBg>
						</div>
					) : (
						<div
							className={clsx("h-full", {
								"fixed inset-0 z-[999]": fullScreen,
							})}
						>
							<ThemeBg className="h-full">{children}</ThemeBg>
						</div>
					)}
				</>
			)}
		</div>
	);
}
