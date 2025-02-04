import { useEventListener } from "@/crotchet/hooks";
import useRemote from "../useRemote";

export default function RemotePageController({ page, onClose }) {
	const { onAction } = useRemote();

	const handleRemoteAction = (action, page) => onAction(action, page);

	useEventListener("close-remote-page-controller-" + page._id, () =>
		onClose()
	);

	return (
		<div className="py-3.5 px-3 pb-6">
			<div className="grid grid-cols-3 gap-2">
				{page.actions.map((action, index) => (
					<button
						key={index}
						className="min-h-20 flex-shrink-0 rounded-md bg-card border border-content/10 w-full flex flex-col items-center justify-center gap-1"
						onClick={() => handleRemoteAction(action, page)}
					>
						{action.icon && (
							<span
								className="size-8 flex items-center justify-center"
								dangerouslySetInnerHTML={{
									__html: action.icon,
								}}
							></span>
						)}
						<span className="text-sm">
							{action.shortLabel || action.label}
						</span>
					</button>
				))}
				<div className="flex-shrink-0 w-6˝˝˝">&nbsp;</div>
			</div>

			<div className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t dark:border border-content/5 bg-stone-100 dark:bg-card">
				<div className="w-full z-50 overflow-x-auto bg-stone-100/95 dark:bg-content/5">
					<div className="relative border-b h-12 flex items-center justify-between pl-4 pr-1">
						{page.preview && (
							<img
								className="-ml-0.5 mr-1.5 h-7 w-10 rounded-md border dark:border border-content/5"
								src={page.preview.image}
							/>
						)}

						<div className="flex-1 truncate">{page?.title}</div>

						<button
							className="opacity-60 flex-shrink-0 h-12 flex py-1.5"
							onClick={() => {
								if (page.floating)
									return window.closeFloatingWindow(page._id);

								window.socketEmit("close-page", {
									pageId: page._id,
								});
							}}
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
