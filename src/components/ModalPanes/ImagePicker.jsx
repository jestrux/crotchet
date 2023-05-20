import { useAppContext } from "@/providers/AppProvider";
import {
    useSpotlightActions,
    useSpotlightState,
} from "@/Components/SpotlightSearch/SpotlightSearchProvider";
import SpotlightSearchGrid from "@/Components/SpotlightSearch/SpotlightSearchGrid";
import { stockImages } from "@/utils";
import CommandKey from "@/Components/CommandKey";
import useKeyDetector from "@/hooks/useKeyDetector";
import useClipboard from "@/hooks/useClipboard";

export default function ImagePicker({ onSubmit, value }) {
    const { toast } = useAppContext();
    const { read: readClipboard } = useClipboard();
    const [_value, setValue] = useSpotlightState("value", value);
    useSpotlightActions(["Picture", "Video"], "Picture");

    const { popCurrentSpotlightPage } = useAppContext();
    const handleSelect = (image) => {
        popCurrentSpotlightPage(image);
    };

    const handlePaste = () => {};

    if (typeof onSubmit == "function") {
        onSubmit(() => {
            if (_value) handleSelect(_value);
        });
    }

    useKeyDetector({
        key: "Cmd+v",
        action: async () => {
            const url = await readClipboard();
            if (url?.length) setValue(url);
            else toast("No image or invalid url");
        },
    });

    return (
        <div className="grid grid-cols-12 items-start">
            <div className="col-span-5 border-r h-[324px] overflow-hidden flex flex-col">
                {/* <div className="-mb-1 px-2 h-9 border-b flex items-center gap-2">
                    <input
                        type="text"
                        className="h-full flex items-center text-sm flex-1"
                        placeholder="Search stock photos"
                    />

                    <CommandKey label="/" />
                </div> */}

                <div className="flex-1 overflow-y-auto">
                    <SpotlightSearchGrid
                        columns={2}
                        choices={stockImages}
                        onChange={setValue}
                        onSelect={handleSelect}
                    >
                        {(value) => (
                            <img
                                className="absolute rounded inset-0 h-full w-full object-cover"
                                src={value}
                                alt=""
                            />
                        )}
                    </SpotlightSearchGrid>
                </div>
            </div>
            <div className="col-span-7 min-h-full p-3 flex flex-col gap-3 overflow-hidden">
                <div
                    className="flex-1 rounded relative overflow-hidden"
                    style={{
                        background: "red",
                    }}
                >
                    <img
                        className="absolute h-full w-full object-cover"
                        src={_value}
                        alt=""
                    />
                </div>

                <div className="h-8 flex rounded border border-content/20">
                    <div className="h-full pl-2 flex items-center flex-1 bg-transparent text-xs border-r">
                        <div className="truncate">{_value}</div>
                    </div>
                    <button
                        type="button"
                        className="flex-shrink-0 flex items-center gap-0.5 text-sm px-1 hover:bg-content/10"
                        onClick={() => handlePaste()}
                    >
                        <CommandKey label="Cmd+v" />
                    </button>
                </div>
            </div>
        </div>
    );
}
