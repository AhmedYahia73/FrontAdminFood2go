import React from 'react';
import { TitlePage } from '../../../Components/Components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import AddWaiter from "../../../Pages/Dashboard/Admin/Waiter/AddWaiter";

const AddWaiterLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <section className="p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <button
            onClick={handleBack}
            className="text-mainColor hover:text-red-700 transition-colors"
            title={t("Back")}
          >
            <IoArrowBack size={24} />
          </button>
          <TitlePage text={t('Add Waiter')} />
        </div>
      </div>
      <AddWaiter />
    </section>
  );
};

export default AddWaiterLayout;