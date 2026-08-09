import React, { useEffect, useRef, useState } from "react";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import {
  DropDown,
  NumberInput,
  StaticButton,
  StaticLoader,
  SubmitButton,
  TextInput,
} from "../../../../Components/Components";
import { useTranslation } from "react-i18next";

const AddTaxSection = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/tax/add`,
  });
  const { t, i18n } = useTranslation();

  const dropDownType = useRef();
  const auth = useAuth();

  const [taxName, setTaxName] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [taxType] = useState([
    { id: "", name: t("Select Tax Type") },
    { id: "precentage", name: t("precentage") },
    { id: "value", name: t("value") },
  ]);

  const [stateType, setStateType] = useState(t("Select Tax Type"));
  const [typeName, setTypeName] = useState("");

  const [isOpentaxType, setIsOpentaxType] = useState(false);

  const handleOpentaxType = () => {
    setIsOpentaxType(!isOpentaxType);
  };
  const handleOpenOptiontaxType = () => setIsOpentaxType(false);

  const handleSelecttaxType = (option) => {
    setTypeName(option.id);
    setStateType(option.name);
  };

  useEffect(() => {
    if (!loadingPost) {
      handleReset();
    }
    setUpdate(!update);
  }, [response]);

  const handleReset = () => {
    setTaxName("");
    setTaxAmount("");
    setStateType(t("Select Tax Type"));
    setTypeName("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropDownType.current &&
        !dropDownType.current.contains(event.target)
      ) {
        setIsOpentaxType(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTaxAdd = (e) => {
    e.preventDefault();

    if (!taxName) {
      auth.toastError(t("enterTaxName"));
      return;
    }
    if (!taxAmount) {
      auth.toastError(t("enterTaxAmount"));
      return;
    }
    if (!typeName) {
      auth.toastError(t("please Select Tax Type"));
      return;
    }

    const formData = new FormData();

    formData.append("name", taxName);
    formData.append("amount", taxAmount);
    formData.append("type", typeName);

    postData(formData, t("Tax Added Success"));
  };

  return (
    <>
      {loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleTaxAdd}>
            <div className="flex flex-wrap items-center justify-start w-full gap-4 mb-4 sm:flex-col lg:flex-row">
              {/* Tax Name */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                 {t("Tax Name")}:
                </span>
                <TextInput
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  placeholder={t("Tax Name")}
                />
              </div>
              {/* Tax Amount */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                 {t("Tax Amount")}:
                </span>
                <NumberInput
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  placeholder={t("Tax Amount")}
                />
              </div>
              {/* Tax Types */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t('Tax Type')}:
                </span>
                <DropDown
                  ref={dropDownType}
                  handleOpen={handleOpentaxType}
                  stateoption={stateType}
                  openMenu={isOpentaxType}
                  handleOpenOption={handleOpenOptiontaxType}
                  onSelectOption={handleSelecttaxType}
                  options={taxType}
                  border={false}
                />
              </div>
            </div>

            {/* Buttons*/}
            <div className="flex items-center justify-end w-full gap-x-4">
              <div className="">
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
              <div className="">
                <SubmitButton
                  text={t("Submit")}
                  rounded="rounded-full"
                  handleClick={handleTaxAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddTaxSection;
