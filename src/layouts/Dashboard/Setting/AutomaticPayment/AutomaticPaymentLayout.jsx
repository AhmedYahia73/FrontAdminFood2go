import React, { useState } from 'react'
import AutomaticPaymentPage from "../../../../Pages/Dashboard/Admin/Setting/AutomaticPayment/AutomaticPaymentPage";
import { TitlePage, TitleSection } from '../../../../Components/Components'
import { useTranslation } from 'react-i18next';

const AutomaticPaymentLayout = () => {
                  const { t, i18n } = useTranslation();
       
       const [update, setUpdate] = useState(false)
       return (
              <>
                     {/* <TitlePage text={'Add New Payment Method'} />
                     <AddPaymentMethodSection update={update} setUpdate={setUpdate}/> */}
                     <TitleSection text={t('AutomaticPayment')} />
                     <AutomaticPaymentPage refetch={update}/>
              </>
       )
}

export default AutomaticPaymentLayout