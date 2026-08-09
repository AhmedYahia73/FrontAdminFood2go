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
import i18n, { t } from "i18next";
import { LuView } from "react-icons/lu";

const MaterialList = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchMaterialProduct,
    loading: loadingMaterialProduct,
    data: dataMaterialProduct,
  } = useGet({
    url: `${apiUrl}/admin/material_product`,
  });
  const { deleteData, loadingDelete, responseDelete } = useDelete();
  const { changeState, loadingChange, responseChange } = useChangeState();

  const [MaterialProducts, setMaterialProducts] = useState([]);
  const [openDelete, setOpenDelete] = useState(null);
  const [openView, setOpenView] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const MaterialProductsPerPage = 20;

  const totalPages = Math.ceil(
    MaterialProducts.length / MaterialProductsPerPage
  );

  const currentMaterialProducts = MaterialProducts.slice(
    (currentPage - 1) * MaterialProductsPerPage,
    currentPage * MaterialProductsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Update MaterialProducts when `data` changes
  useEffect(() => {
    if (dataMaterialProduct && dataMaterialProduct.materials) {
      setMaterialProducts(dataMaterialProduct.materials);
    }
  }, [dataMaterialProduct]);

  // Change MaterialProduct status
  const handleChangeStatus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/admin/material_product/status/${id}`,
      `${name} Changed Status.`,
      { status }
    );

    if (response) {
      setMaterialProducts((prevMaterialProducts) =>
        prevMaterialProducts.map((MaterialProduct) =>
          MaterialProduct.id === id
            ? { ...MaterialProduct, status: status }
            : MaterialProduct
        )
      );
    }
  };

  useEffect(() => {
    refetchMaterialProduct();
  }, [refetchMaterialProduct]);

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

  // Delete MaterialProduct
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/material_product/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      setMaterialProducts(
        MaterialProducts.filter((MaterialProduct) => MaterialProduct.id !== id)
      );
    }
  };

  const headers = [
    t("SL"),
    t("Name"),
    t("Material Category"),
    t("Min Stock Quantity"),
    t("Status"),
    t("Action"),
  ];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
      {loadingMaterialProduct || loadingChange || loadingDelete ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="w-full md:w-1/2">
              <TitlePage text={t("Material Product Table")} />
            </div>
            <div className="flex justify-end w-full py-4 md:w-1/2">
              <Link to="add">
                <AddButton Text={t("Add")} />
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
              {MaterialProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("No Material Products Found")}
                  </td>
                </tr>
              ) : (
                currentMaterialProducts.map((MaterialProduct, index) => (
                  <tr className="w-full border-b-2" key={index}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * MaterialProductsPerPage + index + 1}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {MaterialProduct?.name || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {MaterialProduct.category || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {MaterialProduct.min_stock || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <Switch
                        checked={MaterialProduct.status === 1}
                        handleClick={() => {
                          handleChangeStatus(
                            MaterialProduct.id,
                            MaterialProduct.name,
                            MaterialProduct.status === 1 ? 0 : 1
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenView(MaterialProduct)}
                          title={t("View")}
                          className="text-mainColor"
                        >
                          <LuView />
                        </button>
                        <Link to={`edit/${MaterialProduct.id}`}>
                          <EditIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(MaterialProduct.id)}
                        >
                          <DeleteIcon />
                        </button>
                        {openDelete === MaterialProduct.id && (
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
                                        {MaterialProduct.name}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                      onClick={() =>
                                        handleDelete(
                                          MaterialProduct.id,
                                          MaterialProduct.name
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

                        {openView && openView.id === MaterialProduct.id && (
                          <Dialog
                            open={true}
                            onClose={handleCloseView}
                            className="relative z-10"
                          >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                              <div className="flex items-center justify-center min-h-full p-4 text-center">
                                <DialogPanel
                                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                                  className="relative overflow-hidden text-start transition-all transform bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6"
                                >
                                  <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-mainColor">{t("Product Details")}</h2>
                                    <button onClick={handleCloseView} className="text-gray-400 hover:text-gray-600">
                                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-2">
                                      <p className="text-lg"><span className="font-bold text-gray-700">{t("Name")}:</span> {openView.name}</p>
                                      <p className="text-lg"><span className="font-bold text-gray-700">{t("Category")}:</span> {openView.category}</p>
                                      <p className="text-lg"><span className="font-bold text-gray-700">{t("Min Stock")}:</span> {openView.min_stock}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-lg"><span className="font-bold text-gray-700">{t("Description")}:</span> {openView.description || "-"}</p>
                                      <p className="text-lg"><span className="font-bold text-gray-700">{t("Status")}:</span> {openView.status === 1 ? t("Active") : t("Inactive")}</p>
                                    </div>
                                  </div>

                                  <div className="mt-6">
                                    <h3 className="text-xl font-bold text-thirdColor mb-4">{t("Store-wise Stock & Cost")}</h3>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 border rounded-xl overflow-hidden">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Store")}</th>
                                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Unit")}</th>
                                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Start Stock")}</th>
                                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Cost")}</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {openView.start_stock && openView.start_stock.length > 0 ? (
                                            openView.start_stock.map((store, i) => (
                                              <tr key={i}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{store.store}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.unit}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.start_stock}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.cost} {t("egp")}</td>
                                              </tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">{t("No store data available")}</td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  <div className="mt-8 flex justify-end">
                                    <button
                                      onClick={handleCloseView}
                                      className="px-6 py-2 bg-mainColor text-white rounded-lg hover:bg-mainColor/90 transition"
                                    >
                                      {t("Close")}
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

          {MaterialProducts.length > 0 && (
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page
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

export default MaterialList;
