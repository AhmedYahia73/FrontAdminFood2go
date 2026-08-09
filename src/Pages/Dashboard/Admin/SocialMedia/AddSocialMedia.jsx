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
import { useAuth } from "../../../../Context/Auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoArrowBack } from 'react-icons/io5';
import { TitlePage } from '../../../../Components/Components';

const AddSocialMedia = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/social_media/add`,
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
        if (!loadingPost && response) {
            navigate(-1);
        }
    }, [response]);

    const handleStatus = () => {
        setStatus(status === 0 ? 1 : 0);
    };

    const handleReset = () => {
        setName('');
        setLink('');
        setStatus(1);
        setImage('');
        setImageFile(null);
    };

    const handleImageClick = () => {
        if (ImageRef.current) {
            ImageRef.current.click();
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            auth.toastError(t("Please enter name"));
            return;
        }
        if (!link.trim()) {
            auth.toastError(t("Please enter link"));
            return;
        }
        if (!imageFile) {
            auth.toastError(t("Please select icon"));
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("link", link);
        formData.append("status", status);
        formData.append("icon", imageFile);

        postData(formData, t("Social Media Added Successfully"));
    };



    return (
        <section className="p-2 md:p-6 mb-20">
            {loadingPost ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                            <IoArrowBack size={24} />
                        </button>
                        <TitlePage text={t("Add Social Media")} />
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
                                checked={status}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end w-full gap-x-4 pt-4">
                        <div className="">
                            <StaticButton
                                text={t('Reset')}
                                handleClick={handleReset}
                                bgColor='bg-transparent'
                                Color='text-mainColor'
                                border={'border-2'}
                                borderColor={'border-mainColor'}
                                rounded='rounded-full'
                            />
                        </div>
                        <div className="">
                            <SubmitButton
                                text={t('Submit')}
                                rounded='rounded-full'
                                handleClick={handleAdd}
                            />
                        </div>
                    </div>
                </form>
            )}
        </section>
    );
};

export default AddSocialMedia;
