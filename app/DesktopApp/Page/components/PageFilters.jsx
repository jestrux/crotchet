import { useRef } from "react";
import { usePageContext } from "@/crotchet/providers/PageProvider";

import CommandKey from "./CommandKey";
import PageMenu from "./PageMenu";
import { dispatch, objectFieldChoices } from "@/crotchet/utils";

export default function PageFilters() {
	const filterMenuTriggerRef = useRef();
	const {
		filters: _filters,
		pageFilter,
		setPageFilter,
		onChangeFilter,
		pageResolving,
	} = usePageContext();
	const filters = _filters();

	onChangeFilter(() => {
		filterMenuTriggerRef.current.click();
	});

	if (!filters?.length || pageResolving) return null;

	const selected = objectFieldChoices(filters).find(
		({ value }) => value == pageFilter
	);

	return (
		<PageMenu
			width="330px"
			selected={selected?.value}
			choices={filters}
			onChange={(value) => {
				setPageFilter(value);
				dispatch("filter-changed", value);
			}}
			trigger={
				<div
					ref={filterMenuTriggerRef}
					className="flex items-center gap-2 w-[200px] relative cursor-default rounded-md h-9 px-2 focus:outline-none focus-visible:border-content/20 text-xs font-medium border border-content/20 text-left"
					size="sm"
				>
					<span className="mr-0.5 capitalize text-sm flex-1 truncate">
						{selected?.label || "Choose one"}
					</span>
					<CommandKey label="Cmd" />
					<CommandKey label="P" />
				</div>
			}
		/>
	);
}
