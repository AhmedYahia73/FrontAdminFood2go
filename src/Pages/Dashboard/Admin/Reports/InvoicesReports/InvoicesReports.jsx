import React, { useEffect, useState } from "react";
import { usePost } from "../../../../../Hooks/usePostJson";
import { DateInput, LoaderLogin } from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { FaPrint, FaSearch } from 'react-icons/fa';

// ===================================================================
// Helper: Clean Logo URL
// ===================================================================
const cleanLogoUrl = (url) => {
    if (!url) return "";
    try {
        const clean = url.replace(/(https?:\/\/[^\/]+)?\/storage\/+/g, (match, p1) => {
            return p1 ? p1 + "/storage/" : "/storage/";
        });
        return clean;
    } catch (e) {
        return url;
    }
};

// ===================================================================
// RECEIPT FORMATTING FUNCTION (Copied from InvoiceOrderPage)
// ===================================================================
const formatCashierReceipt = (receiptData, t, isRtl) => {
    const phones = [receiptData.customerPhone, receiptData.customerPhone2]
        .filter(Boolean)
        .join(" / ");

    const logoUrl = cleanLogoUrl(receiptData.logoLink);

    // NOTE: We wrap everything in "receipt-only" class
    return `
    <div class="receipt-only" dir="${isRtl ? 'rtl' : 'ltr'}">
      
      <style>
        /* 1. Global Print Settings (These don't affect screen) */
        @page { 
            size: 80mm auto; 
            margin: 0mm; 
        }

        /* 2. Scoped Styles - Only affect elements inside .receipt-only */
        
        .receipt-only {
            width: 100%;
            max-width: 80mm;
            margin: 0 auto;
            font-family: sans-serif;
            color: #000;
            background: #fff;
            padding: 5px;
            /* **MODIFICATION: Increased base font size for clarity** */
            font-size: 14px; 
        }

        /* Reset box sizing just for receipt */
        .receipt-only * { 
            box-sizing: border-box; 
        }
        
        /* Headers */
        .receipt-only .header { text-align: center; margin-bottom: 7px; border-bottom: 1px dashed #000; padding-bottom: 7px;}
        .receipt-only .header h1 { font-size: 22px; font-weight: bold; margin: 0; }
        .receipt-only .header p { font-size: 16px; margin: 3px 0 0 0; }
        .receipt-only .header img { max-width: 150px; max-height: 80px; height: auto; width: auto; margin: 0 auto; display: block; }
        
        /* Info Box */
        .receipt-only .info-box { 
          padding: 7px 0; 
          margin-bottom: 7px; 
          /* **MODIFICATION: Increased font size in info-box** */
          font-size: 14px;
          border-bottom: 1px dashed #000;
        }
        .receipt-only .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .receipt-only .info-label { font-weight: bold; }

        /* Address Section */
        .receipt-only .address-notes-section { margin-bottom: 7px; /* **MODIFICATION: Increased font size** */ font-size: 14px; border-bottom: 1px dashed #000; padding-bottom: 7px;}
        .receipt-only .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 3px; display: block; }
        
        /* Tables - SCOPED to avoid affecting main page tables */
        .receipt-only table { 
          width: 100%; 
          /* **MODIFICATION: Increased table body font size** */
          font-size: 14px; 
          border-collapse: collapse; 
          margin-bottom: 7px;
        }
        .receipt-only th { 
          border: none !important; 
          border-bottom: 2px solid #000 !important; /* Thicker line for clarity */
          padding: 6px 0; 
          text-align: center; 
          font-weight: bold; 
          background: transparent; /* Reset any global backgrounds */
          /* **MODIFICATION: Increased table header font size** */
          font-size: 16px; 
        }
        .receipt-only td { 
          border: none; 
          padding: 5px 0; 
          text-align: center; 
        }
        
        .receipt-only .item-name { 
          text-align: ${isRtl ? 'right' : 'left'}; 
          direction: ${isRtl ? 'rtl' : 'ltr'}; 
        }
        .receipt-only .item-variations { font-size: 12px; margin-top: 2px; color: #333; }
        .receipt-only .item-note { font-size: 12px; margin-top: 2px; font-style: italic; }
        .receipt-only .item-block-last td { border-bottom: 1px solid #ccc; }

        /* Totals */
        .receipt-only .totals-section { 
          text-align: ${isRtl ? 'left' : 'right'}; 
          /* **MODIFICATION: Increased totals font size** */
          font-size: 14px; 
          margin: 7px 0 0 0; 
        }
        .receipt-only .total-row { margin-bottom: 3px; display: flex; justify-content: space-between; }
        
        .receipt-only .grand-total { 
          font-size: 20px; /* **MODIFICATION: Larger grand total** */
          font-weight: bold; 
          border-top: 3px solid #000; /* Thicker top border */
          padding-top: 6px; 
          margin-top: 6px; 
          margin-bottom: 0px; 
        }
        
        /* Footer */
        .receipt-only .footer { 
          text-align: center; 
          /* **MODIFICATION: Increased footer font size** */
          font-size: 14px; 
          font-weight: bold; 
          margin-top: 7px; 
          padding-top: 7px;
          border-top: 1px dashed #000; 
        }

        .receipt-only .itemName {
          text-align: ${isRtl ? 'right' : 'left'}; 
        }
      </style>

      <div class="header">
        ${logoUrl
            ? `<img src="${logoUrl}" alt="Restaurant Logo" />`
            : ``
        }
        <h1>${receiptData.restaurantName}</h1>
        ${receiptData.branchName ? `<p>${receiptData.branchName}</p>` : ''}
      </div>

      <div class="info-box">
        <div class="info-row"><span class="info-label">${t("InvoiceNumber")}:</span><span>${receiptData.invoiceNumber}</span></div>
        <div class="info-row"><span class="info-label">${t("Date")}:</span><span dir="ltr">${receiptData.date}</span></div>
        <div class="info-row"><span class="info-label">${t("Time")}:</span><span dir="ltr">${receiptData.orderTime || ''}</span></div>
        <div class="info-row"><span class="info-label">${t("Client")}:</span><span>${receiptData.customerName}</span></div>
        ${phones ? `<div class="info-row"><span class="info-label">${t("Phone")}:</span><span dir="ltr">${phones}</span></div>` : ''}
        ${receiptData.isDelivery && receiptData.deliveryMan ?
            `<div class="info-row"><span class="info-label">${t("DeliveryMan")}:</span><span>${receiptData.deliveryMan}</span></div>` : ''}
        <div class="info-row"><span class="info-label">${t("OrderType")}:</span><span>${receiptData.orderType}</span></div>
      <div class="info-row"><span class="info-label">${t("Payment")}:</span><span>${receiptData.payment}</span></div>
      </div>

      <div class="address-notes-section">
        ${receiptData.isDelivery && receiptData.customerAddress ?
            `<div style="margin-bottom:5px"><span class="section-title">${t("DeliveryAddress")}:</span><div>${receiptData.customerAddress}</div></div>` : ''}
        ${receiptData.orderNotes ?
            `<div><span class="section-title">${t("Notes")}:</span><div>${receiptData.orderNotes}</div></div>` : ''}
      </div>

      <table>
        <thead>
          <tr style="font-weight:bold;font-size:16px;">
            <th style="width:40%;" class="itemName">${t("Item")}</th>
            <th style="width:15%">${t("Qty")}</th>
            <th style="width:20%">${t("Price")}</th>
            <th style="width:25%">${t("Total")}</th>
          </tr>
        </thead>
        <tbody>
          ${receiptData.items.map(item => {
                const hasAddons = item.addons && item.addons.length > 0;
                const hasExtras = item.extras && item.extras.length > 0;
                const showTotalOnMainRow = !hasAddons && !hasExtras;

                let rows = '';

                const isMainLast = !hasAddons && !hasExtras;
                rows += `<tr ${isMainLast ? 'class="item-block-last"' : ''}>
              <td class="item-name" style="font-size:16px;font-weight:600;">
                ${item.name}
                ${item.variationString ? `<div class="item-variations">${item.variationString}</div>` : ''}
                ${item.notesString ? `<div class="item-note">${t("Note")}: ${item.notesString}</div>` : ''}
              </td>
              <td>${item.qty}</td>
              <td>${Number(item.price).toFixed(2)}</td>
              <td style="font-size:16px;font-weight:600;">${showTotalOnMainRow ? Number(item.total).toFixed(2) : ''}</td>
            </tr>`;

                if (hasAddons) {
                    item.addons.forEach((addon, i) => {
                        const isLast = i === item.addons.length - 1 && !hasExtras;
                        rows += `<tr ${isLast ? 'class="item-block-last"' : ''}>
                  <td class="item-name" style="font-size:13px; ${isRtl ? 'padding-right:15px' : 'padding-left:15px'};">+ ${addon.name}</td>
                  <td>${addon.count > 1 ? addon.count : ''}</td>
                  <td>${Number(addon.price).toFixed(2)}</td>
                  <td>${isLast ? Number(item.total).toFixed(2) : ''}</td>
                </tr>`;
                    });
                }

                if (hasExtras) {
                    item.extras.forEach((extra, i) => {
                        const isLast = i === item.extras.length - 1;
                        rows += `<tr ${isLast ? 'class="item-block-last"' : ''}>
                  <td class="item-name" style="font-size:13px; ${isRtl ? 'padding-right:15px' : 'padding-left:15px'};">+ ${extra.name}</td>
                  <td></td>
                  <td>${Number(extra.price).toFixed(2)}</td>
                  <td>${isLast ? Number(item.total).toFixed(2) : ''}</td>
                </tr>`;
                    });
                }

                return rows;
            }).join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="total-row"><span>${t("TotalProductPrice")}</span><span>${Number(receiptData.subtotal).toFixed(2)}</span></div>
        <div class="total-row"><span>${t("Tax")} %:</span><span>${Number(receiptData.tax).toFixed(2)}</span></div>
        ${receiptData.delivery > 0 ? `<div class="total-row"><span>${t("DeliveryFee")}</span><span>${Number(receiptData.delivery).toFixed(2)}</span></div>` : ''}
        ${receiptData.discount > 0 ? `<div class="total-row"><span>${t("Discount")}</span><span>-${Number(receiptData.discount).toFixed(2)}</span></div>` : ''}
        ${receiptData.service_fees > 0 ? `<div class="total-row"><span>${t("ServiceFee")} ${receiptData.service_fees_item?.type === "precentage" ? `(${receiptData.service_fees_item.amount}%)` : ""}</span><span>${Number(receiptData.service_fees).toFixed(2)}</span></div>` : ''}
        <div class="total-row grand-total"><span>${t("GrandTotal")}</span><span>${Number(receiptData.total).toFixed(2)}</span></div>
      </div>

      <div class="footer">
        ${t("ThankYouForYourOrder")}
        <div style="font-size:12px;margin-top:2px;">${t("Powered by")} Food2Go</div>
        <div style="font-size:12px;">food2go.online</div>
      </div>
    </div>
  `;
};

