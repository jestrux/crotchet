import { useState } from "react";
import { motion } from "framer-motion";

import { useDataLoader, useHideFloatingUI } from "@/crotchet/hooks";
import { randomId } from "@/crotchet/utils";
import { Loader } from "@/crotchet/components";

import PageSection from "./PageSection";
import { usePageContext } from "../PageProvider";
import PageHeader from "./PageHeader";
import { BottomNavPlaceholder } from "./PageNav";

const PageAction = () => {
	const hideFloatingUI = useHideFloatingUI();
	const { scaffold, page } = usePageContext();

	if (!page?.action) return null;

	const insetBottom = 24 + (scaffold.nav ? 42 : 0);

	return (
		<div className="@container-normal fixed inset-x-0 pointer-events-none">
			<div className="hidden @md:flex items-center justify-center fixed top-14 mt-1 left-0 w-24 px-2">
				<button
					className="pointer-events-auto bg-primary text-on-primary shadow dark:border-content/20 size-14 flex items-center justify-center gap-2 rounded-full focus:outline-none"
					onClick={page.action.handler}
				>
					<span className="size-7">{page.action.icon}</span>
				</button>
			</div>

			<motion.button
				className="@md:hidden pointer-events-auto bg-primary text-on-primary dark:bg-content dark:text-inverted shadow border border-content/5 dark:border-content/20 fixed bottom-0 right-5 mx-auto z-50 h-11 w-28 flex items-center justify-center gap-2 rounded-full px-3.5 focus:outline-none"
				onClick={page.action.handler}
				animate={{
					opacity: hideFloatingUI ? 0 : 1,
					scale: hideFloatingUI ? 0.9 : 1,
				}}
				style={{
					marginBottom: `calc(${insetBottom}px + env(safe-area-inset-bottom))`,
				}}
			>
				<span className="size-5">{page.action.icon}</span>
				<span className="mr-0.5 text-base/none tracking-wide font-semibold uppercase">
					{page.action.label}
				</span>
			</motion.button>
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

export default function Page() {
	const [headerKey, setHeaderKey] = useState(randomId());
	const { pageResolving } = usePageContext();

	return (
		<div>
			<PageHeader refreshKey={headerKey} />

			<div className="max-w-4xl mx-auto px-5 space-y-8">
				{pageResolving ? (
					<div className="py-12 flex justify-center">
						<Loader />
					</div>
				) : (
					<div className="space-y-8">
						<PageContent
							onSectionLoaded={() => setHeaderKey(randomId())}
						/>
					</div>
				)}

				<BottomNavPlaceholder />
			</div>

			<PageAction />
		</div>
	);
}
