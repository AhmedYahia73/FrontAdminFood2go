import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TitlePage,
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Select from "react-select";

const EditDiscountModule = () => {
    const { moduleId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    
    // Fetch discount module data
    const { refetch: refetchDiscountItem, loading: loadingDiscountItem, data: dataDiscountItem } = useGet({
        url: `${apiUrl}/admin/discount_module/item/${moduleId}`,
    });
    
    // Fetch branches and modules
    const { refetch: refetchData, loading: loadingData, data: data } = useGet({
        url: `${apiUrl}/admin/discount_module`,
    });
    
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/discount_module/update/${moduleId}`,
    });
    
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [branches, setBranches] = useState([]);
    const [modules, setModules] = useState([]);
    const [types, setTypes] = useState([
        { value: "all", label: "ALL" },
        { value: "app", label: "APP" },
        { value: "web", label: "WEB" },
    ]);
    const [discount, setDiscount] = useState("");
    const [status, setStatus] = useState(0);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [branchModules, setBranchModules] = useState([]);

    // Fetch data on component mount
    useEffect(() => {
        refetchData();
        refetchDiscountItem();
    }, [refetchData, refetchDiscountItem]);

    // Update branches and modules state when data is available
    useEffect(() => {
        if (data) {
            if (data.branches) {
                const branchOptions = data.branches.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                }));
                setBranches(branchOptions);
            }
            if (data.modules) {
                const moduleOptions = data.modules.map((module) => ({
                    value: module,
                    label: module.replace(/_/g, ' ').toUpperCase(),
                }));
                setModules(moduleOptions);
            }
            if (data.type && Array.isArray(data.type)) {
                const typeOptions = data.type.map((t) => ({
                    value: t,
                    label: t.toUpperCase(),
                }));
                setTypes(typeOptions);
            }
        }
    }, [data]);

    // Set form fields when discount module data is available
    useEffect(() => {
        if (dataDiscountItem && branches.length > 0 && modules.length > 0 && types.length > 0) {
            const discountModule = dataDiscountItem;
            
            // Set basic fields
            setDiscount(discountModule.discount?.toString() || "");
            setStatus(discountModule.status || 0);
            
            // Extract selected branches (supporting branch_id or branch name fallback)
            const branchSelections = branches.filter((branch) =>
                discountModule.modules?.some(
                    (item) =>
                        (item.branch_id !== undefined && item.branch_id !== null && Number(item.branch_id) === Number(branch.value)) ||
                        (item.branch && item.branch.trim().toLowerCase() === branch.label.trim().toLowerCase())
                )
            );
            setSelectedBranches(branchSelections);
            
            // Extract selected modules
            const uniqueModuleNames = [
                ...new Set(discountModule.modules?.map((item) => item.module) || []),
            ];
            const moduleSelections = modules.filter((module) =>
                uniqueModuleNames.includes(module.value)
            );
            setSelectedModules(moduleSelections);
            
            // Extract selected types
            const uniqueTypeNames = [
                ...new Set(discountModule.modules?.map((item) => item.type) || []),
            ];
            const typeSelections = types.filter((t) =>
                uniqueTypeNames.includes(t.value)
            );
            setSelectedTypes(typeSelections);
            
            // Set branch modules combinations
            updateBranchModules(branchSelections, moduleSelections, typeSelections);
        }
    }, [dataDiscountItem, branches, modules, types]);

    // Navigate back after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

    // Toggle status
    const handleStatus = () => {
        setStatus((prev) => (prev === 0 ? 1 : 0));
    };

    // Handle branch selection
    const handleBranchChange = (selectedOptions) => {
        setSelectedBranches(selectedOptions || []);
        updateBranchModules(selectedOptions || [], selectedModules, selectedTypes);
    };

    // Handle module selection
    const handleModuleChange = (selectedOptions) => {
        setSelectedModules(selectedOptions || []);
        updateBranchModules(selectedBranches, selectedOptions || [], selectedTypes);
    };

    // Handle type selection
    const handleTypeChange = (selectedOptions) => {
        setSelectedTypes(selectedOptions || []);
        updateBranchModules(selectedBranches, selectedModules, selectedOptions || []);
    };

    // Update branch modules combinations
    const updateBranchModules = (currentBranches, currentModules, currentTypes) => {
        const combinations = [];
        
        currentBranches.forEach((branch) => {
            currentModules.forEach((module) => {
                currentTypes.forEach((type) => {
                    combinations.push({
                        branch_id: branch.value,
                        branch_name: branch.label,
                        module: module.value,
                        module_name: module.label,
                        type: type.value,
                        type_name: type.label,
                    });
                });
            });
        });
        
        setBranchModules(combinations);
    };

    // Reset form to original values
    const handleReset = () => {
        if (dataDiscountItem && branches.length > 0 && modules.length > 0 && types.length > 0) {
            const discountModule = dataDiscountItem;
            
            setDiscount(discountModule.discount?.toString() || "");
            setStatus(discountModule.status || 0);
            
            const branchSelections = branches.filter((branch) =>
                discountModule.modules?.some(
                    (item) =>
                        (item.branch_id !== undefined && item.branch_id !== null && Number(item.branch_id) === Number(branch.value)) ||
                        (item.branch && item.branch.trim().toLowerCase() === branch.label.trim().toLowerCase())
                )
            );
            setSelectedBranches(branchSelections);
            
            const uniqueModuleNames = [
                ...new Set(discountModule.modules?.map((item) => item.module) || []),
            ];
            const moduleSelections = modules.filter((module) =>
                uniqueModuleNames.includes(module.value)
            );
            setSelectedModules(moduleSelections);
            
            const uniqueTypeNames = [
                ...new Set(discountModule.modules?.map((item) => item.type) || []),
            ];
            const typeSelections = types.filter((t) =>
                uniqueTypeNames.includes(t.value)
            );
            setSelectedTypes(typeSelections);
            
            updateBranchModules(branchSelections, moduleSelections, typeSelections);
        }
    };

    // Handle form submission
    const handleUpdate = (e) => {
        e.preventDefault();

        if (!discount) {
            auth.toastError(t("DiscountRequired"));
            return;
        }

        if (selectedBranches.length === 0) {
            auth.toastError(t("BranchRequired"));
            return;
        }

        if (selectedModules.length === 0) {
            auth.toastError(t("ModuleRequired"));
            return;
        }

        if (selectedTypes.length === 0) {
            auth.toastError(t("TypeRequired"));
            return;
        }

        const formData = new FormData();
        formData.append("discount", discount);
        formData.append("status", status);

        // Add branch_modules combinations
        branchModules.forEach((item, index) => {
            formData.append(`branch_modules[${index}][branch_id]`, item.branch_id);
            formData.append(`branch_modules[${index}][module]`, item.module);
            formData.append(`branch_modules[${index}][type]`, item.type);
        });

        postData(formData, t("Discount Module Updated Success"));
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Custom styles for react-select
    const customStyles = {
        control: (provided) => ({
            ...provided,
            borderColor: "#9E090F",
            borderRadius: "8px",
            padding: "6px",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#9E090F",
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#9E090F" : state.isFocused ? "#E6F0FA" : "white",
            color: state.isSelected ? "white" : "black",
            "&:hover": {
                backgroundColor: "#E6F0FA",
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#E6F0FA",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "#9E090F",
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "#9E090F",
            ':hover': {
                backgroundColor: '#9E090F',
                color: 'white',
            },
        }),
    };

    // Custom NumberInput component for percentage
    const NumberInput = ({ type, step, min, value, onChange, placeholder, className }) => (
        <div className="relative w-full">
            <input
                type={type}
                step={step}
                min={min}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-3 border-2 border-mainColor rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor ${className}`}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-thirdColor font-TextFontMedium">
                %
            </span>
        </div>
    );

    return (
        <>
            {loadingPost || loadingData || loadingDiscountItem ? (
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
                            <TitlePage text={t("Edit Discount Module")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleUpdate}>
                        <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {/* Discount Percentage */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("DiscountPercentage")}:
                                </span>
                                <NumberInput
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    placeholder={t("Enter percentage")}
                                    className="pr-12"
                                />
                            </div>

                            {/* Branch Selection */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Branches")}:
                                </span>
                                <Select
                                    options={branches}
                                    value={selectedBranches}
                                    onChange={handleBranchChange}
                                    placeholder={t("SelectBranches")}
                                    styles={customStyles}
                                    isMulti
                                    isSearchable
                                    className="w-full"
                                />
                            </div>

                            {/* Module Selection */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Modules")}:
                                </span>
                                <Select
                                    options={modules}
                                    value={selectedModules}
                                    onChange={handleModuleChange}
                                    placeholder={t("SelectModules")}
                                    styles={customStyles}
                                    isMulti
                                    isSearchable
                                    className="w-full"
                                />
                            </div>

                            {/* Type Selection */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Types")}:
                                </span>
                                <Select
                                    options={types}
                                    value={selectedTypes}
                                    onChange={handleTypeChange}
                                    placeholder={t("SelectTypes")}
                                    styles={customStyles}
                                    isMulti
                                    isSearchable
                                    className="w-full"
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
                        <div className="flex items-center justify-end w-full gap-x-4">
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

export default EditDiscountModule;