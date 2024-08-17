import {
	IonButtons,
	IonBackButton,
	IonHeader,
	IonContent,
	IonToolbar,
	IonTitle,
	IonPage,
} from "@ionic/react";
import PageSection from "./Page/PageSection";
import { useDataLoader } from "@/crotchet/hooks";
import { usePageContext } from "./PageProvider";
import { Loader } from "@/crotchet/components";

const PageAction = () => {
	const { mainAction } = usePageContext();
	const action = mainAction();

	if (!action) return null;

	return (
		<div className="@container-normal fixed inset-x-0 pointer-events-none">
			<div className="hidden @md:flex items-center justify-center fixed top-14 mt-1 left-0 w-24 px-2">
				<button
					className="pointer-events-auto bg-primary text-on-primary shadow dark:border-content/20 size-14 flex items-center justify-center gap-2 rounded-full focus:outline-none"
					onClick={action.handler}
				>
					<span className="size-7">{action.icon}</span>
				</button>
			</div>

			<button
				className="@md:hidden pointer-events-auto bg-primary text-on-primary dark:bg-content dark:text-inverted shadow border border-content/5 dark:border-content/20 fixed bottom-4 right-5 mx-auto z-50 h-11 flex items-center justify-center gap-2 rounded-full px-3.5 focus:outline-none"
				onClick={action.handler}
			>
				<span className="size-5">{action.icon}</span>
				<span className="mr-1 text-base/none tracking-wide font-semibold">
					{action.label}
				</span>
			</button>
		</div>
	);
};

const PageContent = ({ onSectionLoaded }) => {
	const { content: _content, pageData } = usePageContext();
	const { data: content } = useDataLoader({
		handler: _content,
		pageData,
	});

	if (!content) return null;

	const pageContent = _.isArray(content) ? content : [content];

	return pageContent.map((section, index) => (
		<PageSection
			key={index}
			{...section}
			onSectionLoaded={onSectionLoaded}
		/>
	));
};

export default function IonicPage() {
	const { title: _title, pageResolving } = usePageContext();
	const title = _title();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton></IonBackButton>
					</IonButtons>
					{title && <IonTitle>{title}</IonTitle>}
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen>
				{title && (
					<IonHeader collapse="condense">
						<IonToolbar>
							<IonTitle size="large">{title}</IonTitle>
						</IonToolbar>
					</IonHeader>
				)}

				<div className="max-w-4xl mx-auto px-5 space-y-8">
					{pageResolving ? (
						<div className="py-12 flex justify-center">
							<Loader />
						</div>
					) : (
						<div className="space-y-8">
							<PageContent />
						</div>
					)}
				</div>

				<PageAction />
			</IonContent>
		</IonPage>
	);
}