const InvoicesReports = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/admin/reports/invoices_filter` });
    const { refetch: refetchList, data: dataList } = useGet({ url: `${apiUrl}/admin/reports/lists_report` });
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [selectedCashierId, setSelectedCashierId] = useState(null);
    const [selectedCashierManId, setSelectedCashierManId] = useState(null);
    const [selectedFinancialId, setSelectedFinancialId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const invoices = response?.data?.invoices || [];

    const filteredInvoices = invoices.filter(inv => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            inv.order_number?.toString().includes(q) ||
            inv.user?.f_name?.toLowerCase().includes(q) ||
            inv.user?.l_name?.toLowerCase().includes(q) ||
            inv.branch?.name?.toLowerCase().includes(q)
        );
    });

    useEffect(() => { refetchList(); }, [refetchList]);

    const prepareOptions = (data) => {
        const options = (data || []).map(item => ({
            value: item.id,
            label: item.name || item.user_name || `ID: ${item.id}`
        }));
        return [{ value: 'all', label: t('All') }, ...options];
    };

    const handleGenerateReport = () => {
        const formData = new FormData();
        if (fromDate) formData.append("from", fromDate);
        if (toDate) formData.append("to", toDate);
        if (selectedBranchId && selectedBranchId !== 'all') formData.append("branch_id", selectedBranchId);
        if (selectedCashierId && selectedCashierId !== 'all') formData.append("cashier_id", selectedCashierId);
        if (selectedCashierManId && selectedCashierManId !== 'all') formData.append("cashier_man_id", selectedCashierManId);
        if (selectedFinancialId && selectedFinancialId !== 'all') formData.append("financial_id", selectedFinancialId);
        postData(formData);
    };

    const handleResetFilters = () => {
        setFromDate("");
        setToDate("");
        setSelectedBranchId(null);
        setSelectedCashierId(null);
        setSelectedCashierManId(null);
        setSelectedFinancialId(null);
        setSearchQuery("");
    };

    const handlePrint = (invoice) => {
        const receiptData = mapInvoiceToReceipt(invoice);
        const html = formatCashierReceipt(receiptData, t, isRtl);
        const pw = window.open("", "", "width=500,height=600");
        if (pw) {
            pw.document.write(`<html><head><title>Print</title></head><body style='margin:0; padding:0;'>${html}</body></html>`);
            pw.document.close();
            setTimeout(() => { pw.focus(); pw.print(); pw.close(); }, 500);
        }
    };

    const handlePrintAll = () => {
        const pw = window.open("", "", "width=800,height=600");
        if (pw) {
            const htmls = filteredInvoices.map(inv => {
                const receiptData = mapInvoiceToReceipt(inv);
                return `<div style="page-break-after: always; margin-bottom: 20px; border: 1px solid #ccc; padding: 10px;">${formatCashierReceipt(receiptData, t, isRtl)}</div>`;
            }).join('');
            pw.document.write(`<html><head><title>Print All</title></head><body style='margin:0; padding:0;'>${htmls}</body></html>`);
            pw.document.close();
            setTimeout(() => { pw.focus(); pw.print(); pw.close(); }, 500);
        }
    };

    const mapInvoiceToReceipt = (inv) => {
        let productsTotal = 0;
        let addonsTotal = 0;

        const items = (inv.order_details || []).map(item => {
            const product = item.product || {};
            const qty = parseFloat(item.count || item.quantity || product.count || 1);
            const basePrice = parseFloat(product.price || item.price || 0);

            const itemAddons = item.addons || [];
            const itemExtras = item.extras || [];

            const addonsPrice = itemAddons.reduce((s, a) => s + parseFloat(a.price || 0) * (a.count || 1), 0);
            const extrasPrice = itemExtras.reduce((s, e) => s + parseFloat(e.price || 0), 0);
            const extrasPerUnit = addonsPrice + extrasPrice;

            const variationPrice = item.variations?.reduce((acc, v) =>
                acc + (v.options?.reduce((oacc, opt) => oacc + parseFloat(opt.price || 0), 0) || 0), 0) || 0;

            const finalPrice = basePrice + variationPrice;

            productsTotal += finalPrice * qty;
            addonsTotal += extrasPerUnit * qty;

            const variationString = item.variations
                ?.map(v => v.options?.map(o => o.name).join(", ")).filter(Boolean).join(" - ") || "";

            const notesString = [product.notes, item.notes].filter(Boolean).join(" , ");

            return {
                qty,
                name: product.name || item.name || "Item",
                variationString,
                addons: itemAddons,
                extras: itemExtras,
                notesString,
                price: finalPrice,
                total: (finalPrice + extrasPerUnit) * qty,
            };
        });

        const subtotal = productsTotal + addonsTotal;
        const discount = parseFloat(inv.total_discount || inv.coupon_discount || 0);
        const tax = parseFloat(inv.total_tax || 0);
        const total = parseFloat(inv.amount || 0);
        const delivery = parseFloat(inv.address?.zone?.price || 0);

        let orderTypeDisplay = t("TakeAway");
        const type = (inv.order_type || "").toLowerCase();
        const isDelivery = type.includes("delivery");
        if (type.includes("dine")) orderTypeDisplay = t("DineIn");
        else if (isDelivery) orderTypeDisplay = t("Delivery");

        let formattedAddress = "";
        if (inv.address) {
            const excludedKeys = ["id", "map", "type", "city", "user_id", "created_at", "updated_at", "deleted_at", "latitude", "longitude", "contact_person_name", "contact_person_number"];
            const blockKeys = ["zone", "street", "additional_data"];

            let blockRows = [];
            let inlineRows = [];

            blockKeys.forEach(key => {
                let value = inv.address[key];
                if (!value) return;
                let displayValue = value;
                if (key === "zone" && typeof value === 'object' && value !== null) {
                    displayValue = value.zone;
                }
                if (displayValue && typeof displayValue !== 'object') {
                    blockRows.push(`<div><span style="font-weight:bold;">${t(key)}: </span><span>${displayValue}</span></div>`);
                }
            });

            Object.entries(inv.address).forEach(([key, value]) => {
                if (key === "address" || excludedKeys.includes(key) || blockKeys.includes(key)) return;
                if (value && typeof value !== 'object') {
                    inlineRows.push(`<span><span style="font-weight:bold;">${t(key)}:</span> ${value}</span>`);
                }
            });

            formattedAddress = blockRows.join("");
            if (inlineRows.length > 0) {
                formattedAddress += `<div style="font-size:12px; margin-top: 2px;">${inlineRows.join(" | ")}</div>`;
            }
        }

        return {
            restaurantName: t("projectName"),
            logoLink: response?.data?.logo_link || "",
            branchName: inv.branch?.name || "",
            invoiceNumber: inv.order_number || inv.id,
            date: inv.order_date,
            orderTime: inv.order_time,
            orderType: orderTypeDisplay,
            isDelivery,
            payment: t(inv.payment),
            customerName: inv.user ? `${inv.user.f_name || ""} ${inv.user.l_name || ""}`.trim() : t("Guest"),
            customerPhone: inv.user?.phone || "",
            customerPhone2: inv.user?.phone_2 || "",
            customerAddress: formattedAddress,
            orderNotes: inv.notes || "",
            deliveryMan: inv.delivery ? `${inv.delivery.f_name || ''} ${inv.delivery.l_name || ''}`.trim() : "",
            items,
            subtotal,
            tax,
            delivery,
            total,
            discount,
            service_fees: inv.service_fees,
            service_fees_item: inv.service_fees_item,
        };
    };

    return (
        <div className="w-full p-4 mb-20 md:p-6 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-mainColor">{t("Invoices Reports")}</h1>
                <div className="flex gap-2">
                    {filteredInvoices.length > 0 && (
                        <button onClick={handlePrintAll} className="flex items-center gap-2 px-6 py-2.5 text-white bg-black rounded-xl shadow hover:bg-opacity-90 transition-all font-bold">
                            <FaPrint /> {t("Print All")}
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 mb-6 rounded-lg bg-gray-50 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <DateInput placeholder="From Date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} borderColor="mainColor" />
                    <DateInput placeholder="To Date" value={toDate} onChange={(e) => setToDate(e.target.value)} borderColor="mainColor" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("Search by order number, customer...")}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Select options={prepareOptions(dataList?.branches)} onChange={(opt) => setSelectedBranchId(opt?.value || null)} placeholder={t("Branch")} isClearable />
                    <Select options={prepareOptions(dataList?.cashier)} onChange={(opt) => setSelectedCashierId(opt?.value || null)} placeholder={t("Cashier")} isClearable />
                    <Select options={prepareOptions(dataList?.cashier_man)} onChange={(opt) => setSelectedCashierManId(opt?.value || null)} placeholder={t("Cashier Man")} isClearable />
                    <Select options={prepareOptions(dataList?.financial_account)} onChange={(opt) => setSelectedFinancialId(opt?.value || null)} placeholder={t("Account")} isClearable />
                </div>

                <div className="flex gap-4">
                    <button onClick={handleGenerateReport} className="px-8 py-2.5 font-bold text-white rounded-lg bg-mainColor hover:bg-opacity-90 shadow-md transition-all">
                        {t("Generate Report")}
                    </button>
                    <button onClick={handleResetFilters} className="px-8 py-2.5 font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 shadow-md transition-all">
                        {t("Reset Filters")}
                    </button>
                </div>
            </div>

            {/* Summary Stats (Optional but good) */}
            {!loadingPost && invoices.length > 0 && (
                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm">{t("Total Orders")}</p>
                        <p className="text-xl font-bold">{invoices.length}</p>
                    </div>
                    <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-sm">{t("Total Revenue")}</p>
                        <p className="text-xl font-bold">{invoices.reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0).toFixed(2)}</p>
                    </div>
                </div>
            )}

            {loadingPost && <div className="flex justify-center py-20"><LoaderLogin /></div>}

            {/* Grid of Receipts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInvoices.map((inv) => (
                    <div key={inv.id} className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <span className="font-bold text-mainColor">#{inv.order_number}</span>
                            <button
                                onClick={() => handlePrint(inv)}
                                className="p-2 text-gray-600 hover:text-mainColor transition-colors bg-white rounded-full shadow-sm"
                                title={t("Print")}
                            >
                                <FaPrint size={14} />
                            </button>
                        </div>
                        <div className="p-0 bg-white overflow-hidden flex justify-center items-start border-t border-gray-100" style={{ minHeight: "450px" }}>
                            <div
                                style={{ width: "80mm" }}
                                className="transform scale-[0.68] xl:scale-[0.75] origin-top shadow-sm my-4"
                                dangerouslySetInnerHTML={{ __html: formatCashierReceipt(mapInvoiceToReceipt(inv), t, isRtl) }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {!loadingPost && filteredInvoices.length === 0 && (
                <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-xl font-medium">{t("No invoices found")}</p>
                    <p>{t("Adjust filters and click Generate Report")}</p>
                </div>
            )}
        </div>
    );
};

export default InvoicesReports;
