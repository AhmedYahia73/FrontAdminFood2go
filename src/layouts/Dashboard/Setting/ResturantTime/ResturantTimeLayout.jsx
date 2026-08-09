import React from 'react'
import ResturantTimePage from "../../../../Pages/Dashboard/Admin/Setting/ResturantTime/ResturantTimePage";
import { TitlePage } from '../../../../Components/Components'
import { useTranslation } from 'react-i18next';

const ResturantTimeLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('ResturantTime')} />
                     <ResturantTimePage />
              </>
       )
}

export default ResturantTimeLayout