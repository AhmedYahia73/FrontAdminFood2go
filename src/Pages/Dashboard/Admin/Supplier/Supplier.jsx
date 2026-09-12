import React, { useEffect, useState, useMemo } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link, useLocation } from "react-router-dom";
import { AddButton, StaticLoader, Switch, TitlePage } from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useDelete } from "../../../../Hooks/useDelete";
import { useAuth } from "../../../../Context/Auth";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Supplier = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();
    const location = useLocation();

    const { data, loading, refetch } = useGet({ url: `${apiUrl}/admin/supplier` });
    const { deleteData, loading: loadingDelete } = useDelete();

    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDelete, setOpenDelete] = useState(null);
    const [statusLoadingId, setStatusLoadingId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (data?.suppliers) {
            setSuppliers(data.suppliers);
        }
    }, [data]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Filter suppliers by search query
    const filteredSuppliers = useMemo(() => {
        if (!searchTerm.trim()) return suppliers;
        const query = searchTerm.toLowerCase().trim();
        return suppliers.filter(s =>
            (s.name && s.name.toLowerCase().includes(query)) ||
            (s.phone && s.phone.toLowerCase().includes(query)) ||
            (s.email && s.email.toLowerCase().includes(query))
        );
    }, [suppliers, searchTerm]);

    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSuppliers.slice(start, start + itemsPerPage);
    }, [filteredSuppliers, currentPage, itemsPerPage]);

    // Handle status toggle
    const handleStatusChange = async (supplier) => {
        const newStatus = supplier.status === 1 ? 0 : 1;
        setStatusLoadingId(supplier.id);
        try {
            const token = auth?.userState?.token || "";
            await axios.post(
                `${apiUrl}/admin/supplier/update/${supplier.id}`,
                {
                    name: supplier.name,
                    phone: supplier.phone,
                    email: supplier.email,
                    status: newStatus,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuppliers(prev =>
                prev.map(s => (s.id === supplier.id ? { ...s, status: newStatus } : s))
            );
            auth.toastSuccess(t("Supplier updated successfully"));
        } catch (error) {
            auth.toastError(
                error?.response?.data?.errors?.status?.[0] ||
                error?.response?.data?.message ||
                t("Failed to update status")
            );
        } finally {
            setStatusLoadingId(null);
        }
    };

    // Handle delete supplier
    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/supplier/delete/${id}`,
            `${name || t("Supplier")} ${t("Supplier deleted successfully")}`
        );
        if (success) {
            setSuppliers(prev => prev.filter(s => s.id !== id));
            setOpenDelete(null);
        }
    };

    return (
        <div className="p-4">
            {loading || loadingDelete ? (
                <div className="flex justify-center py-20">
                    <StaticLoader />
                </div>
            ) : (
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <TitlePage text={t("Suppliers")} />
                        <div className="flex items-center gap-3">
                            <Link to={`add${location.search}`}>
                                <AddButton Text={t("Add Supplier")} />
                            </Link>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder={t("Search by name, phone, or email...")}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2.5 pl-10 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-mainColor/20 focus:border-mainColor transition-all"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                                🔍
                            </span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">
                            {t("Total")}: {filteredSuppliers.length}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead className="bg-gray-50/80 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-mainColor font-semibold text-sm">SL</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-semibold text-sm">{t("Name")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-semibold text-sm">{t("Phone")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-semibold text-sm">{t("Email")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-semibold text-sm">{t("Balance")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-semibold text-sm">{t("Status")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-semibold text-sm">{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-16 text-gray-400 text-base font-medium">
                                                {t("No suppliers found")}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((supplier, i) => (
                                            <tr key={supplier.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="text-center py-4 text-gray-700 text-sm font-medium">
                                                    {(currentPage - 1) * itemsPerPage + i + 1}
                                                </td>
                                                <td className="text-center py-4 font-semibold text-gray-800 text-sm">
                                                    {supplier.name}
                                                </td>
                                                <td className="text-center py-4 text-gray-600 text-sm" dir="ltr">
                                                    {supplier.phone || "—"}
                                                </td>
                                                <td className="text-center py-4 text-gray-600 text-sm">
                                                    {supplier.email || "—"}
                                                </td>
                                                <td className="text-center py-4 font-semibold text-sm">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        Number(supplier.balance) < 0 
                                                            ? "bg-red-50 text-red-600" 
                                                            : Number(supplier.balance) > 0 
                                                                ? "bg-green-50 text-green-600" 
                                                                : "bg-gray-100 text-gray-600"
                                                    }`}>
                                                        {Number(supplier.balance || 0).toLocaleString()} {t("EGP")}
                                                    </span>
                                                </td>
                                                <td className="text-center py-4">
                                                    <div className="flex justify-center items-center">
                                                        <Switch
                                                            checked={supplier.status === 1}
                                                            disabled={statusLoadingId === supplier.id}
                                                            handleClick={() => handleStatusChange(supplier)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="text-center py-4">
                                                    <div className="flex justify-center items-center gap-3">
                                                        <Link to={`edit/${supplier.id}${location.search}`}>
                                                            <EditIcon className="w-5 h-5 text-mainColor hover:text-blue-700 transition-colors" />
                                                        </Link>
                                                        <button
                                                            onClick={() => setOpenDelete(supplier.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            <DeleteIcon className="w-5 h-5" />
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
                            <div className="flex justify-center items-center gap-3 py-5 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-1.5 text-sm bg-mainColor text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mainColor/90 transition"
                                >
                                    {t("Previous")}
                                </button>
                                <span className="text-sm font-medium text-gray-600">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-1.5 text-sm bg-mainColor text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mainColor/90 transition"
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Delete Confirmation Modal */}
                    {openDelete && (
                        <Dialog open={true} onClose={() => setOpenDelete(null)} className="relative z-50">
                            <DialogBackdrop className="fixed inset-0 bg-black/40 transition-opacity" />
                            <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                                            <Warning className="w-8 h-8 text-red-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {t("Delete Supplier")}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                        {t("Are you sure you want to delete this supplier?")}
                                    </p>
                                    <div className="flex justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setOpenDelete(null)}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                                        >
                                            {t("Cancel")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const supplier = suppliers.find(s => s.id === openDelete);
                                                handleDelete(openDelete, supplier?.name);
                                            }}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
                                        >
                                            {t("Delete")}
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

export default Supplier;
