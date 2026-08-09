import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { StaticLoader } from "../../../../Components/Components";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../Context/Auth";
import { format } from "date-fns";

const DueGroupModule = () => {
    const { groupId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useAuth();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [activeTab, setActiveTab] = useState("all");
    const today = format(new Date(), "yyyy-MM-dd");
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    // Map tab to API type
    const getApiType = () => {
        if (activeTab === "all") return "";
        if (activeTab === "paid") return "paid";
        if (activeTab === "due") return "unpaid";
        return "";
    };

    const { data, loading, refetch } = useGet({
        url: `${apiUrl}/admin/due_group_module/${groupId}?from=${fromDate}&to=${toDate}&type=${getApiType()}`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/due_group_module/payment`,
    });

    const [dueData, setDueData] = useState(null);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [openDetails, setOpenDetails] = useState(null);
    const [paymentLines, setPaymentLines] = useState([{ account: null, amount: "" }]);

    useEffect(() => {
        if (data) {
            setDueData(data);
            setCurrentPage(1); // Reset page when data changes
        }
    }, [data]);

    useEffect(() => {
        if (response && response.status === 200 && !loadingPost) {
            refetch();
            setOpenPaymentModal(false);
            setPaymentLines([{ account: null, amount: "" }]);
            auth.toastSuccess(t("Payment added successfully"));
        }
    }, [response, loadingPost]);

    // Real data calculations
    const orders = dueData?.module_payment || [];
    const totalDue = dueData?.due_amount || 0;

    const totalPaid = orders.reduce((sum, order) => {
        const paid = order.financials?.reduce((s, f) => s + (f.amount || 0), 0) || 0;
        return sum + paid;
    }, 0);

    const remaining = totalDue - totalPaid;

    const accountOptions = dueData?.financial_account?.map(acc => ({
        value: acc.id,
        label: acc.name,
    })) || [];

    const currentTotalPaid = paymentLines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

    // Pagination logic
    const totalRows = orders.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const currentOrders = orders.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const addPaymentLine = () => setPaymentLines([...paymentLines, { account: null, amount: "" }]);
    const removePaymentLine = (i) => setPaymentLines(paymentLines.filter((_, idx) => idx !== i));
    const updatePaymentLine = (i, field, val) => {
        const updated = [...paymentLines];
        updated[i][field] = val;
        setPaymentLines(updated);
    };

    const handlePay = async () => {
        const validLines = paymentLines.filter(l => l.account && l.amount && parseFloat(l.amount) > 0);
        if (validLines.length === 0) return auth.toastError(t("Please add at least one valid payment"));
        if (currentTotalPaid > remaining) return auth.toastError(t("Total amount exceeds remaining due"));

        const payload = {
            group_product_id: groupId,
            financials: validLines.map(l => ({
                id: l.account.value,
                amount: parseFloat(l.amount),
            })),
        };
        await postData(payload);
    };

    const handleSearch = () => refetch();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <StaticLoader />
            </div>
        );
    }

    return (
        <div className="w-full p-6 pb-32">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 text-mainColor font-semibold hover:underline flex items-center gap-2"
            >
                ← {t("Back")}
            </button>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
                {t("Due Payment")} #{groupId}
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <button
                    onClick={() => { setActiveTab("all"); refetch(); }}
                    className={`rounded-2xl p-8 shadow-xl transition-all hover:scale-105 border-4 ${activeTab === "all"
                        ? "border-mainColor bg-gradient-to-br from-blue-50 to-blue-100"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                >
                    <p className="text-gray-600 text-lg font-medium">{t("Total Orders")}</p>
                    <p className="text-4xl font-bold text-mainColor mt-3">
                        {totalDue.toLocaleString()} EGP
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Click to view all orders</p>
                </button>

                <button
                    onClick={() => { setActiveTab("paid"); refetch(); }}
                    className={`rounded-2xl p-8 shadow-xl transition-all hover:scale-105 border-4 ${activeTab === "paid"
                        ? "border-green-600 bg-gradient-to-br from-green-50 to-green-100"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                >
                    <p className="text-gray-600 text-lg font-medium">{t("Total Paid")}</p>
                    <p className="text-4xl font-bold text-green-600 mt-3">
                        {totalPaid.toLocaleString()} EGP
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Click to view paid</p>
                </button>

                <button
                    onClick={() => { setActiveTab("due"); refetch(); }}
                    className={`rounded-2xl p-8 shadow-xl transition-all hover:scale-105 border-4 ${activeTab === "due"
                        ? "border-red-600 bg-gradient-to-br from-red-50 to-red-100"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                >
                    <p className="text-gray-600 text-lg font-medium">{t("Remaining Due")}</p>
                    <p className={`text-4xl font-bold mt-3 ${remaining > 0 ? "text-red-600" : "text-green-600"}`}>
                        {remaining.toLocaleString()} EGP
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Click to view due</p>
                </button>
            </div>

            {/* Collect Button + Date Range */}
            <div className="text-center mb-12">
                {remaining > 0 && (
                    <button
                        onClick={() => setOpenPaymentModal(true)}
                        className="px-12 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-bold rounded-2xl hover:shadow-2xl transition shadow-xl mb-8"
                    >
                        + {t("Collect Payment")}
                    </button>
                )}

                <div className="flex justify-center items-end gap-6 flex-wrap">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("From Date")}</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl focus:border-mainColor focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t("To Date")}</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-6 py-3 border-2 border-gray-300 rounded-xl focus:border-mainColor focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-10 py-3 bg-mainColor text-white font-bold rounded-xl hover:shadow-lg transition"
                    >
                        {t("Search")}
                    </button>
                </div>
            </div>

            {/* Table + Pagination */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-mainColor to-mainColor text-white px-8 py-6">
                    <h2 className="text-2xl font-bold">
                        {activeTab === "all" && t("All Orders")}
                        {activeTab === "paid" && t("Paid Orders")}
                        {activeTab === "due" && t("Due Orders")}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">{t("Order ID")}</th>
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">{t("Total")}</th>
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">{t("Paid")}</th>
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">{t("Due")}</th>
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">{t("Status")}</th>
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">{t("Date")}</th>
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">{t("Details")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentOrders.length > 0 ? (
                                currentOrders.map((item, i) => {
                                    const paid = item.financials?.reduce((s, f) => s + (f.amount || 0), 0) || 0;
                                    const due = (item.total || 0) - paid;
                                    const isPaid = paid >= item.total;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="px-8 py-5 text-gray-600">{startIndex + i + 1}</td>
                                            <td className="px-8 py-5 font-medium">#{item.id}</td>
                                            <td className="px-8 py-5">{(item.total || 0).toLocaleString()} EGP</td>
                                            <td className="px-8 py-5 text-green-600 font-bold">
                                                {paid.toLocaleString()} EGP
                                            </td>
                                            <td className="px-8 py-5 text-red-600 font-bold">
                                                {due.toLocaleString()} EGP
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-4 py-2 rounded-full text-xs font-bold ${isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {isPaid ? t("Paid") : t("Due")}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-gray-600">
                                                {item.date ? format(new Date(item.date), "dd MMM yyyy") : "-"}
                                            </td>
                                            <td className="px-8 py-5">
                                                {item.financials?.length > 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenDetails({ total: paid, financials: item.financials });
                                                        }}
                                                        className="text-mainColor font-semibold hover:underline"
                                                    >
                                                        {t("View")} →
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-20 text-gray-500 text-lg">
                                        {t("No orders found")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalRows > rowsPerPage && (
                    <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-700">
                            {t("Showing")} {startIndex + 1}–{endIndex} {t("of")} {totalRows} {t("orders")}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                ← Previous
                            </button>

                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage > totalPages - 3) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg transition ${currentPage === pageNum
                                                ? "bg-mainColor text-white font-bold"
                                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <>
                                        <span className="px-2 text-gray-500">...</span>
                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            className="w-10 h-10 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {openPaymentModal && (
                <Dialog open onClose={() => setOpenPaymentModal(false)}>
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                                {t("Collect New Payment")}
                            </h2>

                            <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl text-center border border-red-200">
                                <p className="text-lg font-semibold text-red-700">
                                    {t("Remaining Due")}: <span className="text-3xl font-bold">{remaining.toLocaleString()} EGP</span>
                                </p>
                            </div>

                            <div className="space-y-6">
                                {paymentLines.map((line, i) => (
                                    <div key={i} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t("Payment Method")} #{i + 1}
                                            </label>
                                            <Select
                                                value={line.account}
                                                onChange={(val) => updatePaymentLine(i, "account", val)}
                                                options={accountOptions}
                                                placeholder={t("Select account...")}
                                                styles={{ control: base => ({ ...base, borderRadius: "12px", padding: "4px" }) }}
                                            />
                                        </div>
                                        <div className="w-40">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t("Amount")}</label>
                                            <input
                                                type="number"
                                                value={line.amount}
                                                onChange={(e) => updatePaymentLine(i, "amount", e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center font-bold focus:border-mainColor"
                                            />
                                        </div>
                                        {paymentLines.length > 1 && (
                                            <button onClick={() => removePaymentLine(i)} className="text-red-600 mb-2">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={addPaymentLine}
                                    className="w-full py-4 border-2 border-dashed border-mainColor text-mainColor rounded-xl font-bold hover:bg-mainColor/5"
                                >
                                    + {t("Add Another Payment Method")}
                                </button>
                            </div>

                            <div className="flex gap-4 mt-10">
                                <button
                                    onClick={() => {
                                        setOpenPaymentModal(false);
                                        setPaymentLines([{ account: null, amount: "" }]);
                                    }}
                                    className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    onClick={handlePay}
                                    disabled={loadingPost || currentTotalPaid === 0 || currentTotalPaid > remaining}
                                    className="flex-1 py-4 bg-gradient-to-r from-mainColor to-mainColor text-white rounded-xl font-bold disabled:opacity-50"
                                >
                                    {loadingPost ? t("Saving...") : `${t("Confirm Payment")} (${currentTotalPaid} EGP)`}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}

            {/* Payment Details Modal */}
            {openDetails && (
                <Dialog open onClose={() => setOpenDetails(null)}>
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">{t("Payment Details")}</h3>

                            <div className="bg-gradient-to-r from-mainColor/10 to-mainColor/5 rounded-xl p-6 mb-6">
                                <p className="text-gray-600">{t("Total Paid")}</p>
                                <p className="text-4xl font-bold text-mainColor">
                                    {openDetails.total.toLocaleString()} EGP
                                </p>
                            </div>

                            <div className="space-y-4">
                                {openDetails.financials?.map((f, i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex justify-between items-center">
                                        <span className="font-medium text-gray-800">{f.financial_accounting}</span>
                                        <span className="text-xl font-bold text-mainColor">
                                            {f.amount.toLocaleString()} EGP
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setOpenDetails(null)}
                                className="mt-8 w-full py-4 bg-gradient-to-r from-mainColor to-mainColor text-white rounded-xl font-bold hover:shadow-xl"
                            >
                                {t("Close")}
                            </button>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default DueGroupModule;