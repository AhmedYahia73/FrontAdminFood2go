import React, { useEffect, useRef, useState } from "react";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import {
  DropDown,
  LoaderLogin,
  StaticLoader,
  SubmitButton,
  TextInput,
} from "../../../../Components/Components";
import { useTranslation } from "react-i18next";

const TaxTypePage = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchTaxType,
    loading: loadingTaxType,
    data: dataTaxType,
  } = useGet({
    url: `${apiUrl}/admin/settings/tax_type`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/tax_update`,
  });
  const { t, i18n } = useTranslation();

  const dropDownType = useRef();
  const [taxType, setTaxType] = useState("");
  const [stateType, setStateType] = useState(t("Select Tax Type"));
  const [taxTypes] = useState([
    { id: "", name: t("Select Tax Type") },
    { id: "included", name: t("included") },
    { id: "excluded", name: t("excluded") },
  ]);

  const [isOpentaxType, setIsOpentaxType] = useState(false);

  useEffect(() => {
    if (!loadingPost) {
      setStateType(stateType);
      setTaxType(stateType);
    }
  }, [response]);

  useEffect(() => {
    refetchTaxType();
  }, [refetchTaxType]);

  useEffect(() => {
    if (dataTaxType && dataTaxType.tax) {
      setTaxType(dataTaxType.tax);
      setStateType(dataTaxType.tax);
    }
  }, [dataTaxType]); // Only run this effect when `data` changes

  const handleOpentaxType = () => {
    setIsOpentaxType(!isOpentaxType);
  };
  const handleOpenOptiontaxType = () => setIsOpentaxType(false);

  const handleSelecttaxType = (option) => {
    setTaxType(option.id);
    setStateType(option.name);
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

  const handleChangeTax = (e) => {
    e.preventDefault();

    if (!taxType) {
      auth.toastError(t("please Select Tax Type"));
      return;
    }

    const formData = new FormData();

    formData.append("tax", taxType);

    postData(formData, t("Tax Type Changed Success"));
  };
  return (
    <>
      {loadingPost || loadingTaxType ? (
        <>
          <div className="flex items-center justify-center w-full">
            <LoaderLogin />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleChangeTax}>
            <div className="flex flex-wrap items-center justify-start w-full gap-4 mb-4 sm:flex-col lg:flex-row">
              {/* Tax Name */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Your Tax Type")}:
                </span>
                <span className="w-full p-2 py-3 text-2xl bg-white shadow outline-none rounded-2xl font-TextFontRegular text-thirdColor valueInput">
                  {t(taxType)}
                </span>
              </div>
              {/* Tax Types */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Tax Type")}:
                </span>
                <DropDown
                  ref={dropDownType}
                  handleOpen={handleOpentaxType}
                  stateoption={stateType}
                  openMenu={isOpentaxType}
                  handleOpenOption={handleOpenOptiontaxType}
                  onSelectOption={handleSelecttaxType}
                  options={taxTypes}
                  border={false}
                />
              </div>
            </div>

            {/* Buttons*/}
            <div className="flex items-center justify-end w-full gap-x-4">
              <div className="">
                <SubmitButton
                  text={t("Change")}
                  rounded="rounded-full"
                  handleClick={handleChangeTax}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default TaxTypePage;
