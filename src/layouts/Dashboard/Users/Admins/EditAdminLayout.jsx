import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import EditAdminPage from "../../../../Pages/Dashboard/Admin/Users/Admins/EditAdminPage";
import { useTranslation } from 'react-i18next';

const EditAdminLayout = () => {
                    const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditAdmin')} />
                     <EditAdminPage />
              </>
       )
}

export default EditAdminLayout