import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGet } from "../../../../Hooks/useGet";
import { useDelete } from "../../../../Hooks/useDelete";
import { useChangeState } from "../../../../Hooks/useChangeState";
import {
    AddButton,
    StaticLoader,
    Switch,
    TitleSection,
} from "../../../../Components/Components";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { MdVisibility } from "react-icons/md";

const ProductOffers = () => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");

    const [offers, setOffers] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const [openDetails, setOpenDetails] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const { refetch, loading, data } = useGet({
        url: `${apiUrl}/admin/product_offer`,
    });

    const { deleteData, loadingDelete } = useDelete();
    const { changeState } = useChangeState();

    useEffect(() => {
        refetch();
    }, [selectedLanguage, refetch]);

    useEffect(() => {
        if (data && data.offers) {
            setOffers(Array.isArray(data.offers) ? data.offers : data.offers || []);
        } else if (Array.isArray(data)) {
            setOffers(data);
        }
    }, [data]);

    // Pagination
    const totalPages = Math.ceil(offers.length / itemsPerPage);
    const currentItems = useMemo(() => {
        return offers.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [offers, currentPage]);

    const handleChangeStatus = async (id, name, status) => {
        const res = await changeState(
            `${apiUrl}/admin/product_offer/status/${id}`,
            t("StatusChangedSuccess", { name }),
            { status }
        );
        if (res) {
            setOffers((prev) =>
                prev.map((item) => (item.id === id ? { ...item, status } : item))
            );
        }
    };

    const handleOpenDelete = (id) => setOpenDelete(id);
    const handleCloseDelete = () => setOpenDelete(null);

    const handleOpenDetails = (item) => setOpenDetails(item);
    const handleCloseDetails = () => setOpenDetails(null);

    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/product_offer/${id}`,
            t("DeletedSuccess", { name })
        );
        if (success) {
            setOffers((prev) => prev.filter((item) => item.id !== id));
            handleCloseDelete();
        }
    };

    const headers = [
        "#",
        t("Name"),
        t("Discount"),
        t("StartDate"),
        t("EndDate"),
        t("Details"),
        // t("Status"),
        t("Action"),
    ];

    const DetailItem = ({ label, value }) => (
        <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-gray-100 last:border-0">
            <span className="font-semibold text-gray-700 min-w-[150px]">{label}:</span>
            <span className="text-gray-600 flex-1">{value || "-"}</span>
        </div>
    );

    return (
        <div className="w-full pb-28">
            {loading || loadingDelete ? (
                <div className="w-full mt-40">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full gap-5">
                    <div className="w-full flex justify-between mt-5">
                        <TitleSection text={t("Product Offers")} />
                        <AddButton handleClick={() => navigate("add")} />
                    </div>

                    {offers.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl mb-4">{t("No Offers Found")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-full overflow-x-auto scrollPage">
                                <table className="w-full sm:min-w-0">
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
                                        {currentItems.map((item, index) => (
                                            <tr key={item.id} className="border-b-2">
                                                <td className="text-center py-2">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="text-center py-2">{item.name || "-"}</td>
                                                <td className="text-center py-2">{item.discount ? `${item.discount}%` : "-"}</td>
                                                <td className="text-center py-2">{item.start_date || "-"}</td>
                                                <td className="text-center py-2">{item.end_date || "-"}</td>
                                                <td className="text-center py-2">
                                                    <button
                                                        onClick={() => handleOpenDetails(item)}
                                                        className="p-2 text-mainColor hover:bg-gray-100 rounded-full transition-colors"
                                                        title={t("View Details")}
                                                    >
                                                        <MdVisibility size={20} />
                                                    </button>
                                                </td>
                                                {/* <td className="text-center py-2">
                                                    <Switch
                                                        checked={item.status === 1}
                                                        handleClick={() =>
                                                            handleChangeStatus(
                                                                item.id,
                                                                item.name,
                                                                item.status === 1 ? 0 : 1
                                                            )
                                                        }
                                                    />
                                                </td> */}
                                                <td className="text-center py-3">
                                                    <div className="flex justify-center gap-3">
                                                        <Link to={`edit/${item.id}`} state={{ offer: item }}>
                                                            <EditIcon />
                                                        </Link>
                                                        <button onClick={() => handleOpenDelete(item.id)}>
                                                            <DeleteIcon />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

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

            {/* Details Modal */}
            {openDetails && (
                <Dialog open={true} onClose={handleCloseDetails} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6 border-b pb-2">
                                <DialogTitle className="text-2xl font-bold text-mainColor">
                                    {t("Offer Details")}
                                </DialogTitle>
                                <button
                                    onClick={handleCloseDetails}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-2">
                                <DetailItem label={t("Name")} value={openDetails.name} />
                                <DetailItem label={t("Modules")} value={openDetails.module?.map(m => t(m)).join(", ") || t(openDetails.module)} />
                                <DetailItem label={t("Discount")} value={openDetails.discount ? `${openDetails.discount}%` : "-"} />
                                <DetailItem label={t("Delay")} value={openDetails.delay ? `${openDetails.delay} ${t("minutes")}` : "-"} />
                                <DetailItem label={t("Start Date")} value={openDetails.start_date} />
                                <DetailItem label={t("End Date")} value={openDetails.end_date} />
                                <DetailItem label={t("Time From")} value={openDetails.time_from} />
                                <DetailItem label={t("Time To")} value={openDetails.time_to} />
                                <DetailItem label={t("Days")} value={openDetails.days?.map(d => t(d)).join(", ")} />

                                <div className="mt-4">
                                    <span className="font-semibold text-gray-700 block mb-2">{t("Products")}:</span>
                                    <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto border">
                                        {openDetails.products?.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-1">
                                                {openDetails.products.map(product => (
                                                    <li key={product.id} className="text-gray-600">
                                                        {product.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-500">{t("No Products")}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleCloseDetails}
                                    className="px-6 py-2 bg-mainColor text-white rounded hover:bg-opacity-90 transition-colors"
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
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
                            <Warning className="mx-auto mb-4" width={48} height={48} />
                            <p className="text-lg mb-6">
                                {t("You will delete offer")}{" "}
                                {offers.find((t) => t.id === openDelete)?.name}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() =>
                                        handleDelete(
                                            openDelete,
                                            offers.find((t) => t.id === openDelete)?.name
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
}

export default ProductOffers;
