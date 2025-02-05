import { useEffect, useState } from "react";
import useRemote from "../useRemote";
import clsx from "clsx";
import { useEventListener } from "@/crotchet/hooks";
import { onScreenSize } from "@/crotchet/utils";

export default function RemoteController({ flat = false, onClose }) {
	const { pages, openPage, onAction } = useRemote();
	const [activePage, setActivePage] = useState(null);

	const handleOpenPage = (page) => {
		if (flat) return setActivePage(page);

		onClose();
		openPage(page, { fromMainRemote: true });
	};

	const handleClosePage = () => {
		setActivePage(null);
		if (activePage.floating)
			return window.closeFloatingWindow(activePage._id);

		window.socketEmit("close-page", {
			pageId: activePage._id,
		});
	};

	useEffect(() => {
		const page = pages?.find((p) => p._id == activePage?._id);
		if (!page) setActivePage(null);
	}, [pages, activePage]);

	useEventListener("open-remote-page-controller", (_, pageId) => {
		if (!onScreenSize("lg")) return;

		const page = (pages || []).find(({ _id }) => _id == pageId);

		if (page) setActivePage(page);
	});

	const handleRemoteAction = (action, page) => onAction(action, page);

	if (activePage) {
		const page = activePage;

		return (
			<div
				className="˝˝˝mt-0.5"
				onClick={() => setActivePage(null)}
			>
				<div className="grid grid-cols-3 gap-1 p-1">
					{page.actions.map((action, index) => (
						<button
							key={index}
							className="min-h-20 flex-shrink-0 rounded-md bg-card dark:bg-content/10 border border-content/10 w-full flex flex-col items-center justify-center gap-1"
							onClick={(e) => {
								e.stopPropagation();
								handleRemoteAction(action, page);
							}}
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
				</div>

				<div className="h-12 border-t border-content/10 bg-card dark:bg-content/10 relative flex items-center justify-between pl-3 pr-1">
					{page.preview && (
						<img
							className="-ml-1 mr-1.5 h-8 w-10 rounded-md border dark:border border-content/5"
							src={page.preview.image}
						/>
					)}

					<div className="flex-1 truncate">{page?.title}</div>

					<button
						className="opacity-60 flex-shrink-0 h-12 flex py-1.5"
						onClick={(e) => {
							e.stopPropagation();
							handleClosePage();
						}}
					>
						<span className="h-full flex items-center justify-center rounded-full px-3 text-sm underline">
							Close Page
						</span>
					</button>
				</div>
			</div>
		);
	}

	if (!pages?.length) return null;

	return (
		<div className={clsx(flat ? "mt-0.5 flex-shrink-0" : "min-h-16")}>
			{pages?.map((page) => {
				return (
					<div
						key={page._id}
						className={clsx(
							flat
								? "border-t border-content/10"
								: "overflow-hidden rounded-md bg-card border border-content/10"
						)}
						onClick={() => handleOpenPage(page)}
					>
						<div className="pl-3 w-full z-50 overflow-x-auto">
							<div className="relative h-12 flex items-center justify-between gap-2">
								{page.preview && (
									<img
										className="flex-shrink-0 -ml-1 -mr-0.5 h-8 w-10 rounded-md border dark:border border-content/5"
										src={page.preview.image}
									/>
								)}

								<div className="flex-shrink-0 truncate max-w-40">
									{page.title || "Remote"}
								</div>

								<div className="flex items-center gap-2">
									{page.actions.map((action, index) => (
										<button
											key={index}
											className="flex-shrink-0 h-9 flex items-center justify-center rounded-full bg-content/5 border border-content/10"
											onClick={(e) => {
												e.stopPropagation();
												handleRemoteAction(
													action,
													page
												);
											}}
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
													{action.shortLabel ||
														action.label}
												</span>
											)}
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
