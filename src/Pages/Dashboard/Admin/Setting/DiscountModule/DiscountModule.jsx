import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
  AddButton,
  StaticLoader,
  Switch,
  TitlePage,
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useDelete } from "../../../../../Hooks/useDelete";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";
const DiscountModule = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchDiscountModule,
    loading: loadingDiscountModule,
    data: dataDiscountModule,
  } = useGet({
    url: `${apiUrl}/admin/discount_module`,
  });
  const { deleteData, loadingDelete, responseDelete } = useDelete();
  const { changeState, loadingChange, responseChange } = useChangeState();

  const [DiscountModules, setDiscountModules] = useState([]);
  const [openDelete, setOpenDelete] = useState(null);
  const [openView, setOpenView] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const DiscountModulesPerPage = 20;

  const totalPages = Math.ceil(DiscountModules.length / DiscountModulesPerPage);

  const currentDiscountModules = DiscountModules.slice(
    (currentPage - 1) * DiscountModulesPerPage,
    currentPage * DiscountModulesPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Update Discounts when `data` changes
  useEffect(() => {
    if (dataDiscountModule && dataDiscountModule.discounts) {
      setDiscountModules(dataDiscountModule.discounts);
    }
  }, [dataDiscountModule]);

  // Change DiscountModule status
  const handleChangeStaus = async (id, name, status) => {
    const response = await changeState(
      ` ${apiUrl}/admin/discount_module/status/${id}`,
      `${name} Changed Status.`,
      { status }
    );

    if (response) {
      setDiscountModules((prevDiscountModule) =>
        prevDiscountModule.map((DiscountModule) =>
          DiscountModule.id === id
            ? { ...DiscountModule, status: status }
            : DiscountModule
        )
      );
    }
  };

  useEffect(() => {
    refetchDiscountModule();
  }, [refetchDiscountModule]);

  const handleOpenDelete = (item) => {
    setOpenDelete(item);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  const handleOpenView = (item) => {
    setOpenView(item);
  };
  const handleCloseView = () => {
    setOpenView(null);
  };

  // Delete Language
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/discount_module/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      setDiscountModules(
        DiscountModules.filter((DiscountModule) => DiscountModule.id !== id)
      );
    }
  };

  const headers = [
    t("SL"),
    t("Discount"),
    t("Modules & Branches"),
    t("Status"),
    t("Action"),
  ];

  return (
    <div className="flex items-start justify-start w-full p-2 overflow-x-scroll pb-28 scrollSection">
      {loadingDiscountModule || loadingChange || loadingDelete ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="w-full md:w-1/2">
              <TitlePage text={t("Discount Module Table")} />
            </div>
            <div className="flex justify-end w-full py-4 md:w-1/2">
              <Link to="add">
                <AddButton Text={t("Add Discount Module")} />
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
              {DiscountModules.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("Not find discounts")}
                  </td>
                </tr>
              ) : (
                currentDiscountModules.map((DiscountModule, index) => (
                  <tr className="w-full border-b-2" key={index}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * DiscountModulesPerPage + index + 1}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {DiscountModule?.discount || "-"}%
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleOpenView(DiscountModule)}
                        className="p-1 text-red-600 underline hover:text-red-800"
                        title={t("View Details")}
                      >
                        {t("view")}
                      </button>
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <Switch
                        checked={DiscountModule.status === 1}
                        handleClick={() => {
                          handleChangeStaus(
                            DiscountModule.id,
                            DiscountModule.name,
                            DiscountModule.status === 1 ? 0 : 1
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`edit/${DiscountModule.id}`}>
                          <EditIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(DiscountModule.id)}
                        >
                          <DeleteIcon />
                        </button>
                        {openDelete === DiscountModule.id && (
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
                                        {t("You will delete")}{" "}
                                        {DiscountModule.name}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                      onClick={() =>
                                        handleDelete(
                                          DiscountModule.id,
                                          DiscountModule.name
                                        )
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

          {/* View Modal */}
          {openView && (
            <Dialog
              open={true}
              onClose={handleCloseView}
              className={`relative z-10`}
            >
              <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
              <div
                className="fixed inset-0 z-10 w-screen overflow-y-auto"
                
              >
                <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                  <DialogPanel
                    className={`relative overflow-hidden transition-all flex flex-col transform bg-white rounded-lg shadow-xl  sm:my-8 sm:w-full sm:max-w-2xl
                    `}
                  >
                    <div className={`px-4 pt-5 pb-4 bg-white sm:p-6 `} >
                      <div className={`sm:flex sm:items-start  `} >
                        <div className="w-full mt-3 text-center sm:mt-0 " dir={language === "ar" ? "rtl" : "ltr"}>
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {t("Discount Module Details")}
                          </h3>
                          <div className="mt-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <h4 className="font-semibold text-mainColor">
                                  {t("Discount")}:
                                </h4>
                                <p className="mt-1">{openView.discount}%</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-mainColor">
                                  {t("Status")}:
                                </h4>
                                <p className="mt-1">
                                  {openView.status === 1
                                    ? t("Active")
                                    : t("Inactive")}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6">
                              <h4 className="mb-3 font-semibold text-mainColor">
                                {t("Modules & Branches")}:
                              </h4>
                              <div className="overflow-hidden border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        {t("Module")}
                                      </th>
                                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        {t("Branch")}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {openView.modules &&
                                    openView.modules.length > 0 ? (
                                      openView.modules.map((module, index) => (
                                        <tr key={index}>
                                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {module.module || "-"}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                            {module.branch || "-"}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan="2"
                                          className="px-4 py-3 text-sm text-center text-gray-500"
                                        >
                                          {t("No modules and branches found")}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        onClick={handleCloseView}
                        className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white rounded-md bg-mainColor hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto"
                      >
                        {t("Close")}
                      </button>
                    </div>
                  </DialogPanel>
                </div>
              </div>
            </Dialog>
          )}

          {DiscountModules.length > 0 && (
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

export default DiscountModule;
