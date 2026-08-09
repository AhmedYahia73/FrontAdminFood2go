import React, { useEffect, useState } from "react";
import { usePost } from "../../../../../Hooks/usePostJson";
import { DateInput } from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { Link } from "react-router-dom";
import { FaFileExcel, FaFilePdf, FaSearch } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from "../../../../../Context/Auth";
const OrdersReports = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/admin/reports/orders_report` });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({
    url: `${apiUrl}/admin/reports/lists_report`
  });
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const route = role === "branch" ? "/branch/orders" : "/dashboard/orders";

  const [cashierMans, setCashierMans] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [financialAccounts, setFinancialAccounts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCashierId, setSelectedCashierId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedCashierManId, setSelectedCashierManId] = useState(null);
  const [selectedFinancialId, setSelectedFinancialId] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const [orderDetails, setOrderDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20;

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    const customerName = `${order.user?.f_name || ''} ${order.user?.l_name || ''}`.toLowerCase();
    const phone = order.user?.phone || '';
    const branchName = order.branch?.name?.toLowerCase() || '';
    const orderNumber = order.order_number?.toString()?.toLowerCase() || '';
    const orderType = order.order_type?.toLowerCase() || '';
    const status = order.order_status?.toLowerCase() || '';
    const date = order.created_at ? new Date(order.created_at).toLocaleDateString().toLowerCase() : '';
    const amount = order.amount?.toString() || '';

    return (
      customerName.includes(query) ||
      phone.includes(query) ||
      branchName.includes(query) ||
      orderNumber.includes(query) ||
      orderType.includes(query) ||
      status.includes(query) ||
      date.includes(query) ||
      amount.includes(query)
    );
  });

  // Calculate total number of pages
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Get the orders for the current page
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination numbers with ellipsis
  const getPaginationNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
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
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  useEffect(() => {
    refetchList();
  }, [refetchList]);

  useEffect(() => {
    if (dataList) {
      setCashierMans(dataList.cashier_man || []);
      setCashiers(dataList.cashier || []);
      setBranches(dataList.branches || []);
      setFinancialAccounts(dataList.financial_account || []);
    }
  }, [dataList]);

  useEffect(() => {
    if (response && !loadingPost) {
      setOrders(response.data?.orders || []);
    }
  }, [response]);

  // Prepare options for React Select with "All" option
  const prepareOptions = (data, labelKey = 'name') => {
    const options = data.map(item => ({
      value: item.id,
      label: item[labelKey] || item.user_name || `ID: ${item.id}`
    }));

    // Add "All" option at the beginning
    return [{ value: 'all', label: 'All' }, ...options];
  };

  const cashierManOptions = prepareOptions(cashierMans, 'user_name');
  const cashierOptions = prepareOptions(cashiers);
  const branchOptions = prepareOptions(branches);
  const financialOptions = prepareOptions(financialAccounts);

  const handleGenerateReport = () => {

    const formData = new FormData();

    if (!fromDate) {
      auth.toastError(t("Please enter start date."));
      return;
    }

    if (fromDate) {
      formData.append("from", fromDate);
    }

    if (toDate) {
      formData.append("to", toDate);
    }

    // Only append filter values if they are selected and not "All"
    if (selectedCashierId && selectedCashierId !== 'all') {
      formData.append("cashier_id", selectedCashierId);
    }

    if (selectedBranchId && selectedBranchId !== 'all') {
      formData.append("branch_id", selectedBranchId);
    }

    if (selectedCashierManId && selectedCashierManId !== 'all') {
      formData.append("cashier_man_id", selectedCashierManId);
    }

    if (selectedFinancialId && selectedFinancialId !== 'all') {
      formData.append("financial_id", selectedFinancialId);
    }

    postData(formData);
    setIsModalOpen(false);
  };

  const handleResetFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedCashierId(null);
    setSelectedBranchId(null);
    setSelectedCashierManId(null);
    setSelectedFinancialId(null);
    setOrders([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getUserName = (user) => {
    if (!user) return "N/A";
    if (user.f_name || user.l_name) {
      return `${user.f_name || ''} ${user.l_name || ''}`.trim();
    }
    return "N/A";
  };

  // Export Logic
  const getFilterText = () => {
    let text = `${t("Date Range")}: ${fromDate || 'N/A'} - ${toDate || 'N/A'}`;
    if (selectedBranchId && selectedBranchId !== 'all') {
      const branchName = branches.find(b => b.id === selectedBranchId)?.name;
      if (branchName) text += ` | ${t("Branch")}: ${branchName}`;
    }
    return text;
  };

  const handlePrintPdf = () => {
    if (filteredOrders.length === 0) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.text(t("Orders Report"), 14, 22);

    doc.setFontSize(10);
    doc.text(getFilterText(), 14, 30);
    if (searchQuery) {
      doc.text(`${t("Search Query")}: ${searchQuery}`, 14, 36);
    }

    const tableData = filteredOrders.map((order, index) => [
      index + 1,
      order.order_number,
      getUserName(order.user),
      order.branch?.name || "N/A",
      order.order_type,
      `${order.amount} EGP`,
      order.delivery_fees,
      order.order_status,
      new Date(order.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: searchQuery ? 40 : 36,
      head: [[
        "#",
        t("Order Number"),
        t("Customer"),
        t("Branch"),
        t("Type"),
        t("Amount"),
        t("Delivery Fees"),
        t("Status"),
        t("Date")
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`Orders_Report_${date.replace(/\//g, '-')}.pdf`);
  };

  const handleExportExcel = () => {
    if (filteredOrders.length === 0) return;
    const date = new Date().toLocaleDateString();

    const data = filteredOrders.map((order, index) => ({
      "#": index + 1,
      [t("Order Number")]: order.order_number,
      [t("Customer")]: getUserName(order.user),
      [t("Customer Phone")]: order.user?.phone || "",
      [t("Branch")]: order.branch?.name || "N/A",
      [t("Order Type")]: order.order_type,
      [t("Amount")]: order.amount,
      [t("Delivery Fees")]: order.delivery_fees,
      [t("Currency")]: "EGP",
      [t("Status")]: order.order_status,
      [t("Date")]: new Date(order.created_at).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Report");
    XLSX.writeFile(workbook, `Orders_Report_${date.replace(/\//g, '-')}.xlsx`);
  };


  const handleViewOrderDetails = (orderId) => {
    const order = orders.find(order => order.id === orderId);
    setOrderDetails(order);
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
    setOrderDetails(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getOrderTypeBadge = (orderType) => {
    const typeConfig = {
      take_away: { color: 'bg-purple-100 text-purple-800', label: 'Take Away' },
      delivery: { color: 'bg-indigo-100 text-indigo-800', label: 'Delivery' },
      dine_in: { color: 'bg-pink-100 text-pink-800', label: 'Dine In' }
    };

    const config = typeConfig[orderType] || { color: 'bg-gray-100 text-gray-800', label: orderType };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="w-full p-4 mb-20 md:p-6">
      <h1 className="mb-4 text-2xl font-bold text-mainColor">{t("Orders Report")}</h1>

      {/* Filters Section */}
      <div className="p-4 mb-6 rounded-lg bg-gray-50">
        <h2 className="mb-4 text-lg font-semibold text-mainColor">{t("Filters")}</h2>

        <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Date Filters */}
          <div className="grid grid-cols-1 col-span-1 gap-4 md:col-span-2 lg:col-span-3 md:grid-cols-2">
            <DateInput
              placeholder="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required={true}
              maxDate={toDate}
              borderColor="mainColor"
              className="w-full"
            />
            <DateInput
              placeholder="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required={true}
              minDate={fromDate}
              borderColor="mainColor"
              className="w-full"
            />
          </div>

          {/* Cashier Filter */}
          <div className="flex flex-col items-start justify-center w-full gap-y-1">
            <span className="text-sm font-TextFontRegular text-thirdColor">
              {t("Cashier")}:
            </span>
            <Select
              value={cashierOptions.find(option => option.value === selectedCashierId)}
              onChange={(selectedOption) => setSelectedCashierId(selectedOption?.value || null)}
              options={cashierOptions}
              placeholder={t("Select Cashier")}
              isClearable
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#d1d5db',
                  borderRadius: '0.375rem',
                  padding: '2px 4px',
                  backgroundColor: 'white'
                })
              }}
            />
          </div>

          {/* Branch Filter */}
          <div className="flex flex-col items-start justify-center w-full gap-y-1">
            <span className="text-sm font-TextFontRegular text-thirdColor">
              {t("Branch")}:
            </span>
            <Select
              value={branchOptions.find(option => option.value === selectedBranchId)}
              onChange={(selectedOption) => setSelectedBranchId(selectedOption?.value || null)}
              options={branchOptions}
              placeholder={t("Select Branch")}
              isClearable
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#d1d5db',
                  borderRadius: '0.375rem',
                  padding: '2px 4px',
                  backgroundColor: 'white'
                })
              }}
            />
          </div>

          {/* Cashier Man Filter */}
          <div className="flex flex-col items-start justify-center w-full gap-y-1">
            <span className="text-sm font-TextFontRegular text-thirdColor">
              {t("Cashier Man")}:
            </span>
            <Select
              value={cashierManOptions.find(option => option.value === selectedCashierManId)}
              onChange={(selectedOption) => setSelectedCashierManId(selectedOption?.value || null)}
              options={cashierManOptions}
              placeholder={t("Select Cashier Man")}
              isClearable
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#d1d5db',
                  borderRadius: '0.375rem',
                  padding: '2px 4px',
                  backgroundColor: 'white'
                })
              }}
            />
          </div>

          {/* Financial Account Filter */}
          <div className="flex flex-col items-start justify-center w-full gap-y-1">
            <span className="text-sm font-TextFontRegular text-thirdColor">
              {t("Financial Account")}:
            </span>
            <Select
              value={financialOptions.find(option => option.value === selectedFinancialId)}
              onChange={(selectedOption) => setSelectedFinancialId(selectedOption?.value || null)}
              options={financialOptions}
              placeholder={t("Select Financial Account")}
              isClearable
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: '#d1d5db',
                  borderRadius: '0.375rem',
                  padding: '2px 4px',
                  backgroundColor: 'white'
                })
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateReport}
              className="px-6 py-2.5 font-medium text-white transition-colors duration-200 rounded-xl bg-mainColor hover:bg-opacity-90"
            >
              {t("Generate Report")}
            </button>

            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 font-medium text-white transition-colors duration-200 bg-gray-500 rounded-xl hover:bg-gray-600"
            >
              {t("Reset Filters")}
            </button>
          </div>

          {filteredOrders.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm font-bold"
              >
                <FaFileExcel size={18} />
                {t("Excel")}
              </button>
              <button
                onClick={handlePrintPdf}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm font-bold"
              >
                <FaFilePdf size={18} />
                {t("PDF")}
              </button>
            </div>
          )}
        </div>
      </div>

      {loadingPost && <p className="mt-4 text-center text-gray-500">{t("Loading orders data..")}.</p>}

      {orders && Array.isArray(orders) && orders.length > 0 ? (
        <div className="flex flex-col w-full space-y-4">

          {/* Search Input */}
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search by customer, branch, order number...")}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-mainColor focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="text-white bg-mainColor">
                  <th className="px-4 py-3 border-b">#</th>
                  <th className="px-4 py-3 border-b">{t("Order Number")}</th>
                  <th className="px-4 py-3 border-b">{t("Customer")}</th>
                  <th className="px-4 py-3 border-b">{t("Branch")}</th>
                  <th className="px-4 py-3 border-b">{t("Order Type")}</th>
                  <th className="px-4 py-3 border-b">{t("Amount")}</th>
                  <th className="px-4 py-3 border-b">{t("Delivery Fees")}</th>
                  <th className="px-4 py-3 border-b">{t("Status")}</th>
                  <th className="px-4 py-3 border-b">{t("Date")}</th>
                  <th className="px-4 py-3 border-b">{t("View Details")}</th>
                  <th className="px-4 py-3 border-b">{t("View Order")}</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr key={order.id} className="transition-colors duration-150 hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border-b">{(currentPage - 1) * ordersPerPage + index + 1}</td>
                    <td className="px-4 py-3 font-medium border-b">{order.order_number}</td>
                    <td className="px-4 py-3 border-b">
                      {getUserName(order.user)}
                      {order.user?.phone && (
                        <div className="text-sm text-gray-500">{order.user.phone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 border-b">{order.branch?.name || "N/A"}</td>
                    <td className="px-4 py-3 border-b">{getOrderTypeBadge(order.order_type)}</td>
                    <td className="px-4 py-3 font-semibold text-green-600 border-b">{order.amount} EGP</td>
                    <td className="px-4 py-3 border-b">{order.order_type === "delivery" ? `${order.delivery_fees} EGP` : "_"}</td>
                    <td className="px-4 py-3 border-b">{getStatusBadge(order.order_status)}</td>
                    <td className="px-4 py-3 text-sm border-b">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-center border-b">
                      <button
                        onClick={() => handleViewOrderDetails(order.id)}
                        className="text-sm font-medium transition-colors duration-200 text-mainColor hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center border-b">
                      <Link
                        to={`${route}/details/${order.id}`}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-white transition-colors duration-200 rounded-md bg-mainColor hover:bg-opacity-90"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Professional Pagination - Using filteredOrders length */}
          {filteredOrders.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 mt-6 bg-white border border-gray-200 rounded-lg">
              {/* Page Info */}
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  {t("Showing")}{" "}
                  <span className="font-medium">{(currentPage - 1) * ordersPerPage + 1}</span>
                  {" to "}
                  <span className="font-medium">
                    {Math.min(currentPage * ordersPerPage, filteredOrders.length)}
                  </span>
                  {" of "}
                  <span className="font-medium">{filteredOrders.length}</span>
                  {" results"}
                </span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === 1
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("Previous")}
                </button>

                {/* Page Numbers */}
                {getPaginationNumbers().map((pageNumber, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
                    disabled={pageNumber === '...'}
                    className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md transition-colors duration-200 ${pageNumber === currentPage
                      ? "bg-mainColor text-white"
                      : pageNumber === '...'
                        ? "text-gray-500 cursor-default"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {t("Next")}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : response && orders.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-2 text-lg text-gray-500">{t("No orders found")}</div>
          <p className="text-gray-400">{t("Try adjusting your filters to see more results")}</p>
        </div>
      ) : null}

      {/* Modal for Order Details - Unchanged */}
      {isModalOpen && orderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-mainColor">{t("Order Details")} - #{orderDetails.order_number}</h2>
              <button
                onClick={closeModal}
                className="text-xl font-bold text-gray-500 transition-colors duration-200 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Order Information */}
              <div className="space-y-4">
                <h3 className="pb-2 text-lg font-semibold border-b text-mainColor">{t("Order Information")}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Order Number")}</span>
                    <span>{orderDetails.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Order Date')}</span>
                    <span>{formatDate(orderDetails.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Order Type")}</span>
                    <span>{getOrderTypeBadge(orderDetails.order_type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Status")}:</span>
                    <span>{getStatusBadge(orderDetails.order_status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Operation Status")}</span>
                    <span>{getStatusBadge(orderDetails.operation_status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Source")}</span>
                    <span className="capitalize">{orderDetails.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Amount")}</span>
                    <span className="font-semibold">{orderDetails.amount} {t("EGP")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Points")}</span>
                    <span>{orderDetails.points}</span>
                  </div>
                </div>
              </div>

              {/* Customer & Branch Information */}
              <div className="space-y-4">
                <h3 className="pb-2 text-lg font-semibold border-b text-mainColor">{t("Customer & Branch")}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Customer Name:")}</span>
                    <span>{getUserName(orderDetails.user)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Phone:")}</span>
                    <span>{orderDetails.user?.phone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Branch")}</span>
                    <span>{orderDetails.branch?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Zone")}</span>
                    <span>{orderDetails.address?.zone?.zone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Payment Method")}</span>
                    <span>{orderDetails.payment_method?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Delivery")}</span>
                    <span>{orderDetails.delivery?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t("Schedule")}</span>
                    <span>{orderDetails.schedule?.name || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {orderDetails.rejected_reason && (
              <div className="p-3 mt-4 border border-red-200 rounded bg-red-50">
                <h4 className="font-semibold text-red-800">{t("Rejection Reason")}</h4>
                <p className="text-red-700">{orderDetails.rejected_reason}</p>
              </div>
            )}

            {orderDetails.transaction_id && (
              <div className="p-3 mt-4 border border-blue-200 rounded bg-blue-50">
                <h4 className="font-semibold text-blue-800">{t("Transaction Information")}</h4>
                <p className="text-blue-700">{t('Transaction ID')}: {orderDetails.transaction_id}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersReports;