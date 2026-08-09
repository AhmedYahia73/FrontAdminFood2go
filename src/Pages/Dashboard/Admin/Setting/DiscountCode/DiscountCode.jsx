import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
    AddButton,
    StaticLoader,
    Switch,
    TitlePage,
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useDelete } from "../../../../../Hooks/useDelete";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { t } from "i18next";

const DiscountCode = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchDiscountCode,
        loading: loadingDiscountCode,
        data: dataDiscountCode,
    } = useGet({
        url: `${apiUrl}/admin/discount_code`,
    });
    const { deleteData, loadingDelete, responseDelete } = useDelete();
    const { changeState, loadingChange, responseChange } = useChangeState();

    const [DiscountCodes, setDiscountCodes] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const [openViewCodes, setOpenViewCodes] = useState(null);
    const [selectedDiscountGroup, setSelectedDiscountGroup] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const DiscountCodesPerPage = 20;

    // Use useGet hook for fetching codes
    const { 
        refetch: refetchCodes, 
        loading: loadingCodes, 
        data: codesData 
    } = useGet({
        url: selectedDiscountGroup ? `${apiUrl}/admin/discount_code/generated_codes/${selectedDiscountGroup.id}` : null,
    });

    const totalPages = Math.ceil(DiscountCodes.length / DiscountCodesPerPage);

    const currentDiscountCodes = DiscountCodes.slice(
        (currentPage - 1) * DiscountCodesPerPage,
        currentPage * DiscountCodesPerPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Update DiscountCodes when `data` changes
    useEffect(() => {
        if (dataDiscountCode && dataDiscountCode.discount_groups) {
            setDiscountCodes(dataDiscountCode.discount_groups);
        }
    }, [dataDiscountCode]);

    // Change DiscountCode status
    const handleChangeStatus = async (id, name, status) => {
        const response = await changeState(
            `${apiUrl}/admin/discount_code/status/${id}`,
            `${name} Changed Status.`,
            { status }
        );

        if (response) {
            setDiscountCodes((prevDiscountCodes) =>
                prevDiscountCodes.map((DiscountCode) =>
                    DiscountCode.id === id ? { ...DiscountCode, status: status } : DiscountCode
                )
            );
        }
    };

    useEffect(() => {
        refetchDiscountCode();
    }, [refetchDiscountCode]);

    const handleOpenDelete = (item) => {
        setOpenDelete(item);
    };

    const handleCloseDelete = () => {
        setOpenDelete(null);
    };

    const handleOpenViewCodes = (discountGroup) => {
        setSelectedDiscountGroup(discountGroup);
        setOpenViewCodes(discountGroup);
        // The useGet hook will automatically refetch when the URL changes
    };

    const handleCloseViewCodes = () => {
        setOpenViewCodes(null);
        setSelectedDiscountGroup(null);
    };

    // Refetch codes when selectedDiscountGroup changes
    useEffect(() => {
        if (selectedDiscountGroup) {
            refetchCodes();
        }
    }, [selectedDiscountGroup, refetchCodes]);

    // Delete DiscountCode
    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/discount_code/delete/${id}`,
            `${name} Deleted Success.`
        );

        if (success) {
            setDiscountCodes(DiscountCodes.filter((DiscountCode) => DiscountCode.id !== id));
        }
    };

    const headers = [
        t("SL"),
        t("Group Name"),
        t("Discount"),
        t("Usage Number"),
        t("Number of Codes"),
        t("Start Date"),
        t("End Date"),
        t("View Codes"),
        t("Status"),
        t("Action"),
    ];

    // Format date function
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
            {loadingDiscountCode || loadingChange || loadingDelete ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className='flex flex-col items-center justify-between md:flex-row'>
                        <div className='w-full md:w-1/2'>
                            <TitlePage text={t('Discount Code Table')} />
                        </div>
                        <div className='flex justify-end w-full py-4 md:w-1/2'>
                            <Link to='add'>
                                <AddButton Text={t("Add Discount Code")} />
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
                            {DiscountCodes.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="text-xl text-center text-mainColor font-TextFontMedium "
                                    >
                                        {t("No discount codes found")}
                                    </td>
                                </tr>
                            ) : (
                                currentDiscountCodes.map((DiscountCode, index) => (
                                    <tr className="w-full border-b-2" key={index}>
                                        <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {(currentPage - 1) * DiscountCodesPerPage + index + 1}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {DiscountCode?.group_name || "-"}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {DiscountCode?.discount || 0}%
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {DiscountCode?.usage_number || 0}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {DiscountCode?.number_codes || 0}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {DiscountCode?.start ? formatDate(DiscountCode.start) : "-"}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {DiscountCode?.end ? formatDate(DiscountCode.end) : "-"}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenViewCodes(DiscountCode)}
                                                className="px-2 py-2 text-white bg-mainColor rounded-lg hover:bg-red-700 transition-colors font-TextFontMedium"
                                            >
                                                {t("View")}
                                            </button>
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            <Switch
                                                checked={DiscountCode.status === 1}
                                                handleClick={() => {
                                                    handleChangeStatus(
                                                        DiscountCode.id,
                                                        DiscountCode.group_name,
                                                        DiscountCode.status === 1 ? 0 : 1
                                                    );
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* <Link to={`edit/${DiscountCode.id}`}>
                                                    <EditIcon />
                                                </Link> */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDelete(DiscountCode.id)}
                                                >
                                                    <DeleteIcon />
                                                </button>
                                                {openDelete === DiscountCode.id && (
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
                                                                                {t("You will delete")} {DiscountCode.group_name}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                        <button
                                                                            className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                                                            onClick={() =>
                                                                                handleDelete(DiscountCode.id, DiscountCode.group_name)
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
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* View Codes Modal */}
                    {openViewCodes && (
                        <Dialog
                            open={true}
                            onClose={handleCloseViewCodes}
                            className="relative z-10"
                        >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                    <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-2xl">
                                        <div className="px-4 pt-5 pb-4 bg-white sm:p-6">
                                            <div className="sm:flex sm:items-start">
                                                <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                                        {t("Generated Codes for")} "{openViewCodes.group_name}"
                                                    </h3>
                                                    <div className="mt-4">
                                                        {loadingCodes ? (
                                                            <div className="flex items-center justify-center py-8">
                                                                <StaticLoader />
                                                            </div>
                                                        ) : (
                                                            <div className="max-h-96 overflow-y-auto">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                                    {codesData?.generated_codes?.length > 0 ? (
                                                                        codesData.generated_codes.map((code, index) => (
                                                                            <div
                                                                                key={index}
                                                                                className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center"
                                                                            >
                                                                                <span className="font-mono text-lg font-bold text-mainColor">
                                                                                    {code}
                                                                                </span>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="col-span-3 py-8 text-center text-gray-500">
                                                                            {t("No codes generated")}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {codesData?.generated_codes?.length > 0 && (
                                                                    <div className="mt-4 text-sm text-gray-600 text-center">
                                                                        {t("Total Codes")}: {codesData.generated_codes.length}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 bg-gray-50 sm:flex sm:flex-row-reverse sm:px-6">
                                            <button
                                                type="button"
                                                onClick={handleCloseViewCodes}
                                                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white rounded-md bg-mainColor hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainColor sm:ml-3 sm:w-auto"
                                            >
                                                {t("Close")}
                                            </button>
                                        </div>
                                    </DialogPanel>
                                </div>
                            </div>
                        </Dialog>
                    )}

                    {DiscountCodes.length > 0 && (
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

export default DiscountCode;