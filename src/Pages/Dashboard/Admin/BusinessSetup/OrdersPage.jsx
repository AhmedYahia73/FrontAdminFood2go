import { useEffect, useState } from "react";
import {
  LoaderLogin,
  NumberInput,
  StaticButton,
  SubmitButton,
  TitleSection,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useTranslation } from "react-i18next";

const OrdersPage = () => {
  const [minOrderValue, setMinOrderValue] = useState("");
  const { t, i18n } = useTranslation();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchOrder,
    loading: loadingOrder,
    data: dataOrder,
  } = useGet({
    url: `${apiUrl}/admin/settings/business_setup/order_setting`,
  });
  const [Order, setOrder] = useState([]);

  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/business_setup/order_setting/add `,
  });
  useEffect(() => {
    refetchOrder();
  }, [refetchOrder]);

  useEffect(() => {
    if (dataOrder) {
      setOrder(dataOrder);
      const setting = JSON.parse(dataOrder.order_setting.setting);
      setMinOrderValue(setting.min_order);
    }
  }, [dataOrder]);

  const handleReset = () => {
    setMinOrderValue("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("min_price", minOrderValue);
    postData(formData, t("order Added Successfully"));
  };

  return (
    <>
      {loadingOrder || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <LoaderLogin />
          </div>
        </>
      ) : (
        <form
          className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row"
          onSubmit={handleSubmit}
        >
          <TitleSection text={t("OrderSettings")} />

          {/* Min Order Value */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
            {t('Min Order value')}   (E£):
            </span>
            <NumberInput
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              placeholder={t("MinOrderValue")}
            />
          </div>
          {/* Buttons */}
          <div className="flex items-center justify-end w-full gap-x-4 ">
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
                text={t("Reset")}
                rounded="rounded-full"
                handleClick={handleSubmit}
              />
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default OrdersPage;
