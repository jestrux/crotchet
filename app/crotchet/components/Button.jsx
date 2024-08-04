import { forwardRef } from "react";
import clsx from "clsx";
import Loader from "./Loader";

export default forwardRef(function Button(
	{
		children,
		type = "button",
		disabled = false,
		loading = false,
		variant = "regular",
		color,
		size = "",
		rounded = "full",
		className = "",
		onClick = () => {},
		...props
	},
	ref
) {
	const outlined = variant == "outline";
	color = color || (outlined ? "content" : "primary");

	const getColor = () => {
		const colorMap = {
			danger: [
				"bg-red-700 border-red-700 text-white hover:opacity-90",
				"bg-transparent text-red-700 border-current hover:bg-red-700/5",
			],
			success: [
				"bg-green-500 border-green-500 text-white hover:opacity-90",
				"bg-transparent text-green-500 hover:bg-green-500/5",
			],
			primary: [
				"bg-primary border-primary text-white hover:opacity-90",
				"bg-transparent text-primary border-current hover:bg-primary/5",
			],
			secondary: [
				"bg-gray-500 border-gray-500 text-white hover:opacity-90",
				"bg-transparent text-gray-500 border-current hover:bg-gray-500/5",
			],
			content: [
				"bg-content border-content text-white hover:opacity-90",
				"bg-transparent text-content border-content/30 hover:bg-content/5",
			],
		};

		const [regularColor, outlineColor] =
			colorMap[color] ?? colorMap.primary;

		return outlined ? outlineColor : regularColor;
	};

	return (
		<button
			ref={ref}
			type={type}
			className={clsx(
				"Button font-semibold border flex items-center justify-center px-3.5 leading-none relative",
				(disabled || loading) && "pointer-events-none",
				disabled && "opacity-25",
				getColor(),
				size == "xs"
					? "text-[0.6rem] h-6 px-[0.6rem]"
					: size == "sm"
					? "text-xs h-8 px-[0.8rem]"
					: "h-12 px-6",
				rounded == "full" ? "rounded-full" : "rounded",
				className
			)}
			onClick={onClick}
			{...props}
		>
			{children}

			{loading && <Loader size={26} thickness={8} color="#888" />}
		</button>
	);
});
