import { useState } from "react";
import useRemote from "../useRemote";

export default function RemoteController({ setTitle, onClose }) {
	const { pages, openPage, onAction } = useRemote();
	const [activePage, setActivePage] = useState(null);

	const handleOpenPage = (page) => {
		onClose();
		openPage(page, { fromMainRemote: true });
		// setActivePage(page);
		// setTitle(page?.title || "Remote Controller");
	};

	const handleClosePage = () => {
		setActivePage(null);
		setTitle("Remote Controller");
	};

	const handleRemoteAction = (action, page) => onAction(action, page);

	if (activePage) {
		return (
			<div className="min-h-32 pb-12">
				<div className="grid grid-cols-3 gap-2">
					{activePage.actions.map((action, index) => (
						<button
							key={index}
							className="flex-shrink-0 h-12 w-full flex py-1.5"
							onClick={() =>
								handleRemoteAction(action, activePage)
							}
						>
							<span className="w-full h-full flex items-center justify-center rounded-full px-3 border border-content/20 text-sm">
								{action.shortLabel || action.label}
							</span>
						</button>
					))}
					<div className="flex-shrink-0 w-6˝˝˝">&nbsp;</div>
				</div>

				<div className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t dark:border border-content/5 bg-stone-100 dark:bg-card">
					<div className="w-full z-50 overflow-x-auto bg-stone-100/95 dark:bg-content/5">
						<div className="relative h-12 flex items-center justify-between px-4">
							<div className="flex-1 pr-4 mr-4 border-r dark:border-content/15 truncate">
								{activePage?.title}
							</div>

							<button
								className="flex-shrink-0 h-12 flex py-1.5"
								onClick={handleClosePage}
							>
								<span className="h-full flex items-center justify-center rounded-full px-3 border border-content/20 text-sm">
									Close
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-16 -mx-4">
			{pages?.map((page) => {
				return (
					<div key={page._id} className="overflow-hidden">
						<div className="pl-2 w-full z-50 overflow-x-auto">
							<div className="relative h-12 flex items-center justify-between px-3">
								<div
									className="flex-shrink-0 pr-4 mr-4 border-r dark:border-content/15 truncate max-w-40"
									onClick={() => handleOpenPage(page)}
								>
									{page.title || "Remote"}
								</div>
								<div className="flex items-center gap-2">
									{page.actions.map((action, index) => (
										<button
											key={index}
											className="flex-shrink-0 h-12 flex py-1.5"
											onClick={() =>
												handleRemoteAction(action, page)
											}
										>
											<span className="h-full flex items-center justify-center rounded-full px-3 border border-content/20 text-sm">
												{action.shortLabel ||
													action.label}
											</span>
										</button>
									))}
									<div className="flex-shrink-0 w-6˝˝˝">
										&nbsp;
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
