import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { IoArrowBack, IoAddCircle, IoTrash, IoSave } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import { toast } from "react-toastify";
import { LoaderLogin, Switch } from "../../../../../Components/Components";
import Select from "react-select";
import axios from "axios";
import { useAuth } from "../../../../../Context/Auth";

const AddVariationRecipe = () => {
    const { productId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const auth = useAuth();
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");
    const productName = location.state?.productName || "";

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Fetch Variations and Options
    const { data: variationsData, loading: loadingVariations } = useGet({
        url: `${apiUrl}/admin/variation_recipe/view_variations/${productId}?locale=${selectedLanguage}`,
    });

    // Fetch form data (categories, products, units)
    const { data: formData, loading: loadingForm } = useGet({
        url: `${apiUrl}/admin/variation_recipe/lists?locale=${selectedLanguage}`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/variation_recipe/add`,
        type: true
    });

    const [storeCategories, setStoreCategories] = useState([]);
    const [storeProducts, setStoreProducts] = useState([]);
    const [units, setUnits] = useState([]);

    // Multi-Select Options
    const [allOptions, setAllOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);

    // State to hold recipes for each option: { [optionId]: [recipe1, recipe2] }
    const [recipesByOption, setRecipesByOption] = useState({});

    // Ref to track which options have already been fetched from the server
    const loadedOptionsRef = useRef(new Set());

    useEffect(() => {
        if (formData) {
            setStoreCategories(formData.store_categories || []);
            setStoreProducts(formData.store_products || []);
            setUnits(formData.units || []);
        }
    }, [formData]);

    // Flatten Variations -> Options for React Select
    useEffect(() => {
        if (variationsData?.variations) {
            const options = [];
            variationsData.variations.forEach((variation) => {
                variation.options?.forEach((opt) => {
                    options.push({
                        value: opt.id,
                        label: `${variation.name} - ${opt.name}`,
                        optionId: opt.id,
                        variationId: variation.id,
                        variationName: variation.name,
                        optionName: opt.name
                    });
                });
            });
            setAllOptions(options);

            // Handle pre-selected option or variation if navigated from previous page
            const preselectedOptionId = location.state?.preselectedOptionId;
            const preselectedVariationId = location.state?.preselectedVariationId;

            if (preselectedOptionId) {
                const found = options.find((o) => String(o.value) === String(preselectedOptionId));
                if (found) {
                    setSelectedOptions([found]);
                }
            } else if (preselectedVariationId) {
                const matched = options.filter((o) => String(o.variationId) === String(preselectedVariationId));
                if (matched.length > 0) {
                    setSelectedOptions(matched);
                }
            }
        }
    }, [variationsData, location.state]);

    // Helper to create a new empty recipe object
    const createEmptyRecipe = () => ({
        id: 0,
        store_category_id: "",
        store_product_id: "",
        unit_id: "",
        weight: "",
        status: 1,
    });

    // Fetch existing recipes for newly selected options
    useEffect(() => {
        const fetchRecipesForOption = async (optionId) => {
            if (loadedOptionsRef.current.has(optionId)) return;
            loadedOptionsRef.current.add(optionId);

            try {
                const res = await axios.get(
                    `${apiUrl}/admin/variation_recipe/view_recipes/${optionId}?locale=${selectedLanguage}`,
                    {
                        headers: {
                            Authorization: `Bearer ${auth?.userState?.token || ""}`,
                        },
                    }
                );

                if (res.status === 200 && res.data?.recipes && res.data.recipes.length > 0) {
                    const mappedRecipes = res.data.recipes.map((r) => ({
                        id: r.id,
                        store_category_id: r.store_category?.id || r.store_category_id || "",
                        store_product_id: r.store_product?.id || r.store_product_id || "",
                        unit_id: r.unit?.id || r.unit_id || "",
                        weight: r.weight ?? "",
                        status: r.status ?? 1,
                    }));

                    setRecipesByOption((prev) => ({
                        ...prev,
                        [optionId]: mappedRecipes,
                    }));
                } else {
                    // Provide one empty row ready to fill if no recipes exist yet
                    setRecipesByOption((prev) => {
                        if (!prev[optionId] || prev[optionId].length === 0) {
                            return { ...prev, [optionId]: [createEmptyRecipe()] };
                        }
                        return prev;
                    });
                }
            } catch (error) {
                console.error("Error fetching recipes for option", optionId, error);
                setRecipesByOption((prev) => {
                    if (!prev[optionId] || prev[optionId].length === 0) {
                        return { ...prev, [optionId]: [createEmptyRecipe()] };
                    }
                    return prev;
                });
            }
        };

        selectedOptions.forEach((opt) => {
            fetchRecipesForOption(opt.value);
        });
    }, [selectedOptions, apiUrl, selectedLanguage, auth?.userState?.token]);

    useEffect(() => {
        if (response) {
            navigate(-1);
        }
    }, [response, navigate]);

    const addRecipeRow = (optionId) => {
        setRecipesByOption((prev) => ({
            ...prev,
            [optionId]: [...(prev[optionId] || []), createEmptyRecipe()],
        }));
    };

    const removeRecipeRow = (optionId, index) => {
        setRecipesByOption((prev) => ({
            ...prev,
            [optionId]: prev[optionId].filter((_, i) => i !== index),
        }));
    };

    const updateRecipeField = (optionId, index, field, value) => {
        setRecipesByOption((prev) => {
            const updatedRecipes = [...(prev[optionId] || [])];
            updatedRecipes[index] = { ...updatedRecipes[index], [field]: value };
            return { ...prev, [optionId]: updatedRecipes };
        });
    };

    // When Category changes, reset product if not in category
    const handleCategoryChange = (optionId, index, newCategoryId) => {
        setRecipesByOption((prev) => {
            const updatedRecipes = [...(prev[optionId] || [])];
            const currentRecipe = { ...updatedRecipes[index] };
            currentRecipe.store_category_id = newCategoryId || "";

            const currentProd = storeProducts.find(
                (p) => String(p.id) === String(currentRecipe.store_product_id)
            );
            if (
                !currentProd ||
                (newCategoryId &&
                    String(currentProd.category_id || currentProd.store_category_id) !== String(newCategoryId))
            ) {
                currentRecipe.store_product_id = "";
            }

            updatedRecipes[index] = currentRecipe;
            return { ...prev, [optionId]: updatedRecipes };
        });
    };

    // When Product is selected directly, auto-fill category if empty
    const handleProductChange = (optionId, index, newProductId) => {
        setRecipesByOption((prev) => {
            const updatedRecipes = [...(prev[optionId] || [])];
            const currentRecipe = { ...updatedRecipes[index] };
            currentRecipe.store_product_id = newProductId || "";

            if (newProductId && !currentRecipe.store_category_id) {
                const prod = storeProducts.find((p) => String(p.id) === String(newProductId));
                if (prod && (prod.category_id || prod.store_category_id)) {
                    currentRecipe.store_category_id = prod.category_id || prod.store_category_id;
                }
            }

            updatedRecipes[index] = currentRecipe;
            return { ...prev, [optionId]: updatedRecipes };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedOptions.length === 0) {
            auth.toastError(t("Please select at least one option to manage"));
            return;
        }

        const variationMap = {};

        for (const opt of selectedOptions) {
            const optionId = opt.value;
            const variationId = opt.variationId;
            const recipes = recipesByOption[optionId] || [];

            if (recipes.length === 0) {
                auth.toastError(`${t("Please add at least one recipe for")} ${opt.label}`);
                return;
            }

            for (let i = 0; i < recipes.length; i++) {
                const r = recipes[i];
                if (!r.store_category_id) {
                    auth.toastError(`${t("Please select store category in")} ${opt.label} #${i + 1}`);
                    return;
                }
                if (!r.store_product_id) {
                    auth.toastError(`${t("Please select store product in")} ${opt.label} #${i + 1}`);
                    return;
                }
                if (!r.unit_id) {
                    auth.toastError(`${t("Please select unit in")} ${opt.label} #${i + 1}`);
                    return;
                }
                if (!r.weight || Number(r.weight) <= 0) {
                    auth.toastError(`${t("Please enter valid weight in")} ${opt.label} #${i + 1}`);
                    return;
                }

                if (!variationMap[variationId]) {
                    variationMap[variationId] = {
                        id: variationId,
                        options: [],
                    };
                }

                variationMap[variationId].options.push({
                    id: optionId,
                    store_category_id: Number(r.store_category_id),
                    store_product_id: Number(r.store_product_id),
                    unit_id: Number(r.unit_id),
                    weight: Number(r.weight),
                    status: r.status === 1 || r.status === "1" ? 1 : 0,
                });
            }
        }

        const variationsArray = Object.values(variationMap);
        if (variationsArray.length === 0) {
            auth.toastError(t("Please add at least one recipe"));
            return;
        }

        postData({ variations: variationsArray }, t("Recipes saved successfully"));
    };

    if (loadingVariations || loadingForm) {
        return <LoaderLogin />;
    }

    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: "42px",
            borderRadius: "0.5rem",
            borderColor: "#e5e7eb",
            fontSize: "0.875rem",
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100,
            fontSize: "0.875rem",
        }),
    };

    const getSelectedValue = (id, list) => {
        if (!id) return null;
        const item = list.find((l) => String(l.id) === String(id));
        return item ? { value: item.id, label: item.name } : null;
    };

    return (
        <div className="w-full flex flex-col gap-y-3 p-4 pb-20">
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all"
                    >
                        <IoArrowBack size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">
                        {t("Add Variation Recipe")}{" "}
                        {productName && (
                            <span>
                                - <span className="text-mainColor">{productName}</span>
                            </span>
                        )}
                    </h1>
                </div>
            </div>

            <div className="bg-white p-2 md:p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("Select Options to Manage")}
                </label>
                <Select
                    isMulti
                    options={allOptions}
                    value={selectedOptions}
                    onChange={(val) => setSelectedOptions(val || [])}
                    placeholder={t("Choose variation options...")}
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    noOptionsMessage={() => t("No options found")}
                />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {selectedOptions.map((opt) => (
                    <div
                        key={opt.value}
                        className="bg-white rounded-xl shadow-sm p-4 border border-l-4 border-l-mainColor border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h3 className="font-bold text-lg text-gray-800">{opt.label}</h3>
                            <button
                                type="button"
                                onClick={() => addRecipeRow(opt.value)}
                                className="flex items-center gap-1 text-mainColor font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition border border-mainColor"
                            >
                                <IoAddCircle size={20} />
                                {t("Add Recipe")}
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {(recipesByOption[opt.value] || []).map((recipe, index) => {
                                // Filter products by category
                                const filteredProducts = storeProducts.filter(
                                    (p) =>
                                        !recipe.store_category_id ||
                                        String(p.category_id || p.store_category_id) ===
                                            String(recipe.store_category_id)
                                );

                                return (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg relative group"
                                    >
                                        {/* Category */}
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                {t("Store Category")}
                                            </label>
                                            <Select
                                                options={storeCategories.map((c) => ({
                                                    value: c.id,
                                                    label: c.name,
                                                }))}
                                                value={getSelectedValue(
                                                    recipe.store_category_id,
                                                    storeCategories
                                                )}
                                                onChange={(val) =>
                                                    handleCategoryChange(
                                                        opt.value,
                                                        index,
                                                        val?.value
                                                    )
                                                }
                                                styles={selectStyles}
                                                placeholder={t("Select...")}
                                                isClearable
                                                required
                                            />
                                        </div>

                                        {/* Product */}
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                {t("Store Product")}
                                            </label>
                                            <Select
                                                options={filteredProducts.map((p) => ({
                                                    value: p.id,
                                                    label: p.name,
                                                }))}
                                                value={getSelectedValue(
                                                    recipe.store_product_id,
                                                    storeProducts
                                                )}
                                                onChange={(val) =>
                                                    handleProductChange(
                                                        opt.value,
                                                        index,
                                                        val?.value
                                                    )
                                                }
                                                styles={selectStyles}
                                                placeholder={
                                                    recipe.store_category_id
                                                        ? t("Select Product...")
                                                        : t("Select category first")
                                                }
                                                isDisabled={!recipe.store_category_id}
                                                noOptionsMessage={() =>
                                                    recipe.store_category_id
                                                        ? t("No products found")
                                                        : t("Select category first")
                                                }
                                                isClearable
                                                required
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                {t("Unit")}
                                            </label>
                                            <Select
                                                options={units.map((u) => ({
                                                    value: u.id,
                                                    label: u.name,
                                                }))}
                                                value={getSelectedValue(recipe.unit_id, units)}
                                                onChange={(val) =>
                                                    updateRecipeField(
                                                        opt.value,
                                                        index,
                                                        "unit_id",
                                                        val?.value
                                                    )
                                                }
                                                styles={selectStyles}
                                                placeholder={t("Unit")}
                                                required
                                            />
                                        </div>

                                        {/* Weight */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                {t("Weight")}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={recipe.weight}
                                                onChange={(e) =>
                                                    updateRecipeField(
                                                        opt.value,
                                                        index,
                                                        "weight",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full h-[42px] px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-mainColor focus:border-mainColor outline-none transition-all"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>

                                        {/* Status Switch */}
                                        <div className="md:col-span-1 flex flex-col items-center justify-center">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                {t("Status")}
                                            </label>
                                            <Switch
                                                checked={
                                                    recipe.status === 1 || recipe.status === "1"
                                                }
                                                handleClick={() =>
                                                    updateRecipeField(
                                                        opt.value,
                                                        index,
                                                        "status",
                                                        recipe.status === 1 ||
                                                            recipe.status === "1"
                                                            ? 0
                                                            : 1
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Delete Button */}
                                        <div className="flex justify-center pt-6">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeRecipeRow(opt.value, index)
                                                }
                                                className="text-red-500 hover:text-red-700 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
                                                title={t("Remove")}
                                            >
                                                <IoTrash size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {(!recipesByOption[opt.value] ||
                                recipesByOption[opt.value].length === 0) && (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm mb-2">
                                        {t("No recipes added yet")}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => addRecipeRow(opt.value)}
                                        className="text-mainColor text-sm font-semibold hover:underline"
                                    >
                                        {t("Click to add first recipe")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </form>

            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleSubmit}
                    disabled={loadingPost}
                    className="bg-mainColor text-white px-8 py-3 rounded-full shadow-xl hover:bg-red-700 hover:scale-105 transition-all flex items-center gap-2 font-bold text-lg disabled:opacity-70 disabled:scale-100"
                >
                    {loadingPost ? <LoaderLogin /> : <IoSave size={22} />}
                    {t("Save Changes")}
                </button>
            </div>
        </div>
    );
};

export default AddVariationRecipe;
