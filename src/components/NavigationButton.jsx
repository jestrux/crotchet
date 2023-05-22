import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../providers/AppProvider";

export default function NavigationButton({ onSuccess = () => {}, ...props }) {
	const { openActionDialog } = useAppContext();
	const handler = async () => {
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
		<button
			className="group w-full cursor-pointer text-content/40 hover:text-content/80 hover:bg-content/5 px-3 py-2.5 rounded flex items-center gap-2 focus:outline-none"
			onClick={handler}
		>
			<span className="text-content inline-block first-letter:capitalize">
				{props.title}
			</span>

			<div className="ml-auto">
				<ChevronRightIcon className="w-4" strokeWidth={2} />
			</div>
		</button>
	);
}
