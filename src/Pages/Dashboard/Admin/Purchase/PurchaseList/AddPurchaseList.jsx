// src/pages/Admin/Purchase/AddPurchaseList.jsx
import React, { useEffect, useState, useRef } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    TextInput,
    TitlePage,
    UploadInput,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import Select from "react-select";

const AddPurchaseList = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    // File input ref for UploadInput
    const fileInputRef = useRef(null);

    // Fetch data
    const {
        refetch: refetchPurchaseData,
        loading: loadingPurchaseData,
        data: purchaseData,
    } = useGet({ url: `${apiUrl}/admin/purchase/lists` });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase/add`,
    });

    // Type: product or material
    const [type, setType] = useState("product");

    // Select states
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // Options
    const [stores, setStores] = useState([]);
    const [categories, setCategories] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [units, setUnits] = useState([]);
    const [financials, setFinancials] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        store_id: "",
        category_id: "",
        category_material_id: "",
        product_id: "",
        material_id: "",
        unit_id: "",
        quintity: "",
        total_coast: "",
        date: new Date().toISOString().split("T")[0],
        receipt: null,
        financial: [{ id: "", amount: "" }],
    });

    const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
    const [remainingAmount, setRemainingAmount] = useState(0);

    // Fetch data
    useEffect(() => {
        refetchPurchaseData();
    }, []);

    // Populate dropdowns
    useEffect(() => {
        if (!purchaseData) return;

        setStores(purchaseData.stores?.map(s => ({ value: s.id, label: s.name })) || []);
        setUnits(purchaseData.units?.map(u => ({ value: u.id, label: u.name })) || []);
        setFinancials(purchaseData.financials?.map(f => ({ value: f.id, label: f.name })) || []);
        setCategories(purchaseData.categories?.map(c => ({ value: c.id, label: c.name })) || []);
        setMaterialCategories(purchaseData.material_categories?.map(c => ({ value: c.id, label: c.name })) || []);

        setProducts(
            purchaseData.products?.map(p => ({
                value: p.id,
                label: p.name,
                category_id: p.category_id,
            })) || []
        );

        setMaterials(
            purchaseData.materials?.map(m => ({
                value: m.id,
                label: m.name,
                category_id: m.category_id,
            })) || []
        );
    }, [purchaseData]);

    // Filter items by category
    useEffect(() => {
        const list = type === "product" ? products : materials;
        const catId = selectedCategory?.value;

        if (catId && list.length > 0) {
            const filtered = list.filter(item => item.category_id === catId);
            setFilteredItems(filtered);
        } else {
            setFilteredItems([]);
        }
        setSelectedItem(null);
    }, [type, selectedCategory, products, materials]);

    // Reset category & item on type change
    useEffect(() => {
        setSelectedCategory(null);
        setSelectedItem(null);
        setFilteredItems([]);
    }, [type]);

    // Calculate payment totals
    useEffect(() => {
        const totalPaid = formData.financial.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        setTotalPaymentAmount(totalPaid);
        const totalCost = parseFloat(formData.total_coast) || 0;
        setRemainingAmount(totalCost - totalPaid);
    }, [formData.financial, formData.total_coast]);

    // Success redirect
    useEffect(() => {
        if (!loadingPost && response?.status === 200) {
            auth.toastSuccess(t("Purchase Added Successfully"));
            navigate(-1);
        }
    }, [response, loadingPost]);

    // Handlers
    const handleStoreChange = (opt) => {
        setSelectedStore(opt);
        setFormData(prev => ({ ...prev, store_id: opt ? opt.value : "" }));
    };

    const handleCategoryChange = (opt) => {
        setSelectedCategory(opt);
        const value = opt ? opt.value : "";
        setFormData(prev => ({
            ...prev,
            category_id: type === "product" ? value : "",
            category_material_id: type === "material" ? value : "",
        }));
    };

    const handleItemChange = (opt) => {
        setSelectedItem(opt);
        const value = opt ? opt.value : "";
        setFormData(prev => ({
            ...prev,
            product_id: type === "product" ? value : "",
            material_id: type === "material" ? value : "",
        }));
    };

    const handleUnitChange = (opt) => {
        setSelectedUnit(opt);
        setFormData(prev => ({ ...prev, unit_id: opt ? opt.value : "" }));
    };

    const handleFinancialChange = (index, field, value) => {
        const updated = [...formData.financial];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, financial: updated }));
    };

    const addFinancialMethod = () => {
        setFormData(prev => ({
            ...prev,
            financial: [...prev.financial, { id: "", amount: "" }],
        }));
    };

    const removeFinancialMethod = (index) => {
        if (formData.financial.length > 1) {
            setFormData(prev => ({
                ...prev,
                financial: prev.financial.filter((_, i) => i !== index),
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, receipt: file }));
        }
        // Allow re-uploading same file
        if (e.target) e.target.value = "";
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedStore) return auth.toastError(t("Please select store"));
        if (!selectedCategory) return auth.toastError(t("Please select category"));
        if (!selectedItem) return auth.toastError(t("Please select item"));
        if (!selectedUnit) return auth.toastError(t("Please select unit"));
        if (!formData.quintity || formData.quintity <= 0) return auth.toastError(t("Invalid quantity"));
        if (!formData.total_coast || formData.total_coast <= 0) return auth.toastError(t("Invalid total cost"));

        const totalPaid = formData.financial.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
        if (Math.abs(totalPaid - parseFloat(formData.total_coast)) > 0.01) {
            return auth.toastError(t("Total payment must equal total cost"));
        }

        const fd = new FormData();
        fd.append("store_id", selectedStore.value);
        fd.append("quintity", formData.quintity);
        fd.append("total_coast", formData.total_coast);
        fd.append("date", formData.date);
        fd.append("unit_id", selectedUnit.value);
        fd.append("type", type);

        if (type === "product") {
            fd.append("category_id", selectedCategory.value);
            fd.append("product_id", selectedItem.value);
        } else {
            fd.append("category_material_id", selectedCategory.value);
            fd.append("material_id", selectedItem.value);
        }

        if (formData.receipt) fd.append("receipt", formData.receipt);

        formData.financial.forEach((f, i) => {
            if (f.id && f.amount) {
                fd.append(`financial[${i}][id]`, f.id);
                fd.append(`financial[${i}][amount]`, f.amount);
            }
        });

        postData(fd);
    };

    const handleReset = () => {
        setType("product");
        setSelectedStore(null);
        setSelectedCategory(null);
        setSelectedItem(null);
        setSelectedUnit(null);
        setFormData({
            store_id: "",
            category_id: "",
            category_material_id: "",
            product_id: "",
            material_id: "",
            unit_id: "",
            quintity: "",
            total_coast: "",
            date: new Date().toISOString().split("T")[0],
            receipt: null,
            financial: [{ id: "", amount: "" }],
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            border: "1px solid #D1D5DB",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "none",
            borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
        }),
    };

    return (
        <>
            {loadingPurchaseData || loadingPost ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="pb-32">
                    <div className="flex items-center gap-4 p-4">
                        <button onClick={() => navigate(-1)} className="text-mainColor hover:text-red-700">
                            <IoArrowBack size={28} />
                        </button>
                        <TitlePage text={t("Add Purchase")} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-4">

                        {/* Type Selection */}
                        <div className="flex justify-center gap-16 p-2 mb-4">
                            <label className="flex items-center gap-4 text-lg font-medium cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="product"
                                    checked={type === "product"}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-6 h-6 text-red-600"
                                />
                                <span>{t("Product")}</span>
                            </label>
                            <label className="flex items-center gap-4 text-lg font-medium cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="material"
                                    checked={type === "material"}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-6 h-6 text-red-600"
                                />
                                <span>{t("Material")}</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                            {/* Store */}
                            <div>
                                <label className="block mb-2 text-xl text-thirdColor">{t("Store")} *</label>
                                <Select
                                    value={selectedStore}
                                    onChange={handleStoreChange}
                                    options={stores}
                                    placeholder={t("Select Store")}
                                    isClearable isSearchable
                                    styles={selectStyles}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block mb-2 text-xl text-thirdColor">
                                    {type === "product" ? t("Product Category") : t("Material Category")} *
                                </label>
                                <Select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    options={type === "product" ? categories : materialCategories}
                                    placeholder={t("Select Category")}
                                    isClearable isSearchable
                                    styles={selectStyles}
                                />
                            </div>

                            {/* Item */}
                            <div>
                                <label className="block mb-2 text-xl text-thirdColor">
                                    {type === "product" ? t("Product") : t("Material")} *
                                </label>
                                <Select
                                    value={selectedItem}
                                    onChange={handleItemChange}
                                    options={filteredItems}
                                    placeholder={selectedCategory ? t("Select...") : t("Select category first")}
                                    isDisabled={!selectedCategory}
                                    isClearable isSearchable
                                    styles={selectStyles}
                                />
                            </div>

                            {/* Unit */}
                            <div>
                                <label className="block mb-2 text-xl text-thirdColor">{t("Unit")} *</label>
                                <Select
                                    value={selectedUnit}
                                    onChange={handleUnitChange}
                                    options={units}
                                    placeholder={t("Select Unit")}
                                    isClearable isSearchable
                                    styles={selectStyles}
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block mb-2 text-xl text-thirdColor">{t("Quantity")} *</label>
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.quintity}
                                    onChange={(e) => handleInputChange("quintity", e.target.value)}
                                    placeholder={t("Enter Quantity")}
                                />
                            </div>

                            {/* Total Cost */}
                            <div>
                                <label className="block mb-2 text-xl text-thirdColor">{t("Total Cost")} *</label>
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    value={formData.total_coast}
                                    onChange={(e) => handleInputChange("total_coast", e.target.value)}
                                    placeholder={t("Enter Total Cost")}
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block mb-2 text-xl text-thirdColor">{t("Date")} *</label>
                                <TextInput
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange("date", e.target.value)}
                                />
                            </div>

                            {/* Receipt - NOW WORKING */}
                            <div>
                                <label className="block mb-2 text-xl text-thirdColor">{t("Receipt")}</label>
                                <UploadInput
                                    placeholder={formData.receipt ? formData.receipt.name : t("Click to upload receipt")}
                                    value={formData.receipt ? formData.receipt.name : ""}
                                    readonly={true}
                                    onClick={() => fileInputRef.current?.click()}
                                    handleFileChange={handleFileChange}
                                    uploadFileRef={fileInputRef}
                                />
                            </div>
                        </div>

                        {/* Financial Methods */}
                        <div className="mt-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-medium text-thirdColor">{t("Methods payment")}</h3>
                                <button
                                    type="button"
                                    onClick={addFinancialMethod}
                                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    {t("Add Payment Method")}
                                </button>
                            </div>

                            {formData.financial.map((financial, index) => (
                                <div key={index} className="grid grid-cols-1 gap-4 p-4 mb-4 border rounded-lg md:grid-cols-3">
                                    <div className="flex flex-col gap-y-1">
                                        <span className="text-lg font-TextFontRegular text-thirdColor">
                                            {t("Methods")}:
                                        </span>
                                        <Select
                                            value={financials.find(f => f.value === financial.id)}
                                            onChange={(selectedOption) =>
                                                handleFinancialChange(index, "id", selectedOption ? selectedOption.value : "")
                                            }
                                            options={financials}
                                            placeholder={t("Select Payment Method")}
                                            isClearable
                                            isSearchable
                                            styles={selectStyles}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-y-1">
                                        <span className="text-lg font-TextFontRegular text-thirdColor">
                                            {t("Amount")}:
                                        </span>
                                        <TextInput
                                            type="number"
                                            step="0.01"
                                            value={financial.amount}
                                            onChange={(e) =>
                                                handleFinancialChange(index, "amount", e.target.value)
                                            }
                                            placeholder={t("Enter Amount")}
                                            min="0"
                                            max={formData.total_coast}
                                        />
                                        {financial.amount && (
                                            <span className="text-sm text-gray-500">
                                                {t("Max available")}: ${(parseFloat(formData.total_coast || 0) - totalPaymentAmount + parseFloat(financial.amount || 0)).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-end">
                                        {formData.financial.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeFinancialMethod(index)}
                                                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                                            >
                                                {t("Remove")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 mt-10">
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
                                    text={t("Submit")}
                                    rounded="rounded-full"
                                    handleClick={handleSubmit}
                                    disabled={Math.abs(remainingAmount) > 0.01}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default AddPurchaseList;