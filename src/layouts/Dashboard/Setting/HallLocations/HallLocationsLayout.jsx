import React, { useEffect, useState } from 'react'
import { TitlePage } from '../../../../Components/Components'
import AddButton from '../../../../Components/Buttons/AddButton'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import HallLocations from "../../../../Pages/Dashboard/Admin/Setting/HallLocations/HallLocations";

const HallLocationsLayout = () => {
    const [update, setUpdate] = useState(false)
    const { t } = useTranslation();

    return (
        <>
            <div className='flex flex-col items-center justify-between md:flex-row'>
                <div className='w-full md:w-1/2'>
                    <TitlePage text={t('Hall Location Table')} />
                </div>
                <div className='flex justify-end w-full py-4 md:w-1/2'>
                    <Link to='add'>
                        <AddButton Text={t("Add Hall Location")} />
                    </Link>
                </div>
            </div>
            <HallLocations update={update} setUpdate={setUpdate} />
        </>
    )
}

export default HallLocationsLayout;