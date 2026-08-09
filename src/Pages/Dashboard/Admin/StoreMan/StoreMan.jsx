import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import { AddButton, StaticLoader, Switch, TitlePage } from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { t } from "i18next";

// Avatar fallback component
const AvatarPlaceholder = ({ name }) => {
    const initials = name
        ? name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : "SM";
    return (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {initials}
        </div>
    );
};

const StoreMan = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const { data, loading, refetch } = useGet({ url: `${apiUrl}/admin/purchase_store_man` });
    const { changeState, loading: loadingChange } = useChangeState();
    const { deleteData, loading: loadingDelete } = useDelete();

    const [storeMen, setStoreMen] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(storeMen.length / itemsPerPage);
    const currentItems = storeMen.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        if (data?.store_men) {
            setStoreMen(data.store_men);
        }
    }, [data]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleStatusChange = async (id, name, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const success = await changeState(
            `${apiUrl}/admin/purchase_store_man/status/${id}`,
            `${name} status updated`,
            { status: newStatus }
        );
        if (success) {
            setStoreMen(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        }
    };

    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/purchase_store_man/delete/${id}`,
            `${name} deleted successfully`
        );
        if (success) {
            setStoreMen(prev => prev.filter(m => m.id !== id));
            setOpenDelete(null);
        }
    };

    return (
        <div className="p-4">
            {(loading || loadingChange || loadingDelete) ? (
                <div className="flex justify-center py-20">
                    <StaticLoader />
                </div>
            ) : (
                <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <TitlePage text={t("Store Man")} />
                        <Link to="add">
                            <AddButton Text={t("Add")} />
                        </Link>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">SL</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Image")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Name")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Phone/Email")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Store")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Status")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-16 text-gray-500 text-lg">
                                                {t("No store Man found")}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((man, i) => (
                                            <tr key={man.id} className="border-b hover:bg-gray-50 transition-colors">
                                                {/* SL */}
                                                <td className="text-center py-5 text-gray-700">
                                                    {(currentPage - 1) * itemsPerPage + i + 1}
                                                </td>

                                                {/* Image */}
                                                <td className="text-center py-5">
                                                    <div className="flex justify-center">
                                                        {man.image ? (
                                                            <img
                                                                src={man.image}
                                                                alt={man.user_name}
                                                                className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextElementSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div style={{ display: man.image ? 'none' : 'flex' }}>
                                                            <AvatarPlaceholder name={man.user_name} />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Name */}
                                                <td className="text-center py-5 font-medium text-gray-800">
                                                    {man.user_name}
                                                </td>

                                                {/* Phone */}
                                                <td className="text-center py-5 text-gray-600">
                                                    {man.phone}
                                                </td>

                                                {/* Store */}
                                                <td className="text-center py-5">
                                                    <span className={`inline-block px-4 py-2 rounded-full text-xs font-medium ${man.store?.name
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-600"
                                                        }`}>
                                                        {man.store?.name || "—"}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="text-center py-5">
                                                    <Switch
                                                        checked={man.status === 1}
                                                        handleClick={() => handleStatusChange(man.id, man.user_name, man.status)}
                                                    />
                                                </td>

                                                {/* Actions */}
                                                <td className="text-center py-5">
                                                    <div className="flex justify-center items-center gap-4">
                                                        <Link to={`edit/${man.id}`}>
                                                            <EditIcon className="w-5 h-5 text-mainColor hover:text-blue-700 transition" />
                                                        </Link>
                                                        <button onClick={() => setOpenDelete(man.id)}>
                                                            <DeleteIcon className="w-5 h-5 text-red-600 hover:text-red-800 transition" />
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
                            <div className="flex justify-center items-center gap-3 py-6 bg-gray-50 border-t">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-5 py-2 bg-mainColor text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {t("Prev")}
                                </button>

                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 rounded-full font-medium transition-all ${currentPage === i + 1
                                                ? "bg-mainColor text-white"
                                                : "bg-gray-200 text-mainColor hover:bg-gray-300"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-5 py-2 bg-mainColor text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {openDelete && (
                <Dialog open={true} onClose={() => setOpenDelete(null)} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                            <Warning width="64" height="64" className="mx-auto mb-4 text-red-600" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {t("Delete Store Man?")}
                            </h3>
                            <p className="text-lg text-gray-600 mb-8">
                                {t("Are you sure you want to delete")} <br />
                                <span className="font-bold text-mainColor">
                                    {storeMen.find(m => m.id === openDelete)?.user_name}
                                </span>?
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setOpenDelete(null)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-full font-medium hover:bg-gray-50 transition"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    onClick={() => handleDelete(openDelete, storeMen.find(m => m.id === openDelete)?.user_name)}
                                    className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition"
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

export default StoreMan;