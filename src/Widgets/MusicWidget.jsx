import { useState } from "react";

const MusicWidget = () => {
	const [changingMood, setChangingMood] = useState(true);
	const [mood, setMood] = useState("chill");
	const playlistId = {
		Chill: "37i9dQZF1EVHGWrwldPRtj",
		Jazz: "37i9dQZF1EQqA6klNdJvwx",
		Afropop: "37i9dQZF1DWYs2pvwxWA7l",
		"90s RnB": "37i9dQZF1DX6VDO8a6cQME",
	}[mood];

	const handleSetMood = (mood) => {
		setMood(mood);
		setChangingMood(false);
	};

	return (
		<div className="h-full relative">
			<iframe
				title="Spotify Album"
				src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
				width="100%"
				height="100%"
				frameBorder="0"
				allowfullscreen=""
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			></iframe>

			{(changingMood || !playlistId?.length) && (
				<div className="z-10 absolute inset-0 min-h-full flex flex-col items-center justify-center text-center bg-lime-50">
					<img
						className="pointer-events-none absolute inset-0 object-cover opacity-[0.035]"
						src="https://www.picng.com/upload/music_notes/png_music_notes_90036.png"
						alt="music pattern"
					/>
					<span className="text-2xl">🎶</span>
					<div className="mt-1">
						<h5 className="text-xl font-medium text-black">
							Nice tunes, fine vibes
						</h5>
						<p className="text-lime-900">
							What kind of music are you in the mood for?
						</p>
					</div>

					<div className="mt-5 flex items-center font-semibold gap-1">
						<button
							className="uppercase bg-gradient-to-br from-green-300 to-green-400 text-black text-xs py-3 px-5 rounded-full flex items-center justify-center"
							onClick={() => handleSetMood("Chill")}
						>
							Chill
						</button>
						<button
							className="uppercase bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs py-3 px-5 rounded-full flex items-center justify-center"
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
							className="bg-gradient-to-br from-red-200 to-green-300 text-xs py-3 px-5 rounded-full flex items-center justify-center"
							onClick={() => handleSetMood("90s RnB")}
						>
							90s RnB
						</button>
					</div>
				</div>
			)}

			{playlistId?.length && (
				<button
					className="absolute right-2 top-2 z-10 rounded-full w-6 h-6 flex items-center justify-center bg-lime-100 border border-black/20"
					onClick={() => {setChangingMood(!changingMood); setMood(null)}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2.5}
						stroke="currentColor"
						className="w-4 h-4 text-lime-900"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			)}
		</div>
	);
};

export default MusicWidget;
