import React, { useEffect, useState } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import {
  LoaderLogin,
  SubmitButton,
  TextInput,
} from "../../../../../Components/Components";
import { useTranslation } from "react-i18next";

const DeliveryTimePage = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchDeliveryTime,
    loading: loadingDeliveryTime,
    data: dataDeliveryTime,
  } = useGet({
    url: `${apiUrl}/admin/settings/delivery_time`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/delivery_time_update`,
  });

  const [deliveryTime, setDeliveryTime] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    refetchDeliveryTime();
  }, [refetchDeliveryTime]);

  useEffect(() => {
    if (dataDeliveryTime && dataDeliveryTime.delivery_time) {
      setDeliveryTime(dataDeliveryTime.delivery_time.setting || "");
    }
  }, [dataDeliveryTime]); // Only run this effect when `data` changes

  const handleChangeDeliveryTime = (e) => {
    e.preventDefault();

    if (!deliveryTime) {
      auth.toastError(t("please Enter Delivery Time"));
      return;
    }

    const formData = new FormData();

    formData.append("delivery_time", deliveryTime);

    postData(formData, t("Delivery Time Changed Success"));
  };
  return (
    <>
      {loadingPost || loadingDeliveryTime ? (
        <>
          <div className="flex items-center justify-center w-full">
            <LoaderLogin />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleChangeDeliveryTime}>
            <div className="flex flex-wrap items-center justify-start w-full gap-4 mb-4 sm:flex-col lg:flex-row">
              {/* Tax Types */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Time")}:
                </span>
                <TextInput
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder={t("Delivery Time")}
                />
              </div>
            </div>

            {/* Buttons*/}
            <div className="flex items-center justify-end w-full gap-x-4">
              <div className="">
                <SubmitButton
                  text={t("Change")}
                  rounded="rounded-full"
                  handleClick={handleChangeDeliveryTime}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default DeliveryTimePage;
