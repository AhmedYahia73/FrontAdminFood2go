import React, { useEffect, useRef, useState } from "react";
import { DropDown, NumberInput, StaticButton, StaticLoader, SubmitButton, Switch, TextInput } from '../../../../../Components/Components';
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useNavigate, useParams } from "react-router-dom";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";

const EditExtraPage = () => {
    const { groupEditExtraId } = useParams();
    const { groupExtraId } = useParams();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchExtra,
        loading: loadingExtra,
        data: dataExtra,
    } = useGet({ url: `${apiUrl}/admin/extra_group/item/${groupEditExtraId}` });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/extra_group/update/${groupEditExtraId}`,
    });
    const { refetch: refetchTranslation, loading: loadingTranslation, data: dataTranslation } = useGet({
        url: `${apiUrl}/admin/translation`
    });
    const auth = useAuth();
    const { t, i18n } = useTranslation();

    const [taps, setTaps] = useState([])
    const [currentTap, setCurrentTap] = useState(0);
    const [Extra, setExtra] = useState("");

    const [ExtraName, setExtraName] = useState([]);
    const [ExtraPrice, setExtraPrice] = useState('');
    const [minExtra, setMinExtra] = useState('');
    const [maxExtra, setMaxExtra] = useState('');

    useEffect(() => {
        refetchTranslation();
    }, [refetchTranslation]);

    useEffect(() => {
        if (dataTranslation) {
            setTaps(dataTranslation.translation);
        }
    }, [dataTranslation]);

    const handleTap = (index) => {
        setCurrentTap(index)
    }

    useEffect(() => {
        refetchExtra();
    }, [refetchExtra]);

    useEffect(() => {
        if (dataExtra && dataExtra.extra_group && dataExtra.extra_names) {
            setExtra(dataExtra.extra_group);

            const newExtraNames = [];
            if (dataExtra.extra_names) {
                dataExtra.extra_names.forEach((Extra) => {
                    let obj = {
                        tranlation_id: Extra.tranlation_id || "-", // Use '' if id is missing
                        tranlation_name: Extra.tranlation_name || "Default Language", // Fallback value
                        extra_name: Extra.extra_name || "-", // Use '' if name is missing
                    };
                    newExtraNames.push(obj);
                });
            }
            setExtraName(newExtraNames.length > 0 ? newExtraNames : []);

            setExtraPrice(dataExtra.extra_group.pricing);
            setMinExtra(dataExtra.extra_group.min);
            setMaxExtra(dataExtra.extra_group.max);
        }
    }, [dataExtra]); // Only run this effect when `data` changes

    useEffect(() => {
        if (response) {
            handleBack();
        }
    }, [response]);

    const handleBack = () => {
        navigate(-1, { replace: true });
    };

    const handleExtraEdit = (e) => {
        e.preventDefault();

        if (ExtraName.length === 0) {
            auth.toastError(t('please Enter Extra Names'))
            return;
        }

        if (!ExtraPrice) {
            auth.toastError(t('Please Enter Extra Price'))
            return;
        }

        const formData = new FormData();
        formData.append('group_id', groupExtraId)

        ExtraName.forEach((name, index) => {
            // Corrected the typo and added translation_id and translation_name
            formData.append(`extra_names[${index}][tranlation_id]`, name.tranlation_id);
            formData.append(`extra_names[${index}][extra_name]`, name.extra_name);
            formData.append(`extra_names[${index}][tranlation_name]`, name.tranlation_name);
        });
        formData.append('pricing', ExtraPrice)
        formData.append('min', minExtra)
        formData.append('max', maxExtra)
        postData(formData, t("Extra Edited Success"));
    };
    return (
        <>
            {loadingPost ? (
                <>
                    <div className="flex items-center justify-center w-full h-56">
                        <StaticLoader />
                    </div>
                </>
            ) : (
                <section>
                    <form onSubmit={handleExtraEdit}>
                        {/* Taps */}
                        <div className="flex items-center justify-start w-full py-2 gap-x-6">
                            {taps.map((tap, index) => (
                                <span
                                    key={tap.id}
                                    onClick={() => handleTap(index)}
                                    className={`${currentTap === index ? 'text-mainColor border-b-4 border-mainColor' : 'text-thirdColor'}  pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                                >
                                    {tap.name}
                                </span>

                            ))}
                        </div>
                        {/* Content*/}
                        <div className="sm:py-3 lg:py-6">
                            {taps.map((tap, index) => (
                                currentTap === index && (
                                    <div
                                        className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                                        key={tap.id}
                                    >
                                        {/* Extra Name */}
                                        <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                            <span className="text-xl font-TextFontRegular text-thirdColor">{t("Name")} {tap.name}:</span>
                                            <TextInput
                                                value={ExtraName[index]?.extra_name} // Access Extra_names property
                                                onChange={(e) => {
                                                    const inputValue = e.target.value; // Ensure this is a string
                                                    setExtraName(prev => {
                                                        const updatedNames = [...prev];

                                                        // Ensure the array is long enough
                                                        if (updatedNames.length <= index) {
                                                            updatedNames.length = index + 1; // Resize array
                                                        }

                                                        // Create or update the object at the current index
                                                        updatedNames[index] = {
                                                            ...updatedNames[index], // Retain existing properties if any
                                                            'tranlation_id': tap.id, // Use the ID from tap
                                                            'extra_name': inputValue, // Use the captured string value
                                                            'tranlation_name': tap.name || 'Default Name', // Use tap.name for tranlation_name
                                                        };

                                                        return updatedNames;
                                                    });
                                                }}
                                                placeholder={t("ExtraName")}
                                            />
                                        </div>

                                        {/* Conditional Rendering for First Tab Only */}
                                        {currentTap === 0 && (
                                            <>
                                                {/* Extra Price */}
                                                < div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">{t("ExtraPrice")}:</span>
                                                    <NumberInput
                                                        value={ExtraPrice}
                                                        onChange={(e) => setExtraPrice(e.target.value)}
                                                        placeholder={t("ExtraPrice")}
                                                    />
                                                </div>
                                                {/* Extra Price */}
                                                < div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">{t("ExtraMinNumber")}:</span>
                                                    <NumberInput
                                                        value={minExtra}
                                                        onChange={(e) => setMinExtra(e.target.value)}
                                                        placeholder={t("ExtraMinNumber")}
                                                    />
                                                </div>
                                                {/* Extra Price */}
                                                < div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">{t("ExtraMaxNumber")}:</span>
                                                    <NumberInput
                                                        value={maxExtra}
                                                        onChange={(e) => setMaxExtra(e.target.value)}
                                                        placeholder={t("ExtraMaxNumber")}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                        {/* Buttons*/}
                        < div className="flex items-center justify-end w-full mt-5 gap-x-4" >
                            <div className="">
                                <StaticButton text={t('Cancel')} handleClick={handleBack} bgColor='bg-transparent' Color='text-mainColor' border={'border-2'} borderColor={'border-mainColor'} rounded='rounded-full' />
                            </div>
                            <div className="">
                                <SubmitButton
                                    text={t('Submit')}
                                    rounded='rounded-full'
                                    handleClick={handleExtraEdit}
                                />
                            </div>

                        </div >
                    </form >
                </section >
            )}
        </>
    )
};

export default EditExtraPage;
