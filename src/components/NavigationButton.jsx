import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../providers/AppProvider";
import ComboboxItem from "./ComboboxItem";
import { camelCaseToSentenceCase } from "../utils";

export default function NavigationButton({ onSuccess = () => {}, ...props }) {
	const { openActionDialog } = useAppContext();
	const handleClick = async () => {
		if (props.inset) {
			document.dispatchEvent(
				new CustomEvent("push-pane", {
					detail: {
						...props,
						callback: (data) =>
							data === undefined ? null : onSuccess(data),
					},
				})
			);
			return;
		}

		const res = await openActionDialog(props);
		if (res !== undefined) onSuccess(res);
	};

	return (
		<ComboboxItem
			label={camelCaseToSentenceCase(props.title)}
			value={props.title}
			onSelect={handleClick}
			trailing={
				<ChevronRightIcon className="w-4 opacity-40" strokeWidth={2} />
			}
		/>
	);
}
