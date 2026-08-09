import React from 'react'
import { Outlet } from 'react-router-dom'
import BusinessSetupNav from './BusinessSetupNav'
import { TitlePage } from '../../../Components/Components'
import { useTranslation } from 'react-i18next';

const BusinessSetupLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return(
              <>
                     <div className="flex flex-col w-full mb-0">
                            <TitlePage text={t('BusinessSetup')} />
                            <BusinessSetupNav />
                            <div className="mt-5">
                                   <Outlet />
                            </div>
                     </div>
              </>
       )
}

export default BusinessSetupLayout