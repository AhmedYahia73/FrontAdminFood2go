import React from 'react';
import { Bar } from 'react-chartjs-2';

const HourlySalesBarChart = ({ labels, orders }) => {
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Number of Orders',
                data: orders,
                backgroundColor: '#9E090F',
                borderRadius: 4,
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Orders', font: { size: 12 } }
            },
            x: {
                title: { display: true, text: 'Time', font: { size: 12 } },
                grid: { display: false }
            }
        }
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="text-gray-500 font-TextFontRegular text-sm mb-4">Hourly Sales Performance</h3>
            <div className="flex-grow min-h-[300px]">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default HourlySalesBarChart;
