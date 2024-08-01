import clsx from "clsx";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

function FallbackRender({ error, resetErrorBoundary, style, className }) {
	return (
		<div
			role="alert"
			className={clsx(
				"pointer-events-auto text-content z-[999]",
				className
			)}
			style={style}
		>
			<p>Something went wrong:</p>
			<div className="w-full overflow-auto">
				<pre style={{ color: "red" }}>{error.message}</pre>
			</div>
			<button type="button" onClick={resetErrorBoundary}>
				Okay, go back
			</button>
		</div>
	);
}

export default function ErrorBoundary({
	children,
	onReset = () => {},
	style,
	className,
}) {
	return (
		<ReactErrorBoundary
			fallbackRender={({ error, resetErrorBoundary }) => (
				<FallbackRender
					error={error}
					resetErrorBoundary={resetErrorBoundary}
					style={style}
					className={className}
				/>
			)}
			onReset={onReset}
		>
			{children}
		</ReactErrorBoundary>
	);
}
