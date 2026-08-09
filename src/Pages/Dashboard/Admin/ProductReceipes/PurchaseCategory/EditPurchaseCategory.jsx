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

const EditPurchaseCategory = () => {
    const { purchaseCategoryId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const {
        refetch: refetchPurchaseCategory,
        loading: loadingPurchaseCategory,
        data: dataPurchaseCategory
    } = useGet({
        url: `${apiUrl}/admin/purchase_categories/item/${purchaseCategoryId}`,
    });

    const {
        refetch: refetchAllPurchaseCategories,
        loading: loadingAllPurchaseCategories,
        data: dataAllPurchaseCategories,
    } = useGet({
        url: `${apiUrl}/admin/purchase_categories`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_categories/update/${purchaseCategoryId}`,
    });

    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [status, setStatus] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [purchaseCategories, setPurchaseCategories] = useState([]);

    // Set form fields when purchase category data is available
    useEffect(() => {
        if (dataPurchaseCategory && dataPurchaseCategory.category) {
            const category = dataPurchaseCategory.category;

            setName(category.name || "");
            setStatus(category.status || 1);

            // Find the selected category from available options
            // if (category.category_id && purchaseCategories.length > 0) {
            //     const foundCategory = purchaseCategories.find(
            //         cat => cat.value === category.category_id
            //     );
            //     setSelectedCategory(foundCategory || null);
            // }
        }
    }, [dataPurchaseCategory, purchaseCategories]);

    // Update purchase categories dropdown when data changes
    // Update material categories dropdown when data changes
    useEffect(() => {
        if (dataAllPurchaseCategories && dataPurchaseCategory?.category) {
            const currentCategory = dataPurchaseCategory.category;
            const parentCategories = dataAllPurchaseCategories.parent_categories || [];

            let options = [];

            // Case 1: There are parent categories → map them
            if (parentCategories.length > 0) {
                options = parentCategories.map((category) => ({
                    value: category.id,
                    label: category.name,
                }));
            }

            // Case 2: No parent categories, but current item has category_id
            // → Add it manually so it can be selected/shown
            if (parentCategories.length === 0 && currentCategory.category_id) {
                options.push({
                    value: currentCategory?.category.id,
                    label: currentCategory?.category.name,
                    isDisabled: true, // Optional: make it non-selectable if not in list
                });
            }

            // Case 3: No parents AND no category_id → show placeholder
            if (options.length === 0) {
                options.push({
                    value: null,
                    label: t("category"),
                    isDisabled: true,
                });
            }

            setPurchaseCategories(options);

            // Set selected category (only if it matches one of the options)
            if (currentCategory.category_id) {
                const found = options.find(opt => opt.value === currentCategory.category_id);
                setSelectedCategory(found || null);
            } else {
                setSelectedCategory(null);
            }
        }
    }, [dataAllPurchaseCategories, dataPurchaseCategory, t]);

    useEffect(() => {
        refetchPurchaseCategory();
        refetchAllPurchaseCategories();
    }, [refetchPurchaseCategory, refetchAllPurchaseCategories]);

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
        if (dataPurchaseCategory && dataPurchaseCategory.category) {
            const category = dataPurchaseCategory.category;

            setName(category.name || "");
            setStatus(category.status || 1);

            // Reset selected category
            if (category.category_id && purchaseCategories.length > 0) {
                const foundCategory = purchaseCategories.find(
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
            auth.toastError(t("Enter Category Name"));
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("status", status);
        if (selectedCategory) {
            formData.append("category_id", selectedCategory.value);
        }

        postData(formData, t("Category Updated Success"));
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
            {loadingPost || loadingPurchaseCategory || loadingAllPurchaseCategories ? (
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
                            <TitlePage text={t("Edit Category")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleUpdate}>
                        <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {/* Name */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
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
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
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

export default EditPurchaseCategory;