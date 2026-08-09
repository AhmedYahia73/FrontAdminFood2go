import React, { useState } from 'react'
import AddCouponSection from "../../../Pages/Dashboard/Admin/Coupon/AddCouponSection";
import CouponPage from "../../../Pages/Dashboard/Admin/Coupon/CouponPage";
import { TitlePage, TitleSection } from '../../../Components/Components'
import { useTranslation } from 'react-i18next';

const CouponLayout = () => {
  const [update, setUpdate] = useState(false)
            const { t, i18n } = useTranslation();
 
  return (
    <>
      <TitlePage text={t('AddNewCoupon')} />
      <AddCouponSection update={update} setUpdate={setUpdate} />
      <TitleSection text={t('CouponTable')} />
      <CouponPage refetch={update} setUpdate={setUpdate} />
    </>
  )
}

export default CouponLayout