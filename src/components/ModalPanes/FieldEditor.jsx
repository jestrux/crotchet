import DragDropList from "@/Components/DragDropList";
import SpotlightSearchItem from "@/Components/SpotlightSearch/SpotlightSearchItem";
import {
    useSpotlightSearchContext,
    useSpotlightState,
} from "@/Components/SpotlightSearch/SpotlightSearchProvider";
import SpotlightSearchSection from "@/Components/SpotlightSearch/SpotlightSearchSection";
import useFocusCapture from "@/hooks/useFocusCapture";
import { useAppContext } from "@/providers/AppProvider";
import { objectFieldChoices } from "@/utils";
import {
    Bars3Icon,
    CheckCircleIcon,
    PlusIcon,
} from "@heroicons/react/24/solid";
import { useRef } from "react";

export default function FieldEditor({
    reorder = true,
    addAction = "Add new entry",
    canAdd = true,
    ...props
}) {
    const { captureFocus, restoreFocus } = useFocusCapture();
    const {
        confirm,
        popCurrentSpotlightPage,
        replaceCurrentSpotlightPage,
        pushSpotlightPage,
    } = useAppContext();
    const [fields, setFields] = useSpotlightState(
        "value",
        objectFieldChoices(props.value)
    );
    const [fieldBeingEdited, setFieldBeingEdited] =
        useSpotlightState("fieldBeingEdited");

    const updateField = (
        fieldId,
        newProps,
        { replace = false, dontPersist = false } = {}
    ) => {
        if (!fieldId) return;

        let newFields;

        if (!newProps)
            newFields = fields.filter(({ tempId }) => tempId != fieldId);
        else if (fieldId == addAction)
            newFields = [...fields, { ...newProps, tempId: newProps.label }];
        else
            newFields = fields.map((field) => {
                if (field.tempId == fieldId)
                    field = replace ? newProps : { ...field, ...newProps };

                return field;
            });

        setFields(newFields);

        if (!dontPersist && typeof props.onSave == "function")
            props.onSave(newFields);
    };

    const lastSelection = useRef(Date.now());
    const { navigationValue, onSelect, onChange } = useSpotlightSearchContext();

    onChange(() => {
        if (Date.now() - lastSelection.current > 50) setFieldBeingEdited(null);
    });

    onSelect(async (value) => {
        lastSelection.current = Date.now();
        const addingNewField = value == addAction;
        const field = addingNewField
            ? { tempId: addAction }
            : fields.find((field) => field.tempId == value);

        if (props.editable) {
            if (typeof props.onEdit == "function") {
                const overriddenProps = props.onEdit(
                    addingNewField ? null : field
                );
                const formProps = {
                    type: "form",
                    data: field,
                    secondaryAction: "Delete",
                    secondaryActionType: "danger",
                    ...overriddenProps,
                };

                if (overriddenProps.data) {
                    updateField(value, overriddenProps.data, {
                        replace: true,
                        dontPersist:
                            typeof formProps.onSave == "function" &&
                            (addingNewField || !res),
                    });
                }

                if (addingNewField) formProps.secondaryAction = null;

                let res = await pushSpotlightPage(formProps);

                if (!res) return;

                if (res.fromSecondaryAction) res = res.data;

                updateField(value, res, {
                    replace: true,
                    dontPersist:
                        typeof formProps.onSave == "function" &&
                        (addingNewField || !res),
                });
            } else {
                captureFocus();
                setFieldBeingEdited(field);
            }
        } else if (typeof props.onSelect == "function") {
            const newPageProps = props.onSelect(field);
            const navigationAction = newPageProps.replace
                ? replaceCurrentSpotlightPage
                : pushSpotlightPage;
            navigationAction(newPageProps);
        } else updateField(value, { hidden: !field.hidden });
    });

    if (
        typeof props.onSubmit == "function" &&
        typeof props.onSave != "function"
    ) {
        props.onSubmit(() => {
            popCurrentSpotlightPage(
                typeof props.value[0] == "object"
                    ? fields
                    : fields.map(({ label }) => label)
            );
        });
    }

    if (
        typeof props.onSecondaryAction == "function" &&
        typeof props.onSave == "function"
    ) {
        props.onSecondaryAction(async () => {
            let newFields;
            if (typeof props.onDestructiveGroupAction == "function") {
                const res = await confirm({
                    title: props.page.secondaryAction + "?",
                    actionType: "danger",
                    okayText: props.page.confirmText || "Yes, Continue",
                });

                if (!res) return;

                newFields = props.onDestructiveGroupAction(fields);
            } else if (typeof props.onGroupAction == "function")
                newFields = props.onGroupAction(fields);

            if (newFields == undefined) return;

            setFields(newFields);
            props.onSave(newFields);
            popCurrentSpotlightPage();
        });
    }

    const handleSetFields = (fields) => {
        setFields([]);

        requestAnimationFrame(() => {
            setFields(fields);

            if (typeof props.onSave == "function") props.onSave(fields);
        });
    };

    const handleUpdateFieldValue = (e) => {
        e.preventDefault();

        updateField(
            fieldBeingEdited.tempId,
            { label: e.target.input.value },
            { dontPersist: true }
        );
        setFieldBeingEdited(null);
        restoreFocus();
    };

    const FieldItem = (field) => {
        const selected = navigationValue == field.tempId;
        const isNewEntry = field.tempId == addAction;
        return (
            <div
                key={field.tempId}
                className={`
                    h-12 flex items-center gap-2 px-4 text-base leading-none
                    ${isNewEntry && "border-t border-divider text-primary"}
                    ${selected && "data-reach-combobox-selected"}
                `}
            >
                <div className="w-5 flex-shrink-0">
                    {isNewEntry ? (
                        <PlusIcon width={20} />
                    ) : (
                        <Bars3Icon width={20} />
                    )}
                </div>
                <div className="flex-1 capitalize ml-1.5">
                    {fieldBeingEdited?.tempId == field.tempId ? (
                        <form onSubmit={handleUpdateFieldValue}>
                            <input
                                className="border -ml-1.5 py-1 px-1.5"
                                autoFocus
                                defaultValue={fieldBeingEdited.label}
                                name="input"
                            />
                        </form>
                    ) : (
                        field.label
                    )}
                </div>
                <span className="flex-shrink-0 ml-auto text-sm">
                    {props.editable ? (
                        !isNewEntry && selected ? (
                            <span className="opacity-40">Click to edit</span>
                        ) : (
                            typeof props.trailing == "function" &&
                            props.trailing(field)
                        )
                    ) : !field.hidden ? (
                        <CheckCircleIcon className="text-primary" width={24} />
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
                    )}
                </span>
            </div>
        );
    };

    return (
        <div className="relative">
            <SpotlightSearchSection>
                {fields.map((field) => {
                    const leading =
                        typeof props.leading == "function"
                            ? props.leading(field)
                            : undefined;

                    return (
                        <SpotlightSearchItem
                            key={field.tempId}
                            value={field.tempId}
                            label={field.label}
                            leading={leading || undefined}
                            trailing={
                                props.editable ? (
                                    navigationValue == field.tempId ? (
                                        <span className="opacity-40">
                                            Click to edit
                                        </span>
                                    ) : (
                                        typeof props.trailing == "function" &&
                                        props.trailing(field)
                                    )
                                ) : typeof props.trailing == "function" ? (
                                    props.trailing(field)
                                ) : !field.hidden ? (
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
                        />
                    );
                })}

                {props.editable && canAdd && (
                    <SpotlightSearchItem
                        className={`text-primary
                    ${
                        navigationValue == addAction &&
                        "data-reach-combobox-selected"
                    }
                    `}
                        label={addAction}
                        value={addAction}
                        leading={<PlusIcon width={20} />}
                        trailing=" "
                    />
                )}
            </SpotlightSearchSection>

            {reorder && (
                <div className="absolute inset-0 bg-card">
                    <DragDropList
                        idKey="tempId"
                        className="divide-y divide-divider"
                        items={fields}
                        onChange={handleSetFields}
                    >
                        {({ item: field }) => FieldItem(field)}
                    </DragDropList>

                    {props.editable &&
                        canAdd &&
                        FieldItem({
                            tempId: addAction,
                            label: addAction,
                        })}
                </div>
            )}
        </div>
    );
}
