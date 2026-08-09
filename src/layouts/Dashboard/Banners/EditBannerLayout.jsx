import React from 'react'
import { TitlePage } from '../../../Components/Components'
import EditBannerPage from "../../../Pages/Dashboard/Admin/Banners/EditBannerPage";
import { useTranslation } from 'react-i18next';

const EditBannerLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditBanner')} />
                     <EditBannerPage />
              </>
       )
}

export default EditBannerLayout