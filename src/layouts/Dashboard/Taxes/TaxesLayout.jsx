import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../Components/Components'
import AddTaxSection from "../../../Pages/Dashboard/Admin/Taxes/AddTaxSection";
import TaxesPage from "../../../Pages/Dashboard/Admin/Taxes/TaxesPage";
import { useTranslation } from 'react-i18next';

const TaxesLayout = () => {
       const [update, setUpdate] = useState(false)
                         const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('AddTax')} />
                     <AddTaxSection update={update} setUpdate={setUpdate} />
                     <TitleSection text={t('TaxesTable')} />
                     <TaxesPage refetch={update} />
              </>
       )
}

export default TaxesLayout