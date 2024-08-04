import { Capacitor } from "@capacitor/core";
import { useEffect, useRef, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";

export default function useKeyboard() {
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	let keyboardPlugin = useRef();

	useEffect(() => {
		initialize();
		return () => cleanKeyboardListeners();
	});

	const cleanKeyboardListeners = async () => {
		// try {
		// 	if (typeof keyboardPlugin.current?.removeAllListeners == "function")
		// 		keyboardPlugin.current.removeAllListeners();
		// } catch (error) {
		// 	//
		// }
	};

	const initialize = async () => {
		// if (!Capacitor.isPluginAvailable("Keyboard")) return;

		// const Keyboard = (await import("@capacitor/keyboard")).Keyboard;

		// if (!Keyboard) return;

		// keyboardPlugin.current = Keyboard;

		try {
			Keyboard.setAccessoryBarVisible({
				isVisible: false,
			});

			Keyboard.setResizeMode({
				mode: "none",
			});

			Keyboard.addListener("keyboardDidShow", (info) => {
				setKeyboardHeight(Number(info.keyboardHeight));
			});

			Keyboard.addListener("keyboardDidHide", () => {
				setKeyboardHeight(0);
			});
		} catch (error) {
			//
		}
	};

	const KeyboardPlaceholder = () => (
		<div
			className="h-16"
			style={{
				height: `${keyboardHeight}px`,
				marginBottom: "env(safe-area-inset-bottom)",
			}}
		>
			&nbsp;
		</div>
	);

	return { keyboardHeight, KeyboardPlaceholder };
}
