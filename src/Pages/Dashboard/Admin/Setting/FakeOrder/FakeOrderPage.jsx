import React, { useEffect, useState } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import {
    LoaderLogin,
    SubmitButton,
    TextInput,
    PasswordInput,
    Switch,
    TitleSection,
} from "../../../../../Components/Components";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../../Context/Auth";

const FakeOrderPage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();

    // State for form data
    const [fakeOrderPercentage, setFakeOrderPercentage] = useState("");
    const [fakeOrderLimit, setFakeOrderLimit] = useState("");
    const [fakeOrderPassword, setFakeOrderPassword] = useState("");
    const [fakeOrderStatus, setFakeOrderStatus] = useState(0);

    // Get fake order settings
    const {
        refetch: refetchFakeOrder,
        loading: loadingFakeOrder,
        data: dataFakeOrder,
    } = useGet({
        url: `${apiUrl}/admin/settings/fake_order`,
    });

    // Update fake order settings
    const { postData, loadingPost } = usePost({
        url: `${apiUrl}/admin/settings/fake_order/update`,
    });

    // Change fake order status
    const { changeData, loadingChange } = useChangeState({
        url: `${apiUrl}/admin/settings/fake_order/status`,
    });

    // Fetch data on component mount
    useEffect(() => {
        refetchFakeOrder();
    }, [refetchFakeOrder]);

    // Populate form data when data is fetched
    useEffect(() => {
        if (dataFakeOrder) {
            setFakeOrderPercentage(dataFakeOrder.fake_order_precentage || "");
            setFakeOrderLimit(dataFakeOrder.fake_order_limit || "");
            setFakeOrderPassword(dataFakeOrder.fake_order_password || "");
            setFakeOrderStatus(dataFakeOrder.fake_order_status === "1" || dataFakeOrder.fake_order_status === 1 ? 1 : 0);
        }
    }, [dataFakeOrder]);

    // Handle status toggle
    const handleStatusToggle = () => {
        const newStatus = fakeOrderStatus === 1 ? 0 : 1;
        setFakeOrderStatus(newStatus);

        // Call the status change API
        changeData({ fake_order_status: newStatus }, t("Status Updated Successfully"));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!fakeOrderPercentage) {
            auth.toastError(t("Please enter fake order percentage"));
            return;
        }
        if (!fakeOrderLimit) {
            auth.toastError(t("Please enter fake order limit"));
            return;
        }

        const formData = new FormData();
        formData.append("fake_order_precentage", fakeOrderPercentage);
        formData.append("fake_order_limit", fakeOrderLimit);
        formData.append("fake_order_status", fakeOrderStatus);
        if (fakeOrderPassword) {
            formData.append("fake_order_password", fakeOrderPassword);
        }

        postData(formData, t("Fake Order Settings Updated Successfully"));
    };

    // Handle reset
    const handleReset = () => {
        if (dataFakeOrder) {
            setFakeOrderPercentage(dataFakeOrder.fake_order_precentage || "");
            setFakeOrderLimit(dataFakeOrder.fake_order_limit || "");
            setFakeOrderPassword("");
            setFakeOrderStatus(dataFakeOrder.fake_order_status === "1" || dataFakeOrder.fake_order_status === 1 ? 1 : 0);
        }
    };

    return (
        <>
            {loadingFakeOrder || loadingPost || loadingChange ? (
                <div className="flex items-center justify-center w-full h-56">
                    <LoaderLogin />
                </div>
            ) : (
                <section className="pb-28">
                    <form onSubmit={handleSubmit}>
                        <div className="w-full mb-6">
                            <TitleSection text={t("Fake Order Settings")} />
                        </div>

                        <div className="flex flex-wrap items-start justify-start w-full gap-4 mb-4 sm:flex-col lg:flex-row">

                            {/* Fake Order Percentage */}
                            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Fake Order Percentage")}:
                                </span>
                                <TextInput
                                    value={fakeOrderPercentage}
                                    onChange={(e) => setFakeOrderPercentage(e.target.value)}
                                    placeholder={t("Enter Fake Order Percentage")}
                                    type="number"
                                />
                            </div>

                            {/* Fake Order Limit */}
                            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Fake Order Limit")}:
                                </span>
                                <TextInput
                                    value={fakeOrderLimit}
                                    onChange={(e) => setFakeOrderLimit(e.target.value)}
                                    placeholder={t("Enter Fake Order Limit")}
                                    type="number"
                                />
                            </div>

                            {/* Fake Order Password */}
                            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Fake Order Password")}:
                                </span>
                                <PasswordInput
                                    value={fakeOrderPassword}
                                    onChange={(e) => setFakeOrderPassword(e.target.value)}
                                    placeholder={t("Enter Fake Order Password (Optional)")}
                                    backgound="white"
                                    required={false}
                                />
                            </div>

                            {/* Fake Order Status */}
                            <div className="sm:w-full lg:w-[30%] flex items-center justify-start gap-x-3">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Fake Order Status")}:
                                </span>
                                <Switch
                                    checked={fakeOrderStatus}
                                    handleClick={handleStatusToggle}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full gap-x-4">
                            <div>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-6 py-2 text-mainColor bg-transparent border-2 border-mainColor rounded-full font-TextFontRegular hover:bg-mainColor hover:text-white transition-colors"
                                >
                                    {t("Reset")}
                                </button>
                            </div>
                            <div>
                                <SubmitButton
                                    text={t("Update")}
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

export default FakeOrderPage;
