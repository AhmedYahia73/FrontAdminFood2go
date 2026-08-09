// tabs/AllOrdersDeliveryTab.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGet } from '../../../../Hooks/useGet';
import { usePost } from '../../../../Hooks/usePostJson';
import OrdersTable from '../../../../Components/AnotherComponents/OrdersTable';
import { StaticLoader, DateInput } from '../../../../Components/Components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../Context/Auth';

const AllOrdersDeliveryTab = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fromDate, setFromDate] = useState(getCurrentDate());
  const [toDate, setToDate] = useState(getCurrentDate());
  const [currentPage, setCurrentPage] = useState(1);

  // ---------- APIs ----------
  // Updated URL to include query parameters for filtering and pagination
  const getUrl = `${apiUrl}/admin/delivery/single_page/orders?from=${fromDate}&to=${toDate}&page=${currentPage}`;
  const getDeliveryUrl = `${apiUrl}/admin/delivery_balance/lists`;
  const assignUrl = `${apiUrl}/admin/delivery/single_page/orders_delivery`;

  const { refetch: refetchNormalData, data: normalData, loading: loadingNormal } = useGet({ url: getUrl });
  const { data: deliveryData, loading: loadingDelivery } = useGet({ url: getDeliveryUrl });
  const { postData: assignOrders, loading: assigning, response } = usePost({ url: assignUrl });

  const loading = loadingNormal || loadingDelivery;

  // ---------- Selection ----------
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null); // react-select value

  // Data path updated to handle the new paginated response structure
  const allOrders = normalData?.data || [];
  const totalPages = normalData?.last_page || 1;

  const deliveries = deliveryData?.deliveries || [];

  const allSelected = allOrders.length > 0 && selectedOrderIds.length === allOrders.length;
  const someSelected = selectedOrderIds.length > 0;

  // Reset page when dates change
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

  // ---------- react-select options ----------
  const deliveryOptions = deliveries.map(del => ({
    value: del.id,
    label: `${del.name} (${del.phone})`
  }));

  // ---------- Handlers ----------
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(allOrders.map(o => o.id));
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedOrderIds([]); // Clear selection when changing page
    }
  };

  const handleAssign = async () => {
    if (!selectedDeliveryOption) {
      auth.toastError(t('Please select a delivery man'));
      return;
    }
    if (selectedOrderIds.length === 0) {
      auth.toastError(t('Please select at least one order'));
      return;
    }

    try {
      await assignOrders({
        'order_ids[]': selectedOrderIds,
        delivery_id: selectedDeliveryOption.value,
      });
    } catch (err) {
      auth.toastError(err?.response?.data?.message || t('Something went wrong'));
    }
  };

  // Success feedback
  useEffect(() => {
    if (response && response.status === 200 && !assigning) {
      auth.toastSuccess(t('Orders assigned successfully!'));
      refetchNormalData();
      setSelectedOrderIds([]);
      setSelectedDeliveryOption(null); // Clear react-select
    }
  }, [response, assigning, refetchNormalData, auth, t]);

  // ---------- Custom Styles for react-select ----------
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '48px',
      borderRadius: '12px',
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': { borderColor: '#9CA3AF' },
      fontSize: '16px',
      paddingLeft: '8px',
      backgroundColor: assigning ? '#F3F4F6' : 'white',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9CA3AF',
      fontSize: '16px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1F2937',
      fontSize: '16px',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      marginTop: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#3B82F6'
        : state.isFocused
          ? '#EFF6FF'
          : 'white',
      color: state.isSelected ? 'white' : '#1F2937',
      padding: '12px 16px',
      fontSize: '16px',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6B7280',
    }),
  };

  // ---------- Render ----------
  return (
    <div className="pb-16">

      {/* Date Filters */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInput
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder={t("From Date")}
          />
          <DateInput
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder={t("To Date")}
          />
        </div>
      </div>

      {/* Assignment Bar - Only show when orders exist */}
      {allOrders.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

            {/* Left: Selected Count + Delivery Select */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full xl:w-auto">

              {/* Selected Count */}
              <span className="text-base sm:text-lg font-medium text-gray-800 whitespace-nowrap">
                {t('Selected')}: <strong className="font-bold">{selectedOrderIds.length}</strong> {t('orders')}
              </span>

              {/* react-select - Fully responsive & searchable */}
              <div className="w-full md:w-80 min-w-0">
                <Select
                  value={selectedDeliveryOption}
                  onChange={setSelectedDeliveryOption}
                  options={deliveryOptions}
                  placeholder={t('Choose Delivery Man')}
                  isDisabled={assigning}
                  isLoading={loadingDelivery}
                  isSearchable={true}
                  styles={customStyles}
                  className="text-base sm:text-lg"
                  classNamePrefix="react-select"
                  noOptionsMessage={() => t('No delivery men found')}
                />
              </div>
            </div>

            {/* Assign Button */}
            <button
              onClick={handleAssign}
              disabled={assigning || !someSelected || !selectedDeliveryOption}
              className={`w-full xl:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all whitespace-nowrap
                ${(someSelected && selectedDeliveryOption && !assigning)
                  ? 'bg-mainColor text-white hover:bg-mainColor/90 shadow-md active:scale-98'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
            >
              {assigning ? t('Assigning…') : t('Assign Selected Orders')}
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <StaticLoader />
        </div>
      ) : allOrders.length === 0 ? (
        <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
          <p className="text-2xl font-bold text-green-800">{t('All payments collected!')}</p>
          <p className="text-green-600 mt-2">{t('No orders')}</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-thirdColor mb-4">
            {t('Orders')} ({allOrders.length})
          </h2>

          <OrdersTable
            orders={allOrders}
            showCheckbox={true}
            selectedOrders={selectedOrderIds}
            onSelectOrder={handleSelectOrder}
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
          />

          {/* Server-side Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm text-gray-600 font-medium"
              >
                {t("<")}
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl border font-semibold transition-all shadow-sm ${currentPage === pageNum
                        ? 'bg-mainColor text-white border-mainColor'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm text-gray-600 font-medium"
              >
                {t(">")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllOrdersDeliveryTab;