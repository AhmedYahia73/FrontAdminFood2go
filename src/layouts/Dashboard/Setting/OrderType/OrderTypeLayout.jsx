import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import OrderTypePage from "../../../../Pages/Dashboard/Admin/Setting/OrderType/OrderTypePage";
import { useTranslation } from 'react-i18next';

const OrderTypeLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('OrderType')} />
                     <OrderTypePage />
              </>
       )
}

export default OrderTypeLayout