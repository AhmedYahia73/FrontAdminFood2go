import React, { useEffect } from "react";
import { TitlePage } from "../../../../Components/Components";
import DeliveredOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/DeliveredOrders/DeliveredOrdersPage";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useTranslation } from "react-i18next";

const DeliveredOrdersLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        <TitlePage text={t("DeliveredOrders")} />
        <SelectDateRangeSection
          typPage={"delivered"}
        />
        <DeliveredOrdersPage />
      </div>
    </>
  );
};

export default DeliveredOrdersLayout;
