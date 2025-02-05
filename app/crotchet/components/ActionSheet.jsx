import { motion } from "framer-motion";
import { useState } from "react";
import { Portal } from "@reach/portal";
import { useDataLoader } from "@/crotchet/hooks";
import {
	cleanObject,
	isValidUrl,
	objectFieldChoices,
	objectIsEmpty,
	onScreenSize,
} from "@/crotchet/utils";
import Loader from "@/crotchet/components/Loader";
import ActionGrid from "@/crotchet/components/ActionGrid";

import clsx from "clsx";
import { getWebsiteInfo } from "../providers/crawler";

export default function Sheet({
	title,
	payload,
	preview: _preview,
	actions: _actions,
	children,
	showOverlayBg = true,
	noHeading = false,
	inset = true,
	onClose = () => {},
}) {
	const [preview, setPreview] = useState(_preview);
	const getShareActions = () => {
		return window.globalActions({ share: true }).filter((action) => {
			let matches = !objectIsEmpty(
				_.pick(payload, ["image", "url", "file", "text"])
			);

			const match = action.match;

			if (_.isFunction(match)) {
				matches = match(payload);
			} else if (
				["image", "file", "url", "text", "download"].includes(match)
			)
				matches = payload[match]?.length;

			if (!matches) return false;

			return true;
		});
	};
	const { data: actions, loading: loadingShareActions } = useDataLoader({
		handler: async () => {
			if (_actions) {
				if (typeof _actions == "function") _actions = await _actions();
				else if (_actions instanceof Promise) _actions = await _actions;

				if (!_actions) onClose();

				return objectFieldChoices(_actions);
			}

			if (!objectIsEmpty(window.actions || {})) return getShareActions();

			try {
				if (objectIsEmpty(window.actions || {})) {
					await new Promise((resolve) => {
						const handler = async () => {
							window.removeEventListener(
								"extensions-updated",
								handler
							);
							resolve(getShareActions());
						};

						window.addEventListener("extensions-updated", handler);
					});
				}
			} catch (error) {
				window.showToast("Load actions error: ", error);
			}
		},
	});

	useDataLoader({
		handler: async () => {
			if (_preview?.image) return _preview;

			if (isValidUrl(payload?.url)) {
				return await getWebsiteInfo(payload.url)
					.then((res) => {
						const { image, video, title, description, subtitle } = {
							...(_preview || {}),
							...(res.meta || {}),
						};
						const isYoutubeVideo =
							!payload?.url?.length &&
							payload?.url.match(
								// eslint-disable-next-line no-useless-escape
								/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
							)?.[1];

						return cleanObject({
							video: isYoutubeVideo ? image : video,
							image,
							title,
							subtitle: description || subtitle,
							data: res.data,
							url: payload.url,
						});
					})
					.catch(() => {
						//
					});
			}

			return _preview;
		},
		onSuccess: setPreview,
	});

	const contentPreview = (preview, title) => {
		let media = null;

		if (!objectIsEmpty(_.pick(preview || {}, ["icon", "image", "video"]))) {
			const { icon, image, video } = preview;

			if (image?.length || video?.length) {
				media = (
					<div
						className="flex-shrink-0 h-10 w-12 rounded-md bg-content/5 bg-cover bg-center relative overflow-hidden"
						style={{
							backgroundImage: `url(${video || image})`,
						}}
					>
						{video && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/50 dark:bg-black/50">
								<div className="relative size-[18px] bg-white flex items-center justify-center rounded-full overflow-hidden">
									<svg
										className="size-3 ml-0.5 relative text-black"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
										/>
									</svg>
								</div>
							</div>
						)}
					</div>
				);
			} else if (icon?.length) {
				media = (
					<div className="-mr-0.5 bg-content/5 border border-content/5 rounded-lg size-10 flex items-center justify-center">
						<div
							className="size-5 flex items-center justify-center"
							dangerouslySetInnerHTML={{ __html: icon }}
						></div>
					</div>
				);
			}
		}

		return (
			<div className="flex gap-2 pr-3">
				{media}

				<div className="flex-1 flex flex-col -mt-px">
					{(preview?.title || title) && (
						<h3 className="-mb-1 truncate font-bold first-letter:uppercase">
							{preview?.title || title}
						</h3>
					)}

					{preview?.subtitle && (
						<p className="truncate opacity-50">
							{preview.subtitle}
						</p>
					)}
				</div>
			</div>
		);
	};

	const onlg = onScreenSize("lg");

	return (
		<Portal>
			<div
				className={clsx(
					"fixed z-[999]",
					{ "top-0 flex items-center justify-center": onlg },
					inset
						? "inset-x-3 mb-[env(safe-area-inset-bottom)]"
						: "inset-x-0"
				)}
				style={{
					bottom: inset
						? "calc(32px - env(safe-area-inset-bottom))"
						: 0,
				}}
			>
				<div
					className="fixed inset-0 bg-black/20 dark:bg-black/70"
					onClick={() => onClose()}
				/>

				<motion.div
					className={clsx(
						"bg-stone-100/95 dark:bg-canvas backdrop-blur-sm relative z-10 w-full max-w-lg mx-auto group text-content border dark:border-content/10 shadow-2xl overflow-hidden",
						{ "p-3": !noHeading },
						onlg ? "rounded-xl" : "rounded-3xl"
					)}
					style={{
						paddingBottom: inset
							? noHeading
								? 0
								: 12
							: "calc(8px + env(safe-area-inset-bottom))",
						boxShadow: showOverlayBg
							? ""
							: "0px 10px 30px -2px var(--shadow-color)",
					}}
					animate={{
						y: 0,
						opacity: 1,
						scale: 1,
					}}
					initial={
						onlg
							? {
									scale: 0.9,
									opacity: 0,
							  }
							: {
									y: "10%",
									opacity: 0,
							  }
					}
					transition={{
						duration: 0.2,
					}}
					drag="y"
					dragConstraints={{
						top: 0,
						bottom: 0.5,
					}}
					dragElastic={{
						top: 0,
						bottom: 0.5,
					}}
					onDragEnd={(_, info) => {
						if (info.offset.y > 0) onClose();
					}}
				>
					<div className="absolute inset-0 -z-10 dark:bg-content/10 pointer-events-none"></div>

					{!noHeading && (
						<div className="mb-3 pl-1 flex items-center justify-between gap-2">
							{contentPreview(preview, title)}

							<button
								className="flex-shrink-0 ml-auto bg-content/5 border border-content/5 size-7 flex items-center justify-center rounded-full"
								onClick={() => onClose()}
							>
								<svg
									className="w-5"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6 18 18 6M6 6l12 12"
									></path>
								</svg>
							</button>
						</div>
					)}

					{loadingShareActions ? (
						<div className="flex justify-center py-4">
							<Loader size={40} />
							{/* {showLoader && <Loader size={40} />} */}
						</div>
					) : children ? (
						children
					) : (
						<>
							{!actions?.length && (
								<div className="pb-4 flex h-full items-center justify-center opacity-50">
									No matching actions
								</div>
							)}

							{actions && (
								<div className="max-h-80 overflow-auto">
									<ActionGrid
										flat={noHeading}
										key={"preview" + preview?.image}
										type="inline"
										data={actions}
										hideTrailing
										onClose={onClose}
										payload={{ ...payload, preview }}
									/>
								</div>
							)}
						</>
					)}
				</motion.div>
			</div>
		</Portal>
	);
}
