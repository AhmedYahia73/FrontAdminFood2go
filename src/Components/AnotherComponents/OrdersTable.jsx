// Components/AnotherComponents/OrdersTable.jsx
import React from "react";
import { useTranslation } from "react-i18next";

const OrdersTable = ({
  orders,
  showCheckbox = false,
  selectedOrders = [],
  onSelectOrder,
  onSelectAll,
  allSelected = false,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  if (!orders || orders.length === 0) {
    return (
      <p className="py-10 text-xl text-center text-gray-500">
        {t("No orders found")}
      </p>
    );
  }

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
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
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50">
            <tr>
              {showCheckbox && (
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="w-5 h-5 rounded text-mainColor focus:ring-mainColor"
                  />
                </th>
              )}
              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Order ID")}
              </th>

              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Order Number")}
              </th>

              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Customer")}
              </th>

              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Phone")}
              </th>

              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Address")}
              </th>

              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Amount")}
              </th>

              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Date")}
              </th>

              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Time")}
              </th>

              <th
                className={`px-6 py-4 text-sm font-bold ${lang === "ar" ? "text-right" : "text-left"
                  } text-thirdColor`}
              >
                {t("Branch")}
              </th>

            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                {showCheckbox && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => onSelectOrder(order.id)}
                      className="w-5 h-5 rounded text-mainColor focus:ring-mainColor"
                    />
                  </td>
                )}
                <td className="px-6 py-4 font-medium">{order.id}</td>
                <td className="px-6 py-4 font-mono text-mainColor">
                  {order.order_number}
                </td>
                <td className="px-6 py-4">{order.user?.name || "-"}</td>
                <td className="px-6 py-4">{order.user?.phone || "-"}</td>
                <td
                  className="max-w-xs px-6 py-4 truncate"
                  title={order.address?.address}
                >
                  {order.address?.address || "-"}
                </td>
                <td className="px-6 py-4 font-semibold">{order.amount} EGP</td>
                <td className="px-6 py-4">{order.date}</td>
                <td className="px-6 py-4">{order.time}</td>
                <td className="px-6 py-4">{order.branch}</td>
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
  );
};

export default OrdersTable;
