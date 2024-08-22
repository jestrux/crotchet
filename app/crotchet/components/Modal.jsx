import { useRef } from "react";
import { Dialog } from "@reach/dialog";

function Button({
	type = "button",
	className = "",
	processing,
	children,
	onClick,
}) {
	return (
		<button
			type={type}
			className={
				`inline-flex items-center px-4 py-2 bg-gray-900 border border-transparent rounded-md font-semibold text-xs text-white active:bg-gray-900 transition ease-in-out duration-150 hover:opacity-70 ${
					processing && "opacity-25"
				} ` + className
			}
			disabled={processing}
			onClick={onClick ? onClick : null}
		>
			{children}
		</button>
	);
}

export const MessageModal = ({
	isOpen,
	size,
	title = "Modal Title",
	message,
	action = "Okay",
	actionStyle = "outline", //"primary"
	error = false,
	success = false,
	actions,
	children,
	hideCloseButton = false,
	onOkay,
	onClose,
}) => {
	const handleClose = () => {
		if (onOkay) {
			onOkay();
			return;
		}

		if (onClose) onClose();
	};

	return (
		<Modal
			dismissible
			isOpen={isOpen}
			onClose={handleClose}
			noPadding
			size={size}
			centered={true}
			noHeading
		>
			<div
				className={`pier-message-modal flex-grow-1 relative border-t-4 pb-2 ${
					error
						? "border-red-500"
						: success
						? "border-green-400"
						: "border-transparent"
				}
                `}
			>
				{onClose && !hideCloseButton && (
					<button
						type="button"
						className="absolute right-2.5 top-1 bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						onClick={handleClose}
					>
						<span className="sr-only">Close</span>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				)}

				<div className="mt-4">
					<div className="text-center md:mt-5">
						<h3
							className="text-lg leading-6 font-bold px-4"
							id="modal-title"
						>
							{title}
						</h3>
						<div className="md:mt-2">
							{(children || message?.length) && (
								<p className="text-base opacity-70 max-w-md mx-auto px-6">
									{children ? children : message}
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="md:mt-4 mt-6 mb-4 px-6 flex justify-center items-center space-x-3">
					{actions ? (
						actions
					) : (
						<Button
							{...(actionStyle == "outline"
								? { outline: true }
								: { color: "primary" })}
							style={{
								minWidth: size == "md" ? "100px" : "130px",
							}}
							onClick={handleClose}
						>
							{action}
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
};

const Modal = ({
	children,
	className = "",
	title,
	size = "xl",
	dismissible = false,
	showOverlayBg = true,
	centered = false,
	onClose,
	noHeading,
}) => {
	const cancelRef = useRef();

	return (
		<Dialog
			onDismiss={dismissible ? onClose : () => {}}
			isOpen={true}
			leastDestructiveRef={cancelRef}
			className={`fixed overflow-hidden inset-0 z-50 flex justify-center py-16 px-3
				${centered ? "items-center" : "items-start"}
                ${showOverlayBg && "bg-black/20 dark:bg-black/70"}
            `}
		>
			{/* <div ref={cancelRef} className="fixed inset-0" onClick={onClose}>
				<AlertDialogLabel className="hidden">
					{title || "Some title"}
				</AlertDialogLabel>
			</div> */}

			<div
				className={`max-h-full group bg-card text-content border shadow-2xl rounded-lg overflow-hidden overflow-y-auto w-full relative
                    ${className}
                    ${size == "xs" && "max-w-xs"}
                    ${size == "sm" && "max-w-sm"}
                    ${size == "md" && "max-w-md"}
                    ${size == "lg" && "max-w-lg"}
                    ${size == "xl" && "max-w-xl"}
                `}
				style={{
					boxShadow: showOverlayBg
						? ""
						: "0px 10px 30px -2px var(--shadow-color)",
				}}
			>
				{!noHeading && (onClose || title?.length) && (
					<div className="sticky bg-card z-10 top-0 h-12 pl-4 pr-2 border-b flex items-center justify-between">
						<div>
							<h3
								className="text-base leading-6 font-bold"
								id="modal-title"
							>
								{title}
							</h3>
						</div>

						{onClose && (
							<button
								type="button"
								className="bg-content/[0.08] size-7 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								onClick={onClose}
							>
								<span className="sr-only">Close</span>
								<svg
									className="size-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						)}
					</div>
				)}

				{children}
			</div>
		</Dialog>
	);
};

export default Modal;
