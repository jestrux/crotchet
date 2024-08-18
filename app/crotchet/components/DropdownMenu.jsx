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
			<IonPopover
				mode="md"
				ref={popover}
				isOpen={popoverOpen}
				onDidDismiss={() => setPopoverOpen(false)}
			>
				{choiceSections.map(([section, choices]) => {
					return (
						<IonList key={section + "idx"} lines="none">
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
											style={{
												color: choice?.destructive
													? "red"
													: "",
											}}
										>
											<span className="flex items-center gap-3">
												{choice.icon && (
													<span className="size-4">
														{choice.icon}
													</span>
												)}
												<IonLabel>
													{choice.label}
												</IonLabel>
											</span>
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
