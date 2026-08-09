import React from 'react';
import { Line } from 'react-chartjs-2';

const OrderTypeDistributionChart = ({ labels, dineIn, delivery, takeaway }) => {
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Dine-In',
                data: dineIn,
                borderColor: '#ef4444',
                backgroundColor: '#ef444420',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Delivery',
                data: delivery,
                borderColor: '#3b82f6',
                backgroundColor: '#3b82f620',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Takeaway',
                data: takeaway,
                borderColor: '#10b981',
                backgroundColor: '#10b98120',
                fill: true,
                tension: 0.4,
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' }
            },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="text-gray-500 font-TextFontRegular text-sm mb-4">Order Types Distribution</h3>
            <div className="flex-grow min-h-[300px]">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default OrderTypeDistributionChart;
