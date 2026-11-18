import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const PALETTE = [
    '#1E3A8A', // Dark Blue
    '#F97316', // Orange
    '#7C3AED', // Purple
    '#38BDF8', // Light Blue
    '#EAB308', // Yellow
    '#10B981', // Green
    '#EC4899', // Pink
    '#6366F1', // Indigo
];

const SimplePieChart = ({
    title,
    labels = [],
    values = [],
    unit = "EGP",
    viewReportLink = ""
}) => {
    const total = useMemo(() => {
        return (values || []).reduce((acc, curr) => acc + Number(curr || 0), 0);
    }, [values]);

    const hasData = values && values.length > 0 && total > 0;

    const data = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: PALETTE.slice(0, Math.max(labels.length, 1)),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: false,
                    boxWidth: 12,
                    boxHeight: 12,
                    padding: 12,
                    font: { size: 11, family: 'inherit' },
                    generateLabels: (chart) => {
                        const original = chart.data.labels || [];
                        return original.map((label, i) => {
                            const val = chart.data.datasets[0].data[i] || 0;
                            const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
                            const shortLabel = label && label.length > 18 ? `${label.substring(0, 16)}...` : label;
                            return {
                                text: `${shortLabel} (${pct}%)`,
                                fillStyle: chart.data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            };
                        });
                    }
                }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#111827',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (context) => {
                        const val = Number(context.raw || 0);
                        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                        return ` ${unit ? `${unit} ` : ""}${val.toLocaleString()} (${pct}%)`;
                    }
                }
            }
        },
    };

    return (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-gray-500 font-TextFontMedium text-sm">{title}</h3>
                {viewReportLink && (
                    <a
                        href={viewReportLink}
                        className="text-xs font-TextFontMedium text-blue-600 hover:text-blue-800 hover:underline pt-1"
                    >
                        View Report
                    </a>
                )}
            </div>
            <div className="flex-grow w-full flex items-center justify-center min-h-[220px]">
                {hasData ? (
                    <div className="w-full h-[220px]">
                        <Pie data={data} options={options} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                        <span className="text-sm">No data available for this period</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimplePieChart;
