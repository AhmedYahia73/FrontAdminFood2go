import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const StandardLineChart = ({
    title,
    labels,
    data,
    color = "#6045EC",
    unit = "",
    viewReportLink = "/dashboard/reports/financial_report"
}) => {
    const totalValue = useMemo(() => {
        if (!data || !data.length) return 0;
        const sum = data.reduce((acc, curr) => acc + Number(curr || 0), 0);
        return Number.isInteger(sum) ? sum : Number(sum.toFixed(2));
    }, [data]);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: title,
                data: data,
                borderColor: color,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, `${color}25`);
                    gradient.addColorStop(1, `${color}00`);
                    return gradient;
                },
                fill: true,
                tension: 0.35,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1.5,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#111827',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${unit ? `${unit} ` : ""}${Number(context.raw || 0).toLocaleString()}`
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 10
                    },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 9,
                }
            },
            y: {
                grid: {
                    color: '#f3f4f6',
                },
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 10
                    },
                    precision: 0,
                }
            },
        },
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-gray-500 font-TextFontMedium text-sm">{title}</h3>
                    <h2 className="text-2xl lg:text-3xl font-TextFontBold mt-1 text-gray-900">
                        {unit ? `${unit} ` : ""}{totalValue.toLocaleString()}
                    </h2>
                </div>
                {viewReportLink && (
                    <a
                        href={viewReportLink}
                        className="text-xs font-TextFontMedium text-blue-600 hover:text-blue-800 hover:underline pt-1"
                    >
                        View Report
                    </a>
                )}
            </div>
            <div className="flex-grow w-full min-h-[190px]">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default StandardLineChart;
