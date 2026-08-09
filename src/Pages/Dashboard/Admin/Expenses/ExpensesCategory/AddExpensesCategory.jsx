import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";

const AddExpensesCategory = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchTranslation,
        loading: loadingTranslation,
        data: dataTranslation,
    } = useGet({
        url: `${apiUrl}/admin/translation`,
    });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/expenses_category/add`,
    });
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [names, setNames] = useState("");
    const [status, setStatus] = useState(1);
    const [taps, setTaps] = useState([]);

    useEffect(() => {
        refetchTranslation();
    }, [refetchTranslation]);

    useEffect(() => {
        if (dataTranslation?.translation) {
            setTaps(dataTranslation.translation);
            // Initialize names array with translation data
            const initialNames = dataTranslation.translation.map(tap => ({
                name: "",
                tranlation_id: tap.id,
                tranlation_name: tap.name
            }));
            setNames(initialNames);
        }
    }, [dataTranslation]);

    // Navigate back after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

    // Handle name input change for specific language
    const handleNameChange = (index, value) => {
        setNames(prev => {
            const updatedNames = [...prev];
            updatedNames[index] = {
                ...updatedNames[index],
                name: value
            };
            return updatedNames;
        });
    };

    // Toggle status
    const handleStatus = () => {
        setStatus((prev) => (prev === 1 ? 0 : 1));
    };

    // Reset form
    const handleReset = () => {
        setNames(taps.map(tap => ({
            name: "",
            tranlation_id: tap.id,
            tranlation_name: tap.name
        })));
        setStatus(1);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate that all names are filled
        const emptyName = names.find(item => !item.name || item.name.trim() === "");
        if (emptyName) {
            auth.toastError(t("enterListNames"));
            return;
        }
        const formData = new FormData();
        // Add names in the required format
        names.forEach((nameObj, index) => {
            formData.append(`names[${index}][name]`, nameObj.name);
            formData.append(`names[${index}][tranlation_id]`, nameObj.tranlation_id);
            formData.append(`names[${index}][tranlation_name]`, nameObj.tranlation_name);
        });
        formData.append("status", status);

        postData(formData, t("Expenses Category Added Success"));
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <>
            {loadingPost || loadingTranslation ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-x-2">
                            <button
                                onClick={handleBack}
                                className="text-mainColor hover:text-red-700 transition-colors"
                                title={t("Back")}
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Add Expenses Category")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleSubmit}>
                        <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {/* Name Inputs for each language */}
                            {taps.map((tap, index) => (
                                <div
                                    key={tap.id}
                                    className="w-full flex flex-col items-start justify-center gap-y-1"
                                >
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Category Name")} ({tap.name}):
                                    </span>
                                    <TextInput
                                        value={names[index]?.name || ""}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        placeholder={`${t("Category Name")} ${tap.name}`}
                                    />
                                </div>
                            ))}
                            {/* Status */}
                            <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                                <div className="flex items-center justify-start gap-x-3">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Active")}:
                                    </span>
                                    <Switch handleClick={handleStatus} checked={status} />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full gap-x-4 mt-6">
                            <div>
                                <StaticButton
                                    text={t("Reset")}
                                    handleClick={handleReset}
                                    bgColor="bg-transparent"
                                    Color="text-mainColor"
                                    border="border-2"
                                    borderColor="border-mainColor"
                                    rounded="rounded-full"
                                />
                            </div>
                            <div>
                                <SubmitButton
                                    text={t("Submit")}
                                    rounded="rounded-full"
                                    handleClick={handleSubmit}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default AddExpensesCategory;