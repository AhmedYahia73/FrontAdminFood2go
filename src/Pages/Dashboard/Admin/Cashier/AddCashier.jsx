import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Select from "react-select";

const AddCashier = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();
    const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
    const { refetch: refetchTranslation, loading: loadingTranslation, data: dataTranslation } = useGet({
        url: `${apiUrl}/${role}/translation`,
    });
    const { refetch: refetchBranch, loading: loadingBranch, data: dataBranch } = useGet({
        url: `${apiUrl}/${role}/cashier`,
    });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/${role}/cashier/add`,
    });
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [branches, setBranches] = useState([]);
    const [translations, setTranslations] = useState([]);
    const [cashierNames, setCashierNames] = useState([]);
    const [active, setActive] = useState(0);
    const [multiple, setMultiple] = useState(0);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [printType, setPrintType] = useState({ value: "usb", label: "USB" });
    const [printName, setPrintName] = useState("");
    const [printPort, setPrintPort] = useState("");
    const [printIp, setPrintIp] = useState("");

    // Fetch branches and translations on component mount
    useEffect(() => {
        refetchBranch();
        refetchTranslation();
    }, [refetchBranch, refetchTranslation]);

    // Update branches state when dataBranch is available
    useEffect(() => {
        if (dataBranch && dataBranch.branches && role === "admin") {
            const branchOptions = dataBranch.branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
            }));
            setBranches(branchOptions);
        }
    }, [dataBranch]);

    // Update translations state when dataTranslation is available
    useEffect(() => {
        if (dataTranslation && dataTranslation.translation) {
            setTranslations(dataTranslation.translation);
            // Initialize cashier names with all available translations
            const initialNames = dataTranslation.translation.map(trans => ({
                translation_id: trans.id,
                translation_name: trans.name,
                name: ""
            }));
            setCashierNames(initialNames);
        }
    }, [dataTranslation]);

    // Reset form fields after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

    // Toggle active state
    const handleActive = () => {
        setActive((prev) => (prev === 0 ? 1 : 0));
    };

    // Toggle multiple state
    const handleMultiple = () => {
        setMultiple((prev) => (prev === 0 ? 1 : 0));
    };

    // Handle name change for a specific translation
    const handleNameChange = (index, value) => {
        const updatedNames = [...cashierNames];
        updatedNames[index].name = value;
        setCashierNames(updatedNames);
    };

    // Reset form
    const handleReset = () => {
        const resetNames = translations.map(trans => ({
            translation_id: trans.id,
            translation_name: trans.name,
            name: ""
        }));
        setCashierNames(resetNames);
        setSelectedBranch(null);
        setActive(0);
        setMultiple(0);
        setPrintType({ value: "usb", label: "USB" });
        setPrintName("");
        setPrintPort("");
        setPrintIp("");
    };

    // Handle form submission
    const handleAdd = (e) => {
        e.preventDefault();

        // Validate at least one name is provided
        const hasName = cashierNames.some(item => item.name.trim() !== "");
        if (!hasName) {
            auth.toastError(t("CashierNameRequired"));
            return;
        }

        if (!selectedBranch && role === "admin") {
            auth.toastError(t("BranchRequired"));
            return;
        }

        const formData = new FormData();
        if (role === "admin") {
            formData.append("branch_id", selectedBranch.value);
        }
        formData.append("status", active);
        formData.append("multiple", multiple);
        formData.append("print_type", printType.value);
        formData.append("print_name", printName);
        formData.append("print_port", printPort);
        formData.append("print_ip", printIp);

        // Add cashier names for each translation
        cashierNames.forEach((nameItem, index) => {
            if (nameItem.name.trim()) {
                formData.append(`cashier_names[${index}][tranlation_id]`, nameItem.translation_id);
                formData.append(`cashier_names[${index}][tranlation_name]`, nameItem.translation_name);
                formData.append(`cashier_names[${index}][name]`, nameItem.name.trim());
            }
        });

        postData(formData, t("CashierAddedSuccess"));
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
        singleValue: (provided) => ({
            ...provided,
            color: "#333",
        }),
    };

    return (
        <>
            {loadingPost || loadingBranch || loadingTranslation ? (
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
                            <TitlePage text={t("Add Cashier")} />
                        </div>
                    </div>
                    <form className="p-2 mb-4" onSubmit={handleAdd}>
                        {/* All Fields in Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">

                            {/* Cashier Names in Different Languages */}
                            {cashierNames.map((nameItem, index) => (
                                <div key={index} className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Cashier Name")} ({nameItem.translation_name.toUpperCase()}) *
                                    </span>
                                    <TextInput
                                        value={nameItem.name}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        placeholder={`${t("Enter cashier name")} (${nameItem.translation_name.toUpperCase()})`}
                                    />
                                </div>
                            ))}

                            {/* Branch Selection */}
                            {role === "admin" && (
                                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Branch")} *
                                    </span>
                                    <Select
                                        options={branches}
                                        value={selectedBranch}
                                        onChange={setSelectedBranch}
                                        placeholder={t("SelectBranch")}
                                        styles={customStyles}
                                        isSearchable
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* Print Type Selection */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Print Type")}
                                </span>
                                <Select
                                    options={[
                                        { value: "usb", label: t("USB") },
                                        { value: "network", label: t("Network") },
                                    ]}
                                    value={printType}
                                    onChange={setPrintType}
                                    placeholder={t("Select Print Type")}
                                    styles={customStyles}
                                    className="w-full"
                                />
                            </div>

                            {/* Print Name */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Print Name")}
                                </span>
                                <TextInput
                                    value={printName}
                                    onChange={(e) => setPrintName(e.target.value)}
                                    placeholder={t("Enter print name")}
                                />
                            </div>

                            {/* Print Port */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Print Port")}
                                </span>
                                <TextInput
                                    value={printPort}
                                    onChange={(e) => setPrintPort(e.target.value)}
                                    placeholder={t("Enter print port")}
                                />
                            </div>

                            {/* Print IP */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Print IP")}
                                </span>
                                <TextInput
                                    value={printIp}
                                    onChange={(e) => setPrintIp(e.target.value)}
                                    placeholder={t("Enter print IP")}
                                />
                            </div>

                            {/* Active Status */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor mb-2">
                                    {t("ActiveCashier")}
                                </span>
                                <div className="flex items-center justify-start gap-x-3 mt-2">
                                    <Switch handleClick={handleActive} checked={active} />
                                </div>
                            </div>

                            {/* Multiple Shift */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor mb-2">
                                    {t("MultipleShift")}
                                </span>
                                <div className="flex items-center justify-start gap-x-3 mt-2">
                                    <Switch handleClick={handleMultiple} checked={multiple} />
                                </div>
                            </div>

                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full gap-x-4 mt-8">
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

export default AddCashier;