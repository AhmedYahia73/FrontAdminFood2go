import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
    AddButton,
    StaticLoader,
    Switch,
    TitlePage,
} from "../../../../../../Components/Components";
import { useGet } from "../../../../../../Hooks/useGet";
import { useChangeState } from "../../../../../../Hooks/useChangeState";
import { useDelete } from "../../../../../../Hooks/useDelete";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { t } from "i18next";
import { useParams } from "react-router-dom";

const PreparationMan = () => {
    const { branchId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchPreparationMan,
        loading: loadingPreparationMan,
        data: dataPreparationMan,
    } = useGet({
        url: `${apiUrl}/admin/preparation_man/${branchId}`,
    });
    const { deleteData, loadingDelete, responseDelete } = useDelete();
    const { changeState, loadingChange, responseChange } = useChangeState();

    const [PreparationMans, setPreparationMans] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const PreparationMansPerPage = 20;

    const totalPages = Math.ceil(PreparationMans.length / PreparationMansPerPage);

    const currentPreparationMans = PreparationMans.slice(
        (currentPage - 1) * PreparationMansPerPage,
        currentPage * PreparationMansPerPage
    );

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Update PreparationMans when `data` changes
    useEffect(() => {
        if (dataPreparationMan && dataPreparationMan.preparation_men) {
            setPreparationMans(dataPreparationMan.preparation_men);
        }
    }, [dataPreparationMan]);

    // Change PreparationMan status
    const handleChangeStatus = async (id, name, status) => {
        const response = await changeState(
            `${apiUrl}/admin/preparation_man/status/${id}`,
            `${name} Changed Status.`,
            { status }
        );

        if (response) {
            setPreparationMans((prevPreparationMans) =>
                prevPreparationMans.map((PreparationMan) =>
                    PreparationMan.id === id ? { ...PreparationMan, status: status } : PreparationMan
                )
            );
        }
    };

    useEffect(() => {
        refetchPreparationMan();
    }, [refetchPreparationMan]);

    const handleOpenDelete = (item) => {
        setOpenDelete(item);
    };

    const handleCloseDelete = () => {
        setOpenDelete(null);
    };

    // Delete PreparationMan
    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/preparation_man/delete/${id}`,
            `${name} Deleted Success.`
        );

        if (success) {
            setPreparationMans(PreparationMans.filter((PreparationMan) => PreparationMan.id !== id));
        }
    };

    const headers = [
        t("SL"),
        t("Name"),
        t("Branch"),
        t("Print Name"),
        t("Print Status"),
        t("Status"),
        t("Action"),
    ];

    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
            {loadingPreparationMan || loadingChange || loadingDelete ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className='flex flex-col items-center justify-between md:flex-row'>
                        <div className='w-full md:w-1/2'>
                            <TitlePage text={t('Preparation Man Table')} />
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
                            {PreparationMans.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="text-xl text-center text-mainColor font-TextFontMedium "
                                    >
                                        {t("No Preparation Man Found")}
                                    </td>
                                </tr>
                            ) : (
                                currentPreparationMans.map((PreparationMan, index) => (
                                    <tr className="w-full border-b-2" key={index}>
                                        <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {(currentPage - 1) * PreparationMansPerPage + index + 1}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {PreparationMan?.name || "-"}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {PreparationMan?.branch?.name || "-"}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {PreparationMan?.print_name || "-"}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            <span
                                                className={`px-3 py-1 rounded-full text-white ${PreparationMan?.print_status === 1 ? "bg-green-500" : "bg-red-500"
                                                    }`}
                                            >
                                                {PreparationMan?.print_status === 1 ? t("Active") : t("Inactive")}
                                            </span>
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            <Switch
                                                checked={PreparationMan.status === 1}
                                                handleClick={() => {
                                                    handleChangeStatus(
                                                        PreparationMan.id,
                                                        PreparationMan.name,
                                                        PreparationMan.status === 1 ? 0 : 1
                                                    );
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`edit/${PreparationMan.id}`}>
                                                    <EditIcon />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDelete(PreparationMan.id)}
                                                >
                                                    <DeleteIcon />
                                                </button>
                                                {openDelete === PreparationMan.id && (
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
                                                                                {t("You will delete")} {PreparationMan.name}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                                        <button
                                                                            className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                                                            onClick={() =>
                                                                                handleDelete(PreparationMan.id, PreparationMan.name)
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

                    {PreparationMans.length > 0 && (
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

export default PreparationMan;