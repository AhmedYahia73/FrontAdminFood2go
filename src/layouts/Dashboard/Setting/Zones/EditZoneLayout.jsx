import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import EditZonePage from "../../../../Pages/Dashboard/Admin/Setting/Zones/EditZonePage";
import { useTranslation } from 'react-i18next';

const EditZoneLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditZone')} />
                     <EditZonePage />
              </>
       )
}

export default EditZoneLayout