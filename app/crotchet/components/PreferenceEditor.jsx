import {
	IonInput,
	IonItem,
	IonItemOption,
	IonItemOptions,
	IonItemSliding,
	IonLabel,
	IonList,
	IonToggle,
} from "@ionic/react";
import { parseFields } from "./Form";
import { useState } from "react";

export function PreferenceEditorItem({ item, onChange = () => {} }) {
	if (item.type == "boolean") {
		return (
			<IonItem>
				<IonToggle
					value={item.value}
					onIonInput={(e) => onChange(e.detail.value)}
				>
					<IonLabel>{item.label}</IonLabel>
				</IonToggle>
			</IonItem>
		);
	}

	return (
		<IonItem>
			<IonInput
				labelPlacement="stacked"
				label={item.label}
				value={item.value}
				// clearInput
				onIonInput={(e) => onChange(e.detail.value)}
			/>
		</IonItem>
	);
}

export default function PreferenceEditor({
	data,
	onChange = () => {},
	onRemove,
}) {
	const [fields, setFields] = useState(parseFields(data));
	const removeField = (fieldName) => {
		setFields((fields) =>
			fields.filter((field) => field.name != fieldName)
		);
		onRemove(fieldName);
	};

	return (
		<IonList>
			{fields.map((field) => (
				<IonItemSliding key={field.__id}>
					<PreferenceEditorItem
						item={field}
						onChange={(value) => onChange(field.name, value)}
					/>

					{typeof onRemove == "function" && (
						<IonItemOptions slot="end">
							<IonItemOption
								color="danger"
								expandable
								onClick={() => removeField(field.name)}
							>
								{window.UI.icon("delete", { size: "24" })}
							</IonItemOption>
						</IonItemOptions>
					)}
				</IonItemSliding>
			))}
		</IonList>
	);
}
