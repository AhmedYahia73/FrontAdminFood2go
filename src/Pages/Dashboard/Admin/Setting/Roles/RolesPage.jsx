import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useDelete } from "../../../../../Hooks/useDelete";
import { StaticLoader, Switch } from "../../../../../Components/Components";
import { DeleteIcon, EditIcon } from "../../../../../Assets/Icons/AllIcons";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Warning from "../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { Link } from "react-router-dom";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";

const RolesPage = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchRoles,
    loading: loadingRoles,
    data: dataRoles,
  } = useGet({
    url: `${apiUrl}/admin/admin_roles`,
  });
  const { t, i18n } = useTranslation();

  const { changeState, loadingChange, responseChange } = useChangeState();
  const { deleteData, loadingDelete, responseDelete } = useDelete();
  const [Roles, setRoles] = useState([]);

  const [openDelete, setOpenDelete] = useState(null);
  const navigate = useNavigate();

  const [rolesData, setRolesData] = useState([]);
  const [openPermissionsView, setOpenPermissionsView] = useState(null);

  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const RolesPerPage = 20; // Limit to 20 Roles per page

  useEffect(() => {
    refetchRoles();
  }, [refetchRoles, update]); // Empty dependency array to only call refetch once on mount

  useEffect(() => {
    if (dataRoles && dataRoles.user_positions) {
      setRoles(dataRoles.user_positions);
    }
  }, [dataRoles]); // Only run this effect when `data` changes

  // Calculate total number of pages
  const totalPages = Math.ceil(Roles.length / RolesPerPage);

  // Get the Roles for the current page
  const currentRoles = Roles.slice(
    (currentPage - 1) * RolesPerPage,
    currentPage * RolesPerPage
  );

  // handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleChangeStatus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/admin/admin_roles/status/${id}`,
      `${name} Changed Status.`,
      { status }
    );

    if (response) {
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === id ? { ...role, status: status } : role
        )
      );
    }
  };

  const handleOpenPermissionsView = (item) => setOpenPermissionsView(item);
  const handleClosePermissionsView = () => setOpenPermissionsView(null);

  const handleOpenDelete = (item) => setOpenDelete(item);
  const handleCloseDelete = () => setOpenDelete(null);

  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/admin/admin_roles/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      setRoles(Roles.filter((role) => role.id !== id));
    }
  };

  const handleEdit = (role) => {
    navigate(`/dashboard/setting/roles/edit/${role.id}`, {
      state: {
        roleData: {
          id: role.id,
          name: role.name,
          status: role.status,
          roles: role.roles || [],
        },
      },
    });
  };

  const headers = ["#", t("Name"), t("Permissions"), t("Status"), t("Action")];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loadingRoles || loadingChange || loadingDelete ? (
        <div className="w-full mt-40">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {/* الجدول */}
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
              {Roles.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="py-4 text-base text-center text-mainColor font-TextFontMedium"
                  >
                    {t("Norolesfound")}.
                  </td>
                </tr>
              ) : (
                currentRoles.map((role, index) => (
                  <tr className="w-full border-b-2" key={index}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * RolesPerPage + index + 1}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {role?.name || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <span
                        className="text-sm transition border-b cursor-pointer text-mainColor border-mainColor font-TextFontMedium hover:text-mainColor-dark"
                        onClick={() => handleOpenPermissionsView(role.id)}
                      >
                        {t("View")}
                      </span>
                    </td>
                    {openPermissionsView === role.id && (
                      <Dialog
                        open={true}
                        onClose={handleClosePermissionsView}
                        className="relative z-10"
                      >
                        <DialogBackdrop className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" />
                        <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
                          <DialogPanel className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
                            {/* Compact header */}
                            <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-white border-b">
                              <DialogTitle className="text-sm text-gray-800 font-TextFontBold">
                                {t("Permissions")}: {role.name || "Role"}
                              </DialogTitle>
                              <button
                                onClick={handleClosePermissionsView}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>

                            {/* Compact content area with limited height */}
                            <div className="px-4 py-2 max-h-[50vh] overflow-y-auto">
                              {Array.isArray(role?.roles) &&
                              role.roles.length === 0 ? (
                                <div className="py-3 text-sm text-center text-gray-500">
                                  {t("No permissions assigned")}
                                </div>
                              ) : Array.isArray(role?.roles) ? (
                                <div className="space-y-2">
                                  {Object.entries(
                                    role.roles.reduce((acc, permission) => {
                                      if (!acc[permission.role])
                                        acc[permission.role] = [];
                                      acc[permission.role].push(permission);
                                      return acc;
                                    }, {})
                                  ).map(([roleName, permissions]) => (
                                    <div key={roleName} className="text-sm">
                                      <div className="py-1 text-gray-700 capitalize font-TextFontMedium">
                                        {roleName}:
                                      </div>
                                      <div className="flex flex-wrap gap-1 pl-2 mb-2">
                                        {permissions.map((p) => (
                                          <span
                                            key={p.id}
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                              p.action === "all"
                                                ? "bg-green-100 text-green-800 font-medium"
                                                : "bg-gray-100 text-gray-800"
                                            }`}
                                          >
                                            {p.action}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-3 text-sm text-center text-red-500">
                                  {t("Invalid permissions data")}
                                </div>
                              )}
                            </div>

                            {/* Compact footer */}
                            <div className="sticky bottom-0 flex justify-end px-4 py-2 bg-white border-t">
                              <button
                                onClick={handleClosePermissionsView}
                                className="text-sm text-mainColor hover:text-mainColor-dark font-TextFontMedium"
                              >
                                {t("Close")}
                              </button>
                            </div>
                          </DialogPanel>
                        </div>
                      </Dialog>
                    )}
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <Switch
                        checked={role?.status === 1}
                        handleClick={() =>
                          handleChangeStatus(
                            role.id,
                            role.name,
                            role.status === 1 ? 0 : 1
                          )
                        }
                      />
                    </td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`edit/${role.id}`} state={{ role }}>
                          <EditIcon />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(role.id)}
                        >
                          <DeleteIcon />
                        </button>

                        {/* Dialog لتأكيد الحذف */}
                        {openDelete === role.id && (
                          <Dialog
                            open={openDelete === role.id}
                            onClose={handleCloseDelete}
                            className="relative z-10"
                          >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                              <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-sm">
                                  <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-4 sm:pb-4">
                                    <Warning
                                      width="24"
                                      height="24"
                                      aria-hidden="true"
                                    />
                                    <div className="mt-2 text-sm text-center">
                                      {t("Youareabouttodeletetherole")}{" "}
                                      <span className="font-TextFontMedium">
                                        {role?.name || "-"}
                                      </span>
                                      .
                                    </div>
                                  </div>
                                  <div className="px-4 py-2 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      className="inline-flex justify-center w-full px-4 py-2 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:ml-2 sm:w-auto hover:bg-mainColor-dark"
                                      onClick={() =>
                                        handleDelete(role.id, role.name)
                                      }
                                    >
                                      {t("ConfirmDelete")}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCloseDelete}
                                      className="inline-flex justify-center w-full px-4 py-2 mt-2 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto hover:bg-gray-50"
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
          {Roles.length > 0 && (
            <div className="flex flex-wrap items-center justify-center my-4 gap-x-2">
              {currentPage > 1 && (
                <button
                  type="button"
                  className="px-3 py-1 text-sm text-white transition rounded-md bg-mainColor font-TextFontMedium hover:bg-mainColor-dark"
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
                    className={`px-3 py-1 text-sm font-TextFontMedium rounded-md transition ${
                      currentPage === page
                        ? "bg-mainColor text-white"
                        : "text-mainColor hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {currentPage < totalPages && (
                <button
                  type="button"
                  className="px-3 py-1 text-sm text-white transition rounded-md bg-mainColor font-TextFontMedium hover:bg-mainColor-dark"
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

export default RolesPage;
