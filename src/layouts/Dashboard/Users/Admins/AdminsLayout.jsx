import React, { useEffect, useState } from 'react'
import { TitlePage, TitleSection } from '../../../../Components/Components'
import AddAdminSection from "../../../../Pages/Dashboard/Admin/Users/Admins/AddAdminSection";
import AdminsPage from "../../../../Pages/Dashboard/Admin/Users/Admins/AdminsPage";
import { useGet } from '../../../../Hooks/useGet';
import { useTranslation } from 'react-i18next';

const AdminsLayout = () => {
                    const { t, i18n } = useTranslation();
       
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const { refetch: refetchAdmins, loading: loadingAdmins, data: dataAdmins } = useGet({
              url: `${apiUrl}/admin/admin`
       });

       const [admins, setAdmins] = useState([])
       const [update, setUpdate] = useState(false)
       const [positions, setPositions] = useState([])

       useEffect(() => {
              refetchAdmins();
       }, [refetchAdmins, update]);

       useEffect(() => {
              setAdmins(dataAdmins?.admins || []);
              setPositions(dataAdmins?.user_positions || []);
       }, [dataAdmins]);

       return (
              <>
                     <TitlePage text={t('AddAdmin')} />
                     <AddAdminSection update={update} setUpdate={setUpdate} dataPositions={positions} />
                     <TitleSection text={t('AdminsTable')} />
                     <AdminsPage adminsData={admins} loadingAdmins={loadingAdmins} />
              </>
       )
}

export default AdminsLayout
