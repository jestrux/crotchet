import { io } from "socket.io-client";
import { dispatch, kv, onDesktop } from "../utils";

const getSocket = () => {
	return new Promise((resolve, reject) => {
		try {
			// if (window.socket?.connected) return window.socket;
			// getDoc(doc(db, "__crotchet", "desktop")).then((res) => {
			// 	const url = res.data().socket;
			kv("__desktopBaseUrl").then((url) => {
				const _socket = io(url);
				const ackTimeout = setTimeout(() => {
					_socket.close();
					reject("Socket connection timed out");
				}, 2000);

				_socket.on("connect", () => {
					window.desktopUrl = url;
					clearTimeout(ackTimeout);
					resolve(_socket);
				});
			});
		} catch (error) {
			console.log("Socket connect error: ", error);
			reject(error);
		}
	});
};

(async () => {
	if (onDesktop()) {
		// const _socketUrl = localStorage.__dataSocketUrl;
		// const { isFloatingWindow } = await onDesktopInitialize();
		// if (!isFloatingWindow) {
		// 	setDoc(
		// 		doc(db, "__crotchet", "desktop"),
		// 		{ socket: _socketUrl },
		// 		{ merge: true }
		// 	);
		// }
		window.socketEmit = (event, payload) =>
			window.dispatch("socket-emit", {
				event,
				payload,
			});

		return;
	}

	window.getSocket = getSocket;

	if (!window.socket?.connected) {
		getSocket()
			.then((_socket) => {
				window.socket = _socket;

				dispatch("socket-connected");

				_socket.on("disconnect", function () {
					dispatch("socket-disconnected");
				});

				window.socketEmit = (event, payload) => {
					console.log("Socket emit: ", event, payload);
					// window.showActionSheetAlert(
					// 	"Socket emit at: " + window.window.desktopUrl
					// );
					_socket.emit(event, payload);
				};

				window.remoteSocketAction = (action, payload) => {
					const _id = window.randomId("remoteAction");
					console.log("Remote socket action: ", _id, action, payload);

					const ref = `remote-action-response-${_id}`;
					return new Promise((res) => {
						const handler = async (data) => {
							_socket.off(ref);
							res(data);
						};

						_socket.on(ref, handler);

						_socket.emit("remote-action", { _id, action, payload });
					});
				};

				_socket.on("disconnect", () => {
					window.socketEmit = null;
					window.remoteSocketAction = null;
				});
			})
			.catch((e) => {
				console.log(e);
			});
	}
})();
