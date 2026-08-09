import React, { useState } from 'react'
import AddScheduleTimeSection from "../../../../Pages/Dashboard/Admin/Setting/ScheduleTime/AddScheduleTimeSection";
import ScheduleTimePage from "../../../../Pages/Dashboard/Admin/Setting/ScheduleTime/ScheduleTimePage";
import { TitlePage, TitleSection } from '../../../../Components/Components'
import { useTranslation } from 'react-i18next';

const ScheduleTimeLayout = () => {
       const [update, setUpdate] = useState(false)
                    const { t, i18n } = useTranslation();

       return (
              <>
                     <TitlePage text={t('Add Schedule Time')} />
                     <AddScheduleTimeSection update={update} setUpdate={setUpdate}/>
                     <TitleSection text={t('Schedule Time Table')} />
                     <ScheduleTimePage refetch={update}/>
              </>
       )
}

export default ScheduleTimeLayout;