import React, { useEffect, useRef, useState } from "react";
import {
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
  UploadInput,
  NumberInput,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";

const AddPaymentMethodSection = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/payment_methods/add`,
  });
  const { t, i18n } = useTranslation();

  const ImageRef = useRef();
  const auth = useAuth();

  const [paymentMethodName, setPaymentMethodName] = useState("");
  const [paymentMethodDescription, setPaymentMethodDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [paymentMethodStatus, setPaymentMethodStatus] = useState(0);
  const [feeStatus, setFeeStatus] = useState(0);
  const [feeAmount, setFeeAmount] = useState("");
  const [order, setOrder] = useState("");

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

  const handlePaymentMethodStatus = () => {
    const currentState = paymentMethodStatus;
    {
      currentState === 0
        ? setPaymentMethodStatus(1)
        : setPaymentMethodStatus(0);
    }
  };

  const handleFeeStatus = () => {
    const currentState = feeStatus;
    if (currentState === 0) {
      setFeeStatus(1);
    } else {
      setFeeStatus(0);
      setFeeAmount(""); // Reset fee amount when disabling fees
    }
  };

  useEffect(() => {
    if (!loadingPost) {
      handleReset();
    }
    setUpdate(!update);
  }, [response]);

  const handleReset = () => {
    setPaymentMethodName("");
    setPaymentMethodDescription("");
    setImage("");
    setImageFile(null);
    setPaymentMethodStatus(0);
    setFeeStatus(0);
    setFeeAmount("");
    setOrder("");
  };

  const handlePaymentMethodAdd = (e) => {
    e.preventDefault();

    if (!paymentMethodName) {
      auth.toastError(t("enterPaymentMethodName"));
      return;
    }
    if (!paymentMethodDescription) {
      auth.toastError(t("enterPaymentMethodDescription"));
      return;
    }
    if (!imageFile) {
      auth.toastError(t("setPaymentMethodImage"));
      return;
    }
    if (feeStatus === 1 && (!feeAmount || feeAmount <= 0)) {
      auth.toastError(t("enterValidFeeAmount"));
      return;
    }
    if (!order || isNaN(order)) {
      auth.toastError(t("enterValidOrderNumber"));
      return;
    }

    const formData = new FormData();

    formData.append("name", paymentMethodName);
    formData.append("description", paymentMethodDescription);
    formData.append("logo", imageFile);
    formData.append("status", paymentMethodStatus);
    formData.append("feez_status", feeStatus);
    formData.append("feez_amount", feeAmount || 0);
    formData.append("order", order);

    postData(formData, "Payment Method Added Success");
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
          <form onSubmit={handlePaymentMethodAdd}>
            <div className="sm:py-3 lg:py-6">
              <div className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row">
                {/* Name Input */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("paymentMethodName")}:
                  </span>
                  <TextInput
                    value={paymentMethodName}
                    onChange={(e) => setPaymentMethodName(e.target.value)}
                    placeholder={t("paymentMethodName")}
                  />
                </div>
                {/* Order Key Input */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("OrderNumber")}:
                  </span>
                  <NumberInput
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder={t("OrderNumber")}
                  />
                </div>
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("paymentMethodDescription")}:
                  </span>
                  <TextInput
                    value={paymentMethodDescription}
                    onChange={(e) =>
                      setPaymentMethodDescription(e.target.value)
                    }
                    placeholder={t("paymentMethodDescription")}
                  />
                </div>
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("PaymentMethodImage")}:
                  </span>
                  <UploadInput
                    value={image}
                    uploadFileRef={ImageRef}
                    placeholder={t("PaymentMethodImage")}
                    handleFileChange={handleImageChange}
                    onChange={(e) => setImage(e.target.value)}
                    onClick={() => handleImageClick(ImageRef)}
                  />
                </div>
                
                {/* Fee Status and Amount */}
                <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-8">
                  <div className="flex items-center justify-start w-2/4 gap-x-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("Status")}:
                    </span>
                    <Switch
                      handleClick={handlePaymentMethodStatus}
                      checked={paymentMethodStatus}
                    />
                  </div>
                </div>

                <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-4">
                  <div className="flex items-center justify-start w-2/4 gap-x-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("FeeStatus")}:
                    </span>
                    <Switch
                      handleClick={handleFeeStatus}
                      checked={feeStatus}
                    />
                  </div>
                </div>

                {/* Fee Amount Input - Only show when feeStatus is 1 */}
                {feeStatus === 1 && (
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("FeeAmount")}:
                    </span>
                    <NumberInput
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      placeholder={t("FeeAmount")}
                    />
                  </div>
                )}
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
                  handleClick={handlePaymentMethodAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddPaymentMethodSection;