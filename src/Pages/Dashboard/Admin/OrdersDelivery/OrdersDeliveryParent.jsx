// DeliveryManOrdersParent.jsx
import React, { useState } from 'react';
import AllOrdersDeliveryTab from './AllOrdersDeliveryTab';
import CurrentOrdersTab from './CurrentOrdersTab';
import FailedOrdersTab from './FailedOrdersTab';
import { useTranslation } from 'react-i18next';
import HistoryOrdersTab from './HistoryOrdersTab';

const TABS = {
  ALL: 'all',
  CURRENT: 'current',
  FAILED: 'failed',
  History: 'history'
};

const OrdersDeliveryParent = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(TABS.ALL);

  return (
    <div className="p-2 pb-32 md:p-6">
      <h1 className="mb-6 text-xl font-bold md:text-xl text-thirdColor">
        {t('All Orders Delivery')}
      </h1>

      {/* Tabs - Always visible */}
      <div className="flex mb-6 overflow-x-auto border-b">
        {[
          { key: TABS.ALL, label: t('All Orders') },
          { key: TABS.CURRENT, label: t('Current Orders') },
          { key: TABS.FAILED, label: t('Returned / Failed') },
          { key: TABS.History, label: t('History') }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 font-bold text-lg whitespace-nowrap border-b-4 transition ${activeTab === tab.key
              ? 'border-mainColor text-mainColor'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === TABS.ALL && <AllOrdersDeliveryTab />}
        {activeTab === TABS.CURRENT && <CurrentOrdersTab />}
        {activeTab === TABS.FAILED && <FailedOrdersTab />}
        {activeTab === TABS.History && <HistoryOrdersTab />}
      </div>
    </div>
  );
};

export default OrdersDeliveryParent;