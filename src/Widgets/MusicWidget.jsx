import { useState } from "react";
import Loader from "../components/Loader";
import Widget from "../components/Widget";

const MusicWidget = () => {
	const [loading, setLoading] = useState(false);
	const [changingMood, setChangingMood] = useState(false);
	const [mood, setMood] = useState("Jazz");
	const playlistId = {
		Chill: "37i9dQZF1EVHGWrwldPRtj",
		Jazz: "37i9dQZF1EQqA6klNdJvwx",
		Afropop: "37i9dQZF1DWYs2pvwxWA7l",
		"90s RnB": "37i9dQZF1DX6VDO8a6cQME",
	}[mood];

	const handleSetMood = (mood) => {
		setMood(mood);
		setChangingMood(false);
		setLoading(true);

		const spotifyEmbedWindow = document.querySelector("#spotifyPlayer");

		spotifyEmbedWindow.onload = function () {
			setLoading(false);
		};
	};

	const theme =
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";

	const icon = (
		<svg className="w-3.5" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12,3c-4.97,0-9,4.03-9,9v7c0,1.1,0.9,2,2,2h4v-8H5v-1c0-3.87,3.13-7,7-7s7,3.13,7,7v1h-4v8h4c1.1,0,2-0.9,2-2v-7 C21,7.03,16.97,3,12,3z" />
		</svg>
	);

	const actions = [
		...(playlistId?.length
			? [
					{
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-3 h-3"
							>
								<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
							</svg>
						),
						onClick: () => {
							setChangingMood(!changingMood);
							setMood(null);
						},
					},
			  ]
			: []),
	];

	return (
		<Widget
			noPadding
			title="Music suggestions"
			icon={icon}
			actions={actions}
		>
			<div className="h-full relative">
				<iframe
					className="rounded-b-2xl"
					id="spotifyPlayer"
					title="Spotify Album"
					src={`https://open.spotify.com/embed/playlist/${playlistId}?theme=${theme}&autoplay=true`}
					width="100%"
					height="100%"
					frameBorder="0"
					allowFullScreen=""
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				></iframe>

				{(changingMood || !playlistId?.length) && (
					<div className="z-10 absolute inset-0 -mt-4 bg-card flex flex-col items-center justify-center text-center">
						<img
							className="pointer-events-none absolute inset-0 object-cover opacity-[0.035]"
							src="https://www.picng.com/upload/music_notes/png_music_notes_90036.png"
							alt="music pattern"
						/>
						<div className="">
							<p className="opacity-60 text-xl px-20 font-medium">
								What kind of music are you in the mood for?
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
