import React from 'react';
import { IoBagHandle, IoCash, IoCalendar, IoPeople } from 'react-icons/io5';

const KpiCard = ({ title, value, icon: Icon, color }) => (
    <div className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 w-full min-w-[200px]">
        <div className={`p-4 rounded-xl ${color} bg-opacity-10 mr-4`}>
            <Icon className={`text-2xl ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="flex flex-col">
            <span className="text-gray-500 text-sm font-TextFontRegular">{title}</span>
            <span className="text-2xl font-TextFontBold text-gray-800">{value}</span>
        </div>
    </div>
);

const DashboardKpiCards = ({ kpis }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full mb-8">
            <KpiCard
                title="Active Orders"
                value={kpis.activeOrders}
                icon={IoBagHandle}
                color="bg-blue-500"
            />
            <KpiCard
                title="Active Amount"
                value={`${kpis.activeAmount} EGP`}
                icon={IoCash}
                color="bg-green-500"
            />
            <KpiCard
                title="Occupied Tables"
                value={kpis.occupiedTables}
                icon={IoCalendar}
                color="bg-purple-500"
            />
            <KpiCard
                title="Offline Cashiers"
                value={kpis.offlineCashiers}
                icon={IoPeople}
                color="bg-red-500"
            />
        </div>
    );
};

export default DashboardKpiCards;
