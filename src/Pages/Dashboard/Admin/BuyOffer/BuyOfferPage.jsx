import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../Context/Auth";
import { usePost } from "../../../../Hooks/usePostJson";
import {
  LoaderLogin,
  SearchBar,
  SubmitButton,
} from "../../../../Components/Components";
import { Dialog } from "@headlessui/react";
import { useTranslation } from "react-i18next";

const BuyOfferPage = () => {
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    postData: postBuyOffer,
    loadingPost: loadingBuyOffer,
    response: responseBuyOffer,
  } = usePost({
    url: `${apiUrl}/admin/offerOrder`,
  });
  const { t, i18n } = useTranslation();

  const {
    postData: postBuyOfferAdd,
    loadingPost: loadingBuyOfferAdd,
    response: responseBuyOfferAdd,
  } = usePost({
    url: `${apiUrl}/admin/offerOrder/approve_offer`,
  });

  const [code, setCode] = useState("");
  const [openDescriptionView, setOpenDescriptionView] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);

  useEffect(() => {
    setCurrentResponse(responseBuyOffer);
  }, [responseBuyOffer]);

  useEffect(() => {
    if (!loadingBuyOfferAdd) {
      setCode("");
      setCurrentResponse(null);
    }
  }, [responseBuyOfferAdd]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!code) {
      auth.toastError(t("PleaseEnterYourCode"));
      return;
    }

    const formData = new FormData();
    formData.append("code", code);

    postBuyOffer(formData);
  };

  const handleApprove = (offerId) => {
    const formData = new FormData();
    formData.append("offer_order_id", offerId);

    postBuyOfferAdd(formData, t("Offer Approved Success"));
  };

  const headers = [t("offerImage"), t("offerName"), t("points"), t("action")];
  return (
    <section>
      <form onSubmit={handleSearch}>
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center justify-center w-full gap-x-4">
            <div className="w-3/4">
              <SearchBar
                value={code}
                handleChange={(e) => setCode(e.target.value)}
                placeholder={t("EnterTheCode")}
              />
            </div>
            <div>
              <SubmitButton
                text={t("Search")}
                rounded="rounded-2xl"
                handleClick={handleSearch}
              />
            </div>
          </div>
        </div>
        <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
          {loadingBuyOffer || loadingBuyOfferAdd ? (
            <div className="flex items-center justify-center w-full h-56 mt-10">
              <LoaderLogin />
            </div>
          ) : currentResponse?.data?.faild === "Code is expired" ? (
            <span className="mx-auto mt-5 text-xl font-TextFontMedium text-mainColor">
              {t("CodeIsExpired")}
            </span>
          ) : (
            currentResponse && (
              <table className="block w-full mt-5 overflow-x-scroll sm:min-w-0 scrollPage">
                <thead className="w-full">
                  <tr className="w-full border-b-2">
                    {headers.map((name, index) => (
                      <th
                        className="min-w-[120px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3"
                        key={index}
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="w-full">
                  <tr className="w-full border-b-2">
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <div className="flex justify-center">
                        <img
                          src={currentResponse.data.offer.offer.image_link}
                          className="rounded-full bg-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                          loading="lazy"
                          alt="Deal"
                        />
                      </div>
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.offer.offer.product}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.offer.offer.points}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <button
                        type="button"
                        className="px-4 py-2 text-xl text-white duration-300 bg-green-400 font-TextFontRegular rounded-xl hover:bg-green-500"
                        onClick={() =>
                          handleApprove(currentResponse.data.offer.id)
                        }
                      >
                                                {t("Approve")}

                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            )
          )}
        </div>
      </form>
    </section>
  );
};

export default BuyOfferPage;
