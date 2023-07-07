import {
	Children,
	cloneElement,
	isValidElement,
	useEffect,
	useRef,
	useState,
} from "react";
import CommandKey from "../CommandKey";
import useKeyDetector from "../../hooks/useKeyDetector";
import { useAppContext } from "../../providers/AppProvider";
import DynamicForm from "../DynamicForm";
import SettingsEditor from "./SettingsEditor";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { randomId } from "../../utils";
import {
	Combobox,
	ComboboxInput,
	ComboboxPopover,
	useComboboxContext,
} from "../reach-combobox";

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

function ActionPaneContent({
	active,
	pane = {},
	showBackButton,
	hideCloseButton,
	onClose,
	children,
}) {
	const { confirmAction } = useAppContext();
	const [lastUpdate, setLastUpdates] = useState(Date.now());
	const setLastUpdate = () => {};
	const secondaryActionShortCut = pane.secondaryActionShortCut || "Cmd + k";
	const inputRef = useRef();
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

	useEffect(() => {
		inputRef.current.focus();
	}, [active]);

	const actionPaneProps = {
		pane,
		onClose,
		onSubmit,
		onSecondaryAction,
	};

	const paneContent = () => {
		if (pane.type === "form" || (!pane.type && actionPaneProps.fields))
			return <DynamicForm {...actionPaneProps} />;

		if (pane.type === "settings")
			return <SettingsEditor {...actionPaneProps} />;

		return Children.map(children, (child) => {
			return isValidElement(child) && child.type !== "div"
				? cloneElement(child, actionPaneProps)
				: child;
		});
	};

	const handleSelect = (value) => {
		const selected = inputRef.current
			.closest(".combobox-wrapper")
			.querySelector(
				`[data-reach-combobox-option][data-value="${value}"]`
			);

		if (selected) selected.dispatchEvent(new CustomEvent("on-select"));
	};

	return (
		<div data-last-update={lastUpdate} className="relative">
			<Combobox
				className="combobox-wrapper w-full"
				openOnFocus
				onSelect={handleSelect}
			>
				<ComboboxInput
					ref={inputRef}
					className="absolute opacity-0 pointer-events-none bg-transparent h-full w-full py-3 text-xl focus:outline-none placeholder-content/30"
				/>

				{pane?.title ? (
					<div className="h-12 pl-4 pr-2 flex items-center border-b border-content/10 z-10 relative">
						{(showBackButton || pane.showBackButton) && (
							<button
								type="button"
								className="flex-shrink-0 -ml-1.5 mr-2.5 bg-content/5 hover:bg-content/10 rounded flex items-center justify-center w-7 h-7 focus:outline-none border border-transparent focus:border-content/10"
								onClick={() => onClose()}
							>
								<ArrowLeftIcon width={13} strokeWidth={3} />
							</button>
						)}

						<span className="w-full text-base font-bold">
							{pane?.title}
						</span>

						{!showBackButton &&
							!pane.showBackButton &&
							!hideCloseButton &&
							!pane.dialogProps?.hideCloseButton && (
								<button
									type="button"
									className="ml-auto rounded-full hover:bg-content/5 text-content/30 hover:text-content/50 p-1 focus:outline-none border border-transparent focus:border-content/20"
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
							)}
					</div>
				) : (
					<>
						{!hideCloseButton &&
							!pane.dialogProps?.hideCloseButton && (
								<div className="h-2"></div>
							)}
					</>
				)}

				<ComboboxPopover
					id="popoverContent"
					portal={false}
					className="px-4 py-4 relative overflow-y-auto max-h-[580px] focus:outline-none"
				>
					{paneContent()}
				</ComboboxPopover>

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
			</Combobox>
		</div>
	);
}

export default function ActionPane({
	pane = {},
	showBackButton,
	hideCloseButton,
	onClose,
	children,
}) {
	const actionPanesWrapper = useRef();
	const [panes, setPanes] = useState([
		{
			id: randomId(),
			pane,
			showBackButton,
			hideCloseButton,
			onClose,
			children,
		},
	]);

	const closePane = (pane, data) => {
		setPanes((panes) => {
			if (!pane) pane = panes.at(-1);

			if (typeof pane.callback == "function") pane.callback(data);

			if (panes.length === 1) {
				setTimeout(() => onClose(data));
				return panes;
			}

			return panes.filter((p) => p.id !== pane.id);
		});
	};

	const pushPane = ({ detail: { replace, callback, ...pane } }) => {
		pane.type = pane.type ?? "form";

		setPanes([
			...(!replace ? panes : panes.slice(0, panes.length - 1)),
			{
				id: randomId(),
				callback,
				showBackButton: !replace,
				pane,
			},
		]);
	};

	useEffect(() => {
		document.addEventListener("push-pane", pushPane, false);

		return () => document.removeEventListener("push-pane", pushPane, false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useKeyDetector({
		key: "Escape",
		action: () => {
			if (actionPanesWrapper.current) {
				if (!actionPanesWrapper.current.matches(":focus-within"))
					return;
			}

			closePane();
		},
	});

	return (
		<div ref={actionPanesWrapper}>
			{panes.map((p, index) => {
				const active = p.id === panes.at(-1)?.id;

				return (
					<div key={index} className={!active ? "hidden" : ""}>
						<ActionPaneContent
							{...p}
							active={active}
							onClose={
								!active ? null : (data) => closePane(p, data)
							}
						/>
					</div>
				);
			})}
		</div>
	);
}
