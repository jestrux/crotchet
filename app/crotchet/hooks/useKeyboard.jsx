import { Capacitor } from "@capacitor/core";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
// import { Keyboard } from "@capacitor/keyboard";

export default function useKeyboard({ mode = "none" } = {}) {
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
		if (!Capacitor.isPluginAvailable("Keyboard")) return;

		const Keyboard = (await import("@capacitor/keyboard")).Keyboard;

		// if (!Keyboard) return;

		// keyboardPlugin.current = Keyboard;

		try {
			Keyboard.setAccessoryBarVisible({
				isVisible: false,
			});

			Keyboard.setResizeMode({
				mode,
			});

			Keyboard.addListener("keyboardWillShow", (info) => {
				setKeyboardHeight(Number(info.keyboardHeight));
			});
			// Keyboard.addListener("keyboardDidShow", (info) => {
			// 	setKeyboardHeight(Number(info.keyboardHeight));
			// });

			Keyboard.addListener("keyboardWillHide", () => {
				setKeyboardHeight(0);
			});

			// Keyboard.addListener("keyboardDidHide", () => {
			// 	setKeyboardHeight(0);
			// });

			Keyboard.setAccessoryBarVisible({
				isVisible: false,
			});
		} catch (error) {
			//
		}
	};

	const KeyboardPlaceholder = ({ noMargin = false }) => (
		<motion.div
			className="h-16"
			style={{
				// height: `${keyboardHeight}px`,
				marginBottom: noMargin ? 0 : "env(safe-area-inset-bottom)",
			}}
			initial={{
				height: keyboardHeight * 0.75,
			}}
			animate={{
				height: keyboardHeight,
			}}
			transition={{
				type: "keyframes",
				ease: "easeOut",
				duration: 0.2,
			}}
		>
			&nbsp;
		</motion.div>
	);

	return { keyboardHeight, KeyboardPlaceholder };
}
