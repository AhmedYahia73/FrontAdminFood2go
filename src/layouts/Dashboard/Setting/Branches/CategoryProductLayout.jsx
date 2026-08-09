import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../../Components/Components'
import CategoryProductPage from "../../../../Pages/Dashboard/Admin/Setting/Branches/CategoryProductPage";
import { useTranslation } from 'react-i18next';

const CategoryProductLayout = () => {
                  const { t, i18n } = useTranslation();
       
       const [update, setUpdate] = useState(false)
       return (
              <>
                     <TitlePage text={t('CategoryProducts')} />
                     <CategoryProductPage refetch={update} />
              </>
       )
}

export default CategoryProductLayout;