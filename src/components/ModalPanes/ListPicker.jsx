import SpotlightSearchItem from "@/Components/SpotlightSearch/SpotlightSearchItem";
import {
    useSpotlightSearchContext,
    useSpotlightState,
} from "@/Components/SpotlightSearch/SpotlightSearchProvider";
import SpotlightSearchSection from "@/Components/SpotlightSearch/SpotlightSearchSection";
import { useAppContext } from "@/providers/AppProvider";
import { objectFieldChoices } from "@/utils";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export function ListPickerComponent({
    choices = [],
    children,
    leading,
    trailing,
    onSelect,
    onSubmit,
    multiple,
    ...props
}) {
    const { popCurrentSpotlightPage } = useAppContext();
    const [value, setValue] = useSpotlightState("value", props.value);

    const handleSelect = (selectedChoice) => {
        if (!multiple) onSelect(selectedChoice);
        else {
            if (value.includes(selectedChoice)) {
                setValue(value.filter((choice) => choice != selectedChoice));
            } else setValue([...value, selectedChoice]);
        }
    };

    if (typeof onSubmit == "function") {
        onSubmit(() => {
            popCurrentSpotlightPage(value);
        });
    }

    const { onChange } = useSpotlightSearchContext();
    onChange(props.onChange);

    return (
        <SpotlightSearchSection>
            {objectFieldChoices(choices).map((choice) => {
                const selected = multiple
                    ? value?.includes(choice.label)
                    : value?.toString().toLowerCase() ==
                      choice.label?.toLowerCase();
                return (
                    <SpotlightSearchItem
                        key={choice.tempId}
                        value={() => handleSelect(choice.label)}
                        leading={
                            typeof leading == "function"
                                ? leading(choice.label)
                                : leading
                        }
                        trailing={
                            trailing != undefined ? (
                                trailing
                            ) : selected ? (
                                <CheckCircleIcon
                                    className="text-primary"
                                    width={24}
                                />
                            ) : (
                                <svg
                                    width={20}
                                    className="opacity-30 mr-0.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                            )
                        }
                        label={choice.label}
                    >
                        {typeof children == "function" &&
                            children(choice.label, selected)}
                    </SpotlightSearchItem>
                );
            })}
        </SpotlightSearchSection>
    );
}

export function ListPickerPage(props) {
    const handleSelect = (value) => {
        popCurrentSpotlightPage(value);
    };
    const { popCurrentSpotlightPage } = useAppContext();

    return <ListPickerComponent {...props} onSelect={handleSelect} />;
}
