import React from 'react'
import DealOrderPage from "../../../Pages/Dashboard/Admin/DealOrder/DealOrderPage";
import { TitlePage } from '../../../Components/Components'
import { useTranslation } from 'react-i18next';

const DealOrderLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('DealOrder')} />
                     <DealOrderPage />
              </>
       )
}

export default DealOrderLayout