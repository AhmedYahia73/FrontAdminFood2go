import qz from "qz-tray";
import { toast } from "react-toastify";
import i18n from "i18next";

// ===================================================================
// 1. تصاميم الإيصالات (تم تحديث جزء الإضافات هنا)
// ===================================================================
const getReceiptHTML = (preparedData, kitchenItem, t) => {
  const locale = i18n.language;
  const isRtl = locale === 'ar';

  return `
    <div class="receipt-only" dir="${isRtl ? 'rtl' : 'ltr'}">
      <style>
        @page { size: 80mm auto; margin: 0mm; }
        .receipt-only { width: 80mm; font-family: sans-serif; color: #000; padding: 5px; font-size: 15px; }
        .receipt-only * { box-sizing: border-box; }
        .header { text-align: center; margin-bottom: 7px; border: 2px solid #000; padding: 7px 0; }
        .header h1 { font-size: 35px; font-weight: bold; margin: 0; }
        .info-box { padding: 5px 0; margin-bottom: 7px; border-bottom: 2px solid #000; }
        table { width: 100%; border-collapse: collapse; }
        th { border-bottom: 2px solid #000; padding: 8px 0; font-size: 18px; }
        td { border-bottom: 1px solid #ccc; padding: 12px 0; vertical-align: top; }
        .item-name-cell { text-align: ${isRtl ? 'right' : 'left'}; padding: 0 10px; }
        .main-item-name { font-size: 21px; font-weight: bold; display: block; }
        .qty-box { font-size: 28px; font-weight: 900; border: 3px solid #000; padding: 4px 12px; display: inline-block; }
        
        /* تصميم الإضافات الجديد */
        .item-addon { font-size: 15px; margin-top: 3px; color: #333; font-weight: bold; }
        .item-variations { font-size: 15px; margin-top: 4px; font-weight: bold; }
        .item-note { font-size: 16px; margin-top: 6px; padding: 5px; background: #eee; border: 1px solid #000; font-weight: bold; }
      </style>

      <div class="header">
        <h1># ${preparedData.invoiceNumber}</h1>
        <div style="font-size: 18px; font-weight: bold;">${preparedData.orderType}</div>
        ${preparedData.table ? `<div style="font-size: 24px; font-weight: bold;">${t("Table")}: ${preparedData.table}</div>` : ''}
      </div>

      <div class="info-box">
        <div style="display: flex; justify-content: space-between;">
          <span>${t("Time")}:</span>
          <span dir="ltr">${preparedData.timeFormatted}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:25%;">${t("Qty")}</th>
            <th style="width:75%;">${t("Item")}</th>
          </tr>
        </thead>
        <tbody>
          ${kitchenItem.items.map(item => `
            <tr>
              <td style="text-align: center;"><span class="qty-box">${item.qty}</span></td>
              <td class="item-name-cell">
                <span class="main-item-name">${item.name}</span>
                
                ${item.variations.map(v => `
                  <div class="item-variations">• ${v.name}: ${v.options.map(o => o.name).join(", ")}</div>
                `).join('')}
                
                ${item.addons.map(a => `
                  <div class="item-addon">+ ${a.name} (x${a.count || 1})</div>
                `).join('')}

                ${item.notes ? `<div class="item-note">${t("Note")}: ${item.notes}</div>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${preparedData.orderNote ? `<div style="margin-top: 10px; border: 2px solid #000; padding: 10px; text-align: center;">${preparedData.orderNote}</div>` : ''}

      <div style="text-align: center; margin-top: 15px; border-top: 1px dashed #000;">
        ${kitchenItem.kitchenName}
      </div>
    </div>
  `;
};

// ===================================================================
// 2. تهيئة البيانات (تعديل التقاط الـ addons)
// ===================================================================
export const prepareReceiptData = (orderResponse, projectName, logo) => {
  const dateObj = new Date();
  const baseData = {
    restaurantName: projectName || "",
    logoLink: logo || "",
    invoiceNumber: orderResponse?.order_number || orderResponse?.order_id || "-",
    timeFormatted: dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    orderType: orderResponse?.order_type || "delivery",
    table: orderResponse?.table_name || orderResponse?.table || "",
    orderNote: orderResponse?.order_note || ""
  };

  const kitchenList = orderResponse?.kitchen?.kitchen_items || orderResponse?.kitchen_items || [];

  const processedKitchens = kitchenList.map((kitchen) => {
    const grouped = new Map();
    const itemsToProcess = kitchen.success || kitchen.order || [];

    itemsToProcess.forEach((item) => {
      const varKey = (item.variation_selected || []).map(v => v.id).join("-");
      const addKey = (item.addons_selected || []).map(a => `${a.id}_${a.count}`).join("-");
      const fullKey = `${item.id}-${item.notes}-${varKey}-${addKey}`;

      if (!grouped.has(fullKey)) {
        grouped.set(fullKey, { ...item, totalCount: 0 });
      }
      grouped.get(fullKey).totalCount += Number(item.count || 1);
    });

    return {
      kitchenName: kitchen.name,
      printerName: kitchen.print_name,
      printStatus: Number(kitchen.print_status),
      items: Array.from(grouped.values()).map(g => ({
        qty: g.totalCount,
        name: g.name,
        notes: (g.notes === "null" || !g.notes) ? "" : g.notes,
        addons: g.addons_selected || [], // هنا نحتفظ بالكائن كاملاً (الاسم والعدد)
        variations: g.variation_selected || []
      }))
    };
  });

  return { ...baseData, kitchens: processedKitchens };
};

// ===================================================================
// 3. دالة الطباعة (بقي كما هو)
// ===================================================================
export const printReceiptSilently = async (preparedData, t, callback) => {
  try {
    // 1. تحقق من حالة الاتصال بـ QZ Tray بأمان
    const isQzActive = qz.websocket.isActive();

    let printedCount = 0;

    for (const kitchenItem of preparedData.kitchens) {
      if (kitchenItem.items.length === 0 || kitchenItem.printStatus !== 1) {
        console.log(`Skipping kitchen ${kitchenItem.kitchenName}: No items or status not 1`);
        continue;
      }

      if (!kitchenItem.printerName) {
        console.warn(`Missing printer name for kitchen: ${kitchenItem.kitchenName}`);
        continue;
      }

      const htmlContent = getReceiptHTML(preparedData, kitchenItem, t);

      if (isQzActive) {
        const config = qz.configs.create(kitchenItem.printerName);
        await qz.print(config, [{ type: "html", format: "plain", data: htmlContent }]);
        printedCount++;
      }
    }

    if (printedCount > 0) {
      toast.success("✅ " + t("OrderSentToPrinter"));
    } else if (isQzActive) {
      console.warn("No print jobs were sent. Check kitchen items and print status.");
    }
    if (callback) callback();

  } catch (err) {
    console.error("General Print Error:", err);
    // منع ظهور TypeError للمستخدم، فقط تنفيذ الـ callback
    if (callback) callback();
  }
};
