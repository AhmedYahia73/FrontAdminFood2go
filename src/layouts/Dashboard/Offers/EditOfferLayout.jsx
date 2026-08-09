import React from 'react'
import { TitlePage } from '../../../Components/Components'
import EditOfferPage from "../../../Pages/Dashboard/Admin/Offers/EditOfferPage";
import { useTranslation } from 'react-i18next';

const EditOfferLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditOffer')} />
                     <EditOfferPage />
              </>
       )
}

export default EditOfferLayout