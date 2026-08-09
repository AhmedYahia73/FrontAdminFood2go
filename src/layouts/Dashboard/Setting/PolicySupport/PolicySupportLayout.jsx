import React from 'react'
import PolicySupportPage from "../../../../Pages/Dashboard/Admin/Setting/PolicySupport/PolicySupportPage";
import { TitlePage } from '../../../../Components/Components'
import { useTranslation } from 'react-i18next';

const PolicySupportLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('Policy&Support')} />
                     <PolicySupportPage />
              </>
       )
}

export default PolicySupportLayout;