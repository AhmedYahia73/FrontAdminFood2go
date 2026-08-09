// tabs/FailedOrdersTab.jsx
import React, { useEffect, useState } from 'react';
import { useGet } from '../../../../../Hooks/useGet';
import { usePost } from '../../../../../Hooks/usePostJson';
import OrdersTable from '../../../../../Components/AnotherComponents/OrdersTable';
import { StaticLoader } from '../../../../../Components/Components';
import { useTranslation } from 'react-i18next';

const FailedOrdersTab = ({ deliveryManId }) => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [selectedOrders, setSelectedOrders] = useState([]);

  const { data, loading, refetch } = useGet({
    url: `${apiUrl}/admin/delivery/single_page/faild_orders/${deliveryManId}`
  });

  const { postData, loading: confirming , response } = usePost({
    url: `${apiUrl}/admin/delivery/single_page/confirm_faild_order`
  });

  const orders = data?.orders || [];

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleConfirmReturned = async () => {
    if (selectedOrders.length === 0) return;

    postData({ order_ids: selectedOrders });
  };

  useEffect(() => {
    if (response && response.status === 200 && !confirming) {
      setSelectedOrders([]);
      refetch(); // Refresh list
    }
  }, [response, confirming]);

  return (
    <div>
      {/* Confirm Button - Only show if any selected */}
      {selectedOrders.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded-xl flex items-center justify-between">
          <span className="text-blue-800 font-semibold">
            {selectedOrders.length} {t('orders selected')}
          </span>
          <button
            onClick={handleConfirmReturned}
            disabled={confirming}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-70 transition"
          >
            {confirming ? t('Confirming...') : t('Confirm Selected as Returned')}
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <StaticLoader />
      ) : orders.length === 0 ? (
        <p className="text-center py-10 text-xl text-gray-500">{t('No failed orders')}</p>
      ) : (
        <OrdersTable
          orders={orders}
          showCheckbox={true}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
          onSelectAll={handleSelectAll}
          allSelected={selectedOrders.length === orders.length && orders.length > 0}
        />
      )}
    </div>
  );
};

export default FailedOrdersTab;