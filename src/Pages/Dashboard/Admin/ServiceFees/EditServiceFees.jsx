import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    TextInput,
    TitlePage,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Select from "react-select";

const AmountInput = ({ value, onChange, placeholder, className, type }) => (
    <div className="relative w-full">
        <input
            type="number"
            step={type === "percentage" ? "0.01" : "0.01"}
            min="0"
            max={type === "percentage" ? "100" : undefined}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border-2 border-mainColor rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor ${className}`}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-thirdColor font-TextFontMedium">
            {type === "percentage" ? "%" : "$"}
        </span>
    </div>
);

const EditServiceFees = () => {
    const { serviceFeeId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const { refetch: refetchServiceFeeItem, loading: loadingServiceFeeItem, data: dataServiceFeeItem } = useGet({
        url: `${apiUrl}/admin/service_fees/item/${serviceFeeId}`,
    });

    const { refetch: refetchData, loading: loadingData, data } = useGet({
        url: `${apiUrl}/admin/service_fees/lists`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/service_fees/update/${serviceFeeId}`,
    });

    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [branches, setBranches] = useState([]);
    const [amount, setAmount] = useState("");
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [type, setType] = useState("fixed"); // "percentage" or "fixed"
    const [module, setModule] = useState("pos"); // "pos" or "online"
    const [onlineType, setOnlineType] = useState("all"); // "all", "app", "web"
    const [title, setTitle] = useState("");

    const [selectedWebModules, setSelectedWebModules] = useState([]);
    const [webModuleOptions, setWebModuleOptions] = useState([
        { value: "all", label: "All" },
        { value: "take_away", label: "Take Away" },
        { value: "dine_in", label: "Dine In" },
        { value: "delivery", label: "Delivery" },
    ]);

    // Options
    const moduleOptions = [
        { value: "pos", label: t("POS") },
        { value: "online", label: t("Online") },
    ];

    const onlineTypeOptions = [
        { value: "all", label: t("All") },
        { value: "app", label: t("App") },
        { value: "web", label: t("Web") },
    ];

    useEffect(() => {
        refetchData();
        refetchServiceFeeItem();
    }, [serviceFeeId]);

    // Set branches list
    useEffect(() => {
        if (data?.branches) {
            const branchOptions = data.branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
            }));
            setBranches(branchOptions);
        }
        if (data?.web_modules) {
            const options = data.web_modules.map(m => ({ value: m, label: t(m) }));
            setWebModuleOptions(options);
        }
    }, [data, t]);

    // Load service fee data into form
    useEffect(() => {
        if (dataServiceFeeItem?.service_fees && branches.length > 0) {
            const fee = dataServiceFeeItem.service_fees;

            setTitle(fee.title);

            setAmount(fee.amount?.toString() || "");

            // Type: percentage or value
            setType(fee.type === "precentage" ? "percentage" : "fixed");

            // Module: pos or online
            setModule(fee.module || "pos");

            // Online type (if module is online)
            if (fee.module === "online" && fee.online_type) {
                setOnlineType(fee.online_type);
            } else {
                setOnlineType("all");
            }

            // Web modules
            if (fee.modules && fee.modules.length > 0) {
                // Check if "all" is in the modules array
                const hasAll = fee.modules.includes("all");

                if (hasAll) {
                    // If "all" is present, select all available options
                    setSelectedWebModules(webModuleOptions);
                } else {
                    // Otherwise, map the specific modules
                    const selectedModules = fee.modules.map(m => {
                        const found = webModuleOptions.find(o => o.value === m);
                        return found || { value: m, label: t(m) };
                    });
                    setSelectedWebModules(selectedModules);
                }
            } else {
                setSelectedWebModules([]);
            }

            // Branches
            if (fee.branches && fee.branches.length > 0) {
                const selected = branches.filter(branch =>
                    fee.branches.some(b => b.id === branch.value)
                );
                setSelectedBranches(selected);
            }
        }
    }, [dataServiceFeeItem, branches, webModuleOptions, t]);

    // Navigate back on success
    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

    const handleBranchChange = (selected) => setSelectedBranches(selected || []);

    const handleWebModulesChange = (selectedOptions) => {
        const selected = selectedOptions || [];

        // Check if "all" was just selected
        const hasAll = selected.some(opt => opt.value === "all");

        if (hasAll) {
            // If "all" is selected, select all options
            setSelectedWebModules(webModuleOptions);
        } else {
            setSelectedWebModules(selected);
        }
    };

    const handleTypeChange = (val) => setType(val);

    const handleReset = () => {
        if (dataServiceFeeItem?.service_fees) {
            const fee = dataServiceFeeItem.service_fees;
            setTitle(fee.title);
            setAmount(fee.amount?.toString() || "");
            setType(fee.type === "precentage" ? "percentage" : "fixed");
            setModule(fee.module || "pos");
            setOnlineType(fee.online_type || "all");

            if (fee.modules && fee.modules.length > 0) {
                // Check if "all" is in the modules array
                const hasAll = fee.modules.includes("all");

                if (hasAll) {
                    // If "all" is present, select all available options
                    setSelectedWebModules(webModuleOptions);
                } else {
                    // Otherwise, map the specific modules
                    const selectedModules = fee.modules.map(m => {
                        const found = webModuleOptions.find(o => o.value === m);
                        return found || { value: m, label: t(m) };
                    });
                    setSelectedWebModules(selectedModules);
                }
            } else {
                setSelectedWebModules([]);
            }

            if (fee.branches && branches.length > 0) {
                const selected = branches.filter(branch =>
                    fee.branches.some(b => b.id === branch.value)
                );
                setSelectedBranches(selected);
            } else {
                setSelectedBranches([]);
            }
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!title) return auth.toastError(t("Title is required"));

        if (!amount) return auth.toastError(t("Amount is required"));
        if (selectedBranches.length === 0) return auth.toastError(t("At least one branch is required"));

        const value = parseFloat(amount);
        if (type === "percentage" && (value < 0 || value > 100)) {
            return auth.toastError(t("Percentage must be between 0 and 100"));
        }
        if (value < 0) return auth.toastError(t("Amount must be positive"));

        const formData = new FormData();
        formData.append("title", title);
        formData.append("type", type === "percentage" ? "precentage" : "value");
        formData.append("amount", amount);
        formData.append("module", module);

        if (module === "online") {
            formData.append("online_type", onlineType);
        }

        selectedBranches.forEach((branch, i) => {
            formData.append(`branches[${i}]`, branch.value);
        });

        // Check if "all" is selected in web modules
        const hasAllModule = selectedWebModules.some(wm => wm.value === "all");

        if (hasAllModule) {
            // If "all" is selected, send only "all"
            formData.append(`modules[0]`, "all");
        } else {
            // Otherwise send the selected modules
            selectedWebModules.forEach((wm, index) => {
                formData.append(`modules[${index}]`, wm.value);
            });
        }

        postData(formData, t("Service Fee Updated Successfully"));
    };

    const handleBack = () => navigate(-1);

    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderColor: "#9E090F",
            borderRadius: "8px",
            padding: "6px",
            boxShadow: "none",
            "&:hover": { borderColor: "#9E090F" },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#9E090F" : state.isFocused ? "#E6F0FA" : "white",
            color: state.isSelected ? "white" : "black",
        }),
    };

    return (
        <>
            {(loadingPost || loadingData || loadingServiceFeeItem) ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-x-2">
                            <button onClick={handleBack} className="text-mainColor hover:text-red-700" title={t("Back")}>
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Edit Service Fee")} />
                        </div>
                    </div>

                    <form className="p-2" onSubmit={handleUpdate}>
                        <div className="w-full gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

                            {/* Title */}
                            <div className="flex flex-col gap-y-3">
                                <span className="text-xl font-TextFontRegular text-thirdColor">{t("Title")}:</span>
                                <TextInput
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t("Enter Title")}
                                />
                            </div>

                            {/* Module: POS / Online */}
                            <div className="flex flex-col gap-y-3">
                                <span className="text-xl font-TextFontRegular text-thirdColor">{t("Module")}:</span>
                                <div className="flex gap-8">
                                    {moduleOptions.map((opt) => (
                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="module"
                                                value={opt.value}
                                                checked={module === opt.value}
                                                onChange={(e) => setModule(e.target.value)}
                                                className="w-4 h-4 text-mainColor"
                                            />
                                            <span className="text-lg font-TextFontMedium text-thirdColor">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Online Type - Conditional */}
                            {module === "online" && (
                                <div className="flex flex-col gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">{t("Online Type")}:</span>
                                    <Select
                                        options={onlineTypeOptions}
                                        value={onlineTypeOptions.find(o => o.value === onlineType)}
                                        onChange={(opt) => setOnlineType(opt.value)}
                                        styles={customStyles}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Web Modules - Multi Select */}
                            <div className="flex flex-col gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Order Modules")}:
                                </span>
                                <Select
                                    options={webModuleOptions}
                                    value={selectedWebModules}
                                    onChange={handleWebModulesChange}
                                    placeholder={t("Select Order Modules")}
                                    styles={customStyles}
                                    isMulti
                                    isSearchable
                                    className="w-full"
                                />
                            </div>

                            {/* Type: Percentage / Fixed */}
                            <div className="flex flex-col gap-y-3">
                                <span className="text-xl font-TextFontRegular text-thirdColor">{t("Type")}:</span>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="percentage"
                                            checked={type === "percentage"}
                                            onChange={() => handleTypeChange("percentage")}
                                            className="w-4 h-4 text-mainColor"
                                        />
                                        <span className="text-lg font-TextFontMedium text-thirdColor">{t("Percentage")}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="fixed"
                                            checked={type === "fixed"}
                                            onChange={() => handleTypeChange("fixed")}
                                            className="w-4 h-4 text-mainColor"
                                        />
                                        <span className="text-lg font-TextFontMedium text-thirdColor">{t("Fixed Amount")}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="flex flex-col gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {type === "percentage" ? t("Percentage") : t("Amount")}:
                                </span>
                                <AmountInput
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={type === "percentage" ? t("Enter percentage") : t("Enter amount")}
                                    className="pr-12"
                                    type={type}
                                />
                                {type === "percentage" && (
                                    <p className="text-xs text-gray-500 mt-1">{t("Enter value between 0 and 100")}</p>
                                )}
                            </div>

                            {/* Branches */}
                            <div className="flex flex-col gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">{t("Branches")}:</span>
                                <Select
                                    options={branches}
                                    value={selectedBranches}
                                    onChange={handleBranchChange}
                                    placeholder={t("Select Branches")}
                                    styles={customStyles}
                                    isMulti
                                    isSearchable
                                    className="w-full"
                                />
                            </div>
                        </div>

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
                                    text={t("Update")}
                                    rounded="rounded-full"
                                    handleClick={handleUpdate}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default EditServiceFees;