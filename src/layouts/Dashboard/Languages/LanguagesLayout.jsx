import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../Components/Components'
import AddLanguagesSection from "../../../Pages/Dashboard/Admin/Languages/AddLanguageSection";
import LanguagesPage from "../../../Pages/Dashboard/Admin/Languages/LanguagesPage";
import { useTranslation } from 'react-i18next';

const LanguagesLayout = () => {
  const [update, setUpdate] = useState(false)
             const { t, i18n } = useTranslation();
  
  return (
    <>
      <TitlePage text={t('Addlanguage')} />
      <AddLanguagesSection update={update} setUpdate={setUpdate} />
      <TitleSection text={t('LanguagesTable')} />
      <LanguagesPage refetch={update} />
    </>
  )
}

export default LanguagesLayout