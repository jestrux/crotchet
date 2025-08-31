import { registerAction } from "@/crotchet";
import { audioPlayer } from "@/crotchet/providers/audio";
import * as UI from "@/crotchet/providers/ui";
import { dispatch } from "@/crotchet/utils";

window.playMedia = (audio) => {
	window.actions?.playAudio?.handler(audio);
};

export default function audioPlayerExtension() {
	registerAction("playAudio", {
		icon: window.UI.icon("play"),
		label: "Play Audio",
		context: "share",
		match: ({ file, type }) => file && ["m4a", "mp3"].includes(type),
		handler: (media) => {
			if (!media && !media?.src && !media?.file && !media?.url)
				return window.showToast("Invalid audio");

			media.src = media.src || media.file || media.url;

			const player = new audioPlayer({
				src: media.src,
				duration: media.duration,
				loop: true,
			});

			window.openPage({
				type: "detail",
				title: (media.title && !media.metadata) || "Media Player",
				// fullScreen: true,
				resolve: () => media,
				content: media?.metadata ? UI.previewWithMeta : UI.media,
				onReady: ({
					page,
					setActions,
					setMainAction,
					setSecondaryAction,
				}) => {
					setSecondaryAction(
						UI.component({
							content: () => `
								<span class="flex items-center gap-2">
									<span class="py-1 px-1.5 border rounded-md text-content"
										:class="$pageData.loop ? 'bg-content/20' : 'opacity-70'"
									>
										<svg class="size-4" fill="currentColor" viewBox="0 0 24 24">
											<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
										</svg>
									</span>
									
									<span class="flex relative">
										<span class="w-16" x-text="window.toHms($pageData.currentTime || 0)"></span>
										<span class="absolute inset-0 flex items-center justify-center -ml-2 pr-5">
											/
										</span>
										<span class="w-16" 
											x-text="$pageData.duration ? window.toHms($pageData.duration) : '--:--'"
										></span>
									</span>
								</span>
							`,
							onInit: () => {
								player.subscribe((state) => {
									dispatch("page-data-changed-" + page?._id, {
										...media,
										...state,
									});
								});
							},
						})
					);

					const actions = player.actions();
					setMainAction(actions[0]);
					setActions([
						...actions,
						...(media.actions || []).map((action) => ({
							...action,
							section: "Other Actions",
						})),
					]);

					player.playSong(media.src);
				},
				onClose: () => {
					player.cleanup();
				},
			});
		},
	});
}
