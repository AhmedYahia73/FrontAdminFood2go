import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import { useTranslation } from 'react-i18next';
import AddHallLocations from "../../../../Pages/Dashboard/Admin/Setting/HallLocations/AddHallLocations";

const AddHallLocationsLayout = () => {
                  const { t } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('Add Hall Locations')} />
                     <AddHallLocations />
              </>
       )
}

export default AddHallLocationsLayout;