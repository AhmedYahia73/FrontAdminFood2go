import React, { useEffect, useState } from 'react'
import { TitlePage, TitleSection } from '../../../../Components/Components'
import AddRoleSection from "../../../../Pages/Dashboard/Admin/Setting/Roles/AddRoleSection";
import RolesPage from "../../../../Pages/Dashboard/Admin/Setting/Roles/RolesPage";
import AddButton from '../../../../Components/Buttons/AddButton'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

const RolesLayout = () => {
  const [update, setUpdate] = useState(false)
             const { t, i18n } = useTranslation();
  
  return (
    <>
      <div className='flex flex-col items-center justify-between md:flex-row'>
        <div className='w-full md:w-1/2'>
          <TitlePage text={t('RolesTable')} />
        </div>
        <div className='flex justify-end w-full py-4 md:w-1/2'>
          <Link to='add'>
            <AddButton Text={t("AddNewRole")} />
          </Link>
        </div>
      </div>
      <RolesPage update={update} setUpdate={setUpdate} />
    </>
  )
}

export default RolesLayout;