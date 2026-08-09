import React, { useEffect, useRef, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
  AddButton,
  DropDown,
  NumberInput,
  StaticLoader,
  Switch,
  TextInput,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import { useDispatch } from "react-redux";
import { setCategory } from "../../../../Store/CreateSlices";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { t } from "i18next";

const CouponPage = ({ refetch, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchCoupon,
    loading: loadingCoupon,
    data: dataCoupon,
  } = useGet({
    url: `${apiUrl}/admin/coupon`,
  });
  const { deleteData, loadingDelete, responseDelete } = useDelete();
  const { changeState, loadingChange, responseChange } = useChangeState();

  const [coupons, setCoupons] = useState([]);
  const [openDelete, setOpenDelete] = useState(null);
  const [openProduct, setOpenProduct] = useState(null);

  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const couponsPerPage = 20; // Limit to 20 coupons per page

  // Calculate total number of pages
  const totalPages = Math.ceil(coupons.length / couponsPerPage);

  // Get the coupons for the current page
  const currentCoupons = coupons.slice(
    (currentPage - 1) * couponsPerPage,
    currentPage * couponsPerPage
  );

  // handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenProduct = (item) => {
    setOpenProduct(item);
  };
  const handleCloseProduct = () => {
    setOpenProduct(null);
  };

  // Change coupon status
  const handleChangeStaus = async (id, name, status) => {
    const response = await changeState(
      ` ${apiUrl}/admin/coupon/status/${id}`,
      `${name} Changed Status.`,
      { status } // Pass status as an object if changeState expects an object
    );

    if (response) {
      // Update categories only if changeState succeeded
      setCoupons((prevCoupon) =>
        prevCoupon.map((coupon) =>
          coupon.id === id ? { ...coupon, status: status } : coupon
        )
      );
    }
  };

  useEffect(() => {
    refetchCoupon();
  }, [refetchCoupon, refetch]);

  const handleOpenDelete = (item) => {
    setOpenDelete(item);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  // Delete Language
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/coupon/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      // Update Discounts only if changeState succeeded
      setCoupons(coupons.filter((coupon) => coupon.id !== id));
      setUpdate(!refetch);
    }
  };

  // Update Discounts when `data` changes
  useEffect(() => {
    if (dataCoupon && dataCoupon.coupons) {
      setCoupons(dataCoupon.coupons);
    }
  }, [dataCoupon]); // Only run this effect when `data` changes

  const headers = [
    t("SL"),
    t("Title"),
    t("Code"),
    t("Amount"),
    t("Amount Type"),
    t("Start Date"),
    t("End Date"),
    t("Product Included"),
    t("Status"),
    t("Action"),
  ];
  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loadingCoupon || loadingChange || loadingDelete ? (
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
              {coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("Not find discounts")}
                  </td>
                </tr>
              ) : (
                currentCoupons.map(
                  (
                    coupon,
                    index // Example with two rows
                  ) => (
                    <tr className="w-full border-b-2" key={index}>
                      <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {(currentPage - 1) * couponsPerPage + index + 1}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {coupon?.title || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {coupon?.code || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {coupon?.discount || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {coupon?.discount_type || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {coupon?.start_date || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {coupon?.expire_date || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {coupon.product === "all" ? (
                          <span className="text-xl text-mainColor font-TextFontSemiBold">
                            {t("All Products")}
                          </span>
                        ) : (
                          <>
                            <span
                              className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                              onClick={() => handleOpenProduct(coupon.id)}
                            >
                              {t("View")}
                            </span>

                            {openProduct === coupon.id && (
                              <Dialog
                                open={true}
                                onClose={handleCloseProduct}
                                className="relative z-10"
                              >
                                <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                  <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                    <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl">
                                      <div className="flex flex-wrap items-center justify-center w-full gap-4 px-4 my-4 sm:p-6 sm:pb-4">
                                        {coupon.products.length === 0 ? (
                                          <div className="w-full my-4 text-lg text-center text-gray-500 font-TextFontSemiBold">
                                            {t(
                                              "No Products available for this Coupon."
                                            )}
                                          </div>
                                        ) : (
                                          coupon.products.map(
                                            (product, index) => {
                                              const displayIndex = index + 1;
                                              return (
                                                <div
                                                  key={index}
                                                  className="flex items-center justify-between px-3 py-3 duration-300 shadow-md hover:shadow-none rounded-xl bg-gray-50 gap-x-2"
                                                >
                                                  <span className="text-lg capitalize text-mainColor lg:text-xl font-TextFontSemiBold">
                                                    {displayIndex}.{" "}
                                                    {product.name}
                                                  </span>
                                                </div>
                                              );
                                            }
                                          )
                                        )}
                                      </div>

                                      <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                          type="button"
                                          onClick={handleCloseProduct}
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
                          </>
                        )}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <Switch
                          checked={coupon.status === 1}
                          handleClick={() => {
                            handleChangeStaus(
                              coupon.id,
                              coupon.title,
                              coupon.status === 1 ? 0 : 1
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`edit/${coupon.id}`}>
                            <EditIcon />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(coupon.id)}
                          >
                            <DeleteIcon />
                          </button>
                          {openDelete === coupon.id && (
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
                                          {t("You will delete")} {coupon.title}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                      <button
                                        className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                        onClick={() =>
                                          handleDelete(coupon.id, coupon.title)
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
          {coupons.length > 0 && (
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

export default CouponPage;
