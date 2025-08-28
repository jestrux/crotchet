import { ActionSheet } from "@/crotchet/components";
import PreviewCard from "@/crotchet/components/PreviewCard";
import ActionGrid from "@/crotchet/components/ActionGrid";
import { useDataLoader, useEventListener } from "@/crotchet/hooks";
import {
	createPreviewImage,
	dispatch,
	getLinksFromText,
	getShareActions,
	isValidUrl,
	loadExternalAsset,
	objectIsEmpty,
} from "@/crotchet/utils";
import { Filesystem } from "@capacitor/filesystem";
import { useRef, useState } from "react";
import { crawlUrl } from "@/crotchet/providers/crawler";
import ModalPage from "@/crotchet/components/ModalPage";

const generatePreview = async (fileDataUrl, format) => {
	async function generateGenericPreview(previewText, format) {
		let background = "#7EBE4B",
			color = "#ffffff",
			icon,
			text;

		if (format) format = format.toLowerCase();

		if (window.tinycolor) {
			var colorObject = window.tinycolor(previewText);
			if (colorObject.isValid()) background = "#" + colorObject.toHex();
		}

		if (format === "pdf") {
			background = "#fff7f6";
			color = "#762423";
		}

		if (format === "url") background = "#0d1a4d"; // dark blue

		if (format === "url") {
			icon = {
				viewBox: 16,
				path: "M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484q-.121.12-.242.234c-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327Z",
			};
		} else if (format) text = format.toUpperCase();

		return await createPreviewImage(
			{
				background,
				color,
				text,
				icon,
			},
			"blob"
		);
	}

	async function ensurePDFJSLoaded() {
		// If PDF.js is already loaded, return immediately
		if (window.pdfjsLib) return;

		// If PDF.js is currently loading, wait for it
		if (window.pdfJSLoading) return window.pdfJSLoading;

		// Start loading PDF.js
		window.pdfJSLoading = (async () => {
			// Load main PDF.js library
			await loadExternalAsset(
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js"
			);

			// Configure and load worker
			window.pdfjsLib.GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";
		})();

		await window.pdfJSLoading;
		window.pdfJSLoading = null;
	}

	function generatePDFPreview(pdfUrl) {
		return new Promise((resolve, reject) => {
			const canvas = document.createElement("canvas");
			canvas.width = 800;
			canvas.height = 600;
			const ctx = canvas.getContext("2d");

			window.pdfjsLib
				.getDocument(pdfUrl)
				.promise.then((pdf) => pdf.getPage(1))
				.then((page) => {
					const viewport = page.getViewport({ scale: 1.0 });
					const scale = Math.min(
						canvas.width / viewport.width,
						canvas.height / viewport.height
					);
					const scaledViewport = page.getViewport({ scale });

					canvas.width = scaledViewport.width;
					canvas.height = scaledViewport.height;

					return page.render({
						canvasContext: ctx,
						viewport: scaledViewport,
					}).promise;
				})
				.then(() => {
					canvas.toBlob((blob) => {
						URL.revokeObjectURL(pdfUrl);
						resolve(blob);
					}, "image/png");
				})
				.catch((err) => {
					URL.revokeObjectURL(pdfUrl);
					reject(err);
				});
		});
	}

	function generateVideoPreview(videoUrl) {
		return new Promise((resolve, reject) => {
			const video = document.createElement("video");
			const canvas = document.createElement("canvas");
			canvas.width = 800;
			canvas.height = 600;
			const ctx = canvas.getContext("2d");

			video.src = videoUrl;

			video.autoplay = false;
			video.muted = true;
			video.currentTime = 1;

			video.addEventListener("loadeddata", () => {
				const scale = Math.min(
					canvas.width / video.videoWidth,
					canvas.height / video.videoHeight
				);
				const scaledWidth = video.videoWidth * scale;
				const scaledHeight = video.videoHeight * scale;

				const x = (canvas.width - scaledWidth) / 2;
				const y = (canvas.height - scaledHeight) / 2;

				ctx.fillStyle = "#000000";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(video, x, y, scaledWidth, scaledHeight);

				canvas.toBlob((blob) => {
					URL.revokeObjectURL(videoUrl);
					resolve(blob);
				}, "image/png");
			});

			video.addEventListener("error", (err) => {
				URL.revokeObjectURL(videoUrl);
				reject(err);
			});
		});
	}

	let previewBlob = await generateGenericPreview(fileDataUrl, format);

	if (fileDataUrl) {
		try {
			if (format === "pdf" || format === "ai") {
				await ensurePDFJSLoaded();
				previewBlob = await generatePDFPreview(fileDataUrl);
			}
			if (format === "mp4")
				previewBlob = await generateVideoPreview(fileDataUrl);
		} catch (error) {
			//
		}
	}

	return URL.createObjectURL(previewBlob);
};

