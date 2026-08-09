import React from 'react'
import { AddButton, TitleSection } from '../../../Components/Components'
import ProductPage from "../../../Pages/Dashboard/Admin/ProductSetup/ProductPage";
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../Context/Auth';

const ProductLayout = () => {
       const navigate = useNavigate()
       const { t, i18n } = useTranslation();
       const auth = useAuth();
       const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
       return (
              <div className="flex flex-col items-start w-full gap-y-3">
                     {role == "admin" ? (
                            <div className='mt-4 sm:w-full lg:w-52'>
                                   <AddButton
                                          Text={t('AddProduct')}
                                          isWidth={true}
                                          handleClick={() => navigate('add', { replace: true })}
                                   />
                            </div>) : null}
                     <TitleSection text={t('ProductTable')} />
                     <ProductPage />
              </div>
       )
}

export default ProductLayout