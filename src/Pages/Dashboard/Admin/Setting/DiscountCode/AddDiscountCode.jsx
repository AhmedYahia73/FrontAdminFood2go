import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const AddDiscountCode = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/discount_code/add`,
    });
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [groupName, setGroupName] = useState("");
    const [usageNumber, setUsageNumber] = useState("");
    const [numberCodes, setNumberCodes] = useState("");
    const [discount, setDiscount] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState(1);

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

    // Reset form
    const handleReset = () => {
        setGroupName("");
        setUsageNumber("");
        setNumberCodes("");
        setDiscount("");
        setStartDate("");
        setEndDate("");
        setStatus(1);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!groupName) {
            auth.toastError(t("GroupNameRequired"));
            return;
        }

        if (!usageNumber || usageNumber < 1) {
            auth.toastError(t("UsageNumberRequired"));
            return;
        }

        if (!numberCodes || numberCodes < 1) {
            auth.toastError(t("NumberCodesRequired"));
            return;
        }

        if (!discount || discount < 0.01) {
            auth.toastError(t("DiscountRequired"));
            return;
        }

        if (!startDate) {
            auth.toastError(t("StartDateRequired"));
            return;
        }

        if (!endDate) {
            auth.toastError(t("EndDateRequired"));
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            auth.toastError(t("EndDateMustBeAfterStartDate"));
            return;
        }

        const formData = new FormData();
        formData.append("group_name", groupName);
        formData.append("usage_number", usageNumber);
        formData.append("number_codes", numberCodes);
        formData.append("discount", discount);
        formData.append("start", startDate);
        formData.append("end", endDate);
        formData.append("status", status);

        postData(formData, t("Discount Code Added Success"));
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Get today's date in YYYY-MM-DD format for date input min attribute
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <>
            {loadingPost ? (
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
                            <TitlePage text={t("Add Discount Code")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleSubmit}>
                        <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {/* Group Name */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Group Name")}:
                                </span>
                                <TextInput
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder={t("Enter group name")}
                                />
                            </div>

                            {/* Usage Number */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Usage Number")}:
                                </span>
                                <TextInput
                                    type="number"
                                    min="1"
                                    value={usageNumber}
                                    onChange={(e) => setUsageNumber(e.target.value)}
                                    placeholder={t("Enter usage number")}
                                />
                            </div>

                            {/* Number of Codes */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Number of Codes")}:
                                </span>
                                <TextInput
                                    type="number"
                                    min="1"
                                    value={numberCodes}
                                    onChange={(e) => setNumberCodes(e.target.value)}
                                    placeholder={t("Enter number of codes")}
                                />
                            </div>

                            {/* Discount Percentage */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Discount Percentage")}:
                                </span>
                                <div className="relative w-full">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max="100"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        placeholder={t("Enter discount percentage")}
                                        className="w-full px-4 py-3 border-2 border-mainColor rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor pr-12"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-thirdColor font-TextFontMedium">
                                        %
                                    </span>
                                </div>
                            </div>

                            {/* Start Date */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Start Date")}:
                                </span>
                                <input
                                    type="date"
                                    min={getTodayDate()}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-mainColor rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor"
                                />
                            </div>

                            {/* End Date */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("End Date")}:
                                </span>
                                <input
                                    type="date"
                                    min={startDate || getTodayDate()}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-mainColor rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor"
                                />
                            </div>

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

export default AddDiscountCode;