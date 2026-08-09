import React, { useEffect, useState } from 'react'
import { TitlePage, TitleSection } from '../../../Components/Components'
import AddDeliveryManSection from "../../../Pages/Dashboard/Admin/DeliveryMan/AddDeliveryManSection";
import DeliveryManPage from "../../../Pages/Dashboard/Admin/DeliveryMan/DeliveryManPage";
import { useGet } from '../../../Hooks/useGet';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../Context/Auth';

const DeliveryManLayout = () => {
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const auth = useAuth();
       const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
       const { refetch: refetchDeliveries, loading: loadingDeliveries, data: dataDeliveries } = useGet({
              url: `${apiUrl}/${role}/delivery`
       });
       const { t, i18n } = useTranslation();

       const [refetch, setRefetch] = useState(false)

       const [deliveries, setDeliveries] = useState([]);
       const [branches, setBranches] = useState([]);


       // Fetch Deliveries Pending when the component mounts or when refetch is called
       useEffect(() => {
              refetchDeliveries();
       }, [refetchDeliveries, refetch]);

       // Update Deliveries when `data` changes
       useEffect(() => {
              if (dataDeliveries && dataDeliveries.deliveries) {
                     setDeliveries(dataDeliveries.deliveries);
                     if (role === "admin") {
                            setBranches([{ id: '', name: t('Select Branche') }, ...dataDeliveries?.branches] || []);
                     }
              }
       }, [dataDeliveries]); // Only run this effect when `data` changes



       return (
              <>
                     <TitlePage text={t('AddDelivery')} />
                     {role === "admin" ? (
                            <AddDeliveryManSection data={branches} refetch={refetch} setRefetch={setRefetch} />
                     ) : (
                            <AddDeliveryManSection refetch={refetch} setRefetch={setRefetch} />
                     )}
                     <TitleSection text={t('DeliveriesTable')} />
                     <DeliveryManPage data={deliveries} setDeliveries={setDeliveries} loading={loadingDeliveries} />
              </>
       )
}

export default DeliveryManLayout