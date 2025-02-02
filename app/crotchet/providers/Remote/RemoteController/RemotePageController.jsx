import { useEffect } from "react";
import useRemote from "../useRemote";

export default function RemotePageController({ page, onClose }) {
	const { pages } = useRemote();

	useEffect(() => {
		if (!pages || !page || !onClose) return;

		if (!pages.find((p) => p._id == page._id)) onClose();
	}, [pages]);

	const handleRemoteAction = (action) => {
		window.socketEmit("emit", {
			event: "remote-action",
			payload: action,
		});
	};

	return (
		<div className="min-h-32 pb-12">
			<div className="grid grid-cols-3 gap-2">
				{page.actions.map((action, index) => (
					<button
						key={index}
						className="flex-shrink-0 h-12 w-full flex py-1.5"
						onClick={() => handleRemoteAction(action)}
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
						{/* <div className="flex-1 pr-4 mr-4 border-r dark:border-content/15 truncate">
							{page?.title}
						</div> */}

						<button
							className="flex-shrink-0 h-12 flex py-1.5"
							onClick={() =>
								window.socketEmit("close-page", {
									pageId: page._id,
								})
							}
						>
							<span className="h-full flex items-center justify-center rounded-full px-3 text-sm underline">
								Close Page
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
