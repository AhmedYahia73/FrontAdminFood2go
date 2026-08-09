import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AddButton,
  StaticLoader,
  TitlePage,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet"; // ← Your existing hook
import { useTranslation } from "react-i18next";

const ManufacturingHistory = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Main manufacturing history
  const {
    refetch: refetchManufacturing,
    loading: loadingManufacturing,
    data: dataManufacturing,
  } = useGet({
    url: `${apiUrl}/admin/manufacturing/manufacturing_history`,
  });
const {t, i18n} = useTranslation();
const lang = i18n.language==="ar"
  const [Manufacturings, setManufacturings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ManufacturingsPerPage = 20;

  // State for modal and selected manufacturing ID
  const [selectedId, setSelectedId] = useState(null);

  // Use your `useGet` hook for recipe — only runs when selectedId changes
  const {
    data: recipeData,
    loading: loadingRecipe,
    refetch: refetchRecipe,
  } = useGet({
    url: selectedId
      ? `${apiUrl}/admin/manufacturing/manufacturing_recipe/${selectedId}`
      : null, // ← No request if no ID
    enabled: !!selectedId, // ← This prevents request when selectedId is null
  });

  // Extract recipe array
  const recipeItems = recipeData?.maufaturing_recipe || [];

  useEffect(() => {
    if (dataManufacturing && dataManufacturing.maufaturing) {
      setManufacturings(dataManufacturing.maufaturing);
    }
  }, [dataManufacturing]);

  useEffect(() => {
    refetchManufacturing();
  }, [refetchManufacturing]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const openRecipeModal = (id) => {
    setSelectedId(id); // Triggers useGet to fetch recipe
  };

  const closeModal = () => {
    setSelectedId(null);
  };

  const totalPages = Math.ceil(Manufacturings.length / ManufacturingsPerPage);
  const currentManufacturings = Manufacturings.slice(
    (currentPage - 1) * ManufacturingsPerPage,
    currentPage * ManufacturingsPerPage
  );

  const headers = [
    t("SL"),
    t("Product"),
    t("Store"),
    t("Quantity"),
    t("Date"),
    t("Cost"),
    t("Receipt"), // ← New column
  ];

  return (
    <div className="flex items-start justify-start w-full p-2 overflow-x-scroll pb-28 scrollSection">
      {loadingManufacturing ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex flex-col items-center justify-between mb-6 md:flex-row">
            <TitlePage text={t("Manufacturing History")} />
            <Link to="add">
              <AddButton Text={t("Add Manufacturing")} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr className="border-b-2">
                  {headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-sm text-center text-mainColor font-TextFontLight lg:text-base"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Manufacturings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className="py-10 text-xl text-center text-mainColor"
                    >
                      {t("NoManufacturingFound")}
                    </td>
                  </tr>
                ) : (
                  currentManufacturings.map((item, index) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 text-center text-thirdColor">
                        {(currentPage - 1) * ManufacturingsPerPage + index + 1}
                      </td>
                      <td className="py-3 text-center text-thirdColor">
                        {item.product || "-"}
                      </td>
                      <td className="py-3 text-center text-thirdColor">
                        {item.store || "-"}
                      </td>
                      <td className="py-3 text-center text-thirdColor">
                        {item.quantity || "0"}
                      </td>
                      <td className="py-3 text-center text-thirdColor">
                        {item.date ? formatDate(item.date) : "-"}
                      </td>
                      <td className="py-3 text-center text-thirdColor">
                        {item.cost || "0"}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => openRecipeModal(item.id)}
                          className="font-medium text-red-600 underline hover:text-red-800"
                        >
                          {t("View")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 text-white rounded-lg bg-mainColor"
                >
                  {t("Prev")}
                </button>
              )}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-full ${
                    currentPage === i + 1
                      ? "bg-mainColor text-white"
                      : "bg-gray-200 text-mainColor"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 text-white rounded-lg bg-mainColor"
                >
                  {t("Next")}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recipe Modal - Using your useGet hook */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-mainColor">
                {t("ManufacturingRecipe")}
              </h2>
              <button
                onClick={closeModal}
                className="text-3xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            {loadingRecipe ? (
              <div className="flex justify-center py-12">
                <StaticLoader />
              </div>
            ) : recipeItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead dir={lang === "ar" ? "rtl" : "ltr"}>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-sm font-medium text-gray-700 border">
                        {t("Material")}
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-700 border">
                        {t("Quantity")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeItems.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-800 border">
                          {row.material}
                        </td>
                        <td className="px-6 py-4 text-gray-800 border">
                          {row.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-10 text-center text-gray-500">
                {t("No recipe items found")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturingHistory;
