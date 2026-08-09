import React from "react";
import { Outlet } from "react-router-dom";
import { TitlePage } from "../../../Components/Components";
import OrdersPaymentNav from "./OrdersPaymentNav";
import { useTranslation } from "react-i18next";

const OrderPaymentLayout = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <div className="flex flex-col w-full mb-0">
        <TitlePage text={t("OrdersPayment")} />
        <OrdersPaymentNav />
        <div className="mt-5">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default OrderPaymentLayout;
