import React, { useState } from 'react'
import AddCategorySection from "../../../Pages/Dashboard/Admin/CategorySetup/AddCategorySection";
import CategoryPage from "../../../Pages/Dashboard/Admin/CategorySetup/CategoryPage";
import { TitlePage, TitleSection } from '../../../Components/Components'
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../Context/Auth';
import BranchCategoryPage from '../../../DashboardBranches/BranchCategoryPage';

const CategoryLayout = () => {
  const [update, setUpdate] = useState(false)
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");

  if (role === "branch") {
    return <BranchCategoryPage />;
  }

  return (
    <>
      {
        role === "admin" && (
          <>
            <TitlePage text={t('AddNewCategory')} />
            <AddCategorySection update={update} setUpdate={setUpdate} />
          </>
        )
      }
      <TitleSection text={t('CategoryTable')} />
      <CategoryPage refetch={update} setUpdate={setUpdate} />
    </>
  )
}

export default CategoryLayout