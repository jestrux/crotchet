import { useEffect, useRef, useState } from "react";
import Loader from "../components/Loader";
import Widget from "../components/Widget";

let savedToken,
	authEnd = 0;

async function getToken() {
	// 5 minutes
	if (savedToken && authEnd - Date.now() > 5 * 60000) return savedToken;

	const client_id = "383620f73a0d43d9a90bbce3c874a23e";
	const client_secret = "4fcbe9a340d349c984a0455dc94caf6a";

	const res = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		mode: "cors",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization:
				"Basic " +
				btoa(client_id + ":" + client_secret).toString("base64"),
		},
		body: `${encodeURIComponent("grant_type")}=${encodeURIComponent(
			"client_credentials"
		)}`,
	});

	const tokenDetails = await res.json();
	savedToken = tokenDetails.access_token;

	// console.log(savedToken);

	authEnd = Date.now() + tokenDetails.expires_in;
	return savedToken;
}

const useAudio = () => {
	const audioRef = useRef(new Audio());
	const audio = audioRef.current;
	const [playing, setPlaying] = useState(false);
	const onEndHandler = useRef(() => {});
	const onSongEnd = (callback) => (onEndHandler.current = callback);
	const playSong = (src) => {
		audio.src = src;
		audio.currentTime = 0;
		audio.play();

		setPlaying(true);
	};

	const stopSong = () => {
		audio.pause();
		audio.currentTime = 0;
		setPlaying(false);
	};

	const togglePlay = () => {
		if (audio.paused) audio.play();
		else audio.pause();

		setPlaying(!audio.paused);
	};

	useEffect(() => {
		audio.addEventListener("ended", () => {
			setPlaying(false);
			onEndHandler.current();
		});
	}, []);

	return { playing, playSong, togglePlay, stopSong, onSongEnd };
};

