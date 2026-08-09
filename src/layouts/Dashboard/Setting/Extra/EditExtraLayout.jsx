import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import EditExtraPage from "../../../../Pages/Dashboard/Admin/Setting/Extra/EditExtraPage";
import { useTranslation } from 'react-i18next';

const EditExtraLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditExtra')} />
                     <EditExtraPage />
              </>
       )
}

export default EditExtraLayout;