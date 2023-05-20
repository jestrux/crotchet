import ColorPicker from "@/Components/ColorPicker";
import { useAppContext } from "@/providers/AppProvider";
import { materialColors, objectAsLabelValue } from "@/utils";
import { useState } from "react";
import { ListPickerComponent } from "./ListPicker";
import { useSpotlightActions } from "@/Components/SpotlightSearch/SpotlightSearchProvider";
import gradients from "@/Components/GradientPicker/gradients";
import { useEffect } from "react";
import GradientPicker, { gradientString } from "@/Components/GradientPicker";

const SolidColor = (props) => {
    const valueProp = Array.isArray(props.value) ? props.value[0] : props.value;
    const [value, setValue] = useState(valueProp || "#ecbf4a");
    const [color, setColor] = useState(value);
    const onChange = (color) => {
        setColor(color);
        setValue(color);
        props.onChange(color);
    };

    return (
        <div className="grid grid-cols-2 items-start">
            <div className="border-r max-h-[324px] overflow-y-auto">
                <ListPickerComponent
                    trailing=""
                    value={value}
                    choices={objectAsLabelValue(materialColors)}
                    leading={(choice) => (
                        <span
                            className="w-full aspect-square block rounded-full"
                            style={{
                                background: materialColors[choice],
                            }}
                        ></span>
                    )}
                    onChange={(color) =>
                        !color ? null : onChange(materialColors[color])
                    }
                    onSelect={(color) => props.onSelect(materialColors[color])}
                />
            </div>
            <div className="p-4 flex flex-col gap-3">
                <div className="w-full rounded-lg border overflow-hidden">
                    <div className="p-3">
                        <ColorPicker
                            className="text-black"
                            value={color}
                            onChange={onChange}
                        />

                        <div className="h-8 flex sgap-3 border-t -m-3 mt-3">
                            <div
                                className="m-1.5 px-3 rounded-sm"
                                style={{ background: color }}
                            >
                                &nbsp;
                            </div>
                            <input
                                className="bg-transparent border-l border-r h-full w-full px-2"
                                value={color}
                                onChange={(e) => onChange(e.target.value)}
                            />
                            {/* <button
                            type="button"
                            className="text-sm px-2 hover:bg-content/10"
                            onClick={() => handleSelect(color)}
                        >
                            Save
                        </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PickColor = (props) => {
    const [color, setColor] = useState(props.value);
    const isGradient =
        props.value && props.value?.toString().indexOf("linear-gradient") != -1;
    const { value: colorType } = useSpotlightActions(
        props.pickGradient ? ["Solid Color", "Gradient"] : [],
        props.value && isGradient ? "Gradient" : "Solid Color"
    );
    const value = !isGradient
        ? props.value
        : props.value &&
          props.value
              .replace("linear-gradient(90deg,", "")
              .replace(")", "")
              .replace(" 0%", "")
              .replace(" 50%", "")
              .replace(" 100%", "")
              .split(",")
              .map((entry) => entry.trim());
    const { popCurrentSpotlightPage } = useAppContext();
    const handleSelect = (color) => {
        popCurrentSpotlightPage(color);
    };

    if (typeof props.onSubmit == "function") {
        props.onSubmit(() => {
            popCurrentSpotlightPage(
                Array.isArray(color) ? gradientString(color) : color
            );
        });
    }

    useEffect(() => {
        if (colorType == "Gradient") setColor(gradients[0]);
        if (colorType == "Solid Color") setColor(materialColors.Blue);
    }, [colorType]);

    const solidColor = colorType == "Solid Color";

    if (solidColor)
        return (
            <SolidColor
                value={value}
                onChange={setColor}
                onSelect={handleSelect}
            />
        );

    return (
        <GradientPicker
            value={value}
            onChange={setColor}
            onSelect={handleSelect}
        />
    );
};

export default PickColor;
