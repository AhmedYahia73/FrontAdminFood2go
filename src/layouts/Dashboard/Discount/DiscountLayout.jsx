import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../Components/Components'
import AddDiscountSection from "../../../Pages/Dashboard/Admin/Discount/AddDiscountSection";
import DiscountPage from "../../../Pages/Dashboard/Admin/Discount/DiscountPage";
import { useTranslation } from 'react-i18next';

const DiscountLayout = () => {
       const [update, setUpdate] = useState(false)
       const { t, i18n } = useTranslation();

       return (
              <>
                     <TitlePage text={t('AddDiscount')} />
                     <AddDiscountSection update={update} setUpdate={setUpdate} />
                     <TitleSection text={t('DiscountsTable')} />
                     <DiscountPage refetch={update} />
              </>
       )
}

export default DiscountLayout