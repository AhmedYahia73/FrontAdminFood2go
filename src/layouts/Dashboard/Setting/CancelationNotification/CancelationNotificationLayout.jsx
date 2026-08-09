import React from 'react'
import { TitlePage } from '../../../../Components/Components'
import CancelationNotificationPage from "../../../../Pages/Dashboard/Admin/Setting/CancelationNotification/CancelationNotificationPage";
import { useTranslation } from 'react-i18next';

const CancelationNotificationLayout = () => {
       const { t, i18n } = useTranslation();

       return (
              <>
                     <TitlePage text={t('Notifications')} />
                     <CancelationNotificationPage />
              </>
       )
}

export default CancelationNotificationLayout