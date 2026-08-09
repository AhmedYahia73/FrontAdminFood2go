import React, { useEffect, useRef, useState } from 'react';
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    UploadInput,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { useGet } from "../../../../Hooks/useGet";
import { useAuth } from "../../../../Context/Auth";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoArrowBack } from 'react-icons/io5';
import { TitlePage } from '../../../../Components/Components';

const EditSocialMedia = () => {
    const { socialId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/social_media/update/${socialId}`,
    });
    const { refetch: refetchSocial, loading: loadingSocial, data: dataSocial } = useGet({
        url: `${apiUrl}/admin/social_media/social_item/${socialId}`,
    });

    const auth = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [status, setStatus] = useState(1);
    const [image, setImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const ImageRef = useRef(null);

    useEffect(() => {
        refetchSocial();
    }, [refetchSocial]);

    useEffect(() => {
        if (dataSocial && dataSocial.social_media) { // Assuming response structure { social_media: { ... } } or just { ... }
            const item = dataSocial.social_media;
            setName(item.name || '');
            setLink(item.link || '');
            setStatus(item.status); // 1 or 0
            if (item.icon) {
                const parts = item.icon.split('/');
                setImage(parts[parts.length - 1]);
            }
        } else if (dataSocial) {
            const item = dataSocial;
            setName(item.name || '');
            setLink(item.link || '');
            setStatus(item.status);
            if (item.icon) {
                const parts = item.icon.split('/');
                setImage(parts[parts.length - 1]);
            }
        }
    }, [dataSocial]);

    useEffect(() => {
        if (!loadingPost && response) {
            navigate(-1);
        }
    }, [response]);

    const handleStatus = () => {
        setStatus(status === 0 ? 1 : 0);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleImageClick = () => {
        if (ImageRef.current) {
            ImageRef.current.click();
        }
    };

    const handleEdit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            auth.toastError(t("Please enter name"));
            return;
        }
        if (!link.trim()) {
            auth.toastError(t("Please enter link"));
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("link", link);
        formData.append("status", status);
        if (imageFile) {
            formData.append("icon", imageFile);
        }

        postData(formData, t("Social Media Updated Successfully"));
    };

    return (
        <section className="p-2 md:p-6 mb-20">
            {loadingPost || loadingSocial ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <form onSubmit={handleEdit} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                            <IoArrowBack size={24} />
                        </button>
                        <TitlePage text={t("Edit Social Media")} />
                    </div>
                    <div className="grid bg-white shadow-lg rounded-xl p-4 md:px-6 md:py-8 items-start grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="block text-lg font-medium text-gray-700">
                                {t("Name")}:
                            </label>
                            <TextInput
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("Enter Name")}
                                className="w-full"
                            />
                        </div>

                        {/* Link */}
                        <div className="space-y-2">
                            <label className="block text-lg font-medium text-gray-700">
                                {t("Link")}:
                            </label>
                            <TextInput
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder={t("Enter Link")}
                                className="w-full"
                            />
                        </div>

                        {/* Icon */}
                        <div className="space-y-2">
                            <label className="block text-lg font-medium text-gray-700">
                                {t("Icon")}:
                            </label>
                            <UploadInput
                                value={image}
                                uploadFileRef={(el) => (ImageRef.current = el)}
                                placeholder={t("Choose Icon")}
                                handleFileChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setImageFile(file);
                                        setImage(file.name);
                                    }
                                }}
                                onClick={handleImageClick}
                            />
                        </div>

                        {/* Status */}
                        <div className="flex items-center pt-8 space-x-3">
                            <span className="text-lg font-medium text-gray-700">{t("Active")}:</span>
                            <Switch
                                handleClick={handleStatus}
                                checked={status === 1}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end w-full gap-x-4 pt-4">
                        <div className="">
                            <StaticButton
                                text={t("Cancel")}
                                handleClick={handleCancel}
                                bgColor="bg-transparent"
                                Color="text-mainColor"
                                border={"border-2"}
                                borderColor={"border-mainColor"}
                                rounded="rounded-full"
                            />
                        </div>
                        <div className="">
                            <SubmitButton
                                text={t('Edit')}
                                rounded='rounded-full'
                                handleClick={handleEdit}
                            />
                        </div>
                    </div>
                </form>
            )}
        </section>
    );
};

export default EditSocialMedia;
