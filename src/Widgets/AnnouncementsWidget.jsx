import ListWidget from "./ListWidget";

const AnnouncementsWidget = ({ widget }) => {
	return (
		<div>
			<div className="py-2 px-5 bg-content/5 text-content/50 mb-2.5 uppercase tracking-wide text-sm font-bold">
				Announcements
			</div>
			<div className="px-5">
				<ListWidget 
					widget={{
						name: "Announcements",
						model: "Announcements",
						props: {"title": "title", "subtitle": "content", "action": "link"}
					}}
				/>
			</div>
		</div>
	);
};

AnnouncementsWidget.props = {
	noPadding: true,
}

export default AnnouncementsWidget;
