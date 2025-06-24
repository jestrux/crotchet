import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";
import { arrayMoveImmutable } from "array-move";

export default function DragAndDropList({
	items,
	renderItem,
	getId,
	onReorder = () => {},
}) {
	const onSortEnd = (oldIndex, newIndex) => {
		const newItems = arrayMoveImmutable(items, oldIndex, newIndex);
		onReorder(newItems);
	};

	return (
		<SortableList
			onSortEnd={onSortEnd}
			className="list"
			lockAxis="y"
			// draggedItemClassName="dragged"
		>
			{items.map((item, index) => (
				<SortableItem key={getId(item)}>
					<div className="flex">
						<SortableKnob>
							<div
								className="w-6 flex items-center justify-center cursor-grab"
								title="Drag to reorder"
							>
								<svg
									className="opacity-50 size-5 -mr-2"
									fill="currentColor"
									viewBox="0 0 16 16"
								>
									<path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
								</svg>
							</div>
						</SortableKnob>
						<div className="flex-1">{renderItem(item, index)}</div>
					</div>
				</SortableItem>
			))}
		</SortableList>
	);
}
