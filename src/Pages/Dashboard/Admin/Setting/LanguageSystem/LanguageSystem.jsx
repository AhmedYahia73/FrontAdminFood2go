import React, { useEffect, useState } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson"; // This is your custom hook
import { LoaderLogin, Switch } from "../../../../../Components/Components";
import { useTranslation } from "react-i18next";

const LanguageSystem = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();

  // Fetch current settings
  const {
    refetch: refetchSettings,
    loading: loadingSettings,
    data: settingsData,
  } = useGet({
    url: `${apiUrl}/admin/settings/lang_setting`,
  });

  // usePost hook for updating settings
  const { postData, loadingPost } = usePost({
    url: `${apiUrl}/admin/settings/lang_setting/update`,
    type: false, // false = multipart/form-data (safe for strings)
  });

  // Local state for each language
  const [bristaLang, setBristaLang] = useState("en");
  const [kitchenLang, setKitchenLang] = useState("en");
  const [cashierLang, setCashierLang] = useState("en");
  const [preparationLang, setPreparationLang] = useState("en");
  const [orderLang, setLangOrder] = useState("en");

  // Load data on mount
  useEffect(() => {
    refetchSettings();
  }, [refetchSettings]);

  // Update local state when data loads
  useEffect(() => {
    if (settingsData) {
      setBristaLang(settingsData.brista_lang || "en");
      setKitchenLang(settingsData.kitchen_lang || "en");
      setCashierLang(settingsData.cashier_lang || "en");
      setPreparationLang(settingsData.preparation_lang || "en");
      setLangOrder(settingsData.order_lang || "en");
    }
  }, [settingsData]);

  // Generic handler to toggle language and send update
  const handleLangChange = async (key, currentValue) => {
    const newValue = currentValue === "ar" ? "en" : "ar";

    const formData = new FormData();
    formData.append(key, newValue);

    const success = await postData(
      formData,
      t("Language updated successfully")
    );

    if (success) {
      // Only update local state if API call succeeded
      switch (key) {
        case "brista_lang":
          setBristaLang(newValue);
          break;
        case "kitchen_lang":
          setKitchenLang(newValue);
          break;
        case "cashier_lang":
          setCashierLang(newValue);
          break;
        case "preparation_lang":
          setPreparationLang(newValue);
          break;
        case "order_lang":
          setLangOrder(newValue);
          break;
      }
    }
  };

  // Show loader during fetch or update
  if (loadingSettings || loadingPost) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <LoaderLogin />
      </div>
    );
  }

  return (
    <section className="w-full p-6 bg-white border shadow-sm rounded-xl">
      <h2 className="mb-8 text-2xl font-TextFontSemiBold text-mainColor">
        {t("System Language Settings")}
      </h2>

      <div className="space-y-6">
        {/* Brista App */}
        <div className="flex items-center justify-between p-4 transition rounded-lg bg-gray-50 hover:bg-gray-100">
          <div className="flex items-center gap-4">
            <Switch
              checked={bristaLang === "ar"}
              handleClick={() => handleLangChange("brista_lang", bristaLang)}
              disabled={loadingPost}
            />
            <div>
              <p className="font-TextFontMedium text-thirdColor">
                {t("Brista App Language")}
              </p>
              <p className="text-sm text-gray-500">
                {bristaLang === "ar" ? t("Arabic") : t("English")}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${bristaLang === "ar"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
              }`}
          >
            {bristaLang.toUpperCase()}
          </span>
        </div>

        {/* Kitchen Display */}
        <div className="flex items-center justify-between p-4 transition rounded-lg bg-gray-50 hover:bg-gray-100">
          <div className="flex items-center gap-4">
            <Switch
              checked={kitchenLang === "ar"}
              handleClick={() => handleLangChange("kitchen_lang", kitchenLang)}
              disabled={loadingPost}
            />
            <div>
              <p className="font-TextFontMedium text-thirdColor">
                {t("Kitchen Display Language")}
              </p>
              <p className="text-sm text-gray-500">
                {kitchenLang === "ar" ? t("Arabic") : t("English")}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${kitchenLang === "ar"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
              }`}
          >
            {kitchenLang.toUpperCase()}
          </span>
        </div>

        {/* Cashier App */}
        <div className="flex items-center justify-between p-4 transition rounded-lg bg-gray-50 hover:bg-gray-100">
          <div className="flex items-center gap-4">
            <Switch
              checked={cashierLang === "ar"}
              handleClick={() => handleLangChange("cashier_lang", cashierLang)}
              disabled={loadingPost}
            />
            <div>
              <p className="font-TextFontMedium text-thirdColor">
                {t("Cashier App Language")}
              </p>
              <p className="text-sm text-gray-500">
                {cashierLang === "ar" ? t("Arabic") : t("English")}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${cashierLang === "ar"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
              }`}
          >
            {cashierLang.toUpperCase()}
          </span>
        </div>

        {/* Preparation Screen */}
        <div className="flex items-center justify-between p-4 transition rounded-lg bg-gray-50 hover:bg-gray-100">
          <div className="flex items-center gap-4">
            <Switch
              checked={preparationLang === "ar"}
              handleClick={() =>
                handleLangChange("preparation_lang", preparationLang)
              }
              disabled={loadingPost}
            />
            <div>
              <p className="font-TextFontMedium text-thirdColor">
                {t("Preparation Screen Language")}
              </p>
              <p className="text-sm text-gray-500">
                {preparationLang === "ar" ? t("Arabic") : t("English")}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${preparationLang === "ar"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
              }`}
          >
            {preparationLang.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Order Screen */}
      <div className="flex items-center justify-between p-4 transition rounded-lg bg-gray-50 hover:bg-gray-100">
        <div className="flex items-center gap-4">
          <Switch
            checked={orderLang === "ar"}
            handleClick={() => handleLangChange("order_lang", orderLang)}
            disabled={loadingPost}
          />
          <div>
            <p className="font-TextFontMedium text-thirdColor">
              {t("Order Screen Language")}
            </p>
            <p className="text-sm text-gray-500">
              {orderLang === "ar" ? t("Arabic") : t("English")}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${orderLang === "ar"
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700"
            }`}
        >
          {orderLang.toUpperCase()}
        </span>
      </div>

      <div className="mt-8 text-sm text-center text-gray-500">
        {t(
          "These settings control the default language for each system module."
        )}
      </div>
    </section>
  );
};

export default LanguageSystem;
