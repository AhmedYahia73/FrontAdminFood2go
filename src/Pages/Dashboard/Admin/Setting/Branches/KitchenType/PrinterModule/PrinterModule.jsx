import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useGet } from "../../../../../../../Hooks/useGet";
import { useDelete } from "../../../../../../../Hooks/useDelete";
import {
    AddButton,
    StaticLoader, TitleSection,
} from "../../../../../../../Components/Components";
import { DeleteIcon, EditIcon } from "../../../../../../../Assets/Icons/AllIcons";
import { IoArrowBack } from "react-icons/io5";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import Warning from "../../../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const PrinterModule = () => {
    const { kitchenId } = useParams();
    const location = useLocation();
    const { kitchenName } = location.state || {};
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en"); const [categories, setCategories] = useState([]);
    const [printerModules, setPrinterModules] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const [openModulesModal, setOpenModulesModal] = useState(null);
    const [openGroupsModal, setOpenGroupsModal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const typesPerPage = 20;

    const { refetch, loading, data } = useGet({ url: `${apiUrl}/admin/kitchen_printer/${kitchenId}` });
    const { deleteData, loadingDelete } = useDelete();

    // Pagination with useMemo
    const totalPages = Math.ceil(data?.printer_kitchen?.length / typesPerPage);
    const currentTypes = useMemo(() => {
        return data?.printer_kitchen?.slice(
            (currentPage - 1) * typesPerPage,
            currentPage * typesPerPage
        );
    }, [data, currentPage]);

    // Reset page if current page exceeds total after delete
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    useEffect(() => {
        refetch();
    }, [selectedLanguage]);

    useEffect(() => {
        if (data && data.printer_kitchen) {
            setPrinterModules(data.printer_kitchen);
        }
    }, [data]);

    const handleOpenProductsModal = (type) => setOpenProductsModal(type);
    const handleCloseProductsModal = () => setOpenProductsModal(null);

    const handleOpenDelete = (id) => setOpenDelete(id);
    const handleCloseDelete = () => setOpenDelete(null);

    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/kitchen_printer/delete/${id}`,
            t("DeletedSuccess", { name })
        );
        if (success) {
            refetch();
            handleCloseDelete();
        }
    };

    const headers = [
        "#",
        t("Print Name"),
        t("Print Type"),
        t("Print Status"),
        t("Print IP"),
        t("Type Modules"),
        t("Group Modules"),
        t("action"),
    ];

    return (
        <div className="w-full pb-28">
            {loading || loadingDelete ? (
                <div className="w-full mt-40">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full gap-5">
                    <div className="w-full flex justify-between items-center mt-5">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-mainColor hover:text-opacity-80 transition-colors"
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <TitleSection text={`${t("PrinterModulesFor")} ${kitchenName || ""}`} />
                        </div>
                        <AddButton handleClick={() => navigate("add")} />
                    </div>

                    {printerModules.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl mb-4">{t("Not Found Types")}</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full overflow-x-scroll sm:min-w-0 scrollPage">
                                <thead>
                                    <tr className="w-full border-b-2">
                                        {headers.map((name, i) => (
                                            <th
                                                key={i}
                                                className="min-w-[120px] text-mainColor text-center font-TextFontLight pb-3"
                                            >
                                                {name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTypes.map((type, index) => (
                                        <tr key={type.id} className="border-b-2">
                                            <td className="text-center py-2">
                                                {(currentPage - 1) * typesPerPage + index + 1}
                                            </td>
                                            <td className="text-center py-2">{type.print_name || "-"}</td>
                                            <td className="text-center py-2">{type.print_type || "-"}</td>
                                            <td className="text-center py-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs ${type.print_status === 1
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {type.print_status === 1 ? t("Active") : t("Inactive")}
                                                </span>
                                            </td>
                                            <td className="text-center py-2">{type.print_ip || "-"}</td>

                                            {/* New Columns */}
                                            <td className="text-center py-2">
                                                {type.module && type.module.length > 0 ? (
                                                    <button
                                                        onClick={() => setOpenModulesModal(type)}
                                                        className="px-3 py-1 bg-mainColor text-white rounded-full text-xs hover:bg-opacity-90"
                                                    >
                                                        {t("View")}
                                                    </button>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="text-center py-2">
                                                {type.group_product && type.group_product.length > 0 ? (
                                                    <button
                                                        onClick={() => setOpenGroupsModal(type)}
                                                        className="px-3 py-1 bg-mainColor text-white rounded-full text-xs hover:bg-opacity-90"
                                                    >
                                                        {t("View")}
                                                    </button>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>


                                            <td className="text-center py-3">
                                                <div className="flex justify-center gap-3">
                                                    <Link to={`edit/${type.id}`} state={{ type }}>
                                                        <EditIcon />
                                                    </Link>
                                                    <button onClick={() => handleOpenDelete(type.id)}>
                                                        <DeleteIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 my-6 flex-wrap">
                                    {currentPage > 1 && (
                                        <button
                                            onClick={() => setCurrentPage((p) => p - 1)}
                                            className="px-4 py-2 bg-mainColor text-white rounded-xl"
                                        >
                                            {t("Prev")}
                                        </button>
                                    )}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4 py-2 rounded-full ${currentPage === page
                                                ? "bg-mainColor text-white"
                                                : "text-mainColor border border-mainColor"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    {currentPage < totalPages && (
                                        <button
                                            onClick={() => setCurrentPage((p) => p + 1)}
                                            className="px-4 py-2 bg-mainColor text-white rounded-xl"
                                        >
                                            {t("Next")}
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
            {/* Modules Modal */}
            {openModulesModal && (
                <Dialog open={true} onClose={() => setOpenModulesModal(null)} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
                            <DialogTitle className="text-xl font-bold text-mainColor mb-4">
                                {t("Modules")} - {openModulesModal.print_name}
                            </DialogTitle>
                            <div className="flex flex-wrap gap-2">
                                {openModulesModal.module && openModulesModal.module.length > 0 ? (
                                    openModulesModal.module.map((m, index) => (
                                        <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                            {t(m)}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">{t("No Modules")}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setOpenModulesModal(null)}
                                className="mt-6 w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                {t("Close")}
                            </button>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}

            {/* Groups Modal */}
            {openGroupsModal && (
                <Dialog open={true} onClose={() => setOpenGroupsModal(null)} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
                            <DialogTitle className="text-xl font-bold text-mainColor mb-4">
                                {t("Group Modules")} - {openGroupsModal.print_name}
                            </DialogTitle>
                            <div className="space-y-2">
                                {openGroupsModal.group_product && openGroupsModal.group_product.length > 0 ? (
                                    openGroupsModal.group_product.map((g, index) => (
                                        <div key={index} className="p-2 border rounded bg-gray-50">
                                            {g.name}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">{t("No Group Modules")}</p>
                                )}
                            </div>
                            <button
                                onClick={() => setOpenGroupsModal(null)}
                                className="mt-6 w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                {t("Close")}
                            </button>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}


            {/* Delete Confirmation */}
            {openDelete && (
                <Dialog open={true} onClose={handleCloseDelete} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
                            <Warning className="mx-auto mb-4" width={48} height={48} />
                            <p className="text-lg mb-6">
                                {t("Youwilldeleteprinter")}{" "}
                                {printerModules.find((t) => t.id === openDelete)?.print_name}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() =>
                                        handleDelete(
                                            openDelete,
                                            printerModules.find((t) => t.id === openDelete)?.name
                                        )
                                    }
                                    className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    {t("Delete")}
                                </button>
                                <button
                                    onClick={handleCloseDelete}
                                    className="px-6 py-3 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    {t("Cancel")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default PrinterModule;