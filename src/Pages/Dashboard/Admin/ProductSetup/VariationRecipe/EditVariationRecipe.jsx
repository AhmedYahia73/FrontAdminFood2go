import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { IoArrowBack, IoSave } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import { toast } from "react-toastify";
import { LoaderLogin, StaticLoader, Switch } from "../../../../../Components/Components";
import Select from "react-select";
import { useAuth } from "../../../../../Context/Auth";

const EditVariationRecipe = () => {
    // recipeId corresponds to the :optionId param in router
    const { optionId: recipeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const auth = useAuth();
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");

    // Passed from VariationRecipe list if navigated internally
    const stateRecipe = location.state?.recipe || null;
    const initialVariationName = location.state?.variationName || "";
    const initialOptionName = location.state?.optionName || "";

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Fetch form data (categories, products, units)
    const { data: formData, loading: loadingForm } = useGet({
        url: `${apiUrl}/admin/variation_recipe/lists?locale=${selectedLanguage}`,
    });

    // Fetch single recipe details via recipe_item endpoint
    const { data: itemData, loading: loadingItem } = useGet({
        url: `${apiUrl}/admin/variation_recipe/recipe_item/${recipeId}?locale=${selectedLanguage}`,
    });

    // Update Endpoint
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/variation_recipe/update/${recipeId}`,
        type: true,
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
    const [variationName, setVariationName] = useState(initialVariationName);
    const [optionName, setOptionName] = useState(initialOptionName);

    useEffect(() => {
        if (formData) {
            setStoreCategories(formData.store_categories || []);
            setStoreProducts(formData.store_products || []);
            setUnits(formData.units || []);
        }
    }, [formData]);

    // Initialize Form Data from itemData (or fallback to stateRecipe)
    useEffect(() => {
        const recipeSource = itemData?.id ? itemData : stateRecipe;
        if (recipeSource) {
            const catId =
                recipeSource.store_category?.id ||
                recipeSource.store_category_id ||
                "";
            const prodId =
                recipeSource.store_product?.id ||
                recipeSource.store_product_id ||
                "";
            const uId = recipeSource.unit?.id || recipeSource.unit_id || "";

            setStoreCategoryId(catId);
            setStoreProductId(prodId);
            setUnitId(uId);
            setWeight(recipeSource.weight ?? "");
            setStatus(recipeSource.status ?? 1);

            if (recipeSource.variation) {
                setVariationName(recipeSource.variation);
            }
            if (recipeSource.option) {
                setOptionName(recipeSource.option);
            }
        }
    }, [itemData, stateRecipe]);

    useEffect(() => {
        if (response) {
            navigate(-1);
        }
    }, [response, navigate]);

    // When Category changes, reset selected product if not in this category
    const handleCategoryChange = (val) => {
        const newCatId = val?.value || "";
        setStoreCategoryId(newCatId);

        const currentProd = storeProducts.find(
            (p) => String(p.id) === String(storeProductId)
        );
        if (
            !currentProd ||
            (newCatId &&
                String(currentProd.category_id || currentProd.store_category_id) !==
                    String(newCatId))
        ) {
            setStoreProductId("");
        }
    };

    // When Product changes directly, auto-select its category if empty
    const handleProductChange = (val) => {
        const newProdId = val?.value || "";
        setStoreProductId(newProdId);

        if (newProdId && !storeCategoryId) {
            const prod = storeProducts.find(
                (p) => String(p.id) === String(newProdId)
            );
            if (prod && (prod.category_id || prod.store_category_id)) {
                setStoreCategoryId(prod.category_id || prod.store_category_id);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!storeCategoryId) {
            auth.toastError(t("Please select a store category"));
            return;
        }
        if (!storeProductId) {
            auth.toastError(t("Please select a store product"));
            return;
        }
        if (!unitId) {
            auth.toastError(t("Please select a unit"));
            return;
        }
        if (!weight || Number(weight) <= 0) {
            auth.toastError(t("Please enter valid weight"));
            return;
        }

        const payload = {
            store_category_id: Number(storeCategoryId),
            store_product_id: Number(storeProductId),
            unit_id: Number(unitId),
            weight: Number(weight),
            status: status === 1 || status === "1" ? 1 : 0,
        };

        postData(payload, t("Recipe updated successfully"));
    };

    if (loadingForm || (loadingItem && !stateRecipe)) {
        return <LoaderLogin />;
    }

    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: "48px",
            borderRadius: "0.75rem",
            borderColor: "#e5e7eb",
            fontSize: "0.95rem",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#E3001C", // mainColor
            },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#E3001C"
                : state.isFocused
                ? "#FFF5F5"
                : "white",
            color: state.isSelected ? "white" : "black",
        }),
    };

    const getSelectedValue = (id, list) => {
        if (!id) return null;
        const item = list.find((l) => String(l.id) === String(id));
        return item ? { value: item.id, label: item.name } : null;
    };

    // Filter products by selected category
    const filteredProducts = storeProducts.filter(
        (p) =>
            !storeCategoryId ||
            String(p.category_id || p.store_category_id) === String(storeCategoryId)
    );

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
                        {(variationName || optionName) && (
                            <p className="text-xs md:text-sm text-gray-500 mt-1">
                                {variationName && (
                                    <>
                                        {t("Variation")}:{" "}
                                        <span className="font-semibold text-mainColor">
                                            {variationName}
                                        </span>{" "}
                                    </>
                                )}
                                {optionName && (
                                    <>
                                        • {t("Option")}:{" "}
                                        <span className="font-semibold text-mainColor">
                                            {optionName}
                                        </span>
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                {t("Store Category")}
                            </label>
                            <Select
                                options={storeCategories.map((c) => ({
                                    value: c.id,
                                    label: c.name,
                                }))}
                                value={getSelectedValue(storeCategoryId, storeCategories)}
                                onChange={handleCategoryChange}
                                styles={selectStyles}
                                placeholder={t("Select Category...")}
                                isClearable
                                required
                            />
                        </div>

                        {/* Product */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                {t("Store Product")}
                            </label>
                            <Select
                                options={filteredProducts.map((p) => ({
                                    value: p.id,
                                    label: p.name,
                                }))}
                                value={getSelectedValue(storeProductId, storeProducts)}
                                onChange={handleProductChange}
                                styles={selectStyles}
                                placeholder={
                                    storeCategoryId
                                        ? t("Select Product...")
                                        : t("Select category first")
                                }
                                isDisabled={!storeCategoryId}
                                noOptionsMessage={() =>
                                    storeCategoryId
                                        ? t("No products found")
                                        : t("Select category first")
                                }
                                isClearable
                                required
                            />
                        </div>

                        {/* Unit */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                {t("Unit")}
                            </label>
                            <Select
                                options={units.map((u) => ({
                                    value: u.id,
                                    label: u.name,
                                }))}
                                value={getSelectedValue(unitId, units)}
                                onChange={(val) => setUnitId(val?.value || "")}
                                styles={selectStyles}
                                placeholder={t("Select Unit")}
                                required
                            />
                        </div>

                        {/* Weight */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                {t("Weight")}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
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
                                checked={status === 1 || status === "1"}
                                handleClick={() =>
                                    setStatus((status === 1 || status === "1") ? 0 : 1)
                                }
                            />
                            <span className="text-sm text-gray-500">
                                {status === 1 || status === "1" ? t("Active") : t("Inactive")}
                            </span>
                        </div>
                    </div>

                    <div className="w-full flex justify-end gap-4">
                        <button
                            type="submit"
                            disabled={loadingPost}
                            className={`mt-4 ${
                                loadingPost ? "bg-white" : "bg-mainColor"
                            } text-white py-4 px-8 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0`}
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
