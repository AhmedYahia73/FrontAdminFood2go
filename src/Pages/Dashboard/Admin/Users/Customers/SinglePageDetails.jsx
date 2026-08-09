import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import { StaticLoader } from "../../../../../Components/Components";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../../Context/Auth";

const SinglePageDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const auth = useAuth();

    // Get customer data from navigation state
    const [customerData] = useState(location.state?.customerData);

    const {
        refetch: refetchCustomerDetails,
        loading: loadingCustomerDetails,
        data: dataCustomerDetails,
    } = useGet({
        url: `${apiUrl}/admin/customer/customer_singl_page/${userId}`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/customer/single_page_filter/${userId}`,
    });

    // State management
    const [activeTab, setActiveTab] = useState("orders"); // orders, financials, stats
    const [financialSubTab, setFinancialSubTab] = useState("pending"); // pending, history
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filteredData, setFilteredData] = useState(null);

    // Modal state for financial details
    const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
    const [selectedFinancials, setSelectedFinancials] = useState([]);

    // Update filtered data from post response
    useEffect(() => {
        if (response && !loadingPost) {
            setFilteredData(response?.data || null);
            setCurrentPage(1); // Reset to first page on filter
        }
    }, [response, loadingPost]);

    // Apply date filter
    const handleFilter = async () => {
        if (!startDate || !endDate) {
            auth.toastError(t("Please select both start and end dates"));
            return;
        }
        await postData({ from_date: startDate, to_date: endDate });
    };

    // Clear filters
    const handleClearFilter = () => {
        setStartDate("");
        setEndDate("");
        setFilteredData(null);
        setCurrentPage(1);
        refetchCustomerDetails();
    };

    useEffect(() => {
        refetchCustomerDetails();
    }, [userId]);

    const displayData = filteredData || dataCustomerDetails;
    const ordersToDisplay = displayData?.orders || [];
    const userInfo = displayData?.user_info || customerData;
    const dueAmount = dataCustomerDetails?.due || 0;
    const orderDue = dataCustomerDetails?.order_due || [];
    const paidDebt = dataCustomerDetails?.paid_debt || [];
    const totalPaidDebt = dataCustomerDetails?.total_amount || 0;
    const greatestProduct = displayData?.greatest_product || dataCustomerDetails?.greatest_product;

    // Slicing logic for current active view
    const getPaginatedItems = (items) => {
        const total = Math.ceil((items?.length || 0) / itemsPerPage);
        const data = (items || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return { total, data };
    };

    const { total: totalOrderPages, data: currentOrders } = getPaginatedItems(ordersToDisplay);
    const { total: totalPendingPages, data: currentPending } = getPaginatedItems(orderDue);
    const { total: totalHistoryPages, data: currentHistory } = getPaginatedItems(paidDebt);

    if (loadingCustomerDetails || !customerData) {
        return (
            <div className="flex items-center justify-center w-full h-80">
                <StaticLoader />
            </div>
        );
    }

    // Helper Pagination Component
    const Pagination = ({ total, current, onChange }) => {
        if (total <= 1) return null;
        return (
            <div className="flex items-center justify-center gap-2 py-4">
                <button
                    disabled={current === 1}
                    onClick={() => onChange(prev => prev - 1)}
                    className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    {isRtl ? '▶' : '◀'}
                </button>
                <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                    {Array.from({ length: total }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            className={`min-w-[40px] h-10 px-2 rounded-xl text-sm font-TextFontBold transition-all ${current === p
                                ? 'bg-mainColor text-white shadow-md shadow-mainColor/30 scale-105'
                                : 'text-mainColor hover:bg-gray-50 border border-transparent'
                                }`}
                        >
                            {p}
                        </button>
                    )).slice(Math.max(0, current - 3), Math.min(total, current + 2))}
                </div>
                <button
                    disabled={current === total}
                    onClick={() => onChange(prev => prev + 1)}
                    className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                    {isRtl ? '◀' : '▶'}
                </button>
            </div>
        );
    };

    // Financial Details Modal Component
    const FinancialDetailModal = () => {
        if (!isFinancialModalOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-mainColor/5 to-transparent">
                        <h3 className="text-lg font-TextFontBold text-mainColor flex items-center gap-2">
                            💰 {t("Financial Details")}
                        </h3>
                        <button
                            onClick={() => setIsFinancialModalOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {selectedFinancials && selectedFinancials.length > 0 ? (
                            selectedFinancials.map((f, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t("Account Name")}</span>
                                        <span className="font-TextFontSemiBold text-gray-700">{f.financial || "-"}</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t("Amount")}</span>
                                        <span className="font-TextFontBold text-mainColor">{parseFloat(f.amount || 0).toFixed(2)} EGP</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 italic">
                                {t("No details available")}
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-gray-50 flex justify-end">
                        <button
                            onClick={() => setIsFinancialModalOpen(false)}
                            className="px-6 py-2.5 bg-mainColor text-white rounded-xl shadow-lg shadow-mainColor/20 hover:scale-105 active:scale-95 transition-all font-medium text-sm"
                        >
                            {t("Close")}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-2 md:p-4 xl:p-8 bg-gray-50 min-h-screen font-TextFontRegular" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header / Back */}
            <div className="flex items-center justify-between mb-4 xl:mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-3 py-2 text-mainColor transition-all duration-200 hover:scale-105 active:scale-95 group"
                >
                    <span className={`transform transition-transform group-hover:${isRtl ? 'translate-x-1' : '-translate-x-1'}`}>
                        {isRtl ? '←' : '←'}
                    </span>
                    <span className="font-TextFontMedium text-sm sm:text-base">{t("Back")}</span>
                </button>
            </div>

            {/* Professional Hero Card */}
            <div className="relative overflow-hidden mb-6 xl:mb-8 bg-white rounded-2xl xl:rounded-3xl shadow-xl border border-gray-100">
                <div className="absolute top-0 right-0 w-32 xl:w-64 h-32 xl:h-64 bg-mainColor/5 rounded-full -mr-10 xl:-mr-20 -mt-10 xl:-mt-20 blur-2xl xl:blur-3xl"></div>

                <div className="relative p-1 sm:p-2 md:p-4 xl:p-8 flex flex-col lg:flex-row items-center lg:items-start gap-2 sm:gap-4 xl:gap-8">
                    {/* Image / Avatar */}
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-mainColor/20 rounded-xl sm:rounded-2xl blur group-hover:blur-md transition-all duration-300"></div>
                        <img
                            src={userInfo?.image_link || "/placeholder-user.png"}
                            alt="Customer"
                            className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-xl sm:rounded-2xl object-cover shadow-lg border-2 border-white"
                        />
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 w-full text-center lg:text-left min-w-0">
                        <h1 className="text-xl sm:text-3xl md:text-4xl font-TextFontBold text-mainColor mb-2 leading-tight truncate">
                            {userInfo?.f_name} {userInfo?.l_name}
                        </h1>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4 text-gray-600 mb-4 sm:mb-6">
                            <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm truncate max-w-full">
                                📧 <span className="truncate">{userInfo?.email}</span>
                            </span>
                            <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm whitespace-nowrap">
                                📞 {userInfo?.phone}
                            </span>
                            <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm whitespace-nowrap">
                                📞 {userInfo?.phone_2}
                            </span>
                            {userInfo?.code && (
                                <span className="flex items-center gap-1 sm:gap-2 bg-mainColor/10 text-mainColor px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-semibold whitespace-nowrap">
                                    #{userInfo.code}
                                </span>
                            )}
                        </div>

                        {/* KPI Grid - Responsive Fixes */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                            <div className="bg-white p-2 md:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md min-w-0">
                                <p className="text-[9px] sm:text-[11px] text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">{t("TotalOrders")}</p>
                                <p className="text-sm md:text-xl font-TextFontBold text-mainColor truncate">{ordersToDisplay.length}</p>
                            </div>
                            <div className="bg-white p-2 md:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md min-w-0">
                                <p className="text-[9px] sm:text-[11px] text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">{t("Points")}</p>
                                <p className="text-sm md:text-xl font-TextFontBold text-mainColor truncate">{userInfo?.points || 0}</p>
                            </div>
                            <div className="bg-white p-2 md:p-4 rounded-xl sm:rounded-2xl border border-red-50 shadow-sm transition-all hover:shadow-md min-w-0 font-TextFontBold">
                                <p className="text-[9px] sm:text-[11px] text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">{t("DueAmount")}</p>
                                <p className="text-sm md:text-xl text-red-600 truncate">{dueAmount.toFixed(2)} EGP</p>
                            </div>
                            <div className="bg-white p-2 md:p-4 rounded-xl sm:rounded-2xl border border-green-50 shadow-sm transition-all hover:shadow-md min-w-0 font-TextFontBold">
                                <p className="text-[9px] sm:text-[11px] text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">{t("TotalPaid")}</p>
                                <p className="text-sm md:text-xl text-green-600 truncate">{totalPaidDebt.toFixed(2)} EGP</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab System Wrapper */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Tab Header */}
                <div className="flex border-b overflow-x-auto no-scrollbar">
                    {[
                        { id: "orders", label: t("OrderHistory"), icon: "🛒" },
                        { id: "financials", label: t("Financials"), icon: "💰" },
                        { id: "stats", label: t("Stats&Favorite"), icon: "📊" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                            className={`flex-1 min-w-[100px] py-3 sm:py-4 px-2 flex items-center justify-center gap-2 font-TextFontSemiBold transition-all duration-300 relative ${activeTab === tab.id
                                ? 'text-mainColor bg-mainColor/5'
                                : 'text-gray-400 hover:text-mainColor hover:bg-gray-50'
                                }`}
                        >
                            <span className="hidden md:block text-lg">{tab.icon}</span>
                            <span className="text-xs sm:text-sm whitespace-nowrap">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-mainColor rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div className="p-1 md:p-3 lg:p-6">
                    {activeTab === "orders" && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Filter Sub-header */}
                            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4 p-1 md:p-3 lg:p-6 bg-gray-50 rounded-xl sm:rounded-2xl">
                                <div className="flex-1">
                                    <label className="block text-[10px] sm:text-xs text-gray-400 uppercase mb-1 ml-1">{t("From")}</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-2 sm:p-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-mainColor/20 text-xs sm:text-sm"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] sm:text-xs text-gray-400 uppercase mb-1 ml-1">{t("To")}</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full p-2 sm:p-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-mainColor/20 text-xs sm:text-sm"
                                    />
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={handleFilter}
                                        disabled={loadingPost}
                                        className="flex-1 md:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-mainColor text-white rounded-lg sm:rounded-xl shadow-lg shadow-mainColor/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-xs sm:text-sm font-medium"
                                    >
                                        {loadingPost ? "..." : t("Filter")}
                                    </button>
                                    <button
                                        onClick={handleClearFilter}
                                        className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-500 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all text-xs sm:text-sm font-medium"
                                    >
                                        {t("Clear")}
                                    </button>
                                </div>
                            </div>

                            {/* Orders Table - Enhanced Responsiveness */}
                            <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-100 no-scrollbar shadow-inner bg-gray-50/30">
                                <table className="w-full text-[10px] sm:text-sm min-w-[800px]">
                                    <thead className="bg-gray-50 text-gray-500 font-TextFontMedium border-b">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold">#{t("Order")}</th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold">{t("Date")}</th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold">{t("Type")}</th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold">{t("Branch")}</th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-semibold">{t("Amount")}</th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-semibold">{t("Source")}</th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold">{t("Status")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {currentOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">
                                                    {t("NoOrdersFound")}
                                                </td>
                                            </tr>
                                        ) : (
                                            currentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-TextFontSemiBold text-mainColor">
                                                        {order.order_number || order.order || "-"}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                        <div className="font-TextFontMedium">{order.date}</div>
                                                        <div className="text-[10px] text-gray-400">{order.time}</div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                        <span className={`px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-xs font-bold uppercase whitespace-nowrap ${order.order_type === 'delivery' ? 'bg-purple-100 text-purple-700' :
                                                            order.order_type === 'dine_in' ? 'bg-green-100 text-green-700' :
                                                                'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {t(order.order_type?.replace(/_/g, ' ') || 'Unknown')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600">{order.branch || "-"}</td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-TextFontBold text-mainColor">
                                                        {parseFloat(order.amount).toFixed(2)} EGP
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-TextFontBold text-mainColor">
                                                        {order.order}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                                        <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold ring-1 whitespace-nowrap ${order.order_status === 'delivered' ? 'bg-green-50 text-green-700 ring-green-100' :
                                                            order.order_status === 'canceled' ? 'bg-red-50 text-red-700 ring-red-100' :
                                                                'bg-blue-50 text-blue-700 ring-blue-100'
                                                            }`}>
                                                            {t(order.order_status || '-')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination total={totalOrderPages} current={currentPage} onChange={setCurrentPage} />
                        </div>
                    )}

                    {activeTab === "financials" && (
                        <div className="space-y-6">
                            {/* Financial Sub-tabs - Fixed Responsiveness */}
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl max-w-full overflow-x-auto no-scrollbar border border-gray-200/50 shadow-inner">
                                {[
                                    { id: "pending", label: t("PendingOrderPayments"), color: "red", icon: "🚫" },
                                    { id: "history", label: t("PaymentHistory"), color: "green", icon: "✅" }
                                ].map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => { setFinancialSubTab(sub.id); setCurrentPage(1); }}
                                        className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-TextFontBold transition-all flex items-center gap-2 ${financialSubTab === sub.id
                                            ? `bg-white text-${sub.color}-600 shadow-sm`
                                            : `text-gray-500 hover:text-red-400`
                                            }`}
                                    >
                                        <span>{sub.icon}</span>
                                        <span>{sub.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[300px]">
                                {financialSubTab === "pending" ? (
                                    <div className="space-y-4">
                                        <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-red-50 no-scrollbar shadow-inner bg-red-50/10">
                                            <table className="w-full text-xs sm:text-sm min-w-[500px]">
                                                <thead className="bg-red-50 text-red-700">
                                                    <tr>
                                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">#{t("Order")}</th>
                                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">{t("Cashier")}</th>
                                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">{t("Amount")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-red-50">
                                                    {currentPending.length === 0 ? (
                                                        <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-300 italic">{t("NoPendingPayments")}</td></tr>
                                                    ) : (
                                                        currentPending.map((o, idx) => (
                                                            <tr key={idx} className="hover:bg-red-50/20">
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium">{o.order_number || "-"}</td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500">{o.cashier || "-"}</td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-red-600 font-bold">{parseFloat(o.amount).toFixed(2)} EGP</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <Pagination total={totalPendingPages} current={currentPage} onChange={setCurrentPage} />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-green-50 no-scrollbar shadow-inner bg-green-50/10">
                                            <table className="w-full text-xs sm:text-sm min-w-[700px]">
                                                <thead className="bg-green-50 text-green-700">
                                                    <tr>
                                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">{t("Date")}</th>
                                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">{t("Admin")}</th>
                                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">{t("Financial Account")}</th>
                                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">{t("Amount")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-green-50">
                                                    {currentHistory.length === 0 ? (
                                                        <tr><td colSpan="2" className="px-6 py-12 text-center text-gray-300 italic">{t("NoPaymentHistory")}</td></tr>
                                                    ) : (
                                                        currentHistory.map((p, idx) => (
                                                            <tr key={idx} className="hover:bg-green-50/20 transition-colors">
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4">{new Date(p.date || Date.now()).toLocaleDateString(i18n.language)}</td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-500">{p.admin || "-"}</td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedFinancials(p.financial || []);
                                                                            setIsFinancialModalOpen(true);
                                                                        }}
                                                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-mainColor hover:bg-mainColor/5 hover:border-mainColor/30 transition-all text-xs group"
                                                                    >
                                                                        <span className="truncate max-w-[120px]">view</span>
                                                                        <span className="text-[10px] transition-opacity">🔗</span>
                                                                    </button>
                                                                </td>
                                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-green-600 font-bold">{parseFloat(p.amount).toFixed(2)} EGP</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <Pagination total={totalHistoryPages} current={currentPage} onChange={setCurrentPage} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "stats" && (
                        <div className="space-y-4 sm:space-y-8">
                            {greatestProduct && (
                                <div className="p-4 sm:p-8 bg-gradient-to-br from-mainColor/5 via-white to-mainColor/5 rounded-2xl sm:rounded-3xl border border-mainColor/10 shadow-inner">
                                    <h3 className="text-sm sm:text-xl font-TextFontBold text-mainColor mb-4 sm:mb-6 flex items-center gap-2">
                                        ⭐ {t("FavoriteProduct")}
                                    </h3>
                                    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8">
                                        <div className="relative shrink-0">
                                            <div className="absolute inset-0 bg-mainColor blur-xl opacity-20 animate-pulse"></div>
                                            <img
                                                src={greatestProduct.image}
                                                alt={greatestProduct.name}
                                                className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-2xl object-cover shadow-2xl scale-105 hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-xl sm:text-3xl font-TextFontBold text-mainColor mb-2 sm:mb-3">{greatestProduct.name}</h4>
                                            <p className="text-xs sm:text-lg text-gray-500 leading-relaxed italic max-w-xl mx-auto md:mx-0">
                                                "{greatestProduct.description || t("NoProductDescription")}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!greatestProduct && (
                                <div className="p-10 sm:p-20 text-center text-gray-300 italic text-sm">
                                    {t("NoStatisticsAvailable")}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <FinancialDetailModal />
        </div>
    );
};

export default SinglePageDetails;