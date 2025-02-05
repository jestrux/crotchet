import { useEventListener } from "@/crotchet/hooks";
import useKeyboard from "@/crotchet/hooks/useKeyboard";
import useRemote from "@/crotchet/providers/Remote/useRemote";
import { onScreenSize } from "@/crotchet/utils";

export default function FloatingRemote({
	expanded,
	dragging,
	onCollapse,
	focusInput,
}) {
	const { KeyboardPlaceholder } = useKeyboard();
	const { currentPage: remotePage, openPage, onAction } = useRemote();
	const remoteActions = remotePage?.actions || [];
	const onLarge = onScreenSize("lg");

	useEventListener("open-remote-page-controller", () => onCollapse(true));

	if (!expanded || dragging || !remoteActions?.length) return null;

	const handleContainerClick = (e) => {
		if (onLarge) return;

		e.stopPropagation();
		onCollapse();
		openPage(remotePage);
	};

	const handleRemoteActionClick = (e, action) => {
		if (onLarge) return;

		(e) => {
			e.stopPropagation();
			focusInput(0);
			onAction(action, remotePage);
		};
	};

	return (
		<div
			className="fixed lg:sticky inset-x-0 bottom-0 z-50 overflow-hidden border-t dark:border border-content/5 bg-stone-100 dark:bg-card"
			onClick={handleContainerClick}
		>
			<div className="w-screen z-50 overflow-x-auto bg-stone-100/95 dark:bg-content/5">
				<div className="relative h-12 flex items-center justify-between gap-2 px-3">
					{remotePage.preview && (
						<img
							className="flex-shrink-0 -ml-1 -mr-0.5 h-8 w-10 rounded-md border dark:border border-content/5"
							src={remotePage.preview.image}
						/>
					)}

					<div className="flex-shrink-0 truncate max-w-40">
						{remotePage.title || "Remote"}
					</div>

					<div className="flex items-center gap-2">
						{remotePage.actions.map((action, index) => (
							<button
								key={index}
								className="flex-shrink-0 h-9 flex items-center justify-center rounded-full bg-content/5 border border-content/10"
								onClick={(e) =>
									handleRemoteActionClick(e, action)
								}
							>
								{action.icon ? (
									<span
										className="size-9 flex items-center justify-center"
										dangerouslySetInnerHTML={{
											__html: action.icon,
										}}
									></span>
								) : (
									<span className="h-full flex items-center justify-center rounded-full py-1.5 px-3 border border-content/20 text-sm">
										{action.shortLabel || action.label}
									</span>
								)}
							</button>
						))}
						<div className="flex-shrink-0 w-6˝˝˝">&nbsp;</div>
					</div>
				</div>
			</div>

			{!onLarge && <KeyboardPlaceholder noMargin />}
		</div>
	);
}
