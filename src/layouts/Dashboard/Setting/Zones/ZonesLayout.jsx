import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../../Components/Components'
import AddZoneSection from "../../../../Pages/Dashboard/Admin/Setting/Zones/addZoneSection";
import ZonesPage from "../../../../Pages/Dashboard/Admin/Setting/Zones/ZonesPage";
import { useTranslation } from 'react-i18next';

const ZonesLayout = () => {
  const [update, setUpdate] = useState(false)
             const { t, i18n } = useTranslation();
  
  return (
    <>
      <TitlePage text={t('AddNewZone')} />
      <AddZoneSection update={update} setUpdate={setUpdate} />
      <TitleSection text={t('ZonesTable')} />
      <ZonesPage refetch={update} />
    </>
  )
}

export default ZonesLayout