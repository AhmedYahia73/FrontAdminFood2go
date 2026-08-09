import React, { useState } from 'react'
import { TitlePage, TitleSection } from '../../../Components/Components'
import AddAddonsSection from "../../../Pages/Dashboard/Admin/Addons/AddAddonsSection";
import AddonsPage from "../../../Pages/Dashboard/Admin/Addons/AddonsPage";
import { useTranslation } from 'react-i18next';

const AddonsLayout = () => {
       const [update, setUpdate] = useState(false)
       const { t, i18n } = useTranslation();

       return (
              <>
                     <TitlePage text={t('AddNewAddons')} />
                     <AddAddonsSection update={update} setUpdate={setUpdate} />
                     <TitleSection text={('AddonsTable')} />
                     <AddonsPage refetch={update} />
              </>
       )
}

export default AddonsLayout