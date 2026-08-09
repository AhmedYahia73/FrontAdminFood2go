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
import Select from 'react-select';

const AddPurchaseCategory = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchPurchaseCategory,
        loading: loadingPurchaseCategory,
        data: dataPurchaseCategory,
    } = useGet({
        url: `${apiUrl}/admin/purchase_categories`,
    });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_categories/add`,
    });
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [status, setStatus] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [purchaseCategories, setPurchaseCategories] = useState([]);

    useEffect(() => {
        refetchPurchaseCategory();
    }, [refetchPurchaseCategory]);

    // Update purchaseCategories when `data` changes
    useEffect(() => {
        if (dataPurchaseCategory && dataPurchaseCategory.parent_categories) {
            const subCategoryOptions = dataPurchaseCategory.parent_categories.map((category) => ({
                value: category.id,
                label: category.name,
            }));
            setPurchaseCategories(subCategoryOptions);
        }
    }, [dataPurchaseCategory]);

    // Navigate back after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

    // Toggle status
    const handleStatus = () => {
        setStatus((prev) => (prev === 1 ? 0 : 1));
    };

    // Handle category selection change
    const handleCategoryChange = (selectedOption) => {
        setSelectedCategory(selectedOption);
    };

    // Reset form
    const handleReset = () => {
        setName("");
        setStatus(1);
        setSelectedCategory(null);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name) {
            auth.toastError(t("Enter Category Name"));
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("status", status);
        if (selectedCategory) {
            formData.append("category_id", selectedCategory.value);
        }

        postData(formData, t("Category Added Success"));
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

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
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EFF6FF' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            '&:hover': {
                backgroundColor: '#EFF6FF'
            }
        })
    };

    return (
        <>
            {loadingPost || loadingPurchaseCategory ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-x-2">
                            <button
                                onClick={handleBack}
                                className="transition-colors text-mainColor hover:text-red-700"
                                title={t("Back")}
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Add Category")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleSubmit}>
                        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {/* Name */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Category Name")}:
                                </span>
                                <TextInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("Enter Category Name")}
                                />
                            </div>

                            {/* Category */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Parent Category")}:
                                </span>
                                <Select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    options={purchaseCategories}
                                    placeholder={t("Select Parent Category")}
                                    isClearable
                                    isSearchable
                                    styles={selectStyles}
                                    className="w-full"
                                    noOptionsMessage={() => t("No categories available")}
                                />
                            </div>

                            {/* Status */}
                            <div className="flex items-start justify-start w-full pt-8 gap-x-1">
                                <div className="flex items-center justify-start gap-x-3">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Active")}:
                                    </span>
                                    <Switch handleClick={handleStatus} checked={status} />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full mt-6 gap-x-4">
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

export default AddPurchaseCategory;