import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../../../../Hooks/useGet';
import { usePost } from '../../../../../Hooks/usePostJson';
import { DateInput, StaticLoader, TextInput } from '../../../../../Components/Components';
import { FaFileExcel, FaPrint, FaSearch, FaArrowRight, FaArrowLeft, FaHistory } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import Select from 'react-select';

const ProductsMovements = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");

    // Fetch Filter Lists (Categories and Products)
    const { data: listData } = useGet({
        url: `${apiUrl}/admin/reports/product_report_lists`
    });

    // Filter States
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filterCategory, setFilterCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('sales');

    // POST Movement Data
    const { postData, loadingPost, response: movementResponse } = usePost({
        url: `${apiUrl}/admin/reports/products_movement`,
        type: true // Use JSON for the request body
    });

    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        if (movementResponse && movementResponse.data) {
            setReportData(movementResponse.data.products || []);
        }
    }, [movementResponse]);

    // Derived Options
    const categoryOptions = useMemo(() => listData?.categories?.map(c => ({ value: c.id, label: c.name })) || [], [listData]);

    const productOptions = useMemo(() => {
        if (!listData?.products) return [];
        let products = listData.products;

        // Filter by selected category if any
        if (filterCategory) {
            products = products.filter(p => (p.category_id === filterCategory.value) || (p.sub_category_id === filterCategory.value));
        }

        return products.map(p => ({ value: p.id, label: p.name }));
    }, [listData, filterCategory]);

    const handleApplyFilters = () => {
        if (!fromDate || !toDate || !selectedProduct) {
            return; // Basic validation
        }

        const payload = {
            from: fromDate,
            to: toDate,
            product_id: selectedProduct.value
        };

        postData(payload);
    };

    const handleResetFilters = () => {
        setFromDate('');
        setToDate('');
        setFilterCategory(null);
        setSelectedProduct(null);
        setSearchQuery('');
        setReportData([]);
        setActiveTab('sales');
    };

    // Client-side search within the results based on active tab
    const filteredReportData = useMemo(() => {
        if (!reportData) return [];

        let filtered = reportData;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = reportData.filter(item => {
                const data = item[activeTab];
                if (!data) return false;
                return (data.date || "").toLowerCase().includes(lowerQuery);
            });
        }
        return filtered;
    }, [reportData, activeTab, searchQuery]);

    const handlePrint = () => {
        if (reportData.length === 0) return;

        const printWindow = window.open('', '_blank');
        const dateNow = new Date().toLocaleDateString();

        const buildTable = (type) => {
            const headers = type === 'sales'
                ? `<th>${t('Date')}</th><th>${t('Count')}</th><th>${t('Price')}</th><th>${t('Total')}</th>`
                : `<th>${t('Date')}</th><th>${t('Quantity')}</th><th>${t('Cost')}</th><th>${t('Total Cost')}</th>`;

            const rows = reportData.map((item, index) => {
                const data = item[type];
                if (type === 'sales') {
                    return `<tr><td>${index + 1}</td><td>${data.date}</td><td>${data.count}</td><td>${data.price}</td><td>${data.total}</td></tr>`;
                } else {
                    return `<tr><td>${index + 1}</td><td>${data.date}</td><td>${data.quintity}</td><td>${data.coast}</td><td>${data.total_coast}</td></tr>`;
                }
            }).join('');

            return `
                <h3>${type === 'sales' ? t('Sales') : t('Purchases')}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            ${headers}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            `;
        };

        const receiptContent = `
            <!DOCTYPE html>
            <html dir="${selectedLanguage === 'ar' ? 'rtl' : 'ltr'}">
            <head>
                <title>${t('Products Movement Report')}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; max-width: 210mm; margin: 0 auto; padding: 20px; font-size: 12px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .title { font-size: 20px; font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 30px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    h3 { color: #2563eb; margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    .footer { text-align: center; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">${t('Products Movement Report')}</div>
                    <div>${t('Product')}: ${selectedProduct?.label}</div>
                    <div>${t('Date Range')}: ${fromDate} - ${toDate}</div>
                    <div>${t('Printed on')}: ${dateNow}</div>
                </div>
                ${buildTable('sales')}
                ${buildTable('purchases')}
                <div class="footer">${t('Thank you')}</div>
                <script>
                    window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(receiptContent);
        printWindow.document.close();
    };

    const handleExportExcel = () => {
        if (reportData.length === 0) return;

        const workbook = XLSX.utils.book_new();

        // Sales Sheet
        const salesData = reportData.map((item, index) => ({
            [t("#")]: index + 1,
            [t("Date")]: item.sales.date,
            [t("Count")]: item.sales.count,
            [t("Price")]: item.sales.price,
            [t("Total")]: item.sales.total,
        }));
        const salesWorksheet = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(workbook, salesWorksheet, t("Sales"));

        // Purchases Sheet
        const purchasesData = reportData.map((item, index) => ({
            [t("#")]: index + 1,
            [t("Date")]: item.purchases.date,
            [t("Quantity")]: item.purchases.quintity,
            [t("Cost")]: item.purchases.coast,
            [t("Total Cost")]: item.purchases.total_coast,
        }));
        const purchasesWorksheet = XLSX.utils.json_to_sheet(purchasesData);
        XLSX.utils.book_append_sheet(workbook, purchasesWorksheet, t("Purchases"));

        XLSX.writeFile(workbook, `Product_Movement_${selectedProduct?.label || 'Report'}.xlsx`);
    };

    const selectStyles = {
        control: (base) => ({
            ...base,
            borderColor: '#d1d5db',
            borderRadius: '0.5rem',
            padding: '2px',
        }),
    };

    return (
        <div className="w-full p-2 md:p-6 mb-20 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-bold text-mainColor">{t('Products Movement Report')}</h1>
                {reportData.length > 0 && (
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

            {/* Filters Section */}
            <div className="p-2 md:p-4 mb-6 rounded-lg bg-gray-50 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("From Date")}</label>
                        <DateInput
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("To Date")}</label>
                        <DateInput
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Category")}</label>
                        <Select
                            options={categoryOptions}
                            value={filterCategory}
                            onChange={(val) => { setFilterCategory(val); setSelectedProduct(null); }}
                            placeholder={t("Select Category")}
                            styles={selectStyles}
                            isClearable
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Product")}</label>
                        <Select
                            options={productOptions}
                            value={selectedProduct}
                            onChange={setSelectedProduct}
                            placeholder={t("Select Product")}
                            styles={selectStyles}
                            isClearable
                            isDisabled={!filterCategory && productOptions.length === 0}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                    <button
                        onClick={handleApplyFilters}
                        disabled={loadingPost || !fromDate || !toDate || !selectedProduct}
                        className="px-8 py-2.5 text-white bg-mainColor rounded-xl hover:bg-opacity-90 transition-colors font-semibold disabled:opacity-50"
                    >
                        {loadingPost ? t("Loading...") : t("Filter")}
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="px-8 py-2.5 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                        {t("Reset")}
                    </button>
                </div>
            </div>

            {/* Tab Switched and Results */}
            <div className="space-y-4">
                {reportData.length > 0 && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('sales')}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'sales' ? 'bg-white text-mainColor shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t("Sales")}
                            </button>
                            <button
                                onClick={() => setActiveTab('purchases')}
                                className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'purchases' ? 'bg-white text-mainColor shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t("Purchases")}
                            </button>
                        </div>
                        <div className="flex-1 max-w-md">
                            <TextInput
                                icon={<FaSearch className="text-gray-400" />}
                                placeholder={t("Search by date...")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {loadingPost ? (
                    <div className="flex justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <StaticLoader />
                    </div>
                ) : reportData.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <FaHistory className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 text-lg font-medium">{t("No movement data found")}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-mainColor font-bold">
                                {activeTab === 'sales' ? (
                                    <tr>
                                        <th className="px-6 py-4 border-b font-bold">#</th>
                                        <th className="px-6 py-4 border-b font-bold">{t("Date")}</th>
                                        <th className="px-6 py-4 border-b font-bold text-center">{t("Count")}</th>
                                        <th className="px-6 py-4 border-b font-bold text-center">{t("Price")}</th>
                                        <th className="px-6 py-4 border-b font-bold text-center">{t("Total")}</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-6 py-4 border-b font-bold">#</th>
                                        <th className="px-6 py-4 border-b font-bold">{t("Date")}</th>
                                        <th className="px-6 py-4 border-b font-bold text-center">{t("Quantity")}</th>
                                        <th className="px-6 py-4 border-b font-bold text-center">{t("Cost")}</th>
                                        <th className="px-6 py-4 border-b font-bold text-center">{t("Total Cost")}</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredReportData.map((item, index) => {
                                    const data = item[activeTab];
                                    if (!data) return null;
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-400">{index + 1}</td>
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{data.date}</td>
                                            {activeTab === 'sales' ? (
                                                <>
                                                    <td className="px-6 py-4 text-center font-bold text-lg">{data.count}</td>
                                                    <td className="px-6 py-4 text-center text-gray-700">{data.price}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-mainColor text-lg">{data.total}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 text-center font-bold text-lg">{data.quintity}</td>
                                                    <td className="px-6 py-4 text-center text-gray-700">{data.coast}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-mainColor text-lg">{data.total_coast}</td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsMovements;
