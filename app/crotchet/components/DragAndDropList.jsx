import { Reorder, useDragControls } from "framer-motion";

const DragItem = ({ item, index, renderItem, getId }) => {
	const controls = useDragControls();

	return (
		<Reorder.Item
			key={getId(item)}
			value={item}
			dragListener={false}
			dragControls={controls}
		>
			<div className="flex w-full">
				<div
					className="w-8 sbg-content/5 flex items-center justify-center cursor-grab"
					onPointerDown={(e) => controls.start(e)}
				>
					<svg
						className="opacity-50 size-6"
						fill="currentColor"
						viewBox="0 0 16 16"
					>
						<path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
					</svg>
				</div>
				<div className="flex-1">{renderItem(item, index)}</div>
			</div>
		</Reorder.Item>
	);
};

export default function DragAndDropList({
	items,
	renderItem,
	getId,
	onReorder = () => {},
}) {
	return (
		<Reorder.Group axis="y" values={items} onReorder={onReorder}>
			{items.map((item, index) => (
				<DragItem
					{...{ item, index, renderItem, getId }}
					key={getId(item)}
				/>
			))}
		</Reorder.Group>
	);
}
