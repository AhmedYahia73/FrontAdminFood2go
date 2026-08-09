// DeliveryManOrdersParent.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CurrentOrdersTab from './CurrentOrdersTab';
import DeliveredOrdersTab from './DeliveredOrdersTab';
import FailedOrdersTab from './FailedOrdersTab';
import { useTranslation } from 'react-i18next';

const TABS = {
  CURRENT: 'current',
  DELIVERED: 'delivered',
  FAILED: 'failed',
};

const DeliveryManOrdersParent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(TABS.CURRENT);

  return (
    <div className="p-2 md:p-6 pb-32">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="mb-4 text-mainColor font-bold text-lg hover:underline">
        ← {t('Back to Delivery Men')}
      </button>

      <h1 className="text-xl md:text-xl font-bold text-thirdColor mb-6">
        {t('Delivery Man Orders')} (ID: {id})
      </h1>

      {/* Tabs - Always visible */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {[
          { key: TABS.CURRENT, label: t('Current Orders') },
          { key: TABS.DELIVERED, label: t('Delivered Orders') },
          { key: TABS.FAILED, label: t('Returned / Failed') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 font-bold text-lg whitespace-nowrap border-b-4 transition ${
              activeTab === tab.key
                ? 'border-mainColor text-mainColor'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === TABS.CURRENT && <CurrentOrdersTab deliveryManId={id} />}
        {activeTab === TABS.DELIVERED && <DeliveredOrdersTab deliveryManId={id} />}
        {activeTab === TABS.FAILED && <FailedOrdersTab deliveryManId={id} />}
      </div>
    </div>
  );
};

export default DeliveryManOrdersParent;