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
import {
    IoArrowBack,
    IoClose,
    IoAddCircleOutline,
    IoCalendarOutline,
    IoCalculatorOutline,
} from "react-icons/io5";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { useGet } from "../../../../../Hooks/useGet";
import Select from "react-select";

const AddPurchaseList = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    // Fetch lists data (stores, units, financials, suppliers, products, materials)
    const {
        refetch: refetchPurchaseData,
        loading: loadingPurchaseData,
        data: purchaseData,
    } = useGet({ url: `${apiUrl}/admin/purchase/lists` });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase/add`,
    });

    // Select states
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // Options
    const [stores, setStores] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [units, setUnits] = useState([]);
    const [financials, setFinancials] = useState([]);

    // Both products and materials in the same purchase form, initially empty
    const [productItems, setProductItems] = useState([]);
    const [materialItems, setMaterialItems] = useState([]);

    // Installments schedule for remaining due
    const [dueInvoices, setDueInvoices] = useState([]);
    const [showAutoSplitModal, setShowAutoSplitModal] = useState(false);
    const [splitCount, setSplitCount] = useState(3);
    const [splitInterval, setSplitInterval] = useState("monthly");
    const [splitStartDate, setSplitStartDate] = useState(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );

    // Form state
    const [formData, setFormData] = useState({
        store_id: "",
        supplier_id: "",
        total_coast: "",
        date: new Date().toISOString().split("T")[0],
        receipt: null,
        financial: [{ id: "", amount: "" }],
    });

    const [totalPaymentAmount, setTotalPaymentAmount] = useState(0);
    const [remainingAmount, setRemainingAmount] = useState(0);

    // Fetch lists
    useEffect(() => {
        refetchPurchaseData();
    }, []);

    // Populate dropdown options
    useEffect(() => {
        if (!purchaseData) return;

        setStores(purchaseData.stores?.map(s => ({ value: s.id, label: s.name })) || []);
        setSuppliers(purchaseData.suppliers?.map(s => ({ value: s.id, label: s.name })) || []);
        setUnits(purchaseData.units?.map(u => ({ value: u.id, label: u.name })) || []);
        setFinancials(purchaseData.financials?.map(f => ({ value: f.id, label: f.name })) || []);

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

    // Calculate payment totals and remaining due
    useEffect(() => {
        const totalPaid = formData.financial.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        setTotalPaymentAmount(totalPaid);
        const totalCost = parseFloat(formData.total_coast) || 0;
        setRemainingAmount(Math.max(0, totalCost - totalPaid));
    }, [formData.financial, formData.total_coast]);

    // Installments calculations
    const totalScheduledAmount = dueInvoices.reduce((sum, inv) => sum + (parseFloat(inv.due) || 0), 0);
    const unscheduledBalance = Math.max(0, parseFloat((remainingAmount - totalScheduledAmount).toFixed(2)));

    // Success redirect
    useEffect(() => {
        if (!loadingPost && response?.status === 200) {
            auth.toastSuccess(t("Purchase Added Successfully"));
            navigate(-1);
        }
    }, [response, loadingPost]);

    // Store & Supplier Handlers
    const handleStoreChange = (opt) => {
        setSelectedStore(opt);
        setFormData(prev => ({ ...prev, store_id: opt ? opt.value : "" }));
    };

    const handleSupplierChange = (opt) => {
        setSelectedSupplier(opt);
        setFormData(prev => ({ ...prev, supplier_id: opt ? opt.value : "" }));
    };

    // Product rows handlers
    const handleProductChange = (index, field, value) => {
        const updated = [...productItems];
        updated[index][field] = value;
        setProductItems(updated);
    };

    const addProductRow = () => {
        setProductItems(prev => [...prev, { item_id: "", unit_id: "", count: "" }]);
    };

    const removeProductRow = (index) => {
        setProductItems(prev => prev.filter((_, i) => i !== index));
    };

    // Material rows handlers
    const handleMaterialChange = (index, field, value) => {
        const updated = [...materialItems];
        updated[index][field] = value;
        setMaterialItems(updated);
    };

    const addMaterialRow = () => {
        setMaterialItems(prev => [...prev, { item_id: "", unit_id: "", count: "" }]);
    };

    const removeMaterialRow = (index) => {
        setMaterialItems(prev => prev.filter((_, i) => i !== index));
    };

    // Financial methods handlers
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

    // Installment handlers
    const addInstallmentRow = () => {
        const lastDate = dueInvoices.length > 0
            ? new Date(dueInvoices[dueInvoices.length - 1].date || new Date())
            : new Date();
        const nextMonth = new Date(lastDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const dateStr = nextMonth.toISOString().split("T")[0];
        const initialDue = unscheduledBalance > 0 ? unscheduledBalance.toFixed(2) : "";

        setDueInvoices(prev => [...prev, { due: initialDue, date: dateStr }]);
    };

    const removeInstallmentRow = (index) => {
        setDueInvoices(prev => prev.filter((_, i) => i !== index));
    };

    const handleInstallmentChange = (index, field, value) => {
        const updated = [...dueInvoices];
        updated[index][field] = value;
        setDueInvoices(updated);
    };

    const handleAutoSplit = () => {
        const count = parseInt(splitCount) || 1;
        if (count <= 0) return;
        if (remainingAmount <= 0) return;

        const eachAmount = parseFloat((remainingAmount / count).toFixed(2));
        const newInvoices = [];
        const start = new Date(splitStartDate || new Date());

        let accumulated = 0;
        for (let i = 0; i < count; i++) {
            const d = new Date(start);
            if (splitInterval === "weekly") {
                d.setDate(d.getDate() + i * 7);
            } else {
                d.setMonth(d.getMonth() + i);
            }

            let amt = eachAmount;
            if (i === count - 1) {
                amt = Math.max(0, parseFloat((remainingAmount - accumulated).toFixed(2)));
            } else {
                accumulated += amt;
            }

            newInvoices.push({
                due: amt.toFixed(2),
                date: d.toISOString().split("T")[0],
            });
        }

        setDueInvoices(newInvoices);
        setShowAutoSplitModal(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, receipt: file }));
        }
        if (e.target) e.target.value = "";
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedStore) return auth.toastError(t("Please select store"));
        if (!selectedSupplier) return auth.toastError(t("Please select supplier"));
        if (!formData.total_coast || parseFloat(formData.total_coast) <= 0) {
            return auth.toastError(t("Invalid total cost"));
        }

        // Validate that at least one product or material row is added
        if (productItems.length === 0 && materialItems.length === 0) {
            return auth.toastError(t("Please add at least one product or material"));
        }

        // Validate product items
        for (let i = 0; i < productItems.length; i++) {
            const it = productItems[i];
            if (!it.item_id) {
                return auth.toastError(`${t("Please select item")} (${t("Product")} #${i + 1})`);
            }
            if (!it.count || parseFloat(it.count) <= 0) {
                return auth.toastError(`${t("Invalid quantity")} (${t("Product")} #${i + 1})`);
            }
        }

        // Validate material items
        for (let i = 0; i < materialItems.length; i++) {
            const it = materialItems[i];
            if (!it.item_id) {
                return auth.toastError(`${t("Please select item")} (${t("Material")} #${i + 1})`);
            }
            if (!it.count || parseFloat(it.count) <= 0) {
                return auth.toastError(`${t("Invalid quantity")} (${t("Material")} #${i + 1})`);
            }
        }

        const totalCost = parseFloat(formData.total_coast);
        if (totalPaymentAmount > totalCost) {
            return auth.toastError(t("Total payment cannot exceed total cost"));
        }

        // Validate installments if any are added
        if (remainingAmount > 0 && dueInvoices.length > 0) {
            for (let i = 0; i < dueInvoices.length; i++) {
                const inv = dueInvoices[i];
                if (!inv.date) {
                    return auth.toastError(`${t("Due Date")} ${t("Item")} #${i + 1}`);
                }
                if (!inv.due || parseFloat(inv.due) <= 0) {
                    return auth.toastError(`${t("Installment Amount")} #${i + 1}`);
                }
            }

            if (Math.abs(totalScheduledAmount - remainingAmount) > 0.05) {
                return auth.toastError(
                    `${t("Please schedule all remaining due amount")} (${t("Remaining Due to Schedule")}: ${remainingAmount.toFixed(2)} ${t("EGP")}, ${t("Scheduled Amount")}: ${totalScheduledAmount.toFixed(2)} ${t("EGP")})`
                );
            }
        }

        const fd = new FormData();
        fd.append("store_id", selectedStore.value);
        fd.append("supplier_id", selectedSupplier.value);
        fd.append("total_coast", formData.total_coast);
        fd.append("date", formData.date);

        if (formData.receipt) {
            fd.append("receipt", formData.receipt);
        }

        // Append product items
        productItems.forEach((item, index) => {
            fd.append(`products[${index}][item_id]`, item.item_id);
            if (item.unit_id) {
                fd.append(`products[${index}][unit_id]`, item.unit_id);
            }
            fd.append(`products[${index}][count]`, item.count);
        });

        // Append material items
        materialItems.forEach((item, index) => {
            fd.append(`materials[${index}][item_id]`, item.item_id);
            if (item.unit_id) {
                fd.append(`materials[${index}][unit_id]`, item.unit_id);
            }
            fd.append(`materials[${index}][count]`, item.count);
        });

        // Append payment methods if any
        let validFinancialIdx = 0;
        formData.financial.forEach((f) => {
            if (f.id && f.amount && parseFloat(f.amount) > 0) {
                fd.append(`financial[${validFinancialIdx}][id]`, f.id);
                fd.append(`financial[${validFinancialIdx}][amount]`, f.amount);
                validFinancialIdx++;
            }
        });

        // Append scheduled installments if any
        dueInvoices.forEach((inv, index) => {
            if (inv.due && parseFloat(inv.due) > 0) {
                fd.append(`due_invoices[${index}][due]`, inv.due);
                fd.append(`due_invoices[${index}][date]`, inv.date);
            }
        });

        postData(fd);
    };

    const handleReset = () => {
        setSelectedStore(null);
        setSelectedSupplier(null);
        setProductItems([]);
        setMaterialItems([]);
        setDueInvoices([]);
        setFormData({
            store_id: "",
            supplier_id: "",
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
            padding: "0.4rem",
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

                        {/* Basic Info: Store, Supplier, Date, Receipt */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
                            {/* Store */}
                            <div>
                                <label className="block mb-2 text-base font-medium text-thirdColor">
                                    {t("Store")} *
                                </label>
                                <Select
                                    value={selectedStore}
                                    onChange={handleStoreChange}
                                    options={stores}
                                    placeholder={t("Select Store")}
                                    isClearable
                                    isSearchable
                                    styles={selectStyles}
                                />
                            </div>

                            {/* Supplier */}
                            <div>
                                <label className="block mb-2 text-base font-medium text-thirdColor">
                                    {t("Supplier")} *
                                </label>
                                <Select
                                    value={selectedSupplier}
                                    onChange={handleSupplierChange}
                                    options={suppliers}
                                    placeholder={t("Select Supplier")}
                                    isClearable
                                    isSearchable
                                    styles={selectStyles}
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block mb-2 text-base font-medium text-thirdColor">
                                    {t("Date")} *
                                </label>
                                <TextInput
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange("date", e.target.value)}
                                />
                            </div>

                            {/* Receipt Upload */}
                            <div>
                                <label className="block mb-2 text-base font-medium text-thirdColor">
                                    {t("Receipt")}
                                </label>
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

                        {/* Products Section */}
                        <div className="mb-8 p-5 bg-blue-50/40 border border-blue-200/70 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {t("Products")} ({productItems.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addProductRow}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
                                >
                                    <IoAddCircleOutline size={18} />
                                    <span>{t("Add Product")}</span>
                                </button>
                            </div>

                            {productItems.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-sm bg-white/60 rounded-xl border border-dashed border-gray-300">
                                    {t("No products added")}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {productItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm items-end"
                                        >
                                            {/* Product Select */}
                                            <div className="sm:col-span-5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    {t("Product")} #{index + 1} *
                                                </label>
                                                <Select
                                                    value={products.find(opt => opt.value === item.item_id) || null}
                                                    onChange={(opt) => handleProductChange(index, "item_id", opt ? opt.value : "")}
                                                    options={products}
                                                    placeholder={t("Search and select product...")}
                                                    isClearable
                                                    isSearchable
                                                    styles={selectStyles}
                                                />
                                            </div>

                                            {/* Unit Select */}
                                            <div className="sm:col-span-3">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    {t("Unit")}
                                                </label>
                                                <Select
                                                    value={units.find(u => u.value === item.unit_id) || null}
                                                    onChange={(opt) => handleProductChange(index, "unit_id", opt ? opt.value : "")}
                                                    options={units}
                                                    placeholder={t("Select Unit")}
                                                    isClearable
                                                    isSearchable
                                                    styles={selectStyles}
                                                />
                                            </div>

                                            {/* Quantity */}
                                            <div className="sm:col-span-3">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    {t("Quantity")} *
                                                </label>
                                                <TextInput
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    value={item.count}
                                                    onChange={(e) => handleProductChange(index, "count", e.target.value)}
                                                    placeholder={t("Enter Quantity")}
                                                />
                                            </div>

                                            {/* Remove button */}
                                            <div className="sm:col-span-1 flex justify-center pb-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removeProductRow(index)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                    title={t("Remove")}
                                                >
                                                    <IoClose size={22} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Raw Materials Section */}
                        <div className="mb-8 p-5 bg-purple-50/40 border border-purple-200/70 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {t("Raw Materials")} ({materialItems.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addMaterialRow}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
                                >
                                    <IoAddCircleOutline size={18} />
                                    <span>{t("Add Material")}</span>
                                </button>
                            </div>

                            {materialItems.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-sm bg-white/60 rounded-xl border border-dashed border-gray-300">
                                    {t("No raw materials added")}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {materialItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm items-end"
                                        >
                                            {/* Material Select */}
                                            <div className="sm:col-span-5">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    {t("Material")} #{index + 1} *
                                                </label>
                                                <Select
                                                    value={materials.find(opt => opt.value === item.item_id) || null}
                                                    onChange={(opt) => handleMaterialChange(index, "item_id", opt ? opt.value : "")}
                                                    options={materials}
                                                    placeholder={t("Search and select material...")}
                                                    isClearable
                                                    isSearchable
                                                    styles={selectStyles}
                                                />
                                            </div>

                                            {/* Unit Select */}
                                            <div className="sm:col-span-3">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    {t("Unit")}
                                                </label>
                                                <Select
                                                    value={units.find(u => u.value === item.unit_id) || null}
                                                    onChange={(opt) => handleMaterialChange(index, "unit_id", opt ? opt.value : "")}
                                                    options={units}
                                                    placeholder={t("Select Unit")}
                                                    isClearable
                                                    isSearchable
                                                    styles={selectStyles}
                                                />
                                            </div>

                                            {/* Quantity */}
                                            <div className="sm:col-span-3">
                                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                                    {t("Quantity")} *
                                                </label>
                                                <TextInput
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    value={item.count}
                                                    onChange={(e) => handleMaterialChange(index, "count", e.target.value)}
                                                    placeholder={t("Enter Quantity")}
                                                />
                                            </div>

                                            {/* Remove button */}
                                            <div className="sm:col-span-1 flex justify-center pb-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removeMaterialRow(index)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                    title={t("Remove")}
                                                >
                                                    <IoClose size={22} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cost & Payment Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {/* Total Cost Input */}
                            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <label className="block mb-2 text-base font-semibold text-thirdColor">
                                    {t("Total Cost")} *
                                </label>
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.total_coast}
                                    onChange={(e) => handleInputChange("total_coast", e.target.value)}
                                    placeholder={t("Enter Total Cost")}
                                />
                            </div>

                            {/* Paid Now Display */}
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col justify-between">
                                <span className="text-sm font-medium text-green-800 uppercase">
                                    {t("Paid Amount")} ({t("Now")})
                                </span>
                                <span className="text-2xl font-bold text-green-700 mt-2">
                                    {totalPaymentAmount.toFixed(2)} {t("EGP")}
                                </span>
                            </div>

                            {/* Remaining Due Display */}
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col justify-between">
                                <span className="text-sm font-medium text-red-800 uppercase">
                                    {t("Due Amount")} ({t("Remaining")})
                                </span>
                                <span className="text-2xl font-bold text-red-700 mt-2">
                                    {remainingAmount.toFixed(2)} {t("EGP")}
                                </span>
                            </div>
                        </div>

                        {/* Financial Payment Methods */}
                        <div className="mb-8 p-5 bg-gray-50/70 border border-gray-200 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-thirdColor">
                                        {t("Methods payment")}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {t("You can pay full, partial, or zero now. An invoice will be generated automatically for the paid amount.")}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addFinancialMethod}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                                >
                                    + {t("Add Payment Method")}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.financial.map((financial, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm items-end"
                                    >
                                        <div className="md:col-span-6">
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                {t("Methods")}:
                                            </label>
                                            <Select
                                                value={financials.find(f => f.value === financial.id) || null}
                                                onChange={(opt) =>
                                                    handleFinancialChange(index, "id", opt ? opt.value : "")
                                                }
                                                options={financials}
                                                placeholder={t("Select Payment Method")}
                                                isClearable
                                                isSearchable
                                                styles={selectStyles}
                                            />
                                        </div>
                                        <div className="md:col-span-5">
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                {t("Amount")}:
                                            </label>
                                            <TextInput
                                                type="number"
                                                step="0.01"
                                                value={financial.amount}
                                                onChange={(e) =>
                                                    handleFinancialChange(index, "amount", e.target.value)
                                                }
                                                placeholder={t("Enter Amount")}
                                                min="0"
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex justify-center pb-1">
                                            {formData.financial.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFinancialMethod(index)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <IoClose size={22} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Installment Schedule Section (Only visible when there is a remaining due amount) */}
                        {remainingAmount > 0 && (
                            <div className="mb-8 p-5 bg-amber-50/40 border border-amber-200/80 rounded-2xl shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                                    <div className="flex items-center gap-2">
                                        <IoCalendarOutline className="text-amber-600" size={22} />
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">
                                                {t("Installment Schedule")} ({dueInvoices.length})
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {t("Please schedule all remaining due amount")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setShowAutoSplitModal(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
                                        >
                                            <IoCalculatorOutline size={17} />
                                            <span>{t("Auto Split")}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addInstallmentRow}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-mainColor hover:opacity-90 text-white rounded-lg text-sm font-medium transition shadow-sm"
                                        >
                                            <IoAddCircleOutline size={18} />
                                            <span>{t("Add Installment")}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Summary Bar */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white border border-amber-200 rounded-xl mb-4 text-center">
                                    <div>
                                        <span className="text-xs text-gray-500 block">{t("Remaining Due to Schedule")}:</span>
                                        <span className="text-base font-bold text-gray-800">
                                            {remainingAmount.toFixed(2)} {t("EGP")}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">{t("Scheduled Amount")}:</span>
                                        <span className="text-base font-bold text-blue-700">
                                            {totalScheduledAmount.toFixed(2)} {t("EGP")}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">{t("Unscheduled Balance")}:</span>
                                        <span className={`text-base font-bold ${unscheduledBalance === 0 ? "text-green-600" : "text-red-600"}`}>
                                            {unscheduledBalance.toFixed(2)} {t("EGP")}
                                            {unscheduledBalance === 0 && " ✓"}
                                        </span>
                                    </div>
                                </div>

                                {/* Installments List */}
                                {dueInvoices.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 text-sm bg-white/70 rounded-xl border border-dashed border-amber-300">
                                        {t("No installments scheduled yet. Click '+ Add Installment' or 'Auto Split' to schedule payments.")}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dueInvoices.map((inv, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm items-end"
                                            >
                                                <div className="sm:col-span-1 text-center font-bold text-gray-500 pb-2.5 text-sm">
                                                    #{index + 1}
                                                </div>
                                                <div className="sm:col-span-5">
                                                    <label className="block mb-1 text-xs font-medium text-gray-600">
                                                        {t("Due Date")} *
                                                    </label>
                                                    <TextInput
                                                        type="date"
                                                        value={inv.date}
                                                        onChange={(e) => handleInstallmentChange(index, "date", e.target.value)}
                                                    />
                                                </div>
                                                <div className="sm:col-span-5">
                                                    <label className="block mb-1 text-xs font-medium text-gray-600">
                                                        {t("Installment Amount")} ({t("EGP")}) *
                                                    </label>
                                                    <TextInput
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={inv.due}
                                                        onChange={(e) => handleInstallmentChange(index, "due", e.target.value)}
                                                        placeholder={t("Enter Amount")}
                                                    />
                                                </div>
                                                <div className="sm:col-span-1 flex justify-center pb-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeInstallmentRow(index)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                        title={t("Remove")}
                                                    >
                                                        <IoClose size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 mt-8">
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
                                    disabled={totalPaymentAmount > (parseFloat(formData.total_coast) || 0)}
                                />
                            </div>
                        </div>
                    </form>

                    {/* Auto Split Modal */}
                    <Dialog
                        open={showAutoSplitModal}
                        onClose={() => setShowAutoSplitModal(false)}
                        className="relative z-50"
                    >
                        <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                        <div className="fixed inset-0 z-20 w-screen overflow-y-auto p-4 flex items-center justify-center">
                            <DialogPanel className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                    <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <IoCalculatorOutline className="text-amber-600" size={22} />
                                        <span>{t("Auto Split Installments")}</span>
                                    </DialogTitle>
                                    <button
                                        onClick={() => setShowAutoSplitModal(false)}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                                    >
                                        <IoClose size={20} />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                        <span className="text-xs text-amber-800 block font-medium">
                                            {t("Remaining Due to Schedule")}:
                                        </span>
                                        <span className="text-xl font-bold text-amber-900">
                                            {remainingAmount.toFixed(2)} {t("EGP")}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            {t("Number of Installments")}
                                        </label>
                                        <TextInput
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={splitCount}
                                            onChange={(e) => setSplitCount(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            {t("First Installment Date")}
                                        </label>
                                        <TextInput
                                            type="date"
                                            value={splitStartDate}
                                            onChange={(e) => setSplitStartDate(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium text-gray-700">
                                            {t("Interval")}
                                        </label>
                                        <select
                                            value={splitInterval}
                                            onChange={(e) => setSplitInterval(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                                        >
                                            <option value="monthly">{t("Monthly")}</option>
                                            <option value="weekly">{t("Weekly")}</option>
                                        </select>
                                    </div>

                                    {splitCount > 0 && remainingAmount > 0 && (
                                        <div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                                            {t("Installment Amount")}: ~{(remainingAmount / splitCount).toFixed(2)} {t("EGP")} / {splitInterval === "weekly" ? t("Weekly") : t("Monthly")}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAutoSplitModal(false)}
                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-sm font-medium transition"
                                    >
                                        {t("Cancel")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAutoSplit}
                                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition"
                                    >
                                        {t("Generate Installments")}
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog>
                </section>
            )}
        </>
    );
};

export default AddPurchaseList;
