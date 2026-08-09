import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { useTranslation } from "react-i18next";

const AddVoidReason = ({setUpdate , update}) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({url: `${apiUrl}/admin/void_reason/add`});
    const { t } = useTranslation();

    const [reason, setReason] = useState("");
    const [status, setStatus] = useState(0);

    // Handle status toggle
    const handleChangeStatus = () => {
        setStatus(status === 0 ? 1 : 0);
    };

    // Reset form
    const handleReset = () => {
        setReason("");
        setStatus(0);
    };

    // Reset form after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            handleReset();
             setUpdate(!update);
        }
    }, [response, loadingPost]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("void_reason", reason);
        formData.append("status", status);

        await postData(formData, t("Void Reason Added Success!"));
    };

    return (
        <>
            {loadingPost ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <form
                    className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row"
                    onSubmit={handleSubmit}
                >
                    {/* Reason */}
                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Void Reason")}:
                        </span>
                        <TextInput
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("Void Reason")}
                        />
                    </div>
                    {/* Status */}
                    <div className="xl:w-[30%] flex items-center justify-start mt-4 gap-x-4">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Active")}:
                        </span>
                        <Switch handleClick={handleChangeStatus} checked={status} />
                    </div>
                    {/* Buttons */}
                    <div className="flex items-center justify-end w-full gap-x-4">
                        <div className="">
                            <StaticButton
                                text={t("Reset")}
                                handleClick={handleReset}
                                bgColor="bg-transparent"
                                Color="text-mainColor"
                                border={"border-2"}
                                borderColor={"border-mainColor"}
                                rounded="rounded-full"
                            />
                        </div>
                        <div className="">
                            <SubmitButton
                                text={t("Add")}
                                rounded="rounded-full"
                                handleClick={handleSubmit}
                            />
                        </div>
                    </div>
                </form>
            )}
        </>
    );
};

export default AddVoidReason;