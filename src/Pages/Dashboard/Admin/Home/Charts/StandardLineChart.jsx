import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const StandardLineChart = ({ title, labels, data, color = "#9E090F", unit = "" }) => {
    const totalValue = useMemo(() => {
        if (!data || !data.length) return 0;
        const sum = data.reduce((acc, curr) => acc + Number(curr), 0);
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
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, `${color}40`);
                    gradient.addColorStop(1, `${color}00`);
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: color,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#000000',
                bodyColor: '#666666',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${unit}${context.raw}`
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
                        size: 11
                    }
                }
            },
            y: {
                grid: {
                    color: '#f3f4f6',
                },
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
        },
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-gray-500 font-TextFontRegular text-sm">{title}</h3>
                <h2 className="text-2xl font-bold mt-1 text-gray-800">
                    {totalValue.toLocaleString()} <span className="text-sm font-normal text-gray-500">{unit}</span>
                </h2>
            </div>
            <div className="flex-grow min-h-[200px]">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default StandardLineChart;
