import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const OrderTypeDistributionChart = ({
    labels,
    dineIn = [],
    delivery = [],
    takeaway = [],
    driveThru = [],
    viewReportLink = "/dashboard/reports/orders_report"
}) => {
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Delivery Orders',
                data: delivery,
                borderColor: '#1E3A8A',
                backgroundColor: '#1E3A8A15',
                fill: false,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#1E3A8A',
                borderWidth: 2,
            },
            {
                label: 'Dine-in Orders',
                data: dineIn,
                borderColor: '#F97316',
                backgroundColor: '#F9731615',
                fill: false,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#F97316',
                borderWidth: 2,
            },
            {
                label: 'Pickup Orders',
                data: takeaway,
                borderColor: '#7C3AED',
                backgroundColor: '#7C3AED15',
                fill: false,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#7C3AED',
                borderWidth: 2,
            },
            {
                label: 'Drive Thru Orders',
                data: driveThru,
                borderColor: '#38BDF8',
                backgroundColor: '#38BDF815',
                fill: false,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#38BDF8',
                borderWidth: 2,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 16,
                    font: { size: 11, family: 'inherit' }
                }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#111827',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: {
                    font: { size: 10 },
                    precision: 0
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 10 },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 9
                }
            }
        }
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-gray-500 font-TextFontMedium text-sm">Order Types</h3>
                {viewReportLink && (
                    <a
                        href={viewReportLink}
                        className="text-xs font-TextFontMedium text-blue-600 hover:text-blue-800 hover:underline pt-1"
                    >
                        View Report
                    </a>
                )}
            </div>
            <div className="flex-grow w-full min-h-[260px]">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default OrderTypeDistributionChart;
