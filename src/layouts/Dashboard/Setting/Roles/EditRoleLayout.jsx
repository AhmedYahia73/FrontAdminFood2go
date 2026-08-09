import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import EditRolePage from "../../../../Pages/Dashboard/Admin/Setting/Roles/EditRole";
import { useTranslation } from 'react-i18next';

const EditRoleLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditRole')} />
                     <EditRolePage />
              </>
       )
}

export default EditRoleLayout