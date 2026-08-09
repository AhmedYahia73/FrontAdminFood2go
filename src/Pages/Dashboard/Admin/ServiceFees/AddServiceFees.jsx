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
import { useNavigate } from "react-router-dom";
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
    <span className="absolute transform -translate-y-1/2 right-3 top-1/2 text-thirdColor font-TextFontMedium">
      {type === "percentage" ? "%" : "$"}
    </span>
  </div>
);

const AddServiceFees = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchData,
    loading: loadingData,
    data,
  } = useGet({
    url: `${apiUrl}/admin/service_fees/lists`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/service_fees/add`,
  });
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [amount, setAmount] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [type, setType] = useState("percentage"); // "percentage" or "value"
  const [title, setTitle] = useState("")

  // NEW STATES
  const [module, setModule] = useState("pos"); // "pos" or "online"
  const [onlineType, setOnlineType] = useState("all"); // "all", "app", "web"

  const [selectedWebModules, setSelectedWebModules] = useState([]);
  const [webModuleOptions, setWebModuleOptions] = useState([
    { value: "all", label: "All" },
    { value: "take_away", label: "Take Away" },
    { value: "dine_in", label: "Dine In" },
    { value: "delivery", label: "Delivery" },
  ]);

  // Options from your data
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
  }, [refetchData]);

  useEffect(() => {
    if (data) {
      if (data.branches) {
        const branchOptions = data.branches.map((branch) => ({
          value: branch.id,
          label: branch.name,
        }));
        setBranches(branchOptions);
      }

      if (data.web_modules) {
        const options = data.web_modules.map(m => ({ value: m, label: t(m) }));
        setWebModuleOptions(options);
      }
    }
  }, [data, t]);

  useEffect(() => {
    if (!loadingPost && response) {
      handleBack();
    }
  }, [response, loadingPost]);

  const handleBranchChange = (selectedOptions) => {
    setSelectedBranches(selectedOptions || []);
  };

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

  const handleTypeChange = (selectedType) => {
    setType(selectedType);
    setAmount("");
  };

  const handleReset = () => {
    setAmount("");
    setSelectedBranches([]);
    setType("percentage");
    setModule("pos");
    setOnlineType("all");
    setTitle("")
    setSelectedWebModules([])
  };

  const handleAdd = (e) => {
    e.preventDefault();

    if (!title) {
      auth.toastError(t("TitleRequired"));
      return;
    }

    if (!amount) {
      auth.toastError(t("AmountRequired"));
      return;
    }

    if (selectedBranches.length === 0) {
      auth.toastError(t("BranchRequired"));
      return;
    }

    if (type === "percentage") {
      const val = parseFloat(amount);
      if (val < 0 || val > 100) {
        auth.toastError(t("PercentageMustBeBetween0And100"));
        return;
      }
    } else if (parseFloat(amount) < 0) {
      auth.toastError(t("AmountMustBePositive"));
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type === "percentage" ? "precentage" : "value");
    formData.append("amount", amount);
    formData.append("module", module); // pos or online

    if (module === "online") {
      formData.append("online_type", onlineType); // all, app, web
    }

    selectedBranches.forEach((branch, index) => {
      formData.append(`branches[${index}]`, branch.value);
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

    postData(formData, t("Service Fee Added Success"));
  };

  const handleBack = () => {
    navigate(-1);
  };

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
      backgroundColor: state.isSelected
        ? "#9E090F"
        : state.isFocused
          ? "#E6F0FA"
          : "white",
      color: state.isSelected ? "white" : "black",
    }),
  };

  return (
    <>
      {loadingPost || loadingData ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-x-2">
              <button
                onClick={handleBack}
                className="text-mainColor hover:text-red-700"
                title={t("Back")}
              >
                <IoArrowBack size={24} />
              </button>
              <TitlePage text={t("Add Service Fee")} />
            </div>
          </div>

          <form className="p-2" onSubmit={handleAdd}>
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

              <div className="flex flex-col gap-y-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Title")}:
                </span>
                <TextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("Enter Title")}
                />
              </div>
              {/* Module: POS or Online */}
              <div className="flex flex-col gap-y-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Module")}:
                </span>
                <div className="flex gap-8">
                  {moduleOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="module"
                        value={opt.value}
                        checked={module === opt.value}
                        onChange={(e) => setModule(e.target.value)}
                        className="w-4 h-4 text-mainColor"
                      />
                      <span className="text-lg font-TextFontMedium text-thirdColor">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Online Type - Only show if Online is selected */}
              {module === "online" && (
                <div className="flex flex-col gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Online Type")}:
                  </span>
                  <Select
                    options={onlineTypeOptions}
                    value={
                      onlineTypeOptions.find((o) => o.value === onlineType) ||
                      onlineTypeOptions[0]
                    }
                    onChange={(selected) => setOnlineType(selected.value)}
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

              {/* Type: Percentage or Value */}
              <div className="flex flex-col gap-y-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Type")}:
                </span>
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
                    <span className="text-lg font-TextFontMedium text-thirdColor">
                      {t("Percentage")}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="value"
                      checked={type === "value"}
                      onChange={() => handleTypeChange("value")}
                      className="w-4 h-4 text-mainColor"
                    />
                    <span className="text-lg font-TextFontMedium text-thirdColor">
                      {t("Fixed Amount")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {type === "percentage" ? t("Percentage") : t("Amount")}:
                </span>
                <AmountInput
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    type === "percentage"
                      ? t("Enter percentage")
                      : t("Enter amount")
                  }
                  className="pr-12"
                  type={type}
                />
                {type === "percentage" && (
                  <p className="mt-1 text-xs text-gray-500">
                    {t("Enter value between 0 and 100")}
                  </p>
                )}
              </div>

              {/* Branches */}
              <div className="flex flex-col gap-y-1">
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

export default AddServiceFees;
