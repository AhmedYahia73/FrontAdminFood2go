import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import AddRoleSection from "../../../../Pages/Dashboard/Admin/Setting/Roles/AddRoleSection";
import { useTranslation } from 'react-i18next';

const AddRoleLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('AddRole')} />
                     <AddRoleSection />
              </>
       )
}

export default AddRoleLayout