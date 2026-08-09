import React, { useEffect, useState } from "react";
import { usePost } from "../../../../Hooks/usePostJson";
import {
  LoaderLogin,
  SearchBar,
  SubmitButton,
} from "../../../../Components/Components";
import { useAuth } from "../../../../Context/Auth";
import { Dialog } from "@headlessui/react";
import { t } from "i18next";

const DealOrderPage = () => {
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    postData: postDealOrder,
    loadingPost: loadingDealOrder,
    response: responseDealOrder,
  } = usePost({
    url: `${apiUrl}/admin/dealOrder`,
  });

  const {
    postData: postDealOrderAdd,
    loadingPost: loadingDealOrderAdd,
    response: responseDealOrderAdd,
  } = usePost({
    url: `${apiUrl}/admin/dealOrder/add`,
  });

  const [code, setCode] = useState("");
  const [openDescriptionView, setOpenDescriptionView] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);

  useEffect(() => {
    setCurrentResponse(responseDealOrder);
  }, [responseDealOrder]);

  useEffect(() => {
    if (!loadingDealOrderAdd) {
      setCode("");
      setCurrentResponse(null);
    }
  }, [responseDealOrderAdd]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!code) {
      auth.toastError("Please Enter Your Code.");
      return;
    }

    const formData = new FormData();
    formData.append("code", code);

    postDealOrder(formData);
  };

  const handleApprove = (dealId, userId) => {
    const formData = new FormData();
    formData.append("deal_id", dealId);
    formData.append("user_id", userId);

    postDealOrderAdd(formData, "Deal Approved Success");
  };
const headers = [
  t('DealImage'),
  t('DealName'),
  t('Description'),
  t('StartDate'),
  t('EndDate'),
  t('price'),
  t('action'),
];

  return (
    <section>
      <form onSubmit={handleSearch}>
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center justify-center w-full gap-x-4">
            <div className="w-3/4">
              <SearchBar
                value={code}
                handleChange={(e) => setCode(e.target.value)}
                                                        placeholder={t("Enterthecode")}
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
          {loadingDealOrder || loadingDealOrderAdd ? (
            <div className="flex items-center justify-center w-full h-56 mt-10">
              <LoaderLogin />
            </div>
          ) : currentResponse?.data?.faild === "Code is expired" ? (
            <span className="mx-auto mt-5 text-xl font-TextFontMedium text-mainColor">
              {t("Code Is Expired")}
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
                          src={currentResponse.data.deal.image_link}
                          className="rounded-full bg-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                          loading="lazy"
                          alt="Deal"
                        />
                      </div>
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.deal.title}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <span
                        className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                        onClick={() => setOpenDescriptionView(true)}
                      >
                        {t("View")}
                      </span>
                      {openDescriptionView && (
                        <Dialog
                          open={true}
                          onClose={() => setOpenDescriptionView(false)}
                          className="relative z-10"
                        >
                          <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                              <div className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl">
                                <div className="flex flex-wrap items-center justify-center w-full gap-4 px-4 my-4 sm:p-6 sm:pb-4">
                                  <ul className="p-4 shadow-md rounded-xl">
                                    <li className="mx-4 text-lg capitalize list-disc text-mainColor lg:text-xl font-TextFontSemiBold">
                                      {currentResponse.data.deal.description}
                                    </li>
                                  </ul>
                                </div>
                                <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenDescriptionView(false)
                                    }
                                    className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                  >
                                    {t('Close')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Dialog>
                      )}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.deal.start_date}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.deal.end_date}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.deal.price}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <button
                        type="button"
                        className="px-4 py-2 text-xl text-white duration-300 bg-green-400 font-TextFontRegular rounded-xl hover:bg-green-500"
                        onClick={() =>
                          handleApprove(
                            currentResponse.data.deal.id,
                            currentResponse.data.user.id
                          )
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

export default DealOrderPage;
