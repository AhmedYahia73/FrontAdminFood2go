import React, { useEffect, useState } from "react";
import {
    NumberInput,
    StaticButton,
    StaticLoader,
    SubmitButton,
    TextInput,
    TitlePage,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useGet } from "../../../../Hooks/useGet";
import Select from 'react-select';

const AddManufacturing = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchLists,
        loading: loadingLists,
        data: dataLists,
    } = useGet({
        url: `${apiUrl}/admin/manufacturing/lists`,
    });
    const { postData: postProductRecipe, loadingPost: loadingProductRecipe, response: responseProductRecipe } = usePost({
        url: `${apiUrl}/admin/manufacturing/product_recipe`,
    });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/manufacturing/manufacturing`,
    });

    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [materialWeights, setMaterialWeights] = useState({}); // Always strings
    const [hasFormChanged, setHasFormChanged] = useState(false);

    // Calculate availability
    const getUpdatedRecipes = () => {
        return recipes.map(recipe => {
            const inputValue = materialWeights[recipe.id] ?? recipe.weight.toString();
            const currentWeight = inputValue === "" ? 0 : (parseFloat(inputValue) || 0);

            // Check availability: if currentWeight is 0 and available_quantity is 0, it's considered available (no material needed)
            const isAvailable = currentWeight === 0 && recipe.available_quantity === 0
                ? true
                : currentWeight <= recipe.available_quantity;

            return {
                ...recipe,
                currentWeight,
                inputValue,
                available: isAvailable
            };
        });
    };

    const updatedRecipes = getUpdatedRecipes();
    const allRecipesAvailable = updatedRecipes.length > 0 &&
        updatedRecipes.every(recipe => recipe.available);

    useEffect(() => {
        refetchLists();
    }, [refetchLists]);

    useEffect(() => {
        if (dataLists && dataLists.stores && dataLists.categories && dataLists.products) {
            const storeOptions = dataLists.stores.map((store) => ({
                value: store.id,
                label: store.name,
            }));
            const categoryOptions = dataLists.categories.map((category) => ({
                value: category.id,
                label: category.name,
            }));
            const productOptions = dataLists.products.map((product) => ({
                value: product.id,
                label: product.name,
                category_id: product.category_id
            }));
            setStores(storeOptions);
            setCategories(categoryOptions);
            setProducts(productOptions);
        }
    }, [dataLists]);

    useEffect(() => {
        if (selectedCategory && products.length > 0) {
            const filtered = products.filter(product =>
                product.category_id === selectedCategory.value
            );
            setFilteredProducts(filtered);
            setSelectedProduct(null);
        } else {
            setFilteredProducts(products);
        }
    }, [selectedCategory, products]);

    useEffect(() => {
        if (responseProductRecipe && responseProductRecipe.data?.recipes) {
            const newRecipes = responseProductRecipe.data.recipes;
            setRecipes(newRecipes);

            const initialWeights = {};
            newRecipes.forEach(recipe => {
                initialWeights[recipe.id] = recipe.weight.toString(); // String
            });
            setMaterialWeights(initialWeights);
            setHasFormChanged(false);
        }
    }, [responseProductRecipe]);

    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

    useEffect(() => {
        // Set hasFormChanged to true if any input that affects recipe calculation changes,
        // but only after a recipe has actually been loaded (recipes.length > 0)
        if (recipes.length > 0) {
            setHasFormChanged(true);
        }
    }, [selectedStore, selectedCategory, selectedProduct, quantity]);

    const handleStoreChange = (selectedOption) => {
        setSelectedStore(selectedOption);
        if (recipes.length > 0) {
            setRecipes([]);
            setMaterialWeights({});
        }
    };

    const handleCategoryChange = (selectedOption) => {
        setSelectedCategory(selectedOption);
        if (recipes.length > 0) {
            setRecipes([]);
            setMaterialWeights({});
        }
    };

    const handleProductChange = (selectedOption) => {
        setSelectedProduct(selectedOption);
        if (recipes.length > 0) {
            setRecipes([]);
            setMaterialWeights({});
        }
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
        if (recipes.length > 0) {
            setRecipes([]);
            setMaterialWeights({});
        }
    };

    const handleMaterialWeightChange = (recipeId, inputValue) => {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        // Allow empty string while typing
        if (inputValue === "") {
            setMaterialWeights(prev => ({ ...prev, [recipeId]: "" }));
            return;
        }

        const weightValue = parseFloat(inputValue);

        // Allow partial input like "." or "12."
        if (isNaN(weightValue) && inputValue !== "." && !inputValue.endsWith(".")) {
            return;
        }

        // This is a soft check, but the server ultimately handles the final check.
        // You might want to remove this if the UX is annoying for the user.
        if (weightValue > recipe.available_quantity) {
            auth.toastError(t("Weight cannot exceed available quantity"));
            return;
        }

        setMaterialWeights(prev => ({ ...prev, [recipeId]: inputValue }));
    };

    const handleGetRecipe = (e) => {
        e.preventDefault();
        if (!selectedStore) return auth.toastError(t("Please Select Store"));
        if (!selectedProduct) return auth.toastError(t("Please Select Product"));
        if (!quantity) return auth.toastError(t("Please Enter Quantity"));

        const formData = new FormData();
        formData.append("store_id", selectedStore.value);
        formData.append("product_id", selectedProduct.value);
        formData.append("quantity", quantity);
        postProductRecipe(formData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedStore) return auth.toastError(t("Please Select Store"));
        if (!selectedProduct) return auth.toastError(t("Please Select Product"));
        if (!quantity) return auth.toastError(t("Please Enter Quantity"));
        if (updatedRecipes.length === 0) return auth.toastError(t("Please Get Recipe First"));
        if (!allRecipesAvailable) return auth.toastError(t("All materials must be available to submit manufacturing"));
        if (hasFormChanged) return auth.toastError(t("Please get recipe again after changing form data"));

        const formData = new FormData();
        formData.append("store_id", selectedStore.value);
        formData.append("product_id", selectedProduct.value);
        formData.append("quantity", quantity);

        updatedRecipes.forEach((recipe, index) => {
            const inputValue = materialWeights[recipe.id] ?? "";
            // Ensure the weight is sent as a number, defaulting to 0 if the field is empty
            const weight = inputValue === "" ? 0 : (parseFloat(inputValue) || 0);

            // 🛑 CRITICAL FIX APPLIED HERE:
            // Assuming the server needs the Material ID, not the Recipe Item ID.
            // formData.append(`materials[${index}][id]`, recipe.id);
            formData.append(`materials[${index}][id]`, recipe.material.id);
            // If the above line still fails, try using recipe.id as fallback, but material ID is usually correct for consumption.
            formData.append(`materials[${index}][weight]`, weight);
        });

        postData(formData, t("Manufacturing Added Success"));
    };

    const handleReset = () => {
        setSelectedStore(null);
        setSelectedCategory(null);
        setSelectedProduct(null);
        setQuantity("");
        setRecipes([]);
        setMaterialWeights({});
        setHasFormChanged(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

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
            {loadingPost || loadingLists ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="pb-32">
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-x-2">
                            <button
                                onClick={handleBack}
                                className="text-mainColor hover:text-red-700 transition-colors"
                                title={t("Back")}
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Add Manufacturing")} />
                        </div>
                    </div>

                    <form className="p-2" onSubmit={handleSubmit}>
                        <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {/* Store */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">{t("Store")}:</span>
                                <Select
                                    value={selectedStore}
                                    onChange={handleStoreChange}
                                    options={stores}
                                    placeholder={t("Select Store")}
                                    isClearable
                                    isSearchable
                                    styles={selectStyles}
                                    className="w-full"
                                    noOptionsMessage={() => t("No stores available")}
                                />
                            </div>

                            {/* Category */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">{t("Category")}:</span>
                                <Select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    options={categories}
                                    placeholder={t("Select Category")}
                                    isClearable
                                    isSearchable
                                    styles={selectStyles}
                                    className="w-full"
                                    noOptionsMessage={() => t("No categories available")}
                                />
                            </div>

                            {/* Product */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">{t("Product")}:</span>
                                <Select
                                    value={selectedProduct}
                                    onChange={handleProductChange}
                                    options={filteredProducts}
                                    placeholder={t("Select Product")}
                                    isClearable
                                    isSearchable
                                    styles={selectStyles}
                                    className="w-full"
                                    noOptionsMessage={() => t("No products available")}
                                    isDisabled={!selectedCategory}
                                />
                            </div>

                            {/* Quantity */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">{t("Quantity")}:</span>
                                <TextInput
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    placeholder={t("Enter Quantity")}
                                />
                            </div>
                        </div>

                        {/* Get Recipe Button */}
                        <div className="flex items-center justify-end w-full gap-x-4 mt-6">
                            <div className="">
                                <StaticButton
                                    text={t("Get Recipe")}
                                    handleClick={handleGetRecipe}
                                    bgColor="bg-mainColor"
                                    Color="text-white"
                                    border="border-2"
                                    borderColor="border-mainColor"
                                    rounded="rounded-full"
                                    disabled={!selectedStore || !selectedProduct || !quantity}
                                />
                            </div>
                        </div>

                        {/* Loading Recipe */}
                        {loadingProductRecipe && (
                            <div className="flex items-center justify-center w-full h-20">
                                <StaticLoader />
                            </div>
                        )}

                        {/* No Recipe Message */}
                        {!loadingProductRecipe && responseProductRecipe && recipes.length === 0 && (
                            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-center font-TextFontRegular">
                                {t("This product has no recipe. Please set up a recipe before manufacturing.")}
                            </div>
                        )}

                        {/* Recipe Materials */}
                        {updatedRecipes.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Recipe Materials")}
                                    </h3>
                                    {!allRecipesAvailable && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded text-sm">
                                            {t("Adjust weights to make all materials available")}
                                        </div>
                                    )}
                                    {allRecipesAvailable && !hasFormChanged && (
                                        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded text-sm">
                                            {t("All materials are available - ready to submit")}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {updatedRecipes.map((recipe) => {
                                        const inputValue = materialWeights[recipe.id] ?? recipe.weight.toString();
                                        const displayWeight = inputValue === "" ? recipe.weight : (parseFloat(inputValue) || 0);
                                        const isAvailable = recipe.available;

                                        return (
                                            <div
                                                key={recipe.id}
                                                className={`p-4 border rounded-lg ${isAvailable
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-red-200 bg-red-50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`font-semibold ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                                                        {recipe.material?.name}
                                                    </h4>
                                                    <span className={`text-sm px-2 py-1 rounded ${isAvailable
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {isAvailable ? t("Available") : t("Not Available")}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-2">
                                                    <p>{t("Category")}: {recipe.material_category?.name}</p>
                                                    <p>{t("Available Weight")}: {recipe.available_quantity} {recipe.unit?.name}</p>
                                                    <p className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t("Current Weight")}: {displayWeight} {recipe.unit?.name}
                                                    </p>
                                                    {!isAvailable && recipe.available_quantity > 0 && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {t("Reduce weight to")} ≤ {recipe.available_quantity} {recipe.unit?.name}
                                                        </p>
                                                    )}
                                                    {!isAvailable && recipe.available_quantity === 0 && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {t("No available quantity - set weight to 0")}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-700">{t("Weight")}:</span>
                                                    <NumberInput
                                                        value={inputValue}
                                                        onChange={(e) => handleMaterialWeightChange(recipe.id, e.target.value)}
                                                        className="w-24"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-sm text-gray-600">{recipe.unit?.name}</span>
                                                </div>

                                                <div className="mt-2 text-xs text-gray-500">
                                                    {t("Max")}: {recipe.available_quantity} {recipe.unit?.name}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Submit & Reset */}
                        {updatedRecipes.length > 0 && (
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
                                        text={t("Submit Manufacturing")}
                                        rounded="rounded-full"
                                        handleClick={handleSubmit}
                                        disabled={!allRecipesAvailable || hasFormChanged || updatedRecipes.length === 0}
                                    /></div>
                            </div>
                        )}
                    </form>
                </section>
            )}
        </>
    );
};

export default AddManufacturing;