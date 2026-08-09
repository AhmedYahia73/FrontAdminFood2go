import React from 'react'
import { TitlePage } from '../../../Components/Components'
import EditVoidReason from "../../../Pages/Dashboard/Admin/VoidReason/EditVoidReason";
import { useTranslation } from 'react-i18next';

const EditVoidReasonLayout = () => {
 const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('Edit Void Reason')} />
                     <EditVoidReason />
              </>
       )
}

export default EditVoidReasonLayout;