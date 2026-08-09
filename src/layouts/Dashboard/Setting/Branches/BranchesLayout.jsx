import React, { useState } from 'react'
import { AddButton, TitlePage, TitleSection } from '../../../../Components/Components'
import AddBranchSection from "../../../../Pages/Dashboard/Admin/Setting/Branches/addBranchSection";
import BranchesPage from "../../../../Pages/Dashboard/Admin/Setting/Branches/BranchesPage";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const BranchesLayout = () => {
       const [update, setUpdate] = useState(false)
       const { t, i18n } = useTranslation();
       const navigate= useNavigate();

       return (
              <div className='flex flex-col gap-3' >
                     <div className='flex justify-between mt-5'>
                            <TitleSection text={t('BranchesTable')} />
                            <AddButton handleClick={()=>navigate("add")}/>
                     </div>
                     <BranchesPage refetch={update} />
              </div>
       )
}

export default BranchesLayout