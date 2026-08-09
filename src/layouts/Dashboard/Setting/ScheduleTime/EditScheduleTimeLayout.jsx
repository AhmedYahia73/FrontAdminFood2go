import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import EditScheduleTimePage from "../../../../Pages/Dashboard/Admin/Setting/ScheduleTime/EditScheduleTimePage";
import { useTranslation } from 'react-i18next';

const EditScheduleTimeLayout = () => {
                    const { t, i18n } = useTranslation();

       return (
              <>
                     <TitlePage text={t('Edit Schedule Time')} />
                     <EditScheduleTimePage />
              </>
       )
}

export default EditScheduleTimeLayout;