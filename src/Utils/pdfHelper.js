import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Export an HTML string to a multi-page PDF document with full Arabic text shaping and RTL support.
 *
 * @param {string} htmlContent - HTML string to render into PDF
 * @param {string} filename - Filename for the downloaded PDF
 * @param {boolean} isRtl - Whether document direction is RTL
 * @returns {Promise<boolean>}
 */
export const exportHtmlToPdf = async (htmlContent, filename = "document.pdf", isRtl = false) => {
    const printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.top = "0";
    printContainer.style.left = "0";
    printContainer.style.width = "900px";
    printContainer.style.backgroundColor = "#ffffff";
    printContainer.style.zIndex = "-1000";
    printContainer.style.pointerEvents = "none";
    printContainer.style.fontFamily = "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    printContainer.dir = isRtl ? "rtl" : "ltr";
    printContainer.innerHTML = htmlContent;

    document.body.appendChild(printContainer);

    try {
        // Wait briefly for styles and layout to settle
        await new Promise((resolve) => setTimeout(resolve, 150));

        const canvas = await html2canvas(printContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
        });

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = 210;
        const pdfHeight = 297;
        const margin = 8;
        const usableWidth = pdfWidth - 2 * margin;
        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const usablePageHeight = pdfHeight - 2 * margin;

        let heightLeft = imgHeight;
        let position = margin;

        // First page
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= usablePageHeight;

        // Subsequent pages if content overflows A4
        while (heightLeft > 0) {
            position -= usablePageHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, position, imgWidth, imgHeight);
            heightLeft -= usablePageHeight;
        }

        pdf.save(filename);
        return true;
    } catch (error) {
        console.error("exportHtmlToPdf error:", error);
        throw error;
    } finally {
        if (printContainer.parentNode) {
            printContainer.parentNode.removeChild(printContainer);
        }
    }
};

/**
 * Open a printable popup window for immediate browser printing or Save as PDF.
 *
 * @param {string} htmlContent - HTML string
 * @param {boolean} isRtl - Whether direction is RTL
 * @param {string} title - Window title
 */
export const printHtml = (htmlContent, isRtl = false, title = "Print") => {
    const pw = window.open("", "", "width=900,height=750");
    if (pw) {
        pw.document.write(`
            <!DOCTYPE html>
            <html dir="${isRtl ? 'rtl' : 'ltr'}">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
                <style>
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 24px;
                        font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
                        color: #1f2937;
                        background: #fff;
                    }
                    @media print {
                        body { padding: 0; }
                        @page { margin: 10mm; size: A4 portrait; }
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `);
        pw.document.close();
        setTimeout(() => {
            pw.focus();
            pw.print();
            pw.close();
        }, 500);
    }
};

/**
 * Generate formatted HTML for an Inventory Report.
 */
export const generateInventoryReportHtml = ({ report = [], storeName = "—", inventoryId = "", isRtl = false, t }) => {
    const totalProducts = report.length;
    const totalQuantity = report.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalActualQty = report.reduce((sum, item) => sum + (Number(item.actual_quantity) || 0), 0);
    const totalShortage = report.reduce((sum, item) => sum + (Number(item.inability) || 0), 0);
    const totalCost = report.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString(isRtl ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });
    const timeFormatted = now.toLocaleTimeString(isRtl ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" });

    return `
        <div style="padding: 24px; background: #ffffff; direction: ${isRtl ? 'rtl' : 'ltr'}; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">
            <!-- Report Header -->
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h1 style="font-size: 24px; font-weight: 800; color: #1e40af; margin: 0 0 6px 0;">
                        ${t("Inventory Report")} #${inventoryId}
                    </h1>
                    <p style="font-size: 15px; color: #374151; margin: 0; font-weight: 600;">
                        <span style="color: #6b7280;">${t("Store")}:</span> ${storeName || "—"}
                    </p>
                </div>
                <div style="text-align: ${isRtl ? 'left' : 'right'};">
                    <div style="font-size: 13px; color: #4b5563; font-weight: 600;">
                        <span>${t("Date")}:</span> ${dateFormatted}
                    </div>
                    <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
                        ${timeFormatted}
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 600; color: #2563eb; margin-bottom: 4px;">${t("Total Products")}</div>
                    <div style="font-size: 20px; font-weight: bold; color: #1e40af;">${totalProducts}</div>
                </div>
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 600; color: #16a34a; margin-bottom: 4px;">${t("Total Quantity")}</div>
                    <div style="font-size: 20px; font-weight: bold; color: #166534;">${totalQuantity}</div>
                </div>
                <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 600; color: #ca8a04; margin-bottom: 4px;">${t("Total Actual Qty")}</div>
                    <div style="font-size: 20px; font-weight: bold; color: #854d0e;">${totalActualQty}</div>
                </div>
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 600; color: #dc2626; margin-bottom: 4px;">${t("Total Shortage")}</div>
                    <div style="font-size: 20px; font-weight: bold; color: #991b1b;">${totalShortage}</div>
                </div>
            </div>

            <!-- Products Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: ${isRtl ? 'right' : 'left'};">
                <thead>
                    <tr style="background-color: #2563eb; color: #ffffff;">
                        <th style="padding: 10px 12px; font-weight: 700; width: 40px; text-align: center; border: 1px solid #1d4ed8;">#</th>
                        <th style="padding: 10px 12px; font-weight: 700; border: 1px solid #1d4ed8;">${t("Category")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; border: 1px solid #1d4ed8;">${t("Product")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; text-align: center; border: 1px solid #1d4ed8;">${t("Quantity")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; text-align: center; border: 1px solid #1d4ed8;">${t("Actual Quantity")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; text-align: center; border: 1px solid #1d4ed8;">${t("Shortage")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; text-align: ${isRtl ? 'left' : 'right'}; border: 1px solid #1d4ed8;">${t("Cost")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.map((item, index) => {
                        const inability = Number(item.inability) || 0;
                        const inabilityColor = inability > 0 ? '#dc2626' : inability < 0 ? '#16a34a' : '#6b7280';
                        return `
                            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                                <td style="padding: 9px 12px; text-align: center; color: #6b7280; border: 1px solid #e5e7eb;">${index + 1}</td>
                                <td style="padding: 9px 12px; color: #4b5563; border: 1px solid #e5e7eb;">${item.category || "—"}</td>
                                <td style="padding: 9px 12px; font-weight: 600; color: #111827; border: 1px solid #e5e7eb;">${item.product || "—"}</td>
                                <td style="padding: 9px 12px; text-align: center; color: #374151; border: 1px solid #e5e7eb;">${item.quantity ?? 0}</td>
                                <td style="padding: 9px 12px; text-align: center; color: #374151; border: 1px solid #e5e7eb;">${item.actual_quantity ?? 0}</td>
                                <td style="padding: 9px 12px; text-align: center; font-weight: 700; color: ${inabilityColor}; border: 1px solid #e5e7eb;">
                                    ${inability}
                                </td>
                                <td style="padding: 9px 12px; text-align: ${isRtl ? 'left' : 'right'}; font-weight: 600; color: #374151; border: 1px solid #e5e7eb;">
                                    ${Number(item.cost || 0).toLocaleString()} ${t("EGP")}
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f3f4f6; border-top: 2px solid #2563eb; font-weight: 700;">
                        <td colspan="3" style="padding: 12px; text-align: ${isRtl ? 'left' : 'right'}; color: #111827; border: 1px solid #e5e7eb;">
                            ${t("Totals")}:
                        </td>
                        <td style="padding: 12px; text-align: center; color: #111827; border: 1px solid #e5e7eb;">${totalQuantity}</td>
                        <td style="padding: 12px; text-align: center; color: #111827; border: 1px solid #e5e7eb;">${totalActualQty}</td>
                        <td style="padding: 12px; text-align: center; color: ${totalShortage > 0 ? '#dc2626' : totalShortage < 0 ? '#16a34a' : '#111827'}; border: 1px solid #e5e7eb;">
                            ${totalShortage}
                        </td>
                        <td style="padding: 12px; text-align: ${isRtl ? 'left' : 'right'}; color: #111827; border: 1px solid #e5e7eb;">
                            ${Number(totalCost).toLocaleString()} ${t("EGP")}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
};

