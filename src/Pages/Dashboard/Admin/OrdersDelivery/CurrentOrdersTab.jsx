// tabs/CurrentOrdersTab.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGet } from '../../../../Hooks/useGet';
import { usePost } from '../../../../Hooks/usePostJson';
import OrdersTable from '../../../../Components/AnotherComponents/OrdersTable';
import { StaticLoader } from '../../../../Components/Components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../Context/Auth';

const CurrentOrdersTab = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Filters
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);

  // Selection
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [cashierId, setCashierId] = useState('');
  const [cashierManId, setCashierManId] = useState('');
  const [financialAccountId, setFinancialAccountId] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // APIs
  const getUrl = `${apiUrl}/admin/delivery_balance/current_orders`;
  const filterUrl = `${apiUrl}/admin/delivery_balance/filter_current_orders`;
  const getDeliveryUrl = `${apiUrl}/admin/delivery_balance/lists`;
  const payUrl = `${apiUrl}/admin/delivery_balance/pay_orders`;

  const { data: normalData, loading: loadingNormal, refetch } = useGet({ url: getUrl });
  const { data: deliveryData, loading: loadingDeliveryList } = useGet({ url: getDeliveryUrl });
  const { postData: postFilter, loading: loadingFilter, response: filterResponse } = usePost({ url: filterUrl });
  const { postData: payOrders, loading: paying } = usePost({ url: payUrl });

  // Data
  const branches = deliveryData?.branches || [];
  const cashiers = deliveryData?.cashiers || [];
  const cashierMen = deliveryData?.cashier_men || [];
  const financialAccounts = deliveryData?.financial_accounting || [];
  const deliveries = deliveryData?.deliveries || [];

  // react-select options
  const deliveryOptions = deliveries.map(del => ({
    value: del.id,
    label: `${del.name} (${del.phone})`
  }));

  // Auto filter
  useEffect(() => {
    const deliveryId = selectedDeliveryOption?.value || '';
    if (deliveryId) {
      postFilter({ delivery_id: deliveryId });
    }
  }, [selectedDeliveryOption]);

  const hasFilter = !!selectedDeliveryOption;
  const responseData = hasFilter ? filterResponse?.data : normalData;
  const loading = loadingNormal || loadingFilter || loadingDeliveryList;

  const orders = responseData?.total_orders || [];
  const totalAmount = responseData?.total_amount || 0;
  const onTheWayAmount = responseData?.on_the_way_amount || 0;
  const cashOnHandAmount = responseData?.cash_on_hand_amount || 0;

  // Selection Logic
  const allSelected = orders.length > 0 && selectedOrderIds.length === orders.length;
  const someSelected = selectedOrderIds.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map(o => o.id));
    }
  };

  const handleSelectOrder = (id) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // CORRECTED: Filter cashiers by branch
  const filteredCashiers = branchId
    ? cashiers.filter(c => c.branch_id === Number(branchId))
    : [];

  // CORRECTED: Filter cashier men by BRANCH (not by cashier)
  const filteredCashierMen = branchId
    ? cashierMen.filter(cm => cm.branch_id === Number(branchId))
    : [];

  const selectedFinancialAccount = financialAccounts.find(fa => fa.id === Number(financialAccountId));
  const needsDescription = selectedFinancialAccount?.description_status === 1;

  const handlePay = async () => {
    if (!branchId || !cashierId || !cashierManId || !financialAccountId) {
      auth.toastError(t('Please fill all required fields'));
      return;
    }
    if (needsDescription && (!lastFourDigits || !transactionId)) {
      auth.toastError(t('Last 4 digits and Transaction ID are required'));
      return;
    }

    try {
      await payOrders({
        order_ids: selectedOrderIds,
        branch_id: branchId,
        cashier_id: cashierId,
        cashier_man_id: cashierManId,
        financial_id: financialAccountId,
        ...(needsDescription && {
          description: lastFourDigits,
          transition_id: transactionId,
        }),
      });

      auth.toastSuccess(t('Payment recorded successfully!'));
      setShowPayModal(false);
      setSelectedOrderIds([]);
      refetch();
      setBranchId(''); setCashierId(''); setCashierManId(''); setFinancialAccountId('');
      setLastFourDigits(''); setTransactionId('');
    } catch (err) {
      auth.toastError(err?.response?.data?.message || t('Payment failed'));
    }
  };

  // Unified react-select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '56px',
      borderRadius: '12px',
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': { borderColor: '#9CA3AF' },
      fontSize: '16px',
      backgroundColor: state.isDisabled ? '#F9FAFB' : 'white',
    }),
    placeholder: (base) => ({ ...base, color: '#9CA3AF', fontSize: '16px' }),
    singleValue: (base) => ({ ...base, color: '#1F2937', fontSize: '16px' }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      marginTop: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EFF6FF' : 'white',
      color: state.isSelected ? 'white' : '#1F2937',
      padding: '12px 16px',
      fontSize: '16px',
    }),
  };

  return (
    <div className="pb-16">

      {/* Delivery Filter */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-80 ">
            <label className="block text-lg font-medium mb-3 text-gray-700">
              {t('Select Delivery')}
            </label>
            <Select
              value={selectedDeliveryOption}
              onChange={setSelectedDeliveryOption}
              options={deliveryOptions}
              placeholder={t('All Delivery Men')}
              isClearable
              isSearchable
              isLoading={loadingDeliveryList}
              styles={selectStyles}
              classNamePrefix="react-select"
              noOptionsMessage={() => t('No delivery men found')}
            />
          </div>
          {hasFilter && (
            <button
              onClick={() => setSelectedDeliveryOption(null)}
              className="px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
            >
              {t('Clear Filter')}
            </button>
          )}
        </div>
      </div>

      {/* Selected Orders Pay Button */}
      {someSelected && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <span className="font-semibold text-blue-800">
              {selectedOrderIds.length} {t('orders selected')}
            </span>
            <span className="font-bold text-mainColor bg-white px-3 py-1 rounded-lg shadow-sm border border-blue-100">
              {t("Total")}: {orders.filter(o => selectedOrderIds.includes(o.id)).reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0).toFixed(2)} EGP
            </span>
          </div>
          <button
            onClick={() => setShowPayModal(true)}
            className="px-8 py-3 bg-mainColor text-white rounded-xl font-bold hover:bg-mainColor/90 transition"
          >
            {t('Collect Payment')}
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">{t('Total Amount')}</h3>
          <p className="text-3xl font-bold mt-2">{totalAmount.toFixed(2)} EGP</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">{t('On The Way')}</h3>
          <p className="text-3xl font-bold mt-2">{onTheWayAmount.toFixed(2)} EGP</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium opacity-90">{t('Cash On Hand')}</h3>
          <p className="text-3xl font-bold mt-2">{cashOnHandAmount.toFixed(2)} EGP</p>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-20"><StaticLoader /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
          <p className="text-2xl font-bold text-green-800">{t('No orders found')}</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-thirdColor mb-4">
            {t('Current Orders')} ({orders.length})
          </h2>
          <OrdersTable
            orders={orders}
            showCheckbox={true}
            selectedOrders={selectedOrderIds}
            onSelectOrder={handleSelectOrder}
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
          />
        </>
      )}

      {/* Pay Modal - FULLY CORRECTED */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto p-4 md:p-8">
            <h2 className="text-2xl font-bold text-thirdColor mb-6">{t('Pay Selected Orders')}</h2>

            <div className="space-y-6">

              {/* Branch */}
              <div>
                <label className="block text-lg font-medium mb-3 text-gray-700">{t('Branch')}</label>
                <Select
                  value={branchId ? { value: branchId, label: branches.find(b => b.id === Number(branchId))?.name } : null}
                  onChange={(opt) => {
                    setBranchId(opt ? opt.value : '');
                    setCashierId('');
                    setCashierManId('');
                  }}
                  options={branches.map(b => ({ value: b.id, label: b.name }))}
                  placeholder={t('Select Branch')}
                  isClearable
                  isSearchable
                  styles={selectStyles}
                  classNamePrefix="react-select"
                />
              </div>

              {/* Cashier */}
              <div>
                <label className="block text-lg font-medium mb-3 text-gray-700">{t('Cashier')}</label>
                <Select
                  value={cashierId ? { value: cashierId, label: filteredCashiers.find(c => c.id === Number(cashierId))?.name } : null}
                  onChange={(opt) => {
                    setCashierId(opt ? opt.value : '');
                  }}
                  options={filteredCashiers.map(c => ({ value: c.id, label: c.name }))}
                  placeholder={t('Select Cashier')}
                  isDisabled={!branchId}
                  isClearable
                  isSearchable
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  noOptionsMessage={() => t('No cashiers in this branch')}
                />
              </div>

              {/* Cashier Man - NOW WORKS CORRECTLY */}
              <div>
                <label className="block text-lg font-medium mb-3 text-gray-700">{t('Cashier Man')}</label>
                <Select
                  value={cashierManId ? {
                    value: cashierManId,
                    label: filteredCashierMen.find(cm => cm.id === Number(cashierManId))?.user_name || ''
                  } : null}
                  onChange={(opt) => setCashierManId(opt ? opt.value : '')}
                  options={filteredCashierMen.map(cm => ({ value: cm.id, label: cm.user_name }))}
                  placeholder={t('Select Cashier Man')}
                  isDisabled={!branchId}
                  isClearable
                  isSearchable
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  noOptionsMessage={() => t('No cashier men in this branch')}
                />
              </div>

              {/* Financial Account */}
              <div>
                <label className="block text-lg font-medium mb-3 text-gray-700">{t('Financial Account')}</label>
                <Select
                  value={financialAccountId ? { value: financialAccountId, label: financialAccounts.find(fa => fa.id === Number(financialAccountId))?.name } : null}
                  onChange={(opt) => {
                    setFinancialAccountId(opt ? opt.value : '');
                    setLastFourDigits('');
                    setTransactionId('');
                  }}
                  options={financialAccounts.map(fa => ({ value: fa.id, label: fa.name }))}
                  placeholder={t('Select Account')}
                  isClearable
                  isSearchable
                  styles={selectStyles}
                  classNamePrefix="react-select"
                />
              </div>

              {/* Extra Fields */}
              {needsDescription && (
                <>
                  <div>
                    <label className="block text-lg font-medium mb-3">{t('Last 4 Digits')}</label>
                    <input
                      type="text"
                      maxLength="4"
                      value={lastFourDigits}
                      onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor outline-none transition"
                      placeholder="1234"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium mb-3">{t('Transaction ID')}</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor outline-none transition"
                      placeholder="Enter transaction ID"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-4 bg-gray-300 text-gray-800 rounded-xl font-bold hover:bg-gray-400 transition"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 py-4 bg-mainColor text-white rounded-xl font-bold hover:bg-mainColor/90 disabled:opacity-70 transition"
              >
                {paying ? t('Processing...') : t('Confirm Payment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentOrdersTab;