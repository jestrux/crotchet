import { forwardRef, useEffect, useRef, useState } from "react";

const Input = forwardRef(function Input(
	{ value, onEnter, onEscape, onChange, onFocus, onBlur, debounce, ...props },
	ref
) {
	const focusRef = useRef();
	const [_value, _setValue] = useState(value);
	const timeoutRef = useRef(null);

	// Update internal state when external value changes
	useEffect(() => _setValue(value), [value]);

	const handleKeyDown = (e) => {
		if (e.key == "Enter" && typeof onEnter == "function") onEnter(e);
		if (e.key == "Escape" && typeof onEscape == "function") onEscape(e);
	};

	// Handle input changes
	const handleChange = (e) => {
		const newValue = e.target.value;
		_setValue(newValue);

		// Clear existing timeout
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		// If debounce is enabled, delay the onChange call
		if (debounce > 0) {
			timeoutRef.current = setTimeout(
				() => onChange?.(newValue),
				debounce
			);
			return;
		}

		// Call onChange immediately if no debounce
		onChange?.(newValue, e);
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<input
			{...props}
			ref={ref}
			value={_value}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={(e) => {
				if (focusRef.current) clearTimeout(focusRef.current);

				e.target.setAttribute("is-focused", true);

				if (typeof onFocus == "function") onFocus(e);
			}}
			onBlur={(e) => {
				focusRef.current = setTimeout(() => {
					e.target.removeAttribute("is-focused");
				}, 100);

				if (typeof onBlur == "function") onBlur(e);
			}}
		/>
	);
});

export default Input;
