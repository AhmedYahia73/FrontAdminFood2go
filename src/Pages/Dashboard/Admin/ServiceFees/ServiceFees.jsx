import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
    AddButton,
    StaticLoader,
    TitlePage,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useDelete } from "../../../../Hooks/useDelete";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { t } from "i18next";

const ServiceFees = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchServiceFees,
        loading: loadingServiceFees,
        data: dataServiceFees,
    } = useGet({
        url: `${apiUrl}/admin/service_fees`,
    });
    const { deleteData, loadingDelete } = useDelete();

    const [serviceFees, setServiceFees] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const [openViewBranches, setOpenViewBranches] = useState(null);
    const [openViewModules, setOpenViewModules] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const serviceFeesPerPage = 15;

    const totalPages = Math.ceil(serviceFees.length / serviceFeesPerPage);
    const currentServiceFees = serviceFees.slice(
        (currentPage - 1) * serviceFeesPerPage,
        currentPage * serviceFeesPerPage
    );

    useEffect(() => {
        if (dataServiceFees?.service_fees) {
            setServiceFees(dataServiceFees.service_fees);
        }
    }, [dataServiceFees]);

    useEffect(() => {
        refetchServiceFees();
    }, [refetchServiceFees]);

    const handleOpenViewBranches = (fee) => setOpenViewBranches(fee);
    const handleCloseViewBranches = () => setOpenViewBranches(null);

    const handleOpenViewModules = (fee) => setOpenViewModules(fee);
    const handleCloseViewModules = () => setOpenViewModules(null);

    const handleOpenDelete = (id) => setOpenDelete(id);
    const handleCloseDelete = () => setOpenDelete(null);

    const handleDelete = async (id) => {
        const success = await deleteData(
            `${apiUrl}/admin/service_fees/delete/${id}`,
            t("Service Fee Deleted Successfully")
        );
        if (success) {
            setServiceFees(prev => prev.filter(fee => fee.id !== id));
            setOpenDelete(null);
        }
    };

    // Helper: Format Type
    const getTypeLabel = (type) => {
        return type === "precentage" ? t("Percentage") : t("Fixed Amount");
    };

    // Helper: Format Module
    const getModuleLabel = (module) => {
        return module === "pos" ? t("POS") : t("Online");
    };

    // Helper: Format Online Type
    const getOnlineTypeLabel = (type) => {
        const map = { all: t("All"), app: t("App"), web: t("Web") };
        return map[type] || "-";
    };

    // Helper: Format Amount
    const formatAmount = (fee) => {
        return fee.type === "precentage" ? `${fee.amount}%` : `${fee.amount} ${t("EGP")}`;
    };

    // Table Headers
    const headers = [
        t("No."),
        t("Title"),
        t("Amount"),
        t("Type"),
        t("Module"),
        t("Online Type"),
        t("Order Modules"),
        t("Branches"),
        t("Action"),
    ];

    return (
        <div className="flex flex-col items-start justify-start w-full overflow-x-auto p-2">
            {loadingServiceFees || loadingDelete ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="w-full pb-32">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                        <TitlePage text={t("Service Fees")} />
                        <Link to="add">
                            <AddButton Text={t("Add")} />
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    {headers.map((header, i) => (
                                        <th
                                            key={i}
                                            className="px-4 py-3 text-xs sm:text-sm lg:text-base font-TextFontSemiBold text-mainColor text-center uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentServiceFees.length === 0 ? (
                                    <tr>
                                        <td colSpan={headers.length} className="text-center py-10 text-gray-500 text-lg">
                                            {t("No service fees found")}
                                        </td>
                                    </tr>
                                ) : (
                                    currentServiceFees.map((fee, index) => (
                                        <tr key={fee.id} className="hover:bg-gray-50 transition">
                                            {/* SL */}
                                            <td className="px-4 py-4 text-center text-sm sm:text-base text-thirdColor">
                                                {(currentPage - 1) * serviceFeesPerPage + index + 1}
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm sm:text-base text-thirdColor">
                                                {fee.title}
                                            </td>
                                            {/* Amount */}
                                            <td className="px-4 py-4 text-center font-TextFontMedium text-mainColor">
                                                {formatAmount(fee)}
                                            </td>

                                            {/* Type */}
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${fee.type === "precentage"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-blue-100 text-blue-800"
                                                    }`}>
                                                    {getTypeLabel(fee.type)}
                                                </span>
                                            </td>

                                            {/* Module */}
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${fee.module === "pos"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-orange-100 text-orange-800"
                                                    }`}>
                                                    {getModuleLabel(fee.module)}
                                                </span>
                                            </td>

                                            {/* Online Type */}
                                            <td className="px-4 py-4 text-center text-sm">
                                                {fee.module === "online" ? (
                                                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                                                        {getOnlineTypeLabel(fee.online_type)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Order Modules */}
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenViewModules(fee)}
                                                    className="text-mainColor underline hover:text-red-700 text-sm"
                                                >
                                                    {fee.modules?.length || 0} {t("module", { count: fee.modules?.length || 0 })}
                                                </button>
                                            </td>

                                            {/* Branches */}
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenViewBranches(fee)}
                                                    className="text-mainColor underline hover:text-red-700 text-sm"
                                                >
                                                    {fee.branches?.length || 0} {t("branch", { count: fee.branches?.length || 0 })}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Link to={`edit/${fee.id}`}>
                                                        <EditIcon className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                                                    </Link>
                                                    <button onClick={() => handleOpenDelete(fee.id)}>
                                                        <DeleteIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded bg-mainColor text-white disabled:opacity-50"
                            >
                                {t("Prev")}
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 rounded-full font-medium transition ${currentPage === page
                                        ? "bg-mainColor text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded bg-mainColor text-white disabled:opacity-50"
                            >
                                {t("Next")}
                            </button>
                        </div>
                    )}

                    {/* View Modules Modal */}
                    {openViewModules && (
                        <Dialog open={true} onClose={handleCloseViewModules} className="relative z-50">
                            <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />
                            <div className="fixed inset-0 flex items-center justify-center p-4">
                                <DialogPanel className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                                    <h3 className="text-xl font-bold text-mainColor mb-4">
                                        {t("Order Modules")} ({openViewModules.modules?.length || 0})
                                    </h3>
                                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                                        {openViewModules.modules?.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {openViewModules.modules.map((module, idx) => (
                                                    <li key={idx} className="px-4 py-3 hover:bg-gray-50">
                                                        {t(module)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-gray-500 py-8">{t("No modules assigned")}</p>
                                        )}
                                    </div>
                                    <div className="mt-6 text-right">
                                        <button
                                            onClick={handleCloseViewModules}
                                            className="px-6 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 transition"
                                        >
                                            {t("Close")}
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </Dialog>
                    )}

                    {/* View Branches Modal */}
                    {openViewBranches && (
                        <Dialog open={true} onClose={handleCloseViewBranches} className="relative z-50">
                            <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />
                            <div className="fixed inset-0 flex items-center justify-center p-4">
                                <DialogPanel className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                                    <h3 className="text-xl font-bold text-mainColor mb-4">
                                        {t("Branches")} ({openViewBranches.branches?.length || 0})
                                    </h3>
                                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                                        {openViewBranches.branches?.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {openViewBranches.branches.map(branch => (
                                                    <li key={branch.id} className="px-4 py-3 hover:bg-gray-50">
                                                        {branch.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-gray-500 py-8">{t("No branches assigned")}</p>
                                        )}
                                    </div>
                                    <div className="mt-6 text-right">
                                        <button
                                            onClick={handleCloseViewBranches}
                                            className="px-6 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 transition"
                                        >
                                            {t("Close")}
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </Dialog>
                    )}

                    {/* Delete Confirmation */}
                    {openDelete && (
                        <Dialog open={true} onClose={handleCloseDelete} className="relative z-50">
                            <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-30" />
                            <div className="fixed inset-0 flex items-center justify-center p-4">
                                <DialogPanel className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
                                    <Warning width="48" height="48" className="mx-auto text-red-600 mb-4" />
                                    <p className="text-lg font-medium text-gray-800">
                                        {t("Are you sure you want to delete this service fee?")}
                                    </p>
                                    <div className="mt-6 flex gap-4 justify-center">
                                        <button
                                            onClick={() => handleDelete(openDelete)}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                        >
                                            {t("Delete")}
                                        </button>
                                        <button
                                            onClick={handleCloseDelete}
                                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                                        >
                                            {t("Cancel")}
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </Dialog>
                    )}
                </div>
            )}
        </div>
    );
};

export default ServiceFees;