import { useRef } from "react";
import clsx from "clsx";
import useStickyObserver from "../useStickyObserver";

import { usePageContext } from "@/crotchet/providers/PageProvider";

export default function PageHeader() {
	const { page, onClose } = usePageContext();
	const navRef = useRef(null);
	const stuck = useStickyObserver(navRef.current);

	return (
		<div
			ref={navRef}
			className={clsx("sticky top-0 z-50 w-full flex flex-col bg-card", {
				"bg-stone-100/95 sdark:bg-card/95 dark:text-white backdrop-blur":
					stuck,
			})}
		>
			<div
				className="relative w-full flex flex-col"
				style={{
					marginTop: "env(safe-area-inset-top)",
				}}
			>
				<div className="h-16 px-6 w-full flex items-center gap-1">
					{typeof onClose == "function" && page?.id != "root" && (
						<button
							type="button"
							className="flex-shrink-0 -ml-1.5 mr-2.5 bg-content/10 rounded flex items-center justify-center w-7 h-7"
							onClick={onClose}
						>
							<svg
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-3.5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
								/>
							</svg>
						</button>
					)}

					<div className="text-3xl/none font-bold">
						{page?.title}
					</div>
				</div>
			</div>
		</div>
	);
}
