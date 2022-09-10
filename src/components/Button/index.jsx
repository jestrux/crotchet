import Loader from "../Loader";

export default function Button({
	children,
	type = "button",
	disabled = false,
	loading = false,
	outline = false,
	block = false,
	color = "",
	size = "",
	rounded,
	className = "",
	onClick = () => {},
	...props
}) {
	return (
		<button
			type={type}
			className={`Button border text-sm flex items-center justify-center px-3.5 leading-none relative
                ${(disabled || loading) && "pointer-events-none"} ${
				disabled && "opacity-25"
			} 
                ${block ? "w-full py-3" : "py-2.5"}
                ${
					outline
						? "bg-transparent border-current hover:bg-gray-500/5"
						: "hover:opacity-90"
				}
                ${
					color !== "danger"
						? ""
						: outline
						? "text-red-500 hover:bg-red-500/5"
						: "bg-red-500 text-white"
				}
                ${
					color !== "success"
						? ""
						: outline
						? "text-green-500 hover:bg-green-500/5"
						: "bg-green-500 text-white"
				}
                ${
					color !== "secondary"
						? ""
						: outline
						? "text-gray-500 hover:bg-gray-500/5"
						: "bg-gray-500 text-white"
				}
                ${
					color !== "primary"
						? ""
						: outline
						? "text-primary hover:bg-primary/5"
						: "bg-primary text-white"
				}
                ${
					color !== "black"
						? ""
						: outline
						? "text-black hover:bg-black/5"
						: "bg-black text-white"
				}
                ${
					size == "sm" &&
					"text-xs pt-[0.55rem] pb-[0.48rem] px-[0.8rem]"
				}
                ${size == "xs" && "text-[0.6rem] py-[0.35rem] px-[0.6rem]"}
                ${rounded == "full" ? "rounded-full" : "rounded"}
                ${className}
            `}
			onClick={onClick}
			{...props}
		>
			{children}

			{loading && <Loader size={26} thickness={8} color="#888" />}
		</button>
	);
}
