import { useRef, useState } from "react";
import { AlertDialog, AlertDialogLabel } from "@reach/alert-dialog";
import clsx from "clsx";

import {
	cleanObject,
	crawlUrl,
	isValidUrl,
	objectIsEmpty,
	randomId,
} from "@/crotchet/utils";
import { NavButton, Loader } from "@/crotchet/components";
import { useDataLoader } from "@/crotchet/hooks";
import { globalActions } from "..";

const ActionSheetContent = ({
	noHeading,
	onClose,
	actions: _actions,
	payload = {},
	onChange = () => {},
}) => {
	const [groupFilter, setGroupFilter] = useState();
	const [sheetProps, setSheetProps] = useState({
		...payload,
		actions: [],
	});

	const { loading } = useDataLoader({
		handler: _actions,
		onSuccess: (actions) =>
			setSheetProps((oldProps) => {
				return {
					...oldProps,
					actions,
				};
			}),
		dismiss: () => onClose(),
	});

	onChange((props) => {
		setSheetProps((oldProps) => {
			return {
				...oldProps,
				...props,
			};
		});
	});

	const actions = sheetProps.actions.map((action) => {
		action.__id = randomId();
		let handler = action.handler;

		if (_.isFunction(handler)) {
			action.handler = () =>
				handler(_.omit(sheetProps, ["actions", "preview"]), __crotchet);
		}

		return action;
	});
	const mainActions = _.filter(actions, { main: true });
	const otherActions = actions.filter(({ main }) => !main);
	const groups = _.keys(_.groupBy(otherActions, "group")).filter(
		(group) => group && group != "undefined"
	);

	if (groups.length && !groupFilter) setGroupFilter(groups[0]);

	return (
		<div className={clsx(noHeading ? "px-3" : "pt-5 px-5")}>
			{loading ? (
				<div className="flex justify-center">
					<Loader size={40} />
				</div>
			) : (
				<div className="mt-3 space-y-3" onClick={() => onClose()}>
					{mainActions?.length > 0 && (
						<div className="grid grid-cols-3 gap-3">
							{mainActions.map((action) => (
								<NavButton
									key={action.__id}
									vertical
									className="bg-card shadow dark:border border-content/5 p-4 rounded-lg"
									action={action}
									inShareSheet
								/>
							))}
						</div>
					)}

					{otherActions.length > 0 && (
						<div className="bg-card shadow dark:border border-content/5 rounded-lg overflow-hidden divide-y divide-content/5">
							{otherActions.map((action) => {
								if (groupFilter && action.group != groupFilter)
									return null;

								return (
									<NavButton
										className="px-4"
										key={action.__id}
										action={action}
										inShareSheet
									/>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const getYoutubeVideoId = (url) => {
	if (!url?.length) return null;

	return url.match(
		// eslint-disable-next-line no-useless-escape
		/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
	)?.[1];
};

export default function ActionSheet({
	title,
	preview: _preview,
	payload,
	children,
	label = "Content",
	dismissible = true,
	showOverlayBg = true,
	onClose,
}) {
	const [preview, setPreview] = useState(_preview);
	const cancelRef = useRef();
	useDataLoader({
		handler: async () => {
			if (_preview?.image) return _preview;

			if (isValidUrl(payload?.url)) {
				return await crawlUrl(payload.url)
					.then((res) => {
						const { image, title, description } = res.meta || {};

						return cleanObject({
							video: getYoutubeVideoId(payload?.url)
								? image
								: _preview?.video,
							image: image || _preview?.image,
							title: title || _preview?.title,
							subtitle: description || _preview?.subtitle,
							data: res.data,
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
						className="border border-content/10 flex-shrink-0 h-10 w-12 rounded-md bg-cover bg-center relative overflow-hidden"
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
			<div className="flex gap-1.5 pr-3">
				{media}

				<div className="flex-1 flex flex-col">
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

	return (
		<AlertDialog
			onDismiss={dismissible ? onClose : () => {}}
			isOpen={true}
			leastDestructiveRef={cancelRef}
			className="fixed inset-x-0 bottom-0 z-[999]"
		>
			<div
				ref={cancelRef}
				className="fixed inset-0 bg-black/20 dark:bg-black/70"
				onClick={onClose}
			>
				<AlertDialogLabel className="hidden">{label}</AlertDialogLabel>
			</div>

			<div
				className="p-5 rounded-t-[32px] relative z-10 w-full max-w-lg mx-auto group bg-card text-content border shadow-2xl overflow-hidden"
				style={{
					boxShadow: showOverlayBg
						? ""
						: "0px 10px 30px -2px var(--shadow-color)",
				}}
			>
				<div className="flex items-center justify-between gap-2 px-1">
					{contentPreview(preview, title)}

					<button
						className="flex-shrink-0 ml-auto bg-content/5 border border-content/5 size-7 flex items-center justify-center rounded-full"
						onClick={onClose}
					>
						<svg
							className="w-3.5"
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

				<div style={{ minHeight: "120px" }}>
					{children ? (
						children
					) : (
						<ActionSheetContent
							payload={payload}
							actions={globalActions()}
							// actions={globalActions({ share: true })}
							onClose={onClose}
						/>
					)}
				</div>
			</div>
		</AlertDialog>
	);
}
