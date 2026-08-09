import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useGet } from "../../../../../Hooks/useGet";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropDown,
  LoaderLogin,
  SearchBar,
  SubmitButton,
  TextInput,
} from "../../../../../Components/Components";
import { FaClock, FaUser } from "react-icons/fa";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useAuth } from "../../../../../Context/Auth";
import { useDispatch } from "react-redux";
import { removeCanceledOrder, triggerRefresh } from "../../../../../Store/CreateSlices";
import { useSelector } from "react-redux"; // Add this import
import { FaFileInvoice, FaWhatsapp, FaCopy } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import qz from "qz-tray";
import { prepareReceiptData, printReceiptSilently } from "../InvoiceOrder/KitchenInvoiceOrder";

const DetailsOrderPage = () => {
  const StatusRef = useRef(null);
  const auth = useAuth();
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pathOrder = location.pathname;
  const orderNumPath = pathOrder.split("/").pop();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const selectedLanguage = useSelector(state => state.language?.selected ?? 'en'); // Default to 'en' if no language is selected
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const route = role === "branch" ? "/branch/orders" : "/dashboard/orders";

  const {
    refetch: refetchDetailsOrder,
    loading: loadingDetailsOrder,
    data: dataDetailsOrder,
    error: errorDetailsOrder,
  } = useGet({ url: `${apiUrl}/admin/order/order/${orderNumPath}?locale=${selectedLanguage}` });

  // ✅ Delivery endpoint
  const deliveryUrl =
    role === "branch"
      ? `${apiUrl}/branch/online_order/delivery`
      : `${apiUrl}/admin/order/delivery`;

  const { postData, loadingPost, response } = usePost({
    url: deliveryUrl,
  });

  const { postData: transferPostData, loadingPost: transferLoadingPost, response: transferResponse } = usePost({
    url: `${apiUrl}/admin/order/transfer_branch/${orderId}`,
  });

  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const isRtl = locale === 'ar';

  const { changeState, loadingChange, responseChange } = useChangeState();
  const [detailsData, setDetailsData] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesFilter, setDeliveriesFilter] = useState([]);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);

  const [showReason, setShowReason] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [isOpenOrderStatus, setIsOpenOrderStatus] = useState(false);

  const [orderStatusName, setOrderStatusName] = useState("");
  const [searchDelivery, setSearchDelivery] = useState("");

  const [preparationTime, setPreparationTime] = useState({});

  const [orderNumber, setOrderNumber] = useState("");

  const [showStatusModal, setShowStatusModal] = useState(false);

  const [openReceipt, setOpenReceipt] = useState(null);
  const [openOrderNumber, setOpenOrderNumber] = useState(null);
  const [openDeliveries, setOpenDeliveries] = useState(null);
  // State to hold computed values
  const [permission, setPermission] = useState([]);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const canceledOrders = useSelector((state) => state.canceledOrders); // Add this line

  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // Only remove if the order exists in canceled orders
    const orderExists = canceledOrders.orders.includes(orderId);
    if (orderExists) {
      dispatch(removeCanceledOrder(orderId));
    }
  }, [orderId, location.pathname, dispatch, canceledOrders.orders]);

  useEffect(() => {
    const computedPermission =
      auth?.userState?.user_positions?.roles?.map((role) => role.role) || [];
    const ACTIONS =
      auth?.userState?.user_positions?.roles?.map((role) => role.action) || [];
    setPermission(computedPermission);
  }, [auth?.userState?.user_positions?.roles]);

  useEffect(() => {
    refetchDetailsOrder(); // Refetch data when the component mounts or orderId or path changes
  }, [refetchDetailsOrder, orderNumPath, orderId, location.pathname]);

  useEffect(() => {
    if (dataDetailsOrder && dataDetailsOrder?.order) {
      setDetailsData(dataDetailsOrder?.order);
      setOrderStatusName(dataDetailsOrder?.order?.order_status);
      const formattedOrderStatus = (dataDetailsOrder?.order_status || []).map(
        (status) => ({ name: status })
      );
      setOrderStatus(formattedOrderStatus); // Update state with the transformed data
      setDeliveries(dataDetailsOrder?.deliveries || []);
      setDeliveriesFilter(dataDetailsOrder?.deliveries || []);
      setPreparationTime(dataDetailsOrder?.preparing_time);

      // FIX: Use the fresh current branch ID from dataDetailsOrder
      const currentBranchId = dataDetailsOrder.order?.branch?.id;
      const filteredBranches = (dataDetailsOrder.branches || []).filter(
        branch => branch.id !== currentBranchId
      );

      setBranches(filteredBranches);
    }
  }, [dataDetailsOrder]);

  // Show a toast when the order ID is invalid — stay on the current page
  useEffect(() => {
    if (!loadingDetailsOrder && (errorDetailsOrder || dataDetailsOrder?.errors)) {
      const rawError = typeof dataDetailsOrder?.errors === "string" ? dataDetailsOrder.errors : "";
      const msg = rawError ? t(rawError) : t("OrderNotFound");
      auth.toastError(msg);
    }
  }, [errorDetailsOrder, dataDetailsOrder, loadingDetailsOrder, t]);

  // Navigate to prev/next order only after verifying it exists
  const handleOrderNavigation = async (targetId) => {
    if (navigating) return;
    setNavigating(true);
    try {
      const token = auth?.userState?.token || localStorage.getItem("token") || "";
      const res = await fetch(
        `${apiUrl}/admin/order/order/${targetId}?locale=${selectedLanguage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (!res.ok || json?.errors) {
        const rawError = typeof json?.errors === "string" ? json.errors : "";
        const errMsg = rawError ? t(rawError) : t("OrderNotFound");
        auth.toastError(errMsg);
      } else {
        navigate(`${route}/details/${targetId}`);
      }
    } catch {
      auth.toastError(t("OrderNotFound"));
    } finally {
      setNavigating(false);
    }
  };

  const timeString = dataDetailsOrder?.order?.date || "";
  const [olderHours, olderMinutes] = timeString.split(":").map(Number); // Extract hours and minutes as numbers
  const dateObj = new Date();
  dateObj.setHours(olderHours, olderMinutes);

  const dayString = dataDetailsOrder?.order?.order_date || "";
  const [olderyear, olderMonth, olderDay] = dayString.split("-").map(Number); // Extract year, month, and day as numbers
  const dayObj = new Date();
  dayObj.setFullYear(olderyear);
  dayObj.setMonth(olderMonth - 1); // Months are zero-based in JavaScript Date
  dayObj.setDate(olderDay);

  // Create a new Date object for the current date and time
  const time = new Date();

  // Extract time components using Date methods
  const day = time.getDate();
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();

  // If you need to modify the time object (not necessary here):
  time.setDate(day);
  time.setHours(hour);
  time.setMinutes(minute);
  time.setSeconds(second);

  // Create an object with the extracted time values
  const initialTime = {
    currentDay: day,
    currentHour: hour,
    currentMinute: minute,
    currentSecond: second,
  };

  const handleChangeDeliveries = (e) => {
    const value = e.target.value.toLowerCase(); // Normalize input value
    setSearchDelivery(value);

    const filterDeliveries = deliveries.filter(
      (delivery) =>
        (delivery.f_name + " " + delivery.l_name).toLowerCase().includes(value) // Concatenate and match
    );

    setDeliveriesFilter(filterDeliveries);
  };

  const handleAssignDelivery = (deliveryID, orderID, deliveryNumber) => {
    const formData = new FormData();
    formData.append("delivery_id", deliveryID);
    formData.append("order_id", orderID);
    formData.append("order_number", deliveryNumber);

    postData(formData, t("Delivery has Assigned"));
  };
  useEffect(() => {
    if (response && response.status === 200) {
      setOrderStatusName("out_for_delivery");
      setSearchDelivery("");
      setOpenDeliveries(false);
      setDeliveriesFilter(deliveries);
      // Invalidate ALL cached order queries so list pages see the updated status
      queryClient.invalidateQueries();
      // Also trigger the count refetch so sidebar badges update
      dispatch(triggerRefresh());
      refetchDetailsOrder(); // Refetch to update the UI with new status and delivery info.
    }
  }, [response]);


  const handleTransferBranch = async () => {
    if (!selectedBranchId) {
      auth.toastError(t("Please select a branch"));
      return;
    }

    const formData = new FormData();
    formData.append("branch_id", selectedBranchId);

    transferPostData(formData, t("Order transferred successfully!"));

  };

  useEffect(() => {
    if (transferResponse && transferResponse.status === 200) {
      refetchDetailsOrder();
      setOpenTransferModal(false);
    }
  }, [transferResponse]);

  const handleOpenReceipt = (id) => {
    setOpenReceipt(id);
  };

  const handleCloseReceipt = () => {
    setOpenReceipt(null);
  };

  const handleOpenOrderNumber = (orderId) => {
    setOpenOrderNumber(orderId);
  };
  const handleCloseOrderNumber = () => {
    setOpenOrderNumber(null);
  };

  const handleOpenDeliviers = (deliveryId) => {
    setOpenDeliveries(deliveryId);
  };

  const handleCloseDeliveries = () => {
    setOpenDeliveries(null);
  };
  const handleOpenOrderStatus = () => {
    const hasOrderPermission = auth.userState.user_positions.roles?.some(
      (perm) => perm.role === "Order"
    );
    const hasValidAction = auth.userState.user_positions.roles?.some(
      (action) => action.action === "all" || action.action === "back_status"
    );

    if (hasOrderPermission && hasValidAction) {
      setIsOpenOrderStatus(!isOpenOrderStatus);
    } else {
      auth.toastError(
        t("You don't have permission to change the order status")
      );
    }
  };

  const handleOpenOptionOrderStatus = () => setIsOpenOrderStatus(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      navigator.clipboard
        .writeText(text)
        .then(() => {
          auth.toastSuccess("Phone number copied!"); // Use auth.toastSuccess()
        })
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  const handleSelectOrderStatus = (selectedOption) => {
    const targetStatus = selectedOption.name;

    // Define status transition rules
    const statusPermissions = {
      canceled: { requiresReason: true },
      refund: {},
    };

    if (statusPermissions[targetStatus]?.requiresReason) {
      setShowCancelModal(true);
      setOrderStatusName(targetStatus);
    } else if (targetStatus === "refund") {
      setShowRefundModal(true);
    } else {
      handleChangeStaus(detailsData.id, "", targetStatus, "");
    }
  };

  const handleOrderNumber = (id) => {
    if (!orderNumber) {
      auth.toastError(t("please set your order Number"));
      return;
    }

    handleChangeStaus(id, orderNumber, "processing", "");
    setOpenOrderNumber(null);
  };

  // Move handleChangeStaus outside the function
  const handleChangeStaus = async (
    orderId,
    orderNumber,
    orderStatus,
    reason
  ) => {
    try {
      const statusUrl =
        role === "branch"
          ? `${apiUrl}/branch/online_order/status/${orderId}?locale=${selectedLanguage}`
          : `${apiUrl}/admin/order/status/${orderId}?locale=${selectedLanguage}`;

      const responseStatus = await changeState(
        statusUrl,
        `Changed Status Successes.`,
        {
          order_status: orderStatus,
          order_number: orderNumber,
          ...(orderStatus === "canceled" && { admin_cancel_reason: reason }), // Send reason if canceled
        }
      );
    } catch (error) {
      if (error?.response?.data?.errors === "You can't change status") {
        setShowStatusModal(true);
      }
    }
  };

  // useEffect(() => {
  //   if (responseChange && responseChange.status === 200) {
  //     const orderData = responseChange.data;

  //     if (orderData?.order_status === "confirmed") {
  //       console.log(orderData);
  //       // تحضير بيانات الكاشير
  //       const receiptData = prepareReceiptData(orderData.kitchen);

  //       // نمرر الـ kitchen_items مباشرة كخاصية داخل الكائن
  //       const formattedResponse = {
  //         ...orderData,
  //         kitchen_items: orderData.kitchen?.kitchen_items || orderData.kitchen_items || []
  //       };

  //       printReceiptSilently(receiptData, formattedResponse, () => {
  //         refetchDetailsOrder();
  //       });
  //     } else {
  //       refetchDetailsOrder();
  //     }
  //   }
  // }, [responseChange]);

  useEffect(() => {
    if (responseChange && responseChange.status === 200) {
      const orderData = responseChange.data;

      // Invalidate ALL cached order queries so every list page reflects the new status
      queryClient.invalidateQueries();
      // Also trigger the count refetch so sidebar badges update
      dispatch(triggerRefresh());

      if (orderData?.order_status === "confirmed") {
        // 1. نرسل الداتا بالكامل لدالة التجهيز
        const allPrintData = prepareReceiptData(orderData, t("projectName"));

        // 2. نستدعي الطباعة ونمرر لها البيانات الجاهزة
        printReceiptSilently(allPrintData, t, () => {
          refetchDetailsOrder();
        });
      } else {
        refetchDetailsOrder();
      }
    }
  }, [responseChange]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setPreparationTime((prevTime) => {
        if (!prevTime) return prevTime;

        const { days, hours, minutes, seconds } = prevTime;

        // Calculate the next time
        let newSeconds = seconds - 1;
        let newMinutes = minutes;
        let newHours = hours;
        let newDays = days;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }
        if (newHours < 0) {
          newHours = 23;
          newDays -= 1;
        }

        // Stop the countdown if time reaches zero
        if (
          newDays <= 0 &&
          newHours <= 0 &&
          newMinutes <= 0 &&
          newSeconds <= 0
        ) {
          clearInterval(countdown);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
          days: newDays,
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds,
        };
      });
    }, 1000);

    // Clear interval on unmount
    return () => clearInterval(countdown);
  }, []); // Dependency array is empty to ensure the effect runs only once

  let totalAddonPrice = 0;
  let totalItemPrice = 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (StatusRef.current && !StatusRef.current.contains(event.target)) {
        setIsOpenOrderStatus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // === QZ Tray Connection ===
  useEffect(() => {
    qz.security.setCertificatePromise(function (resolve, reject) {
      fetch("/digital-certificate.txt")
        .then((response) => response.text())
        .then(resolve)
        .catch(reject);
    });

    qz.security.setSignatureAlgorithm("SHA512");

    qz.security.setSignaturePromise(function (toSign) {
      return function (resolve, reject) {
        const getQZ = `${apiUrl}/api/sign-qz-request?request=${toSign}`;

        fetch(getQZ)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Server returned ${response.status}`);
            }
            return response.text();
          })
          .then(resolve)
          .catch(reject);
      };
    });

    qz.websocket
      .connect()
      .then(() => {
        console.log("✅ Connected to QZ Tray");
      })
      .catch((err) => {
        console.error("❌ QZ Tray connection error:", err);
      });

    return () => {
      qz.websocket.disconnect();
    };
  }, []);

  // Detect a hard error with no data to show (e.g. refresh on invalid ID)
  const isHardError =
    !loadingDetailsOrder &&
    (errorDetailsOrder || dataDetailsOrder?.errors) &&
    (!detailsData || detailsData.length === 0 || !detailsData.id);

  return (
    <>
      {loadingDetailsOrder || loadingPost || loadingChange || navigating ? (
        <div className="mx-auto">
          <LoaderLogin />
        </div>
      ) : isHardError ? (
        /* ── Refreshed directly on an invalid order ID ── */
        <div className="flex items-center justify-center w-full min-h-[60vh] p-4">
          <div className="flex flex-col items-center justify-center max-w-lg w-full p-8 md:p-10 bg-white border border-gray-100 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 text-center relative overflow-hidden group">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-mainColor to-red-700"></div>

            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-100/50 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-500"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-red-100/50 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-all duration-500"></div>

            {/* Glowing Icon Badge */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping"></div>
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200/80 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 text-mainColor transform group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Main Title */}
            <h3 className="mb-2 text-2xl font-bold text-gray-800 font-TextFontSemiBold tracking-tight">
              {t("OrderNotFound")}
            </h3>

            {/* Error Message / Description */}
            <p className="mb-8 text-sm md:text-base text-gray-500 leading-relaxed font-TextFontRegular max-w-sm">
              {typeof dataDetailsOrder?.errors === "string" ? t(dataDetailsOrder.errors) : t("OrderNotFoundDesc")}
            </p>

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button
                onClick={() => navigate(`${route}/all`)}
                className="w-full sm:w-auto px-6 py-3 text-white text-sm rounded-xl bg-gradient-to-r from-[#9E090F] to-[#D1191C] hover:from-[#7a060b] hover:to-[#a31215] shadow-md hover:shadow-lg transform active:scale-95 transition-all duration-200 font-TextFontMedium flex items-center justify-center gap-2"
              >
                <span>{t("BackToOrders")}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {!detailsData.id ? (
            <div className="mx-auto">
              <LoaderLogin />
            </div>
          ) : (
            <div className="flex items-start justify-between w-full gap-3 mb-24 sm:flex-col lg:flex-row">
              {/* Left Section */}
              <div className="sm:w-full lg:w-8/12">
                <div className="w-full p-2 bg-white shadow-md rounded-xl ">
                  <div className="w-full">
                    {/* Header */}
                    <div className="w-full px-2 py-4 rounded-lg shadow md:px-4 lg:px-4">
                      {/* Header – Original Design + Creative Invoice Placement */}
                      <div className="flex flex-col items-start justify-between pb-2 border-b border-gray-300">
                        <div className="w-full relative"> {/* relative only for the creative button */}

                          {/* Title + Prev/Next Buttons – exactly as before */}
                          <div className="flex flex-wrap items-center justify-between w-full">
                            <h1 className="text-2xl text-gray-800 font-TextFontMedium">
                              {t("Order")}{" "}
                              <span className="text-mainColor">
                                #{detailsData?.id || ""}
                              </span>
                            </h1>

                            {
                              role !== "branch" ? (
                                <div className="flex items-center justify-center gap-2 sm:w-full lg:w-6/12">
                                  <button
                                    disabled={navigating}
                                    onClick={() => handleOrderNavigation(Number(orderNumPath) - 1)}
                                    className="w-6/12 px-1 py-1 text-sm text-center text-white transition-all duration-300 ease-in-out border-2 rounded-lg md:text-md bg-mainColor border-mainColor hover:bg-white hover:text-mainColor disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {"<<"} {t("PrevOrder")}
                                  </button>
                                  <button
                                    disabled={navigating}
                                    onClick={() => handleOrderNavigation(Number(orderNumPath) + 1)}
                                    className="w-6/12 px-1 py-1 text-sm text-center text-white transition-all duration-300 ease-in-out border-2 rounded-lg md:text-md bg-mainColor border-mainColor hover:bg-white hover:text-mainColor disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {t("NextOrder")} {">>"}
                                  </button>
                                </div>
                              ) : null
                            }

                          </div>

                          {/* Original metadata lines */}
                          {detailsData?.address && (
                            <p className="mt-1 text-sm text-gray-700">
                              <span className="font-TextFontSemiBold">{t("Zone")}:</span>{" "}
                              {detailsData?.address?.zone?.zone || ""}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-gray-700">
                            <span className="font-TextFontSemiBold">{t("Branch")}:</span>{" "}
                            {detailsData?.branch?.name || ""}
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            <span className="font-TextFontSemiBold">{t("OrderTime")}:</span>{" "}
                            {detailsData?.order_time || ""}
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            <span className="font-TextFontSemiBold">{t("OrderDate")}:</span>{" "}
                            {detailsData?.order_date || ""}
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            <span className="font-TextFontSemiBold">{t("Schedule")}:</span>{" "}
                            {detailsData?.schedule || "-"}
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            <span className="font-TextFontSemiBold">{t("Source")}:</span>{" "}
                            {detailsData?.source || "-"}
                          </p>

                          {/* CREATIVE PLACEMENT: Elegant floating badge on the right */}
                          <div className="absolute top-1/2 -translate-y-1/2 right-0 rtl:right-auto rtl:left-0
                    hidden sm:block"> {/* Hidden on mobile, appears from sm+ */}
                            <Link
                              to={`${route}/invoice/${detailsData?.id}`}
                              className="flex items-center gap-2.5 px-5 py-3 text-sm font-medium text-white 
                   bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg 
                   hover:shadow-xl hover:scale-105 transition-all duration-300 
                   whitespace-nowrap border border-red-400"
                            >
                              <FaFileInvoice className="text-lg" />
                              <span className="hidden lg:inline">{t("View Invoice")}</span>
                              <span className="lg:hidden">{t("Invoice")}</span>
                            </Link>
                          </div>

                          {/* Mobile fallback – small floating button at top-right (same as original but prettier) */}
                          <div className="absolute top-2 right-2 sm:hidden">
                            <Link
                              to={`${route}/invoice/${detailsData?.id}`}
                              className="flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full shadow-md hover:bg-green-600 hover:scale-110 transition-all duration-300"
                              aria-label={t("ViewInvoice")}
                            >
                              <FaFileInvoice className="text-lg" />
                            </Link>
                          </div>

                        </div>
                      </div>

                      {/* Order Information */}
                      <div className="flex items-start justify-center w-full gap-4 sm:flex-col xl:flex-row">
                        <div className="p-2 bg-white rounded-md shadow-md sm:w-full xl:w-6/12">
                          <p className="text-gray-800 text-md">
                            <span className="font-TextFontSemiBold text-mainColor">
                              {t("Status")}:
                            </span>{" "}
                            {t(detailsData?.order_status) || ""}
                          </p>
                          <p className="text-gray-800 text-md">
                            <span className="font-TextFontSemiBold text-mainColor">
                              {t("PaymentMethod")}:
                            </span>{" "}
                            {detailsData?.payment_method?.name || ""}
                          </p>
                          {detailsData?.payment_method?.name ===
                            "Visa Master Card" && (
                              <>
                                <p className="text-gray-800 text-md">
                                  <span className="font-TextFontSemiBold text-mainColor">
                                    {t("PaymentStatus")}:
                                  </span>{" "}
                                  {t(detailsData?.status_payment) || ""}
                                </p>
                                <p className="text-gray-800 text-md">
                                  <span className="font-TextFontSemiBold text-mainColor">
                                    {t("Transaction ID")}:
                                  </span>{" "}
                                  {detailsData?.transaction_id || ""}
                                </p>
                              </>
                            )}
                        </div>
                        <div className="p-2 bg-white rounded-md shadow-md sm:w-full xl:w-6/12">
                          <p className="text-gray-800 text-md">
                            <span className="font-TextFontSemiBold text-mainColor">
                              {t("OrderType")}:
                            </span>{" "}
                            <span
                              className={`px-2 py-1 rounded-full text-md ${detailsData?.order_type === "take_away"
                                ? "text-green-700 bg-green-100" // Green text with light green bg
                                : "text-blue-700 bg-blue-100" // Adjust for delivery (blue as example)
                                }`}
                            >
                              {t(detailsData?.order_type) || ""}
                            </span>{" "}
                          </p>
                          <p className="text-gray-800 text-md">
                            <span className="font-TextFontSemiBold text-mainColor">
                              {t("OrderNote")}:
                            </span>{" "}
                            {detailsData?.notes || "No Notes"}
                          </p>
                          {detailsData?.payment_method?.id !== 2 && (
                            <p className="text-gray-800 text-md">
                              <span className="font-TextFontSemiBold text-mainColor">
                                {t("OrderRecipt")}:
                              </span>
                              {detailsData?.receipt ? (
                                <>
                                  <span
                                    className="ml-2 underline cursor-pointer text-mainColor font-TextFontMedium"
                                    onClick={() =>
                                      handleOpenReceipt(detailsData.id)
                                    }
                                  >
                                    {t("Receipt")}
                                  </span>

                                  {openReceipt === detailsData.id && (
                                    <Dialog
                                      open={true}
                                      onClose={handleCloseReceipt}
                                      className="relative z-10"
                                    >
                                      <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                                      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                        <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                          <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl">
                                            <div className="flex items-center justify-center w-full p-5">
                                              <img
                                                src={
                                                  detailsData?.receipt
                                                    ? `data:image/jpeg;base64,${detailsData?.receipt}`
                                                    : ""
                                                }
                                                className="max-h-[80vh] object-center object-contain shadow-md rounded-2xl"
                                                alt="Receipt"
                                              />
                                            </div>
                                            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-x-3">
                                              <button
                                                type="button"
                                                onClick={handleCloseReceipt}
                                                className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md bg-mainColor font-TextFontMedium sm:mt-0 sm:w-auto"
                                              >
                                                {t("Close")}
                                              </button>
                                            </div>
                                          </DialogPanel>
                                        </div>
                                      </div>
                                    </Dialog>
                                  )}
                                </>
                              ) : (
                                <span className="ml-2 text-gray-800 underline text-md font-TextFontMedium">
                                  {t("NoRecipt")}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Combined Orders Table */}
                    <div className="p-2 my-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {/* Table Header */}
                      <h2 className="mb-2 text-2xl font-bold text-gray-800">
                        {t("Order Items")}
                      </h2>

                      {/* Table wrapped in a horizontal scroll container */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-[#9E090F] to-[#D1191C] text-white">
                            <tr>
                              <th className={`px-2 py-2 max-w-[30px] text-xs font-medium tracking-wider ${selectedLanguage === "ar" ? "text-right" : "text-left"} uppercase border-gray-300`}>
                                #
                              </th>
                              <th className={`px-3 py-2 text-xs font-medium tracking-wider ${selectedLanguage === "ar" ? "text-right" : "text-left"} uppercase border-gray-300`}>
                                {t("Products")}
                              </th>
                              <th className={`px-3 py-2 text-xs font-medium tracking-wider ${selectedLanguage === "ar" ? "text-right" : "text-left"} uppercase border-gray-300`}>
                                {t("variation")}
                              </th>
                              <th className={`px-3 py-2 text-xs font-medium tracking-wider ${selectedLanguage === "ar" ? "text-right" : "text-left"} uppercase border-gray-300`}>
                                {t("Addons")}
                              </th>
                              <th className={`px-3 py-2 text-xs font-medium tracking-wider ${selectedLanguage === "ar" ? "text-right" : "text-left"} uppercase border-gray-300`}>
                                {t("Excludes")}
                              </th>
                              <th className={`px-3 py-2 text-xs font-medium tracking-wider ${selectedLanguage === "ar" ? "text-right" : "text-left"} uppercase border-gray-300`}>
                                {t("Extra")}
                              </th>
                              <th className={`px-3 py-2 text-xs font-medium tracking-wider ${selectedLanguage === "ar" ? "text-right" : "text-left"} uppercase border-gray-300`}>
                                {t("Notes")}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {(detailsData?.order_details || []).map((order, orderIndex) => {
                              // 1. CALCULATE TOTAL UNIT PRICE (Base + Variations + Extras)
                              const basePrice = order.product?.price || 0;
                              const priceAfterDiscount = order.product?.price_after_discount || basePrice;
                              const priceAfterTax = order.product?.price_after_tax || basePrice;

                              const variationsPrice = (order.variations || []).reduce((total, variation) => {
                                const optionsTotal = (variation.options || []).reduce((sum, opt) => sum + (opt.price || 0), 0);
                                return total + optionsTotal;
                              }, 0);

                              const extrasPrice = (order.extras || []).reduce((total, extra) => total + (extra.price || 0), 0);

                              const totalPriceIncludingVariations = priceAfterDiscount + variationsPrice;

                              return (
                                <tr key={`order-${orderIndex}`} className="hover:bg-gray-50">
                                  {/* Order Number Column */}
                                  <td className="px-2 py-1 font-semibold whitespace-normal border-r border-gray-300">
                                    {orderIndex + 1}
                                  </td>

                                  {/* Products Column: UPDATED TO SHOW TOTAL PRICE */}
                                  <td className="px-2 py-1 whitespace-normal border-r border-gray-300">
                                    <div className="mb-3">
                                      {order.product?.image_link && (
                                        <img
                                          src={order.product.image_link}
                                          alt={order.product.name}
                                          className="w-14 h-14 object-cover rounded border border-gray-300 mb-1"
                                        />
                                      )}
                                      <div className="font-semibold text-gray-800">
                                        {order.product?.name}
                                      </div>

                                      {/* Displaying the Combined Price */}
                                      <div className="text-sm font-bold text-mainColor">
                                        {t("Price")}: {totalPriceIncludingVariations.toFixed(2)}
                                        {variationsPrice > 0 && (
                                          <span className="text-[12px] text-gray-600 font-normal block italic">
                                            {t("price_breakdown", {
                                              base: priceAfterDiscount,
                                              variations: variationsPrice
                                            })}
                                          </span>
                                        )}
                                      </div>

                                      <div className="text-sm text-gray-600">
                                        {t("Qty")}: {order.product?.count || 1}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Variations Column */}
                                  <td className="px-2 py-1 whitespace-normal border-r border-gray-300">
                                    {order.variations && order.variations.length > 0 ? (
                                      order.variations.map((variation, varIndex) => (
                                        <div key={`variation-${varIndex}`} className="mb-3">
                                          <div className="font-semibold text-gray-800">{variation.name}</div>
                                          <div className="text-xs text-gray-500">
                                            {t("Type")}:{" "}
                                            {variation.options?.map((option, optIndex) => (
                                              <span key={`option-${optIndex}`} className="mr-1">
                                                {option.name}
                                                {option.price > 0 && (
                                                  <span className="text-mainColor font-bold"> (+{option.price})</span>
                                                )}
                                                {optIndex < (variation.options?.length || 0) - 1 ? ", " : ""}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-gray-500">-</span>
                                    )}
                                  </td>

                                  {/* Addons Column */}
                                  <td className="px-2 py-1 whitespace-normal border-r border-gray-300">
                                    {order.addons && order.addons.length > 0 ? (
                                      order.addons.map((addon, addonIndex) => {
                                        const addonName = addon?.name || "—";
                                        const addonPrice = addon?.price || 0;
                                        const count = addon?.count || 1;
                                        return (
                                          <div key={`addon-${addonIndex}`} className="mb-3">
                                            <div className="font-semibold text-gray-800">
                                              {addonName}
                                              {count > 1 && <span className="text-xs text-gray-500"> ×{count}</span>}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                              {t("Price")}: {addonPrice} {count > 1 && `× ${count} = ${addonPrice * count}`}
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>

                                  {/* Excludes Column */}
                                  <td className="px-2 py-1 whitespace-normal border-r border-gray-300">
                                    {order.excludes && order.excludes.length > 0 ? (
                                      order.excludes.map((exclude, excludeIndex) => (
                                        <div key={`exclude-${excludeIndex}`} className="mb-3">
                                          <div className="font-semibold text-gray-800">{exclude.name}</div>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-gray-500">-</span>
                                    )}
                                  </td>

                                  {/* Extras Column */}
                                  <td className="px-2 py-1 whitespace-normal border-r border-gray-300">
                                    {order.extras && order.extras.length > 0 ? (
                                      order.extras.map((extra, i) => (
                                        <div key={i} className="mb-2">
                                          <div className="font-medium">{extra?.name || "—"}</div>
                                          <div className="text-xs text-gray-500">
                                            {t("Price")}: {extra.price || "-"}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>

                                  {/* Notes Column */}
                                  <td className="px-2 py-1 whitespace-normal border-r border-gray-300">
                                    {order.product?.notes ? (
                                      <div className="relative p-2 text-sm text-gray-700 border-l-4 border-red-400 rounded-md shadow-sm bg-red-50">
                                        <p className="line-clamp-3">{order.product.notes}</p>
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">{t("No notes")}</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="flex flex-col p-2 my-2 gap-y-1">
                      {/* Calculate totals safely */}
                      {(() => {
                        let totalItemPrice = 0;
                        let totalAddonPrice = 0;

                        (detailsData?.order_details || []).forEach((orderDetail) => {
                          // Product is a single object → NOT an array
                          const product = orderDetail.product;
                          if (product) {
                            totalItemPrice += (product.price_after_discount ? product.price_after_discount : product.price_after_tax ? product.price_after_tax : product.price || 0) * (product.count || 1);
                          }

                          // Inside your total calculation loop
                          (orderDetail.variations || []).forEach((v) => {
                            (v.options || []).forEach((opt) => {
                              totalItemPrice += (opt.price || 0) * (product.count || 1);
                            });
                          });

                          // Addons
                          (orderDetail.addons || []).forEach((addonItem) => {
                            totalAddonPrice += (addonItem?.price || 0) * (addonItem.count || 1);
                          });

                          // Extras
                          (orderDetail.extras || []).forEach((extraItem) => {
                            totalItemPrice += extraItem.price || 0;
                          });
                        });

                        return (
                          <>
                            <p className="flex items-center justify-between w-full">
                              {t("ItemsPrice")}: <span>{totalItemPrice.toFixed(2)}</span>
                            </p>
                            <p className="flex items-center justify-between w-full">
                              {t("AddonsPrice")}: <span>{totalAddonPrice.toFixed(2)}</span>
                            </p>
                            <p className="flex items-center justify-between w-full">
                              {t("Subtotal")}: <span>{(totalItemPrice + totalAddonPrice).toFixed(2)}</span>
                            </p>
                            <p className="flex items-center justify-between w-full">
                              {t("Tax/VAT")}: <span>{detailsData?.total_tax || 0}</span>
                            </p>
                            <p className="flex items-center justify-between w-full">
                              {t("CouponDiscount")}: <span>{detailsData?.coupon_discount || 0}</span>
                            </p>
                            <p className="flex items-center justify-between w-full">
                              {t("servicefees")}: <span>{detailsData?.service_fees || 0}</span>
                            </p>
                            <p className="flex items-center justify-between w-full">
                              {t("DeliveryFee")}: <span>{detailsData?.address?.zone?.price || 0}</span>
                            </p>
                            <p className="flex items-center justify-between w-full text-lg font-TextFontSemiBold text-mainColor">
                              {t("Total")}: <span>{detailsData?.amount || 0}</span>
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="sm:w-full lg:w-4/12">
                <div className="w-full p-4 bg-white shadow-md rounded-xl">
                  <div className="flex items-center text-lg gap-x-2 font-TextFontSemiBold">
                    <span>
                      <FaUser className="text-mainColor" />
                    </span>
                    {t("Customer Information")}
                  </div>
                  <p className="text-sm">
                    {t("Name")}: {detailsData?.user?.f_name || "-"}{" "}
                    {detailsData?.user?.l_name || "-"}
                  </p>
                  <p className="text-sm">
                    {t("Orders")}: {detailsData?.user?.count_orders || "-"}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    Contact:
                    {detailsData?.user?.phone && (
                      <>
                        <a
                          href={`https://wa.me/${detailsData.user.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-black transition duration-200 hover:text-green-600"
                        >
                          <FaWhatsapp className="w-5 h-5 text-green-600" />
                          {detailsData.user.phone}
                        </a>
                        <button
                          onClick={() => copyToClipboard(detailsData.user.phone)}
                          className="text-gray-500 hover:text-blue-500"
                          title={copied ? "Copied!" : "Copy Number"}
                        >
                          <FaCopy />
                        </button>
                      </>
                    )}
                  </p>
                  <p className="text-sm">
                    {t("Email")}: {detailsData?.user?.email || "-"}
                  </p>

                  {detailsData.order_type === "delivery" && (
                    <>
                      <p className="text-sm">
                        {t("BuildNum")}:{" "}
                        {detailsData?.address?.building_num || "-"}
                      </p>
                      <p className="text-sm">
                        {t("Floor")}: {detailsData?.address?.floor_num || "-"}
                      </p>
                      <p className="text-sm">
                        {t("House")}: {detailsData?.address?.apartment || "-"}
                      </p>
                      <p className="text-sm">
                        {t("Road")}: {detailsData?.address?.street || "-"}
                      </p>
                      <p className="pb-2 text-sm text-center">
                        {detailsData?.address?.address || "-"}
                      </p>
                      {detailsData?.address?.additional_data ||
                        ("" && (
                          <p className="pt-2 text-sm text-center border-t-2">
                            {detailsData?.address?.additional_data || "-"}
                          </p>
                        ))}
                      {detailsData?.address?.map && (
                        <p className="text-sm line-clamp-3">
                          {t("LocationMap")}:
                          <a
                            href={detailsData?.address?.map}
                            className="ml-1 underline text-mainColor font-TextFontMedium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {detailsData?.address?.map?.length > 30
                              ? `${detailsData?.address?.map?.slice(0, 30)}...`
                              : detailsData?.address?.map}
                          </a>
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Transfer Branch Button & Modal */}
                {detailsData.order_status !== "delivered" && detailsData.order_status !== "canceled" && (
                  <>
                    <button
                      onClick={() => setOpenTransferModal(true)}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition shadow-md"
                    >
                      {t("Transfer to Another Branch")}
                    </button>

                    {/* Transfer Branch Modal */}
                    <Dialog open={openTransferModal} onClose={() => setOpenTransferModal(false)} className="relative z-50">
                      <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />

                      <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            {t("Transfer Order to Branch")}
                          </h3>

                          {/* Loading state */}
                          {loadingBranches ? (
                            <div className="flex justify-center py-8">
                              <LoaderLogin />
                            </div>
                          ) : branches.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">{t("No branches available")}</p>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {branches.map((branch) => (
                                <label
                                  key={branch.id}
                                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition
                    ${selectedBranchId === branch.id
                                      ? "border-green-600 bg-green-50"
                                      : "border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name="branch"
                                      value={branch.id}
                                      checked={selectedBranchId === branch.id}
                                      onChange={() => setSelectedBranchId(branch.id)}
                                      className="w-5 h-5 text-green-600"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-900">{branch.name}</p>
                                      <p className="text-sm text-gray-500">{branch.zone?.name || ""}</p>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-3 mt-6">
                            <button
                              onClick={() => setOpenTransferModal(false)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                            >
                              {t("Cancel")}
                            </button>
                            <button
                              onClick={handleTransferBranch}
                              disabled={!selectedBranchId || loadingTransfer}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                              {loadingTransfer ? (
                                <>{t("Transferring...")}</>
                              ) : (
                                <>{t("Transfer Order")}</>
                              )}
                            </button>
                          </div>
                        </DialogPanel>
                      </div>
                    </Dialog>
                  </>
                )}

                <div className="w-full p-4 mt-4 bg-white shadow-md rounded-xl">
                  <div className="flex flex-col gap-y-2">
                    <span className="text-lg font-TextFontSemiBold">
                      {t("Change Order Status")}
                    </span>

                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Define status order for comparison */}
                        {(() => {
                          const statusOrder = [
                            "pending",
                            "processing",
                            "confirmed",
                            "out_for_delivery",
                            "delivered",
                            // 'canceled',
                            // 'refund',
                            // 'returned',
                            // 'faild_to_deliver'
                          ];
                          const currentStatus = detailsData?.order_status;
                          const currentIndex = statusOrder.indexOf(currentStatus);

                          // Define all possible statuses
                          const allStatuses = [
                            {
                              name: "pending",
                              label: t("Pending"),
                              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                            },
                            {
                              name: "processing",
                              label: t("Accept"),
                              icon: "M5 13l4 4L19 7",
                            },
                            {
                              name: "confirmed",
                              label: t("Processing"),
                              icon: "M5 13l4 4L19 7",
                            },
                            {
                              name: "out_for_delivery",
                              label: t("OutForDelivery"),
                              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                            },
                            {
                              name: "delivered",
                              label: t("Delivered"),
                              icon: "M5 13l4 4L19 7",
                            },
                            {
                              name: "faild_to_deliver",
                              label: t("FailedToDeliver"),
                              icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
                            },
                            {
                              name: "returned",
                              label: t("Returned"),
                              icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                            },
                            {
                              name: "canceled",
                              label: t("Canceled"),
                              icon: "M6 18L18 6M6 6l12 12",
                            },
                            {
                              name: "refund",
                              label: t("Refund"),
                              icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
                            },
                          ];

                          // Filter statuses based on current status
                          const filteredStatuses = allStatuses.filter((status) => {
                            if (currentStatus === "delivered") {
                              return !["canceled"].includes(status.name);
                            } else if (currentStatus === "canceled") {
                              // Exclude 'delivered', 'faild_to_deliver', and 'returned' when status is 'canceled'
                              return !["delivered", "faild_to_deliver", "returned"].includes(
                                status.name
                              );
                            } else if (currentStatus === "refund") {
                              return !["canceled"].includes(status.name);
                            }
                            return true;
                          });

                          return filteredStatuses.map((status) => {
                            const statusIndex = statusOrder.indexOf(status.name);
                            const isCurrent = currentStatus === status.name;
                            const isPrevious = statusIndex !== -1 && currentIndex > statusIndex;
                            const isNext = statusIndex !== -1 && currentIndex < statusIndex;

                            const isCancel = status.name === "canceled";
                            const isReturn = status.name === "returned";
                            const isFailed = status.name === "faild_to_deliver";

                            // Determine if button should be disabled
                            let isDisabled = false;

                            // For normal flow statuses
                            if (statusOrder.includes(status.name)) {
                              if (currentStatus === "pending") {
                                // Allow transition to "processing" or "confirmed" from "pending"
                                isDisabled = !["processing", "confirmed"].includes(status.name);
                              } else {
                                // Normal flow: enable one step forward or backward (except to pending)
                                isDisabled = !(
                                  statusIndex === currentIndex + 1 ||
                                  (statusIndex === currentIndex - 1 && status.name !== "pending")
                                );
                              }
                            }
                            // For returned status
                            else if (isReturn) {
                              isDisabled = !["out_for_delivery", "delivered"].includes(currentStatus);
                            }
                            // For failed delivery status
                            else if (isFailed) {
                              isDisabled = currentStatus !== "out_for_delivery";
                            }

                            return (
                              <button
                                key={status.name}
                                onClick={() =>
                                  !isDisabled && handleSelectOrderStatus({ name: status.name })
                                }
                                disabled={isDisabled}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all relative
              ${isCurrent
                                    ? "bg-blue-100 border-blue-500 text-blue-900 shadow-md"
                                    : isPrevious
                                      ? "bg-green-50 border-green-300 text-green-800"
                                      : isDisabled
                                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                                  }
            `}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={status.icon}
                                  />
                                </svg>
                                {status.label}

                                {/* Checkmark for completed statuses */}
                                {isPrevious && (
                                  <span className="absolute text-green-500 top-2 right-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                )}

                                {/* Current status indicator */}
                                {isCurrent && (
                                  <span className="absolute top-0 right-0 flex w-3 h-3 -mt-1 -mr-1">
                                    <span className="absolute inline-flex w-full h-full bg-blue-400 rounded-full opacity-75 animate-ping"></span>
                                    <span className="relative inline-flex w-3 h-3 bg-blue-500 rounded-full"></span>
                                  </span>
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    {/* Reason Input Modal */}
                    {showReason && (
                      <div className="p-4 mt-4 border border-gray-200 rounded-lg bg-gray-50">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          {t("Enter Cancel Reason")}:
                        </label>
                        <input
                          type="text"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Enter reason for cancellation"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor"
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              setShowReason(false);
                              setCancelReason("");
                            }}
                            className="px-4 py-2 text-gray-800 transition bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            onClick={() => {
                              if (!cancelReason.trim()) {
                                auth.toastError(
                                  t("Please enter a cancellation reason")
                                );
                                return;
                              }
                              handleChangeStaus(
                                detailsData.id,
                                "",
                                orderStatusName,
                                cancelReason
                              );
                              setCancelReason("");
                            }}
                            className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
                          >
                            {t("Confirm Cancellation")}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show existing cancellation reasons if they exist */}
                    {detailsData.order_status === "canceled" && (
                      <div className="p-4 mt-4 bg-gray-100 rounded-lg">
                        {detailsData.admin_cancel_reason && (
                          <div className="mb-3">
                            <p className="font-medium text-gray-800">
                              {t("Admin Cancellation Reason")}:
                            </p>
                            <p className="text-gray-600">
                              {detailsData.admin_cancel_reason}
                            </p>
                          </div>
                        )}
                        {detailsData.customer_cancel_reason && (
                          <div>
                            <p className="font-medium text-gray-800">
                              {t("Customer Cancellation Reason")}:
                            </p>
                            <p className="text-gray-600">
                              {detailsData.customer_cancel_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Cancel Reason Modal */}
                    <Dialog
                      open={showCancelModal}
                      onClose={() => setShowCancelModal(false)}
                      className="relative z-50"
                    >
                      <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />
                      <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
                          <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {t("Cancel Order")}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {t("Confirm Cancellation")}                            </p>
                          </div>

                          <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:border-mainColor focus:ring-mainColor"
                            rows={3}
                          />

                          <div className="flex justify-end mt-4 space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowCancelModal(false);
                                setCancelReason("");
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              {t("Cancel")}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!cancelReason.trim()) {
                                  auth.toastError(
                                    t("Please enter a cancellation reason")
                                  );
                                  return;
                                }
                                handleChangeStaus(
                                  detailsData.id,
                                  "",
                                  orderStatusName,
                                  cancelReason
                                );
                                setShowCancelModal(false);
                                setCancelReason("");
                              }}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              {t("Confirm Cancellation")}
                            </button>
                          </div>
                        </DialogPanel>
                      </div>
                    </Dialog>

                    {/* Refund Confirmation Modal */}
                    <Dialog
                      open={showRefundModal}
                      onClose={() => setShowRefundModal(false)}
                      className="relative z-50"
                    >
                      <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />
                      <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
                          <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {t("Confirm Refund")}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {t('Are you sure you want to refund this order?')}
                            </p>
                          </div>

                          <div className="flex justify-end mt-4 space-x-3">
                            <button
                              type="button"
                              onClick={() => setShowRefundModal(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              {t("No, Cancel")}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleChangeStaus(
                                  detailsData.id,
                                  "",
                                  "refund",
                                  ""
                                );
                                setShowRefundModal(false);
                              }}
                              className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-mainColor hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {t("Yes, Refund")}
                            </button>
                          </div>
                        </DialogPanel>
                      </div>
                    </Dialog>
                  </div>
                </div>

                {(detailsData.order_type === 'delivery') && (detailsData.order_status === 'processing' || detailsData.order_status === 'confirmed' || detailsData.order_status === 'out_for_delivery') && (
                  <button
                    className="w-full bg-mainColor text-white py-2 rounded-md mt-4"
                    onClick={() => handleOpenDeliviers(detailsData.id)}
                  >
                    {t("AssignDeliveryMan")}
                  </button>
                )}

                {/* Delivery man selection */}
                {openDeliveries === detailsData.id && (
                  <Dialog open={true} onClose={handleCloseDeliveries} className="relative z-10">
                    <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                      <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
                        <DialogPanel
                          className="relative sm:w-full sm:max-w-2xl pt-4 transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all h-[90vh]" // Increased height with h-[80vh]
                        >
                          <div className="mb-2 px-2">
                            <SearchBar
                              placeholder={t("SearchDelivery")}
                              value={searchDelivery}
                              handleChange={handleChangeDeliveries}
                            />
                          </div>
                          <div className="px-4 flex flex-col gap-3 overflow-y-auto max-h-[70vh]"> {/* Adjusted max-height for content */}
                            {deliveriesFilter.length === 0 ? (
                              <div className="text-center font-TextFontMedium text-mainColor">
                                {t("Not Found Delivery")}
                              </div>
                            ) : (
                              deliveriesFilter.map((delivery) => (
                                <div
                                  className="border-2 flex items-center justify-between border-gray-400 p-2 rounded-2xl"
                                  key={`${delivery.id}-${detailsData.id}`}
                                >
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="delivery"
                                      value={delivery.id}
                                      checked={selectedDeliveryId === delivery.id}
                                      onChange={() => setSelectedDeliveryId(delivery.id)}
                                      className="form-radio"
                                    />
                                    <span className="font-TextFontRegular text-xl">
                                      {delivery?.f_name || '-'} {delivery?.l_name || '-'}
                                    </span>
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                          {/* Dialog Footer */}
                          <div className="px-4 py-3 sm:flex sm:flex-row-reverse gap-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (!selectedDeliveryId) {
                                  auth.toastError(t("Please select a delivery person"));
                                  return;
                                }
                                handleAssignDelivery(selectedDeliveryId, detailsData.id, detailsData.order_number);
                              }}
                              className="inline-flex w-full justify-center rounded-md bg-mainColor px-6 py-3 text-sm font-TextFontMedium text-white shadow-sm sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                            >
                              {t("Submit")}
                            </button>
                            <button
                              type="button"
                              onClick={handleCloseDeliveries}
                              className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-300 px-6 py-3 text-sm font-TextFontMedium text-gray-800 shadow-sm sm:mt-0 sm:w-auto hover:bg-gray-400 focus:outline-none"
                            >
                              {t("Close")}
                            </button>
                          </div>
                        </DialogPanel>
                      </div>
                    </div>
                  </Dialog>
                )}

                <div className="p-4 mt-4 bg-white rounded-lg shadow-sm order-status-history">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800 history-title">
                    {t("Order Status History")}
                  </h3>
                  <div className="space-y-4 timeline">
                    {(dataDetailsOrder?.log_order || []).map((log, index) => (
                      <div
                        key={log.id}
                        className={`timeline-item relative pl-6 ${index === 0 ? "first-item" : ""
                          }`}
                      >
                        {/* Timeline marker */}
                        <div className="absolute left-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow timeline-marker top-2"></div>

                        {/* Timeline content */}
                        <div className="p-3 rounded-lg timeline-content bg-gray-50">
                          <div className="flex items-center gap-2 mb-1 status-change">
                            <span className="px-2 py-1 text-sm text-gray-700 bg-gray-200 rounded from-status">
                              {log.from_status === "processing"
                                ? t("Accept")
                                : log.from_status === "confirmed"
                                  ? t("Processing")
                                  : t(log.from_status)}
                            </span>
                            <span className="text-gray-400 arrow">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                />
                              </svg>
                            </span>

                            <span className="px-2 py-1 text-sm text-gray-700 bg-gray-200 rounded from-status">
                              {log.to_status === "processing"
                                ? t("Accept")
                                : log.to_status === "confirmed"
                                  ? t("Processing")
                                  : t(log.to_status)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 meta-info">
                            <span className="changed-by">
                              {t("Changed by")}:{" "}
                              <span className="font-medium">
                                {log.admin?.name || "-"}
                              </span>
                            </span>
                            <span className="change-date">
                              {log.created_at ? new Date(log.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Timeline connector (except for last item) */}
                        {index !== (dataDetailsOrder?.log_order?.length ?? 0) - 1 && (
                          <div className="timeline-connector absolute left-[5px] top-5 bottom-0 w-px bg-gray-300"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Food Preparation Time */}
                {(detailsData.order_status === "pending" ||
                  detailsData.order_status === "confirmed" ||
                  detailsData.order_status === "processing" ||
                  detailsData.order_status === "out_for_delivery") && (
                    <div className="w-full p-4 mt-4 bg-white shadow-md rounded-xl">
                      <h3 className="text-lg font-TextFontSemiBold">
                        {t("Food Preparation Time")}
                      </h3>
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-gray-500" />
                        {preparationTime && typeof preparationTime?.hours !== "undefined" ? (
                          <>
                            <span
                              className={
                                olderHours +
                                  preparationTime.hours -
                                  initialTime.currentHour <=
                                  0 ||
                                  olderDay +
                                  preparationTime.days -
                                  initialTime.currentDay <=
                                  0
                                  ? "text-red-500"
                                  : "text-cyan-400"
                              }
                            >
                              {olderHours +
                                preparationTime.hours -
                                initialTime.currentHour <=
                                0 ? (
                                <>
                                  {olderDay +
                                    preparationTime.days -
                                    initialTime.currentDay}
                                  d{" "}
                                  {initialTime.currentHour -
                                    (olderHours + preparationTime.hours)}
                                  h{" "}
                                  {olderMinutes +
                                    preparationTime.minutes -
                                    initialTime.currentMinute}
                                  m {preparationTime.seconds}s {t("Over")}
                                </>
                              ) : (
                                <>
                                  {initialTime.currentDay - olderDay}d{" "}
                                  {preparationTime.hours}h{" "}
                                  {olderMinutes +
                                    preparationTime.minutes -
                                    initialTime.currentMinute}
                                  m {preparationTime.seconds}s {t("Left")}
                                </>
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">
                            {t("Preparing time not available")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {detailsData.delivery_id !== null && (
                  <div className="w-full p-4 mt-2 bg-white shadow-md rounded-xl">
                    <div className="flex items-center text-lg gap-x-2 font-TextFontSemiBold">
                      <span>
                        <FaUser className="text-mainColor" />
                      </span>
                      {t("DeliveryMan")}
                    </div>
                    <p className="text-sm">
                      {t("Name")}: {detailsData?.delivery?.f_name || "-"}{" "}
                      {detailsData?.delivery?.l_name || "-"}
                    </p>
                    <p className="text-sm">
                      {t('Orders')}: {detailsData?.delivery?.count_orders || "-"}
                    </p>
                    <p className="text-sm">
                      {t("Contact")}: {detailsData?.delivery?.phone || "-"}
                    </p>
                    <p className="text-sm">
                      {t("Email")}: {detailsData?.delivery?.email || "-"}
                    </p>
                  </div>
                )}
              </div>

              {/* Processing Order Modal */}
              {showStatusModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    {/* Background overlay */}
                    <div
                      className="fixed inset-0 transition-opacity"
                      aria-hidden="true"
                      onClick={() => setShowStatusModal(false)}
                    >
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    {/* Modal container */}
                    <span
                      className="hidden sm:inline-block sm:align-middle sm:h-screen"
                      aria-hidden="true"
                    >
                      &#8203;
                    </span>

                    {/* Modal content */}
                    <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                            <svg
                              className="w-6 h-6 text-red-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          </div>
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                              {t("Order in Use by Another Person")}
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                {t("Someone else is currently working on this order. Please wait until they finish before proceeding to avoid conflicts or duplication.")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          onClick={() => setShowStatusModal(false)}
                          className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-mainColor hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {t("Ok")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default DetailsOrderPage;
