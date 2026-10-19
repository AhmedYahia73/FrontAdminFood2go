import React, { useEffect, useState, useMemo } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { FaFileExcel, FaPrint, FaEye, FaTimes, FaMoneyBillWave, FaShoppingCart, FaReceipt, FaWallet } from 'react-icons/fa';
import axios from 'axios';

/* ═══════════════════════════════════════════════════════════════════════════
   End-Shift Report Modal
═══════════════════════════════════════════════════════════════════════════ */
const EndShiftModal = ({ gap, onClose }) => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await axios.get(
                    `${apiUrl}/admin/cashier_gap/end_shift_report/${gap.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReport(res.data);
            } catch (e) {
                setError(e?.response?.data?.errors || t('Failed to load report'));
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [gap.id]);

    const fmt = (v) => Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handlePrint = () => {
        if (!report) return;
        const printWindow = window.open('', '_blank');
        const r = report;

        const faRows = (r.financial_accounts || []).map(fa => `
            <tr>
                <td>${fa.financial_name || '-'}</td>
                <td class="num">${fmt(fa.total_amount_delivery)}</td>
                <td class="num">${fmt(fa.total_amount_take_away)}</td>
                <td class="num">${fmt(fa.total_amount_dine_in)}</td>
                <td class="num bold">${fmt((fa.total_amount_delivery||0)+(fa.total_amount_take_away||0)+(fa.total_amount_dine_in||0))}</td>
            </tr>
        `).join('');

        const expRows = (r.expenses || []).map(ex => `
            <tr>
                <td>${ex.financial_account || '-'}</td>
                <td>${ex.category || '-'}</td>
                <td class="num expense">${fmt(ex.total)}</td>
            </tr>
        `).join('');

        printWindow.document.write(`<!DOCTYPE html><html><head><title>${t('End Shift Report')}</title>
        <style>
            body{font-family:Arial,sans-serif;padding:20px;color:#1e293b;font-size:13px;}
            h1{text-align:center;font-size:20px;margin-bottom:4px;}
            .sub{text-align:center;color:#64748b;margin-bottom:20px;font-size:12px;}
            table{width:100%;border-collapse:collapse;margin-bottom:16px;}
            th{background:#1e293b;color:#fff;padding:8px;text-align:left;font-size:11px;}
            td{padding:7px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;}
            tr:nth-child(even) td{background:#f8fafc;}
            .num{text-align:right;}
            .bold{font-weight:700;}
            .income{color:#059669;font-weight:700;}
            .expense{color:#dc2626;font-weight:700;}
            .gap-neg{color:#dc2626;font-weight:900;}
            .gap-pos{color:#059669;font-weight:900;}
            .summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
            .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;}
            .card label{font-size:10px;color:#64748b;text-transform:uppercase;font-weight:700;}
            .card .val{font-size:18px;font-weight:900;color:#1e293b;}
            .section-title{font-size:13px;font-weight:800;color:#1e293b;text-transform:uppercase;border-bottom:2px solid #1e293b;padding-bottom:4px;margin:16px 0 8px;}
            @media print{body{padding:0;} @page{margin:10mm;}}
        </style></head><body>
        <h1>${t('End Shift Report')}</h1>
        <p class="sub">${r.cashier_man || ''} — ${r.cashier || ''} | ${t('Shift')} #${r.shift_number || ''} | ${r.shift_start || ''} → ${r.shift_end || t('Ongoing')}</p>

        <div class="summary-grid">
            <div class="card"><label>${t('Total Orders')}</label><div class="val income">${fmt(r.total_orders)}</div></div>
            <div class="card"><label>${t('Start Amount')}</label><div class="val">${fmt(r.start_amount)}</div></div>
            <div class="card"><label>${t('Expenses')}</label><div class="val expense">${fmt(r.expenses_total)}</div></div>
            <div class="card"><label>${t('Actual Total')}</label><div class="val">${fmt(r.actual_total)}</div></div>
            <div class="card"><label>${t('Cashier Amount')}</label><div class="val">${fmt(r.cashier_amount)}</div></div>
            <div class="card"><label>${t('Gap')}</label><div class="val ${(r.gap||0)<0?'gap-neg':'gap-pos'}">${fmt(r.gap)}</div></div>
        </div>

        <div class="section-title">${t('Financial Accounts')}</div>
        <table><thead><tr><th>${t('Account')}</th><th>${t('Delivery')}</th><th>${t('Take Away')}</th><th>${t('Dine In')}</th><th>${t('Total')}</th></tr></thead>
        <tbody>${faRows}</tbody></table>

        <div class="section-title">${t('Expenses')}</div>
        <table><thead><tr><th>${t('Account')}</th><th>${t('Category')}</th><th>${t('Total')}</th></tr></thead>
        <tbody>${expRows}</tbody></table>

        <div class="section-title">${t('Orders Summary')}</div>
        <table><thead><tr><th>${t('Type')}</th><th>${t('Count')}</th><th>${t('Amount')}</th></tr></thead>
        <tbody>
            <tr><td>${t('Dine In')}</td><td class="num">${r.orders_count?.dine_in_orders_count||0}</td><td class="num income">${fmt(r.orders_amount?.dine_in_amount)}</td></tr>
            <tr><td>${t('Take Away')}</td><td class="num">${r.orders_count?.take_away_orders_count||0}</td><td class="num income">${fmt(r.orders_amount?.take_away_amount)}</td></tr>
            <tr><td>${t('Delivery')}</td><td class="num">${r.orders_count?.delivery_orders_count||0}</td><td class="num income">${fmt(r.orders_amount?.delivery_amount)}</td></tr>
            <tr><td>${t('Void Orders')}</td><td class="num expense">${r.void_order_count||0}</td><td class="num expense">${fmt(r.void_order_sum)}</td></tr>
        </tbody></table>

        <script>window.onload=function(){window.print();setTimeout(()=>window.close(),500);};</script>
        </body></html>`);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-mainColor text-white rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{t('End Shift Report')}</h2>
                        {report && (
                            <p className="text-sm text-white/80 mt-0.5">
                                {report.cashier_man} — {report.cashier} | {t('Shift')} #{report.shift_number}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {report && (
                            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-all">
                                <FaPrint size={14} /> {t('Print')}
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
                            <FaTimes size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-mainColor/20 border-t-mainColor rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-medium animate-pulse">{t('Loading report...')}</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12 text-red-500 font-bold">{typeof error === 'string' ? error : t('Error loading report')}</div>
                    )}

                    {report && !loading && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: t('Total Orders'), value: report.total_orders, color: 'text-green-600', icon: <FaShoppingCart /> },
                                    { label: t('Start Amount'), value: report.start_amount, color: 'text-blue-600', icon: <FaWallet /> },
                                    { label: t('Expenses'), value: report.expenses_total, color: 'text-red-500', icon: <FaReceipt /> },
                                    { label: t('Actual Total'), value: report.actual_total, color: 'text-gray-800', icon: <FaMoneyBillWave /> },
                                    { label: t('Cashier Amount'), value: report.cashier_amount, color: 'text-purple-600', icon: <FaWallet /> },
                                    { label: t('Gap'), value: report.gap, color: (report.gap || 0) < 0 ? 'text-red-600' : 'text-green-600', icon: <FaMoneyBillWave /> },
                                ].map((card, i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                                            <span className={card.color}>{card.icon}</span>
                                            {card.label}
                                        </div>
                                        <div className={`text-xl font-black ${card.color}`}>
                                            {Number(card.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Shift Info */}
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">{t('Start')}: {report.shift_start || '-'}</span>
                                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full font-semibold">{t('End')}: {report.shift_end || t('Ongoing')}</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">{t('Orders')}: {report.order_count || 0}</span>
                                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full font-semibold">{t('Void')}: {report.void_order_count || 0} ({Number(report.void_order_sum||0).toLocaleString()})</span>
                            </div>

                            {/* Financial Accounts */}
                            {Array.isArray(report.financial_accounts) && report.financial_accounts.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="w-1 h-5 bg-mainColor rounded-full inline-block"></span>
                                        {t('Financial Accounts')}
                                    </h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-800 text-white">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">{t('Account')}</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">{t('Delivery')}</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">{t('Take Away')}</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">{t('Dine In')}</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">{t('Total')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {report.financial_accounts.map((fa, i) => {
                                                    const total = (fa.total_amount_delivery || 0) + (fa.total_amount_take_away || 0) + (fa.total_amount_dine_in || 0);
                                                    return (
                                                        <tr key={i} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-semibold text-gray-800">{fa.financial_name || '-'}</td>
                                                            <td className="px-4 py-3 text-right tabular-nums">{Number(fa.total_amount_delivery || 0).toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right tabular-nums">{Number(fa.total_amount_take_away || 0).toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right tabular-nums">{Number(fa.total_amount_dine_in || 0).toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-green-700 tabular-nums">{Number(total).toLocaleString()}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Expenses */}
                            {Array.isArray(report.expenses) && report.expenses.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="w-1 h-5 bg-red-400 rounded-full inline-block"></span>
                                        {t('Expenses')} — {t('Total')}: <span className="text-red-600">{Number(report.expenses_total || 0).toLocaleString()}</span>
                                    </h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-red-50 text-red-800">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">{t('Account')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">{t('Category')}</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">{t('Amount')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {report.expenses.map((ex, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">{ex.financial_account || '-'}</td>
                                                        <td className="px-4 py-3 text-gray-500">{ex.category || '-'}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-red-600 tabular-nums">{Number(ex.total || 0).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Orders by Type */}
                            <div>
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className="w-1 h-5 bg-green-400 rounded-full inline-block"></span>
                                    {t('Orders by Type')}
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-green-50 text-green-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase">{t('Type')}</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold uppercase">{t('Count')}</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold uppercase">{t('Amount')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold">{t('Dine In')}</td>
                                                <td className="px-4 py-3 text-right">{report.orders_count?.dine_in_orders_count || 0}</td>
                                                <td className="px-4 py-3 text-right font-bold text-green-700 tabular-nums">{Number(report.orders_amount?.dine_in_amount || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold">{t('Take Away')}</td>
                                                <td className="px-4 py-3 text-right">{report.orders_count?.take_away_orders_count || 0}</td>
                                                <td className="px-4 py-3 text-right font-bold text-green-700 tabular-nums">{Number(report.orders_amount?.take_away_amount || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold">{t('Delivery')}</td>
                                                <td className="px-4 py-3 text-right">{report.orders_count?.delivery_orders_count || 0}</td>
                                                <td className="px-4 py-3 text-right font-bold text-green-700 tabular-nums">{Number(report.orders_amount?.delivery_amount || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 bg-red-50/40">
                                                <td className="px-4 py-3 font-semibold text-red-600">{t('Void Orders')}</td>
                                                <td className="px-4 py-3 text-right text-red-600 font-bold">{report.void_order_count || 0}</td>
                                                <td className="px-4 py-3 text-right font-bold text-red-600 tabular-nums">{Number(report.void_order_sum || 0).toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Online Orders */}
                            {((report.online_order?.paid?.length > 0) || (report.online_order?.un_paid?.length > 0)) && (
                                <div>
                                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="w-1 h-5 bg-blue-400 rounded-full inline-block"></span>
                                        {t('Online Orders')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {report.online_order?.paid?.length > 0 && (
                                            <div className="rounded-xl border border-green-100 overflow-hidden">
                                                <div className="bg-green-50 px-4 py-2 text-xs font-bold text-green-700 uppercase">{t('Paid')}</div>
                                                {report.online_order.paid.map((p, i) => (
                                                    <div key={i} className="flex justify-between px-4 py-2 text-sm border-t border-green-50">
                                                        <span>{p.payment_method}</span>
                                                        <span className="font-bold text-green-700 tabular-nums">{Number(p.amount || 0).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {report.online_order?.un_paid?.length > 0 && (
                                            <div className="rounded-xl border border-red-100 overflow-hidden">
                                                <div className="bg-red-50 px-4 py-2 text-xs font-bold text-red-700 uppercase">{t('Unpaid')}</div>
                                                {report.online_order.un_paid.map((p, i) => (
                                                    <div key={i} className="flex justify-between px-4 py-2 text-sm border-t border-red-50">
                                                        <span>{p.payment_method}</span>
                                                        <span className="font-bold text-red-600 tabular-nums">{Number(p.amount || 0).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Due */}
                            {((report.due_module || 0) > 0 || (report.due_user || 0) > 0) && (
                                <div className="flex flex-wrap gap-4">
                                    {(report.due_module || 0) > 0 && (
                                        <div className="flex-1 min-w-[140px] bg-orange-50 border border-orange-100 rounded-xl p-4">
                                            <div className="text-xs font-bold text-orange-600 uppercase mb-1">{t('Due Module')}</div>
                                            <div className="text-lg font-black text-orange-700">{Number(report.due_module).toLocaleString()}</div>
                                        </div>
                                    )}
                                    {(report.due_user || 0) > 0 && (
                                        <div className="flex-1 min-w-[140px] bg-orange-50 border border-orange-100 rounded-xl p-4">
                                            <div className="text-xs font-bold text-orange-600 uppercase mb-1">{t('Due User')}</div>
                                            <div className="text-lg font-black text-orange-700">{Number(report.due_user).toLocaleString()}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main CashierShortage Component
═══════════════════════════════════════════════════════════════════════════ */
const CashierShortage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Filter states
    const [selectedCashierId, setSelectedCashierId] = useState(null);
    const [selectedCashierManId, setSelectedCashierManId] = useState(null);

    // Applied filter states
    const [appliedFilters, setAppliedFilters] = useState({
        cashier_id: null,
        cashier_man_id: null,
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Modal state
    const [selectedGap, setSelectedGap] = useState(null);

    const { t } = useTranslation();

    const apiParams = useMemo(() => {
        const params = {
            page: currentPage,
            per_page: itemsPerPage,
        };
        if (appliedFilters.cashier_id) params.cashier_id = appliedFilters.cashier_id;
        if (appliedFilters.cashier_man_id) params.cashier_man_id = appliedFilters.cashier_man_id;
        return params;
    }, [currentPage, appliedFilters, itemsPerPage]);

    const { refetch: refetchReport, loading: loadingReport, data: reportData } = useGet({
        url: `${apiUrl}/admin/cashier_gap`,
        params: apiParams,
        queryKey: ["cashier_gap", currentPage, appliedFilters],
    });

    const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({
        url: `${apiUrl}/admin/cashier_gap/lists`
    });

    const [cashiers, setCashiers] = useState([]);
    const [cashierMen, setCashierMen] = useState([]);

    // Extract gaps data (supports paginated response, items array, and flat array)
    const gapsData = Array.isArray(reportData?.gaps)
        ? reportData.gaps
        : Array.isArray(reportData?.gaps?.data)
        ? reportData.gaps.data
        : Array.isArray(reportData?.data)
        ? reportData.data
        : [];

    const isServerPaginated = Boolean(reportData?.pagination || reportData?.gaps?.data);
    const paginationMeta = reportData?.pagination || (!Array.isArray(reportData?.gaps) ? reportData?.gaps : null);

    // Calculate pagination
    const totalPages = paginationMeta?.last_page || (Array.isArray(gapsData) ? Math.ceil(gapsData.length / itemsPerPage) : 1);
    const totalCount = paginationMeta?.total ?? (Array.isArray(gapsData) ? gapsData.length : 0);

    const currentGaps = isServerPaginated
        ? gapsData
        : (Array.isArray(gapsData)
            ? gapsData.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            )
            : []);

    useEffect(() => {
        refetchList();
    }, [refetchList]);

    useEffect(() => {
        if (dataList) {
            setCashiers(dataList.cashiers || []);
            setCashierMen(dataList.cashier_men || []);
        }
    }, [dataList]);

    const prepareOptions = (data, labelKey = 'name') => {
        if (!Array.isArray(data)) return [];
        const options = data.map(item => ({
            value: item.id,
            label: item[labelKey] || item.user_name || `ID: ${item.id}`
        }));
        return options;
    };

    const cashierOptions = prepareOptions(cashiers, 'name');
    const cashierManOptions = prepareOptions(cashierMen, 'user_name');

    const handleGenerateReport = () => {
        setCurrentPage(1);
        setAppliedFilters({
            cashier_id: selectedCashierId,
            cashier_man_id: selectedCashierManId,
        });
    };

    const handleResetFilters = () => {
        setSelectedCashierId(null);
        setSelectedCashierManId(null);
        setCurrentPage(1);
        setAppliedFilters({
            cashier_id: null,
            cashier_man_id: null,
        });
    };

    const handleExportExcel = () => {
        if (!Array.isArray(currentGaps) || currentGaps.length === 0) return;

        const dataToExport = currentGaps.map((gap, index) => ({
            [t("No.")]: (currentPage - 1) * itemsPerPage + index + 1,
            [t("Shortage")]: gap.amount,
            [t("Cashier Amount")]: gap.cashier_amount ?? "-",
            [t("Cashier")]: gap.cashier,
            [t("Cashier Man")]: gap.cashier_man,
            [t("Date")]: gap.date,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Cashier Shortage");

        XLSX.writeFile(workbook, "Cashier_Shortage_Report.xlsx");
    };

    const handlePrint = () => {
        if (!Array.isArray(currentGaps) || currentGaps.length === 0) return;

        const printWindow = window.open('', '_blank');
        const date = new Date().toLocaleDateString();

        const receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${t('Cashier Shortage Report')}</title>
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
                    .table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    .table th, .table td {
                        border-bottom: 1px dotted #ccc;
                        padding: 5px;
                        text-align: left;
                        font-size: 10px;
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
                    <div class="title">${t('Cashier Shortage Report')}</div>
                    <div class="date">${t('Date')}: ${date}</div>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>${t('No.')}</th>
                            <th>${t('Shortage')}</th>
                            <th>${t('Cashier Amount')}</th>
                            <th>${t('Cashier')}</th>
                            <th>${t('Date')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentGaps.map((gap, index) => `
                            <tr>
                                <td>${(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>${gap.amount}</td>
                                <td>${gap.cashier_amount ?? '-'}</td>
                                <td>${gap.cashier}</td>
                                <td>${gap.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getPaginationNumbers = () => {
        const delta = 2;
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
            if (totalPages > 1) rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className="w-full p-6 pb-32 space-y-8">
            {/* Modal */}
            {selectedGap && (
                <EndShiftModal gap={selectedGap} onClose={() => setSelectedGap(null)} />
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold text-mainColor">{t("Cashier Shortage")}</h1>
                {Array.isArray(currentGaps) && currentGaps.length > 0 && (
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

            {/* Filters */}
            <div className="p-6 rounded-lg shadow-sm bg-gray-50">
                <h2 className="mb-4 text-xl font-semibold text-mainColor">{t("Filters")}</h2>
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Cashier")}</label>
                        <Select
                            options={cashierOptions}
                            onChange={(opt) => setSelectedCashierId(opt?.value || null)}
                            isClearable
                            placeholder={t("Select Cashier")}
                            value={cashierOptions.find(opt => opt.value === selectedCashierId) || null}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">{t("Cashier Man")}</label>
                        <Select
                            options={cashierManOptions}
                            onChange={(opt) => setSelectedCashierManId(opt?.value || null)}
                            isClearable
                            placeholder={t("Select Cashier Man")}
                            value={cashierManOptions.find(opt => opt.value === selectedCashierManId) || null}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button onClick={handleGenerateReport} className="px-6 py-3 font-medium text-white rounded-lg bg-mainColor hover:bg-opacity-90">
                        {t("Generate Report")}
                    </button>
                    <button onClick={handleResetFilters} className="px-6 py-3 font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600">
                        {t("Reset Filters")}
                    </button>
                </div>
            </div>

            {loadingReport && <p className="text-lg text-center text-gray-600">{t("Loading report...")}</p>}

            {/* Gaps Table */}
            {Array.isArray(currentGaps) && currentGaps.length > 0 && (
                <div className="space-y-4">
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                        <h2 className="p-4 text-xl font-bold text-white bg-mainColor">{t("Cashier Shortage Records")}</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("No.")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Shortage")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Cashier Amount")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Cashier")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Cashier Man")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700">{t("Date")}</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-center text-gray-700">{t("Report")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentGaps.map((gap, index) => (
                                        <tr key={index} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="px-4 py-3 text-red-600 font-bold">{gap.amount}</td>
                                            <td className="px-4 py-3 text-blue-600 font-bold">{gap.cashier_amount ?? "-"}</td>
                                            <td className="px-4 py-3">{gap.cashier}</td>
                                            <td className="px-4 py-3">{gap.cashier_man}</td>
                                            <td className="px-4 py-3">{gap.date}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setSelectedGap(gap)}
                                                    title={t("View End Shift Report")}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-mainColor/10 hover:bg-mainColor text-mainColor hover:text-white transition-all duration-200 shadow-sm"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-700">
                                {t("Showing")}{" "}
                                <span className="font-medium">{totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span>
                                {" to "}
                                <span className="font-medium">
                                    {Math.min(currentPage * itemsPerPage, totalCount)}
                                </span>
                                {" of "}
                                <span className="font-medium">{totalCount}</span>
                                {" results"}
                            </div>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentPage === 1
                                        ? "text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200"
                                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {t("Previous")}
                                </button>

                                {getPaginationNumbers().map((pageNumber, index) => (
                                    <button
                                        key={index}
                                        onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
                                        disabled={pageNumber === '...'}
                                        className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md transition-all ${pageNumber === currentPage
                                            ? "bg-mainColor text-white"
                                            : pageNumber === '...'
                                                ? "text-gray-500 cursor-default"
                                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentPage === totalPages
                                        ? "text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-200"
                                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!loadingReport && (!Array.isArray(currentGaps) || currentGaps.length === 0) && (
                <div className="py-20 text-center text-gray-500">
                    <p className="text-2xl">{t("No shortage records found")}</p>
                    <p>{t('Select filters and click "Generate Report"')}</p>
                </div>
            )}
        </div>
    );
};

export default CashierShortage;
