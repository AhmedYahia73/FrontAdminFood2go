import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { IoLocationSharp, IoStatsChart, IoRestaurant, IoPeople, IoLayers, IoCart, IoInformationCircle } from "react-icons/io5";
import { MdTableRestaurant, MdOutlineChair, MdHourglassTop, MdTakeoutDining, MdCheckCircle } from "react-icons/md";
import { TitlePage, LoaderLogin, StaticLoader } from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";

const DineOrders = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // States
    const [selectedHall, setSelectedHall] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [activeTab, setActiveTab] = useState("captain"); // "captain" or "table"

    // 1. Fetch Halls
    const { data: hallData, loading: loadingHalls } = useGet({ 
        url: `${apiUrl}/admin/caffe_location` 
    });

    // 2. Fetch Tables (when hall is selected)
    const tablesUrl = selectedHall ? `${apiUrl}/admin/pos/orders/tables/${selectedHall.value}` : null;
    const { data: tableData, loading: loadingTables } = useGet({ 
        url: tablesUrl 
    });

    // 3. Fetch Captain Orders (when table is selected)
    const captainOrdersUrl = (selectedTable && activeTab === "captain") 
        ? `${apiUrl}/admin/pos/orders/captain_orders/${selectedTable.id}` 
        : null;
    const { data: captainOrdersData, loading: loadingCaptainOrders, refetch: refetchCaptainOrders } = useGet({ 
        url: captainOrdersUrl 
    });

    // 4. Fetch Table Orders (when table is selected)
    const tableOrdersUrl = (selectedTable && activeTab === "table") 
        ? `${apiUrl}/admin/pos/orders/table_order_orders/${selectedTable.id}` 
        : null;
    const { data: tableOrdersData, loading: loadingTableOrders, refetch: refetchTableOrders } = useGet({ 
        url: tableOrdersUrl 
    });

    // 5. Update Status Hook
    const { postData, loadingPost } = usePost({
        url: `${apiUrl}/admin/pos/orders/preparing`,
        type: true // JSON
    });

    const refetchOrders = () => {
        if (activeTab === "captain") refetchCaptainOrders();
        else refetchTableOrders();
    };

    // Derived Data
    const hallOptions = hallData?.locations?.map(h => ({ value: h.id, label: h.name })) || [];
    const tables = tableData?.tables || [];
    
    // Flatten carts from the specialized API response format
    const getFlattenedCarts = (data) => {
        if (!data?.carts) return [];
        // The API returns an array of arrays [[item, item], [item]]
        return data.carts.flat();
    };

    const currentOrders = activeTab === "captain" 
        ? getFlattenedCarts(captainOrdersData) 
        : getFlattenedCarts(tableOrdersData);

    const isLoadingOrders = loadingCaptainOrders || loadingTableOrders || loadingPost;

    // Table Options for Mobile Select
    const tableOptions = tables.map(table => ({
        value: table.id,
        label: `${table.table_number} (${table.capacity} ${t("Cap")}) - ${t(table.current_status)}`,
        data: table
    }));

    // Handle Status Change
    const handleStatusUpdate = async (item, newStatus) => {
        const payload = {
            preparing: [
                {
                    cart_id: item.cart_id,
                    status: newStatus,
                    count: item.count
                }
            ],
            table_id: selectedTable.id
        };

        const success = await postData(payload, t("Status updated successfully"));
        if (success) {
            refetchOrders();
        }
    };

    // Table Status Helper
    const getStatusColor = (status) => {
        switch (status) {
            case "available": return "bg-green-100 text-green-700 border-green-200";
            case "not_available_with_order": return "bg-red-100 text-red-700 border-red-200";
            case "not_available_pre_order": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="p-2 md:p-6 w-full min-h-screen bg-gray-50/50 flex flex-col gap-3">
            <TitlePage text={t("Dine Orders")} />

            {/* Hall Selection Section */}
            <div className="bg-white p-2 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 text-mainColor shrink-0">
                    <div className="p-3 bg-red-50 rounded-xl">
                        <IoLocationSharp size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">{t("Hall Location")}</h2>
                        <p className="text-sm text-gray-500">{t("Select a hall to view tables")}</p>
                    </div>
                </div>
                <div className="flex-1 max-w-md">
                    <Select
                        options={hallOptions}
                        value={selectedHall}
                        onChange={(val) => {
                            setSelectedHall(val);
                            setSelectedTable(null);
                        }}
                        isLoading={loadingHalls}
                        placeholder={t("Select Hall...")}
                        className="text-black"
                        classNamePrefix="select"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-6">
                
                {/* Tables Selection Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <MdTableRestaurant className="text-mainColor" size={20} />
                            {t("Tables Selection")}
                        </h3>
                        {selectedHall && (
                            <span className="text-xs font-bold text-mainColor bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                {tables.length} {t("Tables Available")}
                            </span>
                        )}
                    </div>

                    <div className="p-4">
                        {/* Mobile View: Select Dropdown */}
                        <div className="lg:hidden">
                            {!selectedHall ? (
                                <p className="text-center text-sm text-gray-400 py-2 italic">{t("Please select a hall first")}</p>
                            ) : (
                                <Select
                                    options={tableOptions}
                                    value={selectedTable ? { value: selectedTable.id, label: selectedTable.table_number } : null}
                                    onChange={(val) => setSelectedTable(val.data)}
                                    placeholder={t("Select Table...")}
                                    className="text-black"
                                    classNamePrefix="select"
                                />
                            )}
                        </div>

                        {/* Desktop View: Interactive Row/Grid */}
                        <div className="hidden lg:block">
                            {loadingTables ? (
                                <div className="flex justify-center items-center py-10"><StaticLoader /></div>
                            ) : !selectedHall ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3 grayscale opacity-60">
                                    <MdOutlineChair size={48} />
                                    <p className="font-medium text-sm">{t("Please select a hall first")}</p>
                                </div>
                            ) : tables.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 font-medium">
                                    {t("No tables found in this hall")}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-4">
                                    {tables.map((table) => {
                                        const isSelected = selectedTable?.id === table.id;
                                        const statusClasses = getStatusColor(table.current_status);
                                        
                                        return (
                                            <button
                                                key={table.id}
                                                onClick={() => setSelectedTable(table)}
                                                className={`relative min-w-[120px] flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 ${
                                                    isSelected 
                                                    ? "border-mainColor bg-red-50/50 ring-2 ring-red-100 scale-105 z-10" 
                                                    : "border-gray-50 bg-gray-50/30 hover:border-red-100 hover:bg-white hover:shadow-sm"
                                                }`}
                                            >
                                                <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
                                                    table.current_status === "available" ? "bg-green-500" : 
                                                    table.current_status === "not_available_with_order" ? "bg-red-500" : "bg-orange-500"
                                                }`}></div>
                                                
                                                <MdTableRestaurant size={24} className={`${isSelected ? "text-mainColor" : "text-gray-300"}`} />
                                                
                                                <span className={`mt-1 font-black text-sm ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
                                                    {table.table_number}
                                                </span>
                                                
                                                <div className="mt-1 flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    <IoPeople size={10} />
                                                    {table.capacity}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                        {/* Header & Tabs */}
                        <div className="p-2 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center gap-2">
                            <div className="flex-1 px-4 py-2 border-r border-gray-100 hidden sm:block">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <IoStatsChart className="text-mainColor" size={18} />
                                    {selectedTable ? `${t("Order Details")} - ${selectedTable.table_number}` : t("Order Details")}
                                </h3>
                            </div>
                            
                            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                                <button
                                    onClick={() => setActiveTab("captain")}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                                        activeTab === "captain" 
                                        ? "bg-mainColor text-white shadow-md" 
                                        : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <IoLayers size={18} />
                                    {t("Captain Orders")}
                                </button>
                                <button
                                    onClick={() => setActiveTab("table")}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                                        activeTab === "table" 
                                        ? "bg-mainColor text-white shadow-md" 
                                        : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <IoRestaurant size={18} />
                                    {t("Table Orders")}
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                            {!selectedTable ? (
                                <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4 grayscale opacity-60">
                                    <div className="p-6 bg-gray-100 rounded-full">
                                        <IoInformationCircle size={64} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-600">{t("No Table Selected")}</p>
                                        <p className="text-xs max-w-[200px] mt-1 italic">{t("Click on a table in the grid to view its active orders")}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {isLoadingOrders ? (
                                        <div className="flex justify-center items-center h-64"><StaticLoader /></div>
                                    ) : currentOrders.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-3">
                                            <div className="p-5 bg-gray-50 rounded-full">
                                                <IoCart size={48} className="text-gray-200" />
                                            </div>
                                            <p className="font-bold text-sm">{t("No active items in this category")}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {currentOrders.map((item, idx) => (
                                                <div key={`${item.id}-${idx}`} className="group relative flex flex-col lg:flex-row items-start gap-4 p-4 bg-white border border-gray-100 rounded-3xl hover:border-mainColor/20 transition-all duration-300">
                                                    
                                                    {/* Image Section */}
                                                    <div className="w-full lg:w-28 h-32 lg:h-28 shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
                                                        <img 
                                                            src={item.image_link} 
                                                            alt={item.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute top-2 left-2 lg:hidden">
                                                            <div className="bg-mainColor text-white text-[10px] font-black px-2 py-1 rounded-lg">
                                                                x{item.count}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Info Section */}
                                                    <div className="flex-1 min-w-0 w-full">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="flex flex-col">
                                                                <h4 className="font-black text-gray-900 text-lg lg:text-xl truncate tracking-tight">
                                                                    {item.name}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {item.discount && (
                                                                        <span className="text-green-600 text-[9px] font-black uppercase">
                                                                            {item.discount.amount}{item.discount.type === "precentage" ? "% Off" : " EGP Off"}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <div className="hidden lg:block bg-mainColor/5 text-mainColor text-xs font-black px-3 py-1 rounded-lg">
                                                                    x{item.count}
                                                                </div>
                                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                                                                    item.prepration === "preparing" 
                                                                    ? "bg-orange-50 text-orange-500 border-orange-100" 
                                                                    : item.prepration === "pickup"
                                                                    ? "bg-blue-50 text-blue-500 border-blue-100"
                                                                    : "bg-green-50 text-green-500 border-green-100"
                                                                }`}>
                                                                    {t(item.prepration)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-xs text-gray-400 mt-2 line-clamp-1 italic">
                                                            {item.description || t("No description provided")}
                                                        </p>

                                                        {/* Compact Variations & Addons */}
                                                        {(item.variation_selected?.length > 0 || item.addons_selected?.length > 0) && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {item.variation_selected?.map((varItem) => (
                                                                    <div key={varItem.id} className="flex flex-col p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                                                        <span className="text-sm font-black text-gray-400 uppercase leading-none mb-1">
                                                                            {varItem.name}
                                                                        </span>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {varItem.options?.map((opt) => (
                                                                                <span key={opt.id} className="text-sm font-bold text-gray-700">
                                                                                    {opt.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {item.addons_selected?.map((addon) => (
                                                                    <div key={addon.id} className="flex flex-col p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                                                        <span className="text-sm font-black text-gray-400 uppercase leading-none mb-1">
                                                                            {t("Addon")}
                                                                        </span>
                                                                        <span className="text-sm font-bold text-gray-700">
                                                                            {addon.name}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-2xl font-black text-mainColor">
                                                                    {item.final_price}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-400">
                                                                    {t("EGP")}
                                                                </span>
                                                            </div>

                                                            {/* Optimized Status Buttons */}
                                                            <div className="grid grid-cols-3 sm:flex items-center gap-2">
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(item, "preparing")}
                                                                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                                                                        item.prepration === "preparing" 
                                                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                                                                        : "bg-gray-50 text-gray-400 hover:text-orange-500"
                                                                    }`}
                                                                >
                                                                    <MdHourglassTop size={14} />
                                                                    <span>{t("prep")}</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(item, "pickup")}
                                                                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                                                                        item.prepration === "pickup" 
                                                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                                                                        : "bg-gray-50 text-gray-400 hover:text-blue-600"
                                                                    }`}
                                                                >
                                                                    <MdTakeoutDining size={14} />
                                                                    <span>{t("pick")}</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(item, "done")}
                                                                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                                                                        item.prepration === "done" 
                                                                        ? "bg-green-600 text-white shadow-lg shadow-green-600/20" 
                                                                        : "bg-gray-50 text-gray-400 hover:text-green-600"
                                                                    }`}
                                                                >
                                                                    <MdCheckCircle size={14} />
                                                                    <span>{t("done")}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Compact Summary Footer */}
                                            <div className="mt-8 p-6 bg-gray-900 rounded-3xl text-white shadow-xl shadow-gray-200 relative overflow-hidden">
                                                <div className="relative flex justify-between items-center gap-4">
                                                    <div>
                                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{t("Items")}</p>
                                                        <p className="text-xl font-black">
                                                            {currentOrders.reduce((acc, curr) => acc + (curr.count || 0), 0)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{t("Estimated Total")}</p>
                                                        <div className="flex items-baseline justify-end gap-1">
                                                            <span className="text-3xl font-black text-mainColor">
                                                                {currentOrders.reduce((acc, curr) => acc + (curr.final_price * (curr.count || 1)), 0).toFixed(2)}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-500 pr-1">{t("EGP")}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DineOrders;
