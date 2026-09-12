import React, { useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../Components/Components";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";

const AddSupplier = () => {
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
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleBack = () => {
        navigate(`/dashboard/supplier${location.search}`);
    };

    const handleReset = () => {
        setName("");
        setPhone("");
        setEmail("");
        setStatus(1);
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Client-side quick validations
        const newErrors = {};
        if (!name.trim()) newErrors.name = t("Name is required");
        if (!phone.trim()) newErrors.phone = t("Phone is required");
        if (!email.trim()) newErrors.email = t("Email is required");

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const token = auth?.userState?.token || "";
            const response = await axios.post(
                `${apiUrl}/admin/supplier/add`,
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
                auth.toastSuccess(t("Supplier added successfully"));
                handleBack();
            }
        } catch (error) {
            const backendErrors = error?.response?.data?.errors;
            if (backendErrors) {
                setErrors(backendErrors);
                // Also toast first error
                const firstKey = Object.keys(backendErrors)[0];
                if (firstKey && backendErrors[firstKey]?.[0]) {
                    auth.toastError(backendErrors[firstKey][0]);
                }
            } else {
                auth.toastError(error?.response?.data?.message || t("Failed to add supplier"));
            }
        } finally {
            setLoading(false);
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
                    <TitlePage text={t("Add Supplier")} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 max-w-4xl">
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
                        onClick={handleReset}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    >
                        {t("Reset")}
                    </button>
                    <SubmitButton
                        text={t("Save")}
                        loading={loading}
                    />
                </div>
            </form>
        </div>
    );
};

export default AddSupplier;
