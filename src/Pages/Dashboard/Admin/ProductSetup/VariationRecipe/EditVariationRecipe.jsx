import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { IoArrowBack, IoSave } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import { toast } from "react-toastify";
import { LoaderLogin, Loading, StaticLoader, Switch } from "../../../../../Components/Components";
import Select from "react-select";
import { useAuth } from "../../../../../Context/Auth";

const EditVariationRecipe = () => {
    // recipeId corresponds to the :optionId param in router, strictly it is the recipe ID now.
    const { optionId: recipeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");

    // Passed from VariationRecipe list
    const recipeData = location.state?.recipe || {};
    const variationName = location.state?.variationName || "";
    const optionName = location.state?.optionName || "";
    const variationId = location.state?.variationId || "";

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Fetch form data (categories, products, units)
    const { data: formData, loading: loadingForm } = useGet({
        url: `${apiUrl}/admin/variation_recipe/lists?locale=${selectedLanguage}`,
    });

    // Update Endpoint
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/variation_recipe/update/${recipeId}`,
    });

    const [storeCategories, setStoreCategories] = useState([]);
    const [storeProducts, setStoreProducts] = useState([]);
    const [units, setUnits] = useState([]);

    // Form State
    const [storeCategoryId, setStoreCategoryId] = useState("");
    const [storeProductId, setStoreProductId] = useState("");
    const [unitId, setUnitId] = useState("");
    const [weight, setWeight] = useState("");
    const [status, setStatus] = useState(1);

    useEffect(() => {
        if (formData) {
            setStoreCategories(formData.store_categories || []);
            setStoreProducts(formData.store_products || []);
            setUnits(formData.units || []);
        }
    }, [formData]);

    // Initialize Form Data
    useEffect(() => {
        if (recipeData && Object.keys(recipeData).length > 0) {
            // Check for nested objects or direct IDs
            setStoreCategoryId(recipeData.store_category?.id || recipeData.store_category_id || "");
            setStoreProductId(recipeData.store_product?.id || recipeData.store_product_id || "");
            setUnitId(recipeData.unit?.id || recipeData.unit_id || "");
            setWeight(recipeData.weight || "");
            setStatus(recipeData.status ?? 1);
        }
    }, [recipeData]);

    useEffect(() => {
        if (response) {
            toast.success(t("Recipe updated successfully"));
            navigate(-1);
        }
    }, [response, navigate, t]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append("store_category_id", storeCategoryId);
        formDataToSend.append("store_product_id", storeProductId);
        formDataToSend.append("unit_id", unitId);
        formDataToSend.append("weight", weight);
        formDataToSend.append("status", status);
        formDataToSend.append("variations", variationId);

        postData(formDataToSend);
    };

    if (loadingForm) {
        return <LoaderLogin />;
    }

    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '48px',
            borderRadius: '0.75rem',
            borderColor: '#e5e7eb',
            fontSize: '0.95rem',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#E3001C', // mainColor
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#E3001C' : state.isFocused ? '#FFF5F5' : 'white',
            color: state.isSelected ? 'white' : 'black',
        })
    };

    const getSelectedValue = (id, list) => {
        if (!id) return null;
        const item = list.find(l => String(l.id) === String(id));
        return item ? { value: item.id, label: item.name } : null;
    };

    return (
        <div className="w-full min-h-screen bg-gray-50/50 p-2 md:p-6 flex flex-col items-center">

            {/* Header Card */}
            <div className="w-full bg-white rounded-2xl shadow-sm p-2 md:p-6 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 md:p-3 bg-gray-50 rounded-xl text-gray-600 hover:bg-mainColor hover:text-white transition-all shadow-sm"
                    >
                        <IoArrowBack size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg md:text-2xl font-bold text-gray-800">
                            {t("Edit Recipe")}
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                            {t("Variation")}: <span className="font-semibold text-mainColor">{variationName}</span> • {t("Option")}: <span className="font-semibold text-mainColor">{optionName}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Category */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t("Store Category")}</label>
                            <Select
                                options={storeCategories.map(c => ({ value: c.id, label: c.name }))}
                                value={getSelectedValue(storeCategoryId, storeCategories)}
                                onChange={(val) => {
                                    setStoreCategoryId(val?.value);
                                    setStoreProductId(""); // Reset product on category change
                                }}
                                styles={selectStyles}
                                placeholder={t("Select Category...")}
                                required
                            />
                        </div>

                        {/* Product */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t("Store Product")}</label>
                            <Select
                                options={storeProducts
                                    .filter(p => !storeCategoryId || String(p.store_category_id) === String(storeCategoryId))
                                    .map(p => ({ value: p.id, label: p.name }))}
                                value={getSelectedValue(storeProductId, storeProducts)}
                                onChange={(val) => setStoreProductId(val?.value)}
                                styles={selectStyles}
                                placeholder={t("Select Product...")}
                                isDisabled={!storeCategoryId}
                                noOptionsMessage={() => storeCategoryId ? t("No products found") : t("Select category first")}
                                required
                            />
                        </div>


                        {/* Unit */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t("Unit")}</label>
                            <Select
                                options={units.map(u => ({ value: u.id, label: u.name }))}
                                value={getSelectedValue(unitId, units)}
                                onChange={(val) => setUnitId(val?.value)}
                                styles={selectStyles}
                                placeholder={t("Select Unit")}
                                required
                            />
                        </div>

                        {/* Weight */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t("Weight")}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full h-[48px] px-4 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor outline-none transition-all"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        {/* Status Switch */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <label className="text-gray-700 font-bold">{t("Status")}:</label>
                            <Switch
                                checked={status === 1 || status === '1'}
                                handleClick={() => setStatus((status === 1 || status === '1') ? 0 : 1)}
                            />
                            <span className="text-sm text-gray-500">
                                {(status === 1 || status === '1') ? t("Active") : t("Inactive")}
                            </span>
                        </div>
                    </div>

                    <div className="w-full flex justify-end gap-4">
                        <button
                            type="submit"
                            disabled={loadingPost}
                            className={`mt-4 ${loadingPost ? "bg-white" : "bg-mainColor"} text-white py-4 px-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0`}
                        >
                            {loadingPost ? (
                                <StaticLoader />
                            ) : (
                                <>
                                    <IoSave size={24} />
                                    {t("Save Updates")}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVariationRecipe;
