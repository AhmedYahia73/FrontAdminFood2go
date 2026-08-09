import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { TitlePage, StaticLoader } from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import { t } from "i18next";
import {
    FiPackage,
    FiClock,
    FiFileText,
    FiFile,
    FiDownload,
} from "react-icons/fi";

// Export Libraries
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const InventoryProduct = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();

    // API Hooks
    const { data: listsData, loading: loadingLists } = useGet({
        url: `${apiUrl}/admin/inventory/product/lists`,
    });

    const {
        postData: loadStocks,
        loading: loadingStocks,
        response: rawStocksData,
    } = usePost({
        url: `${apiUrl}/admin/inventory/product`,
    });

    const { postData: modifyQuantity } = usePost({
        url: `${apiUrl}/admin/inventory/product/modify_stocks`,
    });
    const { postData: modifyActual } = usePost({
        url: `${apiUrl}/admin/inventory/product/modify_actual`,
    });

    // Filter States
    const [selectedStore, setSelectedStore] = useState(null);
    const [filterType, setFilterType] = useState(null); // full | partial
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Table States
    const [stocks, setStocks] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [editQuantityMode, setEditQuantityMode] = useState(false);
    const [editActualMode, setEditActualMode] = useState(false);

    // Options
    const storeOptions = useMemo(
        () => (listsData?.stores || []).map((s) => ({ value: s.id, label: s.name })),
        [listsData?.stores]
    );

    const allCategoriesOption = { value: "__ALL_CATEGORIES__", label: t("All Categories") };
    const categoryOptions = useMemo(
        () => [
            allCategoriesOption,
            ...(listsData?.categories || []).map((c) => ({
                value: c.id,
                label: c.name,
            })),
        ],
        [listsData?.categories]
    );

    const typeOptions = [
        { value: "full", label: t("Full") },
        { value: "partial", label: t("Partial") },
    ];

    // Available products based on selected categories
    const availableProducts = useMemo(() => {
        if (selectedCategories.length === 0) return [];

        const categoryIds = selectedCategories
            .map((c) => c.value)
            .filter((v) => v !== "__ALL_CATEGORIES__");

        if (categoryIds.length === 0) return [];

        return (listsData?.products || [])
            .filter((p) => categoryIds.includes(p.category_id))
            .map((p) => ({ value: p.id, label: p.name }));
    }, [listsData?.products, selectedCategories]);

    const allProductsOption = { value: "__ALL_PRODUCTS__", label: t("All Products") };
    const productOptions = [allProductsOption, ...availableProducts];

    // Reset on type change
    useEffect(() => {
        setSelectedCategories([]);
        setSelectedProducts([]);
    }, [filterType]);

    // Handle "All Categories" click
    const handleCategoryChange = (selected) => {
        if (selected?.some((opt) => opt.value === "__ALL_CATEGORIES__")) {
            const allCats = (listsData?.categories || []).map((c) => ({
                value: c.id,
                label: c.name,
            }));
            setSelectedCategories(allCats);
        } else {
            setSelectedCategories(selected || []);
        }
    };

    // Handle "All Products" click
    const handleProductChange = (selected) => {
        if (selected?.some((opt) => opt.value === "__ALL_PRODUCTS__")) {
            setSelectedProducts(availableProducts); // Select all real products
        } else {
            // Remove the "All Products" pill if present
            setSelectedProducts(selected?.filter((opt) => opt.value !== "__ALL_PRODUCTS__") || []);
        }
    };

    // Load stocks from response
    useEffect(() => {
        const data = rawStocksData?.data?.stocks || rawStocksData?.stocks;
        if (data && Array.isArray(data)) {
            setStocks(
                data.map((item) => ({
                    ...item,
                    isEdited: false,
                    quantity: item.quantity ?? 0,
                    actual_quantity: item.actual_quantity ?? 0,
                    inability: item.inability ?? null,
                }))
            );
        }
    }, [rawStocksData]);

    // Apply Filter
    const handleFilterSubmit = async () => {
        if (!selectedStore) return auth.toastError(t("Please select a store"));
        if (!filterType) return auth.toastError(t("Please select filter type"));

        if (filterType.value === "partial" && selectedCategories.length === 0) {
            return auth.toastError(t("Please select at least one category"));
        }

        const payload = { store_id: selectedStore.value, type: filterType.value };

        if (filterType.value === "full") {
            payload.type = "full";
        } else {
            // Partial: get product IDs
            let productIds = [];

            if (selectedProducts.length > 0) {
                productIds = selectedProducts.map((p) => p.value);
            } else {
                // No specific products → send all from selected categories
                productIds = availableProducts.map((p) => p.value);
            }

            productIds.forEach((id, i) => {
                payload[`products[${i}]`] = id;
            });
        }

        await loadStocks(payload);
        setSelectedRows([]);
        setEditQuantityMode(false);
        setEditActualMode(false);
    };

    // Table row selection
    const toggleRow = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedRows(
            selectedRows.length === stocks.length ? [] : stocks.map((s) => s.id)
        );
    };

    const handleInputChange = (id, field, value) => {
        setStocks((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value, isEdited: true } : item
            )
        );
    };

    const saveQuantity = async () => {
        const changed = stocks.filter((s) => selectedRows.includes(s.id) && s.isEdited);
        if (changed.length === 0) return auth.toastError(t("No changes"));

        const formData = new FormData();
        changed.forEach((item, i) => {
            formData.append(`stocks[${i}][id]`, item.id);
            formData.append(`stocks[${i}][quantity]`, item.quantity);
        });

        const success = await modifyQuantity(formData);
        if (success) {
            auth.toastSuccess(t("Quantity updated"));
            setEditQuantityMode(false);
            setSelectedRows([]);
        }
    };

    const saveActualQuantity = async () => {
        const changed = stocks.filter((s) => selectedRows.includes(s.id) && s.isEdited);
        if (changed.length === 0) return auth.toastError(t("No changes"));

        const formData = new FormData();
        changed.forEach((item, i) => {
            formData.append(`stocks[${i}][id]`, item.id);
            formData.append(`stocks[${i}][actual_quantity]`, item.actual_quantity);
        });

        const success = await modifyActual(formData);
        if (success) {
            auth.toastSuccess(t("Actual quantity updated"));
            setEditActualMode(false);
            setSelectedRows([]);
        }
    };

    // Export Functions
    const getExportData = () =>
        selectedRows.length === 0
            ? stocks
            : stocks.filter((s) => selectedRows.includes(s.id));

    const exportPDF = () => {
        const data = getExportData();
        const doc = new jsPDF("p", "mm", "a4");
        doc.setFontSize(18);
        doc.text("Inventory Products Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Store: ${selectedStore?.label || "—"}`, 14, 30);
        doc.text(`Exported: ${data.length} items`, 14, 37);

        autoTable(doc, {
            head: [["Product", "Category", "Unit", "Quantity", "Actual Qty", "Shortage"]],
            body: data.map((s) => [
                s.product || "—",
                s.category || "—",
                s.unit || "—",
                s.quantity,
                s.actual_quantity,
                s.inability ?? "—",
            ]),
            startY: 45,
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        });

        doc.save(`inventory_${selectedStore?.label || "all"}_${new Date().toISOString().split("T")[0]}.pdf`);
    };

    const exportExcel = () => {
        const data = getExportData();
        const ws = XLSX.utils.json_to_sheet(
            data.map((s) => ({
                Product: s.product || "—",
                Category: s.category || "—",
                Unit: s.unit || "—",
                Quantity: s.quantity,
                "Actual Qty": s.actual_quantity,
                Shortage: s.inability ?? "—",
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, `inventory_${selectedStore?.label || "all"}_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const exportCSV = () => {
        const data = getExportData();
        const csv = Papa.unparse(
            data.map((s) => ({
                Product: s.product || "—",
                Category: s.category || "—",
                Unit: s.unit || "—",
                Quantity: s.quantity,
                "Actual Qty": s.actual_quantity,
                Shortage: s.inability ?? "—",
            }))
        );
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `inventory_${selectedStore?.label || "all"}_${new Date().toISOString().split("T")[0]}.csv`);
    };

    return (
        <div className="w-full p-6">
            <TitlePage text={t("Inventory Products")} />

            {/* Tabs */}
            <div className="flex gap-8 mb-10 border-b-2 border-gray-200">
                <button className="flex items-center gap-3 pb-4 text-lg font-semibold border-b-4 text-mainColor border-mainColor">
                    <FiPackage size={22} /> {t("Count Stock")}
                </button>
                <button className="flex items-center gap-3 pb-4 text-lg font-semibold text-gray-500">
                    <FiClock size={22} /> {t("History")}
                </button>
            </div>

            {/* Filters Card */}
            <div className="p-8 mb-8 bg-white shadow-md rounded-2xl">
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Store */}
                    <div>
                        <label className="block mb-3 text-lg font-medium text-gray-700">
                            {t("Store")} *
                        </label>
                        <Select
                            value={selectedStore}
                            onChange={setSelectedStore}
                            options={storeOptions}
                            placeholder={t("Select store")}
                            isLoading={loadingLists}
                            isClearable
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block mb-3 text-lg font-medium text-gray-700">
                            {t("Type")} *
                        </label>
                        <Select
                            value={filterType}
                            onChange={setFilterType}
                            options={typeOptions}
                            placeholder={t("Full or Partial")}
                            isClearable={false}
                        />
                    </div>

                    {/* Categories - Only in Partial */}
                    {filterType?.value === "partial" && (
                        <>
                            <div className="lg:col-span-2">
                                <label className="block mb-3 text-lg font-medium text-gray-700">
                                    {t("Categories")} *
                                </label>
                                <Select
                                    isMulti
                                    value={selectedCategories}
                                    onChange={handleCategoryChange}
                                    options={categoryOptions}
                                    placeholder={t("Click 'All Categories' or select manually")}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    styles={{
                                        multiValue: (base, { data }) => {
                                            if (data.value === "__ALL_CATEGORIES__") {
                                                return { ...base, backgroundColor: "#3b82f6", color: "white" };
                                            }
                                            return base;
                                        },
                                    }}
                                />
                                {selectedCategories.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {selectedCategories.length === (listsData?.categories?.length || 0)
                                            ? t("All categories selected")
                                            : `${selectedCategories.length} ${t("categories selected")}`}
                                    </p>
                                )}
                            </div>

                            {/* Products - Optional + All Products */}
                            <div className="lg:col-span-2">
                                <label className="block mb-3 text-lg font-medium text-gray-700">
                                    {t("Products")} ({t("Optional")})
                                </label>
                                <Select
                                    isMulti
                                    value={selectedProducts}
                                    onChange={handleProductChange}
                                    options={productOptions}
                                    placeholder={
                                        availableProducts.length === 0
                                            ? t("Select categories first")
                                            : t("Click 'All Products' or select specific")
                                    }
                                    closeMenuOnSelect={false}
                                    isDisabled={availableProducts.length === 0}
                                    hideSelectedOptions={false}
                                    styles={{
                                        multiValue: (base, { data }) => {
                                            if (data.value === "__ALL_PRODUCTS__") {
                                                return { ...base, backgroundColor: "#10b981", color: "white" };
                                            }
                                            return base;
                                        },
                                    }}
                                />
                                {selectedProducts.length > 0 ? (
                                    <p className="mt-2 text-sm text-green-600">
                                        {selectedProducts.length === availableProducts.length
                                            ? t("All products selected")
                                            : `${selectedProducts.length} ${t("products selected")}`}
                                    </p>
                                ) : selectedCategories.length > 0 ? (
                                    <p className="mt-2 text-sm text-gray-500">
                                        {availableProducts.length} {t("products available")} – {t("leave empty to load all")}
                                    </p>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>

                {/* Apply Filter Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleFilterSubmit}
                        disabled={loadingStocks}
                        className="flex items-center gap-3 px-8 py-3 font-semibold text-white transition bg-mainColor rounded-xl hover:bg-mainColor/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingStocks && <StaticLoader size={20} />}
                        {t("Apply Filter")}
                    </button>
                </div>
            </div>

            {/* Edit Mode & Export */}
            {stocks.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                    <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editQuantityMode}
                                onChange={(e) => {
                                    setEditQuantityMode(e.target.checked);
                                    if (!e.target.checked) setEditActualMode(false);
                                    setSelectedRows([]);
                                }}
                                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="flex items-center gap-2 text-lg font-medium">
                                <FiPackage /> {t("Edit Quantity")}
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editActualMode}
                                onChange={(e) => {
                                    setEditActualMode(e.target.checked);
                                    if (!e.target.checked) setEditQuantityMode(false);
                                    setSelectedRows([]);
                                }}
                                className="w-6 h-6 text-green-600 rounded focus:ring-green-500"
                            />
                            <span className="flex items-center gap-2 text-lg font-medium">
                                <FiPackage /> {t("Edit Actual Qty")}
                            </span>
                        </label>

                        {(editQuantityMode || editActualMode) && selectedRows.length > 0 && (
                            <div className="flex gap-3">
                                {editQuantityMode && (
                                    <button
                                        onClick={saveQuantity}
                                        className="px-5 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        {t("Save Quantity")}
                                    </button>
                                )}
                                {editActualMode && (
                                    <button
                                        onClick={saveActualQuantity}
                                        className="px-5 py-2 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        {t("Save Actual Qty")}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {selectedRows.length > 0 && (
                            <span className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">
                                {selectedRows.length} {t("selected")}
                            </span>
                        )}
                        <div className="flex gap-3">
                            <button onClick={exportPDF} className="p-3 text-white bg-red-600 rounded-full shadow-lg hover:bg-red-700" title="PDF">
                                <FiFileText size={20} />
                            </button>
                            <button onClick={exportExcel} className="p-3 text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700" title="Excel">
                                <FiFile size={20} />
                            </button>
                            <button onClick={exportCSV} className="p-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700" title="CSV">
                                <FiDownload size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            {loadingStocks ? (
                <div className="flex justify-center py-20">
                    <StaticLoader />
                </div>
            ) : !selectedStore || !filterType ? (
                <div className="py-20 text-xl text-center text-gray-500 bg-gray-50 rounded-2xl">
                    {t("Please select a store and filter type")}
                </div>
            ) : filterType?.value === "partial" && selectedCategories.length === 0 ? (
                <div className="py-20 text-xl text-center text-gray-500 bg-gray-50 rounded-2xl">
                    {t("Please select at least one category")}
                </div>
            ) : stocks.length === 0 ? (
                <div className="py-20 text-xl text-center text-gray-500 bg-gray-50 rounded-2xl">
                    {t("No products found")}
                </div>
            ) : (
                <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.length === stocks.length}
                                            onChange={selectAll}
                                            className="w-5 h-5 rounded"
                                        />
                                    </th>
                                   <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                        {t("Product")}
                                    </th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                        {t("Category")}
                                    </th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                        {t("Unit")}
                                    </th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                        {t("Quantity")}
                                    </th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                        {t("Actual Qty")}
                                    </th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                                        {t("Shortage")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stocks.map((item) => {
                                    const isSelected = selectedRows.includes(item.id);
                                    const canEditQty = editQuantityMode && isSelected;
                                    const canEditActual = editActualMode && isSelected;

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}
                                        >
                                            <td className="px-4 py-5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleRow(item.id)}
                                                    className="w-5 h-5 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-5 font-medium text-gray-900">
                                                {item.product || "—"}
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                {item.category || "—"}
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                {item.unit || "—"}
                                            </td>
                                            <td className="px-6 py-5">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    readOnly={!canEditQty}
                                                    onChange={(e) =>
                                                        handleInputChange(item.id, "quantity", e.target.value)
                                                    }
                                                    className={`w-28 px-3 py-2 border rounded-lg text-center font-medium transition ${canEditQty
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-300 bg-gray-100 cursor-not-allowed"
                                                        }`}
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <input
                                                    type="number"
                                                    value={item.actual_quantity}
                                                    readOnly={!canEditActual}
                                                    onChange={(e) =>
                                                        handleInputChange(item.id, "actual_quantity", e.target.value)
                                                    }
                                                    className={`w-28 px-3 py-2 border rounded-lg text-center font-medium transition ${canEditActual
                                                        ? "border-green-500 bg-green-50"
                                                        : "border-gray-300 bg-gray-100 cursor-not-allowed"
                                                        }`}
                                                />
                                            </td>
                                            <td
                                                className={`px-6 py-5 font-bold text-center ${item.inability >= 0
                                                    ? "text-green-600"
                                                    : item.inability < 0
                                                        ? "text-red-600"
                                                        : "text-gray-500"
                                                    }`}
                                            >
                                                {item.inability ?? "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryProduct;