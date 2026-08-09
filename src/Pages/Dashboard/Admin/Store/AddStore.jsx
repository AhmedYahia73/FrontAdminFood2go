import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { useGet } from "../../../../Hooks/useGet";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Select from 'react-select';

const AddStore = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [status, setStatus] = useState(1); // 1 = active

    // Fetch branches list
    const {
        data: branchesData,
        loading: loadingBranches,
        refetch: refetchBranches
    } = useGet({
        url: `${apiUrl}/admin/purchase_stores`,
    });

    // Submit store
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_stores/add`,
    });

    // Prepare branch options for react-select
    const branchOptions = (branchesData?.branches || []).map(branch => ({
        value: branch.id,
        label: branch.name
    }));

    useEffect(() => {
        refetchBranches();
    }, [refetchBranches]);

    // Success → go back
    useEffect(() => {
        if (response && !loadingPost) {
            auth.toastSuccess(t("Store added successfully"));
            handleBack();
        }
    }, [response, loadingPost]);

    const handleStatus = () => {
        setStatus(prev => prev === 1 ? 0 : 1);
    };

    const handleBranchChange = (selectedOptions) => {
        setSelectedBranches(selectedOptions || []);
    };

    const handleReset = () => {
        setName("");
        setLocation("");
        setSelectedBranches([]);
        setStatus(1);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            auth.toastError(t("Please enter store name"));
            return;
        }
        if (!location.trim()) {
            auth.toastError(t("Please enter location"));
            return;
        }
        if (selectedBranches.length === 0) {
            auth.toastError(t("Please select at least one branch"));
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("location", location.trim());
        formData.append("status", status);

        // Append branch IDs
        selectedBranches.forEach((branch, index) => {
            formData.append(`branches[${index}]`, branch.value);
        });

        postData(formData, t("Adding store..."));
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
            '&:hover': { borderColor: '#9CA3AF' }
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#DBEAFE',
            borderRadius: '9999px',
            padding: '0.25rem 0.75rem'
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#1E40AF',
            fontWeight: 'medium'
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: '#1E40AF',
            ':hover': { backgroundColor: '#BFDBFE', color: '#1E3A8A' }
        })
    };

    return (
        <>
            {(loadingPost || loadingBranches) ? (
                <div className="flex items-center justify-center w-full h-64">
                    <StaticLoader />
                </div>
            ) : (
                <section className="p-2 md:p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={handleBack}
                            className="text-mainColor hover:text-red-600 transition-colors"
                            title={t("Back")}
                        >
                            <IoArrowBack size={28} />
                        </button>
                        <TitlePage text={t("Add Store")} />
                    </div>

                    <form onSubmit={handleSubmit} className="w-full bg-white shadow-lg rounded-2xl p-2 md:p-6 lg:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Store Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Store Name")} <span className="text-red-500">*</span>
                                </label>
                                <TextInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("Enter store name")}
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Location")} <span className="text-red-500">*</span>
                                </label>
                                <TextInput
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder={t("Enter location")}
                                    required
                                />
                            </div>

                            {/* Branches - Multi Select */}
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Branches")} <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    isMulti
                                    value={selectedBranches}
                                    onChange={handleBranchChange}
                                    options={branchOptions}
                                    placeholder={t("Select branches...")}
                                    isSearchable
                                    isClearable
                                    noOptionsMessage={() => t("No branches found")}
                                    styles={selectStyles}
                                    className="text-lg"
                                />
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-6 pt-6">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Status")}:
                                </span>
                                <div className="flex items-center gap-4">
                                    <Switch checked={status === 1} handleClick={handleStatus} />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 mt-10">
                            <div>
                                <StaticButton
                                    text={t("Reset")}
                                    handleClick={handleReset}
                                    bgColor="bg-gray-200"
                                    Color="text-gray-700"
                                    border="border-2 border-gray-300"
                                    rounded="rounded-full px-8 py-3"
                                />
                            </div>
                            <div>
                                <SubmitButton
                                    text={loadingPost ? t("Adding...") : t("Add")}
                                    rounded="rounded-full px-10 py-3"
                                    disabled={loadingPost}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default AddStore;