export default function ReceiveShareIntent({ floating = true }) {
	const shareSheetRef = useRef(null);
	const [shareSheet, _setShareSheet] = useState(null);
	const setShareSheet = (newValue) => {
		shareSheetRef.current = newValue;
		_setShareSheet(newValue);
		dispatch("share-intent-data-updated");
	};
	const supportedDocTypes = ["pdf"];

	const setPreviewLoading = (loading) => {
		const v = shareSheetRef.current;
		setShareSheet({
			...(v || {}),
			preview: {
				...(v?.preview || {}),
				loading,
			},
		});
	};

	const addUrlPreview = async (url) => {
		if (!url || !isValidUrl(url)) return;

		let res;

		// setPreviewLoading(true);
		const image = await generatePreview(url, "URL");
		const v = shareSheetRef.current;
		setShareSheet({
			...(v || {}),
			preview: {
				...(v?.preview || {}),
				image,
			},
			payload: {
				...(v?.payload || {}),
				image,
			},
		});

		setTimeout(async () => {
			try {
				res = await crawlUrl(url);
			} catch (error) {
				//
			}

			if (res?.meta) {
				const meta = res.meta;
				const v = shareSheetRef.current;
				return setShareSheet({
					...(v || {}),
					payload: {
						...(v?.payload || {}),
						...meta,
					},
					preview: {
						...(v?.preview || {}),
						...meta,
						loading: false,
					},
				});
			}

			setPreviewLoading(false);
		}, 300);
	};

	const addFilePreview = async (payload) => {
		// setPreviewLoading(true);
		const image = await generatePreview(null, payload.resultType);
		const v = shareSheetRef.current;
		setShareSheet({
			...(v || {}),
			preview: {
				...(v?.preview || {}),
				image,
			},
		});

		try {
			const image = await generatePreview(
				payload.file,
				payload.resultType
			);

			if (!image) return setPreviewLoading(false);

			const v = shareSheetRef.current;
			return setShareSheet({
				...(v || {}),
				preview: {
					...(v?.preview || {}),
					image,
					loading: false,
				},
				payload: {
					...(v?.payload || {}),
					image,
				},
			});
		} catch (error) {
			setPreviewLoading(false);
		}
	};

	const addColorPreview = async (text) => {
		if (window.tinycolor) {
			var color = window.tinycolor(text);
			if (color.isValid()) {
				const image = await generatePreview(text);
				const title = window.getColorName("#" + color.toHex());
				const v = shareSheetRef.current;
				setShareSheet({
					...(v || {}),
					preview: {
						...(v?.preview || {}),
						image,
						title,
					},
					payload: {
						...(v?.payload || {}),
						image,
						title,
					},
				});
			}
		}
	};

	const processLaunchUrl = async (result) => {
		if (!result || typeof result != "object") return;

		let resultUrl = decodeURIComponent(result.url || result.title);
		let [, resultType] = decodeURIComponent(result.type).split("/");
		let payload = {
			incoming: true,
			resultType,
			type: resultType,
		};
		let preview = {
			image: null,
			title: null,
			subtitle: null,
		};

		if (resultType == "plain") {
			preview.subtitle = resultUrl;

			if (isValidUrl(resultUrl)) payload.url = resultUrl;
			else {
				payload.text = resultUrl;
				payload.url = getLinksFromText(resultUrl, true);
			}
		} else if (["jpg", "png"].includes(resultType)) {
			preview.title = resultUrl.split("/").at(-1).split(".").at(0);
			preview.subtitle = `image/${resultType}`;
			preview.type = `image/${resultType}`;
			var file = await Filesystem.readFile({
				path: resultUrl,
			}).then(
				async (content) =>
					`data:image/${resultType};base64,${content.data}`
			);
			payload.file = file;
			preview.image = file;
		} else if (supportedDocTypes.includes(resultType)) {
			preview.title = resultUrl.split("/").at(-1).split(".").at(0);
			preview.subtitle = `document/${resultType}`;
			payload.type = `document/${resultType}`;
			payload.file = await Filesystem.readFile({
				path: resultUrl,
			}).then(
				async (content) =>
					`data:application/${resultType};base64,${content.data}`
			);
		}

		if (objectIsEmpty(_.pick(payload, ["text", "image", "url", "file"])))
			return null;

		return {
			title: "Select an action",
			payload,
			preview: !objectIsEmpty(preview) ? preview : null,
			actions: getShareActions(payload),
		};
	};

	const { data: actions } = useDataLoader({
		handler: async () => {
			return getShareActions(shareSheetRef.current?.payload);
		},
		listenForUpdates: ["app-actions-updated", "share-intent-data-updated"],
	});

	const error = null;

	useEventListener("app-launched", () => {
		let launchUrl;

		try {
			launchUrl = window.appLaunchArgs;
			processLaunchUrl(launchUrl).then((res) => {
				setShareSheet(res);

				const payload = res?.payload;
				if (!payload) return;

				if (!res?.preview?.image) {
					addColorPreview(payload.text);
					if (payload.url) addUrlPreview(payload.url);
				}

				if (
					payload.file &&
					supportedDocTypes.includes(payload.resultType)
				)
					addFilePreview(payload);
			});

			// alert(JSON.stringify({ launchUrl }));
		} catch (error) {
			alert(
				JSON.stringify({
					launchError: true,
					launchUrl,
					error: error?.message || error,
				})
			);
		}
	});

	if (error || !shareSheet) return null;

	const { preview } = shareSheet || {};

	if (floating) {
		return (
			<ModalPage
				actionsTitle="Actions"
				preview={preview}
				actions={actions}
				onClose={() => {
					setShareSheet(null);
				}}
			/>
		);
	}

	return (
		<ActionSheet
			dismissible
			inset={false}
			onClose={() => {
				setShareSheet(null);
			}}
		>
			<div className="p-3" style={{ minHeight: "80vh" }}>
				{preview && <PreviewCard {...preview} />}

				{actions && (
					<div className="mt-6">
						<ActionGrid
							key={
								actions &&
								JSON.stringify(actions.map((a) => a.name))
							}
							type="inline"
							title="Actions"
							hideTrailing
							data={actions}
						/>
					</div>
				)}
			</div>
		</ActionSheet>
	);
}
