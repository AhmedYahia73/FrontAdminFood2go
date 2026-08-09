import React, { useEffect } from "react";
import { LoaderLogin, TitlePage } from "../../../../Components/Components";
import AllOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/AllOrders/AllOrdersPage";
import CartsOrderSection from "../../../../Pages/Dashboard/Admin/Orders/AllOrders/CartsOrderSection";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { useGet } from "../../../../Hooks/useGet";
import { useSelector } from "react-redux";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useTranslation } from "react-i18next";

const AllOrdersLayout = () => {
  const { t, i18n } = useTranslation();
  const userRole = localStorage.getItem("role") || "admin";
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Fetch order counts from API
  const { data: countData, loading: countLoading } = useGet({
    url: userRole === "admin" ? `${apiUrl}/admin/order/count` : null,
  });

  // Check if filter is active
  const filterActive = useSelector((state) => state.filterActive?.active);

  const ordersAllCount = useSelector((state) => state.ordersAll.data);
  const ordersAllCountLoading = useSelector((state) => state.ordersAll.loading);
  const ordersPendingCount = useSelector((state) => state.ordersPending.data);
  const ordersConfirmedCount = useSelector((state) => state.ordersConfirmed.data);
  const ordersProcessingCount = useSelector((state) => state.ordersProcessing.data);
  const ordersOutForDeliveryCount = useSelector((state) => state.ordersOutForDelivery.data);
  const ordersDeliveredCount = useSelector((state) => state.ordersDelivered.data);
  const ordersReturnedCount = useSelector((state) => state.ordersReturned.data);
  const ordersRefundCount = useSelector((state) => state.ordersRefund.data);
  const ordersFailedCount = useSelector((state) => state.ordersFailed.data);
  const ordersCanceledCount = useSelector((state) => state.ordersCanceled.data);
  const ordersScheduleCount = useSelector((state) => state.ordersSchedule.data);

  // const counters = {
  //   ordersAll: ordersAllCount.length,
  //   ordersPending: ordersPendingCount.length,
  //   ordersConfirmed: ordersConfirmedCount.length,
  //   ordersProcessing: ordersProcessingCount.length,
  //   ordersOutForDelivery: ordersOutForDeliveryCount.length,
  //   ordersDelivered: ordersDeliveredCount.length,
  //   ordersReturned: ordersReturnedCount.length,
  //   ordersFailed: ordersFailedCount.length,
  //   ordersCanceled: ordersCanceledCount.length,
  //   ordersSchedule: ordersScheduleCount.length,
  //   ordersRefund:ordersRefundCount.length,
  // }

  // Use API counter data as default, fall back to filtered array if not available
  // When filter is active, calculate counts from filtered Redux data
  const counters = filterActive ? {
    ordersAll: ordersAllCount?.length || 0,
    ordersPending: ordersAllCount?.filter(
      (order) => order.order_status === "pending"
    ).length || 0,
    ordersConfirmed: ordersAllCount?.filter(
      (order) => order.order_status === "confirmed"
    ).length || 0,
    ordersProcessing: ordersAllCount?.filter(
      (order) => order.order_status === "processing"
    ).length || 0,
    ordersOutForDelivery: ordersAllCount?.filter(
      (order) => order.order_status === "out_for_delivery"
    ).length || 0,
    ordersDelivered: ordersAllCount?.filter(
      (order) => order.order_status === "delivered"
    ).length || 0,
    ordersReturned: ordersAllCount?.filter(
      (order) => order.order_status === "returned"
    ).length || 0,
    ordersRefund: ordersAllCount?.filter(
      (order) => order.order_status === "refund"
    ).length || 0,
    ordersFailed: ordersAllCount?.filter(
      (order) => order.order_status === "faild_to_deliver"
    ).length || 0,
    ordersCanceled: ordersAllCount?.filter(
      (order) => order.order_status === "canceled"
    ).length || 0,
    ordersSchedule: ordersAllCount?.filter(
      (order) => order.order_status === "scheduled"
    ).length || 0,
  } : countData ? {
    ordersAll: countData.all || 0,
    ordersPending: countData.pending || 0,
    ordersConfirmed: countData.confirmed || 0,
    ordersProcessing: countData.processing || 0,
    ordersOutForDelivery: countData.out_for_delivery || 0,
    ordersDelivered: countData.delivered || 0,
    ordersReturned: countData.returned || 0,
    ordersRefund: countData.refund || 0,
    ordersFailed: countData.faild_to_deliver || 0,
    ordersCanceled: countData.canceled || 0,
    ordersSchedule: countData.scheduled || 0,
  } : {
    ordersAll: ordersAllCount?.length || 0,
    ordersPending: ordersAllCount?.filter(
      (order) => order.order_status === "pending"
    ).length || 0,
    ordersConfirmed: ordersAllCount?.filter(
      (order) => order.order_status === "confirmed"
    ).length || 0,
    ordersProcessing: ordersAllCount?.filter(
      (order) => order.order_status === "processing"
    ).length || 0,
    ordersOutForDelivery: ordersAllCount?.filter(
      (order) => order.order_status === "out_for_delivery"
    ).length || 0,
    ordersDelivered: ordersAllCount?.filter(
      (order) => order.order_status === "delivered"
    ).length || 0,
    ordersReturned: ordersAllCount?.filter(
      (order) => order.order_status === "returned"
    ).length || 0,
    ordersRefund: ordersAllCount?.filter(
      (order) => order.order_status === "refund"
    ).length || 0,
    ordersFailed: ordersAllCount?.filter(
      (order) => order.order_status === "faild_to_deliver"
    ).length || 0,
    ordersCanceled: ordersAllCount?.filter(
      (order) => order.order_status === "canceled"
    ).length || 0,
    ordersSchedule: ordersAllCount?.filter(
      (order) => order.order_status === "scheduled"
    ).length || 0,
  };

  return (
    <>
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        <TitlePage text={t("AllOrders")} />
        {ordersAllCountLoading || countLoading ? (
          <>
            <div className="flex items-center justify-center w-full">
              <LoaderLogin />
            </div>
          </>
        ) : (
          <>
            <SelectDateRangeSection typPage={"all"}/>

            <CartsOrderSection ordersNum={counters} />
            <AllOrdersPage />
          </>
        )}
      </div>
    </>
  );
};

export default AllOrdersLayout;
