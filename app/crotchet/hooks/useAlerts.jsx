import { useState, Children, cloneElement, useRef } from "react";
import {
	dispatch,
	randomId,
	isReactComponent,
	camelCaseToSentenceCase,
} from "@/crotchet/utils";
import {
	Modal,
	MessageModal,
	Button,
	ErrorBoundary,
	ActionSheet,
	Form,
} from "@/crotchet/components";
import { useOnInit } from "@/crotchet/hooks";
import { useIonToast } from "@ionic/react";
import PageProvider from "@/crotchet/providers/AppScaffold/PageProvider";
import IonicModal from "../components/IonicModal";
import clsx from "clsx";
import ModalPage from "../components/ModalPage";

const ToastMessage = ({ message, onClose, duration = 3000 }) => {
	const toastTimerRef = useRef();

	useOnInit(() => {
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

		toastTimerRef.current = setTimeout(() => {
			onClose(null);
		}, duration);
	}, []);

	return (
		<div
			className="fixed inline-flex items-center top-14 py-2 px-3.5 z-[999999] bg-content/95 text-on-content text-sm drop-shadow-sm rounded-full -translate-x-1/2 left-1/2"
			style={{
				marginTop: "env(safe-area-inset-top)",
			}}
		>
			{message}
		</div>
	);
};

export function AlertsWrapper() {
	const { alerts, ...alertThings } = useAlerts();

	Object.assign(window, alertThings);

	function renderActions(alert) {
		if (!alert.actions?.length) return;

		return (
			<div className="w-full flex gap-2">
				<Button
					variant="outline"
					className="flex-1"
					size="sm"
					onClick={() => alert.close(alert.actions[0])}
				>
					{alert.actions[0]}
				</Button>

				<Button
					className="flex-1"
					size="sm"
					color={alert.dangerous ? "danger" : null}
					onClick={() => alert.close(alert.actions[1])}
				>
					{alert.actions[1]}
				</Button>
			</div>
		);
	}

	return (
		<ErrorBoundary className="py-32 z-50">
			{alerts.map((alert) => {
				const props = {
					showOverlayBg: alert.showOverlayBg,
					hideCloseButton: alert.hideCloseButton,
					isOpen: alert.open,
					size: alert.size,
					invisible: alert.hidden,
					onClose: () => alert.close(),
				};

				if (alert.type == "toast") {
					return (
						<ToastMessage
							key={alert.id}
							message={alert.message}
							onClose={(data) => alert.close(data)}
						/>
					);
				}

				if (alert.type == "sheet") {
					if (alert.fullScreen) {
						return (
							<ModalPage
								key={alert.id}
								{...alert}
								type={alert.pageType}
								onClose={alert.close}
							/>
						);
					}

					return (
						<ActionSheet
							key={alert.id}
							{...alert}
							onClose={(data) => alert.close(data)}
						>
							{Children.map(alert.content, (child) => {
								return !isReactComponent(child)
									? child
									: cloneElement(child, {
											dismiss: alert.close,
											onClose: alert.close,
									  });
							})}
						</ActionSheet>
					);
				}

				if (alert.type == "choice-picker") {
					if (alert.fullScreen) {
						return (
							<ModalPage
								key={alert.id}
								{...alert}
								type={alert.pageType}
								resolve={alert.resolve || alert.choices}
								searchable={alert.searchable ?? true}
								selectable={
									alert.selectable
										? alert.selectable
										: alert.multiple
										? "multiple"
										: false
								}
								onClose={alert.close}
								onChange={alert.onChange}
							/>
						);
					}

					return (
						<ActionSheet
							key={alert.id}
							{...alert}
							inset={alert.inset ?? true}
							noHeading={alert.noHeading ?? !alert?.title?.length}
							onClose={alert.close}
							selectable={
								alert.selectable
									? alert.selectable
									: alert.multiple
									? "multiple"
									: false
							}
							actions={alert.choices}
						/>
					);
				}

				if (alert.type == "form") {
					alert.onSubmit = async (values) => {
						values = _.keys(values).includes("formField")
							? values.formField
							: values;

						if (alert.action?.handler) {
							try {
								const res = await alert.action?.handler(values);
								if (res == null) return null;

								alert.close(res);
							} catch (error) {
								window.showAlert(error);
								return;
							}
						}

						alert.close(values);
					};

					const form = (
						<div
							className={clsx(
								alert.field && !(alert.noHeading ?? true)
									? "-mx-2 -mt-2 pb-1"
									: "py-2 px-1",
								{ "pb-12": !alert.field }
							)}
						>
							<Form
								formId={
									alert.action?.handler
										? null
										: randomId("form")
								}
								data={alert.data}
								fields={alert.fields}
								field={alert.field}
								action={alert.action}
								onChange={alert.onChange}
								onSubmit={alert.onSubmit}
							/>
						</div>
					);

					if (alert.fullScreen) {
						return (
							<ModalPage
								key={alert.id}
								{...alert}
								type={alert.pageType}
								onClose={alert.close}
							>
								{form}
							</ModalPage>
						);
					}

					return (
						<ActionSheet
							ignoreSafeArea={alert.field}
							key={alert.id}
							dismissible={alert.dismissible ?? false}
							inset={alert.inset ?? alert.field ? true : false}
							noHeading={
								alert.noHeading ?? alert.field ? true : false
							}
							title={alert.title}
							onClose={alert.close}
						>
							{form}
						</ActionSheet>
					);
				}

				if (alert.type == "page")
					return (
						<ModalPage
							key={alert.id}
							{...alert}
							type={alert.pageType}
							onClose={alert.close}
						/>
					);

				if (alert.content) {
					if (window.onDesktop()) {
						return (
							<Modal
								dismissible={alert.dismissible ?? true}
								key={alert.id}
								title={alert.title}
								{...props}
							>
								{Children.map(alert.content, (child) =>
									cloneElement(child, {
										onClose: alert.close,
									})
								)}
							</Modal>
						);
					}

					return (
						<PageProvider
							key={alert.id}
							page={alert}
							onClose={alert.close}
						>
							<IonicModal />
						</PageProvider>
					);
				}

				return (
					<MessageModal
						key={alert.id}
						{...props}
						title={alert.title}
						message={alert.message}
						actions={renderActions(alert)}
					/>
				);
			})}
		</ErrorBoundary>
	);
}

