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

const BranchesPage = ({ refetch }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const {
    refetch: refetchBranches,
    loading: loadingBranches,
    data: dataBranches,
  } = useGet({ url: `${apiUrl}/admin/branch` });

  const { changeState, loadingChange } = useChangeState();
  const { deleteData, loadingDelete } = useDelete();

  const [branches, setBranches] = useState([]);
  const { t } = useTranslation();

  // Modals
  const [openDelete, setOpenDelete] = useState(null);
  const [openReasonModal, setOpenReasonModal] = useState(null);
  const [reason, setReason] = useState("");
  const [openPriority, setOpenPriority] = useState(null);
  const [priorityChange, setPriorityChange] = useState("");
  const [priorityBranchName, setPriorityBranchName] = useState("");

  // Stopped Products
  const [openStoppedModal, setOpenStoppedModal] = useState(null);
  const [stoppedProducts, setStoppedProducts] = useState([]);
  const [loadingStopped, setLoadingStopped] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const branchesPerPage = 20;
  const totalPages = Math.ceil(branches.length / branchesPerPage);
  const currentBranches = branches.slice(
    (currentPage - 1) * branchesPerPage,
    currentPage * branchesPerPage
  );

  // Refetch on mount or refetch prop
  useEffect(() => {
    refetchBranches();
  }, [refetchBranches, refetch]);

  // Update branches when data loads
  useEffect(() => {
    if (dataBranches?.branches) {
      setBranches(dataBranches.branches);
    }
  }, [dataBranches]);

  // === Change Status ===
  const handleChangeStatus = async (id, name, status, reason = "") => {
    const payload = status === 0 ? { status, block_reason: reason } : { status };
    const response = await changeState(
      `${apiUrl}/admin/branch/status/${id}`,
      `${name} status changed.`,
      payload
    );
    if (response) {
      setBranches(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  const handleSwitchClick = (branch) => {
    branch.status === 1
      ? setOpenReasonModal(branch)
      : handleChangeStatus(branch.id, branch.name, 1);
  };

  // === Delete Branch ===
  const handleDelete = async (id, name) => {
    const success = await deleteData(`${apiUrl}/admin/branch/delete/${id}`, `${name} deleted.`);
    if (success) {
      setBranches(prev => prev.filter(b => b.id !== id));
      setOpenDelete(null);
    }
  };

  // === Priority ===
  const handleOpenPriority = (id, name, order) => {
    setOpenPriority(id);
    setPriorityBranchName(name);
    setPriorityChange(order?.toString() || "");
  };

  const handleChangePriority = async () => {
    if (!openPriority || !priorityChange) return;
    const success = await changeState(
      `${apiUrl}/admin/branch/order_of_branch/${openPriority}?order=${priorityChange}`,
      `${priorityBranchName} priority updated.`,
      {}
    );
    if (success) {
      setBranches(prev => prev.map(b => b.id === openPriority ? { ...b, order: +priorityChange } : b));
      setOpenPriority(null);
      refetchBranches();
    }
  };

  // === Stopped Products - GET Method ===
  const handleOpenStoppedProducts = async (branchId) => {
    setOpenStoppedModal(branchId);
    setLoadingStopped(true);
    setStoppedProducts([]);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/admin/branch/stoped_product_in_branch/${branchId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.status === 200 && data?.products) {
        setStoppedProducts(data.products);
      } else {
        setStoppedProducts([]);
      }
    } catch (err) {
      console.error("Failed to load stopped products:", err);
      setStoppedProducts([]);
    } finally {
      setLoadingStopped(false);
    }
  };

  const handleCloseStoppedModal = () => {
    setOpenStoppedModal(null);
    setStoppedProducts([]);
  };

  // Table Headers
  const headers = [
    t("#"),
    t("Image"),
    t("Name"),
    t("City"),
    t("Address"),
    t("Phone"),
    t("PreparationTime"),
    t("Stopped Products"),
    t("kitchen"),
    t("Brista"),
    t("Category"),
    t("PreparationMan"),
    t("PhoneStatus"),
    t("Priority"),
    t("Status"),
    t("Action"),
  ];

  return (
    <div className="w-full pb-32 relative">
      {/* Global Loading */}
      {loadingBranches || loadingChange || loadingDelete ? (
        <div className="flex justify-center items-center h-96">
          <StaticLoader />
        </div>
      ) : (
        <div className="w-full">
          {/* Horizontal Scroll Wrapper */}
          <div className="overflow-x-auto scrollSection">
            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-mainColor to-mainColor text-white">
                <tr>
                  {headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-4 py-4 text-center text-sm font-medium uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentBranches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={16}
                      className="text-center py-20 text-xl text-gray-500 font-medium"
                    >
                      {t("NotfindBranches")}
                    </td>
                  </tr>
                ) : (
                  currentBranches.map((branch, idx) => (
                    <tr key={branch.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-center text-gray-600">
                        {(currentPage - 1) * branchesPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <img
                          src={branch.image_link}
                          alt={branch.name}
                          className="w-14 h-14 rounded-full object-contain mx-auto"
                        />
                      </td>
                      <td className="px-4 py-4 text-center font-medium">{branch.name || "-"}</td>
                      <td className="px-4 py-4 text-center">{branch.city?.name || "-"}</td>
                      <td className="px-4 py-4 text-center">{branch.address || "-"}</td>
                      <td className="px-4 py-4 text-center">{branch.phone || "-"}</td>
                      <td className="px-4 py-4 text-center">{branch.food_preparion_time || "-"}</td>
                      {/* Stopped Products Column */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleOpenStoppedProducts(branch.id)}
                          className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shadow"
                        >
                          {t("View")}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          to={`branch_kitchen/${branch.id}`}
                          className="text-mainColor font-bold hover:underline"
                        >
                          {t("Kitchens")}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          to={`branch_birsta/${branch.id}`}
                          className="text-mainColor font-bold hover:underline"
                        >
                          {t("Brista")}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          to={`branch_category/${branch.id}`}
                          className="text-mainColor font-bold hover:underline"
                        >
                          {t("View")}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          to={`preparation_man/${branch.id}`}
                          className="text-mainColor font-bold hover:underline"
                        >
                          {t("View")}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${branch.phone_status === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {branch.phone_status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleOpenPriority(branch.id, branch.name, branch.order)}
                          className="text-mainColor font-bold hover:underline"
                        >
                          {branch.order || "-"}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Switch
                          checked={branch.status === 1}
                          handleClick={() => handleSwitchClick(branch)}
                        />
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-4">
                          <Link to={`edit/${branch.id}`}>
                            <EditIcon />
                          </Link>
                          <button onClick={() => setOpenDelete(branch.id)}>
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Fixed Pagination */}
          {branches.length > branchesPerPage && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50">
              <div className="flex justify-center items-center gap-3 py-4 px-6 flex-wrap">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-mainColor text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mainColor-dark transition"
                >
                  {t("Prev")}
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-5 py-3 rounded-lg font-semibold transition ${currentPage === i + 1
                      ? "bg-mainColor text-white"
                      : "border border-mainColor text-mainColor hover:bg-mainColor hover:text-white"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-mainColor text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mainColor-dark transition"
                >
                  {t("Next")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === MODALS === */}

      {/* Delete Confirmation */}
      {openDelete && (
        <Dialog open onClose={() => setOpenDelete(null)}>
          <DialogBackdrop className="fixed inset-0 bg-black/40" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <DialogPanel className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
              <Warning width={20} height={20} className="mx-auto text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-800">{t("Delete Branch")}</h3>
              <p className="mt-3 text-gray-600">
                {t("Youwilldeletebranch")}{" "}
                <strong>{branches.find(b => b.id === openDelete)?.name}</strong>
              </p>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setOpenDelete(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={() =>
                    handleDelete(openDelete, branches.find(b => b.id === openDelete)?.name)
                  }
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  {t("Delete")}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Priority Modal */}
      {openPriority && (
        <Dialog open onClose={() => setOpenPriority(null)}>
          <DialogBackdrop className="fixed inset-0 bg-black/40" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <DialogPanel className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("Change Priority")}</h3>
              <p className="text-gray-600 mb-6">
                {t("Change priority for")}: <strong>{priorityBranchName}</strong>
              </p>
              <input
                type="number"
                value={priorityChange}
                onChange={e => setPriorityChange(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainColor"
                placeholder={t("Enter priority number")}
              />
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setOpenPriority(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleChangePriority}
                  className="flex-1 py-3 bg-mainColor text-white rounded-lg hover:bg-mainColor-dark font-medium"
                >
                  {t("Save")}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Deactivation Reason Modal */}
      {openReasonModal && (
        <Dialog open onClose={() => setOpenReasonModal(null)}>
          <DialogBackdrop className="fixed inset-0 bg-black/40" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <DialogPanel className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                {t("Enter Reason For Deactivation")}
              </h3>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={6}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={t("Type Reason Here")}
              />
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setOpenReasonModal(null);
                    setReason("");
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={() => {
                    handleChangeStatus(openReasonModal.id, openReasonModal.name, 0, reason);
                    setOpenReasonModal(null);
                    setReason("");
                  }}
                  disabled={!reason.trim()}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {t("Deactivate Branch")}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Stopped Products Modal */}
      {openStoppedModal && (
        <Dialog open onClose={handleCloseStoppedModal}>
          <DialogBackdrop className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <DialogPanel className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {t("Stopped Products")} – Branch #{openStoppedModal}
                </h2>
                <button
                  onClick={handleCloseStoppedModal}
                  className="text-white hover:opacity-80 transition"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto max-h-[65vh]">
                {loadingStopped ? (
                  <div className="flex justify-center py-20">
                    <StaticLoader />
                  </div>
                ) : stoppedProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-2xl text-gray-500 font-medium">
                      {t("No stopped products found")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {stoppedProducts.map(product => (
                      <div
                        key={product.id}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition"
                      >
                        <div className="p-5">
                          <h4 className="font-bold text-lg text-gray-800">{product.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-gray-100 border-t text-right">
                <button
                  onClick={handleCloseStoppedModal}
                  className="px-10 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                >
                  {t("Close")}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default BranchesPage;