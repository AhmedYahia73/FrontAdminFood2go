import React, { useEffect, useState } from "react";
import {
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../Components/Components";
import { useAuth } from "../../../../Context/Auth";
import { useGet } from "../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";

const EditSupplier = () => {
    const { supplierId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(1);
    const [balance, setBalance] = useState(0);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch current supplier data
    const {
        data: supplierData,
        loading: loadingSupplier,
        refetch: refetchSupplier,
    } = useGet({
        url: `${apiUrl}/admin/supplier/item/${supplierId}`,
    });

    useEffect(() => {
        refetchSupplier();
    }, [refetchSupplier]);

    useEffect(() => {
        if (supplierData?.supplier) {
            const supplier = supplierData.supplier;
            setName(supplier.name || "");
            setPhone(supplier.phone || "");
            setEmail(supplier.email || "");
            setStatus(supplier.status ?? 1);
            setBalance(supplier.balance || 0);
        }
    }, [supplierData]);

    const handleBack = () => {
        navigate(`/dashboard/supplier${location.search}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Quick client validations
        const newErrors = {};
        if (!name.trim()) newErrors.name = t("Name is required");
        if (!phone.trim()) newErrors.phone = t("Phone is required");
        if (!email.trim()) newErrors.email = t("Email is required");

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoadingSubmit(true);
        try {
            const token = auth?.userState?.token || "";
            const response = await axios.post(
                `${apiUrl}/admin/supplier/update/${supplierId}`,
                {
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    status: status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response?.data?.success) {
                auth.toastSuccess(t("Supplier updated successfully"));
                handleBack();
            }
        } catch (error) {
            const backendErrors = error?.response?.data?.errors;
            if (backendErrors) {
                setErrors(backendErrors);
                const firstKey = Object.keys(backendErrors)[0];
                if (firstKey && backendErrors[firstKey]?.[0]) {
                    auth.toastError(backendErrors[firstKey][0]);
                }
            } else {
                auth.toastError(error?.response?.data?.message || t("Failed to update supplier"));
            }
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="p-2.5 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all border border-gray-100"
                    >
                        <IoArrowBack className="text-xl" />
                    </button>
                    <TitlePage text={t("Edit Supplier")} />
                </div>
            </div>

            {loadingSupplier ? (
                <div className="flex justify-center py-20">
                    <StaticLoader />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 max-w-4xl">
                    {/* Balance info banner */}
                    <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">
                            {t("Current Balance")}:
                        </span>
                        <span className={`text-base font-bold ${
                            Number(balance) < 0 ? "text-red-600" : Number(balance) > 0 ? "text-green-600" : "text-gray-700"
                        }`}>
                            {Number(balance).toLocaleString()} {t("EGP")}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Name */}
                        <div>
                            <TextInput
                                label={t("Name")}
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t("Enter supplier name")}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1 font-medium">
                                    {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <TextInput
                                label={t("Phone")}
                                name="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t("Enter phone number")}
                                required
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1 font-medium">
                                    {Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <TextInput
                                label={t("Email")}
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("Enter email address")}
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1 font-medium">
                                    {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex flex-col justify-center">
                            <label className="text-sm font-semibold text-gray-700 mb-2">
                                {t("Status")}
                            </label>
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={status === 1}
                                    handleClick={() => setStatus(prev => (prev === 1 ? 0 : 1))}
                                />
                                <span className="text-sm font-medium text-gray-600">
                                    {status === 1 ? t("Active") : t("Inactive")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                        >
                            {t("Cancel")}
                        </button>
                        <SubmitButton
                            text={t("Save")}
                            loading={loadingSubmit}
                        />
                    </div>
                </form>
            )}
        </div>
    );
};

export default EditSupplier;
