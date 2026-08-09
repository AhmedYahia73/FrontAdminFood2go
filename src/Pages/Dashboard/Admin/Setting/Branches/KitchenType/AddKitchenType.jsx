import React, { useEffect, useState } from "react";
import {
    PasswordInput,
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../../../Components/Components";
import { usePost } from "../../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../../Context/Auth";
import { useGet } from "../../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Select from 'react-select';

const AddKitchenType = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { branchId } = useParams();
    const isBirsta = location.pathname.includes("branch_birsta");
    const type = isBirsta ? "brista" : "kitchen";

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/pos/kitchens/add`,
    });
    const { refetch, loading, data } = useGet({ url: `${apiUrl}/admin/pos/kitchens/lists` });

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [branch_id, setBranchId] = useState(branchId || "");
    const [print_status, setPrintStatus] = useState(0);
    const [print_ip, setPrintIp] = useState("");
    const [print_port, setPrintPort] = useState("");
    const [print_name, setPrintName] = useState("");
    const [status, setStatus] = useState(0);
    const [preparing_time, setPreparingTime] = useState("");
    const [branches, setBranches] = useState([]);
    const [print_type, setPrintType] = useState({ value: "usb", label: "USB" });

    useEffect(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        if (data && data.branches) {
            setBranches(data.branches);
        }
    }, [data]);

    useEffect(() => {
        if (!loadingPost && response) {
            navigate(-1);
        }
    }, [response, loadingPost, navigate]);

    const handleChangeStatus = () => {
        setStatus((prev) => (prev === 0 ? 1 : 0));
    };

    const handleChangePrintStatus = () => {
        setPrintStatus((prev) => (prev === 0 ? 1 : 0));
    };

    const handleReset = () => {
        setName("");
        setPassword("");
        setBranchId(branchId || "");
        setPrintStatus(0);
        setPrintIp("");
        setPrintPort("");
        setPrintName("");
        setStatus(0);
        setPreparingTime("");
        setPrintType({ value: "usb", label: "USB" });
    };

    const formatTimeToHHMMSS = (time) => {
        if (!time) return '00:00:00';

        // Remove any whitespace
        time = time.toString().trim();

        // If it's already in HH:MM:SS format, return as is
        if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
            return time;
        }

        // If it's in HH:MM format, add seconds
        if (/^\d{2}:\d{2}$/.test(time)) {
            return `${time}:00`;
        }

        // If it's just numbers, try to format them
        if (/^\d+$/.test(time)) {
            // Pad with leading zeros to make it at least 6 digits
            const paddedTime = time.padStart(6, '0');
            // Format as HH:MM:SS
            return `${paddedTime.slice(0, 2)}:${paddedTime.slice(2, 4)}:${paddedTime.slice(4, 6)}`;
        }

        // If none of the above, return default time
        return '00:00:00';
    };

    const handleAdd = (e) => {
        e.preventDefault();

        if (!name) {
            auth.toastError(t(isBirsta ? "Enter Birsta Name" : "Enter Kitchen Name"));
            return;
        }
        if (!password) {
            auth.toastError(t("EnterPassword"));
            return;
        }
        if (!branch_id) {
            auth.toastError(t("SelectBranch"));
            return;
        }

        // Use default time if not provided
        const formattedTime = preparing_time ? formatTimeToHHMMSS(preparing_time) : '00:00:00';

        const formData = new FormData();
        formData.append("name", name);
        formData.append("password", password);
        formData.append("branch_id", branch_id);
        formData.append("print_status", print_status);
        formData.append("status", status);
        formData.append("type", type);
        formData.append("preparing_time", formattedTime);
        formData.append("print_type", print_type.value);

        // Only append print_ip and print_name if print_status is 1
        if (print_status === 1) {
            formData.append("print_ip", print_ip);
            formData.append("print_port", print_port);
            formData.append("print_name", print_name);
        }

        postData(formData, t("AddedSuccess", { type: t(type === "brista" ? "Birsta" : "Kitchen") }));
    };

    // Prepare options for React Select
    const branchOptions = branches.map(branch => ({
        value: branch.id,
        label: branch.name
    }));

    // Find selected branch for React Select
    const selectedBranch = branchOptions.find(option => option.value === branch_id);

    return (
        <>
            {loadingPost ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="flex flex-col mb-20">
                    <TitlePage text={t(isBirsta ? "AddNewBirsta" : "AddNewKitchen")} />
                    <form onSubmit={handleAdd}>
                        <div className="py-3">
                            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {/* Name Input */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t(isBirsta ? "Birsta Name" : "Kitchen Name")}:
                                    </span>
                                    <TextInput
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        name="name"
                                        placeholder={t(isBirsta ? "Enter Birsta Name" : "Enter Kitchen Name")}
                                        background="white"
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Password")}:
                                    </span>
                                    <PasswordInput
                                        backgound="white"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t("EnterPassword")}
                                        name="password"
                                    />
                                </div>

                                {/* Preparing Time Input */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Preparing Time")}:
                                    </span>
                                    <TextInput
                                        value={preparing_time}
                                        onChange={(e) => setPreparingTime(e.target.value)}
                                        name="preparing_time"
                                        placeholder={t("Enter Preparing Time (HH:MM:SS)")}
                                        background="white"
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
                                                    background="white"
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
                                                    background="white"
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
                                                    background="white"
                                                />
                                            </div>
                                        </>
                                    )}

                                {/* Status Switch */}
                                <div className="flex items-start justify-start w-full pt-8 gap-x-1">
                                    <div className="flex items-center justify-start w-2/4 gap-x-1">
                                        <span className="text-xl font-TextFontRegular text-thirdColor">
                                            {t("Status")}:
                                        </span>
                                        <Switch
                                            handleClick={handleChangeStatus}
                                            checked={status === 1}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full mt-6 gap-x-4">
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
                                    handleClick={handleAdd}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default AddKitchenType;