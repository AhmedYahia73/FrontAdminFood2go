import React, { useEffect } from "react";
import { TitlePage } from "../../../../Components/Components";
import PendingOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/PendingOrders/PendingOrdersPage";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useTranslation } from "react-i18next";

const PendingOrdersLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        <TitlePage text={t('PendingOrders')} />
            <SelectDateRangeSection
              typPage={"pending"}
            />
            <PendingOrdersPage />
      </div>
    </>
  );
};

export default PendingOrdersLayout;
