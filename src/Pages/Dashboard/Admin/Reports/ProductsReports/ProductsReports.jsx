import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../../../../Hooks/useGet';
import { DateInput, StaticLoader, TextInput } from '../../../../../Components/Components';
import { FaFileExcel, FaFilePdf, FaPrint, FaSearch, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSelector } from 'react-redux';
import Select from 'react-select';

const ProductsReports = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");

    // Fetch Filter Lists
    const { data: listData } = useGet({
        url: `${apiUrl}/admin/reports/product_report_lists`
    });

    // Filter States
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [sort, setSort] = useState('desc');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedCashier, setSelectedCashier] = useState(null);
    const [selectedCashierMan, setSelectedCashierMan] = useState(null);
    const [filterCategory, setFilterCategory] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [viewModalCategory, setViewModalCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Derived Options
    const branchOptions = useMemo(() => listData?.branches?.map(b => ({ value: b.id, label: b.name })) || [], [listData]);
    const cashierOptions = useMemo(() => listData?.cashiers?.map(c => ({ value: c.id, label: c.name })) || [], [listData]);
    const cashierManOptions = useMemo(() => listData?.cashier_men?.map(c => ({ value: c.id, label: c.user_name })) || [], [listData]);
    const categoryOptions = useMemo(() => listData?.categories?.map(c => ({ value: c.id, label: c.name })) || [], [listData]);

    const productOptions = useMemo(() => {
        if (!listData?.products) return [];
        let products = listData.products;

        // Filter by selected category if any
        if (filterCategory) {
            products = products.filter((p => p.category_id === filterCategory.value) || (p => p.sub_category_id === filterCategory.value));
        }

        return products.map(p => ({ value: p.id, label: p.name }));
    }, [listData, filterCategory]);

    // Construct URL with query params (internal)
    const generateUrl = () => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);
        if (selectedBranch) params.append('branch_id', selectedBranch.value);
        if (selectedCashier) params.append('cashier_id', selectedCashier.value);
        if (selectedCashierMan) params.append('cashier_man_id', selectedCashierMan.value);

        if (filterCategory) params.append('category_id', filterCategory.value);
        if (selectedProducts && selectedProducts.length > 0) {
            selectedProducts.forEach((p, index) => {
                params.append(`products[${index}]`, p.value);
            });
        }
        return `${apiUrl}/admin/reports/product_report?${params.toString()}&locale=${selectedLanguage}`;
    };

    // State for the actual URL used by useGet
    const [fetchUrl, setFetchUrl] = useState(generateUrl());

    // Effect to update fetchUrl when language changes (optional but good practice)
    useEffect(() => {
        setFetchUrl(generateUrl());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage]);

    const { data, loading, refetch } = useGet({
        url: fetchUrl
    });

    const reportData = data?.data || [];

    // Client-side filtering logic
    const filteredReportData = useMemo(() => {
        if (!searchQuery) return reportData;

        const lowerQuery = searchQuery.toLowerCase();

        return reportData.map(categoryItem => {
            // Filter products inside the category
            const matchingProducts = (categoryItem.products || []).filter(product =>
                (product.product_name || product.name || "").toLowerCase().includes(lowerQuery)
            );

            if (matchingProducts.length === 0) return null; // Filter out category later

            // Recalculate totals for the filtered view
            const newCount = matchingProducts.reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
            const newPrice = matchingProducts.reduce((sum, p) => sum + (parseFloat(p.price || 0)), 0);

            return {
                ...categoryItem,
                products: matchingProducts,
                products_count: newCount,
                products_price: newPrice.toFixed(2)
            };
        }).filter(item => item !== null); // Remove categories with no matching products

    }, [reportData, searchQuery]);

    // Flatten data for table display
    const flatProducts = useMemo(() => {
        return filteredReportData.flatMap(cat =>
            (cat.products || []).map(prod => ({
                ...prod,
                category_name: cat.category
            }))
        );
    }, [filteredReportData]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(flatProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = flatProducts.slice(startIndex, startIndex + itemsPerPage);

    const grandTotalCount = useMemo(() => flatProducts.reduce((sum, item) => sum + (parseFloat(item.count) || 0), 0), [flatProducts]);
    const grandTotalPrice = useMemo(() => flatProducts.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0), [flatProducts]);

    // Generate pagination numbers with ellipsis
    const getPaginationNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current page
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
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        setFetchUrl(generateUrl()); // Just update the URL
    };

    const handleResetFilters = () => {
        setFromDate('');
        setToDate('');
        setSort('desc');
        setSelectedBranch(null);
        setSelectedCashier(null);
        setSelectedCashierMan(null);
        setFilterCategory(null);
        setSelectedProducts([]);
        setSearchQuery('');
        setCurrentPage(1);
        // Reset URL to default (empty params)
        const defaultUrl = `${apiUrl}/admin/reports/product_report?sort=desc&locale=${selectedLanguage}`;
        setFetchUrl(defaultUrl);
        setTimeout(() => refetch(), 500);
    };

    const handlePrint = () => {
        if (filteredReportData.length === 0) return;

        const printWindow = window.open('', '_blank');
        const date = new Date().toLocaleDateString();

        const totalProducts = grandTotalCount;
        const totalPrice = grandTotalPrice;

        const receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${t('Products Report')}</title>
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
                    .filters {
                        font-size: 10px;
                        color: #666;
                    }
                    .category {
                        border-bottom: 2px dashed #000;
                        padding: 10px 0;
                        margin-bottom: 5px;
                    }
                    .category-header {
                        font-weight: bold;
                        font-size: 14px;
                        margin-bottom: 8px;
                        text-align: center;
                        background: #f0f0f0;
                        padding: 5px;
                    }
                    .product-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 3px 5px;
                        font-size: 11px;
                        border-bottom: 1px dotted #ddd;
                    }
                    .product-name {
                        flex: 1;
                        font-weight: bold;
                        font-size: 13px;
                    }
                    .product-count {
                        width: 40px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 13px;
                    }
                    .product-price {
                        width: 70px;
                        text-align: right;
                        font-weight: bold;
                        font-size: 13px;
                    }
                    .category-total {
                        display: flex;
                        justify-content: space-between;
                        font-weight: bold;
                        margin-top: 5px;
                        padding: 5px;
                        background: #f9f9f9;
                    }
                    .total {
                        border-top: 2px solid #000;
                        margin-top: 10px;
                        padding-top: 10px;
                        font-weight: bold;
                        font-size: 14px;
                    }
                    .total-row {
                        display: flex;
                        justify-space-between;
                        margin: 5px 0;
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
                    <div class="title">${t('Products Report')}</div>
                    <div class="date">${t('Date')}: ${date}</div>
                </div>

                ${filteredReportData.map((item, index) => `
                    <div class="category">
                        <div class="category-header">${index + 1}. ${item.category}</div>
                        ${item.products && item.products.length > 0 ? `
                            ${item.products.map(product => `
                                <div class="product-item">
                                    <div style="flex: 1;">
                                        <div class="product-name">${product.product_name || product.name}</div>
                                        <div style="font-size: 10px; color: #555; margin-top: 2px;">
                                            ${t('element_price')}: ${(parseFloat(product.element_price || 0)).toFixed(2)} | ${t('principle_price')}: ${(parseFloat(product.principle_price || 0)).toFixed(2)} | ${t('price_after_discount')}: ${(parseFloat(product.price_after_discount || 0)).toFixed(2)}
                                        </div>
                                    </div>
                                    <span class="product-count">x${product.count || 0}</span>
                                    <span class="product-price">${(parseFloat(product.price || 0)).toFixed(2)}</span>
                                </div>
                            `).join('')}
                            <div class="category-total">
                                <span>${t('Category Total')}:</span>
                                <span>${item.products_price} ${t('EGP')}</span>
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 10px; color: #999;font-weight: bold;font-size: 13px;">
                                ${t('No products')}
                            </div>
                        `}
                    </div>
                `).join('')}

                <div class="total">
                    <div class="total-row">
                        <span>${t('Total Products')}:</span>
                        <span>${totalProducts}</span>
                    </div>
                    <div class="total-row">
                        <span>${t('Total Price')}:</span>
                        <span>${totalPrice.toFixed(2)} ${t('EGP')}</span>
                    </div>
                </div>

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

    const handleExportExcel = () => {
        if (!flatProducts || flatProducts.length === 0) return;

        const dataToExport = flatProducts.map((item, index) => ({
            [t("#")]: index + 1,
            [t("Category")]: item.category_name,
            [t("Product Name")]: item.name || item.product_name,
            [t("Count")]: item.count,
            [t("element_price")]: parseFloat(item.element_price || 0).toFixed(2),
            [t("principle_price")]: parseFloat(item.principle_price || 0).toFixed(2),
            [t("price_after_discount")]: parseFloat(item.price_after_discount || 0).toFixed(2),
            [t("Total Price")]: parseFloat(item.price || 0).toFixed(2),
        }));

        // Add Total Row
        dataToExport.push({
            [t("#")]: "",
            [t("Category")]: "",
            [t("Product Name")]: t("Total"),
            [t("Count")]: grandTotalCount,
            [t("element_price")]: "",
            [t("principle_price")]: "",
            [t("price_after_discount")]: "",
            [t("Total Price")]: grandTotalPrice.toFixed(2),
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products Report");

        XLSX.writeFile(workbook, "Products_Report.xlsx");
    };

    const handlePrintPdf = () => {
        if (flatProducts.length === 0) return;

        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();

        doc.setFontSize(20);
        doc.text(t("Products Report"), 14, 22);

        doc.setFontSize(10);
        doc.text(`${t("Date")}: ${date}`, 14, 30);

        const tableBody = flatProducts.map((item, index) => [
            index + 1,
            item.category_name,
            item.name || item.product_name,
            item.count,
            parseFloat(item.element_price || 0).toFixed(2),
            parseFloat(item.principle_price || 0).toFixed(2),
            parseFloat(item.price_after_discount || 0).toFixed(2),
            parseFloat(item.price || 0).toFixed(2)
        ]);

        // Add Total Row to Body
        tableBody.push([
            "",
            "",
            { content: t("Total"), styles: { fontStyle: 'bold' } },
            { content: grandTotalCount, styles: { fontStyle: 'bold' } },
            "",
            "",
            "",
            { content: grandTotalPrice.toFixed(2) + " " + t("EGP"), styles: { fontStyle: 'bold' } }
        ]);

        autoTable(doc, {
            startY: 40,
            head: [[t("#"), t("Category"), t("Product Name"), t("Count"), t("element_price"), t("principle_price"), t("price_after_discount"), t("Total Price")]],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`Products_Report_${date.replace(/\//g, '-')}.pdf`);
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
                <h1 className="text-2xl font-bold text-mainColor">{t('Products Report')}</h1>
                {filteredReportData.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm font-bold"
                        >
                            <FaFileExcel size={18} />
                            {t("Excel")}
                        </button>
                        {/* <button
                            onClick={handlePrintPdf}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm font-bold"
                        >
                            <FaFilePdf size={18} />
                            {t("PDF")}
                        </button> */}
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
            <div className="p-2 md:p-4 mb-6 rounded-lg bg-gray-50 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">

                    {/* 1. Category */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Category")}</label>
                        <Select
                            options={categoryOptions}
                            value={filterCategory}
                            onChange={setFilterCategory}
                            placeholder={t("Select Category")}
                            styles={selectStyles}
                            isClearable
                        />
                    </div>

                    {/* 2. Products */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Products")}</label>
                        <Select
                            options={productOptions}
                            value={selectedProducts}
                            onChange={setSelectedProducts}
                            placeholder={t("Select Products")}
                            styles={selectStyles}
                            isMulti
                            isClearable
                            isDisabled={!filterCategory}
                        />
                    </div>

                    {/* 3. Branch */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Branch")}</label>
                        <Select
                            options={branchOptions}
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                            placeholder={t("Select Branch")}
                            styles={selectStyles}
                            isClearable
                        />
                    </div>

                    {/* 4. Cashier */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Cashier")}</label>
                        <Select
                            options={cashierOptions}
                            value={selectedCashier}
                            onChange={setSelectedCashier}
                            placeholder={t("Select Cashier")}
                            styles={selectStyles}
                            isClearable
                        />
                    </div>

                    {/* 5. Cashier Man */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Cashier Man")}</label>
                        <Select
                            options={cashierManOptions}
                            value={selectedCashierMan}
                            onChange={setSelectedCashierMan}
                            placeholder={t("Select Cashier Man")}
                            styles={selectStyles}
                            isClearable
                        />
                    </div>

                    {/* 6. From Date */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("From Date")}</label>
                        <DateInput
                            placeholder={t("From Date")}
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* 7. To Date */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("To Date")}</label>
                        <DateInput
                            placeholder={t("To Date")}
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* 8. Sort Order */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Sort Order")}</label>
                        <Select
                            options={[
                                { value: 'desc', label: t('Descending') },
                                { value: 'asc', label: t('Ascending') }
                            ]}
                            value={[
                                { value: 'desc', label: t('Descending') },
                                { value: 'asc', label: t('Ascending') }
                            ].find(o => o.value === sort)}
                            onChange={(option) => setSort(option ? option.value : 'desc')}
                            placeholder={t("Select Sort Order")}
                            styles={selectStyles}
                            isSearchable={false}
                        />
                    </div>
                </div>

                {/* Buttons Row */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <button
                        onClick={handleApplyFilters}
                        className="px-6 py-2.5 text-white bg-mainColor rounded-xl hover:bg-opacity-90 transition-colors font-semibold"
                    >
                        {t("Filter")}
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                        {t("Cancel")}
                    </button>
                </div>

                {/* Search Bar (Client Side) */}
                <div className="w-full border-t pt-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t("Search Products")}</label>
                    <div className="relative">
                        <TextInput
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("Search by product name...")}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <StaticLoader />
                </div>
            ) : flatProducts.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg font-medium">{t("No data found matching your filters")}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-mainColor font-bold">
                                <tr>
                                    <th className="px-6 py-4 border-b">#</th>
                                    <th className="px-6 py-4 border-b">{t("Category")}</th>
                                    <th className="px-6 py-4 border-b">{t("Product Name")}</th>
                                    <th className="px-6 py-4 border-b">{t("Count")}</th>
                                    <th className="px-6 py-4 border-b">{t("element_price")}</th>
                                    <th className="px-6 py-4 border-b">{t("principle_price")}</th>
                                    <th className="px-6 py-4 border-b">{t("price_after_discount")}</th>
                                    <th className="px-6 py-4 border-b">{t("Total Price")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentItems.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-500">{startIndex + index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-600">{item.category_name}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{item.name || item.product_name}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                                                {item.count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-mainColor">
                                            {parseFloat(item.element_price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-mainColor">
                                            {parseFloat(item.principle_price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-mainColor">
                                            {parseFloat(item.price_after_discount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-mainColor">
                                            {parseFloat(item.price || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Compact Grand Totals Summary */}
                    <div className="flex flex-wrap gap-4 items-center justify-end">
                        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                <FaShoppingCart size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-tight leading-none">{t("Total Items")}</p>
                                <p className="text-lg font-black text-blue-900 leading-none mt-0.5">{grandTotalCount.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-2 bg-mainColor/5 border border-mainColor/10 rounded-lg shadow-sm">
                            <div className="p-2 bg-mainColor/10 rounded-lg text-mainColor">
                                <FaMoneyBillWave size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-mainColor/80 uppercase tracking-tight leading-none">{t("Total Value")}</p>
                                <p className="text-lg font-black text-mainColor leading-none mt-0.5">
                                    {grandTotalPrice.toFixed(2)} <span className="text-xs font-bold opacity-70">{t("EGP")}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Professional Pagination - Compact View */}
                    {totalPages > 1 && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                            {/* Page Info */}
                            <div className="text-sm text-gray-500 font-medium">
                                {t("Showing")}{" "}
                                <span className="text-gray-900">{startIndex + 1}</span>
                                {" - "}
                                <span className="text-gray-900">{Math.min(startIndex + itemsPerPage, flatProducts.length)}</span>
                                {" / "}
                                <span className="text-gray-900">{flatProducts.length}</span>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-gray-600 hover:text-mainColor"
                                >
                                    <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {getPaginationNumbers().map((page, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                        disabled={page === '...'}
                                        className={`min-w-[36px] h-9 px-2 rounded-lg border transition-all font-semibold text-sm ${currentPage === page
                                            ? 'bg-mainColor text-white border-mainColor shadow-md scale-105'
                                            : page === '...'
                                                ? 'border-transparent text-gray-400 cursor-default'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-mainColor'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-gray-600 hover:text-mainColor"
                                >
                                    <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductsReports;
