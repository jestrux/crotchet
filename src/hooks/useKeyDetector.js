import { useEffect } from "react";

const useKeyDetector = ({ key, delayBy = 0, action }) => {
    useEffect(() => {
        let delayTimeout, clearListeners;

        const setupListeners = () => {
            document.addEventListener("keyup", onKeyUp, false);
            document.addEventListener("keydown", onKeyDown, false);

            return () => {
                document.removeEventListener("keydown", onKeyDown, false);
                document.removeEventListener("keyup", onKeyUp, false);
            };
        };

        if (delayBy) {
            delayTimeout = setTimeout(() => {
                clearListeners = setupListeners();
            }, delayBy);
        } else clearListeners = setupListeners();

        return () => {
            clearTimeout(delayTimeout);
            if (clearListeners) clearListeners();
        };
    }, []);

    function onKeyUp(e) {
        if (key == e.key) action(e);
    }

    function onKeyDown(e) {
        const validKey = key
            .replace("Shift", "")
            .replace("Ctrl", "")
            .replace("Cmd", "")
            .replace("+", "")
            .trim();

        if (["Meta", "Shift", "Control"].includes(e.key)) return;

        if (
            (key.includes("Shift") && e.shiftKey) ||
            (key.includes("Cmd") && (e.metaKey || e.ctrlKey)) ||
            (key.includes("Ctrl") && e.ctrlKey)
        ) {
            if (validKey != e.key && validKey != e.code) return;

            action(true);
        }
    }

    return null;
};

export default useKeyDetector;
