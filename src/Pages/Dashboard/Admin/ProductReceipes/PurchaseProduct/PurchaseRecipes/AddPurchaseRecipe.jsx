import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage
} from "../../../../../../Components/Components";
import { useGet } from "../../../../../../Hooks/useGet";
import { usePost } from "../../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

const AddPurchaseRecipe = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { purchaseId } = useParams();

    // Fetch store categories, products, and units
    const {
        refetch: refetchLists,
        loading: loadingLists,
        data: dataLists,
    } = useGet({
        url: `${apiUrl}/admin/purchase_recipe/${purchaseId}`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_recipe/add`,
    });

    const auth = useAuth();

    // State variables
    const [formData, setFormData] = useState({
        product_id: purchaseId || "",
        unit_id: "",
        weight: "",
        status: 1,
        material_category_id: "",
        material_product_id: ""
    });

    useEffect(() => {
        refetchLists();
    }, [refetchLists]);

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
        setFormData({
            product_id: purchaseId || "",
            unit_id: "",
            weight: "",
            status: 1,
            material_category_id: "",
            material_product_id: ""
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (response && response.status === 200 && !loadingPost) {
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

        postData(submitData, "Recipe Added Successfully");
    };

    // Prepare options for selects
    const productName = dataLists?.product?.name;
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
        <>
            {loadingLists || loadingPost ? (
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
                            <TitlePage text={`${t("Add Recipe")}${productName ? `: ${productName}` : ""}`} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="sm:py-3 lg:py-6">
                            <div className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row">

                                {/* Store Category Selection */}
                                <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Category")} *
                                    </span>
                                    <Select
                                        options={storeCategoryOptions}
                                        value={storeCategoryOptions.find(option => option.value === formData.material_category_id)}
                                        onChange={(selected) => handleInputChange('material_category_id', selected?.value || "")}
                                        placeholder={t("Select Category")}
                                        className="w-full"
                                        classNamePrefix="select"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                </div>

                                {/* Store Product Selection */}
                                <div className="sm:w-full lg:w-[48%] flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Material")} *
                                    </span>
                                    <Select
                                        options={storeProductOptions}
                                        value={storeProductOptions.find(option => option.value === formData.material_product_id)}
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
                                    text={t("Submit")}
                                    rounded="rounded-full"
                                    loading={loadingPost}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default AddPurchaseRecipe;