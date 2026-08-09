import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import EditPaymentMethodPage from "../../../../Pages/Dashboard/Admin/Setting/PaymentMethod/EditPaymentMethodPage";
import { useTranslation } from 'react-i18next';

const EditPaymentMethodLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditPaymentMethod')} />
                     <EditPaymentMethodPage />
              </>
       )
}

export default EditPaymentMethodLayout