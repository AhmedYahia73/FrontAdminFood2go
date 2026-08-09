import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

const EditRecipes = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { recipeId } = useParams();

    // Fetch recipe data
    const {
        refetch: refetchRecipe,
        loading: loadingRecipe,
        data: dataRecipe,
    } = useGet({
        url: `${apiUrl}/admin/recipe/item/${recipeId}`,
    });

    // Fetch store categories, products, and units
    const {
        refetch: refetchLists,
        loading: loadingLists,
        data: dataLists,
    } = useGet({
        url: `${apiUrl}/admin/recipe/lists`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/recipe/update/${recipeId}`,
    });

    const auth = useAuth();

    // State variables
    const [formData, setFormData] = useState({
        product_id: "",
        unit_id: "",
        weight: "",
        status: 1,
        store_category_id: "",
        store_product_id: ""
    });

    useEffect(() => {
        refetchRecipe();
        refetchLists();
    }, [refetchRecipe, refetchLists, recipeId]);

    // Update form when recipe data is loaded
    useEffect(() => {
        if (dataRecipe) {
            setFormData(prev => ({
                ...prev,
                product_id: dataRecipe.product?.id || "",
                unit_id: dataRecipe.unit?.id || "",
                weight: dataRecipe.weight || "",
                status: dataRecipe.status || 1,
                store_category_id: dataRecipe.store_category?.id || "",
                store_product_id: dataRecipe.store_product?.id || ""
            }));
        }
    }, [dataRecipe]);

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleStatusChange = () => {
        setFormData(prev => ({
            ...prev,
            status: prev.status === 1 ? 0 : 1
        }));
    };

    const handleReset = () => {
        if (dataRecipe && dataRecipe.recipe) {
            const recipe = dataRecipe.recipe;
            setFormData({
                product_id: recipe.product_id || "",
                unit_id: recipe.unit_id || "",
                weight: recipe.weight || "",
                status: recipe.status || 1,
                store_category_id: recipe.store_category_id || "",
                store_product_id: recipe.store_product_id || ""
            });
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (response && response.status === 200) {
            handleBack();
        }
    }, [response]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.unit_id) {
            auth.toastError(t("Please select a unit"));
            return;
        }
        if (!formData.weight) {
            auth.toastError(t("Please enter weight"));
            return;
        }
        if (!formData.store_category_id) {
            auth.toastError(t("Please select a store category"));
            return;
        }
        if (!formData.store_product_id) {
            auth.toastError(t("Please select a store product"));
            return;
        }

        const submitData = {
            product_id: formData.product_id,
            unit_id: formData.unit_id,
            weight: formData.weight,
            status: formData.status,
            store_category_id: formData.store_category_id,
            store_product_id: formData.store_product_id
        };

        postData(submitData, "Recipe Updated Successfully");
    };

    // Prepare options for selects
    const unitOptions = dataLists?.units?.map(unit => ({
        value: unit.id,
        label: unit.name
    })) || [];

    const storeCategoryOptions = dataLists?.store_categories?.map(category => ({
        value: category.id,
        label: category.name
    })) || [];

    const storeProductOptions = dataLists?.store_products?.map(product => ({
        value: product.id,
        label: product.name
    })) || [];

    if (loadingRecipe || loadingLists) {
        return (
            <div className="flex items-center justify-center w-full h-56">
                <StaticLoader />
            </div>
        );
    }

    const selectStyles = {
        control: (base) => ({
            ...base,
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "8px",
            fontSize: "14px",
            color: "#333",
            backgroundColor: "#fff",
            boxShadow: "none",
            "&:hover": {
                border: "1px solid #ccc",
            },
        }),
        option: (base) => ({
            ...base,
            color: "#333",
            fontSize: "14px",
            padding: "8px",
            "&:hover": {
                backgroundColor: "#f5f5f5",
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: "#333",
            fontSize: "14px",
        }),
    };

    return (
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
                    <TitlePage text={t("Edit Recipe")} />
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="sm:py-3 lg:py-6">
                    <div className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row">

                        {/* Unit Selection */}
                        <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Unit")} *
                            </span>
                            <Select
                                options={unitOptions}
                                value={unitOptions.find(option => option.value === formData.unit_id)}
                                onChange={(selected) => handleInputChange('unit_id', selected?.value || "")}
                                placeholder={t("Select Unit")}
                                className="w-full"
                                classNamePrefix="select"
                                isClearable
                                styles={selectStyles}
                            />
                        </div>

                        {/* Weight Input */}
                        <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Weight")} *
                            </span>
                            <TextInput
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.weight}
                                onChange={(e) => handleInputChange('weight', e.target.value)}
                                placeholder={t("Enter weight")}
                                required
                            />
                        </div>

                        {/* Store Category Selection */}
                        <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Store Category")} *
                            </span>
                            <Select
                                options={storeCategoryOptions}
                                value={storeCategoryOptions.find(option => option.value === formData.store_category_id)}
                                onChange={(selected) => handleInputChange('store_category_id', selected?.value || "")}
                                placeholder={t("Select Store Category")}
                                className="w-full"
                                classNamePrefix="select"
                                isClearable
                                styles={selectStyles}
                            />
                        </div>

                        {/* Store Product Selection */}
                        <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Store Product")} *
                            </span>
                            <Select
                                options={storeProductOptions}
                                value={storeProductOptions.find(option => option.value === formData.store_product_id)}
                                onChange={(selected) => handleInputChange('store_product_id', selected?.value || "")}
                                placeholder={t("Select Store Product")}
                                className="w-full"
                                classNamePrefix="select"
                                isClearable
                                styles={selectStyles}
                            />
                        </div>

                        {/* Status Switch */}
                        <div className="sm:w-full lg:w-[48%] flex items-center justify-start gap-x-4 pt-6">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Status")}:
                            </span>
                            <Switch
                                handleClick={handleStatusChange}
                                checked={formData.status === 1}
                            />
                            <span className="text-lg text-thirdColor">
                                {formData.status === 1 ? t("Active") : t("Inactive")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end w-full gap-x-4">
                    <div>
                        <StaticButton
                            text={t("Reset")}
                            handleClick={handleReset}
                            bgColor="bg-transparent"
                            Color="text-mainColor"
                            border={"border-2"}
                            borderColor={"border-mainColor"}
                            rounded="rounded-full"
                        />
                    </div>
                    <div>
                        <SubmitButton
                            text={t("Update")}
                            rounded="rounded-full"
                            loading={loadingPost}
                        />
                    </div>
                </div>
            </form>
        </section>
    );
};

export default EditRecipes;