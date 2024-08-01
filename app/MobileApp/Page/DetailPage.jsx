import { usePageContext } from "@/crotchet/providers/PageProvider";
import PageHeader from "./components/PageHeader";

export default function DetailPage() {
	const { content: _content } = usePageContext();
	const content = _content();

	const renderPage = () => {
		// const pageHasFields =
		// 	[typeof page.fields, typeof page.field].includes("function") ||
		// 	Object.keys(page.fields ?? {}).length > 0 ||
		// 	page.field;

		// let content = _content();
		// if (pageHasFields) content = <FormPage page={page} />;
		// return <ActionPage page={page}>{content}</ActionPage>;

		return <div>{content}</div>;
	};

	return (
		<div>
			<PageHeader />
			<div className="p-5">{renderPage()}</div>
		</div>
	);
}
