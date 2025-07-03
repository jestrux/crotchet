import clipboard from "./clipboard";
import pinnedItems from "./pinnedItems";
import codeScreenshot from "./codeScreenshot";

export default function internalExtensions() {
	clipboard();
	pinnedItems();
	codeScreenshot();
}
