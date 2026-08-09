import { useEffect, useState } from "react";
import { usePost } from "../../../../../Hooks/usePostJson";
import { DateInput } from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import { FaPrint, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

// ===================================================================
// Receipt Formatting Function for Shift Report
// ===================================================================
const formatShiftReceipt = (shiftData, detailsData, t, isRtl) => {
  const formatCurrency = (value) => `${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t("EGP")}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US');
  const timeStr = now.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return `
    <div class="receipt-container" dir="${isRtl ? 'rtl' : 'ltr'}">
      <style>
        @page { size: 80mm auto; margin: 0; }
        body { margin: 0; padding: 0; }
        .receipt-container {
          width: 80mm;
          max-width: 100%;
          padding: 4mm 2mm;
          font-family: 'Arial', sans-serif;
          color: #000;
          background: #fff;
          font-size: 13px;
          box-sizing: border-box;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 15px;
        }
        .header h1 {
          font-size: 20px;
          margin: 0 0 5px 0;
          font-weight: bold;
        }
        .header .meta {
          font-size: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
        }
        .section-box {
          border: 1.5px solid #000;
          padding: 10px;
          margin-bottom: 12px;
          position: relative;
        }
        .section-title {
          font-weight: bold;
          font-size: 15px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px dotted #ccc;
        }
        .row:last-child {
          border-bottom: none;
        }
        .row-label {
          font-weight: 500;
        }
        .row-value {
          font-weight: bold;
        }
        .net-cash-box {
          border: 2px solid #000;
          text-align: center;
          padding: 15px 10px;
          margin-top: 15px;
        }
        .net-cash-label {
          font-size: 13px;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .net-cash-value {
          font-size: 24px;
          font-weight: 900;
        }
        .footer {
          text-align: center;
          margin-top: 25px;
          padding-top: 10px;
          border-top: 1px solid #eee;
          font-size: 11px;
        }
        .footer-line {
          margin-top: 5px;
          color: #666;
        }
        .icon {
          font-size: 18px;
        }
        .sub-section-title {
          font-weight: bold;
          background: #eee;
          padding: 3px 5px;
          margin: 5px 0;
          font-size: 12px;
        }
      </style>

      <div class="header">
        <h1>${t("Shift End Report")}</h1>
        <div class="meta">
          <span>📋</span>
          <span>${dateStr} - ${timeStr}</span>
        </div>
      </div>

      <!-- Cashier Information Box -->
      <div class="section-box">
        <div class="section-title">
          <span class="icon">�</span>
          <span>${t("Cashier Information")}</span>
        </div>
        <div class="row">
          <span class="row-label">${t("name")}</span>
          <span class="row-value">${shiftData.cashier_man?.user_name || '-'}</span>
        </div>
        <div class="row">
          <span class="row-label">${t("Shift Number")}</span>
          <span class="row-value">#${shiftData.cashier_man?.shift_number || '-'}</span>
        </div>
      </div>

      <!-- Timing Information Box -->
      <div class="section-box">
        <div class="section-title">
          <span class="icon">🕒</span>
          <span>${t("Timing Information")}</span>
        </div>
        <div class="row">
          <span class="row-label">${t("Start Time")}</span>
          <span class="row-value">${shiftData.start_time ? new Date(shiftData.start_time).toLocaleString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
        </div>
        <div class="row">
          <span class="row-label">${t("End Time")}</span>
          <span class="row-value">${shiftData.end_time ? new Date(shiftData.end_time).toLocaleString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
        </div>
      </div>

      <!-- Financial Accounts Detailed Box -->
      ${detailsData.financial_accounts && detailsData.financial_accounts.length > 0 ? `
        <div class="section-box">
          <div class="section-title">
            <span class="icon">💳</span>
            <span>${t("Account Breakdown")}</span>
          </div>
          ${detailsData.financial_accounts.map(acc => {
    const accNet = (acc.total_amount_delivery || 0) + (acc.total_amount_take_away || 0) + (acc.total_amount_dine_in || 0);
    return `
              <div class="sub-section-title">${acc.financial_name}</div>
              <div class="row"><span class="row-label">${t("Dine In")}</span><span class="row-value">${formatCurrency(acc.total_amount_dine_in)}</span></div>
              <div class="row"><span class="row-label">${t("Take Away")}</span><span class="row-value">${formatCurrency(acc.total_amount_take_away)}</span></div>
              <div class="row"><span class="row-label">${t("Delivery")}</span><span class="row-value">${formatCurrency(acc.total_amount_delivery)}</span></div>
              <div class="row" style="border-top: 1px solid #000;"><span class="row-label">${t("Net")}</span><span class="row-value">${formatCurrency(accNet)}</span></div>
            `;
  }).join('')}
        </div>
      ` : ''}

       <!-- Expenses Box -->
      ${detailsData.expenses && detailsData.expenses.length > 0 ? `
        <div class="section-box">
          <div class="section-title">
            <span class="icon">💸</span>
            <span>${t("Expenses")}</span>
          </div>
          ${detailsData.expenses.map(exp => `
            <div class="row">
              <span class="row-label">${exp.financial_account}</span>
              <span class="row-value" style="color: #c0392b;">-${formatCurrency(exp.total)}</span>
            </div>
          `).join('')}
          <div class="row" style="border-top: 1px solid #000; margin-top: 5px;">
            <span class="row-label">${t("Total Expenses")}</span>
            <span class="row-value" style="color: #c0392b;">-${formatCurrency(detailsData.expenses_total || 0)}</span>
          </div>
        </div>
      ` : ''}
      <!-- Orders Summary Box -->
      <div class="section-box">
        <div class="section-title">
          <span class="icon">🛒</span>
          <span>${t("Orders Summary")}</span>
        </div>
        <div class="row">
          <span class="row-label">${t("Total Orders")}</span>
          <span class="row-value">${detailsData.order_count || 0}</span>
        </div>
        <div class="row">
          <span class="row-label">${t("Total Revenue")}</span>
          <span class="row-value">${formatCurrency(detailsData.total_amount)}</span>
        </div>
        <div class="row">
          <span class="row-label">${t("Total Expenses")}</span>
          <span class="row-value" style="color: #c0392b;">${formatCurrency(detailsData.expenses_total || 0)}</span>
        </div>
      </div>

      <!-- Online Orders Section -->
      ${(detailsData.online_order?.paid?.length > 0 || detailsData.online_order?.un_paid?.length > 0) ? `
        <div class="section-box">
          <div class="section-title">
            <span class="icon">🌐</span>
            <span>${t("Online Orders")}</span>
          </div>
          ${detailsData.online_order.paid?.length > 0 ? `
            <div class="sub-section-title">${t("Paid Online")}</div>
            ${detailsData.online_order.paid.map(p => `
              <div class="row"><span class="row-label capitalize">${p.payment_method}</span><span class="row-value">${formatCurrency(p.amount)}</span></div>
            `).join('')}
          ` : ''}
          ${detailsData.online_order.un_paid?.length > 0 ? `
            <div class="sub-section-title">${t("Unpaid / COD")}</div>
            ${detailsData.online_order.un_paid.map(u => `
              <div class="row"><span class="row-label capitalize">${u.payment_method}</span><span class="row-value">${formatCurrency(u.amount)}</span></div>
            `).join('')}
          ` : ''}
        </div>
      ` : ''}

      <!-- Net Cash Remaining Box -->
      <div class="net-cash-box">
        <div class="net-cash-label">
          <span>${t("Net Cash Remaining")}</span><br/>
          <small>(${t("Total Cash in Shift")})</small>
        </div>
        <div class="net-cash-value">
          ${formatCurrency((detailsData.total_amount) - (detailsData.expenses_total || 0))}
        </div>
      </div>

      <div class="footer">
        <div style="font-size: 14px; font-weight: bold;">${t("Thank You")} 💫</div>
        <div class="footer-line">
          Powered by <b>Food2Go</b> - food2go.online
        </div>
      </div>
    </div>
  `;
};

const CashierShiftReport = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/admin/reports/cashier_reports` });
  const { t, i18n } = useTranslation();

  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const { refetch: refetchOrder, loading: loadingOrder, data: dataOrder } = useGet({
    url: selectedShiftId ? `${apiUrl}/admin/reports/cashier_report/${selectedShiftId}` : null,
    skip: !selectedShiftId,
  });

  const [shifts, setShifts] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [shiftDetails, setShiftDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const shiftsPerPage = 15;
  const totalPages = Math.ceil(shifts.length / shiftsPerPage);
  const currentShifts = shifts.slice((currentPage - 1) * shiftsPerPage, currentPage * shiftsPerPage);

  useEffect(() => {
    if (selectedShiftId) refetchOrder();
  }, [selectedShiftId, refetchOrder]);

  useEffect(() => {
    if (dataOrder) {
      setShiftDetails(dataOrder);

      const shiftToProcess = shifts.find(s => s.id === selectedShiftId);

      // Handle Printing
      if (isPrinting && shiftToProcess) {
        const isRtl = i18n?.language === 'ar';
        const receiptHtml = formatShiftReceipt(shiftToProcess, dataOrder, t, isRtl);

        const pw = window.open("", "", "width=500,height=600");
        if (pw) {
          pw.document.write("<html><head><title>Shift Report</title></head><body style='margin:0; padding:0;'>");
          pw.document.write(receiptHtml);
          pw.document.write("</body></html>");
          pw.document.close();
          setTimeout(() => { pw.focus(); pw.print(); pw.close(); }, 500);
        }
        setIsPrinting(false);
      }

      // Handle Excel Export
      if (isExporting && shiftToProcess) {
        const date = new Date().toLocaleDateString();
        const exportData = [
          { A: t("Shift End Report") },
          { A: `${new Date().toLocaleString()}` },
          { A: "" },

          // Cashier Info
          { A: t("Cashier Information") },
          { A: t("name"), B: shiftToProcess.cashier_man?.user_name || '-' },
          { A: t("Shift Number"), B: `#${shiftToProcess.cashier_man?.shift_number || '-'}` },
          { A: "" },

          // Timing Info
          { A: t("Timing Information") },
          { A: t("Start Time"), B: shiftToProcess.start_time ? new Date(shiftToProcess.start_time).toLocaleString() : '-' },
          { A: t("End Time"), B: shiftToProcess.end_time ? new Date(shiftToProcess.end_time).toLocaleString() : '-' },
          { A: "" },

          // Account Breakdown
          { A: t("Account Breakdown") },
          { A: t("Account"), B: t("Dine In"), C: t("Take Away"), D: t("Delivery"), E: t("Net") },
          ...(dataOrder.financial_accounts || []).map(acc => ({
            A: acc.financial_name,
            B: acc.total_amount_dine_in || 0,
            C: acc.total_amount_take_away || 0,
            D: acc.total_amount_delivery || 0,
            E: (acc.total_amount_delivery || 0) + (acc.total_amount_take_away || 0) + (acc.total_amount_dine_in || 0)
          })),
          { A: "" },

          // Expenses
          { A: t("Expenses") },
          { A: t("Account"), B: t("Amount") },
          ...(dataOrder.expenses || []).map(exp => ({
            A: exp.financial_account,
            B: exp.total || 0
          })),
          { A: t("Total Expenses"), B: dataOrder.expenses_total || 0 },
          { A: "" },

          // Orders Summary
          { A: t("Orders Summary") },
          { A: t("Total Orders"), B: dataOrder.order_count || 0 },
          { A: t("Total Revenue"), B: dataOrder.total_amount || 0 },
          { A: t("Total Expenses"), B: dataOrder.expenses_total || 0 },
          { A: "" },

          // Online Orders
          { A: t("Online Orders") },
          { A: t("Paid Online") },
          ...(dataOrder.online_order?.paid || []).map(p => ({
            A: p.payment_method, B: p.amount || 0
          })),
          { A: t("Unpaid / COD") },
          ...(dataOrder.online_order?.un_paid || []).map(u => ({
            A: u.payment_method, B: u.amount || 0
          })),
          { A: "" },

          // Net Cash
          { A: t("Net Cash Remaining"), B: (dataOrder.total_amount || 0) - (dataOrder.expenses_total || 0) }
        ];

        const worksheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: true });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Shift Report");
        XLSX.writeFile(workbook, `Shift_Report_${shiftToProcess.cashier_man?.user_name}_${date.replace(/\//g, '-')}.xlsx`);

        setIsExporting(false);
      }
    }
  }, [dataOrder, isPrinting, isExporting, selectedShiftId, shifts, t, i18n?.language]);

  useEffect(() => {
    if (response && !loadingPost) {
      setShifts(response.data?.cashier_shifts || []);
    }
  }, [response, loadingPost]);

  const handleGenerateReport = () => {
    if (fromDate) {

      const payload = {
        start_date: fromDate,
      }
      if (toDate) {
        payload.end_date = toDate;
      }
      postData(payload);
    }
  };

  const handleViewOrders = (shiftId) => {
    setSelectedShiftId(shiftId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShiftId(null);
    setShiftDetails(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Ongoing";
    return new Date(dateString).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  const handlePrintShift = (shiftId) => {
    // Set flag to print after data loads
    setIsPrinting(true);
    // Set the selected shift ID to trigger the useGet hook
    setSelectedShiftId(shiftId);
  };

  const handleExportShift = (shiftId) => {
    // Set flag to export after data loads
    setIsExporting(true);
    // Set the selected shift ID to trigger the useGet hook
    setSelectedShiftId(shiftId);
  };

  return (
    <div className="w-full p-1 space-y-4 p- md:p-6 md:space-y-8">
      <h1 className="text-2xl font-bold md:text-3xl text-mainColor">{t("Cashier Shift Report")}</h1>

      {/* Date Filters */}
      <div className="p-2 rounded-lg shadow-sm md:p-6 bg-gray-50">
        <div className="grid grid-cols-1 gap-3 mb-3 md:gap-6 md:mb-6 md:grid-cols-2">
          <DateInput placeholder="From Date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} borderColor="mainColor" />
          <DateInput placeholder="To Date" value={toDate} onChange={(e) => setToDate(e.target.value)} borderColor="mainColor" />
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={!fromDate}
          className={`w-full md:w-auto px-6 md:px-8 py-2 md:py-3 rounded-lg font-medium transition text-sm md:text-base ${fromDate
            ? "bg-mainColor text-white hover:bg-opacity-90"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          {t("Generate Report")}
        </button>
      </div>

      {/* Shifts Table */}
      {loadingPost ? (
        <p className="text-center text-gray-600">{t("Loading shifts...")}</p>
      ) : shifts.length > 0 ? (
        <div className="w-full overflow-hidden bg-white rounded-lg shadow">
          {/* Table View - Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 text-white bg-mainColor">
                <tr>
                  <th className="px-2 py-2 text-xs text-left md:px-4 md:py-3 md:text-sm">#</th>
                  <th className="px-2 py-2 text-xs text-left md:px-4 md:py-3 md:text-sm">{t("Cashier")}</th>
                  <th className="px-2 py-2 text-xs text-left md:px-4 md:py-3 md:text-sm">{t("Shift #")}</th>
                  <th className="px-2 py-2 text-xs text-left md:px-4 md:py-3 md:text-sm">{t("Start")}</th>
                  <th className="px-2 py-2 text-xs text-left md:px-4 md:py-3 md:text-sm">{t("End")}</th>
                  <th className="px-2 py-2 text-xs text-left md:px-4 md:py-3 md:text-sm">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {currentShifts.map((shift, index) => (
                  <tr key={shift.id} className="text-xs border-t hover:bg-gray-50 md:text-sm">
                    <td className="px-2 py-2 md:px-4 md:py-3">{(currentPage - 1) * shiftsPerPage + index + 1}</td>
                    <td className="px-2 py-2 font-medium md:px-4 md:py-3">
                      <div>{shift.cashier_man?.user_name || "N/A"}</div>
                      <div className="text-xs text-gray-600">{shift.cashier_man?.role || "N/A"}</div>
                    </td>
                    <td className="px-2 py-2 md:px-4 md:py-3">{shift.cashier_man?.shift_number || "N/A"}</td>
                    <td className="px-2 py-2 text-xs md:px-4 md:py-3">{formatDate(shift.start_time)}</td>
                    <td className="px-2 py-2 text-xs md:px-4 md:py-3">{formatDate(shift.end_time) || "Ongoing"}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrders(shift.id)}
                          className="px-2 py-1 text-xs font-medium text-mainColor hover:underline md:text-sm"
                        >
                          {t("View Details")}
                        </button>
                        <button
                          onClick={() => handleExportShift(shift.id)}
                          title={t("Export to Excel")}
                          className="p-1 text-white rounded md:p-2 bg-green-600 hover:bg-green-700"
                        >
                          <FaFileExcel size={14} className="md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintShift(shift.id)}
                          title={t("Print Shift")}
                          className="p-1 text-white rounded md:p-2 bg-mainColor hover:bg-opacity-90"
                        >
                          <FaPrint size={14} className="md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card View - Mobile */}
          <div className="w-full p-3 space-y-3 overflow-hidden md:hidden">
            {currentShifts.map((shift, index) => (
              <div key={shift.id} className="box-border w-full p-4 transition border border-gray-200 rounded-lg hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-bold text-white rounded bg-mainColor">
                      #{(currentPage - 1) * shiftsPerPage + index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{shift.cashier_man?.user_name || "N/A"}</p>
                      <p className="text-xs text-gray-600">{shift.cashier_man?.role || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="p-2 rounded bg-gray-50">
                    <p className="text-xs text-gray-600">{t("Shift #")}</p>
                    <p className="font-semibold">{shift.cashier_man?.shift_number || "N/A"}</p>
                  </div>
                  <div className="p-2 rounded bg-gray-50">
                    <p className="text-xs text-gray-600">{t("Start Time")}</p>
                    <p className="text-xs font-semibold">{formatDate(shift.start_time)}</p>
                  </div>
                  <div className="col-span-2 p-2 rounded bg-gray-50">
                    <p className="text-xs text-gray-600">{t("End Time")}</p>
                    <p className="text-xs font-semibold">{formatDate(shift.end_time) || "Ongoing"}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleViewOrders(shift.id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white rounded bg-mainColor hover:bg-opacity-90"
                  >
                    {t("View Details")}
                  </button>
                  <button
                    onClick={() => handleExportShift(shift.id)}
                    title={t("Export to Excel")}
                    className="px-3 py-2 text-white rounded bg-green-600 hover:bg-green-700"
                  >
                    <FaFileExcel size={16} />
                  </button>
                  <button
                    onClick={() => handlePrintShift(shift.id)}
                    title={t("Print Shift")}
                    className="px-3 py-2 text-white rounded bg-mainColor hover:bg-opacity-90"
                  >
                    <FaPrint size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-1 px-2 py-2 border-t md:gap-2 md:py-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs bg-gray-200 rounded md:px-4 md:py-2 disabled:opacity-50 md:text-sm"
              >
                {t("Prev")}
              </button>

              {/* Pagination Numbers with Ellipsis */}
              {totalPages <= 10 ? (
                // Show all pages if 10 or fewer
                Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm ${currentPage === page ? "bg-mainColor text-white" : "bg-gray-200"}`}
                  >
                    {page}
                  </button>
                ))
              ) : (
                // Show with ellipsis if more than 10 pages
                <>
                  {/* First page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm ${currentPage === 1 ? "bg-mainColor text-white" : "bg-gray-200"}`}
                  >
                    1
                  </button>

                  {/* Left ellipsis */}
                  {currentPage > 4 && (
                    <span className="px-2 py-2">...</span>
                  )}

                  {/* Pages around current */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (page === 1 || page === totalPages) return false;
                      return Math.abs(page - currentPage) <= 2;
                    })
                    .map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm ${currentPage === page ? "bg-mainColor text-white" : "bg-gray-200"}`}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Right ellipsis */}
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 py-2">...</span>
                  )}

                  {/* Last page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-2 md:px-3 py-1 md:py-2 rounded text-xs md:text-sm ${currentPage === totalPages ? "bg-mainColor text-white" : "bg-gray-200"}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs bg-gray-200 rounded md:px-4 md:py-2 disabled:opacity-50 md:text-sm"
              >
                {t("Next")}
              </button>
            </div>
          )}
        </div>
      ) : response && shifts.length === 0 ? (
        <p className="text-lg text-center text-gray-500">{t("No shifts found for selected date range")}</p>
      ) : null}

      {/* Modal - Shift Details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black md:p-4 bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b md:p-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold md:text-2xl text-mainColor">{t("Shift Details")} #{selectedShiftId}</h2>
              </div>
              <div className="flex items-center gap-2">
                {shiftDetails && (
                  <>
                    <button
                      onClick={() => handleExportShift(selectedShiftId)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white transition-all bg-green-600 shadow-sm md:px-4 md:py-2.5 rounded-xl hover:bg-green-700 md:text-sm"
                    >
                      <FaFileExcel size={18} />
                      <span className="hidden sm:inline">{t("Excel")}</span>
                    </button>
                    <button
                      onClick={() => handlePrintShift(selectedShiftId)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white transition-all bg-blue-600 shadow-sm md:px-4 md:py-2.5 rounded-xl hover:bg-blue-700 md:text-sm"
                    >
                      <FaPrint size={18} />
                      <span className="hidden sm:inline">{t("Print")}</span>
                    </button>
                  </>
                )}
                <button onClick={closeModal} className="ml-2 text-2xl text-gray-500 md:text-3xl hover:text-gray-800">×</button>
              </div>
            </div>

            <div className="p-3 space-y-4 md:p-6 md:space-y-8">
              {loadingOrder ? (
                <p className="text-lg text-center text-gray-600">{t("Loading shift details...")}</p>
              ) : shiftDetails ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-2 md:gap-6 md:grid-cols-3 lg:grid-cols-4">
                    <div className="p-3 border border-blue-200 rounded-lg md:p-5 bg-blue-50">
                      <p className="text-xs text-blue-800 md:text-sm">{t("Total Orders")}</p>
                      <p className="text-lg font-bold text-blue-900 md:text-2xl">{shiftDetails.order_count || 0}</p>
                    </div>
                    <div className="p-3 border border-green-200 rounded-lg md:p-5 bg-green-50">
                      <p className="text-xs text-green-800 md:text-sm">{t("Total Revenue")}</p>
                      <p className="text-lg font-bold text-green-900 md:text-2xl">{(shiftDetails.total_amount || 0).toFixed(2)} EGP</p>
                    </div>
                    <div className="p-3 border border-red-200 rounded-lg md:p-5 bg-red-50">
                      <p className="text-xs text-red-800 md:text-sm">{t("Total Expenses")}</p>
                      <p className="text-lg font-bold text-red-900 md:text-2xl">{shiftDetails.expenses_total || 0} {t("EGP")}</p>
                    </div>
                    <div className="p-3 border border-purple-200 rounded-lg md:p-5 bg-purple-50">
                      <p className="text-xs text-purple-800 md:text-sm">{t("Net Balance")}</p>
                      <p className={`text-lg md:text-2xl font-bold ${(shiftDetails.total_amount - (shiftDetails.expenses_total || 0)) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {((shiftDetails.total_amount || 0) - (shiftDetails.expenses_total || 0)).toFixed(2)} {t("EGP")}
                      </p>
                    </div>
                  </div>

                  {/* Financial Accounts Breakdown */}
                  {shiftDetails.financial_accounts && shiftDetails.financial_accounts.length > 0 && (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                      <h3 className="p-3 text-base font-bold text-white md:p-4 md:text-xl bg-mainColor">{t("Financial Accounts Summary")}</h3>
                      <table className="w-full text-sm">
                        <thead className="text-xs bg-gray-100 md:text-sm">
                          <tr>
                            <th className="px-2 py-2 text-left md:px-4 md:py-3">{t("Account")}</th>
                            <th className="hidden px-2 py-2 text-right md:px-4 md:py-3 sm:table-cell">{t("Delivery")}</th>
                            <th className="hidden px-2 py-2 text-right md:px-4 md:py-3 md:table-cell">{t("Take Away")}</th>
                            <th className="px-4 py-3 text-right">{t("Dine In")}</th>
                            <th className="px-4 py-3 font-bold text-right">{t("Net")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shiftDetails.financial_accounts.map(acc => {
                            const net = (acc.total_amount_delivery || 0) + (acc.total_amount_take_away || 0) + (acc.total_amount_dine_in || 0);
                            return (
                              <tr key={acc.financial_id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{acc.financial_name}</td>
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
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Expenses */}
                  {shiftDetails.expenses && shiftDetails.expenses.length > 0 && (
                    <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="mb-4 text-xl font-bold text-red-800">{t("Expenses")}</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {shiftDetails.expenses.map((exp, i) => (
                          <div key={i} className="p-4 bg-white rounded-lg shadow">
                            <p className="text-sm text-gray-600">{t("Account")}</p>
                            <p className="text-lg font-bold">{exp.financial_account}</p>
                            <p className="text-2xl font-bold text-red-700">{exp.total} {t("EGP")}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Online Orders - Paid vs Unpaid */}
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                      <h3 className="mb-4 text-xl font-bold text-green-800">{t("Paid Online Orders")}</h3>
                      {shiftDetails.online_order?.paid?.length > 0 ? (
                        shiftDetails.online_order.paid.map((p, i) => (
                          <div key={i} className="p-4 mb-3 bg-white rounded shadow">
                            <div className="flex justify-between">
                              <span className="font-medium capitalize">{p.payment_method}</span>
                              <span className="font-bold text-green-700">{p.amount.toFixed(2)} {t("EGP")}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-gray-600">{t("No paid online orders")}</p>
                      )}
                    </div>

                    <div className="p-6 border border-orange-200 rounded-lg bg-orange-50">
                      <h3 className="mb-4 text-xl font-bold text-orange-800">{t("Unpaid / Cash on Delivery")}</h3>
                      {shiftDetails.online_order?.un_paid?.length > 0 ? (
                        shiftDetails.online_order.un_paid.map((u, i) => (
                          <div key={i} className="p-4 mb-3 bg-white rounded shadow">
                            <div className="flex justify-between">
                              <span className="font-medium capitalize">{u.payment_method}</span>
                              <span className="font-bold text-orange-700">{u.amount.toFixed(2)} {t("EGP")}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-gray-600">{t("No unpaid orders")}</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-lg text-center text-gray-500">{t("No details available for this shift")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierShiftReport;