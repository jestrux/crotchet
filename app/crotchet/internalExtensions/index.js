import clipboard from "./clipboard";
import pinnedItems from "./pinnedItems";
import codeScreenshot from "./codeScreenshot";
import appPages from "./app-pages";
import audioPlayer from "./audio-player";

export default function internalExtensions() {
	clipboard();
	pinnedItems();
	codeScreenshot();
	appPages();
	audioPlayer();
}
