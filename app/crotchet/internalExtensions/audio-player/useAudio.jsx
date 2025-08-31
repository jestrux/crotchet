import { useEffect, useRef, useState } from "react";

export default function useAudio({ src, autoplay } = {}) {
	const skipStep = 5;
	const audioRef = useRef(new Audio());
	const audio = audioRef.current;
	const [loop, setLoop] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [playing, setPlaying] = useState(false);
	const onEndHandler = useRef(() => {});
	const onSongEnd = (callback) => (onEndHandler.current = callback);
	const playSong = (src) => {
		setLoaded(false);
		setCurrentTime(0);
		setDuration(0);

		audio.src = src;
		audio.currentTime = 0;
		audio.loop = loop;
		audio.play();

		setPlaying(true);
	};

	const stopSong = () => {
		audio.pause();
		audio.currentTime = 0;
		setPlaying(false);
	};

	const seekTo = (time) => {
		audio.currentTime = _.clamp(time, 0, duration - 0.2);
	};

	const skipBack = () => {
		seekTo(audio.currentTime - skipStep);
	};

	const skipForward = () => {
		seekTo(audio.currentTime + skipStep);
	};

	const togglePlay = ({ stop, src } = {}) => {
		if (!loaded) {
			if (src) playSong(src);
			return;
		}

		if (audio.paused) audio.play();
		else if (stop) stopSong();
		else audio.pause();

		setPlaying(!audio.paused);
	};

	const setTime = () => {
		setCurrentTime(audio.currentTime);
	};

	const setMeta = () => {
		setLoaded(true);
		setDuration(audio.duration);
	};

	const handleEnd = () => {
		setPlaying(false);
		setCurrentTime(0);
		onEndHandler.current();
	};

	const toggleLoop = () => {
		const newValue = !loop;
		setLoop(newValue);
		audio.loop = newValue;

		window.showToast("Loop " + (newValue ? "on" : "off"));
	};

	useEffect(() => {
		audio.addEventListener("timeupdate", setTime);
		audio.addEventListener("loadedmetadata", setMeta);
		audio.addEventListener("ended", handleEnd);

		if (src) {
			if (autoplay) playSong(src);
			else audioRef.current.src = src;
		}

		return () => {
			audio.removeEventListener("timeupdate", setTime);
			audio.removeEventListener("loadedmetadata", setMeta);
			audio.removeEventListener("ended", handleEnd);

			stopSong();
		};
	}, []);

	return {
		playing,
		loaded,
		currentTime,
		duration,
		loop,
		canGoBack: loaded && currentTime > 0,
		canGoForward: loaded && currentTime < duration,
		playSong,
		togglePlay,
		stopSong,
		seekTo,
		skipBack,
		skipForward,
		onSongEnd,
		toggleLoop,
	};
}
