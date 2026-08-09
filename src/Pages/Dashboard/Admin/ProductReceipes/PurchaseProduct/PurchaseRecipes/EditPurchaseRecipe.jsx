import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage
} from "../../../../../../Components/Components";
import { useGet } from "../../../../../../Hooks/useGet"; // We still need useGet for lists
import { usePost } from "../../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const EditPurchaseRecipe = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { recipeId } = useParams();
    const { purchaseId } = useParams();
    const location = useLocation();

    // 1. Get initial data from the state passed by the list page
    const initialRecipeData = location.state?.recipeData;
    const productName = location.state?.productName;

    // NOTE: The loading state for the specific recipe is now handled by checking for initialRecipeData

    // *** REMOVED: useGet({ url: `${apiUrl}/admin/recipe/item/${recipeId}` }) ***
    // const { data: dataRecipe } = useGet(...) // This hook is removed

    // Fetch store categories, products, and units (These lists are still needed)
    const {
        refetch: refetchLists,
        loading: loadingLists,
        data: dataLists,
    } = useGet({
        url: `${apiUrl}/admin/purchase_recipe/${purchaseId}`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_recipe/update/${recipeId}`,
    });

    const auth = useAuth();

    // State variables
    const [formData, setFormData] = useState({
        product_id: "",
        unit_id: "",
        weight: "",
        status: 1,
        material_category_id: "",
        material_product_id: ""
    });

    // State to hold the original data for reset
    const [originalFormData, setOriginalFormData] = useState({});

    // 2. Initialize form state using the data passed through location state
    useEffect(() => {
        if (initialRecipeData) {
            const initialData = {
                product_id: initialRecipeData.product?.id || "",
                unit_id: initialRecipeData.unit?.id || "",
                weight: initialRecipeData.weight || "",
                status: initialRecipeData.status || 1,
                material_category_id: initialRecipeData.material_category?.id || "", // Adjusted field name based on PurchaseRecipe display logic
                material_product_id: initialRecipeData.material?.id || "" // Adjusted field name based on PurchaseRecipe display logic
            };
            setFormData(initialData);
            setOriginalFormData(initialData); // Store original data for reset
        }

        // Refetch lists required for dropdowns
        refetchLists();
    }, [initialRecipeData, refetchLists]);


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
        // Reset to the data initially loaded from location state
        setFormData(originalFormData);
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

        // Note: The fields displayed as Category and Material in the list page
        // are used here as material_category_id and material_product_id for the update API.
        if (!formData.material_category_id) {
            auth.toastError(t("Please select a store category"));
            return;
        }
        if (!formData.material_product_id) {
            auth.toastError(t("Please select a store product"));
            return;
        }

        const submitData = {
            product_id: formData.product_id,
            unit_id: formData.unit_id,
            weight: formData.weight,
            status: formData.status,
            material_category_id: formData.material_category_id,
            material_product_id: formData.material_product_id
        };

        postData(submitData, "Recipe Updated Successfully");
    };

    // Prepare options for selects
    const unitOptions = dataLists?.units?.map(unit => ({
        value: unit.id,
        label: unit.name
    })) || [];

    const storeCategoryOptions = dataLists?.material_categories?.map(category => ({
        value: category.id,
        label: category.name
    })) || [];

    const storeProductOptions = dataLists?.material_products?.map(product => ({
        value: product.id,
        label: product.name
    })) || [];

    // Check if initial recipe data is missing OR if lists are loading
    if (!initialRecipeData || loadingLists) {
        // If recipe data is missing, we can't edit. Wait for lists if needed, or show a load/error.
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

    // Helper to find the currently selected value for Select components
    const findSelectedOption = (options, value) =>
        options.find(option => option.value === value);

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
                    <TitlePage
                        text={`${t("Edit Recipe")}${productName ? `: ${productName}` : ""}`}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="sm:py-3 lg:py-6">
                    <div className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row">
                        {/* Store Category Selection (Maps to material_category from list data) */}
                        <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Category")} *
                            </span>
                            <Select
                                options={storeCategoryOptions}
                                value={findSelectedOption(storeCategoryOptions, formData.material_category_id)}
                                onChange={(selected) => handleInputChange('material_category_id', selected?.value || "")}
                                placeholder={t("Select Category")}
                                className="w-full"
                                classNamePrefix="select"
                                isClearable
                                styles={selectStyles}
                            />
                        </div>

                        {/* Store Product Selection (Maps to material from list data) */}
                        <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Material")} *
                            </span>
                            <Select
                                options={storeProductOptions}
                                value={findSelectedOption(storeProductOptions, formData.material_product_id)}
                                onChange={(selected) => handleInputChange('material_product_id', selected?.value || "")}
                                placeholder={t("Select Material")}
                                className="w-full"
                                classNamePrefix="select"
                                isClearable
                                styles={selectStyles}
                            />
                        </div>

                        {/* Unit Selection */}
                        <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Unit")} *
                            </span>
                            <Select
                                options={unitOptions}
                                value={findSelectedOption(unitOptions, formData.unit_id)}
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

export default EditPurchaseRecipe;