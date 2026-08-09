import React from 'react';
import { Bar } from 'react-chartjs-2';

const TopProductsBarChart = ({ labels, values }) => {
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Net Sales',
                data: values,
                backgroundColor: '#9E090F',
                borderRadius: 4,
            }
        ],
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' }
            },
            y: {
                grid: { display: false }
            }
        }
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="text-gray-500 font-TextFontRegular text-sm mb-4">Top Products by Net Sales</h3>
            <div className="flex-grow min-h-[300px]">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default TopProductsBarChart;
