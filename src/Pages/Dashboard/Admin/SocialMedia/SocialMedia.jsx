import React, { useEffect, useState } from 'react';
import { useGet } from '../../../../Hooks/useGet';
import { useChangeState } from '../../../../Hooks/useChangeState';
import { useDelete } from '../../../../Hooks/useDelete';
import { AddButton, StaticLoader, Switch, TitlePage } from '../../../../Components/Components';
import { DeleteIcon, EditIcon } from '../../../../Assets/Icons/AllIcons';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import Warning from '../../../../Assets/Icons/AnotherIcons/WarningIcon';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SocialMedia = ({ update, setUpdate }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchSocial, loading: loadingSocial, data: dataSocial } = useGet({
        url: `${apiUrl}/admin/social_media`,
    });
    const { t } = useTranslation();
    const { changeState, loadingChange } = useChangeState();
    const { deleteData, loadingDelete } = useDelete();
    const [socialMedia, setSocialMedia] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        refetchSocial();
    }, [refetchSocial, update]);

    useEffect(() => {
        if (dataSocial && dataSocial.social_media) {
            setSocialMedia(dataSocial.social_media);
        } else if (Array.isArray(dataSocial)) {
            setSocialMedia(dataSocial);
        }
    }, [dataSocial]);

    const handleChangeStatus = async (id, name, status) => {
        const response = await changeState(
            `${apiUrl}/admin/social_media/status/${id}?status=${status}`,
            `${name} Changed Status.`,
        );

        if (response) {
            setSocialMedia((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: status } : item
                )
            );
        }
    };

    const handleOpenDelete = (item) => setOpenDelete(item);
    const handleCloseDelete = () => setOpenDelete(null);

    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/social_media/delete/${id}`,
            `${name} Deleted Success.`
        );

        if (success) {
            setSocialMedia(socialMedia.filter((item) => item.id !== id));
            handleCloseDelete();
        }
    };

    const headers = ["#", t("Name"), t("Icon"), t("Link"), t("Status"), t("Action")];

    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
            {loadingSocial || loadingChange || loadingDelete ? (
                <div className="w-full mt-40">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full p-4">
                    <div className="flex items-center justify-between mb-8">
                        <TitlePage text={t("Social Media")} />
                        <Link to="add">
                            <AddButton Text={t("Add")} />
                        </Link>
                    </div>                    <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
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
                            {socialMedia.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={headers.length}
                                        className="py-4 text-base text-center text-mainColor font-TextFontMedium"
                                    >
                                        {t("No social media found")}.
                                    </td>
                                </tr>
                            ) : (
                                socialMedia.map((item, index) => (
                                    <tr className="w-full border-b-2" key={index}>
                                        <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {index + 1}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {item?.name || "-"}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            {item?.icon_link ? <img src={item.icon_link} alt={item.name} className="w-10 h-10 mx-auto object-cover" /> : "-"}
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            <a href={item?.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item?.link || "-"}</a>
                                        </td>
                                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                            <Switch
                                                checked={item?.status === 1 || item?.status === '1'}
                                                handleClick={() =>
                                                    handleChangeStatus(
                                                        item.id,
                                                        item.name,
                                                        item.status === 1 || item.status === '1' ? 0 : 1
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="py-2 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`edit/${item.id}`} state={{ socialMedia: item }}>
                                                    <EditIcon />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDelete(item.id)}
                                                >
                                                    <DeleteIcon />
                                                </button>

                                                {/* Dialog for delete confirmation */}
                                                {openDelete === item.id && (
                                                    <Dialog
                                                        open={openDelete === item.id}
                                                        onClose={handleCloseDelete}
                                                        className="relative z-10"
                                                    >
                                                        <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                                                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                            <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                                                <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-sm">
                                                                    <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-4 sm:pb-4">
                                                                        <Warning
                                                                            width="24"
                                                                            height="24"
                                                                            aria-hidden="true"
                                                                        />
                                                                        <div className="mt-2 text-sm text-center">
                                                                            {t("You are about to delete")}{" "}
                                                                            <span className="font-TextFontMedium">
                                                                                {item?.name || "-"}
                                                                            </span>
                                                                            .
                                                                        </div>
                                                                    </div>
                                                                    <div className="px-4 py-2 sm:flex sm:flex-row-reverse sm:px-6">
                                                                        <button
                                                                            className="inline-flex justify-center w-full px-4 py-2 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:ml-2 sm:w-auto hover:bg-mainColor-dark"
                                                                            onClick={() =>
                                                                                handleDelete(item.id, item.name)
                                                                            }
                                                                        >
                                                                            {t("ConfirmDelete")}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleCloseDelete}
                                                                            className="inline-flex justify-center w-full px-4 py-2 mt-2 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto hover:bg-gray-50"
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
                </div>
            )}
        </div>
    );
};

export default SocialMedia;
