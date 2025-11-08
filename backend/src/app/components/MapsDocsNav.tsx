export function MapsDocsNav({ currentPage }: { currentPage: 'static' | 'interactive' }) {
	return (
		<nav style={{
			backgroundColor: "#f7fafc",
			padding: "15px 20px",
			borderRadius: "8px",
			marginBottom: "30px",
			border: "1px solid #e2e8f0"
		}}>
			<div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
				<span style={{ fontWeight: "600", color: "#4a5568", marginRight: "10px" }}>Maps API:</span>
				<a
					href="/maps/docs"
					style={{
						padding: "8px 16px",
						borderRadius: "6px",
						textDecoration: "none",
						fontWeight: "500",
						backgroundColor: currentPage === 'static' ? "#3b82f6" : "transparent",
						color: currentPage === 'static' ? "#fff" : "#4a5568",
						border: currentPage === 'static' ? "none" : "1px solid #cbd5e0",
						transition: "all 0.2s"
					}}
				>
					📍 Static Maps
				</a>
				<a
					href="/maps/docs/interactive"
					style={{
						padding: "8px 16px",
						borderRadius: "6px",
						textDecoration: "none",
						fontWeight: "500",
						backgroundColor: currentPage === 'interactive' ? "#3b82f6" : "transparent",
						color: currentPage === 'interactive' ? "#fff" : "#4a5568",
						border: currentPage === 'interactive' ? "none" : "1px solid #cbd5e0",
						transition: "all 0.2s"
					}}
				>
					🗺️ Interactive Maps
				</a>
			</div>
		</nav>
	);
}
