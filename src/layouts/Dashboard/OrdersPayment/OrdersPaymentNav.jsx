import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from "react-i18next";

const OrdersPaymentNav = () => {
       const location = useLocation();
       const [searchParams] = useSearchParams();
       const category = searchParams.get('category') || 'order_management';
       const { t, i18n } = useTranslation();

       const [isActiveOrdersPaymentPending, setIsActiveOrdersPaymentPending] = useState(true)
       const [isActiveOrdersPaymentHistory, setIsActiveOrdersPaymentHistory] = useState(false)
       // const path = location.pathname;

       const handleOrdersPaymentPending = () => {
              setIsActiveOrdersPaymentPending(true)
              setIsActiveOrdersPaymentHistory(false)
       }
       const handleOrdersPaymentHistory = () => {
              setIsActiveOrdersPaymentHistory(true)
              setIsActiveOrdersPaymentPending(false)
       }

       useEffect(() => {
              const path = location.pathname;
              if (path === '/dashboard/orders_payment/payment_pending' || path === '/dashboard/orders_payment/' || path === '/dashboard/orders_payment') {
                     handleOrdersPaymentPending()
              }
              if (path === '/dashboard/orders_payment/payment_history') {
                     handleOrdersPaymentHistory()
              }
       }, [location.pathname])
       return (
              <>
                     <nav className="flex items-center justify-center w-full gap-8">
                            <Link to={`payment_pending?category=${category}`} className={isActiveOrdersPaymentPending ? "text-2xl font-TextFontMedium border-b-4 border-mainColor pb-2 text-mainColor" : "text-2xl font-TextFontMedium pb-2 text-mainColor"} onClick={handleOrdersPaymentPending}>{t("Pending")}</Link>
                            <Link to={`payment_history?category=${category}`} className={isActiveOrdersPaymentHistory ? "text-2xl font-TextFontMedium border-b-4 border-mainColor pb-2 text-mainColor" : "text-2xl font-TextFontMedium pb-2 text-mainColor"} onClick={handleOrdersPaymentHistory}>{t("History")}</Link>
                     </nav>
              </>
       )
}

export default OrdersPaymentNav