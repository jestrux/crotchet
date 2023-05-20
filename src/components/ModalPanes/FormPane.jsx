import PierFormField from "@/Components/PierForm/PierFormField";
import { useSpotlightState } from "@/Components/SpotlightSearch/SpotlightSearchProvider";
import { useAppContext } from "@/providers/AppProvider";
import { Button } from "@chakra-ui/react";
import { Children, cloneElement, useRef } from "react";
import ActionPane from "./ActionPane";
import { parseFields } from "@/utils";

const FormWithFields = ({ page, onSubmit }) => {
    const fields = parseFields(page.fields, page.data);
    const [data, setData] = useSpotlightState(
        "data",
        Object.entries(page.fields).reduce((agg, [key, { defaultValue }]) => {
            if (defaultValue && agg[key] == undefined) agg[key] = defaultValue;
            return agg;
        }, page.data || {})
    );
    const { popCurrentSpotlightPage } = useAppContext();

    const submitButtonRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newData = fields.reduce((agg, field) => {
            const formField = e.target[field.name];

            if (!formField) return agg;

            const value =
                field.type == "boolean" ? formField?.checked : formField?.value;

            agg = { ...agg, [field.name]: value };

            return agg;
        }, {});
        const fieldKeys = Object.keys(page.fields);
        const mergedValues = Object.entries(page.data || {}).reduce(
            (agg, [key, value]) => {
                if (!fieldKeys.includes(key)) agg[key] = value;

                return agg;
            },
            newData
        );

        Object.entries(mergedValues).forEach(([key, value]) => {
            if (value == undefined) delete mergedValues[key];
        });

        if (typeof page.onSave == "function") {
            try {
                const res = await page.onSave(mergedValues);
                popCurrentSpotlightPage(res);
            } catch (error) {
                console.log("Save error: ", error);
            }
        } else {
            popCurrentSpotlightPage(mergedValues);
        }
    };

    if (typeof onSubmit == "function") {
        onSubmit(() => {
            submitButtonRef.current.click();
        });
    }

    return (
        <form id="theForm" onSubmit={handleSubmit}>
            <div className="px-4 mt-5 mb-6 flex flex-col gap-5">
                {fields.map((field, key) => {
                    if (field.show && !field.show(data)) return;

                    return (
                        <PierFormField
                            key={key}
                            field={field}
                            onChange={(newProps) =>
                                setData({ ...data, ...newProps })
                            }
                        />
                    );
                })}
            </div>

            <button ref={submitButtonRef} type="submit" className="hidden" />
        </form>
    );
};

export default function FormPane({ page, children }) {
    const { popCurrentSpotlightPage } = useAppContext();
    const handleSuccess = (...args) => {
        popCurrentSpotlightPage();
        if (typeof page.onSuccess == "function") page.onSuccess(...args);
    };

    if (page.fields) {
        return (
            <ActionPane page={page}>
                <FormWithFields page={page} />
            </ActionPane>
        );
    }

    return (
        <>
            <div className="px-4 mt-5">
                {Children.map(children, (child) =>
                    cloneElement(child, {
                        contentOnly: true,
                        onSuccess: handleSuccess,
                    })
                )}
            </div>

            <div className="mt-5 h-12 px-4 flex gap-1 items-center justify-end border-t z-10 relative">
                <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="contentAlpha"
                    onClick={popCurrentSpotlightPage}
                >
                    Cancel
                </Button>

                <Button
                    form={page?.formId}
                    type="submit"
                    size="sm"
                    colorScheme="primary"
                >
                    {page?.action || "Submit"}
                </Button>
            </div>
        </>
    );
}
