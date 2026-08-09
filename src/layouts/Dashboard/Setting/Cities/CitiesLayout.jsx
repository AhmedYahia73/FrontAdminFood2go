import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../../Components/Components'
import AddCitySection from "../../../../Pages/Dashboard/Admin/Setting/Cities/addCitySection";
import CitiesPage from "../../../../Pages/Dashboard/Admin/Setting/Cities/CitiesPage";
import { useTranslation } from 'react-i18next';

const CitiesLayout = () => {
             const { t, i18n } = useTranslation();
  
  const [update, setUpdate] = useState(false)
  return (
    <>
      <TitlePage text={t('AddNewCity')} />
      <AddCitySection update={update} setUpdate={setUpdate} />
      <TitleSection text={t('CitiesTable')} />
      <CitiesPage refetch={update} />
    </>
  )
}

export default CitiesLayout