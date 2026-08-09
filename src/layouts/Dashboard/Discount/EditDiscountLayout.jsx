import React from 'react'
import { TitlePage } from '../../../Components/Components'
import EditDiscountPage from "../../../Pages/Dashboard/Admin/Discount/EditDiscountPage";
import { useTranslation } from 'react-i18next';

const EditDiscountLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditDiscount')} />
                     <EditDiscountPage />
              </>
       )
}

export default EditDiscountLayout