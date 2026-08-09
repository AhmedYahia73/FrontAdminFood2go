import React from 'react'
import EditTablesPage from "../../../../Pages/Dashboard/Admin/Setting/Tables/EditTablesPage";
import { TitlePage } from '../../../../Components/Components'
import { useTranslation } from 'react-i18next';

const EditTablesLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('Edit Hall Table')} />
                     <EditTablesPage />
              </>
       )
}

export default EditTablesLayout;