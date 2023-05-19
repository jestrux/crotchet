export default function WidgetWrapper({
	children,
	widget: Widget,
	width,
	aspectRatio = 1 / 1,
	flex,
}) {
	return (
		<div
			className="rounded-2xl bg-card shadow-md border border-content/10 overflow-y-hidden relative"
			style={{
				width,
				flex,
				aspectRatio,
			}}
		>
			<div className="h-full">
				{children ? children : Widget ? <Widget /> : <span></span>}
			</div>
		</div>
	);
}