const MusicWidget = () => {
	const [currentSong, setCurrentSong] = useState(-1);
	const [loading, setLoading] = useState(false);
	const [changingMood, setChangingMood] = useState(false);
	const moods = {
		Chill: "37i9dQZF1EVHGWrwldPRtj",
		Jazz: "37i9dQZF1EQqA6klNdJvwx",
		Afropop: "37i9dQZF1DWYs2pvwxWA7l",
		"90s RnB": "37i9dQZF1DX6VDO8a6cQME",
	};
	const [playlist, setPlaylist] = useState(null);
	const songs = playlist?.songs || [];
	const { playing, playSong, stopSong, togglePlay, onSongEnd } = useAudio();

	const handleSetMood = (mood) => {
		fetchPlaylistDetails(moods[mood]);
		setChangingMood(false);
	};

	const handlePlaySong = (index) => {
		if (index === -1) index = 0;
		index === currentSong ? togglePlay() : setCurrentSong(index);
	};

	const playPreviousSong = () => handlePlaySong(currentSong - 1);

	const playNextSong = () =>
		handlePlaySong(currentSong === songs.length - 1 ? 0 : currentSong + 1);

	onSongEnd(playNextSong);

	useEffect(() => {
		if (currentSong === -1) stopSong();
		else if (songs.length) playSong(songs[currentSong].preview);
	}, [currentSong]);

	const fetchPlaylistDetails = async (playlistId) => {
		setPlaylist(null);
		setLoading(true);
		const token = await getToken();
		const res = await fetch(
			`https://api.spotify.com/v1/playlists/${playlistId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		const data = await res.json();
		const newPlaylist = {
			link: data.external_urls.spotify,
			poster: data.images.map(({ url }) => url)[0],
			name: data.name,
			author: data.owner.display_name,
			songs: data.tracks.items
				.filter(
					({ track }) => track.album && track.preview_url?.length > 0
				)
				.map(({ track: { album, ...track } }) => ({
					artwork: album.images[0].url,
					album: album.name,
					title: track.name,
					artist: track.artists.map(({ name }) => name).join(", "),
					preview: track.preview_url,
				})),
		};
		setLoading(false);

		setPlaylist(newPlaylist);

		setCurrentSong(-1);
	};

	const icon = (
		<svg className="w-3.5" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12,3c-4.97,0-9,4.03-9,9v7c0,1.1,0.9,2,2,2h4v-8H5v-1c0-3.87,3.13-7,7-7s7,3.13,7,7v1h-4v8h4c1.1,0,2-0.9,2-2v-7 C21,7.03,16.97,3,12,3z" />
		</svg>
	);

	const actions = [
		...(!playlist
			? []
			: [
					{
						icon: !changingMood ? (
							<svg
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-3 h-3"
							>
								<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
							</svg>
						) : (
							<svg
								viewBox="0 0 24 24"
								className="w-3 h-3"
								fill="none"
								strokeWidth={1.5}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						),
						onClick: () => setChangingMood(!changingMood),
					},
			  ]),
	];

	return (
		<Widget title="Music" icon={icon} actions={actions} noPadding noScroll>
			<div className="h-full relative -mr-1">
				<div className="h-full w-full flex flex-col">
					<div className="h-full overflow-auto px-3.5 pt-2 flex-1 flex gap-2 items-start justify-between">
						<div className="sticky top-0 flex-shrink-0 rounded bg-content/10">
							<img
								className="w-24 aspect-square relative rounded"
								src={playlist?.poster}
								alt=""
							/>
						</div>
						<div className="flex-1 h-full">
							{songs.map((song, index) => {
								const selected = index === currentSong;

								return (
									<button
										key={index}
										className={`text-left h-6 pl-1 w-full rounded overflow-hidden text-[10px] leading-none flex items-center gap-0.5
											${selected && "bg-content bg-opacity-[0.08]"}
										`}
										onClick={() => handlePlaySong(index)}
									>
										<span className="w-5 h-5 flex-shrink-0 flex items-center justify-center opacity-60">
											{selected ? (
												<svg
													className="w-3.5"
													viewBox="0 0 24 24"
													fill="currentColor"
												>
													<path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
												</svg>
											) : (
												index + 1 + "."
											)}
										</span>
										<span
											className={`truncate ${selected}`}
										>
											{song.title}
											<span className="ml-1 opacity-50">
												&mdash; {song.artist}
											</span>
										</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="py-1 pl-4 pr-3 border-t border-content/10 flex-shrink-0 flex">
						<a
							className="flex items-center gap-1.5"
							href={playlist?.link}
							target="_blank"
							rel="noreferrer"
						>
							<svg
								className="w-4"
								fill="#1CD05D"
								viewBox="0 0 24 24"
							>
								<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
							</svg>
							<div className="text-xs">
								{playlist?.name}
								<span className="ml-1 opacity-50">
									&mdash; {playlist?.author}
								</span>
							</div>
						</a>

						<div className="ml-auto flex items-center gap-3">
							<button
								className={`w-5 ${
									[-1, 0].includes(currentSong) &&
									"opacity-30 pointer-events-none"
								}`}
								onClick={playPreviousSong}
							>
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
								</svg>
							</button>

							<button
								className={`w-5 ${
									[-1, songs.length - 1].includes(
										currentSong
									) && "opacity-30 pointer-events-none"
								}`}
								onClick={playNextSong}
							>
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
								</svg>
							</button>

							<button
								className="w-7"
								onClick={() => handlePlaySong(currentSong)}
							>
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path
										fillRule="evenodd"
										d={
											playing
												? "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM9 8.25a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75H9zm5.25 0a.75.75 0 00-.75.75v6c0 .414.336.75.75.75H15a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-.75z"
												: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
										}
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				{(changingMood || !playlist) && (
					<div className="z-10 absolute inset-0 -mt-4 -mx-4 bg-card flex flex-col items-center justify-center text-center">
						<img
							className="pointer-events-none absolute inset-0 object-cover opacity-[0.035]"
							src="https://www.picng.com/upload/music_notes/png_music_notes_90036.png"
							alt="music pattern"
						/>
						<div className="">
							<p className="opacity-80 px-20 font-medium">
								What type of music are you in the mood for?
							</p>
						</div>

						<div className="mt-4 flex items-center font-semibold gap-1">
							<button
								className="uppercase bg-gradient-to-br from-green-300 to-yellow-300 text-black text-xs py-3 px-5 rounded-full flex items-center justify-center"
								onClick={() => handleSetMood("Chill")}
							>
								Chill
							</button>
							<button
								className="uppercase bg-gradient-to-br from-purple-500 to-teal-500 text-white text-xs py-3 px-5 rounded-full flex items-center justify-center"
								onClick={() => handleSetMood("Jazz")}
							>
								Jazz
							</button>
							<button
								className="uppercase bg-gradient-to-br from-red-500 via-orange-300 to-yellow-500 text-black text-xs py-3 px-5 rounded-full flex items-center justify-center"
								onClick={() => handleSetMood("Afropop")}
							>
								Afropop
							</button>
							<button
								className="bg-gradient-to-br from-red-200 to-green-300 text-black text-xs py-3 px-5 rounded-full flex items-center justify-center"
								onClick={() => handleSetMood("90s RnB")}
							>
								90s RnB
							</button>
						</div>
					</div>
				)}

				{loading && (
					<div className="z-10 absolute inset-0 -mt-4 bg-card flex flex-col items-center justify-center text-center">
						<Loader scrimColor="transparent" />
					</div>
				)}
			</div>
		</Widget>
	);
};

export default MusicWidget;
