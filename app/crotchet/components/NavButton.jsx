import clsx from "clsx";
import { useActionClick } from "../hooks/useActionClick";

export default function NavButton({
	vertical,
	action,
	className,
	inShareSheet = false,
}) {
	const { onClick } = useActionClick(action, {
		propagate: true,
	});

	return (
		<button
			onClick={onClick}
			className={clsx(
				"relative w-full text-left outline:focus-none flex items-center gap-2 text-base leading-none disabled:opacity-50",
				vertical
					? "flex-col gap-3"
					: inShareSheet
					? "h-14 flex-row-reverse"
					: "h-12",
				className
			)}
		>
			{
				<div
					className={clsx(
						"flex-shrink-0 opacity-80",
						vertical
							? "w-6"
							: inShareSheet
							? "w-6 p-0.5"
							: "w-5 p-0.5"
					)}
				>
					{action.icon ? (
						action.icon
					) : inShareSheet ? null : (
						<svg
							className={clsx(vertical ? "size-6" : "size-4")}
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
							/>
						</svg>
					)}
				</div>
			}

			<div
				className={clsx(
					"flex-1",
					inShareSheet && vertical ? "text-sm " : ""
				)}
			>
				{action.label || action.name}
			</div>
		</button>
	);
}
