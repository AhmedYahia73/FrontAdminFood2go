import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../../Context/Auth";
import {
  DropDown,
  LoaderLogin,
  NumberInput,
  StaticButton,
  SubmitButton,
  TextInput,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useTranslation } from "react-i18next";
import Select from "react-select";

const EditDiscountPage = () => {
  const { discountId } = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchDiscount,
    loading: loadingDiscount,
    data: dataDiscount,
  } = useGet({ url: `${apiUrl}/admin/settings/discount/item/${discountId}` });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/discount/update/${discountId}`,
  });

  const auth = useAuth();
  const navigate = useNavigate();

  const dropDownType = useRef();
  const { t, i18n } = useTranslation();

  const [discountName, setDiscountName] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountType] = useState([{ name: "precentage" }, { name: "value" }]);

  const [stateType, setStateType] = useState("Select Discount Type");
  const [typeName, setTypeName] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const moduleOptions = [
    { value: "all", label: t("all") },
    { value: "pos", label: t("pos") },
    { value: "web", label: t("web") },
    { value: "app", label: t("app") },
  ];

  const [isOpenDiscountType, setIsOpenDiscountType] = useState(false);

  useEffect(() => {
    if (dataDiscount) {
      setDiscountName(dataDiscount.discount.name || "");
      setDiscountAmount(dataDiscount.discount.amount || "");
      setStateType(dataDiscount.discount.type || "Select Discount Type");
      setTypeName(dataDiscount.discount.type || "");
      setStartDate(dataDiscount.discount.start_date || "");
      setEndDate(dataDiscount.discount.end_date || "");
      
      if (dataDiscount.discount.module) {
        let mods = dataDiscount.discount.module;
        if (typeof mods === 'string') {
          try {
             mods = JSON.parse(mods);
          } catch(e) {
             mods = mods.split(',');
          }
        }
        if (Array.isArray(mods)) {
           const selected = moduleOptions.filter(opt => mods.includes(opt.value));
           setSelectedModules(selected);
        }
      }
    }
  }, [dataDiscount, t]);

  const handleOpenDiscountType = () => {
    setIsOpenDiscountType(!isOpenDiscountType);
  };
  const handleOpenOptionDiscountType = () => setIsOpenDiscountType(false);

  const handleSelectDiscountType = (option) => {
    setTypeName(option.name);
    setStateType(option.name);
  };

  useEffect(() => {
    if (response) {
      handleBack();
    }
  }, [response]);

  const handleBack = () => {
    navigate(-1, { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropDownType.current &&
        !dropDownType.current.contains(event.target)
      ) {
        setIsOpenDiscountType(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDiscountEdit = (e) => {
    e.preventDefault();

    if (!discountName) {
      auth.toastError(t("discountName")); // ترجمة النص
      return;
    }
    if (!discountAmount) {
      auth.toastError(t("discountAmount")); // ترجمة النص
      return;
    }
    if (!typeName) {
      auth.toastError(t("please Select Discount Type"));
      return;
    }
    if (!startDate) {
      auth.toastError(t("please Enter Start Date"));
      return;
    }
    if (!endDate) {
      auth.toastError(t("please Enter End Date"));
      return;
    }
    if (!selectedModules || selectedModules.length === 0) {
      auth.toastError(t("please Select Modules"));
      return;
    }

    const formData = new FormData();

    formData.append("name", discountName);
    formData.append("amount", discountAmount);
    formData.append("type", typeName);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    selectedModules.forEach((mod) => {
      formData.append("module[]", mod.value);
    });

    postData(formData, t("Discount Edited Success"));
  };

  return (
    <>
      {loadingDiscount || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full">
            <LoaderLogin />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleDiscountEdit}>
            {/* Content*/}
            <div className="sm:py-3 lg:py-6">
              <div className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row">
                {/* Discount Name */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("DiscountName")}:
                  </span>
                  <TextInput
                    value={discountName}
                    onChange={(e) => setDiscountName(e.target.value)}
                    placeholder={t("DiscountName")}
                  />
                </div>
                {/* Discount Amount */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("DiscountAmount")}:
                  </span>
                  <NumberInput
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder={t("DiscountAmount")}
                  />
                </div>
                {/* Discount Types */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("DiscountType")}:
                  </span>
                  <DropDown
                    ref={dropDownType}
                    handleOpen={handleOpenDiscountType}
                    stateoption={stateType}
                    openMenu={isOpenDiscountType}
                    handleOpenOption={handleOpenOptionDiscountType}
                    onSelectOption={handleSelectDiscountType}
                    options={discountType}
                    border={false}
                  />
                </div>
                {/* Start Date */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("StartDate")}:
                  </span>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-mainColor"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                {/* End Date */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("EndDate")}:
                  </span>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-mainColor"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                {/* Module Multiselect */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Module")}:
                  </span>
                  <Select
                    isMulti
                    name="modules"
                    options={moduleOptions}
                    className="w-full basic-multi-select"
                    classNamePrefix="select"
                    value={selectedModules}
                    onChange={setSelectedModules}
                    placeholder={t("Select Module")}
                  />
                </div>
              </div>
            </div>

            {/* Buttons*/}
            <div className="flex items-center justify-end w-full gap-x-4">
              <div className="">
                <StaticButton
                  text={t("Cancel")}
                  handleClick={handleBack}
                  bgColor="bg-transparent"
                  Color="text-mainColor"
                  border={"border-2"}
                  borderColor={"border-mainColor"}
                  rounded="rounded-full"
                />
              </div>
              <div className="">
                <SubmitButton
                  text={t("Edit")}
                  rounded="rounded-full"
                  handleClick={handleDiscountEdit}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default EditDiscountPage;
