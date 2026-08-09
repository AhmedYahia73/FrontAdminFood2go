// src/pages/Admin/Purchase/PurchaseCount.jsx
import React, { useEffect, useState } from "react";
import { TitlePage, StaticLoader } from "../../../../Components/Components";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useGet } from "../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import Select from "react-select";

const StockCount = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [type, setType] = useState("product"); // product or material
    const [selectedStore, setSelectedStore] = useState(null);

    // Fetch stores list
    const {
        loading: loadingStores,
        data: storesData,
        refetch: refetchStores,
    } = useGet({ url: `${apiUrl}/admin/purchase_product/stores_list` });

    // Fetch stock based on type + store
    const {
        loading: loadingStock,
        data: stockData,
        refetch: refetchStock,
    } = useGet({
        url: selectedStore
            ? `${apiUrl}/admin/${type === "product" ? "purchase_product" : "material_product"}/stock?store_id=${selectedStore.value}`
            : null,
        enabled: !!selectedStore,
    });

    const [stores, setStores] = useState([]);

    useEffect(() => {
        refetchStores();
    }, []);

    useEffect(() => {
        if (storesData?.stores) {
            setStores(storesData.stores.map(s => ({ value: s.id, label: s.name })));
        }
    }, [storesData]);

    // Refetch stock when type or store changes
    useEffect(() => {
        if (selectedStore) {
            refetchStock();
        }
    }, [type, selectedStore]);

    const items = type === "product" ? stockData?.products || [] : stockData?.materials || [];
    const categories = stockData?.categories || [];

    const getCategoryName = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name : "-";
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            border: "1px solid #D1D5DB",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            boxShadow: "none",
            "&:hover": { borderColor: "#9CA3AF" },
        }),
    };

    return (
        <section className="pb-32">
            <div className="flex items-center gap-4 p-4 border-b">
                <button onClick={() => navigate(-1)} className="text-mainColor hover:text-red-700">
                    <IoArrowBack size={28} />
                </button>
                <TitlePage text={t("Stock Count")} />
            </div>

            <div className="p-2 md:p-6">
                {/* Type & Store Selection */}
                <div className="w-full bg-white rounded-xl shadow-lg p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                        {/* Type Selection */}
                        <div>
                            <label className="block text-xl font-medium text-thirdColor mb-3">
                                {t("Type")}
                            </label>
                            <div className="flex gap-10">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="product"
                                        checked={type === "product"}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-5 h-5 text-red-600"
                                    />
                                    <span className="text-lg">{t("Product")}</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="material"
                                        checked={type === "material"}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-5 h-5 text-red-600"
                                    />
                                    <span className="text-lg">{t("Material")}</span>
                                </label>
                            </div>
                        </div>

                        {/* Store Selection */}
                        <div>
                            <label className="block text-xl font-medium text-thirdColor mb-3">
                                {t("Store")} *
                            </label>
                            <Select
                                value={selectedStore}
                                onChange={setSelectedStore}
                                options={stores}
                                placeholder={t("Select Store")}
                                isClearable
                                isSearchable
                                isLoading={loadingStores}
                                styles={selectStyles}
                                className="text-lg"
                            />
                        </div>
                    </div>

                    {/* Loading Stock */}
                    {loadingStock && (
                        <div className="flex justify-center py-20">
                            <StaticLoader />
                        </div>
                    )}

                    {/* No Store Selected */}
                    {!selectedStore && !loadingStock && (
                        <div className="text-center py-20 text-gray-500 text-xl">
                            {t("Please select a store to view stock")}
                        </div>
                    )}



                    {/* Stock Table */}
                    {selectedStore && !loadingStock && items.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    {/* Top Row: Totals positioned exactly above specific columns */}
                                    <tr className="border-none">
                                        {/* Empty cells for columns before Cost(T)A */}
                                        <th className="border-none p-0" colSpan="7"></th>

                                        {/* Total Cost (Avg) Box */}
                                        <th className="px-6 pb-2 text-left border-none p-0">
                                            <div className="bg-green-900 border border-green-200 rounded-lg py-2 px-3 inline-block min-w-full text-center">
                                                <div className="text-xl font-bold text-white">
                                                    {parseFloat(stockData?.total_cost || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </th>

                                        {/* Total Cost (Last) Box */}
                                        <th className="px-6 pb-2 text-left border-none p-0">
                                            <div className="bg-blue-900 border border-blue-200 rounded-lg py-2 px-3 inline-block min-w-full text-center">
                                                <div className="text-xl font-bold text-white">
                                                    {parseFloat(stockData?.total_last_cost || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </th>

                                        {/* Empty cell for Status */}
                                        <th className="border-none p-0"></th>
                                    </tr>

                                    {/* Bottom Row: Standard Column Headers */}
                                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">#</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Name")}</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Category")}</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Current Stock")}</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Min Stock")}</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Cost(U)A")}</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Cost(U)L")}</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Cost(T)A")}</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Cost(T)L")}</th>
                                        <th className="text-left px-6 py-4 text-lg font-medium text-thirdColor">{t("Status")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const isLowStock = item.stock < (item.min_stock || 0);
                                        return (
                                            <tr
                                                key={item.id}
                                                className={`border-b hover:bg-gray-50 transition ${isLowStock ? "bg-red-50" : ""}`}
                                            >
                                                <td className="text-left px-6 py-4 text-lg">{index + 1}</td>
                                                <td className="text-left px-6 py-4 text-lg font-medium">{item.name}</td>
                                                <td className="text-left px-6 py-4 text-lg text-gray-600">
                                                    {getCategoryName(item.category_id)}
                                                </td>
                                                <td className="text-left px-6 py-4">
                                                    <span className={`text-lg font-bold ${isLowStock ? "text-red-600" : "text-green-600"}`}>
                                                        {item.stock}
                                                    </span>
                                                </td>
                                                <td className="text-left px-6 py-4 text-lg">{item.min_stock || 0}</td>
                                                <td className="text-left px-6 py-4 text-lg">
                                                    {parseFloat(item.cost || 0).toFixed(2)}EGP
                                                </td>
                                                <td className="text-left px-6 py-4 text-lg">
                                                    {parseFloat(item.last_cost || 0).toFixed(2)}EGP
                                                </td>
                                                <td className="text-left px-6 py-4 text-lg">
                                                    {parseFloat(item.total_cost || 0).toFixed(2)}EGP
                                                </td>
                                                <td className="text-left px-6 py-4 text-lg">
                                                    {parseFloat(item.total_last_cost || 0).toFixed(2)}EGP
                                                </td>
                                                <td className="text-left px-6 py-4">
                                                    {isLowStock ? (
                                                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                            {t("Low Stock")}
                                                        </span>
                                                    ) : (
                                                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                            {t("In Stock")}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* No Data */}
                    {selectedStore && !loadingStock && items.length === 0 && (
                        <div className="text-center py-20 text-gray-500 text-xl">
                            {t("No items found in this store")}
                        </div>
                    )}
                </div>
            </div>
        </section >
    );
};

export default StockCount;