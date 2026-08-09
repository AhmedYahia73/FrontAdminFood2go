import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGet } from "../../../../../Hooks/useGet";
import { useAuth } from "../../../../../Context/Auth";
import axios from "axios";
import { FaClock, FaTimesCircle, FaCheckCircle, FaUserTie, FaExclamationCircle, FaPrint, FaFileExcel, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DateInput } from "../../../../../Components/Components";
import Select from "react-select";

const EndShifts = () => {
    const { t } = useTranslation();
    const auth = useAuth();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Fetch shifts data
    const { data, loading, refetch } = useGet({ url: `${apiUrl}/admin/shifts/shifts` });
    const shifts = useMemo(() => data?.cashier_shifts || [], [data]);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [amount, setAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Filter state
    const [filterDate, setFilterDate] = useState("");
    const [selectedCashierMan, setSelectedCashierMan] = useState(null);
    const [selectedCashier, setSelectedCashier] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Compute unique options for select inputs
    const cashierManOptions = useMemo(() => {
        const unique = [...new Set(shifts.map(s => s.cashier_man).filter(Boolean))];
        return unique.map(name => ({ value: name, label: name }));
    }, [shifts]);

    const cashierOptions = useMemo(() => {
        const unique = [...new Set(shifts.map(s => s.cashier).filter(Boolean))];
        return unique.map(name => ({ value: name, label: name }));
    }, [shifts]);

    // Filtered shifts
    const filteredShifts = useMemo(() => {
        return shifts.filter(shift => {
            const matchDate = filterDate ? (shift.start_time || "").includes(filterDate) : true;
            const matchCashierMan = selectedCashierMan ? shift.cashier_man === selectedCashierMan.value : true;
            const matchCashier = selectedCashier ? shift.cashier === selectedCashier.value : true;

            return matchDate && matchCashierMan && matchCashier;
        });
    }, [shifts, filterDate, selectedCashierMan, selectedCashier]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);
    const paginatedShifts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredShifts.slice(start, start + itemsPerPage);
    }, [filteredShifts, currentPage]);

    // Smart Pagination Range Calculation
    const paginationRange = useMemo(() => {
        const delta = 1; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    }, [currentPage, totalPages]);

    // Reset pagination when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [filterDate, selectedCashierMan, selectedCashier]);

    const handleOpenDialog = (shift) => {
        setSelectedShift(shift);
        setAmount("");
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedShift(null);
        setAmount("");
    };

    const handleSubmit = async () => {
        if (!amount || isNaN(amount)) {
            auth.toastError(t("Please enter a valid amount"));
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.get(
                `${apiUrl}/admin/shifts/end_shift/${selectedShift.id}?amount=${amount}`,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${auth?.userState?.token || ""}`,
                    },
                }
            );
            if (response.status === 200) {
                auth.toastSuccess(t("Shift closed successfully"));
                handleCloseDialog();
                refetch();
            }
        } catch (error) {
            console.error("Error closing shift:", error);
            auth.toastError(t("Failed to close shift"));
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrint = (data) => {
        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) {
            auth.toastError(t("Please allow popups to print"));
            return;
        }

        const content = (data || []).map((shift, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${shift.start_time || "-"}</td>
                <td>${shift.cashier_man || "-"}</td>
                <td>${shift.cashier || t("N/A")}</td>
            </tr>
        `).join("");

        printWindow.document.write(`
            <html>
                <head>
                    <title>${t("End Shifts Report")}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f4f4f4; }
                        h1 { text-align: center; }
                    </style>
                </head>
                <body dir="${auth.language === "ar" ? "rtl" : "ltr"}">
                    <h1>${t("End Shifts Report")}</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>${t("Start Time")}</th>
                                <th>${t("Cashier Man")}</th>
                                <th>${t("Cashier")}</th>
                            </tr>
                        </thead>
                        <tbody>${content}</tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportExcel = () => {
        const exportData = filteredShifts.map((shift) => ({
            [t("Start Time")]: shift.start_time || "-",
            [t("Cashier Man")]: shift.cashier_man || "-",
            [t("Cashier")]: shift.cashier || t("N/A"),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "End Shifts Report");
        XLSX.writeFile(wb, `End_Shifts_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    // Custom styles for React Select
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: '0.75rem', // rounded-xl
            borderColor: state.isFocused ? '#B79455' : '#e5e7eb',
            padding: '8px 6px',
            boxShadow: state.isFocused ? '0 0 0 1px #B79455' : 'none',
            '&:hover': {
                borderColor: '#B79455'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#B79455' : state.isFocused ? '#FDF8F0' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            cursor: 'pointer',
            ':active': {
                backgroundColor: '#B79455',
                color: 'white'
            }
        })
    };

    return (
        <div className="w-full min-h-screen p-2 md:p-4 flex flex-col gap-4 bg-[#f8fafc]/50">
            {/* Header */}
            <div className="flex flex-col gap-2 p-2 md:p-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white">
                <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <span className="p-2 md:p-3 bg-mainColor/10 rounded-xl text-mainColor">
                        <FaClock size={24} />
                    </span>
                    {t("End Shifts")}
                </h1>
            </div>

            {/* Filters */}
            <div className="p-2 md:p-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 transition-all hover:shadow-2xl hover:shadow-gray-200/60">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">{t("Date")}</label>
                        <DateInput
                            placeholder={t("Select Date")}
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">{t("Cashier Man")}</label>
                        <Select
                            value={selectedCashierMan}
                            onChange={setSelectedCashierMan}
                            options={cashierManOptions}
                            placeholder={t("Select Cashier Man")}
                            isClearable
                            styles={customStyles}
                            className="text-sm font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">{t("Cashier")}</label>
                        <Select
                            value={selectedCashier}
                            onChange={setSelectedCashier}
                            options={cashierOptions}
                            placeholder={t("Select Cashier")}
                            isClearable
                            styles={customStyles}
                            className="text-sm font-medium"
                        />
                    </div>
                </div>
                <div className="w-full flex flex-col sm:flex-row gap-4 mt-6">
                    {filteredShifts.length > 0 && (
                        <>
                            <button
                                onClick={() => handlePrint(filteredShifts)}
                                className="flex items-center justify-center gap-3 px-10 py-3.5 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-200 hover:-translate-y-0.5 active:scale-95"
                            >
                                <FaPrint size={20} />
                                <span>{t("Print")}</span>
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center justify-center gap-3 px-10 py-3.5 text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg shadow-green-200 hover:-translate-y-0.5 active:scale-95"
                            >
                                <FaFileExcel className="w-5 h-5" />
                                <span>{t("Excel")}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-8 py-6 font-bold text-gray-600 uppercase tracking-wider text-xs text-start">#</th>
                                <th className="px-6 py-6 font-bold text-gray-600 uppercase tracking-wider text-xs text-start">{t("Start Time")}</th>
                                <th className="px-6 py-6 font-bold text-gray-600 uppercase tracking-wider text-xs text-start">{t("Cashier Man")}</th>
                                <th className="px-6 py-6 font-bold text-gray-600 uppercase tracking-wider text-xs text-start">{t("Cashier")}</th>
                                <th className="px-8 py-6 font-bold text-gray-600 uppercase tracking-wider text-xs text-start">{t("Action")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-mainColor/20 border-t-mainColor rounded-full animate-spin"></div>
                                            <p className="text-gray-400 font-medium animate-pulse">{t("Loading shifts...")}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedShifts.length > 0 ? (
                                paginatedShifts.map((shift, idx) => (
                                    <tr key={shift.id} className="group transition-all duration-200 hover:bg-gray-50/80">
                                        <td className="px-8 py-5 text-start">
                                            <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-mainColor/10 flex items-center justify-center text-[11px] font-black text-gray-400 group-hover:text-mainColor transition-colors">
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-start">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{shift.start_time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-start">
                                            <div className="flex items-center gap-2">
                                                <FaUserTie className="text-mainColor/60" size={14} />
                                                <span className="font-semibold text-gray-700">{shift.cashier_man || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-start">
                                            <span className={`font-semibold ${shift.cashier ? "text-gray-700" : "text-gray-400 italic"}`}>
                                                {shift.cashier || t("N/A")}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-start">
                                            <button
                                                onClick={() => handleOpenDialog(shift)}
                                                className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-xl border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                            >
                                                {t("Close Shift")}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                <FaExclamationCircle size={48} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-bold text-gray-800">{t("No Shifts Found")}</h3>
                                                <p className="text-gray-400 text-sm font-medium leading-relaxed">{t("Try adjusting your filters or check back later")}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-2 md:px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm font-bold text-gray-500">
                            {t("Showing")} <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredShifts.length)}</span> {t("of")} <span className="text-gray-900 font-black">{filteredShifts.length}</span> {t("shifts")}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:border-mainColor hover:text-mainColor disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {t("Previous")}
                            </button>
                            <div className="flex items-center gap-1">
                                {paginationRange.map((page, index) => {
                                    if (page === '...') {
                                        return (
                                            <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400 font-bold">
                                                ...
                                            </span>
                                        );
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === page
                                                ? "bg-mainColor text-white shadow-lg shadow-mainColor/25 scale-105"
                                                : "bg-white text-gray-500 border border-gray-100 hover:border-mainColor/30 hover:text-mainColor"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:border-mainColor hover:text-mainColor disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {t("Next")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Close Shift Dialog */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleCloseDialog}
                    ></div>

                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4 p-6 space-y-6 animate-[slideDown_0.3s_ease-out]">
                        {/* Dialog Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                <FaClock className="text-mainColor" />
                                {t("Close Shift")}
                            </h2>
                            <button
                                onClick={handleCloseDialog}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <FaTimesCircle size={20} />
                            </button>
                        </div>

                        {/* Shift Info */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-sm text-gray-500 font-semibold">
                                {t("Cashier")}: <span className="text-gray-800 font-bold">{selectedShift?.cashier}</span>
                            </p>
                            <p className="text-sm text-gray-500 font-semibold mt-1">
                                {t("Cashier Man")}: <span className="text-gray-800 font-bold">{selectedShift?.cashier_man || "-"}</span>
                            </p>
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">{t("Amount")}</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={t("Enter amount")}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 font-semibold focus:outline-none focus:border-mainColor focus:ring-2 focus:ring-mainColor/10 transition-all placeholder:text-gray-300"
                                autoFocus
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={handleCloseDialog}
                                disabled={submitting}
                                className="flex-1 py-3 px-6 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95"
                            >
                                {t("Cancel")}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`flex-1 py-3 px-6 font-bold rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${submitting
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-mainColor text-white hover:bg-mainColor/90 shadow-lg shadow-mainColor/25"
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {t("Submitting...")}
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle size={16} />
                                        {t("Submit")}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default EndShifts;
