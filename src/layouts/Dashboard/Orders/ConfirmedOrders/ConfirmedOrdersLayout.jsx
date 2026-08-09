import React, { useEffect } from "react";
import { TitlePage } from "../../../../Components/Components";
import ConfirmedOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/ConfirmedOrders/ConfirmedOrdersPage";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useTranslation } from "react-i18next";

const ConfirmedOrdersLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        <TitlePage text={t("ConfirmedOrders")} />
            <SelectDateRangeSection
              typPage={"confirmed"}
            />
            <ConfirmedOrdersPage />
      </div>
    </>
  );
};

export default ConfirmedOrdersLayout;
