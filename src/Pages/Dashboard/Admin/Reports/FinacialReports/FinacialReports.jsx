import React, { useEffect, useState } from "react";
import { usePost } from "../../../../../Hooks/usePostJson";
import { DateInput } from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const FinacialReports = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/admin/reports/financial_reports` });
  const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({
    url: `${apiUrl}/admin/reports/lists_report`
  });

  const [cashierMans, setCashierMans] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [financialAccounts, setFinancialAccounts] = useState([]);

  // Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCashierId, setSelectedCashierId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedCashierManId, setSelectedCashierManId] = useState(null);
  const [selectedFinancialId, setSelectedFinancialId] = useState(null);

  const { t } = useTranslation();

  // Extract full report data
  const reportData = response?.data || null;

  useEffect(() => {
    refetchList();
  }, [refetchList]);

  useEffect(() => {
    if (dataList) {
      setCashierMans(dataList.cashier_man || []);
      setCashiers(dataList.cashier || []);
      setBranches(dataList.branches || []);
      setFinancialAccounts(dataList.financial_account || []);
    }
  }, [dataList]);

  const prepareOptions = (data, labelKey = 'name') => {
    const options = data.map(item => ({
      value: item.id,
      label: item[labelKey] || item.user_name || `ID: ${item.id}`
    }));
    return [{ value: 'all', label: t('All') }, ...options];
  };

  const cashierManOptions = prepareOptions(cashierMans, 'user_name');
  const cashierOptions = prepareOptions(cashiers);
  const branchOptions = prepareOptions(branches);
  const financialOptions = prepareOptions(financialAccounts);

  const handleGenerateReport = () => {
    const formData = new FormData();
    if (fromDate) formData.append("from", fromDate);
    if (toDate) formData.append("to", toDate);
    if (selectedCashierId && selectedCashierId !== 'all') formData.append("cashier_id", selectedCashierId);
    if (selectedBranchId && selectedBranchId !== 'all') formData.append("branch_id", selectedBranchId);
    if (selectedCashierManId && selectedCashierManId !== 'all') formData.append("cashier_man_id", selectedCashierManId);
    if (selectedFinancialId && selectedFinancialId !== 'all') formData.append("financial_id", selectedFinancialId);

    postData(formData);
  };

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedCashierId(null);
    setSelectedBranchId(null);
    setSelectedCashierManId(null);
    setSelectedFinancialId(null);
  };

  const getFilterText = () => {
    let text = `${t("Date Range")}: ${fromDate || 'N/A'} - ${toDate || 'N/A'}`;
    if (selectedBranchId) {
      const branchName = branches.find(b => b.id === selectedBranchId)?.name;
      if (branchName) text += ` | ${t("Branch")}: ${branchName}`;
    }
    if (reportData?.start && reportData?.end) {
      text += ` | ${t("Report Period")}: ${reportData.start} - ${reportData.end}`;
    }
    return text;
  };

  const handlePrint = () => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    const date = new Date().toLocaleDateString();

    const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${t('Financial Report')}</title>
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
                .info-row {
                    margin-bottom: 5px;
                    font-size: 10px;
                }
                .section {
                    border-bottom: 1px dashed #000;
                    padding: 10px 0;
                    margin-bottom: 5px;
                }
                .section-title {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 8px;
                    text-align: center;
                    background: #f0f0f0;
                    padding: 5px;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    font-size: 11px;
                }
                .item-name {
                    flex: 1;
                    font-weight: bold;
                }
                .item-value {
                    text-align: right;
                    font-weight: bold;
                }
                .total-box {
                    border: 2px solid #000;
                    padding: 10px;
                    margin-top: 10px;
                    text-align: center;
                }
                .total-label {
                    font-size: 14px;
                    font-weight: bold;
                }
                .total-value-green {
                    font-size: 16px;
                    font-weight: bold;
                    margin-top: 5px;
                    color: black;
                }
                 .total-value-red {
                    font-size: 16px;
                    font-weight: bold;
                    margin-top: 5px;
                    color: black;
                }
                .footer {
                    text-align: center;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 2px dashed #000;
                    font-size: 10px;
                }
                .account-block {
                    margin-bottom: 8px;
                    border-bottom: 1px dotted #ccc;
                    padding-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">${t('Financial Report')}</div>
                <div class="info-row">${getFilterText()}</div>
                <div class="info-row">${t('Date')}: ${date}</div>
            </div>

            <div class="section">
                <div class="section-title">${t('Summary')}</div>
                <div class="item-row">
                    <span class="item-name">${t('Total Orders')}</span>
                    <span class="item-value">${reportData.order_count}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('Total Revenue')}</span>
                    <span class="item-value">${(reportData.total_amount || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('Total Expenses')}</span>
                    <span class="item-value">${(reportData.expenses_total || 0)} ${t('EGP')}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('principle_price')}</span>
                    <span class="item-value">${(reportData.principle_price || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('price_after_discount')}</span>
                    <span class="item-value">${(reportData.price_after_discount || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
                 <div class="item-row">
                    <span class="item-name">${t('Total Tax')}</span>
                    <span class="item-value">${(reportData.total_tax || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('Void Orders Value')}</span>
                    <span class="item-value">${(reportData.void_order_sum || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('Void Orders Count')}</span>
                    <span class="item-value">${reportData.void_order_count || 0}</span>
                </div>
                 <div class="item-row">
                    <span class="item-name">${t('Total Discount')}</span>
                    <span class="item-value">${(reportData.total_discount || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('Service Fees')}</span>
                    <span class="item-value">${(reportData.service_fees || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('Due Module')}</span>
                    <span class="item-value">${(reportData.due_module || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
                <div class="item-row">
                    <span class="item-name">${t('Due User')}</span>
                    <span class="item-value">${(reportData.due_user || 0).toFixed(2)} ${t('EGP')}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">${t('Financial Accounts Details')}</div>
                ${reportData.financial_accounts.map(acc => {
      const net = (acc.total_amount_delivery || 0) + (acc.total_amount_take_away || 0) + (acc.total_amount_dine_in || 0);
      return `
                    <div class="account-block">
                        <div class="item-row">
                            <span class="item-name" style="text-decoration: underline;">${acc.financial_name}</span>
                        </div>
                        <div class="item-row">
                            <span class="item-name">${t('Balance')}</span>
                            <span class="item-value">${(acc.balance || 0).toFixed(2)} ${t('EGP')}</span>
                        </div>
                        <div class="item-row">
                            <span class="item-name">${t('principle_price')}</span>
                            <span class="item-value">${(acc.principle_price || 0).toFixed(2)} ${t('EGP')}</span>
                        </div>
                        <div class="item-row">
                            <span class="item-name">${t('price_after_discount')}</span>
                            <span class="item-value">${(acc.price_after_discount || 0).toFixed(2)} ${t('EGP')}</span>
                        </div>
                        <div class="item-row">
                            <span class="item-name">${t('Delivery')}</span>
                            <span class="item-value">${acc.total_amount_delivery.toFixed(2)}</span>
                        </div>
                         <div class="item-row">
                            <span class="item-name">${t('Take Away')}</span>
                            <span class="item-value">${acc.total_amount_take_away.toFixed(2)}</span>
                        </div>
                         <div class="item-row">
                            <span class="item-name">${t('Dine In')}</span>
                            <span class="item-value">${acc.total_amount_dine_in.toFixed(2)}</span>
                        </div>
                         <div class="item-row">
                            <span class="item-name">${t('Net Total')}</span>
                            <span class="item-value">${net.toFixed(2)} ${t('EGP')}</span>
                        </div>
                        <div class="item-row">
                            <span class="item-name">${t('Total Out Delivery')}</span>
                            <span class="item-value">${(acc.total_amount_out_delivery || 0).toFixed(2)} ${t('EGP')}</span>
                        </div>
                    </div>
                    `;
    }).join('')}
            </div>

            ${reportData.expenses && reportData.expenses.length > 0 ? `
            <div class="section">
                <div class="section-title">${t('Expenses')}</div>
                ${reportData.expenses.map(exp => `
                     <div class="item-row">
                        <span class="item-name">${exp.financial_account}</span>
                        <span class="item-value">${exp.total} ${t('EGP')}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${reportData.online_order && reportData.online_order.paid && reportData.online_order.paid.length > 0 ? `
            <div class="section">
                <div class="section-title">${t('Paid Online Orders')}</div>
                ${reportData.online_order.paid.map(item => `
                     <div class="item-row">
                        <span class="item-name">${item.payment_method}</span>
                        <span class="item-value">${item.amount.toFixed(2)} ${t('EGP')}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${reportData.online_order && reportData.online_order.un_paid && reportData.online_order.un_paid.length > 0 ? `
            <div class="section">
                <div class="section-title">${t('Unpaid / Cash on Delivery')}</div>
                 ${reportData.online_order.un_paid.map(item => `
                     <div class="item-row">
                        <span class="item-name">${item.payment_method}</span>
                        <span class="item-value">${item.amount.toFixed(2)} ${t('EGP')}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div class="total-box">
                <div class="total-label">${t('Net Profit')}</div>
                <div class="${((reportData.total_amount || 0)) >= 0 ? "total-value-green" : "total-value-red"}">
                    ${((reportData.total_amount || 0)).toFixed(2)} ${t('EGP')}
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

  const handlePrintPdf = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(20);
    doc.text(t("Financial Report"), 14, 22);

    doc.setFontSize(10);
    doc.text(getFilterText(), 14, 30);

    // 1. Summary
    const summaryData = [
      [t("Total Orders"), reportData.order_count || 0],
      [t("Total Revenue"), `${(reportData.total_amount || 0).toFixed(2)} ${t('EGP')}`],
      [t("Total Expenses"), `${(reportData.expenses_total || 0)} ${t('EGP')}`],
      [t("Principle Price"), `${(reportData.principle_price || 0).toFixed(2)} ${t('EGP')}`],
      [t("Price After Discount"), `${(reportData.price_after_discount || 0).toFixed(2)} ${t('EGP')}`],
      [t("Total Tax"), `${(reportData.total_tax || 0).toFixed(2)} ${t('EGP')}`],
      [t("Void Orders Value"), `${(reportData.void_order_sum || 0).toFixed(2)} ${t('EGP')}`],
      [t("Void Orders Count"), reportData.void_order_count || 0],
      [t("Total Discount"), `${(reportData.total_discount || 0).toFixed(2)} ${t('EGP')}`],
      [t("Service Fees"), `${(reportData.service_fees || 0).toFixed(2)} ${t('EGP')}`],
      [t("Due Module"), `${(reportData.due_module || 0).toFixed(2)} ${t('EGP')}`],
      [t("Due User"), `${(reportData.due_user || 0).toFixed(2)} ${t('EGP')}`]
    ];

    autoTable(doc, {
      startY: 40,
      head: [[t("Summary Metric"), t("Value")]],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] } // Blue
    });

    // 2. Financial Accounts
    const accountsBody = reportData.financial_accounts.map((acc, index) => {
      const net = (acc.total_amount_delivery || 0) + (acc.total_amount_take_away || 0) + (acc.total_amount_dine_in || 0);
      return [
        index + 1,
        acc.financial_name,
        (acc.balance || 0).toFixed(2),
        (acc.principle_price || 0).toFixed(2),
        (acc.price_after_discount || 0).toFixed(2),
        acc.total_amount_delivery.toFixed(2),
        acc.total_amount_take_away.toFixed(2),
        acc.total_amount_dine_in.toFixed(2),
        net.toFixed(2),
        (acc.total_amount_out_delivery || 0).toFixed(2)
      ];
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [[t("No."), t("Account"), t("Balance"), t("principle_price"), t("price_after_discount"), t("Delivery"), t("Take Away"), t("Dine In"), t("Net Total"), t("Total Out Delivery")]],
      body: accountsBody,
      headStyles: { fillColor: [22, 163, 74] } // Green
    });

    // 3. Expenses
    if (reportData.expenses && reportData.expenses.length > 0) {
      const expensesBody = reportData.expenses.map(exp => [
        exp.financial_account,
        exp.total
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[t("Expense Account"), t("Amount")]],
        body: expensesBody,
        headStyles: { fillColor: [220, 38, 38] } // Red
      });
    }

    // 4. Paid Online Orders
    if (reportData.online_order && reportData.online_order.paid && reportData.online_order.paid.length > 0) {
      const paidOnlineBody = reportData.online_order.paid.map(item => [
        item.payment_method,
        item.amount.toFixed(2)
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[t("Paid Online Orders Payment Method"), t("Amount")]],
        body: paidOnlineBody,
        headStyles: { fillColor: [22, 163, 74] } // Green
      });
    }

    // 5. Unpaid / Cash on Delivery
    if (reportData.online_order && reportData.online_order.un_paid && reportData.online_order.un_paid.length > 0) {
      const unpaidOnlineBody = reportData.online_order.un_paid.map(item => [
        item.payment_method,
        item.amount.toFixed(2)
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [[t("Unpaid / Cash on Delivery Payment Method"), t("Amount")]],
        body: unpaidOnlineBody,
        headStyles: { fillColor: [234, 88, 12] } // Orange
      });
    }

    doc.save(`Financial_Report_${date.replace(/\//g, '-')}.pdf`);
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    const date = new Date().toLocaleDateString();

    const data = [
      { A: t("Financial Report") },
      { A: getFilterText() },
      { A: "" },

      // Summary
      { A: t("Summary") },
      { A: t("Total Orders"), B: reportData.order_count || 0 },
      { A: t("Total Revenue"), B: reportData.total_amount || 0 },
      { A: t("Total Expenses"), B: reportData.expenses_total || 0 },
      { A: t("Principle Price"), B: reportData.principle_price || 0 },
      { A: t("Price After Discount"), B: reportData.price_after_discount || 0 },
      { A: t("Total Tax"), B: reportData.total_tax || 0 },
      { A: t("Void Orders Value"), B: reportData.void_order_sum || 0 },
      { A: t("Void Orders Count"), B: reportData.void_order_count || 0 },
      { A: t("Total Discount"), B: reportData.total_discount || 0 },
      { A: t("Service Fees"), B: reportData.service_fees || 0 },
      { A: t("Due Module"), B: reportData.due_module || 0 },
      { A: t("Due User"), B: reportData.due_user || 0 },
      { A: "" },

      // Accounts
      { A: t("Financial Accounts Details") },
      { A: t("Account"), B: t("Balance"), C: t("principle_price"), D: t("price_after_discount"), E: t("Delivery"), F: t("Take Away"), G: t("Dine In"), H: t("Net Total"), I: t("Total Out Delivery") },
      ...reportData.financial_accounts.map(acc => {
        const net = (acc.total_amount_delivery || 0) + (acc.total_amount_take_away || 0) + (acc.total_amount_dine_in || 0);
        return {
          A: acc.financial_name,
          B: acc.balance || 0,
          C: acc.principle_price || 0,
          D: acc.price_after_discount || 0,
          E: acc.total_amount_delivery || 0,
          F: acc.total_amount_take_away || 0,
          G: acc.total_amount_dine_in || 0,
          H: net,
          I: acc.total_amount_out_delivery || 0
        };
      }),
      { A: "" },

      // Expenses
      { A: t("Expenses") },
      { A: t("Account"), B: t("Amount") },
      ...(reportData.expenses || []).map(exp => ({
        A: exp.financial_account,
        B: exp.total || 0
      })),
      { A: "" },

      // Paid Online Orders
      { A: t("Paid Online Orders") },
      { A: t("Payment Method"), B: t("Amount") },
      ...(reportData.online_order && reportData.online_order.paid ? reportData.online_order.paid.map(item => ({
        A: item.payment_method,
        B: item.amount || 0
      })) : []),
      { A: "" },

      // Unpaid / Cash on Delivery
      { A: t("Unpaid / Cash on Delivery") },
      { A: t("Payment Method"), B: t("Amount") },
      ...(reportData.online_order && reportData.online_order.un_paid ? reportData.online_order.un_paid.map(item => ({
        A: item.payment_method,
        B: item.amount || 0
      })) : [])
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");
    XLSX.writeFile(workbook, `Financial_Report_${date.replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="w-full p-2 md:p-4 xl:p-6 pb-32 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-mainColor">{t("Financial Report")}</h1>
          {reportData?.start && reportData?.end && (
            <p className="text-sm text-gray-500 mt-1">
              {t("Report Period")}: {reportData.start} - {reportData.end}
            </p>
          )}
        </div>
        {reportData && (
          <div className="flex flex-row gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-2 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm font-bold"
            >
              <FaFileExcel size={18} />
              {t("Excel")}
            </button>
            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-2 px-2 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm font-bold"
            >
              <FaFilePdf size={18} />
              {t("PDF")}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-bold"
            >
              <FaPrint size={18} />
              {t("Print")}
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="p-2 md:p-4 xl:p-6 rounded-lg shadow-sm bg-gray-50">
        <h2 className="mb-4 text-xl font-semibold text-mainColor">{t("Filters")}</h2>
        <div className="flex flex-col w-full gap-4 mb-4 md:flex-row">
          <DateInput placeholder="From Date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} borderColor="mainColor" />
          <DateInput placeholder="To Date" value={toDate} onChange={(e) => setToDate(e.target.value)} borderColor="mainColor" />
        </div>
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{t("Cashier")}</label>
            <Select options={cashierOptions} onChange={(opt) => setSelectedCashierId(opt?.value || null)} isClearable placeholder={t("Select Cashier")} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{t("Branch")}</label>
            <Select options={branchOptions} onChange={(opt) => setSelectedBranchId(opt?.value || null)} isClearable placeholder={t("Select Branch")} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{t("Cashier Man")}</label>
            <Select options={cashierManOptions} onChange={(opt) => setSelectedCashierManId(opt?.value || null)} isClearable placeholder={t("Select Cashier Man")} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{t("Financial Account")}</label>
            <Select options={financialOptions} onChange={(opt) => setSelectedFinancialId(opt?.value || null)} isClearable placeholder={t("Select Account")} />
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={handleGenerateReport} className="px-3 py-3 font-medium text-white rounded-lg bg-mainColor hover:bg-opacity-90">
            {t("Generate Report")}
          </button>
          <button onClick={handleResetFilters} className="px-3 py-3 font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600">
            {t("Reset Filters")}
          </button>
        </div>
      </div>

      {loadingPost && <p className="text-lg text-center text-gray-600">{t("Loading report...")}</p>}

      {/* Full Report Display */}
      {
        reportData && (
          <div className="space-y-8">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-sm font-medium text-blue-800">{t("Total Orders")}</h3>
                <p className="text-3xl font-bold text-blue-900">{reportData.order_count}</p>
              </div>
              <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                <h3 className="text-sm font-medium text-green-800">{t("Total Revenue")}</h3>
                <p className="text-3xl font-bold text-green-900">{reportData.total_amount.toFixed(2)} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                <h3 className="text-sm font-medium text-red-800">{t("Total Expenses")}</h3>
                <p className="text-3xl font-bold text-red-900">{reportData.expenses_total} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-sm font-medium text-blue-800">{t("principle_price")}</h3>
                <p className="text-3xl font-bold text-blue-900">{(reportData.principle_price || 0).toFixed(2)} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-teal-200 rounded-lg bg-teal-50">
                <h3 className="text-sm font-medium text-teal-800">{t("price_after_discount")}</h3>
                <p className="text-3xl font-bold text-teal-900">{(reportData.price_after_discount || 0).toFixed(2)} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-orange-200 rounded-lg bg-orange-50">
                <h3 className="text-sm font-medium text-orange-800">{t("Total Tax")}</h3>
                <p className="text-3xl font-bold text-orange-900">{(reportData.total_tax || 0).toFixed(2)} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                <h3 className="text-sm font-medium text-red-800">{t("Void Orders Value")}</h3>
                <p className="text-3xl font-bold text-red-900">{(reportData.void_order_sum || 0).toFixed(2)} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                <h3 className="text-sm font-medium text-red-800">{t("Void Orders Count")}</h3>
                <p className="text-3xl font-bold text-red-900">{reportData.void_order_count || 0}</p>
              </div>
              <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-sm font-medium text-blue-800">{t("Total Discount")}</h3>
                <p className="text-3xl font-bold text-blue-900">{(reportData.total_discount || 0).toFixed(2)} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-teal-200 rounded-lg bg-teal-50">
                <h3 className="text-sm font-medium text-teal-800">{t("Service Fees")}</h3>
                <p className="text-3xl font-bold text-teal-900">{(reportData.service_fees || 0).toFixed(2)} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-purple-200 rounded-lg bg-purple-50">
                <h3 className="text-sm font-medium text-purple-800">{t("Due Module")}</h3>
                <p className="text-3xl font-bold text-purple-900">{(reportData.due_module || 0).toFixed(2)} {t("EGP")}</p>
              </div>
              <div className="p-6 border border-pink-200 rounded-lg bg-pink-50">
                <h3 className="text-sm font-medium text-pink-800">{t("Due User")}</h3>
                <p className="text-3xl font-bold text-pink-900">{(reportData.due_user || 0).toFixed(2)} {t("EGP")}</p>
              </div>
            </div>

            {/* Financial Accounts Breakdown */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <h2 className="p-4 text-xl font-bold text-white bg-mainColor">{t("Financial Accounts Details")}</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("No.")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Account")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700">{t("Balance")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700">{t("principle_price")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700">{t("price_after_discount")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700">{t("Delivery")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700">{t("Take Away")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700">{t("Dine In")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700">{t("Net Total")}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-right text-gray-700">{t("Total Out Delivery")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.financial_accounts.map((acc, index) => {
                      const net = (acc.total_amount_delivery || 0) + (acc.total_amount_take_away || 0) + (acc.total_amount_dine_in || 0);
                      return (
                        <tr key={acc.financial_id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">{acc.financial_name}</td>
                          <td className={`px-4 py-3 text-right ${acc.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(acc.balance || 0).toFixed(2)} {t("EGP")}
                          </td>
                          <td className={`px-4 py-3 text-right ${acc.principle_price < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(acc.principle_price || 0).toFixed(2)} {t("EGP")}
                          </td>
                          <td className={`px-4 py-3 text-right ${acc.price_after_discount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(acc.price_after_discount || 0).toFixed(2)} {t("EGP")}
                          </td>
                          <td className={`px-4 py-3 text-right ${acc.total_amount_delivery < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {acc.total_amount_delivery.toFixed(2)}
                          </td>
                          <td className={`px-4 py-3 text-right ${acc.total_amount_take_away < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {acc.total_amount_take_away.toFixed(2)}
                          </td>
                          <td className={`px-4 py-3 text-right ${acc.total_amount_dine_in < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {acc.total_amount_dine_in.toFixed(2)}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${net < 0 ? 'text-red-700' : 'text-green-700'}`}>
                            {net.toFixed(2)} {t("EGP")}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${acc.total_amount_out_delivery < 0 ? 'text-red-700' : 'text-green-700'}`}>
                            {(acc.total_amount_out_delivery || 0).toFixed(2)} {t("EGP")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses */}
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <h2 className="p-4 text-xl font-bold text-white bg-red-600">{t("Expenses")}</h2>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reportData.expenses.map((exp, i) => (
                    <div key={i} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <p className="text-sm text-gray-600">{t("Account")}</p>
                      <p className="text-lg font-semibold">{exp.financial_account}</p>
                      <p className="text-2xl font-bold text-red-700">{exp.total} {t("EGP")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Online Orders - Paid vs Unpaid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Paid Online Orders */}
              <div className="bg-white rounded-lg shadow">
                <h2 className="p-4 text-xl font-bold text-white bg-green-600">{t("Paid Online Orders")}</h2>
                <div className="p-6 space-y-4">
                  {reportData.online_order.paid.length > 0 ? (
                    reportData.online_order.paid.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-green-50">
                        <div>
                          <p className="font-medium capitalize">{item.payment_method}</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{item.amount.toFixed(2)} {t("EGP")}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-gray-500">{t("No paid online orders")}</p>
                  )}
                </div>
              </div>

              {/* Unpaid Online Orders */}
              <div className="bg-white rounded-lg shadow">
                <h2 className="p-4 text-xl font-bold text-white bg-orange-600">{t("Unpaid / Cash on Delivery")}</h2>
                <div className="p-6 space-y-4">
                  {reportData.online_order.un_paid.length > 0 ? (
                    reportData.online_order.un_paid.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-orange-50">
                        <div>
                          <p className="font-medium capitalize">{item.payment_method}</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">{item.amount.toFixed(2)} {t("EGP")}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-gray-500">{t("No unpaid online orders")}</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )
      }

      {
        !loadingPost && !reportData && (
          <div className="py-20 text-center text-gray-500">
            <p className="text-2xl">{t("No report generated yet")}</p>
            <p>{t(`Select filters and click "Generate Report"`)}</p>
          </div>
        )
      }
    </div >
  );
};

export default FinacialReports;