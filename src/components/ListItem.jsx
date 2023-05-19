import { Fragment, useState } from "react";
import { _get, _parse } from "../utils";
import { AirtableService } from "../hooks/useAirtable";

const Status = ({ status }) => {
	return (
		<div
			className={`
			${status == "complete" && "bg-green-500 text-white"}
			${status == "in progress" && "bg-yellow-300 text-black"}
			${status == "blocked" && "bg-red-500 text-white"}
			${
				!["in progress", "complete", "blocked"].includes(status)
					? "bg-content/5 dark:bg-content/10 border-content/10"
					: "border-transparent"
			}
			font-bold py-1.5 px-2 rounded-full border text-[8px] leading-none uppercase tracking-wide
		`}
		>
			{status}
		</div>
	);
};

const Checkbox = ({ table, row, field }) => {
	const [status, setStatus] = useState(row[field]);

	const updateStatus = (status) => {
		new AirtableService({ table }).update(row._rowId, {
			[field]: status,
		});
	};

	return (
		<label className="-translate-y-0.5  mr-2 cursor-pointer h-8 w-8 flex items-center justify-center rounded-full transition-colors duration-300 hover:bg-content/10">
			<input
				className="hidden"
				type="checkbox"
				value={status}
				checked={status}
				onChange={(e) => {
					const newValue = e.target.checked;
					setStatus(newValue);
					updateStatus(newValue);
				}}
			/>

			<svg
				className={`w-5 h-5 ${status ? "text-primary" : ""}`}
				fill="currentColor"
				viewBox="0 0 24 24"
			>
				{status ? (
					<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
				) : (
					<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
				)}
			</svg>
		</label>
	);
};

const Progress = ({ value }) => {
	return (
		<div className="relative">
			<svg
				className={`
					${value < 50 && "text-yellow-300"}
					${value >= 50 && value <= 85 && "text-purple-500"}
					${value > 85 && "text-green-400/60"}
				-rotate-90
				`}
				viewBox="0 0 120 120"
				strokeWidth="6"
			>
				<circle
					cx="60"
					cy="60"
					r="54"
					fill="none"
					stroke="currentColor"
					pathLength="100"
					strokeDasharray="100"
					strokeDashoffset={100 - value}
					strokeLinejoin="round"
					strokeLinecap="round"
				/>

				<circle
					className="text-content/10"
					cx="60"
					cy="60"
					r="54"
					fill="none"
					stroke="currentColor"
				/>
			</svg>

			<div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold">
				{Number(value).toFixed(0)}%
			</div>
		</div>
	);
};

const ListItem = ({
	table,
	data,
	image = "image",
	title = "title",
	subtitle,
	status,
	// status = "status",
	leading,
	action,
	progress,
	// progress = "progress",
	checkbox,
}) => {
	image = _get(data, image);
	title = _get(data, title);
	subtitle = (_parse(subtitle, data) || []).filter((s) => s ?? false);
	leading = _get(data, leading);
	status = _get(data, status);
	action = _get(data, action);
	progress = _get(data, progress);

	return (
		<a
			{...(!action?.length ? {} : { href: action })}
			target="_blank"
			className={`group py-2 w-full text-left flex items-center relative`}
			rel="noreferrer"
		>
			{action?.length > 0 && (
				<div className="transition opacity-0 group-hover:opacity-100 absolute inset-0 -mx-5 bg-content/5"></div>
			)}

			{checkbox?.length && (
				<Checkbox table={table} row={data} field={checkbox} />
			)}

			{image?.length && (
				<img
					className={`${
						subtitle?.length && "mt-0.5s"
					} mr-2 flex-shrink-0 bg-content/10 border border-content/10 rounded-full w-8 h-8 object-cover`}
					src={image}
					alt=""
				/>
			)}

			<div className="flex-1 mr-3 min-w-0">
				{title?.length > 0 && (
					<h5 className="text-sm leading-none font-medium truncate mb-1.5">
						{title}
					</h5>
				)}
				{subtitle?.length > 0 && (
					<p
						className={`${
							title?.length ? "text-xs opacity-60" : "text-sm"
						} leading-none truncate`}
					>
						{subtitle.map((s, i) => {
							return (
								<Fragment key={i}>
									<span>
										{s.toString().charAt(0).toUpperCase()}
										{s.toString().substring(1)}
									</span>
									{i !== subtitle.length - 1 && (
										<span className="mx-2s mr-2 leading-none">
											{i !== 0 &&
											i === subtitle.length - 2 ? (
												<span className="font-light ml-2">
													&mdash;
												</span>
											) : (
												<span>,</span>
											)}
										</span>
									)}
								</Fragment>
							);
						})}
					</p>
				)}
			</div>

			<div className="self-stretch flex-shrink-0 ml-auto flex items-center">
				{status?.toString().length && (
					<div className="self-start">
						<Status status={status} />
					</div>
				)}

				{progress?.toString().length && (
					<div className="self-start w-9">
						<Progress value={progress} />
					</div>
				)}

				{leading?.toString().length && (
					<span className="text-sm opacity-60">{leading}</span>
				)}

				{action?.toString().length > 0 &&
					(action.indexOf("whatsapp") !== -1 ? (
						<svg
							fill="currentColor"
							className="w-4 h-4 opacity-30 group-hover:opacity-60 transition"
							viewBox="0 0 24 24"
						>
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
						</svg>
					) : (
						<svg
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="2"
							stroke="currentColor"
							className="w-4 h-4 opacity-30 group-hover:opacity-60 transition"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.25 4.5l7.5 7.5-7.5 7.5"
							/>
						</svg>
					))}
			</div>
		</a>
	);
};

export default ListItem;
