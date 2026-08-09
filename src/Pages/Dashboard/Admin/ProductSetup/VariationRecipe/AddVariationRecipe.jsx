import React, { useState, useEffect } from "react";
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
    });

    const [storeCategories, setStoreCategories] = useState([]);
    const [storeProducts, setStoreProducts] = useState([]);
    const [units, setUnits] = useState([]);

    // Multi-Select Options
    const [allOptions, setAllOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);

    // State to hold recipes for each option: { [optionId]: [recipe1, recipe2] }
    const [recipesByOption, setRecipesByOption] = useState({});

    // Track loaded options
    const [loadedOptions, setLoadedOptions] = useState(new Set());

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
            variationsData.variations.forEach(variation => {
                variation.options?.forEach(opt => {
                    options.push({
                        value: opt.id,
                        label: `${variation.name} - ${opt.name}`,
                        optionId: opt.id,
                        variationName: variation.name
                    });
                });
            });
            setAllOptions(options);
        }
    }, [variationsData]);

    useEffect(() => {
        const fetchRecipesForOption = async (optionId) => {
            if (loadedOptions.has(optionId)) return;

            try {
                const response = await axios.get(
                    `${apiUrl}/admin/variation_recipe/view_recipes/${optionId}?locale=${selectedLanguage}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${auth?.userState?.token || ''}`,
                        }
                    }
                );

                if (response.status === 200 && response.data?.recipes && response.data.recipes.length > 0) {
                    // Check mapping logic here too just in case
                    const mappedRecipes = response.data.recipes.map(r => ({
                        id: r.id,
                        store_category_id: r.store_category?.id || r.store_category_id,
                        store_product_id: r.store_product?.id || r.store_product_id,
                        unit_id: r.unit?.id || r.unit_id,
                        weight: r.weight,
                        status: r.status
                    }));

                    setRecipesByOption(prev => ({
                        ...prev,
                        [optionId]: mappedRecipes
                    }));
                } else if (!recipesByOption[optionId]) {
                    setRecipesByOption(prev => ({
                        ...prev,
                        [optionId]: []
                    }));
                }

                setLoadedOptions(prev => new Set(prev).add(optionId));

            } catch (error) {
                console.error("Error fetching recipes for option", optionId, error);
            }
        };

        selectedOptions.forEach(opt => {
            fetchRecipesForOption(opt.value);
        });

    }, [selectedOptions, apiUrl, selectedLanguage, auth, loadedOptions, recipesByOption]);


    useEffect(() => {
        if (response) {
            toast.success(t("Recipes saved successfully"));
            navigate(-1);
        }
    }, [response, navigate, t]);

    // Helper to create a new empty recipe object
    const createEmptyRecipe = () => ({
        id: 0,
        store_category_id: "",
        store_product_id: "",
        unit_id: "",
        weight: "",
        status: 1,
    });

    const addRecipeRow = (optionId) => {
        setRecipesByOption(prev => ({
            ...prev,
            [optionId]: [...(prev[optionId] || []), createEmptyRecipe()]
        }));
    };

    const removeRecipeRow = (optionId, index) => {
        setRecipesByOption(prev => ({
            ...prev,
            [optionId]: prev[optionId].filter((_, i) => i !== index)
        }));
    };

    const updateRecipeField = (optionId, index, field, value) => {
        setRecipesByOption(prev => {
            const updatedRecipes = [...(prev[optionId] || [])];
            updatedRecipes[index] = { ...updatedRecipes[index], [field]: value };
            return { ...prev, [optionId]: updatedRecipes };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        let payloadIndex = 0;

        selectedOptions.forEach(opt => {
            const optionId = opt.value;
            const recipes = recipesByOption[optionId];

            if (recipes && recipes.length > 0) {
                formDataToSend.append(`variations[${payloadIndex}][id]`, optionId);

                recipes.forEach((recipe, rIndex) => {
                    formDataToSend.append(`variations[${payloadIndex}][options][${rIndex}][store_category_id]`, recipe.store_category_id);
                    formDataToSend.append(`variations[${payloadIndex}][options][${rIndex}][store_product_id]`, recipe.store_product_id);
                    formDataToSend.append(`variations[${payloadIndex}][options][${rIndex}][unit_id]`, recipe.unit_id);
                    formDataToSend.append(`variations[${payloadIndex}][options][${rIndex}][weight]`, recipe.weight);
                    formDataToSend.append(`variations[${payloadIndex}][options][${rIndex}][status]`, recipe.status || 1);
                    formDataToSend.append(`variations[${payloadIndex}][options][${rIndex}][id]`, recipe.id || 0);
                });
                payloadIndex++;
            }
        });

        if (payloadIndex === 0) {
            toast.error(t("Please add at least one recipe"));
            return;
        }

        postData(formDataToSend);
    };

    if (loadingVariations || loadingForm) {
        return <LoaderLogin />;
    }

    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '42px',
            borderRadius: '0.5rem',
            borderColor: '#e5e7eb',
            fontSize: '0.875rem',
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100,
            fontSize: '0.875rem',
        })
    };

    const getSelectedValue = (id, list) => {
        if (!id) return null;
        const item = list.find(l => String(l.id) === String(id));
        return item ? { value: item.id, label: item.name } : null;
    };

    return (
        <div className="w-full flex flex-col gap-y-3 p-4 pb-20">
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">
                        {t("Add Variation Recipe")} {productName && <span>- <span className="text-mainColor">{productName}</span></span>}
                    </h1>
                </div>
            </div>

            <div className="bg-white p-2 md:p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t("Select Options to Manage")}</label>
                <Select
                    isMulti
                    options={allOptions}
                    value={selectedOptions}
                    onChange={setSelectedOptions}
                    placeholder={t("Choose variation options...")}
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    noOptionsMessage={() => t("No options found")}
                />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {selectedOptions.map((opt) => (
                    <div key={opt.value} className="bg-white rounded-xl shadow-sm p-4 border border-l-4 border-l-mainColor border-gray-100">
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
                            {(recipesByOption[opt.value] || []).map((recipe, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg relative group">
                                    {/* Category */}
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Store Category")}</label>
                                        <Select
                                            options={storeCategories.map(c => ({ value: c.id, label: c.name }))}
                                            value={getSelectedValue(recipe.store_category_id, storeCategories)}
                                            onChange={(val) => updateRecipeField(opt.value, index, "store_category_id", val?.value)}
                                            styles={selectStyles}
                                            placeholder={t("Select...")}
                                            required
                                        />
                                    </div>

                                    {/* Product */}
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Store Product")}</label>
                                        <Select
                                            options={storeProducts
                                                .filter(p => !recipe.store_category_id || String(p.store_category_id) === String(recipe.store_category_id))
                                                .map(p => ({ value: p.id, label: p.name }))}
                                            value={getSelectedValue(recipe.store_product_id, storeProducts)}
                                            onChange={(val) => updateRecipeField(opt.value, index, "store_product_id", val?.value)}
                                            styles={selectStyles}
                                            placeholder={t("Select...")}
                                            isDisabled={!recipe.store_category_id}
                                            noOptionsMessage={() => recipe.store_category_id ? t("No products found") : t("Select category first")}
                                            required
                                        />
                                    </div>

                                    {/* Unit */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Unit")}</label>
                                        <Select
                                            options={units.map(u => ({ value: u.id, label: u.name }))}
                                            value={getSelectedValue(recipe.unit_id, units)}
                                            onChange={(val) => updateRecipeField(opt.value, index, "unit_id", val?.value)}
                                            styles={selectStyles}
                                            placeholder={t("Unit")}
                                            required
                                        />
                                    </div>

                                    {/* Weight */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Weight")}</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={recipe.weight}
                                            onChange={(e) => updateRecipeField(opt.value, index, "weight", e.target.value)}
                                            className="w-full h-[42px] px-3 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-mainColor focus:border-mainColor outline-none transition-all"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>

                                    {/* Status Switch */}
                                    <div className="md:col-span-1 flex flex-col items-center justify-center">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Status")}</label>
                                        <Switch
                                            checked={recipe.status === 1 || recipe.status === '1'}
                                            handleClick={() =>
                                                updateRecipeField(
                                                    opt.value,
                                                    index,
                                                    "status",
                                                    (recipe.status === 1 || recipe.status === '1') ? 0 : 1
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <div className=" flex justify-center pt-6">
                                        <button
                                            type="button"
                                            onClick={() => removeRecipeRow(opt.value, index)}
                                            className="text-red-500 hover:text-red-700 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
                                            title={t("Remove")}
                                        >
                                            <IoTrash size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {(!recipesByOption[opt.value] || recipesByOption[opt.value].length === 0) && (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm mb-2">{t("No recipes added yet")}</p>
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
