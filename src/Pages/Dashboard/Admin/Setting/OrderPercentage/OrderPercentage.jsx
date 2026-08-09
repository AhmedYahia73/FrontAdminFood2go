import React, { useEffect, useState } from "react";
import {
    StaticLoader,
    SubmitButton,
    TextInput,
    TitlePage,
    StaticButton,
    PasswordInput
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { IoArrowBack, IoInformationCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const OrderPercentage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const auth = useAuth();

    const {
        refetch: refetchOrderPercentage,
        loading: loadingOrderPercentage,
        data: dataOrderPercentage,
    } = useGet({
        url: `${apiUrl}/admin/order_precentage`,
    });

    const { changeState, loadingChange } = useChangeState();

    // State variables
    const [percentage, setPercentage] = useState("");
    const [currentPercentage, setCurrentPercentage] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        refetchOrderPercentage();
    }, [refetchOrderPercentage]);

    useEffect(() => {
        if (dataOrderPercentage?.order_precentage) {
            const orderPercentage = dataOrderPercentage.order_precentage;
            setCurrentPercentage(orderPercentage.toString());
            setPercentage(orderPercentage.toString());
        }
    }, [dataOrderPercentage]);

    const handleBack = () => {
        navigate(-1);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!percentage.trim()) {
            newErrors.percentage = t("Percentage is required");
        } else if (isNaN(percentage) || parseFloat(percentage) <= 0 || parseFloat(percentage) > 100) {
            newErrors.percentage = t("Please enter a valid percentage between 1 and 100");
        }

        if (!password.trim()) {
            newErrors.password = t("Password is required");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Use URL parameters for the PUT request
        const url = `${apiUrl}/admin/order_precentage/create_update?order_precentage=${parseFloat(percentage)}&password=${encodeURIComponent(password)}`;

        try {
            const success = await changeState(url, "Order percentage updated successfully");

            if (success) {
                // Update current percentage display and clear form
                setCurrentPercentage(percentage);
                setPassword("");
                setErrors({});
            }
        } catch (error) {
            // Error is already handled by the hook
            console.error("Error updating order percentage:", error);
        }
    };

    const handleReset = () => {
        // Reset to current value from API
        setPercentage(currentPercentage);
        setPassword("");
        setErrors({});
    };

    const hasChanges = percentage !== currentPercentage || password.trim() !== "";

    return (
        <div className="flex items-start justify-start w-full p-4 pb-28 bg-gray-50 min-h-screen">
            {loadingOrderPercentage ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-x-3">
                            <button 
                                onClick={handleBack}
                                className="flex items-center gap-x-2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                            >
                                <IoArrowBack className="text-xl text-mainColor" />
                                {/* <span className="font-TextFontMedium">{t("Back")}</span> */}
                            </button>
                            <TitlePage text={t("Order Percentage")} />
                        </div>
                    </div>

                    {/* Current Percentage Display */}
                    {/* {currentPercentage && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-x-2">
                                <IoInformationCircleOutline className="text-blue-500 text-xl" />
                                <span className="font-TextFontMedium text-blue-800">
                                    {t("Current Percentage")}: <strong>{currentPercentage}%</strong>
                                </span>
                            </div>
                        </div>
                    )} */}

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="space-y-6">
                            {/* Percentage Input */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                <div className="space-y-2">
                                    <label className="text-lg font-TextFontMedium text-gray-700 block">
                                        {t("Order Percentage")} *
                                    </label>
                                    <div className="relative max-w-xs">
                                        <TextInput
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            max="100"
                                            value={percentage}
                                            onChange={(e) => {
                                                setPercentage(e.target.value);
                                                if (errors.percentage) {
                                                    setErrors(prev => ({ ...prev, percentage: "" }));
                                                }
                                            }}
                                            placeholder={t("Enter percentage (1-100)")}
                                            className={`pr-12 text-center text-lg ${errors.percentage ? 'border-red-500 focus:border-red-500' : ''}`}
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-TextFontMedium">
                                            %
                                        </span>
                                    </div>
                                    {errors.percentage ? (
                                        <p className="text-red-500 text-sm font-TextFontMedium">{errors.percentage}</p>
                                    ) : (
                                        <p className="text-gray-500 text-sm font-TextFontLight">
                                            {t("Enter a value between 1 and 100")}
                                        </p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <label className="text-lg font-TextFontMedium text-gray-700 block">
                                        {t("Password")} *
                                    </label>
                                    <PasswordInput
                                        backgound="white"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) {
                                                setErrors(prev => ({ ...prev, password: "" }));
                                            }
                                        }}
                                        placeholder={t("Enter your password")}
                                        className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm font-TextFontMedium">{errors.password}</p>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-x-4 pt-4 border-t border-gray-100">
                                <StaticButton
                                    text={t("Reset")}
                                    handleClick={handleReset}
                                    bgColor="bg-transparent"
                                    Color="text-gray-600"
                                    border="border-2"
                                    borderColor="border-gray-300"
                                    rounded="rounded-lg"
                                    disabled={loadingChange || !hasChanges}
                                    hover="hover:bg-gray-50"
                                />
                                <SubmitButton
                                    text={loadingChange ? t("Updating...") : t("Update Percentage")}
                                    rounded="rounded-lg"
                                    disabled={loadingChange || !hasChanges}
                                    className="min-w-40"
                                />
                            </div>

                            {/* Helper Messages */}
                            <div className="text-center">
                                {!hasChanges && currentPercentage && (
                                    <p className="text-gray-400 text-sm font-TextFontMedium">
                                        {t("Make changes to update the percentage")}
                                    </p>
                                )}
                                {percentage === currentPercentage && password && (
                                    <p className="text-blue-500 text-sm font-TextFontMedium">
                                        {t("Password entered but percentage unchanged")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Loading Overlay for Update */}
                    {loadingChange && (
                        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                <StaticLoader />
                                <p className="text-gray-600 mt-2">{t("Updating percentage...")}</p>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default OrderPercentage;