/**
 * Generate formatted HTML for Stocks Table (Count Stock).
 */
export const generateStocksTableHtml = ({ data = [], storeLabel = "—", isRtl = false, t }) => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString(isRtl ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });

    return `
        <div style="padding: 24px; background: #ffffff; direction: ${isRtl ? 'rtl' : 'ltr'}; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 style="font-size: 22px; font-weight: 800; color: #1e40af; margin: 0 0 6px 0;">
                        ${t("Inventory Products Report")}
                    </h1>
                    <p style="font-size: 14px; color: #4b5563; margin: 0;">
                        <strong>${t("Store")}:</strong> ${storeLabel}
                    </p>
                </div>
                <div style="text-align: ${isRtl ? 'left' : 'right'}; font-size: 13px; color: #6b7280;">
                    ${dateFormatted} | ${data.length} ${t("items")}
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: ${isRtl ? 'right' : 'left'};">
                <thead>
                    <tr style="background-color: #2563eb; color: #ffffff;">
                        <th style="padding: 10px 12px; font-weight: 700; width: 40px; text-align: center; border: 1px solid #1d4ed8;">#</th>
                        <th style="padding: 10px 12px; font-weight: 700; border: 1px solid #1d4ed8;">${t("Product")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; border: 1px solid #1d4ed8;">${t("Category")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; border: 1px solid #1d4ed8;">${t("Unit")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; text-align: center; border: 1px solid #1d4ed8;">${t("Quantity")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; text-align: center; border: 1px solid #1d4ed8;">${t("Actual Quantity")}</th>
                        <th style="padding: 10px 12px; font-weight: 700; text-align: center; border: 1px solid #1d4ed8;">${t("Shortage")}</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((item, index) => `
                        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                            <td style="padding: 9px 12px; text-align: center; color: #6b7280; border: 1px solid #e5e7eb;">${index + 1}</td>
                            <td style="padding: 9px 12px; font-weight: 600; color: #111827; border: 1px solid #e5e7eb;">${item.product || "—"}</td>
                            <td style="padding: 9px 12px; color: #4b5563; border: 1px solid #e5e7eb;">${item.category || "—"}</td>
                            <td style="padding: 9px 12px; color: #4b5563; border: 1px solid #e5e7eb;">${item.unit || "—"}</td>
                            <td style="padding: 9px 12px; text-align: center; color: #374151; border: 1px solid #e5e7eb;">${item.quantity ?? 0}</td>
                            <td style="padding: 9px 12px; text-align: center; color: #374151; border: 1px solid #e5e7eb;">${item.actual_quantity ?? 0}</td>
                            <td style="padding: 9px 12px; text-align: center; font-weight: 700; color: ${(item.inability ?? 0) > 0 ? '#dc2626' : (item.inability ?? 0) < 0 ? '#16a34a' : '#6b7280'}; border: 1px solid #e5e7eb;">
                                ${item.inability ?? "—"}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
};
