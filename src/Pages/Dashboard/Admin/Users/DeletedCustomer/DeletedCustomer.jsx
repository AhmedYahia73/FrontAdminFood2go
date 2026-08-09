import React, { useEffect, useState } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { StaticLoader } from "../../../../../Components/Components";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";

const DeletedCustomer = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();

    const {
        refetch: refetchUsers,
        loading: loadingUsers,
        data: usersData,
    } = useGet({ url: `${apiUrl}/admin/restore_user` });

    const { changeState, loadingChange } = useChangeState();

    const [users, setUsers] = useState([]);
    const [openRestoreModal, setOpenRestoreModal] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 20;
    const totalPages = Math.ceil(users.length / usersPerPage);
    const currentUsers = users.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    useEffect(() => {
        refetchUsers();
    }, [refetchUsers]);

    useEffect(() => {
        if (usersData?.users) {
            setUsers(usersData.users);
        }
    }, [usersData]);

    // Restore User
    const handleRestore = async (userId, userName) => {
        const success = await changeState(
            `${apiUrl}/admin/restore_user/${userId}`,
            `${userName} restored successfully.`,
            {},
            "PUT"
        );

        if (success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setOpenRestoreModal(null);
        }
    };

    const headers = [
        t("#"),
        t("Image"),
        t("Name"),
        t("Phone"),
        t("Email"),
        t("Restore"),
    ];

    return (
        <div className="w-full p-2 pb-32 relative">
            {/* Loading */}
            {loadingUsers || loadingChange ? (
                <div className="flex justify-center items-center h-96">
                    <StaticLoader />
                </div>
            ) : (
                <div className="w-full">
                    {/* Title */}
                    <h1 className="text-3xl font-TextFontSemiBold text-mainColor mb-8 text-center">
                        {t("Deleted Users")}
                    </h1>

                    {/* Horizontal Scroll Table */}
                    <div className="overflow-x-auto scrollSection">
                        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-gradient-to-r from-mainColor to-mainColor text-white">
                                <tr>
                                    {headers.map((header, i) => (
                                        <th
                                            key={i}
                                            className="px-4 py-4 text-center text-sm font-medium uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20 text-xl text-gray-500 font-medium">
                                            {t("No deleted users found")}
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map((user, idx) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-4 text-center text-gray-600">
                                                {(currentPage - 1) * usersPerPage + idx + 1}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <img
                                                    src={user.image_link || "/default-avatar.png"}
                                                    alt={user.name}
                                                    className="w-16 h-16 rounded-full object-contain mx-auto"
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-center font-medium">{user.name || "-"}</td>
                                            <td className="px-4 py-4 text-center">{user.phone || "-"}</td>
                                            <td className="px-4 py-4 text-center">{user.email || "-"}</td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => setOpenRestoreModal(user)}
                                                    className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow"
                                                >
                                                    {t("Restore")}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Replace the fixed pagination with this */}
                    {users.length > usersPerPage && (
                        <div className="mt-8 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 sm:px-6 sm:py-3 bg-mainColor text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mainColor-dark transition"
                            >
                                {t("Prev")}
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                // Show first 2, last 2, and current ±1
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 sm:px-5 sm:py-3 rounded-lg font-medium min-w-[40px] transition ${currentPage === page
                                                    ? "bg-mainColor text-white shadow-md"
                                                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                }

                                // Show dots when skipping pages
                                if (
                                    (page === currentPage - 2 && currentPage > 3) ||
                                    (page === currentPage + 2 && currentPage < totalPages - 2)
                                ) {
                                    return <span key={page} className="px-2 py-3 text-gray-500">...</span>;
                                }

                                return null;
                            })}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 sm:px-6 sm:py-3 bg-mainColor text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mainColor-dark transition"
                            >
                                {t("Next")}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Restore Confirmation Modal */}
            {openRestoreModal && (
                <Dialog open onClose={() => setOpenRestoreModal(null)} className="relative z-10">
                    <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                            <Warning width={60} height={60} className="mx-auto text-green-600 mb-4" />
                            <h3 className="text-2xl font-TextFontSemiBold text-gray-800 mb-4">
                                {t("Restore User")}
                            </h3>
                            <p className="text-gray-600 text-lg">
                                {t("Are you sure you want to restore")} <br />
                                <strong className="text-mainColor">{openRestoreModal.name}</strong>?
                            </p>
                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setOpenRestoreModal(null)}
                                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    onClick={() => handleRestore(openRestoreModal.id, openRestoreModal.name)}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
                                >
                                    {t("Restore User")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default DeletedCustomer;