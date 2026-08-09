import React, { useEffect } from 'react'
import { TitlePage } from '../../../../Components/Components'
import ReturnedOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/ReturnedOrders/ReturnedOrdersPage";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { OrdersComponent } from '../../../../Store/CreateSlices'
import { useTranslation } from 'react-i18next';

const ReturnedOrdersLayout = () => {
       const { t } = useTranslation();

       return (
              <>
                     <OrdersComponent />
                     <div className="flex flex-col w-full mb-0">
                            <TitlePage text={t('ReturnedOrders')} />
                            <SelectDateRangeSection typPage={'re-turned'} />
                            <ReturnedOrdersPage />
                     </div>
              </>
       )
}

export default ReturnedOrdersLayout