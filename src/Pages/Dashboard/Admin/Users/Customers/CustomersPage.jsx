import React, { useEffect, useRef, useState } from "react";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useDelete } from "../../../../../Hooks/useDelete";
import { StaticLoader, Switch } from "../../../../../Components/Components";
import { Link, useNavigate } from "react-router-dom";
import { DeleteIcon, EditIcon } from "../../../../../Assets/Icons/AllIcons";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import SearchBar from "../../../../../Components/AnotherComponents/SearchBar";
import * as XLSX from 'xlsx';

const CustomersPage = ({ refetch, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { t } = useTranslation();

  // --- SERVER-SIDE STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef(null);

  // Debounce search input → reset to page 1 on new search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 500);
  };

  // Build API params: page + optional search key
  const apiParams = {
    page: currentPage,
    ...(debouncedSearch.trim() !== "" && { search: debouncedSearch.trim() }),
  };

  const {
    refetch: refetchCustomer,
    loading: loadingCustomer,
    data: dataCustomer,
  } = useGet({
    url: `${apiUrl}/admin/customer`,
    params: apiParams,
    queryKey: ["customers", currentPage, debouncedSearch],
  });

  const { changeState, loadingChange } = useChangeState();
  const { deleteData, loadingDelete } = useDelete();

  const [openDelete, setOpenDelete] = useState(null);
  const [customers, setCustomers] = useState([]);

  // Pagination meta from API response
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(20);

  // --- EXPORT / SELECTION STATE ---
  const [selectedCustomerIds, setSelectedCustomerIds] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Sync API response into local state
  useEffect(() => {
    if (dataCustomer) {
      // Support both paginated { data, meta } and flat { customers } shapes
      const list =
        dataCustomer?.customers?.data ??
        dataCustomer?.data ??
        dataCustomer?.customers ??
        [];

      const meta =
        dataCustomer?.customers?.meta ??
        dataCustomer?.meta ??
        dataCustomer?.customers ??
        null;

      setCustomers(Array.isArray(list) ? list : []);

      if (meta && typeof meta === "object" && !Array.isArray(meta)) {
        setTotalPages(meta.last_page ?? 1);
        setTotalCount(meta.total ?? list.length);
        setPerPage(meta.per_page ?? 20);
      } else {
        // Flat list fallback — no server pagination info
        const flatList = Array.isArray(list) ? list : [];
        setTotalPages(1);
        setTotalCount(flatList.length);
      }

      setSelectedCustomerIds(new Set());
    }
  }, [dataCustomer]);

  // Re-fetch when parent triggers a refetch
  useEffect(() => {
    refetchCustomer();
  }, [refetch]);

  // --- SELECTION / EXPORT HELPERS ---
  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedCustomerIds(new Set());
  };

  const isCustomerSelected = (id) => selectedCustomerIds.has(id);

  const handleSelectOne = (id) => {
    setSelectedCustomerIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const visibleIds = customers.map((c) => c.id);
    const allSelected = visibleIds.every((id) => selectedCustomerIds.has(id));
    setSelectedCustomerIds((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const handleExportSelectedToExcel = () => {
    if (selectedCustomerIds.size === 0) {
      alert(t("Please select at least one customer to export."));
      return;
    }
    const selectedData = customers.filter((c) => selectedCustomerIds.has(c.id));
    const exportData = selectedData.map((c) => ({
      [t("Code")]: c.code || "",
      [t("Name")]: `${c.f_name || ""} ${c.l_name || ""}`,
      [t("Email")]: c.email || "",
      [t("Phone")]: c.phone || "",
      [t("Due Status")]: c.due_status === 1 ? t("Active") : t("Inactive"),
      [t("Total Order")]: c.orders_count || 0,
      [t("Total Order Amount")]: c.orders_sum_amount || 0,
      [t("Status")]: c.status === 1 ? t("Active") : t("Inactive"),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("Customers"));
    XLSX.writeFile(wb, "Selected_Customers.xlsx");
    setIsSelectionMode(false);
    setSelectedCustomerIds(new Set());
  };

  // --- STATUS / DELETE ---
  const handleChangeStaus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/admin/customer/status/${id}`,
      `${name} Changed Status.`,
      { status }
    );
    if (response) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    }
  };

  const handleOpenDelete = (item) => setOpenDelete(item);
  const handleCloseDelete = () => setOpenDelete(null);

  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/customer/delete/${id}`,
      `${name} Deleted Success.`
    );
    if (success) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setUpdate(!refetch);
    }
  };

  const handleUserNameClick = (customer) => {
    navigate(`customer/${customer.id}`, { state: { customerData: customer } });
  };

  // --- TABLE HEADERS ---
  let headers = [];
  if (isSelectionMode) {
    const allSelected =
      customers.length > 0 &&
      customers.every((c) => selectedCustomerIds.has(c.id));
    headers.push(
      <input
        type="checkbox"
        checked={allSelected}
        onChange={handleSelectAll}
        className="form-checkbox h-5 w-5 text-mainColor rounded cursor-pointer"
        title={t("Select All")}
      />
    );
  }
  headers = headers.concat([
    t("SL"),
    t("Image"),
    t("Code"),
    t("Name"),
    t("Email"),
    t("Phone"),
    t("Due Status"),
    t("Total Order"),
    t("Total Order Amount"),
    t("Status"),
    t("Action"),
  ]);

  // --- PAGINATION HELPERS ---
  const handlePageChange = (page) => {
    if (page !== "..." && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const buildPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      let adjStart = start;
      let adjEnd = end;
      if (currentPage <= 4) adjEnd = 5;
      if (currentPage > totalPages - 4) adjStart = totalPages - 4;
      for (
        let i = Math.max(2, adjStart);
        i <= Math.min(totalPages - 1, adjEnd);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const startRecord = customers.length > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endRecord = Math.min(currentPage * perPage, totalCount);

  return (
    <div className="flex flex-col items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between w-full mb-6 gap-4">
        {/* Search Bar */}
        <div className="max-w-md w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            handleChange={handleSearchChange}
            placeholder={t("Search customers...")}
            bgColor="bg-white"
            textColor="mainColor"
            pr="4"
          />
          {debouncedSearch && (
            <p className="mt-2 text-sm text-gray-600">
              {t("Found")} {totalCount} {t("customers matching")} &ldquo;{debouncedSearch}&rdquo;
            </p>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-3">
          {isSelectionMode ? (
            <>
              <button
                type="button"
                onClick={handleExportSelectedToExcel}
                disabled={selectedCustomerIds.size === 0}
                className={`px-4 py-2 text-sm font-TextFontSemiBold text-white rounded-lg transition duration-150 ${
                  selectedCustomerIds.size > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {t("Export Selected")} ({selectedCustomerIds.size})
              </button>
              <button
                type="button"
                onClick={toggleSelectionMode}
                className="px-4 py-2 text-sm font-TextFontSemiBold text-gray-700 rounded-lg bg-gray-200 hover:bg-gray-300 transition duration-150"
              >
                {t("Cancel Selection")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleSelectionMode}
              className="px-4 py-2 text-sm font-TextFontSemiBold text-white rounded-lg bg-red-600 hover:bg-red-700 transition duration-150"
            >
              {t("Export Customers")}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-start justify-start w-full">
        {loadingCustomer || loadingChange || loadingDelete ? (
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        ) : (
          <div className="flex flex-col w-full">
            <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
              <thead className="w-full">
                <tr className="w-full border-b-2">
                  {headers.map((content, index) => (
                    <th
                      className="min-w-[50px] sm:w-[5%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3"
                      key={index}
                    >
                      {content}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="w-full">
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className="text-xl text-center text-mainColor font-TextFontMedium"
                    >
                      {debouncedSearch
                        ? t("No customers found matching your search")
                        : t("NotfindCustomers")}
                    </td>
                  </tr>
                ) : (
                  customers.map((customer, index) => (
                    <tr className="w-full border-b-2" key={customer.id}>

                      {/* Checkbox cell */}
                      {isSelectionMode && (
                        <td className="min-w-[50px] sm:w-[5%] lg:w-[5%] py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isCustomerSelected(customer.id)}
                            onChange={() => handleSelectOne(customer.id)}
                            className="form-checkbox h-5 w-5 text-mainColor rounded cursor-pointer"
                          />
                        </td>
                      )}

                      <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 overflow-hidden">
                        <div className="flex justify-center">
                          <img
                            src={customer.image_link}
                            className="rounded-full bg-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                            alt="Photo"
                          />
                        </div>
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {customer?.code || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <button
                          onClick={() => handleUserNameClick(customer)}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
                        >
                          {customer?.f_name + " " + customer?.l_name || "-"}
                        </button>
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {customer?.email || "-"}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {customer?.phone || "-"}
                      </td>
                      <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            customer?.due_status === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer?.due_status === 1 ? t("Active") : t("Inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-center lg:text-base">
                        <span className="px-2 py-1 text-blue-500 rounded-md bg-cyan-200">
                          {customer?.orders_count || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-center lg:text-base">
                        <span className="px-2 py-1 text-blue-500 rounded-md bg-cyan-200">
                          {customer?.orders_sum_amount || "-"}
                        </span>
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <Switch
                          checked={customer.status}
                          handleClick={() =>
                            handleChangeStaus(
                              customer.id,
                              customer?.f_name + " " + customer?.l_name,
                              customer.status === 1 ? 0 : 1
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`edit/${customer.id}`}>
                            <EditIcon />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(customer.id)}
                          >
                            <DeleteIcon />
                          </button>
                          {openDelete === customer.id && (
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
                                      <Warning width="28" height="28" aria-hidden="true" />
                                      <div className="flex items-center">
                                        <div className="mt-2 text-center">
                                          {t("Youwilldeletecustomer")}{" "}
                                          {customer?.f_name + " " + customer?.l_name || "-"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                      <button
                                        className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                        onClick={() =>
                                          handleDelete(
                                            customer.id,
                                            customer?.f_name + " " + customer?.l_name
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-2 my-6">
                {/* Record info */}
                <p className="text-sm text-gray-500">
                  {t("Showing")} {startRecord}–{endRecord} {t("of")} {totalCount} {t("customers")}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-x-4">
                  {/* Prev */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-lg rounded-xl font-TextFontMedium transition-all duration-200 ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-mainColor text-white hover:bg-opacity-90 active:scale-95"
                    }`}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    {t("Prev")}
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {buildPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        disabled={page === "..."}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 px-2 sm:px-3 text-sm sm:text-lg font-TextFontSemiBold rounded-full transition-all duration-300 ${
                          page === "..."
                            ? "text-gray-400 cursor-default"
                            : currentPage === page
                            ? "bg-mainColor text-white shadow-md scale-110"
                            : "text-mainColor hover:bg-gray-100 active:scale-90"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-lg rounded-xl font-TextFontMedium transition-all duration-200 ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-mainColor text-white hover:bg-opacity-90 active:scale-95"
                    }`}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    {t("Next")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;