export default function useAlerts() {
	const [alerts, setAlerts] = useState([]);
	const [presentToast] = useIonToast();

	const notifyParent = (newValue, id, status) => {
		window.alerts = newValue;
		setTimeout(() => {
			dispatch("alerts-changed");
		}, 10);

		const spotlightParent = document.querySelector("[data-current-page]");

		if (!spotlightParent) return console.log("No parent found!!");

		if (status) spotlightParent.classList.add(`alert-open-${id}`);
		else {
			setTimeout(() => {
				spotlightParent.classList.remove(`alert-open-${id}`);
				dispatch("alert-closed");
			}, 300);
		}
	};

	const hideAlert = (alertId) => {
		if (!alertId) alertId = alerts.at(-1)?.id;

		setAlerts((alerts) => {
			const newValue = alerts.filter(({ id }) => id !== alertId);
			notifyParent(newValue, alertId, false);
			return newValue;
		});
	};

	const showAlert = (alert) => {
		alert = typeof alert == "string" ? { message: alert } : alert;
		const promise = new Promise((resolve) => {
			const oldCallback = alert.callback || ((data) => data);
			alert.callback = (data) => resolve(oldCallback(data));
		});

		const id = randomId();

		alert = {
			...alert,
			id,
			open: true,
			close(data) {
				alert.callback(data);
				hideAlert(alert.id);
			},
		};

		if (alert.replace) alerts.at(-1)?.callback();

		setAlerts((alerts) => {
			const currentValue = !alert.replace
				? alerts
				: alerts.filter(({ id }) => id !== alerts.at(-1)?.id);

			const newValue = [...currentValue, alert];
			notifyParent(newValue, id, false);
			return newValue;
		});

		if (typeof alert.onCreate == "function") alert.onCreate(alert);

		return promise;
	};

	function openActionDialog(props) {
		const defaultProps = {
			title: "",
			type: "form",
			action: "Submit",
			successMessage: "Success",
		};

		return showAlert({
			hideCloseButton: !!props?.title?.length,
			...(props.dialogProps ?? {}),
			content: { ...defaultProps, ...props },
		});
	}

	function confirmAction(userProps = {}) {
		const alert = {
			type: "confirm",
			size: "xs",
			title: "Are you sure?",
			message: "This action can not be undone",
			cancelText: "Cancel",
			okayText: "Yes, Continue",
			...(userProps || {}),
			hideCloseButton: true,
		};

		alert.actions = [alert.cancelText, alert.okayText];
		alert.callback = (action) => action === alert.okayText;

		return showAlert(alert);
	}

	function confirmDangerousAction() {
		return confirmAction({ dangerous: true });
	}

	const openActionSheet = (userProps = {}) =>
		showAlert({
			...userProps,
			type: "sheet",
		});

	const showActionSheetAlert = (message) =>
		openActionSheet({
			noHeading: true,
			emptyStateMessage: message,
		});

	const openChoicePicker = (props) =>
		showAlert({
			...(_.isArray(props) ? { choices: props } : props),
			type: "choice-picker",
		});

	const openAlertForm = (props) =>
		showAlert({
			...props,
			type: "form",
		});

	const showToast = (...message) => {
		if (window.onDesktop()) {
			return showAlert({
				message: [...message].join(" "),
				type: "toast",
			});
		}

		presentToast({
			message: [...message].join(" "),
			duration: 2000,
			position: "top",
			color: "dark",
			swipeGesture: "vertical",
			translucent: true,
		});
	};

	if (!window.onDesktop()) {
		window.openPage = (props) => {
			props = {
				fullScreen: true,
				inset: false,
				dismissible: false,
				noHeading: false,
				...props,
				choices: props.resolve,
				pageType: props.type || "search",
			};

			if (props.source) {
				const source = props.source;
				const actualSource = source?._id
					? source
					: window.dataSources[source];

				if (!actualSource)
					return window.showToast(`Invalid data source ${source}`);

				props = {
					...props,
					layoutProps: actualSource.layoutProps,
					layout: actualSource.layoutProps?.layout,
					placeholder: actualSource.name
						? `Search ${camelCaseToSentenceCase(
								actualSource.name
						  )}...`
						: "",
					resolve: actualSource.get,
					onSearch: actualSource.search,
					onDataChange: actualSource.listenForUpdates,
					secondaryAction: actualSource.entrySecondaryAction,
					entryAction: actualSource.entryAction,
					entryActions: actualSource.entryActions,
					entryPreview: actualSource.entryPreview,
				};
			}

			return openChoicePicker(props);
		};
	}

	return {
		alerts,
		confirmAction,
		confirmDangerousAction,
		showAlert,
		hideAlert,
		openActionDialog,
		openActionSheet,
		openChoicePicker,
		openAlertForm,
		showToast,
		openModal: showAlert,
		showActionSheetAlert,
	};
}
