import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGet } from "../../../../../Hooks/useGet";
import { useDelete } from "../../../../../Hooks/useDelete";
import { StaticLoader, Switch } from "../../../../../Components/Components";
import { DeleteIcon, EditIcon } from "../../../../../Assets/Icons/AllIcons";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";
import { useChangeState } from "../../../../../Hooks/useChangeState";

const TablesPage = ({ refetch }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchTables,
    loading: loadingTables,
    data: dataTables,
  } = useGet({
    url: `${apiUrl}/admin/caffe_tables`,
  });
  const { deleteData, loadingDelete, responseDelete } = useDelete();
  const { changeState, loadingChange } = useChangeState();
  const { changeState: changeStateOccupied } = useChangeState();
  const [tables, setTables] = useState([]);
  const { t } = useTranslation();

  const [openDelete, setOpenDelete] = useState(null);
  const [openQRDialog, setOpenQRDialog] = useState(null); // State for QR code dialog

  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const tablesPerPage = 20; // Limit to 20 tables per page

  // Calculate total number of pages
  const totalPages = Math.ceil(tables.length / tablesPerPage);

  // Get the tables for the current page
  const currentTables = tables.slice(
    (currentPage - 1) * tablesPerPage,
    currentPage * tablesPerPage
  );

  useEffect(() => {
    if (dataTables && dataTables.cafe_tables) {
      setTables(dataTables.cafe_tables);
    }
  }, [dataTables]); // Only run this effect when `data` changes

  // handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    refetchTables();
  }, [refetchTables, refetch]); // Empty dependency array to only call refetch once on mount

  const handleOpenDelete = (item) => {
    setOpenDelete(item);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  // QR Code Dialog handlers
  const handleOpenQRDialog = (qrCodeLink) => {
    setOpenQRDialog(qrCodeLink);
  };
  const handleCloseQRDialog = () => {
    setOpenQRDialog(null);
  };

  // Delete payment Method
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/caffe_location/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      setTables(tables.filter((table) => table.id !== id));
    }
  };

  const handleChangeStatus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/admin/caffe_tables/status/${id}`,
      t("StatusChangedSuccess", { name }),
      { status }
    );
    if (response) {
      setTables((prev) =>
        prev.map((table) => (table.id === id ? { ...table, status } : table))
      );
    }
  };

  const handleChangeOccupied = async (id, name, occupied) => {
    const response = await changeStateOccupied(
      `${apiUrl}/admin/caffe_tables/occupied/${id}`,
      t("OccupiedChangedSuccess", { name }),
      { occupied }
    );
    if (response) {
      setTables((prev) =>
        prev.map((table) => (table.id === id ? { ...table, occupied } : table))
      );
    }
  };

  const headers = [
    "#",
    t("Table Number"),
    t("Hall"),
    t("Branch Name"),
    t("Capacity"),
    t("QR Image"),
    t("Occupied"),
    t("Status"),
    t("Action"),
  ];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loadingTables || loadingDelete ? (
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
              {tables.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("NotfindTables")}
                  </td>
                </tr>
              ) : (
                currentTables.map((table, index) => (
                  <tr className="w-full border-b-2" key={index}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * tablesPerPage + index + 1}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {table.table_number || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {table.location?.name || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {table.branch?.name || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {table.capacity || "-"}
                    </td>
                    <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {table.qr_code_link ? (
                        <button
                          type="button"
                          onClick={() => handleOpenQRDialog(table.qr_code_link)}
                          className="px-3 py-1 text-sm text-white transition-colors duration-200 bg-red-600 rounded-md hover:bg-red-700 font-TextFontMedium"
                        >
                          {t("View QR")}
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <Switch
                        checked={table.occupied === 1}
                        handleClick={() => {
                          handleChangeOccupied(
                            table.id,
                            table.name,
                            table.occupied === 1 ? 0 : 1
                          );
                        }}
                      />
                    </td>
                    <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <Switch
                        checked={table.status === 1}
                        handleClick={() => {
                          handleChangeStatus(
                            table.id,
                            table.name,
                            table.status === 1 ? 0 : 1
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`edit/${table.id}`}>
                          <EditIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(table.id)}
                        >
                          <DeleteIcon />
                        </button>
                        {openDelete === table.id && (
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
                                        {t("Youwilldeletetable")}{" "}
                                        {table?.name || "-"}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                      onClick={() =>
                                        handleDelete(table.id, table.name)
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
                ))
              )}
            </tbody>
          </table>

          {/* QR Code Dialog */}
          {openQRDialog && (
            <Dialog
              open={true}
              onClose={handleCloseQRDialog}
              className="relative z-50"
            >
              <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />
              <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
                  <DialogPanel className="relative w-full max-w-md overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-lg">
                    <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 bg-white">
                      <h3 className="mb-4 text-lg font-medium text-gray-900 font-TextFontSemiBold">
                        {t("QR Code")}
                      </h3>
                      <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <img
                          src={openQRDialog}
                          alt="QR Code"
                          className="object-contain w-64 h-64 mx-auto"
                        />
                      </div>
                      <div className="flex items-center justify-center w-full mt-6 space-x-3">
                        <button
                          type="button"
                          onClick={handleCloseQRDialog}
                          className="inline-flex justify-center w-32 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 font-TextFontMedium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainColor"
                        >
                          {t("Close")}
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open(openQRDialog, "_blank")}
                          className="inline-flex justify-center w-32 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-mainColor hover:bg-red-700 font-TextFontMedium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainColor"
                        >
                          {t("Open in New Tab")}
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </div>
              </div>
            </Dialog>
          )}

          {tables.length > 0 && (
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

export default TablesPage;
