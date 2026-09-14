import React, { useEffect, useState } from "react";
import {
    TextInput,
    Switch,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useGet } from "../../../../../Hooks/useGet";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { FiPlus, FiTrash2, FiX, FiLayers, FiBox, FiArchive } from "react-icons/fi";

const AddProductRecipeModal = ({
    isOpen,
    onClose,
    productId,
    productName,
    initialCategories = [],
    initialUnits = [],
    initialStores = [],
    onSuccess,
}) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const auth = useAuth();

    // Fallback fetches if initial lists aren't fully available
    const { data: dataCategories } = useGet({
        url: `${apiUrl}/admin/purchase_categories`,
        enabled: isOpen && (!initialCategories || initialCategories.length === 0),
    });

    const { data: dataStores } = useGet({
        url: `${apiUrl}/admin/purchase_product/stores_list`,
        enabled: isOpen && (!initialStores || initialStores.length === 0),
    });

    const { data: dataUnits } = useGet({
        url: `${apiUrl}/admin/unit`,
        enabled: isOpen && (!initialUnits || initialUnits.length === 0),
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/recipe/add_product_recipe/${productId}`,
        type: true,
    });

    // Form fields for Purchase Product
    const [name, setName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [description, setDescription] = useState("");
    const [minStock, setMinStock] = useState("");
    const [status, setStatus] = useState(1);

    // Form fields for Recipe Association
    const [recipeUnit, setRecipeUnit] = useState(null);
    const [recipeWeight, setRecipeWeight] = useState("");

    // Initial stores stock
    const [productStores, setProductStores] = useState([
        { start_stock: "0", cost: "0", unit_id: "", store_id: "" },
    ]);

    // Options mapping
    const categoryOptions = (
        (initialCategories?.length > 0 ? initialCategories : dataCategories?.categories) || []
    ).map((c) => ({
        value: c.id,
        label: c.name,
    }));

    const storeOptions = (
        (initialStores?.length > 0 ? initialStores : dataStores?.stores) || []
    ).map((s) => ({
        value: s.id,
        label: s.name,
    }));

    const unitOptions = (
        (initialUnits?.length > 0 ? initialUnits : dataUnits?.units) || []
    ).map((u) => ({
        value: u.id,
        label: u.name,
    }));

    // Auto-select initial default unit if available
    useEffect(() => {
        if (unitOptions.length > 0 && !recipeUnit) {
            setRecipeUnit(unitOptions[0]);
        }
    }, [unitOptions, recipeUnit]);

    // Reset fields on modal open
    useEffect(() => {
        if (isOpen) {
            setName("");
            setSelectedCategory(null);
            setDescription("");
            setMinStock("");
            setStatus(1);
            setRecipeWeight("");
            if (unitOptions.length > 0) {
                setRecipeUnit(unitOptions[0]);
            }
            setProductStores([
                {
                    start_stock: "0",
                    cost: "0",
                    unit_id: unitOptions[0]?.value || "",
                    store_id: storeOptions[0]?.value || "",
                },
            ]);
        }
    }, [isOpen]);

    // Handle post response
    useEffect(() => {
        if (!loadingPost && response) {
            if (response.status === 200 || response.data?.success) {
                auth.toastSuccess(t("Product and recipe added successfully"));
                if (onSuccess) onSuccess();
                onClose();
            }
        }
    }, [response, loadingPost]);

    if (!isOpen) return null;

    const handleAddStore = () => {
        setProductStores([
            ...productStores,
            {
                start_stock: "0",
                cost: "0",
                unit_id: unitOptions[0]?.value || "",
                store_id: storeOptions[0]?.value || "",
            },
        ]);
    };

    const handleRemoveStore = (index) => {
        if (productStores.length <= 1) return;
        setProductStores(productStores.filter((_, i) => i !== index));
    };

    const handleStoreChange = (index, field, value) => {
        const updated = [...productStores];
        updated[index][field] = value;
        setProductStores(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            auth.toastError(t("Enter Product Name"));
            return;
        }

        if (!selectedCategory) {
            auth.toastError(t("Please select a category"));
            return;
        }

        if (!recipeUnit) {
            auth.toastError(t("Please select recipe unit"));
            return;
        }

        if (!recipeWeight || Number(recipeWeight) <= 0) {
            auth.toastError(t("Please fill recipe weight"));
            return;
        }

        // Validate store rows
        for (const s of productStores) {
            if (!s.store_id) {
                auth.toastError(t("Select Store"));
                return;
            }
            if (!s.unit_id) {
                auth.toastError(t("Select Unit"));
                return;
            }
        }

        const payload = {
            product_id: productId,
            name: name.trim(),
            description: description.trim() || null,
            category_id: selectedCategory.value,
            min_stock: minStock ? Number(minStock) : 0,
            status: status,
            unit_id: recipeUnit.value,
            weight: Number(recipeWeight),
            product_store: productStores.map((s) => ({
                store_id: Number(s.store_id),
                unit_id: Number(s.unit_id),
                start_stock: Number(s.start_stock || 0),
                cost: Number(s.cost || 0),
            })),
        };

        postData(payload, t("Product and recipe added successfully"));
    };

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            border: "1.5px solid #e2e8f0",
            borderRadius: "0.75rem",
            padding: "0.2rem 0.4rem",
            fontSize: "0.925rem",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(185, 28, 28, 0.15)" : "none",
            borderColor: state.isFocused ? "#b91c1c" : "#e2e8f0",
            backgroundColor: "white",
            "&:hover": {
                borderColor: "#b91c1c",
            },
        }),
        menuPortal: (base) => ({ ...base, zIndex: 99999 }),
        menu: (base) => ({ ...base, zIndex: 99999 }),
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-mainColor flex items-center justify-center font-bold">
                            <FiLayers size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                                {t("Add Product Recipe")}
                            </h2>
                            {productName && (
                                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                    {isRtl ? `ربط بوصفة: ` : `For Product: `}
                                    <span className="font-bold text-mainColor">{productName}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center"
                        title={t("Close")}
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollSection">
                    {/* SECTION 1: Recipe Proportion for Current Menu Product */}
                    <div className="bg-gradient-to-br from-rose-50/80 via-white to-red-50/40 border-2 border-rose-200/80 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-mainColor">
                            <FiBox size={18} className="text-mainColor" />
                            <h3 className="text-base font-bold">
                                {t("Recipe Proportion")} ({productName || t("Product")})
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            {isRtl
                                ? "حدد وزن أو كمية هذا الصنف المستخدمة في تصنيع وجبة واحدة من هذا المنتج."
                                : "Specify the weight/quantity of this item used in one serving of this product."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    {t("Recipe Unit")} <span className="text-rose-500">*</span>
                                </label>
                                <Select
                                    options={unitOptions}
                                    value={recipeUnit}
                                    onChange={setRecipeUnit}
                                    placeholder={t("Select Unit")}
                                    styles={customSelectStyles}
                                    menuPortalTarget={document.body}
                                    isSearchable
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    {t("Recipe Weight")} <span className="text-rose-500">*</span>
                                </label>
                                <TextInput
                                    value={recipeWeight}
                                    onChange={(e) => setRecipeWeight(e.target.value)}
                                    placeholder={isRtl ? "مثال: 150 أو 1.5" : "e.g. 150 or 1.5"}
                                    type="number"
                                    step="any"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Purchase Product Master Data */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-1 text-slate-800">
                            <FiArchive size={18} className="text-slate-600" />
                            <h3 className="text-base font-bold text-slate-800">
                                {isRtl ? "بيانات صنف المخزون الجديد" : "New Inventory Product Details"}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    {t("Product Name")} <span className="text-rose-500">*</span>
                                </label>
                                <TextInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("Enter Product Name")}
                                    required
                                />
                            </div>

                            {/* Store Category */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    {t("Category")} <span className="text-rose-500">*</span>
                                </label>
                                <Select
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    placeholder={t("Select Category")}
                                    styles={customSelectStyles}
                                    menuPortalTarget={document.body}
                                    isSearchable
                                />
                            </div>

                            {/* Min Stock */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    {t("Min Stock Quantity")}
                                </label>
                                <TextInput
                                    value={minStock}
                                    onChange={(e) => setMinStock(e.target.value)}
                                    placeholder={t("Enter Min Stock Quantity")}
                                    type="number"
                                    min="0"
                                />
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    {t("Product Description")}
                                </label>
                                <TextInput
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t("Enter Product Description")}
                                />
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-3 pt-6">
                                <span className="text-sm font-bold text-slate-700">{t("Active")}:</span>
                                <Switch
                                    checked={status === 1}
                                    handleClick={() => setStatus((prev) => (prev === 1 ? 0 : 1))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Initial Store Stocks & Costs */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {t("Product Stores")}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {isRtl
                                        ? "حدد أرصدة وتكلفة الصنف في المخازن التابعة"
                                        : "Set initial inventory levels and costs per store"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddStore}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-mainColor text-white rounded-xl hover:bg-mainColor/90 transition shadow-sm"
                            >
                                <FiPlus size={14} />
                                <span>{t("Add Store")}</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {productStores.map((store, index) => (
                                <div
                                    key={index}
                                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end relative"
                                >
                                    {/* Store */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                            {t("Store")}
                                        </label>
                                        <Select
                                            options={storeOptions}
                                            value={storeOptions.find((o) => o.value === store.store_id)}
                                            onChange={(val) => handleStoreChange(index, "store_id", val?.value)}
                                            placeholder={t("Select Store")}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                        />
                                    </div>

                                    {/* Unit */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                            {t("Unit")}
                                        </label>
                                        <Select
                                            options={unitOptions}
                                            value={unitOptions.find((o) => o.value === store.unit_id)}
                                            onChange={(val) => handleStoreChange(index, "unit_id", val?.value)}
                                            placeholder={t("Select Unit")}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                        />
                                    </div>

                                    {/* Start Stock */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                            {t("Start Stock")}
                                        </label>
                                        <TextInput
                                            value={store.start_stock}
                                            onChange={(e) => handleStoreChange(index, "start_stock", e.target.value)}
                                            placeholder="0"
                                            type="number"
                                            step="any"
                                            min="0"
                                        />
                                    </div>

                                    {/* Cost */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">
                                            {t("Cost")}
                                        </label>
                                        <TextInput
                                            value={store.cost}
                                            onChange={(e) => handleStoreChange(index, "cost", e.target.value)}
                                            placeholder="0.00"
                                            type="number"
                                            step="any"
                                            min="0"
                                        />
                                    </div>

                                    {/* Remove button */}
                                    <div className="flex justify-end sm:justify-center pb-1">
                                        {productStores.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStore(index)}
                                                className="w-9 h-9 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center border border-rose-200"
                                                title={t("Remove Store")}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loadingPost}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-colors"
                    >
                        {t("Cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loadingPost}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-mainColor text-white hover:bg-mainColor/90 font-bold text-sm shadow-md shadow-rose-900/15 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {loadingPost ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{isRtl ? "جاري الحفظ..." : t("Saving...")}</span>
                            </>
                        ) : (
                            <span>{t("Save & Link to Recipe")}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProductRecipeModal;
