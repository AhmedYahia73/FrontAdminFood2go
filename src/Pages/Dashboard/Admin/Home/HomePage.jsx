import { useEffect, useState, useMemo } from "react";
import { LoaderLogin } from "../../../../Components/Components";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useGet } from "../../../../Hooks/useGet";
import Chart from "./Charts/Chart";
import FooterCard from "./FooterHome/FooterCard";
import { useTranslation } from "react-i18next";

import ProfessionalDashboard from "./ProfessionalDashboard";

const HomePage = () => {
  const { t } = useTranslation();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const role = localStorage.getItem("role"); // "admin" or "branch"

  // ✅ New Unified Overview API (Consolidated, Accurate & High-Performance)
  const {
    loading: loadingOverview,
    data: dataOverview,
  } = useGet({
    url: role === "branch"
      ? `${apiUrl}/branch/home/overview`
      : `${apiUrl}/admin/home/overview`,
  });

  const [order_statistics, setOrder_statistics] = useState({});
  const [earning_statistics, setEarning_statistics] = useState({});
  const [orders, setOrders] = useState({});
  const [recent_orders, setRecent_orders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [topSelling, SetTopSelling] = useState([]);
  const [topCustomers, setTopCustomers] = useState({});
  const [showSMSMessage, setShowSMSMessage] = useState(false);

  useEffect(() => {
    if (dataOverview) {
      setOrder_statistics(dataOverview.order_statistics || {});
      setEarning_statistics(dataOverview.earning_statistics || {});
      setRecent_orders(dataOverview.recent_orders || []);
      setOffers(dataOverview.offers || []);
      SetTopSelling(dataOverview.top_selling || []);
      setTopCustomers(dataOverview.top_customers || {});
      setOrders(dataOverview.order_statistics || {});

      if (dataOverview.msg_package && dataOverview.msg_package !== false) {
        setShowSMSMessage(true);
      }
    }
  }, [dataOverview]);

  // Map real data to the structure expected by ProfessionalDashboard
  const dashboardRealData = useMemo(() => {
    if (!dataOverview) return null;

    const topBranchesArr = (dataOverview.branch_sales || [])
      .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
      .slice(0, 5);

    const topPaymentsArr = (dataOverview.top_payment_method || [])
      .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
      .slice(0, 5);

    // Extract unique hours across all hourly arrays
    const allHoursStr = new Set();
    [
      ...(dataOverview.sales_hourly || []),
      ...(dataOverview.payments_hourly || []),
      ...(dataOverview.return_hourly || []),
      ...(dataOverview.discount_hourly || []),
      ...(dataOverview.order_types || []),
    ].forEach(item => {
      if (item.hour) allHoursStr.add(item.hour);
    });
    
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

    const kpisData = dataOverview.kpis || {};

    return {
      kpis: {
        activeOrders: kpisData.active_orders ?? dataOverview.active_orders ?? 0,
        activeAmount: kpisData.active_amount ?? dataOverview.active_amount ?? 0,
        occupiedTables: kpisData.occupied_tables ?? dataOverview.occupied_tables ?? 0,
        offlineCashiers: kpisData.offline_cashiers ?? dataOverview.offline_cashiers ?? 0,
        onlineCashiers: kpisData.online_cashiers ?? dataOverview.online_cashiers ?? 0,
      },
      topProducts: dataOverview.top_product ? {
        labels: dataOverview.top_product.map(p => p.product?.name || `Product ${p.product_id}`),
        values: dataOverview.top_product.map(p => Number(p.total_amount || p.total_sales || 0)),
        orders_count: dataOverview.top_product.map(p => Number(p.total_sales || 0))
      } : { labels: [], values: [], orders_count: [] },
      topBranches: {
        labels: topBranchesArr.map(b => b.branch?.name || t("Unknown")),
        values: topBranchesArr.map(b => Number(b.total_amount || 0))
      },
      topPayments: {
        labels: topPaymentsArr.map(p => p.payment_method?.name || t("Unknown")),
        values: topPaymentsArr.map(p => Number(p.total_amount || 0))
      },
      orderTypes: {
        labels: formattedHourlyLabels,
        dineIn: hourlyLabels.map(h => getOrderTypeCount(dataOverview.order_types, h, 'dine_in')),
        delivery: hourlyLabels.map(h => getOrderTypeCount(dataOverview.order_types, h, 'delivery')),
        takeaway: hourlyLabels.map(h => getOrderTypeCount(dataOverview.order_types, h, 'take_away')),
      },
      hourlySales: {
        labels: formattedHourlyLabels,
        orders: hourlyLabels.map(h => getHourlyVal(dataOverview.sales_hourly, h, 'total_amount'))
      },
      timeSeries: {
        labels: formattedHourlyLabels,
        orders: hourlyLabels.map(h => getHourlySum(dataOverview.order_types, h, 'order_count')),
        netSales: hourlyLabels.map(h => getHourlyVal(dataOverview.sales_hourly, h, 'total_amount')),
        netPayments: hourlyLabels.map(h => getHourlyVal(dataOverview.payments_hourly || dataOverview.sales_hourly, h, 'total_amount')),
        returns: hourlyLabels.map(h => getHourlyVal(dataOverview.return_hourly, h, 'total_amount')),
        discounts: hourlyLabels.map(h => getHourlyVal(dataOverview.discount_hourly, h, 'total_discount')) 
      }
    };
  }, [dataOverview, t]);

  const counters = useMemo(() => {
    const summary = dataOverview?.orders_summary || dataOverview?.orders_count || {};
    return {
      ordersAll: summary?.orders || 0,
      ordersPending: summary?.pending || 0,
      ordersConfirmed: summary?.confirmed || 0,
      ordersProcessing: summary?.processing || 0,
      ordersOutForDelivery: summary?.out_for_delivery || 0,
      ordersDelivered: summary?.delivered || 0,
      ordersReturned: summary?.returned || 0,
      ordersFailed: summary?.faild_to_deliver || 0,
      ordersCanceled: summary?.canceled || 0,
      ordersSchedule: summary?.scheduled || 0,
      ordersRefund: summary?.refund || 0,
    };
  }, [dataOverview]);

  const renderSMSMessageCard = () => {
    const msgPackage = dataOverview?.msg_package;
    if (!showSMSMessage || !msgPackage) return null;

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
                {msgPackage?.msg_number}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <p className="text-gray-500 font-TextFontMedium">
                {t("ValidityPeriod")}
              </p>
              <div className="text-right">
                <p className="text-sm font-TextFontMedium text-mainColor">
                  {t("From")}: {msgPackage?.from}
                </p>
                <p className="text-sm font-TextFontMedium text-mainColor">
                  {t("To")}: {msgPackage?.to}
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
        {loadingOverview ? (
          <div className="flex items-center justify-center w-full min-h-[400px]">
            <LoaderLogin />
          </div>
        ) : (
          <div className="flex flex-col items-start justify-center w-full pb-28">
            <div className="flex flex-col items-start justify-center w-full px-2 md:px-3 xl:px-6 gap-7 mt-5">

              {/* Professional Dashboard (Accurate Real Data) */}
              <ProfessionalDashboard realData={dashboardRealData} />

              {/* Monthly Statistics Chart & Recent Orders */}
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
