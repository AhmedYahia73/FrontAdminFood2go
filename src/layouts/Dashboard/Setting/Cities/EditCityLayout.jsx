import React from 'react'
import EditCityPage from "../../../../Pages/Dashboard/Admin/Setting/Cities/EditCityPage";
import { TitlePage } from '../../../../Components/Components'
import { useTranslation } from 'react-i18next';

const EditCityLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditCity')} />
                     <EditCityPage />
              </>
       )
}

export default EditCityLayout