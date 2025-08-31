import { toHms } from "@/crotchet/utils";
import useAudio from "./useAudio";
import clsx from "clsx";
import MediaItem from "@/crotchet/components/MediaItem";

export default function AudioPlayer({ image, title, subtitle, src, url }) {
	const {
		loaded,
		playing,
		currentTime,
		duration,
		togglePlay,
		canGoBack,
		canGoForward,
		skipBack,
		skipForward,
		loop,
		toggleLoop,
	} = useAudio({ src, autoplay: true });

	return (
		<div className="fixed inset-0 flex flex-col">
			<div className="flex-1 relative">
				<MediaItem
					large
					{...{
						image,
						title,
						subtitle,
						url,
					}}
				/>
			</div>

			<div className="text-content/50 dark:text-content/80 py-1.5 px-3.5 border-t border-content/10 flex items-center">
				{!loaded ? (
					<span className="flex relative">
						<span className="w-16">--:--</span>
						<span className="absolute inset-0 flex items-center justify-center pr-5">
							/
						</span>
						<span className="w-16">--:--</span>
					</span>
				) : (
					<span className="flex relative">
						<span className="w-16">{toHms(currentTime)}</span>
						<span className="absolute inset-0 flex items-center justify-center pr-5">
							/
						</span>
						<span className="w-16">{toHms(duration)}</span>
					</span>
				)}

				<div className="ml-auto flex items-center gap-2">
					<button
						className={clsx(
							"size-10 transition-opacity ",
							!loaded
								? "opacity-0 pointer-events-none"
								: !loop && "opacity-30"
						)}
						onClick={toggleLoop}
					>
						<svg
							className="size-5"
							viewBox="0 0 24 24"
							fill="none"
							strokeWidth={1.5}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
							/>
						</svg>
					</button>

					<button
						className={clsx("size-10 transition-opacity ", {
							"opacity-30 pointer-events-none": !canGoBack,
						})}
						onClick={skipBack}
					>
						<svg
							className="size-6"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
						</svg>
					</button>

					<button
						className={clsx("size-10 transition-opacity ", {
							"opacity-30 pointer-events-none": !canGoForward,
						})}
						onClick={skipForward}
					>
						<svg
							className="size-6"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
						</svg>
					</button>

					<button
						className="w-7"
						onClick={() => togglePlay({ stop })}
					>
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path
								fillRule="evenodd"
								d={
									playing
										? "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm6-2.438c0-.724.588-1.312 1.313-1.312h4.874c.725 0 1.313.588 1.313 1.313v4.874c0 .725-.588 1.313-1.313 1.313H9.564a1.312 1.312 0 0 1-1.313-1.313V9.564Z"
										: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
								}
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
