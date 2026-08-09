// tabs/DeliveredOrdersTab.jsx
import React, { useState, useEffect } from 'react';
import { useGet } from '../../../../../Hooks/useGet';
import { usePost } from '../../../../../Hooks/usePostJson';
import DateInput from '../../../../../Components/Inputs/DateInput';
import OrdersTable from '../../../../../Components/AnotherComponents/OrdersTable';
import { StaticLoader } from '../../../../../Components/Components';
import { useTranslation } from 'react-i18next';

const DeliveredOrdersTab = ({ deliveryManId }) => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const getUrl = `${apiUrl}/admin/delivery/single_page/delivered_order/${deliveryManId}`;
  const filterUrl = `${apiUrl}/admin/delivery/single_page/filter_delivered_order/${deliveryManId}`;

  const { data: normalData, loading: loadingNormal } = useGet({ url: getUrl });
  const { postData, loading: loadingFilter, response: filterResponse } = usePost({ url: filterUrl });

  // Auto apply filter
  useEffect(() => {
    if (fromDate && toDate) {
      postData({ from: fromDate, to: toDate });
    }
  }, [fromDate, toDate]);

  const hasFilter = !!fromDate && !!toDate;

  // Use filtered response or normal data
  const responseData = hasFilter ? filterResponse?.data : normalData;
  const loading = loadingNormal || loadingFilter;

  // Extract data safely
  const totalOrders = responseData?.total_orders || 0;
  const expectedOrders = responseData?.expected_orders || 0;
  const dueOrders = responseData?.due_orders || [];

  return (
    <div>
      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-lg font-medium mb-2">{t('From Date')}</label>
          <DateInput value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="block text-lg font-medium mb-2">{t('To Date')}</label>
          <DateInput value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>

        {hasFilter && (
          <button
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="px-6 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
          >
            {t('Clear Filter')}
          </button>
        )}
      </div>

      {/* Filter Status */}
      {hasFilter && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-xl text-green-800 font-semibold text-center">
          {t('Showing delivered orders from')} {fromDate} → {toDate}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">{t('Total Delivered')}</h3>
          <p className="text-3xl font-bold mt-2">{totalOrders.toFixed(2)} EGP</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">{t('Expected Amount')}</h3>
          <p className="text-3xl font-bold mt-2">{expectedOrders.toFixed(2)} EGP</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">{t('Due Amount')}</h3>
          <p className="text-3xl font-bold mt-2">
            {(totalOrders - expectedOrders).toFixed(2)} EGP
          </p>
          <p className="text-sm mt-2 opacity-90">
            {dueOrders.length} {t('orders not fully paid')}
          </p>
        </div>
      </div>

      {/* Due Orders Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <StaticLoader />
        </div>
      ) : dueOrders.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
          <p className="text-2xl font-bold text-green-800">{t('All payments collected!')}</p>
          <p className="text-green-600 mt-2">{t('No due orders')}</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-thirdColor mb-4">
            {t('Due Orders')} ({dueOrders.length})
          </h2>
          <OrdersTable orders={dueOrders} />
        </>
      )}
    </div>
  );
};

export default DeliveredOrdersTab;