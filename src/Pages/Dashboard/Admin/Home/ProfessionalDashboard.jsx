import React, { useMemo } from 'react';
import DashboardKpiCards from './Charts/DashboardKpiCards';
import StandardLineChart from './Charts/StandardLineChart';
import OrderTypeDistributionChart from './Charts/OrderTypeDistributionChart';
import HourlySalesBarChart from './Charts/HourlySalesBarChart';
import SimplePieChart from './Charts/SimplePieChart';

const ProfessionalDashboard = ({ realData }) => {
    const data = useMemo(() => {
        const safeData = realData || {};
        const timeSeries = safeData.timeSeries || {
            labels: [],
            orders: [],
            netSales: [],
            netPayments: [],
            returns: [],
            discounts: []
        };

        return {
            kpis: safeData.kpis || {},
            timeSeries: timeSeries,
            orderTypes: safeData.orderTypes || {
                labels: [],
                dineIn: [],
                delivery: [],
                takeaway: [],
                driveThru: []
            },
            hourlySales: safeData.hourlySales || { labels: [], orders: [] },
            topProducts: safeData.topProducts || { labels: [], values: [] },
            topPayments: safeData.topPayments || { labels: [], values: [] },
            topFinancial: safeData.topFinancial || { labels: [], values: [] },
            topBranches: safeData.topBranches || { labels: [], values: [] },
        };
    }, [realData]);

    return (
        <div className="w-full flex flex-col gap-6 p-1 md:p-3 xl:p-6 bg-gray-50/50 min-h-screen">
            {/* 1. Header KPIs */}
            <DashboardKpiCards kpis={data.kpis} />

            {/* 2. Main Time Series Grid (Foodics Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <StandardLineChart
                    title="# of Orders"
                    labels={data.timeSeries.labels}
                    data={data.timeSeries.orders}
                    color="#6045EC"
                    unit=""
                    viewReportLink="/dashboard/reports/orders_report"
                />
                <StandardLineChart
                    title="Net Sales"
                    labels={data.timeSeries.labels}
                    data={data.timeSeries.netSales}
                    color="#6045EC"
                    unit="EGP"
                    viewReportLink="/dashboard/reports/financial_report"
                />
                <StandardLineChart
                    title="Net Payments"
                    labels={data.timeSeries.labels}
                    data={data.timeSeries.netPayments}
                    color="#6045EC"
                    unit="EGP"
                    viewReportLink="/dashboard/reports/financial_report"
                />
                <StandardLineChart
                    title="Return Amount"
                    labels={data.timeSeries.labels}
                    data={data.timeSeries.returns}
                    color="#6045EC"
                    unit="EGP"
                    viewReportLink="/dashboard/reports/financial_report"
                />
                <StandardLineChart
                    title="Discount Amount"
                    labels={data.timeSeries.labels}
                    data={data.timeSeries.discounts}
                    color="#6045EC"
                    unit="EGP"
                    viewReportLink="/dashboard/reports/financial_report"
                />
            </div>

            {/* 3. Secondary Insights Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <OrderTypeDistributionChart
                    labels={data.orderTypes.labels}
                    dineIn={data.orderTypes.dineIn}
                    delivery={data.orderTypes.delivery}
                    takeaway={data.orderTypes.takeaway}
                    driveThru={data.orderTypes.driveThru}
                    viewReportLink="/dashboard/reports/orders_report"
                />
                <HourlySalesBarChart
                    labels={data.hourlySales.labels}
                    orders={data.hourlySales.orders}
                    viewReportLink="/dashboard/reports/financial_report"
                />
            </div>

            {/* 4. Top Performance Pie Charts (Products, Payments, Financial Accounts, Branches) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <SimplePieChart
                    title="Top Products by Net Sales (EGP)"
                    labels={data.topProducts.labels}
                    values={data.topProducts.values}
                    unit="EGP"
                    viewReportLink="/dashboard/reports/product_report"
                />
                <SimplePieChart
                    title="Top Payments (EGP)"
                    labels={data.topPayments.labels}
                    values={data.topPayments.values}
                    unit="EGP"
                    viewReportLink="/dashboard/reports/financial_report"
                />
                <SimplePieChart
                    title="Top Financial Accounts (EGP)"
                    labels={data.topFinancial.labels}
                    values={data.topFinancial.values}
                    unit="EGP"
                    viewReportLink="/dashboard/reports/financial_report"
                />
                <SimplePieChart
                    title="Top Branches by Net Sales (EGP)"
                    labels={data.topBranches.labels}
                    values={data.topBranches.values}
                    unit="EGP"
                    viewReportLink="/dashboard/reports/financial_report"
                />
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
