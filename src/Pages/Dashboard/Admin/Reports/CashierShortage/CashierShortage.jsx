import React, { useEffect, useState, useMemo } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { FaFileExcel, FaPrint } from 'react-icons/fa';

const CashierShortage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Filter states
    const [selectedCashierId, setSelectedCashierId] = useState(null);
    const [selectedCashierManId, setSelectedCashierManId] = useState(null);

    // Applied filter states
    const [appliedFilters, setAppliedFilters] = useState({
        cashier_id: null,
        cashier_man_id: null,
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const { t } = useTranslation();

    const apiParams = useMemo(() => {
        const params = {
            page: currentPage,
            per_page: itemsPerPage,
        };
        if (appliedFilters.cashier_id) params.cashier_id = appliedFilters.cashier_id;
        if (appliedFilters.cashier_man_id) params.cashier_man_id = appliedFilters.cashier_man_id;
        return params;
    }, [currentPage, appliedFilters, itemsPerPage]);

    const { refetch: refetchReport, loading: loadingReport, data: reportData } = useGet({
        url: `${apiUrl}/admin/cashier_gap`,
        params: apiParams,
        queryKey: ["cashier_gap", currentPage, appliedFilters],
    });

    const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({
        url: `${apiUrl}/admin/cashier_gap/lists`
    });

    const [cashiers, setCashiers] = useState([]);
    const [cashierMen, setCashierMen] = useState([]);

    // Extract gaps data (supports paginated response and flat array)
    const gapsData = Array.isArray(reportData?.gaps)
        ? reportData.gaps
        : (reportData?.gaps?.data || reportData?.data || []);

    const isServerPaginated = Boolean(reportData?.gaps?.data || reportData?.pagination);
    const paginationMeta = reportData?.pagination || (!Array.isArray(reportData?.gaps) ? reportData?.gaps : null);

    // Calculate pagination
    const totalPages = paginationMeta?.last_page || (Array.isArray(reportData?.gaps) ? Math.ceil(reportData.gaps.length / itemsPerPage) : 1);
    const totalCount = paginationMeta?.total ?? gapsData.length;

    const currentGaps = isServerPaginated
        ? gapsData
        : gapsData.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

    useEffect(() => {
        refetchList();
    }, [refetchList]);

    useEffect(() => {
        if (dataList) {
            setCashiers(dataList.cashiers || []);
            setCashierMen(dataList.cashier_men || []);
        }
    }, [dataList]);

    const prepareOptions = (data, labelKey = 'name') => {
        const options = data.map(item => ({
            value: item.id,
            label: item[labelKey] || item.user_name || `ID: ${item.id}`
        }));
        return options;
    };

    const cashierOptions = prepareOptions(cashiers, 'name');
    const cashierManOptions = prepareOptions(cashierMen, 'user_name');

    const handleGenerateReport = () => {
        setCurrentPage(1);
        setAppliedFilters({
            cashier_id: selectedCashierId,
            cashier_man_id: selectedCashierManId,
        });
    };

    const handleResetFilters = () => {
        setSelectedCashierId(null);
        setSelectedCashierManId(null);
        setCurrentPage(1);
        setAppliedFilters({
            cashier_id: null,
            cashier_man_id: null,
        });
    };

    const handleExportExcel = () => {
        if (!currentGaps || currentGaps.length === 0) return;

        const dataToExport = currentGaps.map((gap, index) => ({
            [t("No.")]: (currentPage - 1) * itemsPerPage + index + 1,
            [t("Shortage")]: gap.amount,
            [t("Cashier Amount")]: gap.cashier_amount ?? "-",
            [t("Cashier")]: gap.cashier,
            [t("Cashier Man")]: gap.cashier_man,
            [t("Date")]: gap.date,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cashier Shortage");

        XLSX.writeFile(workbook, "Cashier_Shortage_Report.xlsx");
    };

    const handlePrint = () => {
        if (!currentGaps || currentGaps.length === 0) return;

        const printWindow = window.open('', '_blank');
        const date = new Date().toLocaleDateString();

        const receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${t('Cashier Shortage Report')}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        max-width: 80mm;
                        margin: 0 auto;
                        padding: 10px;
                        font-size: 12px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px dashed #000;
                        padding-bottom: 10px;
                        margin-bottom: 10px;
                    }
                    .title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .date {
                        font-size: 11px;
                        margin-bottom: 5px;
                    }
                    .table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    .table th, .table td {
                        border-bottom: 1px dotted #ccc;
                        padding: 5px;
                        text-align: left;
                        font-size: 10px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 15px;
                        padding-top: 10px;
                        border-top: 2px dashed #000;
                        font-size: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">${t('Cashier Shortage Report')}</div>
                    <div class="date">${t('Date')}: ${date}</div>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>${t('No.')}</th>
                            <th>${t('Shortage')}</th>
                            <th>${t('Cashier Amount')}</th>
                            <th>${t('Cashier')}</th>
                            <th>${t('Date')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentGaps.map((gap, index) => `
                            <tr>
                                <td>${(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>${gap.amount}</td>
                                <td>${gap.cashier_amount ?? '-'}</td>
                                <td>${gap.cashier}</td>
                                <td>${gap.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    ${t('Thank you')}
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(receiptContent);
        printWindow.document.close();
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getPaginationNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
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
            if (totalPages > 1) rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="w-full p-6 pb-32 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold text-mainColor">{t("Cashier Shortage")}</h1>
                {currentGaps && currentGaps.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm font-bold"
                        >
                            <FaFileExcel size={18} />
                            {t("Excel")}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-bold"
                        >
                            <FaPrint size={18} />
                            {t("Print")}
                        </button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="p-6 rounded-lg shadow-sm bg-gray-50">
                <h2 className="mb-4 text-xl font-semibold text-mainColor">{t("Filters")}</h2>
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Cashier")}</label>
                        <Select
                            options={cashierOptions}
                            onChange={(opt) => setSelectedCashierId(opt?.value || null)}
                            isClearable
                            placeholder={t("Select Cashier")}
                            value={cashierOptions.find(opt => opt.value === selectedCashierId) || null}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Cashier Man")}</label>
                        <Select
                            options={cashierManOptions}
                            onChange={(opt) => setSelectedCashierManId(opt?.value || null)}
                            isClearable
                            placeholder={t("Select Cashier Man")}
                            value={cashierManOptions.find(opt => opt.value === selectedCashierManId) || null}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button onClick={handleGenerateReport} className="px-6 py-3 font-medium text-white rounded-lg bg-mainColor hover:bg-opacity-90">
                        {t("Generate Report")}
                    </button>
                    <button onClick={handleResetFilters} className="px-6 py-3 font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600">
                        {t("Reset Filters")}
                    </button>
                </div>
            </div>

            {loadingReport && <p className="text-lg text-center text-gray-600">{t("Loading report...")}</p>}

            {/* Gaps Table */}
            {currentGaps && currentGaps.length > 0 && (
                <div className="space-y-4">
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                        <h2 className="p-4 text-xl font-bold text-white bg-mainColor">{t("Cashier Shortage Records")}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("No.")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Shortage")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Cashier Amount")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Cashier")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Cashier Man")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Date")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentGaps.map((gap, index) => (
                                        <tr key={index} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-4 py-3 text-red-600 font-bold">{gap.amount}</td>
                                            <td className="px-4 py-3 text-blue-600 font-bold">{gap.cashier_amount ?? "-"}</td>
                                            <td className="px-4 py-3">{gap.cashier}</td>
                                            <td className="px-4 py-3">{gap.cashier_man}</td>
                                            <td className="px-4 py-3">{gap.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-700">
                                {t("Showing")}{" "}
                                <span className="font-medium">{totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span>
                                {" to "}
                                <span className="font-medium">
                                    {Math.min(currentPage * itemsPerPage, totalCount)}
                                </span>
                                {" of "}
                                <span className="font-medium">{totalCount}</span>
                                {" results"}
                            </div>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentPage === 1
                                        ? "text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200"
                                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {t("Previous")}
                                </button>

                                {getPaginationNumbers().map((pageNumber, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
                                        disabled={pageNumber === '...'}
                                        className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md transition-all ${pageNumber === currentPage
                                            ? "bg-mainColor text-white"
                                            : pageNumber === '...'
                                                ? "text-gray-500 cursor-default"
                                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentPage === totalPages
                                        ? "text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200"
                                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!loadingReport && (!currentGaps || currentGaps.length === 0) && (
                <div className="py-20 text-center text-gray-500">
                    <p className="text-2xl">{t("No shortage records found")}</p>
                    <p>{t('Select filters and click "Generate Report"')}</p>
                </div>
            )}
        </div>
    );
};

export default CashierShortage;
