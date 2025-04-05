import { useRef } from "react";
import clsx from "clsx";

import { dispatch, isValidAction } from "@/crotchet/utils";
import { Loader } from "@/crotchet/components";
import { usePageContext } from "@/crotchet/providers/PageProvider";
import { onActionClick } from "@/crotchet/hooks/useActionClick";

import CommandKey from "./CommandKey";
import PageMenu from "./PageMenu";
import PageButton from "./PageButton";
import ThemeBg from "@/DesktopApp/ThemeBg";

export default function PageActionBar() {
	const {
		fullScreen,
		pageData,
		pageResolving,
		pageStatus,
		onOpenActionMenu,
		onSecondaryActionClick,
		onMainActionClick,
		mainAction: _mainAction,
		secondaryAction: _secondaryAction,
		actions,
		contextInfo,
	} = usePageContext();
	const actionsButtonRef = useRef();

	const secondaryAction = _secondaryAction();
	const mainAction = _mainAction();

	const handleSecondaryAction = (payload) =>
		onActionClick(secondaryAction)(payload);

	const handleMainAction = (payload) => onActionClick(mainAction)(payload);

	onOpenActionMenu(() => {
		if (actionsButtonRef.current) actionsButtonRef.current.click();
	});

	onSecondaryActionClick(() => {
		handleSecondaryAction(contextInfo);
	});

	onMainActionClick(() => {
		handleMainAction(contextInfo);
	});

	const mainActionSet = () => {
		return isValidAction(mainAction);
	};

	const renderSecondaryContent = () => {
		const status = pageStatus?.status;
		if (status && status != "idle") {
			const isError = status == "error";
			const isLoading = status == "loading";
			const isIdle = status == "idle";

			return (
				<div className="-ml-3 pl-3 w-full h-full flex items-center relative overflow-hidden">
					<>
						{isLoading ? (
							<Loader size={20} thickness={7} />
						) : !isIdle ? (
							<div
								className={clsx(
									"absolute inset-0 max-w-[400px] bg-gradient-to-r to-transparent opacity-70",
									isError
										? "from-red-500/5 via-red-500/20"
										: "from-green-500/5 via-green-500/20"
								)}
							></div>
						) : null}

						{!isIdle && !isLoading && (
							<div className="w-5 relative flex center-center">
								<div
									className={clsx(
										"animate-pulse absolute size-5 rounded-full",
										isError
											? "bg-red-500/20"
											: "bg-green-500/20"
									)}
								></div>
								<div
									className={clsx(
										"absolute size-3 rounded-full",
										isError
											? "bg-red-500/25"
											: "bg-green-500/25"
									)}
								></div>
								<div
									className={clsx(
										"absolute size-1.5 rounded-full ",
										isError
											? "bg-red-500/70"
											: "bg-green-500/70"
									)}
								></div>
							</div>
						)}
					</>

					{(pageStatus?.message || isLoading) && (
						<span className="ml-2.5 text-sm opacity-70">
							{pageStatus?.message
								? pageStatus.message
								: "Loading, please wait..."}
						</span>
					)}
				</div>
			);
		}

		if (secondaryAction) {
			return (
				<PageButton
					className="gap-1"
					rounded="md"
					size="sm"
					variant="ghost"
					colorScheme={secondaryAction.destructive && "red"}
					onClick={() => handleSecondaryAction(contextInfo)}
				>
					<span className="mr-0.5 capitalize text-sm">
						{secondaryAction.label}
					</span>
					<CommandKey label="Cmd" />
					<CommandKey label="T" />
				</PageButton>
			);
		}

		return (
			<div className="flex items-center gap-2">
				<div
					className="size-5 flex center-center rounded"
					style={{
						background: "linear-gradient(45deg, #d3ffff, #f2ddb0)",
						color: "#3E3215",
						borderColor: "transparent",
					}}
				>
					<svg
						className="size-3"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.8}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
						/>
					</svg>
				</div>
				<span className="text-sm opacity-70">Crotchet</span>
			</div>
		);
	};

	const ActionBarWrapper = ({ children }) => {
		if (fullScreen) {
			return (
				<div className="fixed -bottom-9 inset-x-0 h-11 px-3 flex gap-4 items-center z-[999]">
					{children}
				</div>
			);
		}

		return (
			<ThemeBg
				overlay
				className="rounded-b-xl bg-card fixed bottom-0 inset-x-0 h-11 px-3 flex gap-4 items-center border-t z-[999]"
			>
				{children}
			</ThemeBg>
		);
	};

	return (
		<ActionBarWrapper>
			{!pageResolving && (
				<>
					<div
						className={clsx(
							"h-full flex-1 flex items-center gap-4",
							{
								"opacity-0": fullScreen,
							}
						)}
					>
						{renderSecondaryContent()}
					</div>

					{mainActionSet() && (
						<PageButton
							className={clsx("gap-1", {
								"opacity-0": fullScreen,
							})}
							onClick={() => handleMainAction(contextInfo)}
							rounded="md"
							size="sm"
							variant="ghost"
						>
							<span className="mr-0.5 capitalize text-sm">
								{mainAction?.label || "Submit"}
							</span>
							<CommandKey label={mainAction.shortcut} />
						</PageButton>
					)}

					{mainActionSet() && actions?.length > 0 && !fullScreen && (
						<div className="h-full border-l-2 border-content/15 max-h-5"></div>
					)}

					{actions?.length > 0 && (
						<PageMenu
							width="250px"
							plain
							choices={actions}
							onChange={(value) => {
								if (!value) return;

								const action = actions.find((action) =>
									[
										action,
										action?.label,
										action?.value,
									].includes(value)
								);

								if (action) {
									dispatch("action-selected", value);

									onActionClick(action)({ pageData });
								}
							}}
							trigger={
								<PageButton
									as="div"
									ref={actionsButtonRef}
									className="gap-1 w-auto"
									rounded="md"
									size="sm"
									variant="ghost"
								>
									<span
										className={clsx(
											"mr-0.5 capitalize text-sm",
											{
												"opacity-0": fullScreen,
											}
										)}
									>
										Actions
									</span>
									{!fullScreen && (
										<>
											<CommandKey label="Cmd" />
											<CommandKey label="K" />
										</>
									)}
								</PageButton>
							}
						/>
					)}
				</>
			)}
		</ActionBarWrapper>
	);
}
