import React from 'react'
import { TitlePage } from '../../../Components/Components'
import EditCategoryPage from "../../../Pages/Dashboard/Admin/CategorySetup/EditCategoryPage";
import { useTranslation } from 'react-i18next';

const EditCategotyLayout = () => {
                         const { t, i18n } = useTranslation();

       return (
              <>
                     <TitlePage text={t('EditCategory')} />
                     <EditCategoryPage />
              </>
       )
}

export default EditCategotyLayout