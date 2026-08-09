import React, { useEffect } from "react";
import { TitlePage } from "../../../../Components/Components";
import ScheduleOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/ScheduleOrders/ScheduleOrdersPage";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { OrdersComponent } from "../../../../Store/CreateSlices";
import { useTranslation } from "react-i18next";

const ScheduleOrdersLayout = () => {
  const { t } = useTranslation();
  return (
    <>
      <OrdersComponent />
      <div className="flex flex-col w-full mb-0">
        <TitlePage text={t("ScheduleOrders")} />
        <SelectDateRangeSection
          typPage={"scheduled"}
        />
        <ScheduleOrdersPage />
      </div>
    </>
  );
};

export default ScheduleOrdersLayout;
