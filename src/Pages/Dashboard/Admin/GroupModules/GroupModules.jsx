import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGet } from "../../../../Hooks/useGet";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import { StaticLoader, Switch } from "../../../../Components/Components";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { IoInformationCircleOutline, IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";

const GroupModules = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const {
        refetch: refetchGroupModules,
        loading: loadingGroupModules,
        data: dataGroupModules,
    } = useGet({ url: `${apiUrl}/admin/group_product` });

    const { changeState, loadingChange } = useChangeState();
    const { deleteData, loadingDelete } = useDelete();

    const [groupModules, setGroupModules] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const [openModules, setOpenModules] = useState(null);
    const [selectedModules, setSelectedModules] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(groupModules.length / itemsPerPage);
    const currentItems = groupModules.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        refetchGroupModules();
    }, [refetchGroupModules]);

    useEffect(() => {
        if (dataGroupModules?.group_products) {
            setGroupModules(dataGroupModules.group_products);
        }
    }, [dataGroupModules]);

    // Status Toggle
    const handleChangeStatus = async (id, name, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const res = await changeState(
            `${apiUrl}/admin/group_product/status/${id}`,
            `${name} status updated`,
            { status: newStatus }
        );
        if (res) {
            setGroupModules(prev =>
                prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
            );
        }
    };

    // Delete
    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/group_product/delete/${id}`,
            `${name} deleted successfully`
        );
        if (success) {
            setGroupModules(prev => prev.filter(g => g.id !== id));
            setOpenDelete(null);
        }
    };

    // View Modules Modal
    const handleOpenModules = (group) => {
        const modules = Array.isArray(group.module) ? group.module : [];
        setSelectedModules(modules);
        setOpenModules(group.id);
    };

    const handleCloseModules = () => {
        setOpenModules(null);
        setSelectedModules([]);
    };

    const formatModuleName = (name) =>
        name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");

    const headers = [
        t("#"),
        t("Name"),
        t("Icon"),
        t("Increase %"),
        t("Decrease %"),
        t("Modules"),
        t("Products"),
        t("Due Status"),
        t("Due Amount"),
        t("Status"),
        t("Action"),
    ];

    return (
        <div className="w-full p-2 pb-32 relative">
            {/* Loading */}
            {loadingGroupModules || loadingChange || loadingDelete ? (
                <div className="flex justify-center items-center h-96">
                    <StaticLoader />
                </div>
            ) : (
                <div className="w-full flex flex-col">
                    {/* Title */}
                    <div className="flex flex-col justify-between items-center mb-6 md:flex-row">
                        <h1 className="text-3xl font-TextFontSemiBold text-mainColor">
                            {t("Group Modules Table")}
                        </h1>
                        <Link to="add">
                            <button className="px-8 py-3 mt-5 bg-mainColor text-white rounded-xl font-bold hover:bg-mainColor-dark transition shadow-lg">
                                + {t("Add Group Module")}
                            </button>
                        </Link>
                    </div>

                    {/* Horizontal Scroll Table */}
                    <div className="overflow-x-auto scrollSection">
                        <table className="min-w-full bg-white shadow-2xl rounded-xl overflow-hidden">
                            <thead className="bg-mainColor text-white">
                                <tr>
                                    {headers.map((h, i) => (
                                        <th
                                            key={i}
                                            className="px-6 py-5 text-center text-sm font-medium uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-24 text-2xl text-gray-500 font-medium">
                                            {t("No Group Modules found")}
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((group, idx) => (
                                        <tr key={group.id} className="hover:bg-gray-50 transition duration-200">
                                            <td className="px-6 py-5 text-center text-gray-700 font-medium">
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>
                                            <td className="px-6 py-5 text-center font-bold text-lg text-gray-800">
                                                {group.name || "-"}
                                            </td>
                                            <td className="px-6 py-5 text-center text-mainColor font-semibold">
                                                <img
                                                    src={group.icon_link}
                                                    alt={group.name}
                                                    className="w-10 h-10 object-cover rounded-full"
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-center text-mainColor font-semibold">
                                                {group.increase_precentage != null ? `${group.increase_precentage}%` : "-"}
                                            </td>
                                            <td className="px-6 py-5 text-center text-red-600 font-semibold">
                                                {group.decrease_precentage != null ? `${group.decrease_precentage}%` : "-"}
                                            </td>

                                            {/* Modules */}
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    onClick={() => handleOpenModules(group)}
                                                    className="flex items-center gap-2 mx-auto px-5 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition"
                                                >
                                                    <IoInformationCircleOutline size={20} />
                                                    {t("View")} ({Array.isArray(group.module) ? group.module.length : 0})
                                                </button>
                                            </td>

                                            {/* Products */}
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    onClick={() => navigate(`products/${group.id}`, { state: { groupName: group.name } })}
                                                    className="text-mainColor font-bold hover:underline text-lg"
                                                >
                                                    {t("View Products")}
                                                </button>
                                            </td>

                                            {/* Due Status */}
                                            <td className="px-6 py-5 text-center">
                                                {group.due === 1 ? (
                                                    <span className="text-green-500 font-bold">{t("Active")}</span>
                                                ) : (
                                                    <span className="text-red-500 font-bold">{t("Inactive")}</span>
                                                )}
                                            </td>

                                            {/* Due Column */}
                                            <td className="px-6 py-5 text-center">
                                                {/* {group.due === 1 ? ( */}
                                                <button
                                                    onClick={() => navigate(`due/${group.id}`)}
                                                    className="px-7 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition shadow-lg"
                                                >
                                                    {t("View Due")}
                                                </button>
                                                {/* ) : (
                                                    <span className="text-gray-400 font-medium">{t("No Due")}</span>
                                                )} */}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-5 text-center">
                                                <Switch
                                                    checked={group.status === 1}
                                                    handleClick={() => handleChangeStatus(group.id, group.name, group.status)}
                                                />
                                            </td>

                                            {/* Action */}
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex justify-center items-center gap-6">
                                                    <Link to={`edit/${group.id}`} className="text-blue-600 hover:text-blue-800">
                                                        <EditIcon />
                                                    </Link>
                                                    <button onClick={() => setOpenDelete(group.id)} className="text-red-600 hover:text-red-800">
                                                        <DeleteIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Fixed Pagination */}
                    {groupModules.length > itemsPerPage && (
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-2xl z-50">
                            <div className="flex justify-center items-center gap-4 py-5 px-8 flex-wrap">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-8 py-3 bg-mainColor text-white rounded-xl font-bold disabled:opacity-50 hover:bg-mainColor-dark transition shadow"
                                >
                                    {t("Prev")}
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-6 py-3 rounded-xl font-bold text-lg transition ${currentPage === i + 1
                                            ? "bg-mainColor text-white shadow-lg"
                                            : "border-2 border-mainColor text-mainColor hover:bg-mainColor hover:text-white"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-8 py-3 bg-mainColor text-white rounded-xl font-bold disabled:opacity-50 hover:bg-mainColor-dark transition shadow"
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === MODALS === */}

            {/* View Modules Modal */}
            {openModules && (
                <Dialog open onClose={handleCloseModules}>
                    <DialogBackdrop className="fixed inset-0 bg-black/60" />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold">
                                    {t("Assigned Modules")} - {groupModules.find(g => g.id === openModules)?.name}
                                </h2>
                                <button onClick={handleCloseModules}>
                                    <IoClose size={32} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto max-h-[65vh]">
                                {selectedModules.length === 0 ? (
                                    <p className="text-center text-xl text-gray-500 py-16">
                                        {t("No modules assigned")}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {selectedModules.map((module, i) => (
                                            <div
                                                key={i}
                                                className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 text-center shadow hover:shadow-xl transition"
                                            >
                                                <p className="font-bold text-lg text-blue-800">
                                                    {formatModuleName(module)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="px-8 py-6 bg-gray-100 border-t text-right">
                                <button
                                    onClick={handleCloseModules}
                                    className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                                >
                                    {t("Close")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}

            {/* Delete Confirmation Modal */}
            {openDelete && (
                <Dialog open onClose={() => setOpenDelete(null)}>
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                <DeleteIcon width={40} height={40} className="text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                {t("Delete Group Module")}
                            </h3>
                            <p className="text-lg text-gray-600">
                                {t("Are you sure you want to delete")} <br />
                                <strong className="text-red-600">
                                    {groupModules.find(g => g.id === openDelete)?.name}
                                </strong>?
                            </p>
                            <div className="flex gap-6 mt-10">
                                <button
                                    onClick={() => setOpenDelete(null)}
                                    className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    onClick={() => handleDelete(openDelete, groupModules.find(g => g.id === openDelete)?.name)}
                                    className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                                >
                                    {t("Delete")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default GroupModules;