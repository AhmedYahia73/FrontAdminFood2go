import React, { useEffect } from 'react'
import { LoaderLogin, TitlePage } from '../../../../Components/Components'
import ProcessingOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/ProcessingOrders/ProcessingOrdersPage";
import SelectDateRangeSection from "../../../../Pages/Dashboard/Admin/Orders/SelectDateRangeSection";
import { OrdersComponent } from '../../../../Store/CreateSlices'
import { useGet } from '../../../../Hooks/useGet'
import { useTranslation } from 'react-i18next';

const ProcessingOrdersLayout = () => {
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const { t, i18n } = useTranslation();

       return (
              <>
                     <OrdersComponent />
                     <div className="flex flex-col w-full mb-0">
                            <TitlePage text={t('ProcessingOrders')} />
                            <SelectDateRangeSection typPage={'Processing'} />
                            <ProcessingOrdersPage />
                     </div>
              </>
       )
}

export default ProcessingOrdersLayout