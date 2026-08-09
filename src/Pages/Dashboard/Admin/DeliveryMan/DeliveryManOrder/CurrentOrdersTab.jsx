// CurrentOrdersTab.jsx
import React from 'react';
import { useGet } from '../../../../../Hooks/useGet';
import OrdersTable from '../../../../../Components/AnotherComponents/OrdersTable';
import { StaticLoader } from '../../../../../Components/Components';

const CurrentOrdersTab = ({ deliveryManId }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading } = useGet({ url: `${apiUrl}/admin/delivery/single_page/current_orders/${deliveryManId}` });
  const orders = data?.orders || [];

  return loading ? <StaticLoader /> : <OrdersTable orders={orders} />;
};

export default CurrentOrdersTab;