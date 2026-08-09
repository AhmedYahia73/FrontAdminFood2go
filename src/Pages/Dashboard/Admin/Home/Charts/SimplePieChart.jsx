import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const SimplePieChart = ({ title, labels, values }) => {
    const data = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    '#9E090F',
                    '#ee6c4d',
                    '#3d5a80',
                    '#98c1d9',
                    '#e0fbfc'
                ],
                borderWidth: 0,
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 11 }
                }
            }
        },
        cutout: '70%',
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="text-gray-500 font-TextFontRegular text-sm mb-4">{title}</h3>
            <div className="flex-grow flex items-center justify-center min-h-[250px]">
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
};

export default SimplePieChart;
