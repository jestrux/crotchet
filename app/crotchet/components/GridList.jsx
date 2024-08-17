import clsx from "clsx";
import { randomId } from "@/crotchet/utils";
import { Loader } from "@/crotchet/components";
import GridListItem from "./ListItem/GridListItem";

export default function GridList({ source, data, isLoading, ...props }) {
	const {
		columns = "xs:2,md:3,xl:4",
		gap = "0.5rem",
		aspectRatio,
		meta,
	} = {
		...(source?.layoutProps || props.layoutProps || {}),
		...props,
	};

	const { entryActions, entryAction } = {
		...(source || {}),
		...props,
	};

	let content = isLoading ? (
		<div className="relative h-8 min-w-full min-h-full flex items-center justify-center">
			<Loader scrimColor="transparent" size={25} />
		</div>
	) : null;

	if (!isLoading && data) {
		const items = data.map((entry) => {
			const _id = entry._id || randomId();
			const entryProps = {
				_id,
				...entry,
				onClick:
					typeof entry.onClick == "function"
						? entry.onClick
						: typeof entryAction == "function"
						? () => entryAction(entry)
						: null,
				onHold:
					typeof entry.onHold == "function"
						? entry.onHold
						: typeof entryActions == "function"
						? () =>
								window.openActionSheet({
									actions: entryActions(entry),
									preview: _.pick(entry, [
										"icon",
										"image",
										"video",
										"title",
										"subtitle",
									]),
								})
						: null,
			};

			return (
				<GridListItem
					key={_id}
					{...entryProps}
					aspectRatio={aspectRatio}
					meta={meta}
				/>
			);
		});

		const columnClasses = Object.entries(
			columns
				.toString()
				.split(",")
				.reduce(
					(agg, col) => {
						const [columns, screen = "xs"] = col
							.split(":")
							.reverse();

						return {
							...agg,
							[screen]: columns,
						};
					},
					{ xs: 1 }
				)
		)
			.map(([screen, columns]) => {
				return screen == "xs"
					? `@xs:grid-cols-${columns}`
					: `@${screen}:grid-cols-${columns}`;
			})
			.join(" ");

		content = (
			<div className="@container">
				<div
					className={clsx("pb-2 grid", columnClasses)}
					style={{
						gap,
					}}
				>
					{items}
				</div>
			</div>
		);
	}

	return (
		<div>
			{props.title && data?.length && (
				<div className="px-1 mb-1">
					<h2 className="text-xl font-semibold text-content">
						{props.title}
					</h2>
				</div>
			)}

			{content}
		</div>
	);
}
