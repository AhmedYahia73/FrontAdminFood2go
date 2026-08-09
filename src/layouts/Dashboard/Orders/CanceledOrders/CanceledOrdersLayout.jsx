import React, { useEffect } from "react";
import { TitlePage } from "../../../../Components/Components";
import CanceledOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/CanceledOrders/CanceledOrdersPage";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useTranslation } from "react-i18next";

const CanceledOrdersLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        <TitlePage text={t("CanceledOrders")} />
        <SelectDateRangeSection
          typPage={"canceled"}
        />
        <CanceledOrdersPage />
    </div >
    </>
  );
};

export default CanceledOrdersLayout;
