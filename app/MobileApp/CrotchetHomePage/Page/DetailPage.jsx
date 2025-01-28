import { usePageContext } from "@/crotchet/providers/PageProvider";
import PageHeader from "./components/PageHeader";

export default function DetailPage() {
	const { content } = usePageContext();

	const renderPage = () => {
		// const pageHasFields =
		// 	[typeof page.fields, typeof page.field].includes("function") ||
		// 	Object.keys(page.fields ?? {}).length > 0 ||
		// 	page.field;

		// let content = _content();
		// if (pageHasFields) content = <FormPage page={page} />;
		// return <ActionPage page={page}>{content}</ActionPage>;

		return <div className="px-6 py-4 max-w-4xl mx-auto">{content}</div>;
	};

	return (
		<div>
			<PageHeader />
			{renderPage()}
		</div>
	);
}
