import React, { useEffect, useState } from 'react'
import { TitlePage, TitleSection } from '../../../Components/Components';
import AddOfferSection from "../../../Pages/Dashboard/Admin/Offers/AddOfferSection";
import OffersPage from "../../../Pages/Dashboard/Admin/Offers/OffersPage";
import { useGet } from '../../../Hooks/useGet';
import { useTranslation } from 'react-i18next';

const OffersLayout = () => {
       const apiUrl = import.meta.env.VITE_API_BASE_URL;
       const { refetch: refetchOffers, loading: loadingOffers, data: dataOffers } = useGet({
              url: `${apiUrl}/admin/offer`
       });

       const [refetch, setRefetch] = useState(false)
           const { t, i18n } = useTranslation();

       const [offers, setOffers] = useState([]);


       // Fetch Offers Pending when the component mounts or when refetch is called
       useEffect(() => {
              refetchOffers();
       }, [refetchOffers, refetch]);

       // Update Offers when `data` changes
       useEffect(() => {
              if (dataOffers && dataOffers.offers) {
                     setOffers(dataOffers.offers);
              }
       }, [dataOffers]); // Only run this effect when `data` changes


       return (
              <>
                       <TitlePage text={t('AddOffer')} />
                     <AddOfferSection refetch={refetch} setRefetch={setRefetch} />
                     <TitleSection text={t('OffersTable')} />
                     <OffersPage data={offers} setOffers={setOffers} loading={loadingOffers} />
              </>
       )
}

export default OffersLayout