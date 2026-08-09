import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../../Components/Components'
import AddGroupPage from "../../../../Pages/Dashboard/Admin/Setting/Group/AddGroupPage";
import GroupPage from "../../../../Pages/Dashboard/Admin/Setting/Group/GroupPage";
import { useTranslation } from 'react-i18next';

const GroupLayout = () => {
  const [update, setUpdate] = useState(false)
             const { t, i18n } = useTranslation();
  
  return (
    <>
      <TitlePage text={t('AddNewGroup')} />
      <AddGroupPage update={update} setUpdate={setUpdate} />
      <TitleSection text={t('GroupsTable')} />
      <GroupPage refetch={update} />
    </>
  )
}

export default GroupLayout;