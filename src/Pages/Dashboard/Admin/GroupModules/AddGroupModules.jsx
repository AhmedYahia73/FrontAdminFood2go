import React, { useEffect, useState, useRef } from "react";
import {
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput, NumberInput,
  TitlePage,
  UploadInput,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';

const AddGroupModules = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();

  const {
    refetch: refetchModules,
    loading: loadingModules,
    data: dataModules,
  } = useGet({
    url: `${apiUrl}/admin/group_product`,
  });

  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/group_product/add`,
  });

  // State variables
  const [name, setName] = useState("");
  const [percentageType, setPercentageType] = useState("increase");
  const [percentageValue, setPercentageValue] = useState("");
  const [status, setStatus] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [due, setDue] = useState(0);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const ImageRef = useRef();

  useEffect(() => {
    refetchModules();
  }, [refetchModules]);

  useEffect(() => {
    if (dataModules && dataModules.modules) {
      // Convert string array to options for react-select
      const options = dataModules.modules.map(module => ({
        value: module,
        label: module.charAt(0).toUpperCase() + module.slice(1).replace('_', ' ')
      }));
      setModuleOptions(options);
    }
  }, [dataModules]);

  useEffect(() => {
    if (response && response.status === 200) {
      handleBack();
    }
  }, [response]);

  const handleStatusChange = () => {
    setStatus(prev => prev === 1 ? 0 : 1);
  };

  const handleDueChange = () => {
    setDue(prev => prev === 1 ? 0 : 1);
  };

  const handlePercentageTypeChange = (type) => {
    setPercentageType(type);
    setPercentageValue("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(file.name);
    }
  };

  const handleImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handleReset = () => {
    setName("");
    setPercentageType("increase");
    setPercentageValue("");
    setStatus(1);
    setDue(0);
    setSelectedModules([]);
    setImage(null);
    setImageFile(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      auth.toastError(t("Please enter group name"));
      return;
    }

    if (!percentageValue || isNaN(percentageValue) || parseFloat(percentageValue) <= 0) {
      auth.toastError(t("Please enter a valid positive percentage"));
      return;
    }

    if (selectedModules.length === 0) {
      auth.toastError(t("Please select at least one module"));
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name.trim());

    if (percentageType === "increase") {
      formData.append("increase_precentage", parseFloat(percentageValue));
      formData.append("decrease_precentage", 0);
    } else {
      formData.append("increase_precentage", 0);
      formData.append("decrease_precentage", parseFloat(percentageValue));
    }

    // Append selected modules as array
    selectedModules.forEach(module => {
      formData.append("module[]", module.value);
    });

    formData.append("status", status);
    formData.append("due", due);

    if (imageFile) {
      formData.append("icon", imageFile);
    }

    postData(formData, "Group module added successfully")
      .finally(() => {
        setLoading(false);
      });
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '4px 8px',
      fontSize: '16px',
      fontFamily: 'inherit',
      boxShadow: state.isFocused ? '0 0 0 2px var(--mainColor, #3b82f6)' : 'none',
      borderColor: state.isFocused ? 'var(--mainColor, #3b82f6)' : '#e5e7eb',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--mainColor, #3b82f6)' : '#d1d5db'
      }
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '16px',
      fontFamily: 'inherit',
      backgroundColor: state.isSelected ? 'var(--mainColor, #3b82f6)' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--mainColor, #3b82f6)' : '#eff6ff'
      }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'var(--mainColor, #3b82f6)',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'white',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'white',
      ':hover': {
        backgroundColor: 'red',
        color: 'white',
      },
    }),
  };

  return (
    <div className="flex items-start justify-start w-full p-2 pb-28">
      {loadingPost || loading ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <section className="w-full">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-x-2">
              <button
                onClick={handleBack}
                className="transition-colors text-mainColor hover:text-red-700"
                title={t("Back")}
              >
                <IoArrowBack size={24} />
              </button>
              <TitlePage text={t("Add Group Module")} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="sm:py-3 lg:py-6">
              <div className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row">

                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Group Name")}:
                  </span>
                  <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("Enter group name")}
                  />
                </div>

                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Percentage Type")}:
                  </span>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="percentageType"
                        value="increase"
                        checked={percentageType === "increase"}
                        onChange={() => handlePercentageTypeChange("increase")}
                        className="w-4 h-4 text-mainColor focus:ring-mainColor"
                      />
                      <span className="text-lg font-TextFontRegular text-thirdColor">
                        {t("Increase")}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="percentageType"
                        value="decrease"
                        checked={percentageType === "decrease"}
                        onChange={() => handlePercentageTypeChange("decrease")}
                        className="w-4 h-4 text-mainColor focus:ring-mainColor"
                      />
                      <span className="text-lg font-TextFontRegular text-thirdColor">
                        {t("Decrease")}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {percentageType === "increase" ? t("Increase Percentage") : t("Decrease Percentage")}:
                  </span>
                  <div className="relative w-full">
                    <NumberInput
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={percentageValue}
                      onChange={(e) => setPercentageValue(e.target.value)}
                      placeholder={t("Enter percentage")}
                      className="pr-12"
                    />
                    <span
                      className={`absolute top-1/2 transform -translate-y-1/2 text-thirdColor font-TextFontMedium ${document.dir === "rtl" ? "left-8" : "right-3"
                        }`}
                    >
                      %
                    </span>

                  </div>
                </div>

                {/* Modules Selection */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Modules")} *
                  </span>
                  <Select
                    isMulti
                    options={moduleOptions}
                    value={selectedModules}
                    onChange={setSelectedModules}
                    placeholder={t("Select modules")}
                    styles={customStyles}
                    isLoading={loadingModules}
                    className="w-full"
                    noOptionsMessage={() => t("No modules available")}
                  />
                </div>

                <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-8">
                  <div className="flex items-center justify-start w-2/4 gap-x-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("Status")}:
                    </span>
                    <Switch
                      handleClick={handleStatusChange}
                      checked={status === 1}
                    />
                  </div>
                </div>

                <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-8">
                  <div className="flex items-center justify-start w-2/4 gap-x-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("Due")}:
                    </span>
                    <Switch
                      handleClick={handleDueChange}
                      checked={due === 1}
                    />
                  </div>
                </div>

                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Module Icon")}:
                  </span>
                  <UploadInput
                    value={image}
                    uploadFileRef={ImageRef}
                    placeholder={t("Module Icon")}
                    handleFileChange={handleImageChange}
                    onChange={(e) => setImage(e.target.value)}
                    onClick={() => handleImageClick(ImageRef)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end w-full gap-x-4">
              <div>
                <StaticButton
                  text={t("Reset")}
                  handleClick={handleReset}
                  bgColor="bg-transparent"
                  Color="text-mainColor"
                  border={"border-2"}
                  borderColor={"border-mainColor"}
                  rounded="rounded-full"
                />
              </div>
              <div>
                <SubmitButton
                  text={t("Submit")}
                  rounded="rounded-full"
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default AddGroupModules;