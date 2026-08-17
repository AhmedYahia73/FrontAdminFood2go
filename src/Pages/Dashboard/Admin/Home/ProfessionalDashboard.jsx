import React, { useMemo } from 'react';
import DashboardKpiCards from './Charts/DashboardKpiCards';
import StandardLineChart from './Charts/StandardLineChart';
import OrderTypeDistributionChart from './Charts/OrderTypeDistributionChart';
import HourlySalesBarChart from './Charts/HourlySalesBarChart';
import TopProductsBarChart from './Charts/TopProductsBarChart';
import SimplePieChart from './Charts/SimplePieChart';

const ProfessionalDashboard = ({ realData }) => {
    // Process real data into charts formatting
    const data = useMemo(() => {
        const safeData = realData || {};
        const timeSeries = safeData.timeSeries || { labels: [], orders: [], netSales: [], netPayments: [], returns: [], discounts: [] };
        
        // Create enriched labels that include order counts for financial charts
        const enrichedFinancialLabels = (timeSeries.labels || []).map((label, index) => {
            const count = (timeSeries.orders || [])[index] || 0;
            return `${label} (${count} Orders)`;
        });

        return {
            kpis: safeData.kpis || {},
            timeSeries: timeSeries,
            orderTypes: safeData.orderTypes || { labels: [], dineIn: [], delivery: [], takeaway: [] },
            hourlySales: safeData.hourlySales || { labels: [], orders: [] },
            topProducts: safeData.topProducts || { labels: [], values: [] },
            topPayments: safeData.topPayments || { labels: [], values: [] },
            topBranches: safeData.topBranches || { labels: [], values: [] },
            enrichedFinancialLabels
        };
    }, [realData]);

    return (
        <div className="w-full flex flex-col gap-4 p-1 md:p-3 xl:p-6 bg-gray-50/50 min-h-screen">
            {/* Header / KPIs */}
            <DashboardKpiCards kpis={data.kpis} />

            {/* Main Time Series Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <StandardLineChart
                    title="# of Orders"
                    labels={data.timeSeries.labels}
                    data={data.timeSeries.orders}
                    color="#9E090F"
                />
                <StandardLineChart
                    title="Net Sales"
                    labels={data.enrichedFinancialLabels}
                    data={data.timeSeries.netSales}
                    color="#10b981"
                    unit="EGP"
                />
                <StandardLineChart
                    title="Net Payments"
                    labels={data.enrichedFinancialLabels}
                    data={data.timeSeries.netPayments}
                    color="#3b82f6"
                    unit="EGP"
                />
                <StandardLineChart
                    title="Return Amount"
                    labels={data.enrichedFinancialLabels}
                    data={data.timeSeries.returns}
                    color="#ef4444"
                    unit="EGP"
                />
                <StandardLineChart
                    title="Discount Amount"
                    labels={data.enrichedFinancialLabels}
                    data={data.timeSeries.discounts}
                    color="#f59e0b"
                    unit="EGP"
                />
            </div>

            {/* Secondary Insights Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <OrderTypeDistributionChart
                    labels={data.orderTypes.labels}
                    dineIn={data.orderTypes.dineIn}
                    delivery={data.orderTypes.delivery}
                    takeaway={data.orderTypes.takeaway}
                />
                <HourlySalesBarChart
                    labels={data.hourlySales.labels}
                    orders={data.hourlySales.orders}
                />
            </div>

            {/* Top Performance Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1">
                    <TopProductsBarChart
                        labels={data.topProducts.labels}
                        values={data.topProducts.orders_count}
                    />
                </div>
                <div className="xl:col-span-1">
                    <SimplePieChart
                        title="Top Payments"
                        labels={data.topPayments.labels}
                        values={data.topPayments.values}
                    />
                </div>
                <div className="xl:col-span-1">
                    <SimplePieChart
                        title="Top Branches"
                        labels={data.topBranches.labels}
                        values={data.topBranches.values}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
