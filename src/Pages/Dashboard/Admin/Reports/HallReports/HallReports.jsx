import React, { useEffect, useState } from "react";
import { usePost } from "../../../../../Hooks/usePostJson";
import { DateInput } from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { FaFileExcel, FaPrint, FaSearch } from 'react-icons/fa';
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from "../../../../../Context/Auth";

const HallReports = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/admin/reports/hall_reports` });
    const { refetch: refetchList, data: dataList } = useGet({
        url: `${apiUrl}/admin/reports/lists_report`
    });
    const auth = useAuth();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [cashierMans, setCashierMans] = useState([]);
    const [branches, setBranches] = useState([]);
    const [reports, setReports] = useState([]);

    // Filter states
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [selectedCashierManId, setSelectedCashierManId] = useState(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Modal state for financial accounts
    const [openFinance, setOpenFinance] = useState(null);

    useEffect(() => {
        refetchList();
    }, [refetchList]);

    useEffect(() => {
        if (dataList) {
            setCashierMans(dataList.cashier_man || []);
            setBranches(dataList.branches || []);
        }
    }, [dataList]);

    useEffect(() => {
        if (response && !loadingPost) {
            setReports(response?.data?.data || []);
        }
    }, [response, loadingPost]);

    // Filter Logic
    const filteredReports = reports.filter(report => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        const hallName = report.location_name?.toLowerCase() || '';
        const total = report.total_all?.toString() || '';
        const financials = report.financial_accounts?.map(fa => `${fa.financial_name} ${fa.total_amount}`).join(' ').toLowerCase() || '';

        return (
            hallName.includes(query) ||
            total.includes(query) ||
            financials.includes(query)
        );
    });

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const currentReports = filteredReports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getPaginationNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const prepareOptions = (data, labelKey = 'name') => {
        const options = (data || []).map(item => ({
            value: item.id,
            label: item[labelKey] || item.user_name || `ID: ${item.id}`
        }));
        return [{ value: 'all', label: t('All') }, ...options];
    };

    const branchOptions = prepareOptions(branches);
    const cashierManOptions = prepareOptions(cashierMans, 'user_name');

    const handleGenerateReport = () => {
        const formData = new FormData();
        if (fromDate) formData.append("from", fromDate);
        if (toDate) formData.append("to", toDate);
        if (selectedBranchId && selectedBranchId !== 'all') formData.append("branch_id", selectedBranchId);
        if (selectedCashierManId && selectedCashierManId !== 'all') formData.append("cashier_man_id", selectedCashierManId);

        postData(formData);
    };

    const handleResetFilters = () => {
        setFromDate("");
        setToDate("");
        setSelectedBranchId(null);
        setSelectedCashierManId(null);
        setReports([]);
        setSearchQuery("");
        setCurrentPage(1);
    };

    const handlePrint = () => {
        const pw = window.open("", "", "width=800,height=600");
        if (!pw) return;

        const branchName = selectedBranchId && selectedBranchId !== 'all'
            ? branches.find(b => b.id === selectedBranchId)?.name
            : t("All Branches");

        const cashierManName = selectedCashierManId && selectedCashierManId !== 'all'
            ? cashierMans.find(c => c.id === selectedCashierManId)?.user_name
            : t("All Cashier Men");

        let tableRows = filteredReports.map((report, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${report.location_name || "N/A"}</td>
                <td>
                    ${report.financial_accounts?.map(fa => `<div>${fa.financial_name}: ${Number(fa.total_amount).toFixed(2)}</div>`).join("") || "N/A"}
                </td>
                <td style="font-weight: bold;">${Number(report.total_all || 0).toFixed(2)}</td>
            </tr>
        `).join("");

        const html = `
            <html dir="${isRtl ? 'rtl' : 'ltr'}">
            <head>
                <title>${t("Hall Reports")}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #9E090F; }
                    .header-info { margin-bottom: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: ${isRtl ? 'right' : 'left'}; }
                    th { background-color: #f2f2f2; }
                    .total-cell { font-weight: bold; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${t("Hall Reports")}</h1>
                <div class="header-info">
                    <p><strong>${t("Date Range")}:</strong> ${fromDate || t("All")} ${toDate ? `- ${toDate}` : ""}</p>
                    <p><strong>${t("Branch")}:</strong> ${branchName}</p>
                    <p><strong>${t("Cashier Man")}:</strong> ${cashierManName}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>${t("Hall Name")}</th>
                            <th>${t("Financial Accounts")}</th>
                            <th>${t("Total All")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #777;">
                    ${t("Generated on")}: ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;

        pw.document.write(html);
        pw.document.close();
        setTimeout(() => {
            pw.focus();
            pw.print();
            pw.close();
        }, 500);
    };

    const handleExportExcel = () => {
        const data = filteredReports.map((report, index) => {
            const row = {
                "#": index + 1,
                [t("Hall Name")]: report.location_name || "N/A",
                [t("Total All")]: report.total_all || 0,
            };

            // Add financial accounts to the row
            report.financial_accounts?.forEach(fa => {
                row[fa.financial_name] = fa.total_amount;
            });

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hall Reports");
        XLSX.writeFile(workbook, `Hall_Reports_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    };

    const handleOpenFinance = (accounts) => {
        setOpenFinance(accounts);
    };
    const handleCloseFinance = () => {
        setOpenFinance(null);
    };

    return (
        <div className="w-full p-4 mb-20 md:p-6 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-mainColor">{t("Hall Reports")}</h1>
                <div className="flex gap-2">
                    {filteredReports.length > 0 && (
                        <>
                            <button onClick={handleExportExcel} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm font-bold">
                                <FaFileExcel size={18} />
                                {t("Excel")}
                            </button>
                            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl hover:bg-opacity-90 transition-all shadow-sm font-bold">
                                <FaPrint size={18} />
                                {t("Print Report")}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="p-4 mb-6 rounded-lg bg-gray-50 border border-gray-100">
                <h2 className="mb-4 text-lg font-semibold text-mainColor">{t("Filters")}</h2>
                <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                    <DateInput
                        placeholder="From Date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required={false}
                        maxDate={toDate}
                        borderColor="mainColor"
                    />
                    <DateInput
                        placeholder="To Date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        minDate={fromDate}
                        borderColor="mainColor"
                    />
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-thirdColor font-bold">{t("Branch")}:</span>
                        <Select
                            value={branchOptions.find(opt => opt.value === selectedBranchId)}
                            onChange={(opt) => setSelectedBranchId(opt?.value || null)}
                            options={branchOptions}
                            placeholder={t("Select Branch")}
                            isClearable
                            className="react-select-container"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-thirdColor font-bold">{t("Cashier Man")}:</span>
                        <Select
                            value={cashierManOptions.find(opt => opt.value === selectedCashierManId)}
                            onChange={(opt) => setSelectedCashierManId(opt?.value || null)}
                            options={cashierManOptions}
                            placeholder={t("Select Cashier Man")}
                            isClearable
                            className="react-select-container"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-6">
                    <button onClick={handleGenerateReport} className="px-8 py-2.5 font-bold text-white rounded-lg bg-mainColor hover:bg-opacity-90 shadow-md transition-all">
                        {t("Generate Report")}
                    </button>
                    <button onClick={handleResetFilters} className="px-8 py-2.5 font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 shadow-md transition-all">
                        {t("Reset Filters")}
                    </button>
                </div>
            </div>

            {loadingPost && <p className="text-center text-gray-500 py-10">{t("Loading reports data...")}</p>}

            {!loadingPost && reports.length > 0 && (
                <div className="flex flex-col space-y-4">
                    <div className="relative w-full md:w-1/3">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("Search by hall name...")}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="text-white bg-mainColor">
                                    <th className="px-4 py-3 border-b text-center">#</th>
                                    <th className="px-4 py-3 border-b text-start">{t("Hall Name")}</th>
                                    <th className="px-4 py-3 border-b text-center">{t("Financial Accounts")}</th>
                                    <th className="px-4 py-3 border-b text-center">{t("Total All")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentReports.map((report, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-4 py-4 font-medium text-gray-900 text-start">{report.location_name || "N/A"}</td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => handleOpenFinance(report.financial_accounts)}
                                                className="px-4 py-1.5 text-sm font-bold text-mainColor border-b-2 border-mainColor hover:text-opacity-80 transition-all"
                                            >
                                                {t("View")}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-center font-bold text-lg text-green-600">
                                            {Number(report.total_all || 0).toFixed(2)} <span className="text-xs text-gray-500 font-normal">{t("EGP")}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Accounts Modal */}
                    {openFinance && (
                        <Dialog
                            open={true}
                            onClose={handleCloseFinance}
                            className="relative z-10"
                        >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-25" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                    <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-xl">
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-mainColor mb-4 pb-2 border-b border-gray-100">
                                                {t("Financial Accounts")}
                                            </h3>
                                            <div className="flex flex-col gap-3">
                                                {openFinance.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-4">{t("No financial accounts available")}</p>
                                                ) : (
                                                    openFinance.map((fa, i) => (
                                                        <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm">
                                                            <span className="font-semibold text-gray-700">{fa.financial_name}</span>
                                                            <span className="font-bold text-mainColor text-lg">
                                                                {Number(fa.total_amount).toFixed(2)} <span className="text-xs text-gray-400 font-normal">{t("EGP")}</span>
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-6 py-4 bg-gray-100 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleCloseFinance}
                                                className="px-6 py-2 text-sm font-bold text-white bg-mainColor rounded-lg hover:bg-opacity-90 shadow-sm transition-all"
                                            >
                                                {t("Close")}
                                            </button>
                                        </div>
                                    </DialogPanel>
                                </div>
                            </div>
                        </Dialog>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <span className="text-sm text-gray-700">
                                {t("Showing")} <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                {t(" to ")} <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span>
                                {t(" of ")} <span className="font-medium">{filteredReports.length}</span>
                            </span>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1.5 rounded-md transition-colors ${currentPage === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "bg-white border text-gray-700 hover:bg-gray-50"}`}
                                >
                                    {t("Previous")}
                                </button>
                                {getPaginationNumbers().map((num, i) => (
                                    <button
                                        key={i}
                                        onClick={() => typeof num === 'number' && handlePageChange(num)}
                                        disabled={num === '...'}
                                        className={`w-10 h-10 rounded-md transition-colors ${num === currentPage ? "bg-mainColor text-white font-bold" : num === '...' ? "text-gray-400 cursor-default" : "bg-white border text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1.5 rounded-md transition-colors ${currentPage === totalPages ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "bg-white border text-gray-700 hover:bg-gray-50"}`}
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!loadingPost && reports.length === 0 && (
                <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-xl font-medium">{t("No reports found")}</p>
                    <p>{t("Adjust filters and click Generate Report")}</p>
                </div>
            )}
        </div>
    );
};

export default HallReports;
