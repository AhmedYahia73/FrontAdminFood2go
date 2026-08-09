import React from 'react';
import { TitlePage } from '../../../../Components/Components';
import EditCustomersPage from "../../../../Pages/Dashboard/Admin/Users/Customers/EditCustomersPage";
import { useTranslation } from 'react-i18next';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const EditCustomersLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // Hook for navigation

  // Define handleBack to navigate back one step in history
  const handleBack = () => {
    navigate(-1); // Goes back one step in browser history
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleBack}
          className="text-mainColor hover:text-red-700 transition-colors"
          title={t("Back")}
        >
          <IoArrowBack size={24} />
        </button>
        <TitlePage text={t('EditCustomer')} />
      </div>
      <EditCustomersPage />
    </>
  );
};

export default EditCustomersLayout;