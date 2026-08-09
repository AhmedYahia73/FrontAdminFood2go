import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import AppSetupPage from "../../../../Pages/Dashboard/Admin/Setting/AppSetup/AppSetupPage";
import { useTranslation } from 'react-i18next';

const AppSetupLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('AppSetup')} />
                     <AppSetupPage />
              </>
       )
}

export default AppSetupLayout;