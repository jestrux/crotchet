export default function FloatingWindow({ page }) {
	console.log("Floating window page: ", page);
	return (
		<div className="fixed inset-0 bg-red-500">
			Page: {JSON.stringify(page)}
		</div>
	);
}
