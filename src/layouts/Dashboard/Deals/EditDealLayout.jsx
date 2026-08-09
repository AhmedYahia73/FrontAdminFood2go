import React from 'react'
import { TitlePage } from '../../../Components/Components'
import EditDealPage from "../../../Pages/Dashboard/Admin/Deals/EditDealPage";
import { useTranslation } from 'react-i18next';

const EditDealLayout = () => {
                  const { t, i18n } = useTranslation();

       return (
              <>
                     <TitlePage text={t('EditDeal')} />
                     <EditDealPage />
              </>
       )
}

export default EditDealLayout