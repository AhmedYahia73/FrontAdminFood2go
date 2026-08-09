import React, { useEffect, useState } from 'react'
import { useGet } from '../../../Hooks/useGet';
import { TitlePage, TitleSection } from '../../../Components/Components';
import AddDealSection from "../../../Pages/Dashboard/Admin/Deals/AddDealSection";
import DealsPage from "../../../Pages/Dashboard/Admin/Deals/DealsPage";
import { useTranslation } from 'react-i18next';

const DealsLayout = () => {
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const { refetch: refetchDeals, loading: loadingDeals, data: dataDeals } = useGet({
              url: `${apiUrl}/admin/deal`
       });

       const [refetch, setRefetch] = useState(false)
           const { t, i18n } = useTranslation();

       const [deals, setDeals] = useState([]);


       // Fetch Deals Pending when the component mounts or when refetch is called
       useEffect(() => {
              refetchDeals();
       }, [refetchDeals, refetch]);

       // Update Deals when `data` changes
       useEffect(() => {
              if (dataDeals && dataDeals.deals) {
                     setDeals(dataDeals.deals);
              }
       }, [dataDeals]); // Only run this effect when `data` changes


      return (
              <>
                     <TitlePage text={t('AddDeal')} />
                     <AddDealSection refetch={refetch} setRefetch={setRefetch} />
                     <TitleSection text={t('DealsTable')} />
                     <DealsPage data={deals} setDeals={setDeals} loading={loadingDeals} />
              </>
       )
}


export default DealsLayout