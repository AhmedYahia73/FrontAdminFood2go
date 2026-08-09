import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import { useTranslation } from 'react-i18next';
import EditHallLocations from "../../../../Pages/Dashboard/Admin/Setting/HallLocations/EditHallLocations";

const EditHallLocationLayout = () => {
                  const { t } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('Edit Hall Locations')} />
                     <EditHallLocations />
              </>
       )
}

export default EditHallLocationLayout;