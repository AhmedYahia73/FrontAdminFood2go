import React, { useEffect, useState } from "react";
import {
    StaticLoader,
    SubmitButton,
    TitlePage,
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';

const ReceiptLanguage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    // Get language settings
    const {
        refetch: refetchLanguageSettings,
        loading: loadingSettings,
        data: dataSettings,
    } = useGet({
        url: `${apiUrl}/admin/settings/lang_setting`,
    });

    // Update language settings
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/settings/lang_setting/update`,
    });

    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [initialLanguage, setInitialLanguage] = useState(null);

    // Language options
    const languageOptions = [
        { value: 'ar', label: 'العربية' },
        { value: 'en', label: 'English' }
    ];

    useEffect(() => {
        refetchLanguageSettings();
    }, [refetchLanguageSettings]);

    // Set form fields when settings data is available
    useEffect(() => {
        if (dataSettings && dataSettings.lang) {
            const currentLang = dataSettings.lang;
            const foundLanguage = languageOptions.find(option => option.value === currentLang);

            setSelectedLanguage(foundLanguage || null);
            setInitialLanguage(foundLanguage || null);
        }
    }, [dataSettings]);

    // Navigate back after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            refetchLanguageSettings();
        }
    }, [response, loadingPost, auth, t]);

    // Handle language selection change
    const handleLanguageChange = (selectedOption) => {
        setSelectedLanguage(selectedOption);
    };

    // Reset form to original values
    const handleReset = () => {
        setSelectedLanguage(initialLanguage);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedLanguage) {
            auth.toastError(t("Please select a language"));
            return;
        }

        const formData = new FormData();
        formData.append("lang", selectedLanguage.value);

        postData(formData, t("Receipt language updated successfully"));
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Check if form has changes
    const hasChanges = selectedLanguage?.value !== initialLanguage?.value;

    // Custom styles for react-select
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF'
            },
            minHeight: '50px'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? '#3B82F6'
                : state.isFocused
                    ? '#EFF6FF'
                    : 'white',
            color: state.isSelected
                ? 'white'
                : state.isFocused
                    ? '#1F2937'  // Dark color when focused/hovered
                    : '#374151', // Default dark color
            padding: '12px 16px',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#EFF6FF',
                color: '#1F2937' // Ensure dark text on hover
            },
            '&:active': {
                backgroundColor: '#3B82F6',
                color: 'white'
            }
        }),
        singleValue: (base) => ({
            ...base,
            fontSize: '16px',
            fontWeight: '500'
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '16px',
            color: '#9CA3AF'
        })
    };

    return (
        <>
            {loadingSettings || loadingPost ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="w-full pb-12">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-x-3">
                            <button
                                onClick={handleBack}
                                className="flex items-center justify-center w-10 h-10 text-mainColor hover:text-red-700 transition-colors rounded-full hover:bg-gray-100"
                                title={t("Back")}
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Receipt Language Settings")} />
                        </div>
                    </div>

                    {/* Form */}
                    <form className="p-6" onSubmit={handleSubmit}>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {/* Form Header */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <h2 className="text-xl font-TextFontSemiBold text-mainColor">
                                    {t("Select Receipt Language")}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {t("Choose the language that will be used for printing receipts")}
                                </p>
                            </div>

                            {/* Form Content */}
                            <div className="p-6">
                                <div className="max-w-md">
                                    <div className="w-full flex flex-col items-start justify-center gap-y-3">
                                        <label className="text-lg font-TextFontMedium text-thirdColor">
                                            {t("Receipt Language")}:
                                        </label>
                                        <Select
                                            value={selectedLanguage}
                                            onChange={handleLanguageChange}
                                            options={languageOptions}
                                            placeholder={t("Select language")}
                                            isClearable={false}
                                            isSearchable={false}
                                            styles={selectStyles}
                                            className="w-full"
                                            noOptionsMessage={() => t("No languages available")}
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            {t("This language will be used for all printed receipts and thermal printer outputs")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Footer */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                                <div className="flex items-center gap-3">
                                    {hasChanges && (
                                        <span className="text-sm text-orange-600 font-TextFontMedium">
                                            {t("You have unsaved changes")}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={!hasChanges}
                                        className="px-6 py-2.5 text-mainColor font-TextFontMedium border-2 border-mainColor rounded-full hover:bg-mainColor hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t("Reset")}
                                    </button>

                                    <SubmitButton
                                        text={t("Save Changes")}
                                        rounded="rounded-full"
                                        handleClick={handleSubmit}
                                        disabled={!hasChanges || loadingPost}
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </section>
            )}
        </>
    );
};

export default ReceiptLanguage;