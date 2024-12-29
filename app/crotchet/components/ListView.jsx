import { randomId } from "@/crotchet/utils";
import { Loader } from "@/crotchet/components";
import RegularListItem from "./ListItem";

export default function ListView({ source, data, isLoading, ...props }) {
	const { gap = "0.8rem", meta } = {
		...(source?.layoutProps || props.layoutProps || {}),
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
			return <RegularListItem key={_id} {...{ _id, meta, ...entry }} />;
		});

		content = (
			<div className="@container">
				<div
					className="pb-2 grid"
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
				<div className="px-1s mb-1">
					<h2 className="text-xl font-semibold text-content">
						{props.title}
					</h2>
				</div>
			)}

			{content}
		</div>
	);
}
