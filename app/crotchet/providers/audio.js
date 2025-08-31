export class audioPlayer {
	constructor({ src, autoplay, duration, loop } = {}) {
		this.src = src;
		this.skipStep = 5;
		this.audio = new Audio();
		this.loop = loop;
		this.loaded = false;
		this.duration = duration ?? 0;
		this.currentTime = 0;
		this.playing = false;
		this.onEndHandler = () => {};
		this.listeners = new Set();

		this.audio.addEventListener("timeupdate", this.setTime);
		this.audio.addEventListener("loadedmetadata", this.setMeta);
		this.audio.addEventListener("ended", this.handleEnd);

		if (src) {
			if (autoplay) this.playSong(src);
			else this.audio.src = src;
		}
	}

	notifyListeners = () => {
		this.listeners.forEach((listener) =>
			listener(this.getState(), this.actions())
		);
	};

	subscribe = (listener) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	onSongEnd = (callback) => {
		this.onEndHandler = callback;
	};

	playSong = (src) => {
		this.src = src;
		this.loaded = false;
		this.currentTime = 0;
		this.duration = 0;

		this.audio.src = src;
		this.audio.currentTime = 0;
		this.audio.loop = this.loop;
		this.audio.play();

		this.playing = true;
		this.notifyListeners();
	};

	stopSong = () => {
		this.audio.pause();
		this.audio.currentTime = 0;
		this.playing = false;
		this.notifyListeners();
	};

	seekTo = (time) => {
		this.audio.currentTime = _.clamp(time, 0, this.duration - 0.2);
	};

	restart = () => {
		this.playSong(this.src);
	};

	skipBack = () => {
		this.seekTo(this.audio.currentTime - this.skipStep);
	};

	skipForward = () => {
		this.seekTo(this.audio.currentTime + this.skipStep);
	};

	togglePlay = ({ stop, src } = {}) => {
		if (!this.loaded) {
			if (src) this.playSong(src);
			return;
		}

		if (this.audio.paused) this.audio.play();
		else if (stop) this.stopSong();
		else this.audio.pause();

		this.playing = !this.audio.paused;
		this.notifyListeners();
	};

	setTime = () => {
		this.currentTime = this.audio.currentTime;
		this.notifyListeners();
	};

	setMeta = () => {
		this.loaded = true;
		this.duration = this.audio.duration;
		this.notifyListeners();
	};

	handleEnd = () => {
		this.playing = false;
		this.currentTime = 0;
		this.notifyListeners();
		this.onEndHandler();
	};

	toggleLoop = () => {
		this.loop = !this.loop;
		this.audio.loop = this.loop;

		window.showToast("Loop " + (this.loop ? "on" : "off"));
		this.notifyListeners();
	};

	cleanup = () => {
		this.audio.removeEventListener("timeupdate", this.setTime);
		this.audio.removeEventListener("loadedmetadata", this.setMeta);
		this.audio.removeEventListener("ended", this.handleEnd);
		this.stopSong();
		this.listeners.clear();
	};

	actions = () => getMediaPlayerActions(this);

	getState = () => ({
		playing: this.playing,
		loaded: this.loaded,
		currentTime: this.currentTime,
		duration: this.duration,
		loop: this.loop,
		canGoBack: this.loaded && this.currentTime > 0,
		canGoForward: this.loaded && this.currentTime < this.duration,
	});
}

export const getMediaPlayerActions = (player) => {
	const UI = window.UI;

	// if (!player?.loaded) return [];

	return [
		{
			id: "playPause",
			icon: UI.icon("play"),
			remote: true,
			label: "Play / Pause",
			shortcut: "Space",
			handler: () => player.togglePlay(),
		},
		{
			id: "restart",
			icon: UI.svg(
				"M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z",
				{ filled: true }
			),
			remote: true,
			label: "Restart",
			shortcut: "r",
			handler: () => player.restart(),
		},
		{
			id: "skip-back",
			icon: UI.svg("M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z", {
				filled: true,
			}),
			remote: true,
			section: "Skip",
			label: "Skip Back",
			shortLabel: "Back",
			shortcut: "ArrowLeft",
			handler: () => player.skipBack(),
		},
		{
			id: "skip-forward",
			icon: UI.svg("M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z", {
				filled: true,
			}),
			remote: true,
			section: "Skip",
			label: "Skip Forward",
			shortLabel: "Forward",
			shortcut: "ArrowRight",
			handler: () => player.skipForward(),
		},
		{
			id: "toggle-loop",
			icon: UI.svg(
				"M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3",
				{ filled: true }
			),
			remote: true,
			shortLabel: "Crop",
			label: "Toggle Crop",
			shortcut: "l",
			handler: () => player.toggleLoop(),
		},
	];
};
