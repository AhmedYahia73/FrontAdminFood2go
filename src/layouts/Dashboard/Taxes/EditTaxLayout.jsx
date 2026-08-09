import React from 'react'
import { TitlePage } from '../../../Components/Components'
import EditTaxPage from "../../../Pages/Dashboard/Admin/Taxes/EditTaxPage";
import { useTranslation } from 'react-i18next';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const EditTaxLayout = () => {
       const { t, i18n } = useTranslation();
       const navigate = useNavigate();

       return (
              <>
                     <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                                   <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("EditTax")} />
                     </div>
                     <EditTaxPage />
              </>
       )
}

export default EditTaxLayout