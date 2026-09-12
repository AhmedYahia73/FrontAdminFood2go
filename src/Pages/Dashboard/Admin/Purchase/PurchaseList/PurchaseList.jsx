import React, { useEffect, useState } from "react";
import { EditIcon } from "../../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
    AddButton,
    StaticLoader,
    TitlePage,
    TextInput,
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../../Context/Auth";
import axios from "axios";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { IoReceiptOutline, IoClose, IoAddCircleOutline, IoCubeOutline } from "react-icons/io5";
import { FaInfoCircle } from "react-icons/fa";
import Select from "react-select";

const PurchaseList = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();

    const [currentPage, setCurrentPage] = useState(1);
    const purchasesPerPage = 15;

    const {
        refetch: refetchPurchaseList,
        loading: loadingPurchaseList,
        data: dataPurchaseList,
    } = useGet({
        url: `${apiUrl}/admin/purchase?page=${currentPage}&per_page=${purchasesPerPage}`,
    });

    // Fetch financial accounts for add payment form
    const {
        data: listsData,
    } = useGet({
        url: `${apiUrl}/admin/purchase/lists`,
    });

    const [purchases, setPurchases] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    // Items Modal State
    const [selectedPurchaseForItems, setSelectedPurchaseForItems] = useState(null);
    const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);

    const handleOpenItemsModal = (purchase) => {
        setSelectedPurchaseForItems(purchase);
        setIsItemsModalOpen(true);
    };

    // Invoices Modal State
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
    const [invoicesList, setInvoicesList] = useState([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // Payment Details Sub-modal State
    const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
    const [isPaymentDetailsModalOpen, setIsPaymentDetailsModalOpen] = useState(false);

    // Add Payment / Invoice Form State
    const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
    const [newPaymentData, setNewPaymentData] = useState({
        invoice_id: null,
        payment: "",
        date: new Date().toISOString().split("T")[0],
        financial: [{ id: "", amount: "" }],
    });
    const [submittingPayment, setSubmittingPayment] = useState(false);

    const financialOptions = listsData?.financials?.map(f => ({
        value: f.id,
        label: f.name,
    })) || [];

    // Update purchases when data changes
    useEffect(() => {
        if (dataPurchaseList) {
            if (dataPurchaseList.purchases) {
                setPurchases(dataPurchaseList.purchases);
            }
            if (dataPurchaseList.pagination) {
                setPagination(dataPurchaseList.pagination);
            } else {
                setPagination({
                    current_page: 1,
                    last_page: Math.ceil((dataPurchaseList.purchases?.length || 0) / purchasesPerPage) || 1,
                    total: dataPurchaseList.purchases?.length || 0,
                });
            }
        }
    }, [dataPurchaseList]);

    useEffect(() => {
        refetchPurchaseList();
    }, [currentPage, refetchPurchaseList]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Open Invoices Modal
    const handleOpenInvoices = async (purchase) => {
        setSelectedPurchase(purchase);
        setShowAddPaymentForm(false);
        setNewPaymentData({
            payment: purchase.due > 0 ? purchase.due : "",
            date: new Date().toISOString().split("T")[0],
            financial: [{ id: "", amount: purchase.due > 0 ? purchase.due : "" }],
        });
        setIsInvoicesModalOpen(true);
        setLoadingInvoices(true);

        try {
            const token = auth?.userState?.token || "";
            const res = await axios.get(`${apiUrl}/admin/purchase/invoices/${purchase.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.data && res.data.invoices) {
                setInvoicesList(res.data.invoices);
            } else if (purchase.invoices) {
                setInvoicesList(purchase.invoices);
            }
        } catch (err) {
            console.error("Error fetching purchase invoices:", err);
            setInvoicesList(purchase.invoices || []);
        } finally {
            setLoadingInvoices(false);
        }
    };

    // Open Payment Details
    const handleOpenPaymentDetails = (invoice) => {
        setSelectedInvoiceDetails(invoice);
        setIsPaymentDetailsModalOpen(true);
    };

    const handlePaySpecificInstallment = (invoice) => {
        const invDue = parseFloat(invoice.due) || 0;
        setNewPaymentData({
            invoice_id: invoice.id,
            payment: invDue > 0 ? invDue.toString() : "",
            date: new Date().toISOString().split("T")[0],
            financial: [{ id: financialOptions[0]?.value || "", amount: invDue > 0 ? invDue.toString() : "" }],
        });
        setShowAddPaymentForm(true);
    };

    // Add payment / invoice
    const handleAddPaymentChange = (index, field, value) => {
        const updated = [...newPaymentData.financial];
        updated[index][field] = value;
        setNewPaymentData(prev => ({ ...prev, financial: updated }));
    };

    const addPaymentMethodRow = () => {
        setNewPaymentData(prev => ({
            ...prev,
            financial: [...prev.financial, { id: "", amount: "" }],
        }));
    };

    const removePaymentMethodRow = (index) => {
        if (newPaymentData.financial.length > 1) {
            setNewPaymentData(prev => ({
                ...prev,
                financial: prev.financial.filter((_, i) => i !== index),
            }));
        }
    };

    const handleAddPaymentSubmit = async (e) => {
        e.preventDefault();
        const payAmount = parseFloat(newPaymentData.payment) || 0;
        if (payAmount <= 0) {
            return auth.toastError(t("Please enter a valid payment amount"));
        }

        const currentDue = parseFloat(selectedPurchase?.due) || 0;
        if (payAmount > currentDue) {
            return auth.toastError(t("Payment amount cannot exceed remaining due"));
        }

        const validFinancials = newPaymentData.financial.filter(f => f.id && parseFloat(f.amount) > 0);
        if (validFinancials.length === 0) {
            return auth.toastError(t("Please select at least one payment method"));
        }

        const totalMethodsAmount = validFinancials.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        if (Math.abs(totalMethodsAmount - payAmount) > 0.01) {
            return auth.toastError(t("Sum of payment methods must equal payment amount"));
        }

        setSubmittingPayment(true);
        try {
            const token = auth?.userState?.token || "";
            const res = await axios.post(
                `${apiUrl}/admin/purchase/invoices/add/${selectedPurchase.id}`,
                {
                    invoice_id: newPaymentData.invoice_id || null,
                    payment: payAmount,
                    due: Math.max(0, currentDue - payAmount),
                    date: newPaymentData.date,
                    financial: validFinancials,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.status === 200) {
                auth.toastSuccess(t("Invoice payment added successfully"));
                setShowAddPaymentForm(false);
                handleOpenInvoices({
                    ...selectedPurchase,
                    due: Math.max(0, currentDue - payAmount),
                    payment: (parseFloat(selectedPurchase.payment) || 0) + payAmount,
                });
                refetchPurchaseList();
            }
        } catch (err) {
            console.error("Error adding invoice:", err);
            auth.toastError(err?.response?.data?.errors || t("Failed to add payment"));
        } finally {
            setSubmittingPayment(false);
        }
    };

    // Row color logic per prompt:
    // date < today && due > 0 => Red
    // due <= 0 => Green
    // date >= today && due > 0 => White
    const getInvoiceRowStyle = (invoice) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const invDate = new Date(invoice.date);
        invDate.setHours(0, 0, 0, 0);

        const due = parseFloat(invoice.due) || 0;

        if (due <= 0) {
            return {
                badge: "bg-green-100 text-green-800 border border-green-300",
                row: "bg-green-50/80 border-b border-green-200",
                status: t("Paid"),
            };
        } else if (invDate < today && due > 0) {
            return {
                badge: "bg-red-100 text-red-800 border border-red-300",
                row: "bg-red-50/80 border-b border-red-200",
                status: t("Overdue"),
            };
        } else {
            return {
                badge: "bg-gray-100 text-gray-800 border border-gray-300",
                row: "bg-white border-b border-gray-200",
                status: t("Upcoming"),
            };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString();
    };

    const headers = [
        t("SL"),
        t("Admin"),
        t("Supplier"),
        t("Items"),
        t("Store"),
        t("Total Cost"),
        t("Paid Amount"),
        t("Due Amount"),
        t("Date"),
        t("Action"),
    ];

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            border: "1px solid #D1D5DB",
            borderRadius: "0.5rem",
            padding: "0.25rem",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "none",
            borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
        }),
    };

    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
            {loadingPurchaseList ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <div className="w-full md:w-1/2">
                            <TitlePage text={t("Purchases")} />
                        </div>
                        <div className="flex justify-end w-full py-4 md:w-1/2">
                            <Link to="add">
                                <AddButton Text={t("Add Purchase")} />
                            </Link>
                        </div>
                    </div>

                    <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
                        <thead className="w-full">
                            <tr className="w-full border-b-2">
                                {headers.map((name, index) => (
                                    <th
                                        className="min-w-[110px] sm:w-[9%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base pb-3"
                                        key={index}
                                    >
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="w-full">
                            {purchases.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="text-xl text-center text-mainColor font-TextFontMedium py-8"
                                    >
                                        {t("No Purchases Found")}
                                    </td>
                                </tr>
                            ) : (
                                purchases.map((purchase, index) => {
                                    const totalItemsCount = (purchase.products?.length || 0) + (purchase.materials?.length || 0);

                                    return (
                                        <tr className="w-full border-b-2 hover:bg-gray-50/50 transition duration-150" key={purchase.id || index}>
                                            <td className="py-3 text-center text-thirdColor text-sm sm:text-base font-TextFontMedium">
                                                {(currentPage - 1) * purchasesPerPage + index + 1}
                                            </td>
                                            <td className="py-3 text-center text-thirdColor text-sm sm:text-base">
                                                {purchase?.admin || "-"}
                                            </td>
                                            <td className="py-3 text-center text-thirdColor text-sm sm:text-base font-medium">
                                                {purchase?.supplier || "-"}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenItemsModal(purchase)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition"
                                                    title={t("View Items")}
                                                >
                                                    <IoCubeOutline size={16} />
                                                    <span>{t("Items")}</span>
                                                    <span className="bg-indigo-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                                                        {totalItemsCount}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="py-3 text-center text-thirdColor text-sm sm:text-base">
                                                {purchase?.store || "-"}
                                            </td>
                                            <td className="py-3 text-center text-thirdColor text-sm sm:text-base font-TextFontSemiBold">
                                                {parseFloat(purchase?.total_coast || 0).toFixed(2)} {t("EGP")}
                                            </td>
                                            <td className="py-3 text-center text-green-700 text-sm sm:text-base font-medium">
                                                {parseFloat(purchase?.payment || 0).toFixed(2)} {t("EGP")}
                                            </td>
                                            <td className="py-3 text-center text-sm sm:text-base font-medium">
                                                <span className={parseFloat(purchase?.due || 0) > 0 ? "text-red-600 font-semibold" : "text-gray-500"}>
                                                    {parseFloat(purchase?.due || 0).toFixed(2)} {t("EGP")}
                                                </span>
                                            </td>
                                            <td className="py-3 text-center text-thirdColor text-sm sm:text-base">
                                                {formatDate(purchase?.date)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Invoices Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenInvoices(purchase)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition duration-150 shadow-sm"
                                                        title={t("Payment Invoices")}
                                                    >
                                                        <IoReceiptOutline size={16} />
                                                        <span>{t("Invoices")}</span>
                                                    </button>

                                                    {/* Edit Button */}
                                                    <Link
                                                        to={`edit/${purchase.id}`}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                                                        title={t("Edit")}
                                                    >
                                                        <EditIcon />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
                            {currentPage !== 1 && (
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm text-white rounded-xl bg-mainColor font-TextFontMedium"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    {t("Prev")}
                                </button>
                            )}
                            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3.5 py-1.5 mx-1 text-sm font-TextFontSemiBold rounded-full duration-300 ${
                                        currentPage === page
                                            ? "bg-mainColor text-white"
                                            : "text-mainColor hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            {pagination.last_page !== currentPage && (
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm text-white rounded-xl bg-mainColor font-TextFontMedium"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    {t("Next")}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Invoices Dialog */}
            <Dialog
                open={isInvoicesModalOpen}
                onClose={() => setIsInvoicesModalOpen(false)}
                className="relative z-50"
            >
                <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
                    <DialogPanel className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-left border border-gray-100">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                                    <IoReceiptOutline size={24} />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-800">
                                        {t("Payment Invoices")}
                                    </DialogTitle>
                                    <p className="text-sm text-gray-500">
                                        {selectedPurchase?.supplier ? `${t("Supplier")}: ${selectedPurchase.supplier} | ` : ""}
                                        {t("Total Cost")}: {parseFloat(selectedPurchase?.total_coast || 0).toFixed(2)} {t("EGP")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsInvoicesModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition"
                            >
                                <IoClose size={24} />
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <span className="text-xs text-gray-500 block uppercase font-medium">{t("Total Cost")}</span>
                                <span className="text-lg font-bold text-gray-800">
                                    {parseFloat(selectedPurchase?.total_coast || 0).toFixed(2)} {t("EGP")}
                                </span>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <span className="text-xs text-green-700 block uppercase font-medium">{t("Total Paid")}</span>
                                <span className="text-lg font-bold text-green-700">
                                    {parseFloat(selectedPurchase?.payment || 0).toFixed(2)} {t("EGP")}
                                </span>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                <span className="text-xs text-red-700 block uppercase font-medium">{t("Total Due")}</span>
                                <span className="text-lg font-bold text-red-700">
                                    {parseFloat(selectedPurchase?.due || 0).toFixed(2)} {t("EGP")}
                                </span>
                            </div>
                        </div>

                        {/* Add Payment Toggle (if due > 0) */}
                        {parseFloat(selectedPurchase?.due || 0) > 0 && (
                            <div className="mb-5">
                                {!showAddPaymentForm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddPaymentForm(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition"
                                    >
                                        <IoAddCircleOutline size={20} />
                                        <span>{t("Add Payment")}</span>
                                    </button>
                                ) : (
                                    <form onSubmit={handleAddPaymentSubmit} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-800 text-base">{t("Add Payment")}</h4>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddPaymentForm(false)}
                                                className="text-gray-400 hover:text-gray-600 text-sm"
                                            >
                                                {t("Cancel")}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("Paid Amount")} *
                                                </label>
                                                <TextInput
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    max={selectedPurchase?.due}
                                                    value={newPaymentData.payment}
                                                    onChange={(e) => setNewPaymentData(prev => ({ ...prev, payment: e.target.value }))}
                                                    placeholder={t("Enter Amount")}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("Invoice Date")} *
                                                </label>
                                                <TextInput
                                                    type="date"
                                                    value={newPaymentData.date}
                                                    onChange={(e) => setNewPaymentData(prev => ({ ...prev, date: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Financial Methods */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">{t("Payment Methods")} *</span>
                                                <button
                                                    type="button"
                                                    onClick={addPaymentMethodRow}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                                >
                                                    + {t("Add Method")}
                                                </button>
                                            </div>

                                            {newPaymentData.financial.map((f, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <div className="flex-1">
                                                        <Select
                                                            value={financialOptions.find(o => o.value === f.id) || null}
                                                            onChange={(opt) => handleAddPaymentChange(idx, "id", opt ? opt.value : "")}
                                                            options={financialOptions}
                                                            placeholder={t("Select Method")}
                                                            styles={selectStyles}
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <TextInput
                                                            type="number"
                                                            step="0.01"
                                                            value={f.amount}
                                                            onChange={(e) => handleAddPaymentChange(idx, "amount", e.target.value)}
                                                            placeholder={t("Amount")}
                                                        />
                                                    </div>
                                                    {newPaymentData.financial.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removePaymentMethodRow(idx)}
                                                            className="p-2 text-red-500 hover:text-red-700 rounded"
                                                        >
                                                            <IoClose size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="submit"
                                                disabled={submittingPayment}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                            >
                                                {submittingPayment ? t("Submitting...") : t("Submit")}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Invoices List Table */}
                        {loadingInvoices ? (
                            <div className="flex justify-center py-10">
                                <StaticLoader />
                            </div>
                        ) : invoicesList.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 text-base">
                                {t("No invoices found")}
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                        <tr>
                                            <th className="py-3 px-4 text-center">#</th>
                                            <th className="py-3 px-4 text-center">{t("Invoice Date")}</th>
                                            <th className="py-3 px-4 text-center">{t("Paid Amount")}</th>
                                            <th className="py-3 px-4 text-center">{t("Due Amount")}</th>
                                            <th className="py-3 px-4 text-center">{t("Status")}</th>
                                            <th className="py-3 px-4 text-center">{t("Action")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoicesList.map((invoice, index) => {
                                            const style = getInvoiceRowStyle(invoice);
                                            return (
                                                <tr key={invoice.id || index} className={`${style.row} transition`}>
                                                    <td className="py-3 px-4 text-center font-medium text-sm">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-sm font-medium">
                                                        {formatDate(invoice.date)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-sm font-semibold text-green-700">
                                                        {parseFloat(invoice.payment || 0).toFixed(2)} {t("EGP")}
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-sm font-semibold text-red-600">
                                                        {parseFloat(invoice.due || 0).toFixed(2)} {t("EGP")}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                                                            {style.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {parseFloat(invoice.due || 0) > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handlePaySpecificInstallment(invoice)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                                                                    title={t("Pay Installment")}
                                                                >
                                                                    <span>{t("Pay")}</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenPaymentDetails(invoice)}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-medium shadow-sm transition"
                                                            >
                                                                <FaInfoCircle size={13} className="text-blue-600" />
                                                                <span>{t("Payment Details")}</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={() => setIsInvoicesModalOpen(false)}
                                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-sm font-medium transition"
                            >
                                {t("Close")}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Payment Details Sub-modal */}
            <Dialog
                open={isPaymentDetailsModalOpen}
                onClose={() => setIsPaymentDetailsModalOpen(false)}
                className="relative z-50"
            >
                <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                <div className="fixed inset-0 z-20 w-screen overflow-y-auto p-4 flex items-center justify-center">
                    <DialogPanel className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <DialogTitle className="text-lg font-bold text-gray-800">
                                {t("Payment Methods Breakdown")}
                            </DialogTitle>
                            <button
                                onClick={() => setIsPaymentDetailsModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {selectedInvoiceDetails?.financials && selectedInvoiceDetails.financials.length > 0 ? (
                                selectedInvoiceDetails.financials.map((fin, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                                            <span className="text-sm font-medium text-gray-800">
                                                {fin.name || t("Payment Method")}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-green-700">
                                            {parseFloat(fin.amount || 0).toFixed(2)} {t("EGP")}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    {t("No payment methods recorded")}
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-200 flex justify-between items-center font-bold text-gray-800">
                                <span>{t("Total Paid")}:</span>
                                <span className="text-green-700">
                                    {parseFloat(selectedInvoiceDetails?.payment || 0).toFixed(2)} {t("EGP")}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={() => setIsPaymentDetailsModalOpen(false)}
                                className="px-4 py-2 bg-mainColor text-white hover:opacity-90 rounded-xl text-sm font-medium transition"
                            >
                                {t("Close")}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Purchase Items Dialog */}
            <Dialog
                open={isItemsModalOpen}
                onClose={() => setIsItemsModalOpen(false)}
                className="relative z-50"
            >
                <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
                    <DialogPanel className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-left border border-gray-100 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                                    <IoCubeOutline size={24} />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-800">
                                        {t("Purchase Items")}
                                    </DialogTitle>
                                    <p className="text-sm text-gray-500">
                                        {selectedPurchaseForItems?.supplier ? `${t("Supplier")}: ${selectedPurchaseForItems.supplier} | ` : ""}
                                        {t("Total Cost")}: {parseFloat(selectedPurchaseForItems?.total_coast || 0).toFixed(2)} {t("EGP")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsItemsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition"
                            >
                                <IoClose size={24} />
                            </button>
                        </div>

                        <div className="overflow-y-auto py-4 space-y-6 flex-1">
                            {/* Products Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                                    <h3 className="text-base font-bold text-gray-800">
                                        {t("Products")}
                                    </h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {selectedPurchaseForItems?.products?.length || 0}
                                    </span>
                                </div>

                                {selectedPurchaseForItems?.products && selectedPurchaseForItems.products.length > 0 ? (
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                                <tr>
                                                    <th className="py-2.5 px-3 text-center">#</th>
                                                    <th className="py-2.5 px-3 text-center">{t("Product Name")}</th>
                                                    <th className="py-2.5 px-3 text-center">{t("Category")}</th>
                                                    <th className="py-2.5 px-3 text-center">{t("Unit")}</th>
                                                    <th className="py-2.5 px-3 text-center">{t("Quantity")}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {selectedPurchaseForItems.products.map((p, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/70 transition">
                                                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center font-semibold text-gray-800">
                                                            {p.product || "-"}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center text-gray-600">
                                                            {p.category || "-"}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center text-gray-600">
                                                            {p.unit || "-"}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center font-bold text-indigo-700">
                                                            {p.count}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
                                        {t("No products in this purchase")}
                                    </div>
                                )}
                            </div>

                            {/* Raw Materials Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
                                    <h3 className="text-base font-bold text-gray-800">
                                        {t("Raw Materials")}
                                    </h3>
                                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        {selectedPurchaseForItems?.materials?.length || 0}
                                    </span>
                                </div>

                                {selectedPurchaseForItems?.materials && selectedPurchaseForItems.materials.length > 0 ? (
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                                <tr>
                                                    <th className="py-2.5 px-3 text-center">#</th>
                                                    <th className="py-2.5 px-3 text-center">{t("Material Name")}</th>
                                                    <th className="py-2.5 px-3 text-center">{t("Category")}</th>
                                                    <th className="py-2.5 px-3 text-center">{t("Unit")}</th>
                                                    <th className="py-2.5 px-3 text-center">{t("Quantity")}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm">
                                                {selectedPurchaseForItems.materials.map((m, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/70 transition">
                                                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center font-semibold text-gray-800">
                                                            {m.material || "-"}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center text-gray-600">
                                                            {m.category || "-"}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center text-gray-600">
                                                            {m.unit || "-"}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center font-bold text-purple-700">
                                                            {m.count}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
                                        {t("No raw materials in this purchase")}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setIsItemsModalOpen(false)}
                                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-sm font-medium transition"
                            >
                                {t("Close")}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
};

export default PurchaseList;
