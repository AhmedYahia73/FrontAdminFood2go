import LineChart from "./LineChart";
import DoughnutChart from "./Doughnut ";
import RecentOrders from "./RecentOrder";
import { useTranslation } from "react-i18next";

const Chart = ({ order_statistics, earning_statistics, orders, recent_orders }) => {
  const {t}=useTranslation();

  return (
    <>
      <div className="w-full gap-10 text-black">
        {/* First Row */}
        <div className="flex flex-col justify-between w-full gap-6 lg:flex-row">
          {/* Chart Container for LineChart */}
          <div className="w-full lg:w-[70%]  flex flex-1">
            <div
              id="chart1"
              className="w-full h-full bg-white rounded-lg shadow-xl"
            >
              <LineChart title={t("OrderStatistics")} data={order_statistics} />
            </div>
          </div>

          {/* Container for DoughnutChart */}
          <div className="w-full lg:w-[30%] ">
            <div className="h-full p-3 bg-white rounded-lg shadow-xl">
              <DoughnutChart ordersData={orders} />
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex flex-col justify-start w-full gap-6 pt-4 lg:flex-row">
          {/* Chart Container for Earning Statistics */}
          <div className="w-full lg:w-[70%] flex flex-1">
            <div
              id="chart2"
              className="w-full h-full bg-white rounded-lg shadow-xl"
            >
              <LineChart
                title={t("EarningStatistics")}
                data={earning_statistics}
              />
            </div>
          </div>

          {/* Flex Container for Recent Orders */}
          <div className="w-full lg:w-[30%]">
            <div className="h-full p-1 bg-white rounded-lg shadow-xl">
              <RecentOrders recent_orders={recent_orders} />
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Chart;
