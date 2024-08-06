import { useDebounce } from "@/crotchet/hooks";
import { forwardRef, useEffect, useRef, useState } from "react";

const Input = forwardRef(function Input(
	{ value, onEnter, onEscape, onChange, onFocus, onBlur, debounce, ...props },
	ref
) {
	const focusRef = useRef();
	const [_value, _setValue] = useState(value);
	const debouncedValue = useDebounce(_value, debounce ?? 500);
	const setValue = (newValue) => {
		_setValue(newValue);
		if (!debounce) onChange(newValue);
	};

	useEffect(() => {
		if (value == _value) return;

		_setValue(value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	useEffect(() => {
		if (debounce && debouncedValue != value) onChange(debouncedValue);
	}, [debouncedValue, debounce, value, onChange]);

	const handleKeyDown = (e) => {
		if (e.key == "Enter" && typeof onEnter == "function") onEnter(e);
		if (e.key == "Escape" && typeof onEscape == "function") onEscape(e);
	};

	const handleChange = (e) => {
		const value = e.target.value;
		// showToast("On change:" + JSON.stringify(value), {
		// 	position: "center",
		// });
		setValue(value);
	};

	return (
		<input
			ref={ref}
			{...props}
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
