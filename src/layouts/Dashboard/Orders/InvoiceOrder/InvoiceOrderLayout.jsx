import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import InvoiceOrdersPage from "../../../../Pages/Dashboard/Admin/Orders/InvoiceOrder/InvoiceOrderPage";
import { useTranslation } from 'react-i18next';

const InvoiceOrderLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('OrderInvoice')} />
                     {/* <AddPaymentMethodSection /> */}
                     {/* <TitleSection text={'Payment Methods Table'} /> */}
                     <InvoiceOrdersPage />
              </>
       )
}

export default InvoiceOrderLayout