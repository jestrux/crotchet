import { doc, getDoc, setDoc } from "firebase/firestore";
import { io } from "socket.io-client";
import { db } from "./firebase";
import { onDesktop } from "../utils";

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

(() => {
	if (onDesktop()) {
		setDoc(
			doc(db, "__crotchet", "desktop"),
			{ socket: document.body.getAttribute("data-socket-url") },
			{ merge: true }
		);

		window.socketEmit = (event, payload) =>
			window.dispatch("socket-emit", {
				event,
				payload,
			});

		return;
	}

	if (!window.socket?.connected) {
		getSocket()
			.then((_socket) => {
				window.socket = _socket;
				console.log("Socket connected");

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
