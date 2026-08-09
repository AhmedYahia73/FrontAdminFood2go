import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../../Components/Components'
import AddExtraPage from "../../../../Pages/Dashboard/Admin/Setting/Extra/AddExtraPage";
import ExtraPage from "../../../../Pages/Dashboard/Admin/Setting/Extra/ExtraPage";
import { useTranslation } from 'react-i18next';

const ExtraLayout = () => {
  const [update, setUpdate] = useState(false)
             const { t, i18n } = useTranslation();
  
  return (
    <>
      <TitlePage text={t('AddNewExtra')} />
      <AddExtraPage update={update} setUpdate={setUpdate} />
      <TitleSection text={t('ExtraTable')} />
      <ExtraPage refetch={update} />
    </>
  )
}

export default ExtraLayout;