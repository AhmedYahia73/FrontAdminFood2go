import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
    AddButton,
    StaticLoader,
    Switch,
    TitlePage,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { t } from "i18next";

const Cashier = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const role = localStorage.getItem("role");

    const {
        refetch: refetchCashier,
        loading: loadingCashier,
        data: dataCashier,
    } = useGet({
        url: `${apiUrl}/${role}/cashier`,
    });
    const { deleteData, loadingDelete, responseDelete } = useDelete();
    const { changeState, loadingChange, responseChange } = useChangeState();

    const [Cashiers, setCashiers] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);

    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const CashiersPerPage = 20; // Limit to 20 Cashiers per page

    // Calculate total number of pages
    const totalPages = Math.ceil(Cashiers.length / CashiersPerPage);

    // Get the Cashiers for the current page
    const currentCashiers = Cashiers.slice(
        (currentPage - 1) * CashiersPerPage,
        currentPage * CashiersPerPage
    );

    // handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Update Discounts when `data` changes
    useEffect(() => {
        if (dataCashier && dataCashier.cashiers) {
            setCashiers(dataCashier.cashiers);
        }
    }, [dataCashier]); // Only run this effect when `data` changes

    // Change Cashier status
    const handleChangeStaus = async (id, name, status) => {
        const response = await changeState(
            ` ${apiUrl}/${role}/cashier/status/${id}`,
            `${name} Changed Status.`,
            { status } // Pass status as an object if changeState expects an object
        );

        if (response) {
            // Update categories only if changeState succeeded
            setCashiers((prevCashier) =>
                prevCashier.map((Cashier) =>
                    Cashier.id === id ? { ...Cashier, status: status } : Cashier
                )
            );
        }
    };

    useEffect(() => {
        refetchCashier();
    }, [refetchCashier]);

    const handleOpenDelete = (item) => {
        setOpenDelete(item);
    };
    const handleCloseDelete = () => {
        setOpenDelete(null);
    };

    // Delete Language
    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/${role}/cashier/delete/${id}`,
            `${name} Deleted Success.`
        );

        if (success) {
            // Update Discounts only if changeState succeeded
            setCashiers(Cashiers.filter((Cashier) => Cashier.id !== id));
        }
    };

    const headers = [
        t("SL"),
        t("Name"),
        t("Cashier Man"),
        role == "admin" ? t("Branch") : null,
        t("Multiple Shift"),
        t("Status"),
        t("Action"),
    ];
    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
            {loadingCashier || loadingChange || loadingDelete ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className='flex flex-col items-center justify-between md:flex-row'>
                        <div className='w-full md:w-1/2'>
                            <TitlePage text={t('Cashier Table')} />
                        </div>
                        <div className='flex justify-end w-full py-4 md:w-1/2'>
                            <Link to='add'>
                                <AddButton Text={t("Add Cashier")} />
                            </Link>
                        </div>
                    </div>
                    <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
                        <thead className="w-full">
                            <tr className="w-full border-b-2">
                                {headers.filter(Boolean).map((name, index) => (
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
                            {Cashiers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="text-xl text-center text-mainColor font-TextFontMedium "
                                    >
                                        {t("Not find discounts")}
                                    </td>
                                </tr>
                            ) : (
                                currentCashiers.map(
                                    (
                                        Cashier,
                                        index // Example with two rows
                                    ) => (
                                        <tr className="w-full border-b-2" key={index}>
                                            <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {(currentPage - 1) * CashiersPerPage + index + 1}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {Cashier?.name || "-"}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {Cashier?.cashier_man?.user_name || "-"}
                                            </td>
                                            {role === "admin" && (
                                                <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                    {Cashier?.branch?.name || "-"}
                                                </td>
                                            )}
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {Cashier?.multiple === 1 ? t("Yes") : t("No")}
                                            </td>
                                            <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                <Switch
                                                    checked={Cashier.status === 1}
                                                    handleClick={() => {
                                                        handleChangeStaus(
                                                            Cashier.id,
                                                            Cashier.name,
                                                            Cashier.status === 1 ? 0 : 1
                                                        );
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link to={`edit/${Cashier.id}`}>
                                                        <EditIcon />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDelete(Cashier.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </button>
                                                    {openDelete === Cashier.id && (
                                                        <Dialog
                                                            open={true}
                                                            onClose={handleCloseDelete}
                                                            className="relative z-10"
                                                        >
                                                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                                                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                                <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                                                    <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
                                                                        <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                                                                            <Warning
                                                                                width="28"
                                                                                height="28"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <div className="flex items-center">
                                                                                <div className="mt-2 text-center">
                                                                                    {t("You will delete")} {Cashier.name}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                            <button
                                                                                className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                                                                onClick={() =>
                                                                                    handleDelete(Cashier.id, Cashier.name)
                                                                                }
                                                                            >
                                                                                {t("Delete")}
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                data-autofocus
                                                                                onClick={handleCloseDelete}
                                                                                className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                                                                            >
                                                                                {t("Cancel")}
                                                                            </button>
                                                                        </div>
                                                                    </DialogPanel>
                                                                </div>
                                                            </div>
                                                        </Dialog>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                    {Cashiers.length > 0 && (
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

export default Cashier;
