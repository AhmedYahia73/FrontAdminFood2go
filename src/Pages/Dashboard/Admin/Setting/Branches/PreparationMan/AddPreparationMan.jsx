import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    PasswordInput,
    TextInput,
    TitlePage,
} from "../../../../../../Components/Components";
import { usePost } from "../../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { IoArrowBack } from "react-icons/io5";
import { useGet } from "../../../../../../Hooks/useGet";
import { useParams } from "react-router-dom";

const AddPreparationMan = () => {
    const { branchId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchPreparationMan,
        loading: loadingPreparationMan,
        data: dataPreparationMan,
    } = useGet({
        url: `${apiUrl}/admin/preparation_man/lists`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/preparation_man/add`,
    });
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState(1);
    const [print_status, setPrintStatus] = useState(0);
    const [print_ip, setPrintIp] = useState("");
    const [print_port, setPrintPort] = useState("");
    const [print_name, setPrintName] = useState("");
    const [print_type, setPrintType] = useState({ value: "usb", label: "USB" });

    useEffect(() => {
        refetchPreparationMan();
    }, [refetchPreparationMan]);

    // Navigate back after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

    // Toggle status
    const handleStatus = () => {
        setStatus((prev) => (prev === 1 ? 0 : 1));
    };

    const handleChangePrintStatus = () => {
        setPrintStatus((prev) => (prev === 0 ? 1 : 0));
    };

    // Reset form
    const handleReset = () => {
        setName("");
        setPassword("");
        setStatus(1);
        setPrintStatus(0);
        setPrintIp("");
        setPrintPort("");
        setPrintName("");
        setPrintType({ value: "usb", label: "USB" });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name) {
            auth.toastError(t("Enter Preparation Man Name"));
            return;
        }

        if (!password) {
            auth.toastError(t("Enter Password"));
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("password", password);
        formData.append("status", status);
        formData.append("branch_id", branchId);
        formData.append("print_status", print_status);
        formData.append("print_type", print_type.value);

        if (print_status === 1) {
            formData.append("print_ip", print_ip);
            formData.append("print_port", print_port);
            formData.append("print_name", print_name);
        }

        postData(formData, t("Preparation Man Added Success"));
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <>
            {loadingPost || loadingPreparationMan ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-x-2">
                            <button
                                onClick={handleBack}
                                className="text-mainColor hover:text-red-700 transition-colors"
                                title={t("Back")}
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Add Preparation Man")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleSubmit}>
                        <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {/* Name */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Name")}:
                                </span>
                                <TextInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("Enter Name")}
                                />
                            </div>

                            {/* Password */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Password")}:
                                </span>
                                <PasswordInput
                                    value={password}
                                    backgound="bg-white"
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("Enter Password")}
                                />
                            </div>

                            {/* Print Type Select */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Print Type")}:
                                </span>
                                <Select
                                    value={print_type}
                                    onChange={setPrintType}
                                    options={[
                                        { value: "usb", label: t("USB") },
                                        { value: "network", label: t("Network") }
                                    ]}
                                    placeholder={t("Select Print Type")}
                                    className="w-full"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderColor: '#d1d5db',
                                            borderRadius: '0.375rem',
                                            padding: '2px 4px',
                                            backgroundColor: 'white'
                                        })
                                    }}
                                />
                            </div>

                            {/* Print Status Switch */}
                            <div className="flex items-start justify-start w-full pt-8 gap-x-1">
                                <div className="flex items-center justify-start w-2/4 gap-x-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Print Status")}:
                                    </span>
                                    <Switch
                                        handleClick={handleChangePrintStatus}
                                        checked={print_status === 1}
                                    />
                                </div>
                            </div>

                            {
                                print_status === 1 && (
                                    <>
                                        {/* Print Name Input */}
                                        <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                                {t("Print Name")}:
                                            </span>
                                            <TextInput
                                                value={print_name}
                                                onChange={(e) => setPrintName(e.target.value)}
                                                name="print_name"
                                                placeholder={t("Enter Print Name")}
                                            />
                                        </div>

                                        {/* Print Port Input */}
                                        <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                                {t("Print Port")}:
                                            </span>
                                            <TextInput
                                                value={print_port}
                                                onChange={(e) => setPrintPort(e.target.value)}
                                                name="print_port"
                                                placeholder={t("Enter Print Port")}
                                            />
                                        </div>

                                        {/* Print IP Input */}
                                        <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                                {t("Print IP")}:
                                            </span>
                                            <TextInput
                                                value={print_ip}
                                                onChange={(e) => setPrintIp(e.target.value)}
                                                name="print_ip"
                                                placeholder={t("Enter Print IP")}
                                            />
                                        </div>
                                    </>
                                )}

                            {/* Status */}
                            <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                                <div className="flex items-center justify-start gap-x-3">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Active")}:
                                    </span>
                                    <Switch handleClick={handleStatus} checked={status} />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full gap-x-4 mt-6">
                            <div>
                                <StaticButton
                                    text={t("Reset")}
                                    handleClick={handleReset}
                                    bgColor="bg-transparent"
                                    Color="text-mainColor"
                                    border="border-2"
                                    borderColor="border-mainColor"
                                    rounded="rounded-full"
                                />
                            </div>
                            <div>
                                <SubmitButton
                                    text={t("Submit")}
                                    rounded="rounded-full"
                                    handleClick={handleSubmit}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default AddPreparationMan;