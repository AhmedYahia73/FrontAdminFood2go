import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../Context/Auth";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import { StaticLoader } from "../../../../Components/Components";

const Popup = () => {
    const { t } = useTranslation();
    const auth = useAuth();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name_en: "",
        name_ar: "",
        image_en: null,
        image_ar: null,
        link: "",
        status: 1,
    });

    const [previewEn, setPreviewEn] = useState(null);
    const [previewAr, setPreviewAr] = useState(null);

    const { data: popupData, loading, refetch } = useGet({
        url: `${apiUrl}/admin/popup`,
    });

    // Check if data is null/empty
    const isDataEmpty = !popupData ||
        (popupData.image_ar === null &&
            popupData.image_en === null &&
            popupData.link === null &&
            popupData.name_ar === null &&
            popupData.name_en === null &&
            popupData.status === null);

    const popup = !isDataEmpty ? popupData : null;

    const { postData, loadingPost } = usePost({
        url: `${apiUrl}/admin/popup/create_or_update`,
    });

    const { changeState } = useChangeState();
    const { deleteData } = useDelete();

    const getImageUrl = (url) => {
        if (!url) return "https://via.placeholder.com/600x400.png?text=No+Image";
        return url.startsWith("http") ? url : `${apiUrl}/${url}`;
    };

    useEffect(() => {
        if (isModalOpen && popup) {
            setFormData({
                name_en: popup.name_en || "",
                name_ar: popup.name_ar || "",
                link: popup.link || "",
                status: popup.status || 1,
                image_en: null,
                image_ar: null,
            });
            setPreviewEn(popup.image_en ? getImageUrl(popup.image_en) : null);
            setPreviewAr(popup.image_ar ? getImageUrl(popup.image_ar) : null);
        }
    }, [isModalOpen, popup]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = (refresh = false) => {
        setIsModalOpen(false);
        setFormData({ name_en: "", name_ar: "", image_en: null, image_ar: null, link: "", status: 1 });
        setPreviewEn(null);
        setPreviewAr(null);
        if (refresh) refetch();
    };

    const openDeleteModal = () => setIsDeleteModalOpen(true);
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                name === "image_en" ? setPreviewEn(reader.result) : setPreviewAr(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name_en", formData.name_en);
        data.append("name_ar", formData.name_ar);
        data.append("link", formData.link || "");
        data.append("status", formData.status);

        // Only append image if a NEW file is selected
        data.append("image_en", formData.image_en);
        data.append("image_ar", formData.image_ar);

        const success = await postData(
            data,
            popup ? t("Popup updated successfully") : t("Popup created successfully")
        );
        if (success) closeModal(true);
    };

    const handleToggleStatus = async () => {
        if (!popup) return;
        const newStatus = popup.status === 1 ? 0 : 1;
        const success = await changeState(
            `${apiUrl}/admin/popup/status`,
            newStatus === 1 ? t("Popup activated") : t("Popup deactivated"),
            { status: newStatus }
        );
        if (success) refetch();
    };

    const handleDelete = async () => {
        if (!popup) return;
        const success = await deleteData(
            `${apiUrl}/admin/popup/delete`,
            t("Popup deleted successfully")
        );
        if (success) {
            closeDeleteModal();
            refetch();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <StaticLoader />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 md:p-6 lg:p-8">
            <div className="w-full pb-32">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-6 mb-8 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">{t("Popup")}</h1>
                        <p className="mt-2 text-gray-600">{t("Manage your website popup content")}</p>
                    </div>
                    {!popup && (
                        <button
                            onClick={openModal}
                            className="flex items-center w-full gap-3 px-8 py-4 text-lg font-bold text-white transition-all duration-300 sm:w-auto bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:shadow-xl hover:scale-105 group"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t("Create Popup")}
                        </button>
                    )}
                </div>

                {/* Current Popup */}
                {popup ? (
                    <div className="relative w-full overflow-hidden transition-all duration-300 transform bg-white border-2 shadow-2xl rounded-2xl sm:rounded-3xl hover:shadow-3xl">
                        {/* Status Switch - Top Right */}
                       <div className="absolute z-10 p-2 rounded-full top-4 right-4">
    <button
        onClick={handleToggleStatus}
        className={`w-14 h-8 sm:w-16 sm:h-9 rounded-full transition-all duration-300 ${
            popup.status === 1 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-500"
        }`}
    >
        <span
            className={`block w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full shadow-lg transform transition-transform duration-300
                ${
                    popup.status === 1
                        ? document.dir === "rtl"
                            ? "-translate-x-7 sm:-translate-x-8" // في حالة RTL، يتحرك لليسار
                            : "translate-x-7 sm:translate-x-8"  // في حالة LTR، يتحرك لليمين
                        : document.dir === "rtl"
                        ? "-translate-x-1 sm:-translate-x-1"
                        : "translate-x-1"
                }`}
        />
    </button>
</div>


                        {/* Edit Button - Top Left */}
                        {/* <div className="absolute z-10 top-4 left-4">
                            <button
                                onClick={openModal}
                                className="flex items-center gap-2 px-4 py-2 font-bold text-white transition-all duration-300 bg-blue-500 rounded-xl hover:bg-blue-600 hover:scale-105"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {t("Edit")}
                            </button>
                        </div> */}

                        {/* Dual Language Cards */}
                        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                            {/* English */}
                            <div className="relative p-6 overflow-hidden sm:p-8 lg:p-10 bg-gradient-to-br from-blue-50 to-white">
                                <div className="absolute px-3 py-1 text-sm font-bold text-blue-800 bg-blue-100 rounded-full top-2 right-2">
                                    EN
                                </div>
                                <p className="mb-4 text-sm font-bold text-center text-blue-700 sm:text-base">{t("English Version")}</p>
                                <div className="mb-6 overflow-hidden transition-colors bg-gray-100 border-2 border-gray-300 border-dashed rounded-2xl hover:border-blue-400">
                                    <img
                                        src={getImageUrl(popup.image_en)}
                                        alt={popup.name_en}
                                        className="object-cover w-full h-64 transition-transform duration-500 sm:h-80 lg:h-96 hover:scale-105"
                                    />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold text-center text-transparent text-gray-800 sm:text-3xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                                    {popup.name_en || t("No name")}
                                </h2>
                                {popup.link && (
                                    <div className="text-center">
                                        <a
                                            href={popup.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-base underline break-all transition-colors text-mainColor hover:text-blue-700 sm:text-lg"
                                        >
                                            {popup.link}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Arabic */}
                            <div className="relative p-6 overflow-hidden sm:p-8 lg:p-10 bg-gradient-to-bl from-pink-50 to-white" dir="rtl">
                                <div className="absolute px-3 py-1 text-sm font-bold text-pink-800 bg-pink-100 rounded-full top-2 left-2">
                                    AR
                                </div>
                                <p className="mb-4 text-sm font-bold text-center text-pink-700 sm:text-base">{t("Arabic Version")}</p>
                                <div className="mb-6 overflow-hidden transition-colors bg-gray-100 border-2 border-gray-300 border-dashed rounded-2xl hover:border-pink-400">
                                    <img
                                        src={getImageUrl(popup.image_ar)}
                                        alt={popup.name_ar}
                                        className="object-cover w-full h-64 transition-transform duration-500 sm:h-80 lg:h-96 hover:scale-105"
                                    />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold text-center text-transparent text-gray-800 sm:text-3xl bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text">
                                    {popup.name_ar || t("No name")}
                                </h2>
                                {popup.link && (
                                    <div className="text-center">
                                        <a
                                            href={popup.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-base underline break-all transition-colors text-mainColor hover:text-pink-700 sm:text-lg"
                                        >
                                            {popup.link}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 sm:p-8 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                                <div className="flex flex-col items-center gap-4 sm:flex-row">
                                    <span className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-xl font-bold shadow-md ${popup.status === 1 ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800" : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"}`}>
                                        {popup.status === 1 ? t("Active") : t("Inactive")}
                                    </span>
                                    <div className="text-center text-gray-600 sm:text-left">
                                        <p className="text-sm">{t("Last updated")}:</p>
                                        <p className="font-medium">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={openDeleteModal}
                                    className="flex items-center w-full gap-3 px-8 py-4 font-bold text-white transition-all duration-300 sm:w-auto bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:shadow-lg hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    {t("Delete Popup")}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center animate-fadeIn">
                        <p className="mb-4 text-3xl font-bold text-gray-600 sm:text-4xl">{t("No popup created yet")}</p>
                        <p className="mb-8 text-lg text-gray-500 sm:text-xl">{t("Click the button above to create your first popup")}</p>
                        <button
                            onClick={openModal}
                            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:shadow-xl hover:scale-105 animate-bounce-slow"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t("Create Your First Popup")}
                        </button>
                    </div>
                )}

                {/* Edit/Create Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-3xl w-full max-w-5xl max-h-[95vh] overflow-y-auto animate-modalIn">
                            <div className="p-6 pb-8 sm:p-10 sm:pb-12">
                                <div className="flex items-center justify-between mb-8 sm:mb-12">
                                    <h2 className="text-2xl font-bold text-gray-800 sm:text-4xl">
                                        {popup ? t("Edit Popup") : t("Create New Popup")}
                                    </h2>
                                    <button
                                        onClick={() => closeModal()}
                                        className="text-gray-500 transition-colors hover:text-gray-700"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 sm:gap-12">
                                        {/* English */}
                                        <div className="space-y-6">
                                            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                                                <h3 className="flex items-center justify-center gap-3 mb-4 text-xl font-bold text-center text-blue-600 sm:text-2xl sm:mb-6">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                                    </svg>
                                                    {t("English")}
                                                </h3>
                                                <input
                                                    type="text"
                                                    name="name_en"
                                                    value={formData.name_en}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder={t("Name (English)")}
                                                    className="w-full px-5 py-4 mb-4 text-base transition-all border-2 border-gray-300 rounded-2xl sm:text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                                />
                                                <div className="p-4 transition-colors border-2 border-gray-300 border-dashed rounded-2xl hover:border-blue-400">
                                                    <input
                                                        type="file"
                                                        name="image_en"
                                                        accept="image/*"
                                                        onChange={handleInputChange}
                                                        className="block w-full text-sm cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-full file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:transition-colors"
                                                    />
                                                </div>
                                                {previewEn && (
                                                    <div className="mt-4 overflow-hidden border-2 border-blue-100 shadow-lg rounded-2xl">
                                                        <img src={previewEn} alt="EN Preview" className="object-cover w-full h-48" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arabic */}
                                        <div dir="rtl" className="space-y-6">
                                            <div className="p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl">
                                                <h3 className="flex items-center justify-center gap-3 mb-4 text-xl font-bold text-center text-pink-600 sm:text-2xl sm:mb-6">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                                    </svg>
                                                    {t("Arabic")}
                                                </h3>
                                                <input
                                                    type="text"
                                                    name="name_ar"
                                                    value={formData.name_ar}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder={t("Name (Arabic)")}
                                                    className="w-full px-5 py-4 mb-4 text-base text-right transition-all border-2 border-gray-300 rounded-2xl sm:text-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                                />
                                                <div className="p-4 transition-colors border-2 border-gray-300 border-dashed rounded-2xl hover:border-pink-400">
                                                    <input
                                                        type="file"
                                                        name="image_ar"
                                                        accept="image/*"
                                                        onChange={handleInputChange}
                                                        className="block w-full text-sm cursor-pointer file:mr-4 file:py-3 file:px-6 file:rounded-full file:bg-pink-600 file:text-white file:hover:bg-pink-700 file:transition-colors"
                                                    />
                                                </div>
                                                {previewAr && (
                                                    <div className="mt-4 overflow-hidden border-2 border-pink-100 shadow-lg rounded-2xl">
                                                        <img src={previewAr} alt="AR Preview" className="object-cover w-full h-48" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="inline-block w-full max-w-xl">
                                            <label className="block mb-3 text-lg font-bold text-gray-700">
                                                {t("Popup Link")} <span className="text-sm text-gray-500">({t("Optional")})</span>
                                            </label>
                                            <input
                                                type="url"
                                                name="link"
                                                value={formData.link}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com"
                                                className="w-full px-6 py-4 text-base transition-all border-2 border-gray-300 rounded-2xl sm:text-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center gap-4 pt-6 border-t border-gray-200 sm:flex-row sm:gap-8 sm:pt-10">
                                        <button
                                            type="button"
                                            onClick={() => closeModal()}
                                            className="w-full px-10 py-4 text-lg font-bold transition-all duration-300 border-2 border-gray-400 sm:w-auto rounded-2xl hover:bg-gray-50 hover:border-gray-600"
                                        >
                                            {t("Cancel")}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loadingPost}
                                            className="flex items-center justify-center w-full gap-3 py-4 text-lg font-bold text-white transition-all duration-300 sm:w-auto px-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl hover:shadow-2xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {loadingPost ? (
                                                <>
                                                    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    {t("Saving...")}
                                                </>
                                            ) : popup ? (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {t("Update")}
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    {t("Create")}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-3xl animate-modalIn">
                            <div className="p-8 sm:p-10">
                                {/* Warning Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="mb-4 text-2xl font-bold text-center text-gray-800 sm:text-3xl">
                                    {t("Delete Popup")}
                                </h3>

                                {/* Message */}
                                <p className="mb-2 text-center text-gray-600">
                                    {t("Are you sure you want to delete this popup?")}
                                </p>
                                <p className="mb-8 font-medium text-center text-red-600">
                                    {t("This action cannot be undone.")}
                                </p>

                                {/* Popup Info Preview */}
                                {popup && (
                                    <div className="p-4 mb-8 border border-gray-200 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 overflow-hidden bg-gray-200 rounded-lg">
                                                <img
                                                    src={getImageUrl(popup.image_en)}
                                                    alt={popup.name_en}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{popup.name_en}</p>
                                                <p className="text-sm text-gray-600">{popup.name_ar}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <button
                                        onClick={closeDeleteModal}
                                        className="w-full px-4 py-4 text-lg font-bold transition-all duration-300 border-2 border-gray-400 rounded-2xl hover:bg-gray-50 hover:border-gray-600"
                                    >
                                        {t("Cancel")}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center justify-center w-full gap-3 px-4 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl hover:shadow-lg hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {t("Yes, Delete")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Popup;