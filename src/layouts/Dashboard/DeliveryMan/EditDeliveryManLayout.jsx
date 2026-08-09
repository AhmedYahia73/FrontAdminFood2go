import React from 'react'
import { TitlePage } from '../../../Components/Components'
import EditDeliveryManPage from "../../../Pages/Dashboard/Admin/DeliveryMan/EditDeliveryManPage";
import { useTranslation } from 'react-i18next';

const EditDeliveryManLayout = () => {
             const { t, i18n } = useTranslation();
  
  return (
    <>
      <TitlePage text={t('EditDeliveryMan')} />
      <EditDeliveryManPage />
    </>
  )
}

export default EditDeliveryManLayout