import React, { useEffect, useState, useMemo } from "react";
import CartsOrderSection from "../Orders/AllOrders/CartsOrderSection";
import { LoaderLogin } from "../../../../Components/Components";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useGet } from "../../../../Hooks/useGet";
import Chart from "./Charts/Chart";
import FooterCard from "./FooterHome/FooterCard";
import SelectDateRangeSection from "../Orders/SelectDateRangeSection";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";

import ProfessionalDashboard from "./ProfessionalDashboard";

const HomePage = () => {
  const { t, i18n } = useTranslation();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const role = localStorage.getItem("role"); // "admin" or "branch"

  // ✅ Home chart
  const {
    refetch: refetchChart,
    loading: loadingChart,
    data: dataCharts,
  } = useGet({
    url: role === "branch"
      ? `${apiUrl}/branch/home`
      : `${apiUrl}/admin/home`,
  });

  // ✅ Orders summary
  const {
    refetch: refetchOrders,
    loading: loadingOrders,
    data: dataOrders,
  } = useGet({
    url: role === "branch"
      ? `${apiUrl}/branch/home/online_order`
      : `${apiUrl}/admin/home/orders`,
  });

  // ✅ Branch list for statistics
  const {
    refetch: refetchBranches,
    data: dataBranches,
  } = useGet({
    url: `${apiUrl}/admin/order/branches`,
  });

  const {
    refetch: refetchHomeData,
    loading: loadingHomeData,
    data: dataHomeData,
  } = useGet({
    url: role === "branch"
      ? `${apiUrl}/branch/home/home_data`
      : `${apiUrl}/admin/home/home_data`,
  });

  const [order_statistics, setOrder_statistics] = useState({})
  const [earning_statistics, setEarning_statistics] = useState({})
  const [orders, setOrders] = useState({})
  const [recent_orders, setRecent_orders] = useState([])
  const [offers, setOffers] = useState([])
  const [topSelling, SetTopSelling] = useState([])
  const [topCustomers, setTopCustomers] = useState({})
  const [showSMSMessage, setShowSMSMessage] = useState(false);

  // React Query automatically fetches on mount and respects cache, so we don't need manual refetch() in useEffect

  useEffect(() => {
    if (dataCharts) {
      setOrder_statistics(dataCharts.order_statistics)
      setEarning_statistics(dataCharts.earning_statistics)
      setRecent_orders(dataCharts.recent_orders)
      setOffers(dataCharts.offers)
      SetTopSelling(dataCharts.top_selling)
      setTopCustomers(dataCharts.top_customers)
      setOrders(dataCharts.order_statistics)
    }
  }, [dataCharts]);

  useEffect(() => {
    if (dataOrders?.msg_package !== false) {
      setShowSMSMessage(true);
    }
  }, [dataOrders]);

  // Map real data to the structure expected by ProfessionalDashboard
  const dashboardRealData = useMemo(() => {
    if (!dataCharts || !dataOrders || !dataHomeData) return null;

    // Helper to format chart data if available
    const formatStats = (stats) => {
      if (!stats) return null;
      return {
        labels: Object.keys(stats),
        data: Object.values(stats)
      };
    };

    const orderStats = formatStats(dataCharts.order_statistics);
    const earningStats = formatStats(dataCharts.earning_statistics);

    // Extract unique hours across all hourly arrays
    const allHoursStr = new Set();
    [
      ...(dataHomeData.sales_hourly || []),
      ...(dataHomeData.return_hourly || []),
      ...(dataHomeData.discount_hourly || []),
      ...(dataHomeData.order_types || []),
    ].forEach(item => {
      if (item.hour) allHoursStr.add(item.hour);
    });
    
    // Convert to array (we assume chronological order from backend is kept by Set)
    const hourlyLabels = Array.from(allHoursStr);

    const formatTimeLabel = (fullLabel) => {
        if (!fullLabel) return "";
        const parts = fullLabel.split(' ');
        if (parts.length >= 3) {
            return `${parts[1]} ${parts[2]}`; // e.g. "12 PM"
        }
        return fullLabel;
    };
    const formattedHourlyLabels = hourlyLabels.map(formatTimeLabel);

    const getHourlyVal = (arr, hour, field) => {
        if (!arr) return 0;
        const item = arr.find(x => x.hour === hour);
        return item ? Number(item[field] || 0) : 0;
    };

    const getHourlySum = (arr, hour, field) => {
        if (!arr) return 0;
        return arr.filter(x => x.hour === hour).reduce((sum, item) => sum + Number(item[field] || 0), 0);
    };

    const getOrderTypeCount = (arr, hour, type) => {
        if (!arr) return 0;
        const item = arr.find(x => x.hour === hour && x.order_type === type);
        return item ? Number(item.order_count || 0) : 0;
    };

    const topBranchesArr = (dataHomeData.branch_sales || [])
      .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
      .slice(0, 5);

    const topPaymentsArr = (dataHomeData.top_payment_method || [])
      .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
      .slice(0, 5);

    return {
      kpis: {
        activeOrders: dataOrders?.orders || 0,
        activeAmount: dataCharts?.earning_statistics ? Object.values(dataCharts.earning_statistics).reduce((a, b) => a + Number(b), 0).toFixed(2) : 0,
        occupiedTables: dataCharts?.occupied_tables || 0,
        offlineCashiers: dataCharts?.offline_cashiers || 0
      },
      topProducts: dataHomeData.top_product ? {
        labels: dataHomeData.top_product.map(p => p.product?.name || `Product ${p.product_id}`),
        values: dataHomeData.top_product.map(p => Number(p.total_sales)),
        orders_count: dataHomeData.top_product.map(p => Number(p.total_sales))
      } : { labels: [], values: [], orders_count: [] },
      topBranches: {
        labels: topBranchesArr.map(b => b.branch?.name || t("Unknown")),
        values: topBranchesArr.map(b => Number(b.total_amount))
      },
      topPayments: {
        labels: topPaymentsArr.map(p => p.payment_method?.name || t("Unknown")),
        values: topPaymentsArr.map(p => Number(p.total_amount))
      },
      orderTypes: {
        labels: formattedHourlyLabels,
        dineIn: hourlyLabels.map(h => getOrderTypeCount(dataHomeData.order_types, h, 'dine_in')),
        delivery: hourlyLabels.map(h => getOrderTypeCount(dataHomeData.order_types, h, 'delivery')),
        takeaway: hourlyLabels.map(h => getOrderTypeCount(dataHomeData.order_types, h, 'take_away')),
      },
      hourlySales: {
        labels: formattedHourlyLabels,
        orders: hourlyLabels.map(h => getHourlyVal(dataHomeData.sales_hourly, h, 'total_amount'))
      },
      timeSeries: {
        labels: formattedHourlyLabels,
        orders: hourlyLabels.map(h => getHourlySum(dataHomeData.order_types, h, 'order_count')), // Sum of order counts for the hour across types
        netSales: hourlyLabels.map(h => getHourlyVal(dataHomeData.sales_hourly, h, 'total_amount')),
        netPayments: hourlyLabels.map(h => {
             // We can use earningStats if we don't have hourly payments
             // For now, estimated netPayments based on 95% of sales
             return getHourlyVal(dataHomeData.sales_hourly, h, 'total_amount'); 
        }),
        returns: hourlyLabels.map(h => getHourlyVal(dataHomeData.return_hourly, h, 'total_amount')),
        discounts: hourlyLabels.map(h => getHourlyVal(dataHomeData.discount_hourly, h, 'total_discount')) 
      }
    };
  }, [dataCharts, dataOrders, dataHomeData, t]);

  const counters = useMemo(() => ({
    ordersAll: dataOrders?.orders || 0,
    ordersPending: dataOrders?.pending || 0,
    ordersConfirmed: dataOrders?.confirmed || 0,
    ordersProcessing: dataOrders?.processing || 0,
    ordersOutForDelivery: dataOrders?.out_for_delivery || 0,
    ordersDelivered: dataOrders?.delivered || 0,
    ordersReturned: dataOrders?.returned || 0,
    ordersFailed: dataOrders?.faild_to_deliver || 0,
    ordersCanceled: dataOrders?.canceled || 0,
    ordersSchedule: dataOrders?.scheduled || 0,
    ordersRefund: dataOrders?.refund || 0,
  }), [dataOrders]);

  const renderSMSMessageCard = () => {
    if (!showSMSMessage || !dataOrders?.msg_package) return null;

    return (
      <div className="w-full px-4 py-3 mb-6 bg-white border border-gray-300 shadow-lg rounded-xl">
        <div className="flex items-center justify-between pb-1 mb-4 border-b-2">
          <h3 className="text-xl font-TextFontSemiBold text-mainColor">
            {t("SMSPackage")}
          </h3>
        </div>

        <div className="flex flex-col w-full pb-2 gap-y-4">
          <div className="flex items-center justify-between w-full p-4 border-b-2 border-gray-300 shadow-md rounded-xl">
            <div className="flex flex-col items-start">
              <p className="text-gray-500 font-TextFontMedium">
                {t("AvailableMessages")}
              </p>
              <p className="text-lg font-TextFontSemiBold text-mainColor">
                {dataOrders.msg_package?.msg_number}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <p className="text-gray-500 font-TextFontMedium">
                {t("ValidityPeriod")}
              </p>
              <div className="text-right">
                <p className="text-sm font-TextFontMedium text-mainColor">
                  {t("From")}: {dataOrders.msg_package?.from}
                </p>
                <p className="text-sm font-TextFontMedium text-mainColor">
                  {t("To")}: {dataOrders.msg_package?.to}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        {(loadingOrders || loadingChart) ? (
          <div className="flex items-center justify-center w-full min-h-[400px]">
            <LoaderLogin />
          </div>
        ) : (
          <div className="flex flex-col items-start justify-center w-full pb-28">
            {/* <div className="w-full px-2 md:px-6 pt-4">
              <SelectDateRangeSection typPage={'all'} />

              <div className="mt-6">
                <CartsOrderSection ordersNum={counters} />
              </div>
            </div> */}

            <div className="flex flex-col items-start justify-center w-full px-2 md:px-3 xl:px-6 gap-7 mt-5">

              {/* New Professional Dashboard */}
              <ProfessionalDashboard realData={dashboardRealData} />

              {/* Old Chart Restored to the bottom */}
              <div className="flex flex-col items-start justify-center w-full px-1 md:px-3 xl:px-6 gap-7 mt-12">
                <Chart
                  order_statistics={order_statistics}
                  earning_statistics={earning_statistics}
                  recent_orders={recent_orders}
                  orders={orders}
                />
                <div className="flex flex-wrap items-center justify-between w-full gap-5">
                  {renderSMSMessageCard()}

                  <FooterCard title={t("TopSellingProducts")} link="/dashboard/setup_product/product" layout={"TopSelling"} topCustomers={topCustomers} topSelling={topSelling} offers={offers} />
                  {/* <FooterCard title={t("Deals")} link="/dashboard/deals" layout={"Deals"} topCustomers={topCustomers} topSelling={topSelling} offers={offers} /> */}
                  <FooterCard title={t("TopCustomer")} link="/dashboard/users/customers" layout={"default"} topCustomers={topCustomers} topSelling={topSelling} offers={offers} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;