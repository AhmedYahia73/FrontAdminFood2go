// tabs/FailedOrdersTab.jsx
import React, { useEffect, useState } from 'react';
import { useGet } from '../../../../Hooks/useGet';
import { usePost } from '../../../../Hooks/usePostJson';

import { StaticLoader } from '../../../../Components/Components';
import { useTranslation } from 'react-i18next';

const HistoryOrdersTab = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const { data, loading } = useGet({
        url: `${apiUrl}/admin/delivery_balance/delivery_history`
    });

    const orders = data?.history || [];

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    return (
        <div>
            {loading ? (
                <StaticLoader />
            ) : orders.length === 0 ? (
                <p className="text-center py-10 text-xl text-gray-500">{t('No history found')}</p>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="overflow-x-auto bg-white shadow rounded-xl">
                        <table className="w-full min-w-max">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"} text-thirdColor`}>
                                        {t("ID")}
                                    </th>
                                    <th className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"} text-thirdColor`}>
                                        {t("Amount")}
                                    </th>
                                    <th className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"} text-thirdColor`}>
                                        {t("Delivery")}
                                    </th>
                                    <th className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"} text-thirdColor`}>
                                        {t("Financial")}
                                    </th>
                                    <th className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"} text-thirdColor`}>
                                        {t("Branch")}
                                    </th>
                                    <th className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"} text-thirdColor`}>
                                        {t("Cashier Man")}
                                    </th>
                                    <th className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"} text-thirdColor`}>
                                        {t("Cashier")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.map((order) => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{order.id}</td>
                                        <td className="px-6 py-4 font-semibold">{order.amount}</td>
                                        <td className="px-6 py-4">{order.delivery}</td>
                                        <td className="px-6 py-4">{order.financial}</td>
                                        <td className="px-6 py-4">{order.branch}</td>
                                        <td className="px-6 py-4">{order.cashier_man}</td>
                                        <td className="px-6 py-4">{order.cashier}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                            >
                                {t("<")}
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-mainColor text-white' : 'hover:bg-gray-100'}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                            >
                                {t(">")}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HistoryOrdersTab;