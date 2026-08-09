import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from "react-i18next";

const BusinessSetupNav = () => {
       const location = useLocation();
       const [searchParams] = useSearchParams();
       const category = searchParams.get('category') || 'settings';
       const navigate = useNavigate();
       const { t, i18n } = useTranslation();

       const [isActiveBusinessSettings, setIsActiveBusinessSettings] = useState(false)
       const [isActiveMainBranchSetup, setIsActiveMainBranchSetup] = useState(false)
       const [isActiveRestaurantTimeSlot, setIsActiveRestaurantTimeSlot] = useState(false)
       const [isActiveCustomerLogin, setIsActiveCustomerLogin] = useState(false)
       const [isActiveOrders, setIsActiveOrders] = useState(false)

       const handleAllTap = () => {
              setIsActiveBusinessSettings(false)
              setIsActiveMainBranchSetup(false)
              setIsActiveRestaurantTimeSlot(false)
              setIsActiveCustomerLogin(false)
              setIsActiveOrders(false)
       }


       const handleBusinessSettings = () => {
              handleAllTap()
              setIsActiveBusinessSettings(true)
              navigate(`/dashboard/setting/business_setup/business_settings?category=${category}`)
       }
       const handleMainBranchSetup = () => {
              handleAllTap()
              setIsActiveMainBranchSetup(true)
              navigate(`/dashboard/setting/business_setup/main_branch_setup?category=${category}`)
       }
       const handleRestaurantTimeSlot = () => {
              handleAllTap()
              setIsActiveRestaurantTimeSlot(true)
              navigate(`/dashboard/setting/business_setup/restaurant_time_slot?category=${category}`)
       }
       const handleCustomerLogin = () => {
              handleAllTap()
              setIsActiveCustomerLogin(true)
              navigate(`/dashboard/setting/business_setup/customer_login?category=${category}`)
       }
       const handleOrders = () => {
              handleAllTap()
              setIsActiveOrders(true)
              navigate(`/dashboard/setting/business_setup/orders?category=${category}`)
       }

       useEffect(() => {
              const path = location.pathname;
              if (path === '/dashboard/setting/business_setup/business_settings' || path === '/dashboard/setting/business_setup/' || path === '/dashboard/setting/business_setup') {
                     handleBusinessSettings()
              }
              if (path === '/dashboard/setting/business_setup/main_branch_setup') {
                     handleMainBranchSetup()
              }
              if (path === '/dashboard/setting/business_setup/restaurant_time_slot') {
                     handleRestaurantTimeSlot()
              }
              if (path === '/dashboard/setting/business_setup/customer_login') {
                     handleCustomerLogin()
              }
              if (path === '/dashboard/setting/business_setup/orders') {
                     handleOrders()
              }
       }, [location.pathname])
       return (
              <>
                     <nav className="flex flex-wrap items-center justify-start w-full gap-8">
                            <Link to={`business_settings?category=${category}`} className={isActiveBusinessSettings ? "text-2xl font-TextFontMedium border-b-4 border-mainColor pb-2 text-mainColor" : "text-2xl font-TextFontMedium pb-2 text-gray-500"} onClick={handleBusinessSettings}>{t("BusinessSettings")}</Link>
                            <Link to={`main_branch_setup?category=${category}`} className={isActiveMainBranchSetup ? "text-2xl font-TextFontMedium border-b-4 border-mainColor pb-2 text-mainColor" : "text-2xl font-TextFontMedium pb-2 text-gray-500"} onClick={handleMainBranchSetup}>{t("MainBranchSetup")}</Link>
                            {/* <Link to={"restaurant_time_slot"} className={isActiveRestaurantTimeSlot ? "text-2xl font-TextFontMedium border-b-4 border-mainColor pb-2 text-mainColor" : "text-2xl font-TextFontMedium pb-2 text-gray-500"} onClick={handleRestaurantTimeSlot}>Restaurant Availabilty Time Slot</Link> */}
                            <Link to={`customer_login?category=${category}`} className={isActiveCustomerLogin ? "text-2xl font-TextFontMedium border-b-4 border-mainColor pb-2 text-mainColor" : "text-2xl font-TextFontMedium pb-2 text-gray-500"} onClick={handleCustomerLogin}>{t("CustomerLogin")}</Link>
                            <Link to={`orders?category=${category}`} className={isActiveOrders ? "text-2xl font-TextFontMedium border-b-4 border-mainColor pb-2 text-mainColor" : "text-2xl font-TextFontMedium pb-2 text-gray-500"} onClick={handleOrders}>{t("Orders")}</Link>
                     </nav>
              </>
       )
}

export default BusinessSetupNav