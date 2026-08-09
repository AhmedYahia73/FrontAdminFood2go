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
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import Select from 'react-select';

const EditMaterialCategory = () => {
    const { materialCategoryId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const {
        refetch: refetchMaterialCategory,
        loading: loadingMaterialCategory,
        data: dataMaterialCategory
    } = useGet({
        url: `${apiUrl}/admin/material_categories/item/${materialCategoryId}`,
    });

    const {
        refetch: refetchAllMaterialCategories,
        loading: loadingAllMaterialCategories,
        data: dataAllMaterialCategories,
    } = useGet({
        url: `${apiUrl}/admin/material_categories`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/material_categories/update/${materialCategoryId}`,
    });

    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [status, setStatus] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [materialCategories, setMaterialCategories] = useState([]);

    // Set form fields when material category data is available
    useEffect(() => {
        if (dataMaterialCategory && dataMaterialCategory.category) {
            const category = dataMaterialCategory.category;

            setName(category.name || "");
            setStatus(category.status || 1);

            // Find the selected category from available options
            if (category.category_id && materialCategories.length > 0) {
                const foundCategory = materialCategories.find(
                    cat => cat.value === category.category_id
                );
                setSelectedCategory(foundCategory || null);
            }
        }
    }, [dataMaterialCategory, materialCategories]);

    // Update material categories dropdown when data changes
    useEffect(() => {
        if (dataAllMaterialCategories && dataAllMaterialCategories.parent_categories) {
            const subCategoryOptions = dataAllMaterialCategories.parent_categories.map((category) => ({
                value: category.id,
                label: category.name,
            }));
            setMaterialCategories(subCategoryOptions);

            // Set selected category after options are loaded
            if (dataMaterialCategory && dataMaterialCategory.category) {
                const currentCategory = dataMaterialCategory.category;
                if (currentCategory.category_id) {
                    const foundCategory = subCategoryOptions.find(
                        cat => cat.value === currentCategory.category_id
                    );
                    setSelectedCategory(foundCategory || null);
                }
            }
        }
    }, [dataAllMaterialCategories, dataMaterialCategory]);

    useEffect(() => {
        refetchMaterialCategory();
        refetchAllMaterialCategories();
    }, [refetchMaterialCategory, refetchAllMaterialCategories]);

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

    // Reset form to original values
    const handleReset = () => {
        if (dataMaterialCategory && dataMaterialCategory.category) {
            const category = dataMaterialCategory.category;

            setName(category.name || "");
            setStatus(category.status || 1);

            // Reset selected category
            if (category.category_id && materialCategories.length > 0) {
                const foundCategory = materialCategories.find(
                    cat => cat.value === category.category_id
                );
                setSelectedCategory(foundCategory || null);
            } else {
                setSelectedCategory(null);
            }
        }
    };

    // Handle form submission
    const handleUpdate = (e) => {
        e.preventDefault();

        if (!name) {
            auth.toastError(t("Enter Material Category Name"));
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("status", status);
        if (selectedCategory) {
            formData.append("category_id", selectedCategory.value);
        }
        postData(formData, t("Material Category Updated Success"));
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
            {loadingPost || loadingMaterialCategory || loadingAllMaterialCategories ? (
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
                            <TitlePage text={t("Edit Material Category")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleUpdate}>
                        <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {/* Name */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Material Category Name")}:
                                </span>
                                <TextInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("Enter Name")}
                                />
                            </div>

                            {/* Category */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Category")}:
                                </span>
                                <Select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    options={materialCategories}
                                    placeholder={t("Select Category")}
                                    isClearable
                                    isSearchable
                                    styles={selectStyles}
                                    className="w-full"
                                    noOptionsMessage={() => t("No categories available")}
                                />
                            </div>

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
                                    text={t("Update")}
                                    rounded="rounded-full"
                                    handleClick={handleUpdate}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default EditMaterialCategory;