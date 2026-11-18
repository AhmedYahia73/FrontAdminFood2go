import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const HourlySalesBarChart = ({
    labels = [],
    orders = [],
    viewReportLink = "/dashboard/reports/financial_report"
}) => {
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Hourly Sales (EGP)',
                data: orders,
                backgroundColor: '#6045EC',
                borderRadius: 4,
                hoverBackgroundColor: '#4f35d2',
                barPercentage: 0.6,
                categoryPercentage: 0.8,
            }
        ],
    };

    // Custom plugin to draw numbers on top of bars (matching Foodics console)
    const barValuePlugin = useMemo(() => ({
        id: 'barValuePlugin',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                    const val = Number(dataset.data[index] || 0);
                    if (val > 0) {
                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.font = 'bold 10px sans-serif';
                        ctx.fillStyle = '#374151';
                        ctx.fillText(val.toLocaleString(), bar.x, bar.y - 3);
                        ctx.restore();
                    }
                });
            });
        }
    }), []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#111827',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (context) => `Sales: EGP ${Number(context.raw || 0).toLocaleString()}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: {
                    font: { size: 10 },
                    callback: (value) => value >= 1000 ? `${value / 1000}k` : value
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: 10 },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 12
                }
            }
        }
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-gray-500 font-TextFontMedium text-sm">Hourly Sales</h3>
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
                <Bar data={data} options={options} plugins={[barValuePlugin]} />
            </div>
        </div>
    );
};

export default HourlySalesBarChart;
