import { Children, cloneElement, useRef, useState } from "react";
import CommandKey from "../CommandKey";
import useKeyDetector from "../../hooks/useKeyDetector";
import { useAppContext } from "../../providers/AppProvider";
import DynamicForm from "../DynamicForm";
import SettingsEditor from "./SettingsEditor";

const Button = ({
	type = "button",
	className = "",
	processing,
	children,
	onClick,
}) => {
	return (
		<button
			type={type}
			className={
				`inline-flex items-center px-2 h-8 dark:bg-content/5 hover:bg-content/5 dark:hover:bg-content/10 border border-content/10 rounded-md font-semibold text-xs transition-colors duration-150 focus:outline-none focus:bg-content/5 dark:focus:bg-content/[0.08] focus:border-content/20 ${
					processing && "opacity-25"
				} ` + className
			}
			disabled={processing}
			onClick={onClick ? onClick : null}
		>
			{children}
		</button>
	);
};

const getFallbackSecondaryActionHandler = ({
	pane,
	confirmAction,
	popPane,
}) => {
	const pageSecondaryAction =
		typeof pane.onSecondaryAction == "function"
			? pane.onSecondaryAction
			: null;
	const pageDestructiveSecondaryAction =
		typeof pane.onDestructiveSecondaryAction == "function"
			? pane.onDestructiveSecondaryAction
			: null;

	let handler = () => popPane(pane.secondaryAction);

	if (pageSecondaryAction || pageDestructiveSecondaryAction) {
		handler = async () => {
			let newData;

			if (pageSecondaryAction)
				newData = await pageSecondaryAction(pane.data);
			else {
				const res = await confirmAction({
					title: pane.secondaryAction + "?",
					actionType: "danger",
					okayText: pane.confirmText || "Yes, Continue",
				});

				if (!res) return;

				newData = await pageDestructiveSecondaryAction(pane.data);
			}

			popPane({
				fromSecondaryAction: true,
				data: newData,
			});
		};
	}

	return handler;
};

export default function ActionPane({ pane, onClose, children }) {
	const { confirmAction } = useAppContext();
	const [lastUpdate, setLastUpdate] = useState(Date.now());
	const secondaryActionShortCut = pane.secondaryActionShortCut || "Cmd + k";
	const secondaryActionButtonRef = useRef();
	const submitHandler = useRef();
	const secondaryActionHandler = useRef(
		getFallbackSecondaryActionHandler({
			pane,
			confirmAction,
			popPane: onClose,
		})
	);

	const onSubmit = (callback) => {
		submitHandler.current = callback;
		setTimeout(() => {
			setLastUpdate(Date.now());
		});
	};

	const handleSubmit = () => {
		if (typeof submitHandler.current == "function") submitHandler.current();
	};

	const onSecondaryAction = (callback) => {
		secondaryActionHandler.current = callback;
		setTimeout(() => {
			setLastUpdate(Date.now());
		});
	};

	const handleSecondaryAction = () => {
		if (typeof secondaryActionHandler.current == "function")
			secondaryActionHandler.current();
	};

	useKeyDetector({
		key: "Cmd + Enter",
		action: handleSubmit,
	});

	useKeyDetector({
		key: secondaryActionShortCut,
		action: () => {
			if (secondaryActionButtonRef.current)
				secondaryActionButtonRef.current.click();
		},
	});

	const actionPaneProps = {
		pane,
		onClose,
		onSubmit,
		onSecondaryAction,
	};

	return (
		<div data-last-update={lastUpdate}>
			<div className="h-12 pl-4 pr-2 flex items-center justify-between border-b border-content/10 z-10 relative">
				<span className="w-full text-base font-bold">
					{pane?.title || "Create Quicklink"}
				</span>

				<button
					type="button"
					className="rounded-full hover:bg-content/5 text-content/30 hover:text-content/50 p-1 focus:outline-none border border-transparent focus:border-content/20"
					onClick={() => onClose()}
				>
					<span className="sr-only">Close</span>
					<svg
						className="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2.7"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div className="-mt-0.5 relative overflow-y-auto max-h-[580px] focus:outline-none">
				{pane.type === "form" ? (
					<DynamicForm {...actionPaneProps} />
				) : pane.type === "settings" ? (
					<SettingsEditor {...actionPaneProps} />
				) : (
					Children.map(children, (child) =>
						cloneElement(child, actionPaneProps)
					)
				)}
			</div>

			{(pane?.secondaryAction ||
				typeof submitHandler.current == "function") && (
				<div className="bg-card sticky bottom-0 h-11 px-3 flex gap-1 items-center justify-between border-t z-10">
					<div
						className={
							typeof submitHandler.current != "function"
								? "ml-auto -mr-2"
								: "-ml-2"
						}
					>
						{pane?.secondaryAction && (
							<Button
								ref={secondaryActionButtonRef}
								className="gap-1"
								rounded="md"
								size="sm"
								variant="ghost"
								colorScheme={
									{ danger: "red", warning: "yellow" }[
										pane.secondaryActionType
									]
								}
								onClick={handleSecondaryAction}
							>
								<span className="mr-0.5 capitalize">
									{pane.secondaryAction}
								</span>
								{secondaryActionShortCut
									.split(" + ")
									.map((key) => (
										<CommandKey key={key} label={key} />
									))}
							</Button>
						)}
					</div>

					{typeof submitHandler.current == "function" && (
						<Button
							className="gap-1 -mr-2"
							onClick={handleSubmit}
							rounded="md"
							size="sm"
							variant="ghost"
						>
							<span className="mr-0.5 capitalize">
								{pane?.action || "Submit"}
							</span>

							<CommandKey label="Cmd" />

							<CommandKey label="Enter" />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
