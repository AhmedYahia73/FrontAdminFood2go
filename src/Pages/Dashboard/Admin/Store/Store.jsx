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

const Store = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const { data, loading, refetch } = useGet({ url: `${apiUrl}/admin/purchase_stores` });
    const { changeState, loading: loadingChange } = useChangeState();
    const { deleteData, loading: loadingDelete } = useDelete();

    const [stores, setStores] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const [isBranchesModalOpen, setIsBranchesModalOpen] = useState(false);
    const [selectedStoreBranches, setSelectedStoreBranches] = useState([]);
    const [selectedStoreName, setSelectedStoreName] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(stores.length / itemsPerPage);
    const currentItems = stores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        if (data?.stores) {
            setStores(data.stores);
        }
    }, [data]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleStatusChange = async (id, name, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const success = await changeState(
            `${apiUrl}/admin/purchase_stores/status/${id}`,
            `${name} status updated`,
            { status: newStatus }
        );
        if (success) {
            setStores(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        }
    };

    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/purchase_stores/delete/${id}`,
            `${name} deleted successfully`
        );
        if (success) {
            setStores(prev => prev.filter(s => s.id !== id));
            setOpenDelete(null);
        }
    };

    const openBranchesModal = (store) => {
        setSelectedStoreName(store.name);
        setSelectedStoreBranches(store.branches || []);
        setIsBranchesModalOpen(true);
    };

    const closeBranchesModal = () => {
        setIsBranchesModalOpen(false);
        setSelectedStoreBranches([]);
        setSelectedStoreName("");
    };

    return (
        <div className="p-4">
            {(loading || loadingChange || loadingDelete) ? (
                <div className="flex justify-center py-20">
                    <StaticLoader />
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <TitlePage text={t("Purchase Stores")} />
                        <Link to="add">
                            <AddButton Text={t("Add")} />
                        </Link>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">SL</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Name")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Location")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Branches")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Status")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-16 text-gray-500 text-lg">
                                                {t("No stores found")}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((store, i) => (
                                            <tr key={store.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="text-center py-5 text-gray-700">
                                                    {(currentPage - 1) * itemsPerPage + i + 1}
                                                </td>
                                                <td className="text-center py-5 font-medium text-gray-800">{store.name}</td>
                                                <td className="text-center py-5 text-gray-600">{store.location || "—"}</td>
                                                <td className="text-center py-5">
                                                    {store.branches?.length > 0 ? (
                                                        <button
                                                            onClick={() => openBranchesModal(store)}
                                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition"
                                                        >
                                                            {t("View")} ({store.branches.length})
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-5">
                                                    <Switch
                                                        checked={store.status === 1}
                                                        handleClick={() => handleStatusChange(store.id, store.name, store.status)}
                                                    />
                                                </td>
                                                <td className="text-center py-5">
                                                    <div className="flex justify-center gap-4">
                                                        <Link to={`edit/${store.id}`}>
                                                            <EditIcon className="w-5 h-5 text-mainColor hover:text-blue-700" />
                                                        </Link>
                                                        <button onClick={() => setOpenDelete(store.id)}>
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
                            <div className="flex justify-center items-center gap-3 py-6 bg-gray-50">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-5 py-2 bg-mainColor text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="px-5 py-2 bg-mainColor text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Branches Modal */}
            {isBranchesModalOpen && (
                <Dialog open={isBranchesModalOpen} onClose={closeBranchesModal} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                            <h3 className="text-2xl font-bold text-mainColor mb-6 text-center">
                                {t("Branches for")} "{selectedStoreName}"
                            </h3>
                            {selectedStoreBranches.length > 0 ? (
                                <ul className="space-y-3">
                                    {selectedStoreBranches.map(branch => (
                                        <li key={branch.id} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                            <span className="text-lg font-medium text-gray-800">{branch.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-8">{t("No branches assigned")}</p>
                            )}
                            <div className="mt-8 text-center">
                                <button onClick={closeBranchesModal} className="px-8 py-3 bg-mainColor text-white rounded-full font-medium">
                                    {t("Close")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}

            {/* Delete Modal */}
            {openDelete && (
                <Dialog open={true} onClose={() => setOpenDelete(null)}>
                    <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                            <Warning width="64" height="64" className="mx-auto mb-4 text-red-600" />
                            <h3 className="text-xl font-bold mb-4">{t("Delete Store?")}</h3>
                            <p className="text-gray-600 mb-6">
                                {t("This action cannot be undone.")}
                            </p>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setOpenDelete(null)} className="px-6 py-3 border-2 border-gray-300 rounded-full">
                                    {t("Cancel")}
                                </button>
                                <button
                                    onClick={() => handleDelete(openDelete, stores.find(s => s.id === openDelete)?.name)}
                                    className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700"
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

export default Store;