import React, { useState } from "react";
import { useDelete } from "../../../../Hooks/useDelete";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { StaticLoader, Switch } from "../../../../Components/Components";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { Link } from "react-router-dom";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { useTranslation } from "react-i18next";

const DealsPage = ({ data, setDeals, loading }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { changeState, loadingChange, responseChange } = useChangeState();
  const { deleteData, loadingDelete, responseDelete } = useDelete();
  const { t, i18n } = useTranslation();

  const [openDescription, setOpenDescription] = useState(null);
  const [openTimes, setOpenTimes] = useState(null);
  const [openDelete, setOpenDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const datasPerPage = 20; // Limit to 20 datas per page

  // Calculate total number of pages
  const totalPages = Math.ceil(data.length / datasPerPage);

  // Get the datas for the current page
  const currentDatas = data.slice(
    (currentPage - 1) * datasPerPage,
    currentPage * datasPerPage
  );

  // handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenDescription = (item) => {
    setOpenDescription(item);
  };
  const handleCloseDescription = () => {
    setOpenDescription(null);
  };

  const handleOpenTimes = (item) => {
    setOpenTimes(item);
  };
  const handleCloseTimes = () => {
    setOpenTimes(null);
  };

  const handleOpenDelete = (item) => {
    setOpenDelete(item);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  // Change Deal status
  const handleChangeStaus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/admin/deal/status/${id}`,
      `${name} Changed Status.`,
      { status } // Pass status as an object if changeState expects an object
    );

    if (response) {
      // Update categories only if changeState succeeded
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === id ? { ...deal, status: status } : deal
        )
      );
    }
  };

  // Delete Deal
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/deal/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      // Update Deliveries only if changeState succeeded
      setDeals(data.filter((deal) => deal.id !== id));
    }
  };

  const headers = [
    t("sl"),
    t("image"),
    t("title"),
    t("description"),
    t("price"),
    t("startDate"),
    t("endDate"),
    t("daily"),
    t("times"),
    t("status"),
    t("action"),
  ];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loading || loadingChange || loadingDelete ? (
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
                    className="min-w-[110px] sm:w-[3%] lg:w-[3%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3"
                    key={index}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="w-full">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("Notfinddata")}
                  </td>
                </tr>
              ) : (
                currentDatas.map(
                  (
                    deal,
                    index // Example with two rows
                  ) => (
                    <tr className="w-full border-b-2" key={index}>
                      <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {(currentPage - 1) * datasPerPage + index + 1}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 overflow-hidden">
                        <div className="flex justify-center">
                          <img
                            src={deal.image_link}
                            className="border-2 rounded-full bg-mainColor border-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                            alt="Photo"
                          />
                        </div>
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {deal?.title || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <span
                          className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                          onClick={() => handleOpenDescription(deal.id)}
                        >
                          {t("View")}
                        </span>

                        {openDescription === deal.id && (
                          <Dialog
                            open={true}
                            onClose={handleCloseDescription}
                            className="relative z-10"
                          >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                              <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl">
                                  <div className="flex flex-wrap items-center justify-center w-full gap-4 px-4 my-4 sm:p-6 sm:pb-4">
                                    {!deal.description ? (
                                      <div className="w-full my-4 text-lg text-center text-gray-500 font-TextFontSemiBold">
                                        {t("Nodescriptionavailablefor")}
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center px-3 py-3 duration-300 shadow-md hover:shadow-none rounded-xl bg-gray-50">
                                        <span className="text-lg capitalize text-mainColor lg:text-xl font-TextFontSemiBold">
                                          {deal.description}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Dialog Footer */}
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      type="button"
                                      onClick={handleCloseDescription}
                                      className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                    >
                                              {t("Close")}
                              
                                    </button>
                                  </div>
                                </DialogPanel>
                              </div>
                            </div>
                          </Dialog>
                        )}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {deal?.price || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {deal?.start_date || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {deal?.end_date || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {deal.daily === 1 ? (
                          <span className="px-3 py-1 text-white bg-green-500 rounded-xl">
                            {t("Active")}
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-white bg-red-500 rounded-xl">
                            {t("Unactive")}
                          </span>
                        )}
                      </td>

                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <span
                          className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                          onClick={() => handleOpenTimes(deal.id)}
                        >
                          {t("View")}
                        </span>

                        {openTimes === deal.id && (
                          <Dialog
                            open={true}
                            onClose={handleCloseTimes}
                            className="relative z-10"
                          >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                              <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl">
                                  {/* Permissions List */}
                                  <div className="flex flex-wrap items-center justify-center w-full gap-4 px-4 my-4 sm:p-6 sm:pb-4">
                                    {deal.times.length === 0 ? (
                                      <div className="w-full my-4 text-lg text-center text-gray-500 font-TextFontSemiBold">
                                        {t("Notimesavailableforthisdeal")}
                                      </div>
                                    ) : (
                                      deal.times.map((time, index) => {
                                        const displayIndex = index + 1;
                                        return (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between px-3 py-3 duration-300 shadow-md hover:shadow-none rounded-xl bg-gray-50 gap-x-2"
                                          >
                                            <div className="flex items-center justify-between gap-2 text-lg capitalize text-mainColor lg:text-xl font-TextFontSemiBold">
                                              <span>
                                                {index}. {time.day}{" "}
                                              </span>
                                              <span> {time.from} </span>
                                              <span> {time.to} </span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>

                                  {/* Dialog Footer */}
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      type="button"
                                      onClick={handleCloseTimes}
                                      className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                    >
                                      {t("Close")}
                                    </button>
                                  </div>
                                </DialogPanel>
                              </div>
                            </div>
                          </Dialog>
                        )}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <Switch
                          checked={deal.status === 1}
                          handleClick={() => {
                            handleChangeStaus(
                              deal.id,
                              deal.title,
                              deal.status === 1 ? 0 : 1
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`edit/${deal.id}`}>
                            <EditIcon />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(deal.id)}
                          >
                            <DeleteIcon />
                          </button>
                          {openDelete === deal.id && (
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
                                          {t("Youwilldeletedeal")}{" "}
                                          {deal?.title || "-"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                      <button
                                        className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                        onClick={() =>
                                          handleDelete(deal.id, deal.title)
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
                                        {t('Cancel')}
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

          {data.length > 0 && (
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
    </div>
  );
};

export default DealsPage;
