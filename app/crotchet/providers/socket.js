import { doc, getDoc, setDoc } from "firebase/firestore";
import { io } from "socket.io-client";
import { db } from "./firebase";
import { dispatch, onDesktop } from "../utils";

const getSocket = () => {
	return new Promise((resolve, reject) => {
		try {
			getDoc(doc(db, "__crotchet", "desktop")).then((res) => {
				const url = res.data().socket;
				const _socket = io(url);
				const ackTimeout = setTimeout(() => {
					_socket.close();
					reject("Socket connection timed out");
				}, 2000);

				_socket.on("connect", () => {
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
	const _onDesktop = onDesktop();
	const _socketUrl = localStorage.__dataSocketUrl;
	// document.body.getAttribute("data-socket-url")

	if (_onDesktop) {
		const event = "initialize-app";
		const isFloatingWindow = await new Promise((resolve) => {
			const handler = async (e) => {
				window.removeEventListener(event, handler);
				resolve(e.detail.pageId != "root");
			};

			window.addEventListener(event, handler);
		});

		if (!isFloatingWindow) {
			setDoc(
				doc(db, "__crotchet", "desktop"),
				{ socket: _socketUrl },
				{ merge: true }
			);

			window.socketEmit = (event, payload) =>
				window.dispatch("socket-emit", {
					event,
					payload,
				});

			return;
		}
	}

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
					_socket.emit(event, payload);
				};
			})
			.catch((e) => {
				console.log(e);
			});
	}
})();
