import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import EditGroupPage from "../../../../Pages/Dashboard/Admin/Setting/Group/EditGroupPage";
import { useTranslation } from 'react-i18next';

const EditGroupLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditGroup')} />
                     <EditGroupPage />
              </>
       )
}

export default EditGroupLayout;