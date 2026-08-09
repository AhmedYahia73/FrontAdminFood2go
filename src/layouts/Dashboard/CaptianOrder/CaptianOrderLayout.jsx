import React, { useEffect, useState } from 'react'
import { TitlePage } from '../../../Components/Components'
import AddButton from '../../../Components/Buttons/AddButton'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import CapitanOrder from "../../../Pages/Dashboard/Admin/CapitanOrder/CapitanOrder";

const CaptianOrderLayout = () => {
    const [update, setUpdate] = useState(false)
    const { t } = useTranslation();

    return (
        <>
            <div className='flex flex-col items-center justify-between md:flex-row'>
                <div className='w-full md:w-1/2'>
                    <TitlePage text={t('Captian Order Table')} />
                </div>
                <div className='flex justify-end w-full py-4 md:w-1/2'>
                    <Link to='add'>
                        <AddButton Text={t("Add Captian Order")} />
                    </Link>
                </div>
            </div>
            <CapitanOrder update={update} setUpdate={setUpdate} />
        </>
    )
}

export default CaptianOrderLayout;