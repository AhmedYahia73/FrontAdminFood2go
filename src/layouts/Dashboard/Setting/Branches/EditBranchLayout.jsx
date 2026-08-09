import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import EditBranchPage from "../../../../Pages/Dashboard/Admin/Setting/Branches/EditBranchPage";
import { useTranslation } from 'react-i18next';

const EditBranchLayout = () => {
                         const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditBranch')} />
                     <EditBranchPage />
              </>
       )
}

export default EditBranchLayout