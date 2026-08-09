import React, { useEffect } from "react";
import { TitlePage } from "../../../../Components/Components";
import FailedOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/FailedOrders/FailedOrdersPage";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useTranslation } from "react-i18next";

const FailedOrdersLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        <TitlePage text={t("FailedOrders")} />
        <SelectDateRangeSection
          typPage={"faild_to_deliver"}
        />
        <FailedOrdersPage />
      </div>
    </>
  );
};

export default FailedOrdersLayout;
