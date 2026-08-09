import { useEffect, useState, useRef } from "react";
import { LoaderLogin, SearchBar } from "../../../../../Components/Components";
import { BiSolidShow } from "react-icons/bi";
import { Link } from "react-router-dom";
import { FaFileInvoice, FaWhatsapp, FaRegCopy } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../../Context/Auth";
import { useGet } from "../../../../../Hooks/useGet";
import { useSelector } from "react-redux";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const FailedOrdersPage = () => {
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const route = role === "branch" ? "/branch/orders" : "/dashboard/orders";

  const [textSearch, setTextSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const filteredOrdersPerPage = 20;

  const filterActive = useSelector(state => state.filterActive?.active || false);
  const reduxOrdersData = useSelector(state => state.ordersFailed.data || []);

  const { data: dataOrders, loading, error } = useGet({
    url: `${apiUrl}/admin/order/my_orders`,
    params: {
      order_status: 'faild_to_deliver',
      page: currentPage,
      per_page: filteredOrdersPerPage
    },
    staleTime: 0,
    gcTime: 0
  });

  const ordersData = (filterActive || error)
    ? (Array.isArray(reduxOrdersData) ? reduxOrdersData : [])
    : (Array.isArray(dataOrders?.orders?.data) ? dataOrders.orders.data : []);

  useEffect(() => {
    setFilteredOrders(ordersData);
  }, [dataOrders, filterActive, reduxOrdersData, error]);

  const totalPages = (filterActive || error) ? 1 : (dataOrders?.orders?.last_page || 1);

  const { t } = useTranslation();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterData = (e) => {
    const text = e.target.value.trim();
    setTextSearch(text);

    if (!ordersData || !Array.isArray(ordersData)) {
      console.error("Invalid orders data:", ordersData);
      return;
    }

    if (text === "") {
      setFilteredOrders(ordersData); 
    } else {
      const filter = ordersData.filter(
        (order) =>
          order.id.toString().startsWith(text) || 
          (order.user?.name || "-")
            .toLowerCase()
            .includes(text.toLowerCase()) ||
          (order.user?.phone || "-")
            .toLowerCase()
            .includes(text.toLowerCase())
      );
      setFilteredOrders(filter); 
    }
  };

  const handleCopy = (phone) => {
    if (!phone) return;
    navigator.clipboard
      .writeText(phone)
      .then(() => {
        auth.toastSuccess("Phone number copied!");
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const tableContainerRef = useRef(null);
  const tableRef = useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (tableRef.current && tableContainerRef.current) {
        const tableWidth = tableRef.current.scrollWidth;
        const containerWidth = tableContainerRef.current.clientWidth;
        const hasScroll = tableWidth > containerWidth;
        setShowScrollHint(hasScroll);
      }
    };

    checkScroll();
    const timeoutId = setTimeout(checkScroll, 500);
    const resizeObserver = new ResizeObserver(checkScroll);

    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [filteredOrders, currentPage]);

  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = 300;
      tableContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const headers = [
    t("sl"),               
    t("orderId"),          
    t("deliveryDate"),     
    t("customerInfo"),     
    t("branch"),           
    t("totalPrice"),       
    t("paymentMethod"),    
    t("orderStatus"),      
    t("operationsStatus"), 
    t("operationsAdmin"),  
    t("orderType"),        
    t("actions"),          
  ];

  return (
    <>
      <div className="flex flex-col w-full gap-y-3">
        <div className="sm:w-full lg:w-[70%] xl:w-[30%] mt-4">
          <SearchBar
            placeholder={t("Search by Order ID, User Name,Phone")}
            value={textSearch}
            handleChange={handleFilterData}
          />
        </div>

        {showScrollHint && (
          <div className="sticky top-0 z-10 flex items-center justify-between py-2 mb-2 bg-white shadow-sm">
            <button
              onClick={() => scrollTable('left')}
              className="p-2 transition bg-gray-100 rounded-full hover:bg-gray-200"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {filteredOrders.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-4">
                {currentPage > 1 && (
                  <button type='button' className='px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium' onClick={() => setCurrentPage(currentPage - 1)}>{t("Prev")}</button>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page ? 'bg-mainColor text-white' : ' text-mainColor'}`}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > currentPage && (
                  <button type='button' className='px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium' onClick={() => setCurrentPage(currentPage + 1)}>{t("Next")}</button>
                )}
              </div>
            )}

            <button
              onClick={() => scrollTable('right')}
              className="p-2 transition bg-gray-100 rounded-full hover:bg-gray-200"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <div
          className="relative w-full overflow-x-auto pb-28"
          ref={tableContainerRef}
        >
          {loading ? (
            <LoaderLogin />
          ) : (
            <>
              <table className="w-full min-w-[1200px]" ref={tableRef}>
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b-2">
                    {headers.map((name, index) => (
                      <th
                        key={index}
                        className="px-4 py-2 min-w-[120px] text-mainColor text-center font-TextFontSemiBold text-sm lg:text-base whitespace-nowrap"
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headers.length}
                        className="py-4 text-lg text-center text-mainColor font-TextFontMedium"
                      >
                        {t("Noordersfound")}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 text-sm text-center text-thirdColor lg:text-base">
                          {(currentPage - 1) * filteredOrdersPerPage + index + 1}
                        </td>

                        <td className="px-4 py-2 text-sm text-center text-thirdColor lg:text-base">
                          <Link
                            to={`${route}/details/${order.id}`}
                            className="text-xl underline transition duration-200 ease-in-out text-secoundColor hover:text-mainColor font-TextFontMedium"
                          >
                            {order.id}
                          </Link>
                        </td>

                        <td className="px-4 py-2 text-sm text-center text-thirdColor lg:text-base">
                          {order?.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )
                            : "-"}
                        </td>

                        <td className="px-4 py-2 text-sm text-center text-thirdColor lg:text-base">
                          <div>{`${order.user?.f_name || "N/A"} ${order.user?.l_name || "-"}`}</div>
                          <div className="flex items-center justify-center gap-2">
                            {order.user?.phone ? (
                              <>
                                <FaWhatsapp className="w-5 h-5 text-green-600" />
                                <a
                                  href={`https://wa.me/${order.user.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-black transition duration-200 hover:text-green-600"
                                >
                                  {order.user.phone}
                                </a>
                                <FaRegCopy
                                  className="w-4 h-4 cursor-pointer text-gray-600 hover:text-blue-500"
                                  onClick={() => handleCopy(order.user.phone)}
                                  title="Copy number"
                                />
                              </>
                            ) : (
                              <span>{t("NoPhone")}</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-2 text-sm text-center lg:text-base">
                          <span className="px-2 py-1 rounded-md text-cyan-500 bg-cyan-200">
                            {order.branch?.name || "-"} / {order.address?.zone.zone || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-2 text-sm text-center text-thirdColor lg:text-base">
                          {order?.amount || 0}
                        </td>

                        <td className="px-4 py-2 text-sm text-center text-thirdColor lg:text-base">
                          {order?.payment_method?.name || 0}
                        </td>

                        <td className="px-4 py-2 text-center">
                          <span
                            className={`rounded-md px-2 py-1 text-sm ${order?.order_status === "pending"
                              ? "bg-amber-200 text-amber-500"
                              : order?.order_status === "confirmed"
                                ? "bg-green-200 text-green-500"
                                : order?.order_status === "canceled"
                                  ? "bg-red-200 text-red-500"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                          >
                            {
                              order?.order_status === "processing" ? "Accepted" :
                                order?.order_status === "confirmed" ? t("Processing") :
                                  order?.order_status || "-"
                            }                          </span>
                        </td>

                        <td className="px-4 py-2 text-sm text-center text-thirdColor lg:text-base">
                          {order.operation_status || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-thirdColor lg:text-base">
                          {order.admin?.name || "-"}
                        </td>

                        <td className="px-4 py-2 text-center">
                          <span
                            className={`rounded-md px-2 py-1 text-sm ${order?.order_type === "delivery"
                              ? "bg-green-300 text-green-500"
                              : order?.order_type === "pickup"
                                ? "bg-blue-300 text-blue-500"
                                : "bg-gray-200 text-gray-500"
                              }`}
                          >
                            {order?.order_type || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`${route}/details/${order.id}`}
                              aria-label="View Details"
                              className="p-2 border-2 rounded-md border-mainColor "
                            >
                              <BiSolidShow className="text-xl text-mainColor" />
                            </Link>
                            <Link
                              to={`${route}/invoice/${order.id}`}
                              aria-label="View Invoice"
                              className="p-2 border-2 border-green-400 rounded-md "
                            >
                              <FaFileInvoice className="text-xl text-green-400" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FailedOrdersPage;