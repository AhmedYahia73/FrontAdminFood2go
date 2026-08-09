import { useEffect, useState } from "react";
import { usePost } from "../Hooks/usePostJson";
import LoaderLogin from "../Components/Loaders/LoaderLogin"; // Assuming LoaderLogin.jsx
import SearchBar from "../Components/AnotherComponents/SearchBar"; // Assuming SearchBar.jsx
import SubmitButton from "../Components/Buttons/SubmitButton"; // Assuming SubmitButton.jsx
import { useAuth } from "../Context/Auth";
import { t } from "i18next";

const BranchOffer = () => {
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    postData: postDealOrder,
    loadingPost: loadingDealOrder,
    response: responseDealOrder,
  } = usePost({
    url: `${apiUrl}/branch/offer/check_order`,
  });

  const {
    postData: postDealOrderAdd,
    loadingPost: loadingDealOrderAdd,
    response: responseDealOrderAdd,
  } = usePost({
    url: `${apiUrl}/branch/offer/approve_offer`,
  });

  const [code, setCode] = useState("");
  // const [openDescriptionView, setOpenDescriptionView] = useState(false);
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

  const handleApprove = (offerId) => {
    const formData = new FormData();
    formData.append("offer_order_id", offerId);
    // formData.append("user_id", userId);
    postDealOrderAdd(formData, "Deal Approved Success");
  };

  const headers = [
    t("OfferImage"),
    t("Product"),
    // t("Description"),
    // t("Date"),
    // t("EndDate"),
    t("Points"),
    t("action"),
  ];

  return (
    <section>
      <form onSubmit={handleSearch}>
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center justify-center w-full gap-x-4 pt-10">
            <div className="w-3/4">
              <SearchBar
                value={code}
                handleChange={(e) => setCode(e.target.value)}
                placeholder={t("Enter the code")}
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
          ) : currentResponse?.offer?.faild === "Code is expired" ? (
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
                          src={currentResponse.data.offer.offer.image_link}
                          className="rounded-full bg-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                          loading="lazy"
                          alt="offer"
                        />
                      </div>
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.offer.offer.product}
                    </td>
                    {/* <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <span
                        className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                        onClick={() =>
                          currentResponse?.data?.offer?.offer.description &&
                          setOpenDescriptionView(true)
                        }
                      >
                        {t("View")}
                      </span>
                    </td> */}
                    {/* <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.offer.date}
                    </td> */}
                    {/* <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.offer.offer.end_date}
                    </td> */}
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {currentResponse.data.offer.offer.points}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <button
                        type="button"
                        className="px-4 py-2 text-xl text-white duration-300 bg-green-400 font-TextFontRegular rounded-xl hover:bg-green-500"
                        onClick={() =>
                          handleApprove(
                            currentResponse.data.offer.id,
                            // currentResponse.offer.user.id
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

      {/* Dialog for Description View
      {openDescriptionView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-TextFontSemiBold text-mainColor mb-4">
              {t("Description")}
            </h2>
            <p className="text-thirdColor text-base mb-6">
              {currentResponse?.offer?.offer?.description || t("No description available")}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-white bg-mainColor rounded-xl hover:bg-mainColor/90 duration-300"
                onClick={() => setOpenDescriptionView(false)}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </section>
  );
};

export default BranchOffer;