import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
  AddButton,
  StaticLoader,
  Switch,
  TitlePage,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { t } from "i18next";
import { IoInformationCircleOutline } from "react-icons/io5";

const Upselling = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchUpselling,
    loading: loadingUpselling,
    data: dataUpselling,
  } = useGet({
    url: `${apiUrl}/admin/upsaling`,
  });
  const { deleteData, loadingDelete } = useDelete();
  const { changeState, loadingChange } = useChangeState();

  const [Upsellings, setUpsellings] = useState([]);
  const [openDelete, setOpenDelete] = useState(null);
  const [openProducts, setOpenProducts] = useState(null); // State for Products dialog

  const [currentPage, setCurrentPage] = useState(1);
  const UpsellingsPerPage = 20;

  // Calculate total number of pages
  const totalPages = Math.ceil(Upsellings.length / UpsellingsPerPage);

  // Get the upsellings for the current page
  const currentUpsellings = Upsellings.slice(
    (currentPage - 1) * UpsellingsPerPage,
    currentPage * UpsellingsPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Update upsellings when data changes
  useEffect(() => {
    if (dataUpselling && dataUpselling.upsaling) {
      setUpsellings(dataUpselling.upsaling);
    }
  }, [dataUpselling]);

  // Fetch upsellings on mount
  useEffect(() => {
    refetchUpselling();
  }, [refetchUpselling]);

  // Change Upselling status
  const handleChangeStatus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/admin/upsaling/status/${id}`,
      `${name} Changed Status.`,
      { status }
    );

    if (response) {
      setUpsellings((prevUpselling) =>
        prevUpselling.map((Upselling) =>
          Upselling.id === id ? { ...Upselling, status } : Upselling
        )
      );
    }
  };

  // Delete Upselling
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/upsaling/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      setUpsellings(Upsellings.filter((upselling) => upselling.id !== id));
      handleCloseDelete();
    }
  };

  // Dialog controls
  const handleOpenDelete = (id) => {
    setOpenDelete(id);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  const handleOpenProducts = (upselling) => {
    setOpenProducts(upselling);
  };
  const handleCloseProducts = () => {
    setOpenProducts(null);
  };

  const headers = [
    t("SL"),
    t("Name"),
    t("Products"),
    t("Status"),
    t("Action"),
  ];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
      {loadingUpselling || loadingChange || loadingDelete ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="w-full md:w-1/2">
              <TitlePage text={t("Upselling Table")} />
            </div>
            <div className="flex justify-end w-full py-4 md:w-1/2">
              <Link to="add">
                <AddButton Text={t("Add Upselling")} />
              </Link>
            </div>
          </div>
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
              {Upsellings.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-xl text-center text-mainColor font-TextFontMedium"
                  >
                    {t("No Upsellings found")}
                  </td>
                </tr>
              ) : (
                currentUpsellings.map((upselling, index) => (
                  <tr className="w-full border-b-2" key={upselling.id}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * UpsellingsPerPage + index + 1}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {upselling?.name || "-"}
                    </td>
                    <td className="min-w-[100px] sm:min-w-[80px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl">
                      <button
                        type="button"
                        onClick={() => handleOpenProducts(upselling)}
                        className="text-mainColor hover:text-red-700 transition-colors underline"
                      >
                        {t("View Products")}
                      </button>
                    </td>
                    <td className="min-w-[100px] sm:min-w-[80px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <Switch
                        checked={upselling.status === 1}
                        handleClick={() => {
                          handleChangeStatus(
                            upselling.id,
                            upselling.name,
                            upselling.status === 1 ? 0 : 1
                          );
                        }}
                      />
                    </td>
                    <td className="min-w-[120px] sm:min-w-[100px] px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`edit/${upselling.id}`}>
                          <EditIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(upselling.id)}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                    {/* Delete Dialog */}
                    {openDelete === upselling.id && (
                      <Dialog
                        open={true}
                        onClose={handleCloseDelete}
                        className="relative z-10"
                      >
                        <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                            <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-md">
                              <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                                <Warning
                                  width="28"
                                  height="28"
                                  aria-hidden="true"
                                />
                                <div className="flex items-center">
                                  <div className="mt-2 text-center">
                                    {t("You will delete")} {upselling.name}
                                  </div>
                                </div>
                              </div>
                              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                  className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                  onClick={() =>
                                    handleDelete(upselling.id, upselling.name)
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
                    {/* Products Dialog */}
                    {openProducts && openProducts.id === upselling.id && (
                      <Dialog
                        open={true}
                        onClose={handleCloseProducts}
                        className="relative z-10"
                      >
                        <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                            <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-md">
                              <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                                <h2 className="text-xl font-TextFontSemiBold text-mainColor mb-4">
                                  {t("Products for")} {upselling.name}
                                </h2>
                                <div className="w-full">
                                  {upselling.products && upselling.products.length > 0 ? (
                                    <ul className="space-y-2">
                                      {upselling.products.map((product, idx) => (
                                        <li
                                          key={idx}
                                          className="flex items-center justify-between p-3 bg-gray-100 rounded-md text-base font-TextFontRegular text-mainColor"
                                        >
                                          <span>
                                            {product.name
                                              ? t(
                                                product.name
                                                  .replace("_", " ")
                                                  .toLowerCase()
                                              )
                                              : "-"}
                                          </span>
                                          <span className="text-red-600">✔</span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-base font-TextFontRegular text-thirdColor">
                                      {t("No Products Assigned")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                  type="button"
                                  onClick={handleCloseProducts}
                                  className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:w-auto"
                                >
                                  {t("Close")}
                                </button>
                              </div>
                            </DialogPanel>
                          </div>
                        </div>
                      </Dialog>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {Upsellings.length > 0 && (
            <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
              {currentPage !== 1 && (
                <button
                  type="button"
                  className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page ? "bg-mainColor text-white" : "text-mainColor"
                    }`}
                >
                  {page}
                </button>
              ))}
              {totalPages !== currentPage && (
                <button
                  type="button"
                  className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Upselling;