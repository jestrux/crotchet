function SingleKey({ label }) {
	if (!label) return null;

	const customIconMap = {
		cmd: (
			<svg className="w-3" fill="currentColor" viewBox="0 0 24 24">
				<path d="M17.5,3C15.57,3,14,4.57,14,6.5V8h-4V6.5C10,4.57,8.43,3,6.5,3S3,4.57,3,6.5S4.57,10,6.5,10H8v4H6.5 C4.57,14,3,15.57,3,17.5S4.57,21,6.5,21s3.5-1.57,3.5-3.5V16h4v1.5c0,1.93,1.57,3.5,3.5,3.5s3.5-1.57,3.5-3.5S19.43,14,17.5,14H16 v-4h1.5c1.93,0,3.5-1.57,3.5-3.5S19.43,3,17.5,3L17.5,3z M16,8V6.5C16,5.67,16.67,5,17.5,5S19,5.67,19,6.5S18.33,8,17.5,8H16L16,8 z M6.5,8C5.67,8,5,7.33,5,6.5S5.67,5,6.5,5S8,5.67,8,6.5V8H6.5L6.5,8z M10,14v-4h4v4H10L10,14z M17.5,19c-0.83,0-1.5-0.67-1.5-1.5 V16h1.5c0.83,0,1.5,0.67,1.5,1.5S18.33,19,17.5,19L17.5,19z M6.5,19C5.67,19,5,18.33,5,17.5S5.67,16,6.5,16H8v1.5 C8,18.33,7.33,19,6.5,19L6.5,19z" />
			</svg>
		),
		enter: (
			<svg className="w-3" fill="currentColor" viewBox="0 0 24 24">
				<path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z" />
			</svg>
		),
		option: (
			<svg className="w-3" viewBox="0 0 24 24" fill="currentColor">
				<rect height="2" width="6" x="15" y="5" />
				<polygon points="9,5 3,5 3,7 7.85,7 14.77,19 21,19 21,17 15.93,17" />
			</svg>
		),
		alt: (
			<svg className="w-3" viewBox="0 0 24 24" fill="currentColor">
				<rect height="2" width="6" x="15" y="5" />
				<polygon points="9,5 3,5 3,7 7.85,7 14.77,19 21,19 21,17 15.93,17" />
			</svg>
		),
		arrowup: (
			<svg className="w-3" viewBox="0 0 24 24" fill="currentColor">
				<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
			</svg>
		),
		arrowdown: (
			<svg className="w-3" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
			</svg>
		),
		arrowleft: (
			<svg className="w-3" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
			</svg>
		),
		arrowright: (
			<svg className="w-3" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
			</svg>
		),
	};
	const customIcon = customIconMap[label.trim().toLowerCase()];
	const iconElement = customIcon ? (
		customIcon
	) : (
		<span className="capitalize text-xs leading-none px-1">{label}</span>
	);

	return (
		<span
			className={`ml-0.5 border flex items-center justify-center data-reach-combobox-selected rounded-sm overflow-hidden
            h-5 ${customIcon && "w-5"}
        `}
		>
			{iconElement}
		</span>
	);
}

export default function CommandKey({ label }) {
	if (!label) return null;

	return (
		<>
			{label.split("+").map((key, i) => (
				<SingleKey key={i} label={key} />
			))}
		</>
	);
}
