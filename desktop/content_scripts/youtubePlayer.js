// ==CrotchetScript==
// @name     YouTube Player
// @match    youtube\.com\/watch
// @match    youtube\.com\/shorts
// ==/CrotchetScript==
(function() {
	if (window.__crotchetInitialized) return;
	window.__crotchetInitialized = true;

	const formatTime = (s) => {
		s = Math.max(0, Math.floor(s));
		const m = Math.floor(s / 60);
		const sec = String(s % 60).padStart(2, '0');
		return m + ':' + sec;
	};

	// Read clip boundaries from injected global (reliable) with URL param fallback
	const data = window.__crotchetData || {};
	const windowId = data._id || '';
	const noControls = !!data.noControls;
	const parseTime = (t) => {
		if (!t) return 0;
		if (!isNaN(Number(t))) return Number(t);
		const parts = String(t).split(':').map(Number);
		if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
		if (parts.length === 2) return parts[0] * 60 + parts[1];
		return parts[0];
	};
	const params = new URLSearchParams(location.search);
	const clipStart = data.start ?? parseTime(params.get('start'));
	const clipEnd = data.end ?? parseTime(params.get('end'));
	const clipDuration = clipEnd - clipStart;

	let isScrubbing = false;
	let _video = null;
	let _cropEnabled = true;
	let _hideTimer;
	let controls = null;

	const showControls = () => {
		if (!controls) return;
		controls.classList.add('visible');
		clearTimeout(_hideTimer);
		_hideTimer = setTimeout(() => controls.classList.remove('visible'), 2500);
	};

	// TV remote / postMessage bridge
	window.addEventListener('message', (e) => {
		if (!e.data?.crotchetAction || !_video) return;
		showControls();
		const action = e.data.crotchetAction;
		if (action === 'toggle-play') _video.paused ? _video.play() : _video.pause();
		else if (action === 'skip-back') _video.currentTime = Math.max(_cropEnabled ? clipStart : 0, _video.currentTime - 10);
		else if (action === 'skip-forward') _video.currentTime = Math.min(_cropEnabled ? clipEnd : _video.duration, _video.currentTime + 10);
		else if (action === 'restart') { _video.currentTime = _cropEnabled ? clipStart : 0; _video.play(); }
	});

	// --- Force player fullscreen, robust against YouTube's player reinitialization ---
	const enforceFullscreen = () => {
		const player = document.querySelector('#movie_player');
		if (!player) return;
		player.style.setProperty('position', 'fixed', 'important');
		player.style.setProperty('top', '0', 'important');
		player.style.setProperty('left', '0', 'important');
		player.style.setProperty('width', '100vw', 'important');
		player.style.setProperty('height', '100vh', 'important');
		player.style.setProperty('z-index', '9999', 'important');
	};

	// Poll for first 15s to catch YouTube reinitializing the player element
	let enforceCount = 0;
	const enforceInterval = setInterval(() => {
		enforceFullscreen();
		if (++enforceCount > 30) clearInterval(enforceInterval);
	}, 500);

	// Also watch style attribute changes on the player for long-term enforcement
	const watchPlayer = () => {
		const player = document.querySelector('#movie_player');
		if (!player || player.__crotchetWatched) return false;
		player.__crotchetWatched = true;
		new MutationObserver(enforceFullscreen)
			.observe(player, { attributes: true, attributeFilter: ['style'] });
		return true;
	};
	const watchInterval = setInterval(() => {
		if (watchPlayer()) clearInterval(watchInterval);
	}, 200);

	// --- Cinema mode CSS (always applied) ---
	const style = document.createElement('style');
	style.textContent = `
		#masthead-container, #secondary, #below, #chat-container, ytd-miniplayer, #player-ads {
			display: none !important;
		}
		#movie_player {
			position: fixed !important;
			top: 0 !important; left: 0 !important;
			width: 100vw !important; height: 100vh !important;
			z-index: 9999 !important;
		}
		.ytp-chrome-bottom, .ytp-gradient-bottom,
		.ytp-chrome-top, .ytp-gradient-top,
		.ytp-cards-button, .ytp-cards-teaser,
		.ytp-ce-element, .ytp-watermark, .iv-branding,
		.ytp-info-panel, .ytp-info-panel-preview,
		.ytp-endscreen-element {
			display: none !important;
		}
	` + (!noControls ? `
		#crotchet-controls {
			position: fixed;
			bottom: 16px;
			left: 50%;
			transform: translateX(-50%);
			z-index: 99999;
			width: calc(100vw - 32px);
			max-width: 640px;
			background: rgba(0,0,0,0.55);
			backdrop-filter: blur(20px);
			-webkit-backdrop-filter: blur(20px);
			border-radius: 14px;
			padding: 10px 14px;
			box-sizing: border-box;
			font-family: -apple-system, BlinkMacSystemFont, sans-serif;
			color: white;
			opacity: 0;
			transition: opacity 0.2s ease;
			user-select: none;
		}
		#crotchet-controls.visible { opacity: 1; }
		#crotchet-scrubber-row {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 8px;
		}
		#crotchet-time {
			font-size: 11px;
			opacity: 0.85;
			white-space: nowrap;
			text-align: right;
		}
		#crotchet-crop {
			font-size: 10px;
			opacity: 0.5;
			white-space: nowrap;
			padding: 0 2px;
		}
		#crotchet-scrubber {
			flex: 1;
			-webkit-appearance: none;
			appearance: none;
			height: 3px;
			border-radius: 2px;
			background: rgba(255,255,255,0.3);
			outline: none;
			cursor: pointer;
		}
		#crotchet-scrubber::-webkit-slider-thumb {
			-webkit-appearance: none;
			width: 13px; height: 13px;
			border-radius: 50%;
			background: white;
			cursor: pointer;
			box-shadow: 0 1px 4px rgba(0,0,0,0.4);
		}
		#crotchet-buttons {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		#crotchet-left, #crotchet-right {
			display: flex;
			align-items: center;
			gap: 4px;
		}
		.crotchet-btn {
			background: none;
			border: none;
			color: white;
			cursor: pointer;
			padding: 4px 6px;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			opacity: 0.85;
			transition: opacity 0.15s, background 0.15s;
		}
		.crotchet-btn:hover { opacity: 1; background: rgba(255,255,255,0.12); }
		.crotchet-btn.active { opacity: 1; color: #4fc3f7; }
	` : '');
	document.head.appendChild(style);

	// --- Build controls (desktop only) ---
	if (!noControls) {
		const NS = 'http://www.w3.org/2000/svg';

		const mkSvg = (d, size, fill) => {
			const svg = document.createElementNS(NS, 'svg');
			svg.setAttribute('width', size); svg.setAttribute('height', size);
			svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', fill || 'white');
			const path = document.createElementNS(NS, 'path');
			path.setAttribute('d', d);
			svg.appendChild(path);
			return svg;
		};

		const mkBtn = (id, d, size, title, cls) => {
			const btn = document.createElement('button');
			btn.className = 'crotchet-btn' + (cls ? ' ' + cls : '');
			btn.id = id; btn.title = title || '';
			btn.appendChild(mkSvg(d, size));
			return btn;
		};

		const mkInput = (id, type, attrs) => {
			const el = document.createElement('input');
			el.id = id; el.type = type;
			Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
			return el;
		};

		controls = document.createElement('div');
		controls.id = 'crotchet-controls';

		// Scrubber row
		const scrubberRow = document.createElement('div');
		scrubberRow.id = 'crotchet-scrubber-row';
		const scrubber = mkInput('crotchet-scrubber', 'range', { min: 0, max: 1000, value: 0, step: 1 });
		const timeDisplay = document.createElement('span');
		timeDisplay.id = 'crotchet-time';
		timeDisplay.textContent = '0:00 / ' + formatTime(clipDuration);
		scrubberRow.appendChild(scrubber);
		scrubberRow.appendChild(timeDisplay);

		// Buttons row
		const buttonsRow = document.createElement('div');
		buttonsRow.id = 'crotchet-buttons';

		const leftGroup = document.createElement('div');
		leftGroup.id = 'crotchet-left';

		const restartBtn = mkBtn('crotchet-restart', 'M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z', 18, 'Restart');
		const skipBackBtn = mkBtn('crotchet-skip-back', 'M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z', 20, 'Skip back 5s');
		const playBtn = mkBtn('crotchet-play', 'M8 5v14l11-7z', 22, 'Play/Pause');
		const playIcon = playBtn.querySelector('path');
		const skipForwardBtn = mkBtn('crotchet-skip-forward', 'M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z', 20, 'Skip forward 5s');
		const ccBtn = mkBtn('crotchet-cc', 'M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z', 18, 'Toggle captions');
		ccBtn.querySelector('svg').setAttribute('fill', 'currentColor');
		const restoreBtn = mkBtn('crotchet-restore', 'M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z', 18, 'Restore');
		restoreBtn.querySelector('svg').setAttribute('fill', 'currentColor');

		[restartBtn, skipBackBtn, playBtn, skipForwardBtn, ccBtn, restoreBtn].forEach(e => leftGroup.appendChild(e));

		const rightGroup = document.createElement('div');
		rightGroup.id = 'crotchet-right';

		const cropBtn = mkBtn('crotchet-crop-toggle', 'M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z', 18, 'Toggle crop', 'active');
		cropBtn.querySelector('svg').setAttribute('fill', 'currentColor');
		const cropDisplay = document.createElement('span');
		cropDisplay.id = 'crotchet-crop';
		cropDisplay.textContent = formatTime(clipStart) + ' \u2013 ' + formatTime(clipEnd);

		[cropDisplay, cropBtn].forEach(e => rightGroup.appendChild(e));

		buttonsRow.appendChild(leftGroup);
		buttonsRow.appendChild(rightGroup);
		controls.appendChild(scrubberRow);
		controls.appendChild(buttonsRow);
		document.body.appendChild(controls);

		// --- Wire up controls ---
		const PLAY_D = 'M8 5v14l11-7z';
		const PAUSE_D = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';

		const updatePlayIcon = (video) => {
			playIcon.setAttribute('d', video.paused ? PLAY_D : PAUSE_D);
		};

		const initControls = (video) => {
			let cropEnabled = true;
			_cropEnabled = cropEnabled;

			video.addEventListener('timeupdate', () => {
				if (isScrubbing) return;
				const t = video.currentTime;

				if (clipEnd && cropEnabled) {
					if (t >= clipEnd || t < clipStart) {
						video.currentTime = clipStart;
						return;
					}
				}

				const rangeStart = cropEnabled ? clipStart : 0;
				const rangeEnd = cropEnabled ? clipEnd : (video.duration || clipEnd);
				const rangeDuration = rangeEnd - rangeStart;
				if (rangeDuration > 0) {
					const pct = (t - rangeStart) / rangeDuration;
					scrubber.value = Math.round(Math.max(0, Math.min(1, pct)) * 1000);
					timeDisplay.textContent = formatTime(t - rangeStart) + ' / ' + formatTime(rangeDuration);
				}

				updatePlayIcon(video);
			});

			video.addEventListener('play', () => updatePlayIcon(video));
			video.addEventListener('pause', () => updatePlayIcon(video));

			playBtn.addEventListener('click', () => {
				video.paused ? video.play() : video.pause();
			});

			scrubber.addEventListener('mousedown', () => { isScrubbing = true; });
			scrubber.addEventListener('input', () => {
				const rangeStart = cropEnabled ? clipStart : 0;
				const rangeEnd = cropEnabled ? clipEnd : (video.duration || clipEnd);
				const pct = scrubber.value / 1000;
				const t = rangeStart + pct * (rangeEnd - rangeStart);
				timeDisplay.textContent = formatTime(t - rangeStart) + ' / ' + formatTime(rangeEnd - rangeStart);
			});
			scrubber.addEventListener('change', () => {
				const rangeStart = cropEnabled ? clipStart : 0;
				const rangeEnd = cropEnabled ? clipEnd : (video.duration || clipEnd);
				const pct = scrubber.value / 1000;
				video.currentTime = rangeStart + pct * (rangeEnd - rangeStart);
				isScrubbing = false;
			});

			skipBackBtn.addEventListener('click', () => {
				video.currentTime = Math.max(cropEnabled ? clipStart : 0, video.currentTime - 5);
			});
			skipForwardBtn.addEventListener('click', () => {
				video.currentTime = Math.min(cropEnabled ? clipEnd : video.duration, video.currentTime + 5);
			});

			restartBtn.addEventListener('click', () => {
				video.currentTime = cropEnabled ? clipStart : 0;
				video.play();
			});

			cropBtn.addEventListener('click', () => {
				cropEnabled = !cropEnabled;
				_cropEnabled = cropEnabled;
				cropBtn.classList.toggle('active', cropEnabled);
				if (cropEnabled) {
					cropDisplay.textContent = formatTime(clipStart) + ' \u2013 ' + formatTime(clipEnd);
					video.currentTime = clipStart;
				} else {
					cropDisplay.textContent = '0:00 \u2013 ' + formatTime(Math.floor(video.duration));
					video.currentTime = 0;
				}
				video.play();
			});

			const getYtCcBtn = () => document.querySelector('.ytp-subtitles-button');
			const setCaptions = (enabled) => {
				const ytBtn = getYtCcBtn();
				if (!ytBtn) return;
				const isOn = ytBtn.getAttribute('aria-pressed') === 'true';
				if (isOn !== enabled) ytBtn.click();
				ccBtn.classList.toggle('active', enabled);
			};
			const ccInitInterval = setInterval(() => {
				const ytBtn = getYtCcBtn();
				if (!ytBtn) return;
				clearInterval(ccInitInterval);
				setCaptions(false);
			}, 300);
			let captionsEnabled = false;
			ccBtn.addEventListener('click', () => {
				captionsEnabled = !captionsEnabled;
				setCaptions(captionsEnabled);
			});

			document.addEventListener('mousemove', showControls);
			controls.addEventListener('mouseenter', () => {
				clearTimeout(_hideTimer);
				controls.classList.add('visible');
			});
			controls.addEventListener('mouseleave', showControls);

			document.addEventListener('keydown', (e) => {
				if (e.code === 'Space') { e.preventDefault(); video.paused ? video.play() : video.pause(); }
			});

			// Restore: close floating window and re-open in main app
			const videoId = params.get('v');
			restoreBtn.addEventListener('click', () => {
				window.dispatchEvent(new CustomEvent('socket-emit', {
					detail: { event: 'close-floating-window', payload: windowId }
				}));
				if (videoId) {
					window.dispatchEvent(new CustomEvent('socket-emit', {
						detail: { event: 'run-action', payload: { showWindow: true, action: 'playYoutubeClip', payload: videoId } }
					}));
				}
			});

			// Handle remote actions forwarded from the main app via preload DOM bridge
			const handleCrotchetAction = (action) => {
				if (action === 'restart') { video.currentTime = cropEnabled ? clipStart : 0; video.play(); }
				else if (action === 'skip-back') video.currentTime = Math.max(cropEnabled ? clipStart : 0, video.currentTime - 5);
				else if (action === 'skip-forward') video.currentTime = Math.min(cropEnabled ? clipEnd : video.duration, video.currentTime + 5);
				else if (action === 'toggle-crop') cropBtn.click();
				else if (action === 'restore') restoreBtn.click();
			};
			if (windowId) {
				window.addEventListener('floating-window-event-' + windowId, (e) => {
					const payload = e.detail;
					const action = payload?.action === 'remote-action' ? payload?.id
						: payload?.action === 'crotchet-action' ? payload?.data?.action
						: null;
					if (action) handleCrotchetAction(action);
				});
			}
		};

		const init = () => {
			const video = document.querySelector('video');
			if (!video) return false;
			_video = video;
			if (clipStart) video.currentTime = clipStart;
			initControls(video);
			return true;
		};

		const interval = setInterval(() => {
			if (init()) clearInterval(interval);
		}, 500);

	} else {
		// noControls mode: enforce crop and postMessage time updates to parent
		const init = () => {
			const video = document.querySelector('video');
			if (!video) return false;
			_video = video;
			if (clipStart) video.currentTime = clipStart;

			video.addEventListener('timeupdate', () => {
				const t = video.currentTime;
				if (clipEnd && _cropEnabled) {
					if (t >= clipEnd || t < clipStart) {
						video.currentTime = clipStart;
						return;
					}
				}
				window.parent.postMessage({
					crotchetEvent: 'timeupdate',
					currentTime: t,
					duration: video.duration,
					paused: video.paused,
					cropStart: clipStart,
					cropEnd: clipEnd,
				}, '*');
			});

			video.addEventListener('play',  () => window.parent.postMessage({ crotchetEvent: 'play'  }, '*'));
			video.addEventListener('pause', () => window.parent.postMessage({ crotchetEvent: 'pause' }, '*'));

			return true;
		};

		const interval = setInterval(() => {
			if (init()) clearInterval(interval);
		}, 500);
	}
})();
