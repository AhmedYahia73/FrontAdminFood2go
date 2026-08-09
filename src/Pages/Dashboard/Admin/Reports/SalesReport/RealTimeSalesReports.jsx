import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { useGet } from "../../../../../Hooks/useGet"; // Adjusted path based on file location
import { StaticLoader } from "../../../../../Components/Components"; // Assuming StaticLoader is available
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const RealTimeSalesReports = () => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. Fetch Branches List
  const { data: listData, loading: loadingList } = useGet({
    url: `${apiUrl}/admin/reports/branches_list`,
  });

  const branches = listData?.branches || [];

  // State for selected branch
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const salesUrl = selectedBranchId
    ? `${apiUrl}/admin/reports/instate_order_report?branch_id=${selectedBranchId}`
    : `${apiUrl}/admin/reports/instate_order_report`;

  const {
    refetch,
    data: salesData,
    loading: loadingSales,
  } = useGet({
    url: salesUrl,
  });

  useEffect(() => {
    refetch();
  }, [selectedBranchId]);

  // Prepare Options for Select
  const branchOptions = branches.map((branch) => ({
    value: branch.id,
    label: branch.name,
  }));
  // Handlers
  const handlePrint = () => {
    if (!salesData) return;

    const printWindow = window.open("", "_blank");
    const branchName =
      branchOptions.find((b) => b.value === selectedBranchId)?.label ||
      t("All Branches");
    const date = new Date().toLocaleDateString();

    let branchBreakdownHtml = "";
    if (
      salesData.data &&
      Array.isArray(salesData.data) &&
      salesData.data.length > 0
    ) {
      branchBreakdownHtml = `
                <div class="section">
                    <div class="section-title">${t("Branches Breakdown")}</div>
                    ${salesData.data
          .map(
            (b) => `
                        <div style="border-bottom: 2px dotted #000; padding: 5px 0; margin-bottom: 5px;">
                            <div style="font-weight: bold; margin-bottom: 3px; font-size: 13px;">${b.Branch}</div>
                            
                            <div class="item-row"><span class="item-name">${t("Revenue")}</span><span class="item-value">${(b.total_orders || 0).toLocaleString()}</span></div>
                            <div class="item-row"><span class="item-name">${t("Count")}</span><span class="item-value">${b.count_orders}</span></div>
                            <div class="item-row"><span class="item-name">${t("Avg Value")}</span><span class="item-value">${(b.avg_orders || 0).toLocaleString()}</span></div>
                            
                            <div class="item-row"><span class="item-name">${t("Tax")}</span><span class="item-value">${(b.total_tax || 0).toLocaleString()}</span></div>
                            <div class="item-row"><span class="item-name">${t("Void Value")}</span><span class="item-value">${(b.void_order_sum || 0).toLocaleString()}</span></div>
                            <div class="item-row"><span class="item-name">${t("Void Count")}</span><span class="item-value">${b.void_order_count}</span></div>
                            <div class="item-row"><span class="item-name">${t("Discount")}</span><span class="item-value">${(b.discount || 0).toLocaleString()}</span></div>

                            <div class="item-row" style="margin-top:2px"><span class="item-name">${t("Delivery")}</span><span class="item-value">${b.delivery}</span></div>
                            <div class="item-row"><span class="item-name">${t("Take Away")}</span><span class="item-value">${b.take_away}</span></div>
                            <div class="item-row"><span class="item-name">${t("Dine In")}</span><span class="item-value">${b.dine_in}</span></div>
                            <div class="item-row"><span class="item-name">${t("Web")}</span><span class="item-value">${b.online_web}</span></div>
                            <div class="item-row"><span class="item-name">${t("App")}</span><span class="item-value">${b.online_mobile}</span></div>
                            <div class="item-row"><span class="item-name">${t("Out For Delivery")}</span><span class="item-value">${b.out_of_delivery}</span></div>
                            <div class="item-row"><span class="item-name">${t("Delivery Fees")}</span><span class="item-value">${(b.delivery_fees || 0).toLocaleString()}</span></div>
                            <div class="item-row"><span class="item-name">${t("Service Fees")}</span><span class="item-value">${(b.service_fees || 0).toLocaleString()}</span></div>
                            <div class="item-row"><span class="item-name">${t("principle_price")}</span><span class="item-value">${(b.principle_price || 0).toLocaleString()}</span></div>
                            <div class="item-row"><span class="item-name">${t("price_after_discount")}</span><span class="item-value">${(b.price_after_discount || 0).toLocaleString()}</span></div>
                            <div class="item-row"><span class="item-name">${t("Due Module")}</span><span class="item-value">${(b.due_module || 0).toLocaleString()}</span></div>
                            <div class="item-row"><span class="item-name">${t("Due User")}</span><span class="item-value">${(b.due_user || 0).toLocaleString()}</span></div>
                        </div>
                    `,
          )
          .join("")}
                </div>
            `;
    }

    const receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${t("Real Time Sales Report")}</title>
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
                        font-size: 12px;
                    }
                    .item-name {
                        flex: 1;
                        font-weight: bold;
                    }
                    .item-value {
                        text-align: right;
                        font-weight: bold;
                        font-size: 13px;
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
                    .total-value {
                        font-size: 16px;
                        font-weight: bold;
                        margin-top: 5px;
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
                    <div class="title">${t("Real Time Sales Report")}</div>
                    <div class="info-row">${t("Date")}: ${date}</div>
                    <div class="info-row">${t("Branch")}: ${branchName}</div>
                </div>

                <div class="section">
                    <div class="section-title">${t("Sales Summary")}</div>
                    <div class="item-row">
                        <span class="item-name">${t("Total Orders Count")}</span>
                        <span class="item-value">${salesData.count_orders}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Average Order Value")}</span>
                        <span class="item-value">${(salesData.avg_orders || 0).toLocaleString()} ${t("EGP")}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">${t("Order Types")}</div>
                    <div class="item-row">
                        <span class="item-name">${t("Delivery")}</span>
                        <span class="item-value">${salesData.delivery} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Take Away")}</span>
                        <span class="item-value">${salesData.take_away} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Dine In")}</span>
                        <span class="item-value">${salesData.dine_in} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Online Mobile")}</span>
                        <span class="item-value">${salesData.online_mobile} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Online Web")}</span>
                        <span class="item-value">${salesData.online_web} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Out For Delivery")}</span>
                        <span class="item-value">${salesData.out_of_delivery || 0}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Delivery Fees")}</span>
                        <span class="item-value">${(salesData.delivery_fees || 0).toLocaleString()} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Service Fees")}</span>
                        <span class="item-value">${(salesData.service_fees || 0).toLocaleString()} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("principle_price")}</span>
                        <span class="item-value">${(salesData.principle_price || 0).toLocaleString()} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("price_after_discount")}</span>
                        <span class="item-value">${(salesData.price_after_discount || 0).toLocaleString()} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Due Module")}</span>
                        <span class="item-value">${(salesData.due_module || 0).toLocaleString()} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Due User")}</span>
                        <span class="item-value">${(salesData.due_user || 0).toLocaleString()} ${t("EGP")}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="item-row">
                        <span class="item-name">${t("Total Tax")}</span>
                        <span class="item-value">${salesData.total_tax} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Void Orders Value")}</span>
                        <span class="item-value">${salesData.void_order_sum} ${t("EGP")}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Void Orders Count")}</span>
                        <span class="item-value">${salesData.void_order_count}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-name">${t("Discount")}</span>
                        <span class="item-value">-${salesData.discount} ${t("EGP")}</span>
                    </div>
                </div>

                ${branchBreakdownHtml}

                <div class="total-box">
                    <div class="total-label">${t("Total Revenue")}</div>
                    <div class="total-value">${(salesData.total_orders || 0).toLocaleString()} ${t("EGP")}</div>
                </div>
                
                <div class="footer">
                    ${t("Thank you")}
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
    if (!salesData) return;

    const doc = new jsPDF();
    const branchName =
      branchOptions.find((b) => b.value === selectedBranchId)?.label ||
      t("All Branches");
    const date = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(20);
    doc.text(t("Real Time Sales Report"), 14, 22);

    doc.setFontSize(12);
    doc.text(`${t("Branch")}: ${branchName}`, 14, 32);
    doc.text(`${t("Date")}: ${date}`, 14, 38);

    // Key Metrics
    const metrics = [
      [
        t("Total Orders Revenue"),
        `${(salesData.total_orders || 0).toLocaleString()} ${t("EGP")}`,
      ],
      [t("Total Orders Count"), salesData.count_orders || 0],
      [
        t("Average Order Value"),
        `${(salesData.avg_orders || 0).toLocaleString()} ${t("EGP")}`,
      ],
    ];

    autoTable(doc, {
      startY: 45,
      head: [[t("Metric"), t("Value")]],
      body: metrics,
      theme: "grid",
      headStyles: { fillColor: [22, 163, 74] }, // Green-600
    });

    // Breakdown
    const breakdown = [
      [t("Delivery"), salesData.delivery || 0],
      [t("Take Away"), salesData.take_away || 0],
      [t("Dine In"), salesData.dine_in || 0],
      [t("Online Mobile"), salesData.online_mobile || 0],
      [t("Online Web"), salesData.online_web || 0],
      [t("Out For Delivery"), salesData.out_of_delivery || 0],
      [t("Total Tax"), salesData.total_tax || 0],
      [t("Void Orders Value"), salesData.void_order_sum || 0],
      [t("Void Orders Count"), salesData.void_order_count || 0],
      [t("Discount"), salesData.discount || 0],
      [t("Delivery Fees"), salesData.delivery_fees || 0],
      [t("Service Fees"), salesData.service_fees || 0],
      [t("principle_price"), salesData.principle_price || 0],
      [t("price_after_discount"), salesData.price_after_discount || 0],
      [t("Due Module"), salesData.due_module || 0],
      [t("Due User"), salesData.due_user || 0],
    ];

    // Header for breakdown
    doc.text(t("Order Types"), 14, doc.lastAutoTable.finalY + 10);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [[t("Category"), t("Value")]],
      body: breakdown,
      theme: "striped",
    });

    // Detailed Branch Table
    if (
      salesData.data &&
      Array.isArray(salesData.data) &&
      salesData.data.length > 0
    ) {
      const branchRows = salesData.data.map((b, index) => [
        index + 1,
        b.Branch,
        (b.total_orders || 0).toLocaleString(),
        b.count_orders,
        (b.avg_orders || 0).toLocaleString(),
        b.total_tax || 0,
        b.void_order_sum || 0,
        b.discount || 0,
        b.delivery,
        b.take_away,
        b.dine_in,
        b.online_web,
        b.online_mobile,
        b.out_of_delivery || 0,
        b.delivery_fees || 0,
        b.service_fees || 0,
        b.principle_price || 0,
        b.price_after_discount || 0,
        b.due_module || 0,
        b.due_user || 0,
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [
          [
            t("No."),
            t("Branch"),
            t("Rev"),
            t("Cnt"),
            t("Avg"),
            t("Tax"),
            t("Void"),
            t("Disc"),
            t("Del"),
            t("TkAw"),
            t("Dine"),
            t("Web"),
            t("App"),
            t("Out Del"),
            t("Del Fees"),
            t("Svc Fees"),
            t("principle_price"),
            t("price_after_discount"),
            t("Due Mod"),
            t("Due Usr"),
          ],
        ],
        body: branchRows,
        theme: "grid",
        styles: { fontSize: 5.5, cellPadding: 0.8 },
        headStyles: { fillColor: [44, 62, 80] },
      });
    }

    doc.save(`Sales_Report_${date.replace(/\//g, "-")}.pdf`);
  };

  const handleExportExcel = () => {
    if (!salesData) return;

    const branchName =
      branchOptions.find((b) => b.value === selectedBranchId)?.label ||
      t("All Branches");
    const date = new Date().toLocaleDateString();

    // 1. Prepare Summary Data (Array of Arrays for aoa_to_sheet)
    const exportData = [
      [t("Report"), t("Real Time Sales Report")],
      [t("Branch"), branchName],
      [t("Date"), date],
      [], // Spacer
      [t("Total Orders Revenue"), salesData.total_orders || 0],
      [t("Total Orders Count"), salesData.count_orders || 0],
      [t("Average Order Value"), salesData.avg_orders || 0],
      [], // Spacer
      [t("Order Types"), ""],
      [t("Delivery"), salesData.delivery || 0],
      [t("Take Away"), salesData.take_away || 0],
      [t("Dine In"), salesData.dine_in || 0],
      [t("Online Mobile"), salesData.online_mobile || 0],
      [t("Online Web"), salesData.online_web || 0],
      [t("Out For Delivery"), salesData.out_of_delivery || 0],
      [], // Spacer
      [t("Total Tax"), salesData.total_tax || 0],
      [t("Void Orders Value"), salesData.void_order_sum || 0],
      [t("Void Orders Count"), salesData.void_order_count || 0],
      [t("Discount"), salesData.discount || 0],
      [t("Delivery Fees"), salesData.delivery_fees || 0],
      [t("Service Fees"), salesData.service_fees || 0],
      [t("Due Module"), salesData.due_module || 0],
      [t("Due User"), salesData.due_user || 0],
    ];

    // 2. Append Branch Breakdown Table if data exists
    if (
      salesData.data &&
      Array.isArray(salesData.data) &&
      salesData.data.length > 0
    ) {
      exportData.push([]);
      exportData.push([t("Branches Breakdown")]);
      // Table Headers
      exportData.push([
        t("No."),
        t("Branch"),
        t("Revenue"),
        t("Count"),
        t("Avg Value"),
        t("Tax"),
        t("Void Value"),
        t("Void Count"),
        t("Discount"),
        t("Delivery"),
        t("Take Away"),
        t("Dine In"),
        t("Web"),
        t("App"),
        t("Out For Delivery"),
        t("Delivery Fees"),
        t("Service Fees"),
        t("principle_price"),
        t("price_after_discount"),
        t("Due Module"),
        t("Due User"),
      ]);

      // Table Rows
      salesData.data.forEach((b, index) => {
        exportData.push([
          index + 1,
          b.Branch,
          b.total_orders || 0,
          b.count_orders || 0,
          b.avg_orders || 0,
          b.total_tax || 0,
          b.void_order_sum || 0,
          b.void_order_count || 0,
          b.discount || 0,
          b.delivery || 0,
          b.take_away || 0,
          b.dine_in || 0,
          b.online_web || 0,
          b.online_mobile || 0,
          b.out_of_delivery || 0,
          b.delivery_fees || 0,
          b.service_fees || 0,
          b.principle_price || 0,
          b.price_after_discount || 0,
          b.due_module || 0,
          b.due_user || 0,
        ]);
      });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);

    // Auto-width adjustment (optional but nice)
    const wscols = exportData[0].map((_, i) => ({ wch: 20 }));
    worksheet["!cols"] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, `Sales_Report_${date.replace(/\//g, "-")}.xlsx`);
  };

  // Render Logic
  const hasData = !!salesData;

  const Card = ({
    title,
    value,
    colorClass = "bg-white",
    textClass = "text-gray-800",
  }) => (
    <div
      className={`p-6 rounded-2xl shadow-sm border border-gray-100 ${colorClass}`}
    >
      <h3 className={`text-sm font-medium opacity-80 mb-2 ${textClass}`}>
        {t(title)}
      </h3>
      <p className={`text-2xl font-bold ${textClass}`}>
        {typeof value === "number"
          ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : value}
        {typeof value === "number" &&
          title !== "Total Orders Count" &&
          title !== "Void Orders Count" && title !== "Out For Delivery"
          ? ` ${t("EGP")}`
          : ""}
      </p>
    </div>
  );

  return (
    <div className="p-2 md:p-4 lg:p-6 pb-20 space-y-8">
      <div className="flex flex-col items-start gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("Real Time Sales Report")}
          </h1>
          <p className="mt-1 text-gray-500">
            {t("Monitor your branch performance live")}
          </p>
        </div>

        <div className="flex flex-col items-stretch w-full gap-4 lg:flex-row md:items-end md:w-auto">
          {/* Action Buttons */}
          {salesData && (
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm font-bold"
              >
                <FaFileExcel size={18} />
                {t("Excel")}
              </button>
              <button
                onClick={handlePrintPdf}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm font-bold"
              >
                <FaFilePdf size={18} />
                {t("PDF")}
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

          {/* Branch Selector */}
          <div className="w-full md:w-72">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {t("Select Branch")}
            </label>
            <Select
              options={branchOptions}
              value={
                branchOptions.find((opt) => opt.value === selectedBranchId) ||
                null
              }
              onChange={(opt) => setSelectedBranchId(opt ? opt.value : "")}
              placeholder={t("All Branches")} // Or specific placeholder if "All" isn't supported by API logic directly without ID
              isLoading={loadingList}
              classNamePrefix="react-select"
              isClearable
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {loadingSales ? (
          <div className="flex items-center justify-center h-64">
            <StaticLoader />
          </div>
        ) : salesData ? (
          <div className="w-full space-y-6">
            {/* Key Metrics - Highlighted */}
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card
                title="Total Orders Revenue"
                value={salesData.total_orders}
                colorClass="bg-mainColor"
                textClass="text-white"
              />
              <Card
                title="Total Orders Count"
                value={salesData.count_orders}
                colorClass="bg-blue-600"
                textClass="text-white"
              />
              <Card
                title="Average Order Value"
                value={salesData.avg_orders || 0}
                colorClass="bg-purple-600"
                textClass="text-white"
              />
            </div>

            <div className="my-2 border-t border-gray-200 lg:col-span-3 xl:col-span-4"></div>
            <h2 className="text-xl font-bold text-gray-800">
              {t("Order Types")}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Breakdown */}
              <Card title="Delivery" value={salesData.delivery} />
              <Card title="Take Away" value={salesData.take_away} />
              <Card title="Dine In" value={salesData.dine_in} />
              <Card title="Online Mobile" value={salesData.online_mobile} />
              <Card title="Online Web" value={salesData.online_web} />
              <Card title="Out For Delivery" value={salesData.out_of_delivery || 0} />
              <Card title="principle_price" value={salesData.principle_price} colorClass="bg-blue-50 border-blue-100" textClass="text-blue-700" />
              <Card title="price_after_discount" value={salesData.price_after_discount} colorClass="bg-teal-50 border-teal-100" textClass="text-teal-700" />
              <Card
                title="Total Tax"
                value={salesData.total_tax}
                colorClass="bg-orange-50 border-orange-100"
                textClass="text-orange-700"
              />
              <Card
                title="Void Orders Value"
                value={salesData.void_order_sum}
                colorClass="bg-red-50 border-red-100"
                textClass="text-red-700"
              />
              <Card
                title="Void Orders Count"
                value={salesData.void_order_count}
                colorClass="bg-red-50 border-red-100"
                textClass="text-red-700"
              />
              <Card
                title="Discount"
                value={salesData.discount}
                colorClass="bg-gray-50 border-gray-100"
                textClass="text-gray-700"
              />
              <Card
                title="Delivery Fees"
                value={salesData.delivery_fees}
                colorClass="bg-green-50 border-green-100"
                textClass="text-green-700"
              />
              <Card
                title="Service Fees"
                value={salesData.service_fees}
                colorClass="bg-green-50 border-green-100"
                textClass="text-green-700"
              />
              <Card
                title="Due Module"
                value={salesData.due_module}
                colorClass="bg-red-50 border-red-100"
                textClass="text-red-700"
              />
              <Card
                title="Due User"
                value={salesData.due_user}
                colorClass="bg-red-50 border-red-100"
                textClass="text-red-700"
              />
            </div>

            {/* Branch Breakdown Table (Only visible when viewing all branches) */}
            {salesData.data &&
              Array.isArray(salesData.data) &&
              salesData.data.length > 0 && (
                <div className="mt-8 overflow-hidden border shadow-sm rounded-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">{t("No.")}</th>
                          <th className="px-6 py-3">{t("Branch")}</th>
                          <th className="px-6 py-3">{t("Revenue")}</th>
                          <th className="px-6 py-3">{t("Count")}</th>
                          <th className="px-6 py-3">{t("Avg Value")}</th>
                          <th className="px-6 py-3">{t("Tax")}</th>
                          <th className="px-6 py-3">{t("Void")}</th>
                          <th className="px-6 py-3">{t("Disc")}</th>
                          <th className="px-6 py-3">{t("Delivery")}</th>
                          <th className="px-6 py-3">{t("Take Away")}</th>
                          <th className="px-6 py-3">{t("Dine In")}</th>
                          <th className="px-6 py-3">{t("Web")}</th>
                          <th className="px-6 py-3">{t("App")}</th>
                          <th className="px-6 py-3">{t("Delivery Fees")}</th>
                          <th className="px-6 py-3">{t("Service Fees")}</th>
                          <th className="px-6 py-3">{t("principle_price")}</th>
                          <th className="px-6 py-3">{t("price_after_discount")}</th>
                          <th className="px-6 py-3">{t("Total Discount")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.data.map((branch, index) => (
                          <tr
                            key={index}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {branch.Branch}
                            </td>
                            <td className="px-6 py-4 font-bold text-mainColor">
                              {(branch.total_orders || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                            <td className="px-6 py-4">{branch.count_orders}</td>
                            <td className="px-6 py-4">
                              {(branch.avg_orders || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                            <td className="px-6 py-4">
                              {(branch.total_tax || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                            <td className="px-6 py-4">
                              {(branch.void_order_sum || 0).toLocaleString()} (
                              {branch.void_order_count})
                            </td>
                            <td className="px-6 py-4">
                              {(branch.discount || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                            <td className="px-6 py-4">{branch.delivery}</td>
                            <td className="px-6 py-4">{branch.take_away}</td>
                            <td className="px-6 py-4">{branch.dine_in}</td>
                            <td className="px-6 py-4">{branch.online_web}</td>
                            <td className="px-6 py-4">
                              {branch.online_mobile}
                            </td>
                            <td className="px-6 py-4">
                              {(branch.delivery_fees || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                            <td className="px-6 py-4">
                              {(branch.service_fees || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                            <td className="px-6 py-4">
                              {(branch.principle_price || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                            <td className="px-6 py-4">
                              {(branch.price_after_discount || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                            <td className="px-6 py-4">
                              {(branch.total_discount || 0).toLocaleString()}{" "}
                              {t("EGP")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">{t("No data available")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeSalesReports;
