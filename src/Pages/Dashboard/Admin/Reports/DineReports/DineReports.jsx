import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { FaFileExcel, FaFilePdf, FaPrint, FaSearch, FaFilter, FaRedo } from 'react-icons/fa';
import { usePost } from '../../../../../Hooks/usePostJson';
import { useGet } from '../../../../../Hooks/useGet';
import { DateInput, StaticLoader } from '../../../../../Components/Components';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../../../../Context/Auth';
const DineReports = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();

    // Data Fetching
    const { refetch: fetchLists, loading: loadingLists, data: listData } = useGet({
        url: `${apiUrl}/admin/reports/lists_report`
    });

    const { postData, loading: loadingReport, response: reportData } = usePost({
        url: `${apiUrl}/admin/reports/dine_in_report`
    });

    // Filter State
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedHall, setSelectedHall] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);

    // Options State
    const [branchOptions, setBranchOptions] = useState([]);
    const [hallOptions, setHallOptions] = useState([]);
    const [tableOptions, setTableOptions] = useState([]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    useEffect(() => {
        if (listData) {
            if (listData.branches) {
                setBranchOptions(listData.branches.map(b => ({ value: b.id, label: b.name })));
            }
            if (listData.halls) {
                setHallOptions(listData.halls.map(h => ({ value: h.id, label: h.name })));
            }
            if (listData.tables) {
                setTableOptions(listData.tables.map(tbl => ({ value: tbl.id, label: tbl.table_number })));
            }
        }
    }, [listData]);

    const handleGenerateReport = () => {

        if (!fromDate) {
            auth.toastError(t("Please enter start date."));
            return;
        }
        const formData = new FormData();
        if (selectedBranch) formData.append('branch_id', selectedBranch.value);
        if (selectedHall) formData.append('hall_id', selectedHall.value);
        if (selectedTable) formData.append('table_id', selectedTable.value);
        if (fromDate) formData.append('from', fromDate);
        if (toDate) formData.append('to', toDate);

        postData(formData);
    };

    const handleResetFilters = () => {
        setFromDate('');
        setToDate('');
        setSelectedBranch(null);
        setSelectedHall(null);
        setSelectedTable(null);
    };

    // Export Handlers
    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        if (!reportData?.data) return;
        const wb = XLSX.utils.book_new();

        // Table Orders Sheet
        if (reportData.data.table_orders) {
            const tableData = reportData.data.table_orders.map(item => ({
                [t('Table Number')]: item.table?.table_number || item.table_id,
                [t('Order Count')]: item.order_count,
                [t('Revenue')]: item.sum_order
            }));
            const wsTable = XLSX.utils.json_to_sheet(tableData);
            XLSX.utils.book_append_sheet(wb, wsTable, "Table Orders");
        }

        // Hall Orders Sheet
        if (reportData.data.hall_orders) {
            const hallData = reportData.data.hall_orders.map(item => ({
                [t('Hall Name')]: item.location_name,
                [t('Order Count')]: item.order_count,
                [t('Revenue')]: item.sum_order
            }));
            const wsHall = XLSX.utils.json_to_sheet(hallData);
            XLSX.utils.book_append_sheet(wb, wsHall, "Hall Orders");
        }

        XLSX.writeFile(wb, `DineIn_Report.xlsx`);
    };

    const handlePrintPdf = () => {
        if (!reportData?.data) return;
        const doc = new jsPDF();

        doc.text(t("Dine In Report"), 14, 20);

        let finalY = 30;

        if (reportData.data.table_orders?.length > 0) {
            doc.text(t("Table Orders"), 14, finalY);
            autoTable(doc, {
                startY: finalY + 5,
                head: [[t("Table"), t("Count"), t("Revenue")]],
                body: reportData.data.table_orders.map(r => [
                    r.table?.table_number,
                    r.order_count,
                    `${r.sum_order?.toLocaleString()} ${t('EGP')}`
                ])
            });
            finalY = doc.lastAutoTable.finalY + 15;
        }

        if (reportData.data.hall_orders?.length > 0) {
            doc.text(t("Hall Orders"), 14, finalY);
            autoTable(doc, {
                startY: finalY + 5,
                head: [[t("Hall"), t("Count"), t("Revenue")]],
                body: reportData.data.hall_orders.map(r => [
                    r.location_name,
                    r.order_count,
                    `${r.sum_order?.toLocaleString()} ${t('EGP')}`
                ])
            });
        }

        doc.save("DineIn_Report.pdf");
    };

    // Helper Cards
    const StatCard = ({ title, value, subValue, color = "blue" }) => (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 border-${color}-500 flex flex-col`}>
            <span className="mb-1 text-sm font-medium text-gray-500">{title}</span>
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            {subValue && <span className="mt-1 text-xs text-gray-400">{subValue}</span>}
        </div>
    );

    // Tab State
    const [activeTab, setActiveTab] = useState('tables');

    // Helper functions
    const formatCurrency = (amount) => `${(amount || 0).toLocaleString()} ${t('EGP')}`;
    const formatStatus = (status) => <span className="px-2 py-1 text-xs text-gray-600 capitalize bg-gray-100 rounded">{status || '-'}</span>;

    return (
        <div className="p-4 pb-20 space-y-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t("Dine In Reports")}</h1>
                    <p className="mt-1 text-gray-500">{t("Analyze details of Dine-in orders")}</p>
                </div>

                {/* {reportData?.data && (
                    <div className="flex gap-2">
                        <button onClick={handleExportExcel} className="p-2 text-green-600 transition-colors rounded-lg bg-green-50 hover:bg-green-100">
                            <FaFileExcel size={20} />
                        </button>
                        <button onClick={handlePrintPdf} className="p-2 text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100">
                            <FaFilePdf size={20} />
                        </button>
                        <button onClick={handlePrint} className="p-2 text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100">
                            <FaPrint size={20} />
                        </button>
                    </div>
                )} */}
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-5 p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex items-center gap-2 text-gray-700">
                    <FaFilter />
                    <h3 className="font-semibold">{t("Filter Options")}</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DateInput
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        placeholder={t("From Date")}
                    />
                    <DateInput
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        placeholder={t("To Date")}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                    <Select
                        options={branchOptions}
                        value={selectedBranch}
                        onChange={setSelectedBranch}
                        placeholder={t("Select Branch")}
                        isClearable
                        classNamePrefix="react-select"
                    />

                    <Select
                        options={hallOptions}
                        value={selectedHall}
                        onChange={setSelectedHall}
                        placeholder={t("Select Hall")}
                        isClearable
                        classNamePrefix="react-select"
                    />

                    <Select
                        options={tableOptions}
                        value={selectedTable}
                        onChange={setSelectedTable}
                        placeholder={t("Select Table")}
                        isClearable
                        classNamePrefix="react-select"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-2 px-4 py-2 font-medium text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-xl"
                    >
                        <FaRedo size={14} />
                        {t("Reset")}
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 px-6 py-2 font-bold text-white transition-all shadow-sm bg-mainColor rounded-xl hover:bg-opacity-90 shadow-blue-200"
                    >
                        <FaSearch size={14} />
                        {t("Generate Report")}
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loadingReport && (
                <div className="flex justify-center py-12">
                    <StaticLoader />
                </div>
            )}

            {/* Content with Tabs */}
            {reportData?.data && !loadingReport && (
                <div className="space-y-6 animate-fade-in-up">

                    {/* Tabs Navigation */}
                    <div className="flex gap-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('tables')}
                            className={`pb-3 px-4 font-medium transition-all border-b-2 ${activeTab === 'tables'
                                ? 'border-mainColor text-mainColor'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t("Table Orders")}
                        </button>
                        <button
                            onClick={() => setActiveTab('halls')}
                            className={`pb-3 px-4 font-medium transition-all border-b-2 ${activeTab === 'halls'
                                ? 'border-mainColor text-mainColor'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t("Hall Orders")}
                        </button>
                        <button
                            onClick={() => setActiveTab('captains')}
                            className={`pb-3 px-4 font-medium transition-all border-b-2 ${activeTab === 'captains'
                                ? 'border-mainColor text-mainColor'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t("Captain Orders")}
                        </button>
                    </div>

                    {/* Table Orders Tab */}
                    {activeTab === 'tables' && (
                        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-800">{t("Tables Performance")}</h3>
                                <span className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">
                                    {(reportData.data.table_orders || []).length} {t("Records")}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4">{t("Table Number")}</th>
                                            <th className="px-6 py-4 text-center">{t("Orders Count")}</th>
                                            <th className="px-6 py-4 text-right">{t("Total Revenue")}</th>
                                            <th className="px-6 py-4 text-center">{t("Status Payment")}</th>
                                            <th className="px-6 py-4 text-center">{t("Date")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(reportData.data.table_orders || []).map((item, idx) => (
                                            <tr key={idx} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {item.table?.table_number || item.table_id || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 text-sm font-bold text-gray-700 bg-gray-100 rounded-md">
                                                        {item.order_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-right text-green-600">
                                                    {formatCurrency(item.sum_order)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {formatStatus(item.status_payment)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-500">
                                                    {item.order_date || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {(reportData.data.table_orders || []).length === 0 && (
                                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">{t("No data available")}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Hall Orders Tab */}
                    {activeTab === 'halls' && (
                        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-800">{t("Halls Performance")}</h3>
                                <span className="px-3 py-1 text-xs font-bold text-purple-700 bg-purple-100 rounded-full">
                                    {(reportData.data.hall_orders || []).length} {t("Records")}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4">{t("Hall Name")}</th>
                                            <th className="px-6 py-4">{t("Table Number")}</th>
                                            <th className="px-6 py-4 text-center">{t("Orders Count")}</th>
                                            <th className="px-6 py-4 text-right">{t("Total Revenue")}</th>
                                            <th className="px-6 py-4 text-center">{t("Status Payment")}</th>
                                            <th className="px-6 py-4 text-center">{t("Date")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(reportData.data.hall_orders || []).map((item, idx) => (
                                            <tr key={idx} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {item.location_name || item.location_id || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {item.table?.table_number || item.table_id || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 text-sm font-bold text-gray-700 bg-gray-100 rounded-md">
                                                        {item.order_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-right text-green-600">
                                                    {formatCurrency(item.sum_order)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {formatStatus(item.status_payment)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-500">
                                                    {item.order_date || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {(reportData.data.hall_orders || []).length === 0 && (
                                            <tr><td colSpan="6" className="p-6 text-center text-gray-500">{t("No data available")}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Captain Orders Tab */}
                    {activeTab === 'captains' && (
                        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-800">{t("Captains Performance")}</h3>
                                <span className="px-3 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-full">
                                    {(reportData.data.captain_orders || []).length} {t("Records")}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4">{t("Captain")}</th>
                                            <th className="px-6 py-4 text-center">{t("Orders Count")}</th>
                                            <th className="px-6 py-4 text-right">{t("Total Revenue")}</th>
                                            <th className="px-6 py-4 text-center">{t("Status Payment")}</th>
                                            <th className="px-6 py-4 text-center">{t("Date")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(reportData.data.captain_orders || []).map((item, idx) => (
                                            <tr key={idx} className="transition-colors hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {item.captain?.name || item.captain_id || t("Unknown Captain")}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 text-sm font-bold text-gray-700 bg-gray-100 rounded-md">
                                                        {item.order_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-right text-green-600">
                                                    {formatCurrency(item.sum_order)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {formatStatus(item.status_payment)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-gray-500">
                                                    {item.order_date || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {(reportData.data.captain_orders || []).length === 0 && (
                                            <tr><td colSpan="5" className="p-6 text-center text-gray-500">{t("No data available")}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* Empty State */}
            {!loadingReport && !reportData?.data && (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-300 border-dashed rounded-2xl">
                    <div className="p-4 mb-4 rounded-full bg-gray-50">
                        <FaSearch className="text-2xl text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{t("No Reports Generated")}</h3>
                    <p className="max-w-sm text-center text-gray-500">
                        {t("Please select filters above and click 'Generate Report' to view dine-in analytics.")}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DineReports;
