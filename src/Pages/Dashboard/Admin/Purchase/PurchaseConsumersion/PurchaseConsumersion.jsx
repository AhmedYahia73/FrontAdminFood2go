import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    AddButton,
    StaticLoader,
    Switch,
    TitlePage,
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { t } from "i18next";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { EditIcon } from "../../../../../Assets/Icons/AllIcons";

const PurchaseConsumersion = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchPurchaseConsumersion,
        loading: loadingPurchaseConsumersion,
        data: dataPurchaseConsumersion,
    } = useGet({
        url: `${apiUrl}/admin/purchase_consumersion`,
    });
    const { changeState, loadingChange, responseChange } = useChangeState();

    const [PurchaseConsumersions, setPurchaseConsumersions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const PurchaseConsumersionsPerPage = 20;

    const totalPages = Math.ceil(PurchaseConsumersions.length / PurchaseConsumersionsPerPage);

    const currentPurchaseConsumersions = PurchaseConsumersions.slice(
        (currentPage - 1) * PurchaseConsumersionsPerPage,
        currentPage * PurchaseConsumersionsPerPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Update PurchaseConsumersions when `data` changes
    useEffect(() => {
        if (dataPurchaseConsumersion && dataPurchaseConsumersion.consumersions) {
            setPurchaseConsumersions(dataPurchaseConsumersion.consumersions);
        }
    }, [dataPurchaseConsumersion]);

    useEffect(() => {
        refetchPurchaseConsumersion();
    }, [refetchPurchaseConsumersion]);

    // Format date to readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Change PurchaseConsumersion status
    const handleChangeStatus = async (id, name, status) => {
        const newStatus = status === "approve" ? "reject" : "approve";
        const response = await changeState(
            `${apiUrl}/admin/purchase_consumersion/status/${id}`,
            `${name} Status Changed to ${newStatus}.`,
            { status: newStatus }
        );

        if (response) {
            setPurchaseConsumersions((prevPurchaseConsumersions) =>
                prevPurchaseConsumersions.map((consumersion) =>
                    consumersion.id === id ? { ...consumersion, status: newStatus } : consumersion
                )
            );
        }
    };

    // Get status display text and color
    const getStatusDisplay = (status) => {
        const isApproved = status === "approve";
        return {
            text: isApproved ? t("Approved") : t("Rejected"),
            color: isApproved ? "text-green-600" : "text-red-600",
            bgColor: isApproved ? "bg-green-100" : "bg-red-100"
        };
    };

    const headers = [
        t("SL"),
        t("Type"),
        t("Category"),
        t("Item"),
        t("Branch"),
        t("Store"),
        t("Quantity"),
        t("Date"),
        t("Admin"),
        t("Status"),
        t("Actions")
    ];

    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
            {loadingPurchaseConsumersion ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className='flex flex-col items-center justify-between md:flex-row'>
                        <div className='w-full md:w-1/2'>
                            <TitlePage text={t('Purchase Consumption')} />
                        </div>
                        <div className='flex justify-end w-full py-4 md:w-1/2'>
                            <Link to='add'>
                                <AddButton Text={t("Add")} />
                            </Link>
                        </div>
                    </div>
                    <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
                        <thead className="w-full">
                            <tr className="w-full border-b-2">
                                {headers.map((name, index) => (
                                    <th
                                        className="min-w-[120px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3"
                                        key={index}
                                    >
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="w-full">
                            {PurchaseConsumersions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="text-xl text-center text-mainColor font-TextFontMedium "
                                    >
                                        {t("No Purchase Consumption Found")}
                                    </td>
                                </tr>
                            ) : (
                                currentPurchaseConsumersions.map((consumersion, index) => {
                                    const statusDisplay = getStatusDisplay(consumersion.status);

                                    // Smart display logic
                                    const itemName = consumersion.product || consumersion.material || "-";
                                    const categoryName = consumersion.category || consumersion.category_material || "-";

                                    return (
                                        <tr className="w-full border-b-2" key={consumersion.id}>
                                            <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {(currentPage - 1) * PurchaseConsumersionsPerPage + index + 1}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {(consumersion.product && consumersion.category) ? "Product" : "Material"}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {categoryName}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {itemName}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {consumersion?.branch || "-"}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {consumersion?.store || "-"}
                                            </td>
                                            <td className="min-w-[100px] sm:min-w-[80px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {consumersion?.quintity || "0"}
                                            </td>
                                            <td className="min-w-[200px] sm:min-w-[150px] sm:w-3/12 lg:w-3/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {consumersion?.date ? formatDate(consumersion.date) : "-"}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {consumersion?.admin || "-"}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[120px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Switch
                                                        checked={consumersion.status === "approve"}
                                                        handleClick={() => handleChangeStatus(consumersion.id, consumersion.product, consumersion.status)}
                                                        disabled={loadingChange}
                                                    />
                                                    <span className={`text-sm font-medium px-2 py-1 rounded ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                                                        {statusDisplay.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link to={`edit/${consumersion.id}`}>
                                                        <EditIcon />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {PurchaseConsumersions.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
                            {currentPage !== 1 && (
                                <button
                                    type="button"
                                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    {t("Prev")}
                                </button>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page
                                            ? "bg-mainColor text-white"
                                            : " text-mainColor"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                            {totalPages !== currentPage && (
                                <button
                                    type="button"
                                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    {t("Next")}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PurchaseConsumersion;