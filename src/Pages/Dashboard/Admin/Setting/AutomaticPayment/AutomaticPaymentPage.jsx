import React, { useEffect, useRef, useState } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import {
  Switch,
  TextInput,
  UploadInput,
  StaticLoader,
  SubmitButton,
  DropDown,
} from "../../../../../Components/Components";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useTranslation } from "react-i18next";
import GeideaPayment from "./GeideaPayment";

const AutomaticPaymentPage = ({ refetch }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchAutomaticPayment,
    loading: loadingAutomaticPayment,
    data: dataAutomaticPayment,
  } = useGet({
    url: `${apiUrl}/admin/settings/payment_methods_auto`,
  });

  const [automaticPayments, setAutomaticPayments] = useState([]);
  const [currentTap, setCurrentTap] = useState(0);
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/payment_methods_auto/update/${automaticPayments[currentTap]?.id || 0
      }`,
  });

  const { changeState, loadingChange, responseChange } = useChangeState();
  const { t, i18n } = useTranslation();

  // Form State
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const LogoRef = useRef();

  const [paymobTitle, setPaymobTitle] = useState("");
  const [paymobType, setPaymobType] = useState("");
  const [paymobCallBackUrl, setPaymobCallBackUrl] = useState("");
  const [paymobApiKey, setPaymobApiKey] = useState("");
  const [paymobIframeId, setPaymobIframeId] = useState("");
  const [paymobIntegrationId, setPaymobIntegrationId] = useState("");
  const [paymobHmac, setPaymobHmac] = useState("");

  const [statePaymentType, setStatePaymentType] = useState(
    t("Select Payment Type")
  );
  const [paymentType, setPaymentType] = useState([
    { name: t("Live") },
    { name: t("Test") },
  ]);
  const [paymentTypeName, setPaymentTypeName] = useState("");
  const [isOpenPaymentType, setIsOpenPaymentType] = useState(false);
  const dropDownPaymentType = useRef();

  useEffect(() => {
    refetchAutomaticPayment();
  }, [refetchAutomaticPayment, refetch]);

  useEffect(() => {
    if (dataAutomaticPayment && dataAutomaticPayment.payment_methods) {
      let methods = [...dataAutomaticPayment.payment_methods];

      // Always ensure Geidea is in the list even if API doesn't return it
      const hasGeidea = methods.some((p) =>
        p.name?.toLowerCase().includes("geidea")
      );
      if (!hasGeidea) {
        methods.push({
          id: "geidea-fallback",
          name: "Geidea",
          payment_method_data: null, // This triggers the GeideaPayment component logic
          status: 0,
          logo_link: "",
        });
      }

      setAutomaticPayments(methods);

      const currentPayment = methods[currentTap];
      if (currentPayment) {
        setLogo(currentPayment.logo_link || "");
        setLogoFile(currentPayment.logo_link || null);

        // Only populate Paymob fields when payment_method_data exists (tab 0/Paymob)
        if (currentPayment.payment_method_data) {
          setPaymobTitle(currentPayment.payment_method_data.title || "");
          setPaymobCallBackUrl(currentPayment.payment_method_data.callback || "");
          setPaymobApiKey(currentPayment.payment_method_data.api_key || "");
          setPaymobIframeId(currentPayment.payment_method_data.iframe_id || "");
          setPaymobIntegrationId(
            currentPayment.payment_method_data.integration_id || ""
          );
          setPaymobHmac(currentPayment.payment_method_data.Hmac || "");

          if (currentPayment.payment_method_data.type === "test") {
            setStatePaymentType("Test");
            setPaymentTypeName("Test");
          } else if (currentPayment.payment_method_data.type === "live") {
            setStatePaymentType("Live");
            setPaymentTypeName("Live");
          } else {
            setStatePaymentType("Select Payment Type");
            setPaymentTypeName("Select Payment Type");
          }
        }
      }
    }
  }, [dataAutomaticPayment, currentTap]);

  const handleTap = (index) => {
    setCurrentTap(index);
  };

  const handleOpenPaymentType = () => {
    setIsOpenPaymentType(!isOpenPaymentType);
  };

  const handleOpenOptionPaymentType = () => setIsOpenPaymentType(false);

  const handleSelectPaymentType = (option) => {
    setStatePaymentType(option.name);
    setPaymentTypeName(option.name);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogo(file.name);
    }
  };

  const handleImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  // Change Payment status
  const handleChangeStaus = async (id, name, status) => {
    const response = await changeState(
      ` ${apiUrl}/admin/settings/payment_methods_auto/status/${id}`,
      `${name} Changed Status.`,
      { status } // Pass status as an object if changeState expects an object
    );

    if (response) {
      // Update categories only if changeState succeeded
      setAutomaticPayments((prevPayment) =>
        prevPayment.map((payment) =>
          payment.id === id ? { ...payment, status: status } : payment
        )
      );
    }
  };

  const handleAutomaticPaymentEdit = (e) => {
    e.preventDefault();

    const paymentId = automaticPayments[currentTap]?.id; // Get current payment method ID
    if (!paymentId) {
      console.error("Payment ID is not available");
      return;
    }

    const formData = new FormData();
    formData.append("logo", logoFile);
    formData.append("title", paymobTitle);
    // formData.append('type', paymobType);
    formData.append("type", paymentTypeName);
    formData.append("callback", paymobCallBackUrl);
    formData.append("api_key", paymobApiKey);
    formData.append("iframe_id", paymobIframeId);
    formData.append("integration_id", paymobIntegrationId);
    formData.append("Hmac", paymobHmac);
    formData.append("payment_method_id", paymentId);

    postData(
      formData,
      `${automaticPayments[currentTap]?.name} Updated Successfully`
    );
  };

  return (
    <>
      {loadingAutomaticPayment || loadingPost ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <section className="w-full">
          {/* Tabs */}
          <div className="flex items-center justify-start w-full py-2 gap-x-6 border-b border-gray-200">
            {automaticPayments.map((payment, index) => (
              <span
                key={payment.id}
                onClick={() => handleTap(index)}
                className={`${currentTap === index
                  ? "text-mainColor border-b-4 border-mainColor"
                  : "text-thirdColor"
                  } pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
              >
                {payment.name}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="w-full mt-4">
            {/* Tab [0] — Paymob / Visa */}
            {currentTap === 0 && (
              <form onSubmit={handleAutomaticPaymentEdit}>
                <div className="flex flex-wrap items-center justify-start w-full gap-4">
                  <div className="flex items-center w-full gap-x-4">
                    <div className="flex items-center">
                      <span className="p-2 text-2xl font-TextFontSemiBold text-mainColor">
                        {automaticPayments[0]?.name}:
                      </span>
                      <Switch
                        checked={automaticPayments[0]?.status === 1}
                        handleClick={() => {
                          handleChangeStaus(
                            automaticPayments[0]?.id,
                            automaticPayments[0]?.name,
                            automaticPayments[0]?.status === 1 ? 0 : 1
                          );
                        }}
                      />
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={automaticPayments[0]?.logo_link}
                        className="border-2 rounded-full bg-mainColor min-w-24 min-h-24 max-w-24 max-h-24 object-cover"
                        alt="Logo"
                      />
                    </div>
                  </div>
                  {/* Form Inputs */}
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("PaymobLogo")}
                    </span>
                    <UploadInput
                      value={logo}
                      uploadFileRef={LogoRef}
                      placeholder={t("PaymobLogo")}
                      handleFileChange={handleImageChange}
                      onClick={() => handleImageClick(LogoRef)}
                    />
                  </div>
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("PaymobTitle")}:
                    </span>
                    <TextInput
                      value={paymobTitle}
                      onChange={(e) => setPaymobTitle(e.target.value)}
                      placeholder={t("PaymobTitle")}
                    />
                  </div>
                  {/* Type Input */}
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("PaymentType")}:
                    </span>
                    <DropDown
                      ref={dropDownPaymentType}
                      handleOpen={handleOpenPaymentType}
                      stateoption={statePaymentType}
                      openMenu={isOpenPaymentType}
                      handleOpenOption={handleOpenOptionPaymentType}
                      options={paymentType}
                      onSelectOption={handleSelectPaymentType}
                      border={false}
                    />
                  </div>
                  {/* CallBack Url Input */}
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("PaymobCallBackUrl")}:
                    </span>
                    <TextInput
                      value={paymobCallBackUrl}
                      onChange={(e) => setPaymobCallBackUrl(e.target.value)}
                      placeholder={t("PaymobCallBackUrl")}
                    />
                  </div>
                  {/* Api Key Input */}
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("PaymobApiKey")}:
                    </span>
                    <TextInput
                      value={paymobApiKey}
                      onChange={(e) => setPaymobApiKey(e.target.value)}
                      placeholder={t("PaymobApiKey")}
                    />
                  </div>
                  {/* Iframe Id Input */}
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("PaymobIframeId")}:
                    </span>
                    <TextInput
                      value={paymobIframeId}
                      onChange={(e) => setPaymobIframeId(e.target.value)}
                      placeholder={t("PaymobIframeId")}
                    />
                  </div>
                  {/* Integration Id Input */}
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("PaymobIntegrationId")}:
                    </span>
                    <TextInput
                      value={paymobIntegrationId}
                      onChange={(e) => setPaymobIntegrationId(e.target.value)}
                      placeholder={t("PaymobIntegrationId")}
                    />
                  </div>
                  {/* Hmac Input */}
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("PaymobHmac")}:
                    </span>
                    <TextInput
                      value={paymobHmac}
                      onChange={(e) => setPaymobHmac(e.target.value)}
                      placeholder={t("PaymobHmac")}
                    />
                  </div>
                </div>

                {/* Submit button — only for Paymob tab */}
                <div className="flex items-center justify-end w-full gap-x-4 mt-6">
                  <div className="">
                    <SubmitButton
                      text={t("Edit")}
                      rounded="rounded-full"
                      handleClick={handleAutomaticPaymentEdit}
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Tab [1+] — Geidea (has its own submit button) */}
            {currentTap !== 0 && (
              <GeideaPayment
                payment={automaticPayments[currentTap]}
                refetch={refetchAutomaticPayment}
                onStatusChange={(id, newStatus) => {
                  setAutomaticPayments((prev) =>
                    prev.map((p) =>
                      p.id === id ? { ...p, status: newStatus } : p
                    )
                  );
                }}
              />
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default AutomaticPaymentPage;
