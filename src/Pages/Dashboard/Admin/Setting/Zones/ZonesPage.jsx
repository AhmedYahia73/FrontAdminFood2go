import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGet } from "../../../../../Hooks/useGet";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useDelete } from "../../../../../Hooks/useDelete";
import { StaticLoader, Switch } from "../../../../../Components/Components";
import { DeleteIcon, EditIcon } from "../../../../../Assets/Icons/AllIcons";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";

const ZonePage = ({ refetch }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchZones,
    loading: loadingZones,
    data: dataZones,
  } = useGet({
    url: `${apiUrl}/admin/settings/zone`,
  });
  const { changeState, loadingChange, responseChange } = useChangeState();
  const { deleteData, loadingDelete, responseDelete } = useDelete();
  const [zones, setZones] = useState([]);

  const [openDelete, setOpenDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const zonesPerPage = 20; // Limit to 20 zones per page

  // Calculate total number of pages
  const totalPages = Math.ceil(zones.length / zonesPerPage);

  // Get the zones for the current page
  const currentZones = zones.slice(
    (currentPage - 1) * zonesPerPage,
    currentPage * zonesPerPage
  );
  const { t, i18n } = useTranslation();

  // handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    refetchZones();
  }, [refetchZones, refetch]); // Empty dependency array to only call refetch once on mount

  // Change paymentMethod status
  const handleChangeStaus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/admin/settings/zone/status/${id}`,
      `${name} Changed Status.`,
      { status } // Pass status as an object if changeState expects an object
    );

    if (response) {
      setZones((prevCities) =>
        prevCities.map((city) =>
          city.id === id ? { ...city, status: status } : city
        )
      );
    }
  };

  const handleOpenDelete = (item) => {
    setOpenDelete(item);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  // Delete payment Method
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/settings/zone/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      setZones(zones.filter((Zone) => Zone.id !== id));
    }
  };

  useEffect(() => {
    if (dataZones && dataZones.zones) {
      setZones(dataZones.zones);
    }
  }, [dataZones]); // Only run this effect when `data` changes

  const headers = [
    t("#"),
    t("Name"),
    t("City"),
    t("Branch"),
    t("Price"),
    t("Status"),
    t("Action"),
  ];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loadingZones || loadingChange || loadingDelete ? (
        <div className="w-full mt-40">
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
              {zones.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("NotfindZones")}
                  </td>
                </tr>
              ) : (
                currentZones.map(
                  (
                    zone,
                    index // Example with two rows
                  ) => (
                    <tr className="w-full border-b-2" key={index}>
                      <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {(currentPage - 1) * zonesPerPage + index + 1}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {zone?.zone || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {zone?.city?.name || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {zone?.branch?.name || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {zone?.price || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <Switch
                          checked={zone.status === 1}
                          handleClick={() => {
                            handleChangeStaus(
                              zone.id,
                              zone.zone,
                              zone.status === 1 ? 0 : 1
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`edit/${zone.id}`}>
                            <EditIcon />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(zone.id)}
                          >
                            <DeleteIcon />
                          </button>
                          {openDelete === zone.id && (
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
                                          {/* <DialogTitle
                                                                                                                                            as="h3"
                                                                                                                                            className="text-xl leading-10 text-gray-900 font-TextFontSemiBold"
                                                                                                                                     > */}
                                                                                  {t("Youwilldeletezone")}{" "}

                                          {zone?.branch?.name || "-"}
                                          {/* </DialogTitle> */}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                      <button
                                        className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                        onClick={() =>
                                          handleDelete(
                                            zone.id,
                                            zone?.branch?.name || ""
                                          )
                                        }
                                      >
                                        {t('Delete')}
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

          {zones.length > 0 && (
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

export default ZonePage;
