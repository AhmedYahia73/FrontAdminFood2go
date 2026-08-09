import React, { useEffect, useState } from "react";
import { EditIcon } from "../../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
    AddButton,
    StaticLoader,
    TitlePage,
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { t } from "i18next";

const PurchaseList = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchPurchaseList,
        loading: loadingPurchaseList,
        data: dataPurchaseList,
    } = useGet({
        url: `${apiUrl}/admin/purchase`,
    });

    const [purchases, setPurchases] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const purchasesPerPage = 20;

    const totalPages = Math.ceil(purchases.length / purchasesPerPage);

    const currentPurchases = purchases.slice(
        (currentPage - 1) * purchasesPerPage,
        currentPage * purchasesPerPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Update purchases when `data` changes
    useEffect(() => {
        if (dataPurchaseList && dataPurchaseList.purchases) {
            setPurchases(dataPurchaseList.purchases);
        }
    }, [dataPurchaseList]);

    useEffect(() => {
        refetchPurchaseList();
    }, [refetchPurchaseList]);

    const headers = [
        t("SL"),
        t("Admin"),
        t("Type"),
        t("Category"),
        t("Item"),
        t("Store"),
        t("Quantity"),
        t("Total Cost"),
        t("Date"),
        t("Payment Methods"),
        t("Action"),
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getPaymentMethods = (financials) => {
        if (!financials || financials.length === 0) return "-";
        return financials.map(financial => financial.name).join(", ");
    };

    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
            {loadingPurchaseList ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className='flex flex-col items-center justify-between md:flex-row'>
                        <div className='w-full md:w-1/2'>
                            <TitlePage text={t('Purchases')} />
                        </div>
                        <div className='flex justify-end w-full py-4 md:w-1/2'>
                            <Link to='add'>
                                <AddButton Text={t("Add Purchase")} />
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
                            {purchases.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="text-xl text-center text-mainColor font-TextFontMedium "
                                    >
                                        {t("No Purchases Found")}
                                    </td>
                                </tr>
                            ) : (
                                currentPurchases.map((purchase, index) => {
                                    const type = purchase.type === "product" ? "product" : "material";
                                    const itemName = type === "product" ? purchase.product : purchase.material;
                                    const categoryName = type === "product" ? purchase.category : purchase.material_category;
                                    return (
                                        <tr className="w-full border-b-2" key={index}>
                                            <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {(currentPage - 1) * purchasesPerPage + index + 1}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {purchase?.admin || "-"}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {type}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {categoryName || "-"}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {itemName || "-"}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {purchase?.store || "-"}
                                            </td>
                                            <td className="min-w-[100px] sm:min-w-[80px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {purchase?.quintity || "0"}
                                            </td>
                                            <td className="min-w-[120px] sm:min-w-[100px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {purchase?.total_coast || "0"}EGP
                                            </td>
                                            <td className="min-w-[120px] sm:min-w-[100px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {formatDate(purchase?.date)}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[120px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {getPaymentMethods(purchase?.financial)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link to={`edit/${purchase.id}`}>
                                                        <EditIcon />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>

                    {purchases.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
                            {currentPage !== 1 && (
                                <button
                                    type="button"
                                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Prev
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
                                    Next
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PurchaseList;