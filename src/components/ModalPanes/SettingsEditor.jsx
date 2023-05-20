import { useSpotlightState } from "@/Components/SpotlightSearch/SpotlightSearchProvider";
import SpotlightSearchSection from "@/Components/SpotlightSearch/SpotlightSearchSection";
import SpotlightSettingsItem from "@/Components/SpotlightSearch/SpotlightSettingsItem";
import { camelCaseToSentenceCase, parseFields } from "@/utils";
import { useRef } from "react";

export default function SettingsEditor(props) {
    const editorWrapper = useRef();
    const [settings, setSettings] = useSpotlightState("settings", props.value);
    const [fields, setFields] = useSpotlightState(
        "fields",
        parseFields(props.fields, props.value)
    );

    const updateSetting = (key, value) => {
        if (value == undefined) value = !settings[key];

        const newSettings = {
            ...settings,
            [key]: value,
        };

        setSettings(newSettings);

        if (props.onSave) props.onSave(newSettings);
    };

    const updateField = (key, value) => {
        const newFields = fields.map((field) => {
            if (field.label == key) {
                return {
                    ...field,
                    value,
                };
            }

            return field;
        });

        setFields(newFields);

        handleChange(newFields);
    };

    const handleChange = (fields) => {
        if (typeof props.onSave != "function") return;

        const newData = fields.reduce((agg, field) => {
            const value = field?.value;

            agg = { ...agg, [field.name]: value };

            return agg;
        }, {});
        const fieldKeys = Object.keys(props.fields);
        const mergedValues = Object.entries(props.value || {}).reduce(
            (agg, [key, value]) => {
                if (!fieldKeys.includes(key)) agg[key] = value;

                return agg;
            },
            newData
        );

        Object.entries(mergedValues).forEach(([key, value]) => {
            if (value == undefined) delete mergedValues[key];
        });

        props.onSave(mergedValues);
    };

    if (fields) {
        return (
            <div ref={editorWrapper}>
                <SpotlightSearchSection>
                    {Object.entries(fields).map(([, field], index) => (
                        <SpotlightSettingsItem
                            key={index}
                            field={field}
                            onChange={(value) =>
                                updateField(field.label, value)
                            }
                        />
                    ))}
                </SpotlightSearchSection>
            </div>
        );
    }

    return (
        <SpotlightSearchSection>
            {Object.keys(settings).map((field, index) => {
                const val = settings[field];

                return (
                    <SpotlightSettingsItem
                        key={index}
                        label={camelCaseToSentenceCase(field)}
                        value={() => updateSetting(field, !val)}
                        checked={val}
                    />
                );
            })}
        </SpotlightSearchSection>
    );
}
