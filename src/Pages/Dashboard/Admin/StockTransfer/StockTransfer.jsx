import React, { useEffect, useState, useCallback } from "react";
import {
    StaticLoader,
    Switch,
    TitlePage,
    StaticButton,
    SubmitButton,
    AddButton,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { t } from "i18next";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import Select from 'react-select';
import i18n from "i18next";
import { exportHtmlToPdf, printHtml } from "../../../../Utils/pdfHelper";
import { FiDownload, FiPrinter, FiX, FiArrowRight, FiFileText } from "react-icons/fi";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const emptyProductRow = () => ({
    _id: Math.random().toString(36).slice(2),
    category_id: "",
    product_id: "",
    unit_id: "",
    quintity: "",
    selectedCategory: null,
    selectedProduct: null,
    selectedUnit: null,
});

// ─── Transfer Receipt HTML template ──────────────────────────────────────────

const generateTransferReceiptHtml = ({ fromStore, toStore, date, items, isRtl }) => {
    const dir = isRtl ? 'rtl' : 'ltr';
    const grandTotal = items.reduce((s, it) => s + (it.total_cost || 0), 0);
    const totalQty = items.reduce((s, it) => s + (Number(it.quintity) || 0), 0);

    const rows = items.map((it, i) => `
        <tr style="border-bottom:1px solid #fecdd3; ${i % 2 === 0 ? 'background:#ffffff;' : 'background:#fff8f8;'}">
            <td style="padding:11px 14px; text-align:center; color:#9f1239; font-weight:700; font-size:12px;">${i + 1}</td>
            <td style="padding:11px 14px; color:#475569;">${it.category || '-'}</td>
            <td style="padding:11px 14px; font-weight:700; color:#1e293b;">${it.product || '-'}</td>
            <td style="padding:11px 14px; text-align:center; font-weight:700; color:#334155;">${it.quintity}</td>
            <td style="padding:11px 14px; text-align:center; color:#64748b;">${it.unit || '-'}</td>
            <td style="padding:11px 14px; text-align:center; color:#475569;">${Number(it.unit_cost || 0).toFixed(2)}</td>
            <td style="padding:11px 14px; text-align:center; font-weight:800; color:#be123c; font-size:14px;">${Number(it.total_cost || 0).toFixed(2)}</td>
        </tr>
    `).join('');

    const labelCategory = isRtl ? 'الفئة' : 'Category';
    const labelProduct  = isRtl ? 'المنتج' : 'Product';
    const labelQty      = isRtl ? 'الكمية' : 'Qty';
    const labelUnit     = isRtl ? 'الوحدة' : 'Unit';
    const labelUnitCost = isRtl ? 'سعر الوحدة' : 'Unit Cost';
    const labelTotal    = isRtl ? 'الإجمالي' : 'Total';
    const labelReceipt  = isRtl ? 'سند تحويل مخزني' : 'Stock Transfer Receipt';
    const labelDate     = isRtl ? 'التاريخ' : 'Date';
    const labelFrom     = isRtl ? 'المخزن المصدر' : 'Source Store';
    const labelTo       = isRtl ? 'المخزن المستلم' : 'Destination Store';
    const labelGrand    = isRtl ? 'الإجمالي الكلي' : 'Grand Total';
    const labelItems    = isRtl ? 'عدد الأصناف' : 'Items Count';
    const labelTotalQty = isRtl ? 'إجمالي الكميات' : 'Total Qty';

    const dateStr = date ? new Date(date).toLocaleString(isRtl ? 'ar-EG' : 'en-US') : '';

    return `
    <div dir="${dir}" style="font-family:'Cairo','Segoe UI',Tahoma,sans-serif; padding:28px; background:#ffffff; color:#1e293b; max-width:850px; margin:0 auto;">
        
        <!-- Header Banner with Rich Red Gradient -->
        <div style="background:linear-gradient(135deg, #700f2b 0%, #9f1239 40%, #be123c 75%, #e11d48 100%); color:#ffffff; border-radius:18px; padding:26px 30px; margin-bottom:22px; position:relative; overflow:hidden; box-shadow:0 8px 24px -4px rgba(159,18,57,0.3);">
            <div style="position:absolute; top:-30px; ${isRtl ? 'left:-30px' : 'right:-30px'}; width:140px; height:140px; background:rgba(255,255,255,0.07); border-radius:50%;"></div>
            <div style="position:absolute; bottom:-40px; ${isRtl ? 'right:-20px' : 'left:-20px'}; width:110px; height:110px; background:rgba(255,255,255,0.05); border-radius:50%;"></div>

            <div style="display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2; flex-wrap:wrap; gap:14px;">
                <div>
                    <div style="display:inline-block; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.35); border-radius:8px; padding:4px 12px; font-size:11px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">
                        ${isRtl ? 'نظام إدارة المخزون الموحد' : 'OFFICIAL INVENTORY TRANSFER'}
                    </div>
                    <h1 style="font-size:24px; font-weight:900; margin:0; letter-spacing:-0.5px;">${labelReceipt}</h1>
                </div>

                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <div style="background:rgba(0,0,0,0.18); border:1px solid rgba(255,255,255,0.22); border-radius:12px; padding:8px 14px; text-align:center;">
                        <div style="font-size:10px; opacity:0.85; text-transform:uppercase; margin-bottom:2px;">${labelDate}</div>
                        <div style="font-size:13px; font-weight:700;">${dateStr}</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.18); border:1px solid rgba(255,255,255,0.22); border-radius:12px; padding:8px 14px; text-align:center;">
                        <div style="font-size:10px; opacity:0.85; text-transform:uppercase; margin-bottom:2px;">${labelItems}</div>
                        <div style="font-size:13px; font-weight:700;">${items.length}</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.18); border:1px solid rgba(255,255,255,0.22); border-radius:12px; padding:8px 14px; text-align:center;">
                        <div style="font-size:10px; opacity:0.85; text-transform:uppercase; margin-bottom:2px;">${labelTotalQty}</div>
                        <div style="font-size:13px; font-weight:700;">${totalQty}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Store Route Section -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; background:#fff1f2; border:1.5px solid #fecdd3; border-radius:16px; padding:18px 24px; margin-bottom:24px;">
            <div style="flex:1; text-align:${isRtl ? 'right' : 'left'};">
                <div style="display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:#9f1239; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#be123c;"></span>
                    ${labelFrom}
                </div>
                <div style="font-size:20px; font-weight:800; color:#881337;">${fromStore || '-'}</div>
            </div>

            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; padding:0 8px;">
                <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #be123c, #e11d48); color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 4px 10px rgba(190,18,60,0.3);">
                    ${isRtl ? '&#8592;' : '&#8594;'}
                </div>
            </div>

            <div style="flex:1; text-align:${isRtl ? 'left' : 'right'};">
                <div style="display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:#9f1239; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#e11d48;"></span>
                    ${labelTo}
                </div>
                <div style="font-size:20px; font-weight:800; color:#9f1239;">${toStore || '-'}</div>
            </div>
        </div>

        <!-- Products Table with Crimson Header -->
        <div style="border-radius:14px; overflow:hidden; border:1px solid #fecdd3; box-shadow:0 2px 6px rgba(0,0,0,0.02); margin-bottom:22px;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <thead>
                    <tr style="background:linear-gradient(90deg, #881337, #9f1239, #be123c); color:#ffffff;">
                        <th style="padding:12px 14px; text-align:center; font-weight:700; font-size:12px; border-bottom:2px solid #e11d48; width:45px;">#</th>
                        <th style="padding:12px 14px; text-align:${isRtl ? 'right' : 'left'}; font-weight:700; font-size:12px; border-bottom:2px solid #e11d48;">${labelCategory}</th>
                        <th style="padding:12px 14px; text-align:${isRtl ? 'right' : 'left'}; font-weight:700; font-size:12px; border-bottom:2px solid #e11d48;">${labelProduct}</th>
                        <th style="padding:12px 14px; text-align:center; font-weight:700; font-size:12px; border-bottom:2px solid #e11d48;">${labelQty}</th>
                        <th style="padding:12px 14px; text-align:center; font-weight:700; font-size:12px; border-bottom:2px solid #e11d48;">${labelUnit}</th>
                        <th style="padding:12px 14px; text-align:center; font-weight:700; font-size:12px; border-bottom:2px solid #e11d48;">${labelUnitCost}</th>
                        <th style="padding:12px 14px; text-align:center; font-weight:700; font-size:12px; border-bottom:2px solid #e11d48;">${labelTotal}</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>

        <!-- Summary & Handover Section -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; margin-top:8px;">
            <div style="flex:1; min-width:260px; display:flex; flex-direction:column; gap:14px;">
                <div style="background:#fff5f5; border:1px dashed #fda4af; border-radius:12px; padding:12px 16px; font-size:12px; color:#9f1239;">
                    <div style="font-weight:700; margin-bottom:2px;">&#10003; ${isRtl ? 'عملية تحويل معتمدة' : 'Approved & Verified Transfer'}</div>
                    <div style="color:#64748b; font-size:11px;">${isRtl ? 'تم تحديث الأرصدة المخزنية في كلا المخزنين بنجاح' : 'Stock balances updated in both warehouses successfully'}</div>
                </div>

                <div style="display:flex; gap:20px; font-size:11px; color:#64748b;">
                    <div style="flex:1; border-top:1px solid #cbd5e1; padding-top:6px; text-align:center;">
                        ${isRtl ? 'توقيع أمين المخزن المسلّم' : 'Dispatched By'}
                    </div>
                    <div style="flex:1; border-top:1px solid #cbd5e1; padding-top:6px; text-align:center;">
                        ${isRtl ? 'توقيع أمين المخزن المستلم' : 'Received By'}
                    </div>
                </div>
            </div>

            <!-- Grand Total in Luxury Wine/Crimson Card -->
            <div style="min-width:220px;">
                <div style="background:linear-gradient(135deg, #881337 0%, #9f1239 60%, #be123c 100%); color:#ffffff; border-radius:16px; padding:16px 26px; text-align:center; box-shadow:0 8px 20px -3px rgba(159,18,57,0.35);">
                    <div style="font-size:11px; color:#ffe4e6; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px;">${labelGrand}</div>
                    <div style="font-size:28px; font-weight:900; letter-spacing:-0.5px;">${grandTotal.toFixed(2)}</div>
                </div>
            </div>
        </div>

        <!-- System Footer Note -->
        <div style="margin-top:24px; padding-top:12px; border-top:1px solid #f1f5f9; text-align:center; font-size:11px; color:#94a3b8;">
            Food2go Management System &bull; ${isRtl ? 'نظام إدارة المخزون المالي والسلعي' : 'Stock & Cost Management System'}
        </div>
    </div>
    `;
};

// ─── ReceiptModal ─────────────────────────────────────────────────────────────

const ReceiptModal = ({ data, onClose }) => {
    const isRtl = i18n.language === 'ar';
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingPrint, setLoadingPrint] = useState(false);

    const html = generateTransferReceiptHtml({
        fromStore: data.from_store,
        toStore:   data.to_store,
        date:      data.date,
        items:     data.items || [],
        isRtl,
    });

    const grandTotal = (data.items || []).reduce((s, it) => s + (it.total_cost || 0), 0);

    const handleDownload = async () => {
        setLoadingPdf(true);
        await exportHtmlToPdf(html, `transfer-receipt-${Date.now()}.pdf`, isRtl);
        setLoadingPdf(false);
    };

    const handlePrint = () => {
        setLoadingPrint(true);
        printHtml(html, isRtl, t("Stock Transfer Receipt"));
        setTimeout(() => setLoadingPrint(false), 500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)' }}>

            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: '92vh' }}>

                {/* Header */}
                <div className="bg-gradient-to-r from-red-950 via-rose-900 to-rose-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <div className="inline-block bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-rose-200 uppercase tracking-wider mb-1">
                            {t("Stock Transfer Receipt")}
                        </div>
                        <h2 className="text-white text-xl font-bold flex items-center gap-2">
                            <span>{data.from_store}</span>
                            <span className="text-rose-300">&#8594;</span>
                            <span>{data.to_store}</span>
                        </h2>
                    </div>
                    <button onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-all">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Route banner */}
                <div className="flex items-center gap-4 px-6 pt-5 pb-4 flex-shrink-0 bg-rose-50/70 border-b border-rose-100">
                    <div className="flex-1 text-center">
                        <p className="text-xs font-semibold text-rose-900 uppercase tracking-wider mb-1">{t("From Store")}</p>
                        <p className="text-xl font-extrabold text-rose-950">{data.from_store || '-'}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-300 flex-shrink-0">
                        <FiArrowRight size={18} />
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-xs font-semibold text-rose-900 uppercase tracking-wider mb-1">{t("To Store")}</p>
                        <p className="text-xl font-extrabold text-rose-800">{data.to_store || '-'}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {data.date && (
                        <p className="text-xs text-slate-400 mb-3">{new Date(data.date).toLocaleString()}</p>
                    )}
                    <div className="rounded-2xl overflow-hidden border border-rose-200">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-red-950 to-rose-900 text-white">
                                    <th className="px-3 py-3 text-center">#</th>
                                    <th className="px-3 py-3 text-left">{t("Category")}</th>
                                    <th className="px-3 py-3 text-left">{t("Product")}</th>
                                    <th className="px-3 py-3 text-center">{t("Quantity")}</th>
                                    <th className="px-3 py-3 text-center">{t("Unit")}</th>
                                    <th className="px-3 py-3 text-center">{t("Unit Cost")}</th>
                                    <th className="px-3 py-3 text-center">{t("Total Cost")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.items || []).map((it, i) => (
                                    <tr key={i}
                                        className={`border-b border-rose-100 ${i % 2 === 0 ? 'bg-white' : 'bg-rose-50/30'}`}>
                                        <td className="px-3 py-3 text-center text-rose-900 font-bold text-xs">{i + 1}</td>
                                        <td className="px-3 py-3 text-slate-600">{it.category || '-'}</td>
                                        <td className="px-3 py-3 font-semibold text-slate-800">{it.product || '-'}</td>
                                        <td className="px-3 py-3 text-center font-bold text-slate-700">{it.quintity}</td>
                                        <td className="px-3 py-3 text-center text-slate-500">{it.unit || '-'}</td>
                                        <td className="px-3 py-3 text-center text-slate-600">{Number(it.unit_cost || 0).toFixed(2)}</td>
                                        <td className="px-3 py-3 text-center font-extrabold text-rose-700">{Number(it.total_cost || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Grand total */}
                    <div className="flex justify-end mt-4">
                        <div className="bg-gradient-to-r from-red-950 via-rose-900 to-red-900 text-white rounded-2xl px-8 py-4 text-center min-w-[190px] shadow-lg shadow-rose-950/20">
                            <p className="text-xs text-rose-200 uppercase tracking-wider mb-1 font-semibold">{t("Grand Total")}</p>
                            <p className="text-3xl font-extrabold">{grandTotal.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-between gap-3">
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-all">
                        {t("Close")}
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handlePrint} disabled={loadingPrint}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-60">
                            <FiPrinter size={15} />
                            {t("Print")}
                        </button>
                        <button onClick={handleDownload} disabled={loadingPdf}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-60 shadow-sm shadow-rose-300">
                            {loadingPdf ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FiDownload size={15} />
                            )}
                            {t("Download PDF")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// â”€â”€â”€ ProductRow component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ProductRow = ({ row, index, products, categories, units, onUpdate, onRemove, canRemove, selectStyles }) => {
    const filteredProducts = row.category_id
        ? products
            .filter(p => p.category_id === row.category_id)
            .map(p => ({ value: p.id, label: p.name }))
        : [];

    const handleCategoryChange = (opt) => {
        onUpdate(row._id, {
            category_id: opt ? opt.value : "",
            product_id: "",
            selectedCategory: opt,
            selectedProduct: null,
        });
    };

    const handleProductChange = (opt) => {
        onUpdate(row._id, {
            product_id: opt ? opt.value : "",
            selectedProduct: opt,
        });
    };

    const handleUnitChange = (opt) => {
        onUpdate(row._id, {
            unit_id: opt ? opt.value : "",
            selectedUnit: opt,
        });
    };

    return (
        <div className="relative bg-gradient-to-br from-white via-rose-50/20 to-rose-50/50 border border-rose-100/80 rounded-2xl p-4 shadow-sm group transition-all hover:shadow-md hover:border-rose-200">
            <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-gradient-to-br from-red-700 to-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-rose-900/20">
                {index + 1}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                        {t("Category")} *
                    </label>
                    <Select
                        value={row.selectedCategory}
                        onChange={handleCategoryChange}
                        options={categories}
                        placeholder={t("Category...")}
                        isClearable isSearchable
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                        {t("Product")} *
                    </label>
                    <Select
                        value={row.selectedProduct}
                        onChange={handleProductChange}
                        options={filteredProducts}
                        placeholder={row.category_id ? t("Product...") : t("Select category first")}
                        isClearable isSearchable
                        isDisabled={!row.category_id}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                        {t("Unit")} *
                    </label>
                    <Select
                        value={row.selectedUnit}
                        onChange={handleUnitChange}
                        options={units}
                        placeholder={t("Unit...")}
                        isClearable isSearchable
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                        {t("Quantity")} *
                    </label>
                    <input
                        type="number"
                        value={row.quintity}
                        onChange={(e) => onUpdate(row._id, { quintity: e.target.value })}
                        placeholder="0.00"
                        min="0.001"
                        step="0.001"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300 bg-white transition-all"
                    />
                </div>
            </div>
            {canRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(row._id)}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-700 transition-all text-sm font-bold leading-none"
                    title={t("Remove")}
                >
                    <FiX size={15} />
                </button>
            )}
        </div>
    );
};

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const StockTransfer = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();
    const isRtl = i18n.language === 'ar';

    const {
        refetch: refetchPurchaseTransfer,
        loading: loadingPurchaseTransfer,
        data: dataPurchaseTransfer,
    } = useGet({ url: `${apiUrl}/admin/purchase_transfer` });

    const { changeState, loadingChange } = useChangeState();
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_transfer/transfer`,
        type: true,
    });

    const [PurchaseTransfers, setPurchaseTransfers] = useState([]);
    const [stores, setStores]           = useState([]);
    const [categories, setCategories]   = useState([]);
    const [units, setUnits]             = useState([]);
    const [products, setProducts]       = useState([]);

    const [showDialog, setShowDialog]               = useState(false);
    const [selectedFromStore, setSelectedFromStore] = useState(null);
    const [selectedToStore, setSelectedToStore]     = useState(null);
    const [productRows, setProductRows]             = useState([emptyProductRow()]);

    const [receiptData, setReceiptData] = useState(null);
    const [rowPdfLoading, setRowPdfLoading] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages   = Math.ceil(PurchaseTransfers.length / itemsPerPage);
    const currentItems = PurchaseTransfers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => { refetchPurchaseTransfer(); }, []);

    useEffect(() => {
        if (!dataPurchaseTransfer) return;
        if (dataPurchaseTransfer.purchases)   setPurchaseTransfers(dataPurchaseTransfer.purchases);
        if (dataPurchaseTransfer.stores)      setStores(dataPurchaseTransfer.stores.map(s => ({ value: s.id, label: s.name })));
        if (dataPurchaseTransfer.categories)  setCategories(dataPurchaseTransfer.categories.map(c => ({ value: c.id, label: c.name })));
        if (dataPurchaseTransfer.products)    setProducts(dataPurchaseTransfer.products);
        if (dataPurchaseTransfer.units)       setUnits(dataPurchaseTransfer.units.map(u => ({ value: u.id, label: u.name })));
    }, [dataPurchaseTransfer]);

    useEffect(() => {
        if (response?.status === 200 && !loadingPost) {
            const data = response.data;
            if (data?.items) {
                setReceiptData({
                    from_store: data.from_store,
                    to_store:   data.to_store,
                    date:       data.date,
                    items:      data.items,
                });
            }
            closeDialog();
            refetchPurchaseTransfer();
        }
    }, [response, loadingPost]);

    const resetDialog = () => {
        setSelectedFromStore(null);
        setSelectedToStore(null);
        setProductRows([emptyProductRow()]);
    };

    const closeDialog = () => {
        setShowDialog(false);
        resetDialog();
    };

    const handleUpdateRow = useCallback((id, changes) => {
        setProductRows(prev => prev.map(r => r._id === id ? { ...r, ...changes } : r));
    }, []);

    const handleRemoveRow = useCallback((id) => {
        setProductRows(prev => prev.filter(r => r._id !== id));
    }, []);

    const handleAddRow = () => {
        setProductRows(prev => [...prev, emptyProductRow()]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedFromStore) return auth.toastError(t("Please select source store"));
        if (!selectedToStore)   return auth.toastError(t("Please select destination store"));
        if (selectedFromStore.value === selectedToStore.value)
            return auth.toastError(t("Source and destination stores cannot be the same"));

        for (let i = 0; i < productRows.length; i++) {
            const row = productRows[i];
            const n = i + 1;
            if (!row.category_id) return auth.toastError(`${t("Row")} ${n}: ${t("Please select category")}`);
            if (!row.product_id)  return auth.toastError(`${t("Row")} ${n}: ${t("Please select product")}`);
            if (!row.unit_id)     return auth.toastError(`${t("Row")} ${n}: ${t("Please select unit")}`);
            if (!row.quintity || parseFloat(row.quintity) <= 0)
                return auth.toastError(`${t("Row")} ${n}: ${t("Please enter valid quantity")}`);
        }

        postData({
            from_store_id: selectedFromStore.value,
            to_store_id:   selectedToStore.value,
            products: productRows.map(row => ({
                category_id: row.category_id,
                product_id:  row.product_id,
                unit_id:     row.unit_id,
                quintity:    parseFloat(row.quintity),
            })),
        }, t("Transfer completed successfully"));
    };

    const handleChangeStatus = async (id, name, status) => {
        const newStatus = status === "approve" ? "reject" : "approve";
        await changeState(
            `${apiUrl}/admin/purchase_transfer/status/${id}`,
            `${name} Status Changed to ${newStatus}.`,
            { status: newStatus }
        );
        setPurchaseTransfers(prev => prev.map(tr => tr.id === id ? { ...tr, status: newStatus } : tr));
    };

    const handleRowPdf = async (transferId) => {
        setRowPdfLoading(transferId);
        try {
            const res = await fetch(`${apiUrl}/admin/purchase_transfer/transfer_cost/${transferId}`, {
                headers: {
                    'Authorization': `Bearer ${auth?.userState?.token || ''}`,
                    'Accept': 'application/json',
                },
            });
            const data = await res.json();
            const html = generateTransferReceiptHtml({
                fromStore: data.from_store,
                toStore:   data.to_store,
                date:      data.date,
                items: [{
                    category:   data.category,
                    product:    data.product,
                    unit:       data.unit,
                    quintity:   data.quintity,
                    unit_cost:  data.unit_cost,
                    total_cost: data.total_cost,
                }],
                isRtl,
            });
            await exportHtmlToPdf(html, `transfer-${transferId}.pdf`, isRtl);
        } catch {
            auth.toastError(t("Failed to generate PDF"));
        } finally {
            setRowPdfLoading(null);
        }
    };

    const getStatusDisplay = (status) => ({
        text:    status === "approve" ? t("Approved") : t("Rejected"),
        color:   status === "approve" ? "text-green-600" : "text-red-600",
        bgColor: status === "approve" ? "bg-green-100" : "bg-red-100",
    });

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
            padding: '0.1rem 0.25rem',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(225,29,72,0.15)' : 'none',
            borderColor: state.isFocused ? '#e11d48' : '#E2E8F0',
            backgroundColor: '#fff',
            fontSize: '0.875rem',
            '&:hover': { borderColor: '#fda4af' },
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };

    const dialogSelectStyles = {
        ...selectStyles,
        control: (base, state) => ({
            ...selectStyles.control(base, state),
            padding: '0.3rem 0.5rem',
            fontSize: '1rem',
        }),
    };

    const headers = [
        t("SL"), t("Type"), t("Category"), t("Item"),
        t("From Store"), t("To Store"), t("Quantity"), t("Unit"), t("Approval"), t("PDF"),
    ];

    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
            {loadingPurchaseTransfer ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className='flex flex-col items-center justify-between md:flex-row mb-6'>
                        <TitlePage text={t('Stock Transfer')} />
                        <AddButton Text={t("Transfer")} handleClick={() => setShowDialog(true)} />
                    </div>

                    {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TRANSFER DIALOG â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                    {showDialog && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>

                            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                                style={{ maxHeight: '90vh' }}>

                                <div className="bg-gradient-to-r from-red-950 via-rose-900 to-rose-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
                                    <div>
                                        <div className="inline-block bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-rose-200 uppercase tracking-wider mb-1">
                                            {t("Inventory Management")}
                                        </div>
                                        <h2 className="text-white text-xl font-bold tracking-wide">{t("Stock Transfer")}</h2>
                                        <p className="text-rose-100/90 text-sm mt-0.5">{t("Transfer products between stores")}</p>
                                    </div>
                                    <button
                                        onClick={closeDialog}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-all"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                                        <div className="bg-gradient-to-br from-rose-50/70 via-rose-50/30 to-white rounded-2xl p-4 border border-rose-100 shadow-sm">
                                            <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                                                {t("Transfer Route")}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                                        {t("From Store")} *
                                                    </label>
                                                    <Select
                                                        value={selectedFromStore}
                                                        onChange={(opt) => {
                                                            setSelectedFromStore(opt);
                                                            setSelectedToStore(null);
                                                        }}
                                                        options={stores}
                                                        placeholder={t("Select source store...")}
                                                        isClearable isSearchable
                                                        styles={dialogSelectStyles}
                                                        menuPortalTarget={document.body}
                                                        menuPosition="fixed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                                        {t("To Store")} *
                                                    </label>
                                                    <Select
                                                        value={selectedToStore}
                                                        onChange={setSelectedToStore}
                                                        options={stores.filter(s => s.value !== selectedFromStore?.value)}
                                                        placeholder={t("Select destination store...")}
                                                        isClearable isSearchable
                                                        isDisabled={!selectedFromStore}
                                                        styles={dialogSelectStyles}
                                                        menuPortalTarget={document.body}
                                                        menuPosition="fixed"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                                                    {t("Products")}
                                                    <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                                                        {productRows.length}
                                                    </span>
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={handleAddRow}
                                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-semibold active:scale-95 transition-all shadow-sm shadow-rose-200"
                                                >
                                                    <span className="text-lg leading-none">+</span>
                                                    {t("Add Product")}
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {productRows.map((row, index) => (
                                                    <ProductRow
                                                        key={row._id}
                                                        row={row}
                                                        index={index}
                                                        products={products}
                                                        categories={categories}
                                                        units={units}
                                                        onUpdate={handleUpdateRow}
                                                        onRemove={handleRemoveRow}
                                                        canRemove={productRows.length > 1}
                                                        selectStyles={selectStyles}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-between gap-3">
                                        <p className="text-xs text-slate-400">
                                            {productRows.length} {t("product(s) to transfer")}
                                        </p>
                                        <div className="flex gap-3">
                                            <StaticButton text={t("Cancel")} handleClick={closeDialog} />
                                            <SubmitButton text={t("Transfer")} loading={loadingPost} />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• RECEIPT MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                    {receiptData && (
                        <ReceiptModal
                            data={receiptData}
                            onClose={() => setReceiptData(null)}
                        />
                    )}

                    {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TABLE â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                    <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
                        <thead className="w-full">
                            <tr className="w-full border-b-2">
                                {headers.map((name, index) => (
                                    <th key={index}
                                        className="min-w-[100px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3">
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="w-full">
                            {PurchaseTransfers.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} className="text-xl text-center text-mainColor font-TextFontMedium py-8">
                                        {t("No Purchase Transfer Found")}
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((transfer, index) => {
                                    const statusDisplay = getStatusDisplay(transfer.status);
                                    const isProduct     = transfer.product && transfer.category;
                                    const itemName      = transfer.product || transfer.material || "-";
                                    const categoryName  = transfer.category || transfer.category_material || "-";

                                    return (
                                        <tr className="w-full border-b-2" key={transfer.id}>
                                            <td className="min-w-[60px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="min-w-[110px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl font-medium">
                                                {isProduct ? t("Product") : t("Material")}
                                            </td>
                                            <td className="min-w-[140px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl">
                                                {categoryName}
                                            </td>
                                            <td className="min-w-[160px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl font-medium">
                                                {itemName}
                                            </td>
                                            <td className="min-w-[130px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl">
                                                {transfer.from_store || "-"}
                                            </td>
                                            <td className="min-w-[130px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl">
                                                {transfer.to_store || "-"}
                                            </td>
                                            <td className="min-w-[90px] py-2 text-center text-thirdColor font-semibold">
                                                {transfer.quintity || "0"}
                                            </td>
                                            <td className="min-w-[90px] py-2 text-center text-thirdColor">
                                                {transfer.unit || "-"}
                                            </td>
                                            <td className="min-w-[160px] py-2 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Switch
                                                        checked={transfer.status === "approve"}
                                                        handleClick={() => handleChangeStatus(transfer.id, itemName, transfer.status)}
                                                        disabled={loadingChange}
                                                    />
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                                                        {statusDisplay.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="min-w-[70px] py-2 text-center">
                                                <button
                                                    onClick={() => handleRowPdf(transfer.id)}
                                                    disabled={rowPdfLoading === transfer.id}
                                                    title={t("Download PDF")}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-800 transition-all disabled:opacity-50"
                                                >
                                                    {rowPdfLoading === transfer.id ? (
                                                        <span className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <FiFileText size={16} />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• PAGINATION â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                    {PurchaseTransfers.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
                            {currentPage !== 1 && (
                                <button onClick={() => setCurrentPage(p => p - 1)}
                                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium">
                                    {t("Prev")}
                                </button>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page ? "bg-mainColor text-white" : "text-mainColor"}`}>
                                    {page}
                                </button>
                            ))}
                            {totalPages !== currentPage && (
                                <button onClick={() => setCurrentPage(p => p + 1)}
                                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium">
                                    {t("Next")}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockTransfer;
