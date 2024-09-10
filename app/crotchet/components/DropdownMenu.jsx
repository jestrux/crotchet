import {
	IonItem,
	IonItemDivider,
	IonItemGroup,
	IonLabel,
	IonList,
	IonPopover,
} from "@ionic/react";
import { useRef, useState } from "react";
import { isValidAction, sectionedChoices } from "@/crotchet/utils";
import { onActionClick } from "../hooks/useActionClick";

export default function DropdownMenu({
	choices,
	children,
	onSelect = () => {},
}) {
	const choiceSections = sectionedChoices(choices);
	const popover = useRef(null);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const openPopover = (e) => {
		popover.current.event = e;
		setPopoverOpen(true);
	};

	const handleSelect = async (choice) => {
		setPopoverOpen(false);

		if (choice.destructive) {
			const res = await window.confirmDangerousAction({
				title: choice.label + "?",
				okayText: choice.confirmText || "Yes, Continue",
			});

			if (!res) return;
		}

		if (isValidAction(choice)) onActionClick(choice)();
		else onSelect(choice.value);
	};

	return (
		<>
			<div onClick={openPopover}>{children}</div>
			<style>
				{`
					ion-popover::part(backdrop) {
						background-color: transparent;
					}

					.page-actions {
						--width: 190px;
					}
				`}
			</style>
			<IonPopover
				mode="md"
				ref={popover}
				isOpen={popoverOpen}
				className="page-actions"
				onDidDismiss={() => setPopoverOpen(false)}
			>
				{choiceSections.map(([section, choices]) => {
					return (
						<IonList
							key={section + "idx"}
							lines="none"
							className="bg-card p-0"
						>
							<IonItemGroup>
								{section && section != "undefined" && (
									<IonItemDivider>
										<IonLabel>{section}</IonLabel>
									</IonItemDivider>
								)}

								{choices.map((choice) => {
									return (
										<IonItem
											key={choice.__id}
											onClick={() => handleSelect(choice)}
											color="none"
											style={{
												color: choice?.destructive
													? "red"
													: "",
											}}
										>
											<IonLabel>
												<span className="flex items-center gap-3">
													{choice.icon && (
														<span className="size-4">
															{choice.icon}
														</span>
													)}
													{choice.label}
												</span>
											</IonLabel>
										</IonItem>
									);
								})}
							</IonItemGroup>
						</IonList>
					);
				})}
			</IonPopover>
		</>
	);
}
