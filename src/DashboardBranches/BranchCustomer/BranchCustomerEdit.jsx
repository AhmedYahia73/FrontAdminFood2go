import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import {
  DropDown,
  LoaderLogin,
  NumberInput,
  StaticButton,
  SubmitButton,
  TextInput,
} from "../../../../Components/Components";
import { useTranslation } from "react-i18next";

const EditTaxPage = () => {
  const { taxId } = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchTax,
    loading: loadingTax,
    data: dataTax,
  } = useGet({ url: `${apiUrl}/branch/address/item/${taxId}` });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/branch/address/update/${taxId}`,
  });
  const { t } = useTranslation();

  const auth = useAuth();
  const navigate = useNavigate();

  const dropDownType = useRef();

  const [taxName, setTaxName] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [taxType] = useState([
    { id: "", name: "" },
    { id: "precentage", name: t("precentage") },
    { id: "value", name: t("value") },
  ]);

  const [stateType, setStateType] = useState("Select Tax Type");
  const [typeName, setTypeName] = useState("");

  const [isOpenTaxType, setIsOpenTaxType] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false); // حالة لفتح الموديل

  useEffect(() => {
    if (dataTax) {
      setTaxName(dataTax.tax.name || "-");
      setTaxAmount(dataTax.tax.amount || "-");
      setStateType(dataTax.tax.type || "-");
      setTypeName(dataTax.tax.type || "-");
    }
  }, [dataTax]);

  const handleOpentaxType = () => {
    setIsOpenTaxType(!isOpenTaxType);
  };
  const handleOpenOptiontaxType = () => setIsOpenTaxType(false);

  const handleSelecttaxType = (option) => {
    setTypeName(option.name);
    setStateType(option.id);
  };

  useEffect(() => {
    if (response) {
      handleBack();
    }
  }, [response]);

  const handleBack = () => {
    navigate(-1, { replace: true });
  };

  const handleTaxEdit = (e) => {
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
      auth.toastError(t("selectTaxType"));
      return;
    }

    const formData = new FormData();

    formData.append("name", taxName);
    formData.append("amount", taxAmount);
    formData.append("type", typeName);

    postData(formData, t("Tax Edited Success"));
  };

  const handleOpenModal = () => {
    setIsOpenModal(true); // فتح الموديل
  };

  const handleCloseModal = () => {
    setIsOpenModal(false); // غلق الموديل
  };

  return (
    <>
      {loadingTax || loadingPost ? (
        <div className="flex items-center justify-center w-full">
          <LoaderLogin />
        </div>
      ) : (
        <>
          {/* الزر الذي يفتح الموديل */}
          <button onClick={handleOpenModal} className="text-blue-500">
            {t("Edit Tax")}
          </button>

          {/* الموديل */}
          {isOpenModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 sm:w-full max-w-lg">
                <h3 className="text-xl font-semibold">{t("Edit Tax")}</h3>

                <form onSubmit={handleTaxEdit}>
                  <div className="sm:py-3 lg:py-6">
                    <div className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row">
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
                          {t("Tax Type")}:
                        </span>
                        <DropDown
                          ref={dropDownType}
                          handleOpen={handleOpentaxType}
                          stateoption={stateType}
                          openMenu={isOpenTaxType}
                          handleOpenOption={handleOpenOptiontaxType}
                          onSelectOption={handleSelecttaxType}
                          options={taxType}
                          border={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end w-full gap-x-4">
                    <div>
                      <StaticButton
                        text={t("Cancel")}
                        handleClick={handleCloseModal} // غلق الموديل
                        bgColor="bg-transparent"
                        Color="text-mainColor"
                        border={"border-2"}
                        borderColor={"border-mainColor"}
                        rounded="rounded-full"
                      />
                    </div>
                    <div>
                      <SubmitButton
                        text={t("Edit")}
                        rounded="rounded-full"
                        handleClick={handleTaxEdit}
                      />
                    </div>
                  </div>
                </form>

                {/* زر غلق الموديل */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-2 right-2 text-gray-500"
                >
                  X
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default EditTaxPage;
