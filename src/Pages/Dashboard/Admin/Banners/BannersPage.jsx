import React, { useEffect, useRef, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import { StaticLoader, Switch } from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import BannerProductsModal from "./BannerProductsModal";

const BannersPage = ({ refetch, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchBanners,
    loading: loadingBanners,
    data: dataBanners,
  } = useGet({
    url: `${apiUrl}/admin/banner`,
  });
  const { t, i18n } = useTranslation();

  const { changeState, loadingChange, responseChange } = useChangeState();
  const { deleteData, loadingDelete, responseDelete } = useDelete();

  const [banners, setBanners] = useState([]);
  const [openDelete, setOpenDelete] = useState(null);

  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const handleOpenProducts = (banner) => {
    setSelectedBanner(banner);
    setIsProductsModalOpen(true);
  };

  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const bannersPerPage = 20; // Limit to 20 banners per page

  // Calculate total number of pages
  const totalPages = Math.ceil(banners.length / bannersPerPage);

  // Get the banners for the current page
  const currentBanners = banners.slice(
    (currentPage - 1) * bannersPerPage,
    currentPage * bannersPerPage
  );

  // handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fetch Banners when the component mounts or when refetch is called
  useEffect(() => {
    refetchBanners();
  }, [refetchBanners, refetch]); // Empty dependency array to only call refetch once on mount

  // View supp category

  const handleOpenDelete = (item) => {
    setOpenDelete(item);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  // Change Banner status
  const handleChangeStaus = async (id, status) => {
    const response = await changeState(
      `${apiUrl}/admin/banner/status/${id}`,
      `Banner Changed Status.`,
      { status } // Pass status as an object if changeState expects an object
    );

    if (response) {
      // Update Banners only if changeState succeeded
      setBanners((prevBanners) =>
        prevBanners.map((banner) =>
          banner.id === id ? { ...banner, status: status } : banner
        )
      );
    }
  };

  // Delete Category
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/banner/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      // Update Banners only if changeState succeeded
      setBanners(banners.filter((category) => category.id !== id));
      setUpdate(!refetch);
    }
  };

  // Update Banners when `data` changes
  useEffect(() => {
    if (dataBanners && dataBanners.banners) {
      setBanners(dataBanners.banners);
    }
  }, [dataBanners]); // Only run this effect when `data` changes

  // const headers = ['SL', 'Image', 'Category', 'Product', 'Deal', 'Status', 'Action'];

  const headers = [
    t("serialNumber"),
    t("image"),
    t("products"),
    t("deal"),
    t("status"),
    t("action"),
  ];
  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loadingBanners || loadingChange || loadingDelete ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
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
              {banners.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("NotfindBanners")}
                  </td>
                </tr>
              ) : (
                currentBanners.map(
                  (
                    banner,
                    index // Example with two rows
                  ) => (
                    <tr className="w-full border-b-2" key={index}>
                      <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {(currentPage - 1) * bannersPerPage + index + 1}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 overflow-hidden">
                        <div className="flex justify-center">
                          <img
                            src={banner?.image_link || "-"}
                            className="border-2 rounded-full bg-mainColor border-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                            loading="lazy"
                            alt="Photo"
                          />
                        </div>
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <button
                          type="button"
                          className="bg-mainColor text-white px-3 py-1 rounded transition-colors"
                          onClick={() => handleOpenProducts(banner)}
                        >
                          {t("products")}
                        </button>
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {banner?.deal?.title || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <Switch
                          checked={banner.status === 1}
                          handleClick={() => {
                            handleChangeStaus(
                              banner.id,
                              banner.status === 1 ? 0 : 1
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`edit/${banner.id}`}>
                            <EditIcon />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(banner.id)}
                          >
                            <DeleteIcon />
                          </button>
                          {openDelete === banner.id && (
                            <Dialog
                              open={true}
                              onClose={handleCloseDelete}
                              className="relative z-10"
                            >
                              <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                              <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                  <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                                      <Warning
                                        width="28"
                                        height="28"
                                        aria-hidden="true"
                                      />
                                      <div className="flex items-center">
                                        <div className="mt-2 text-center">
                                          You will delete this banner
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                      <button
                                        className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                        onClick={() =>
                                          handleDelete(banner.id, "Banner")
                                        }
                                      >
                                        {t("Delete")}
                                      </button>

                                      <button
                                        type="button"
                                        data-autofocus
                                        onClick={handleCloseDelete}
                                        className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                                      >
                                        {t("Cancel")}
                                      </button>
                                    </div>
                                  </DialogPanel>
                                </div>
                              </div>
                            </Dialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>

          {banners.length > 0 && (
            <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
              {currentPage !== 1 && (
                <button
                  type="button"
                  className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  {t("Prev")}
                </button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${
                      currentPage === page
                        ? "bg-mainColor text-white"
                        : " text-mainColor"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              {totalPages !== currentPage && (
                <button
                  type="button"
                  className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                                    {t("Next")}

                </button>
              )}
            </div>
          )}
        </div>
      )}
      {isProductsModalOpen && selectedBanner && (
        <BannerProductsModal
          isOpen={isProductsModalOpen}
          onClose={() => setIsProductsModalOpen(false)}
          bannerId={selectedBanner.id}
          banner={selectedBanner}
        />
      )}
    </div>
  );
};

export default BannersPage;
