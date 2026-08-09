import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import {
    StaticLoader,
    TitlePage,
    AddButton,
} from "../../../../../../Components/Components";
import { useGet } from "../../../../../../Hooks/useGet";
import { useAuth } from "../../../../../../Context/Auth";
import { t } from "i18next";
import { IoArrowBack } from "react-icons/io5";
import { EditIcon, DeleteIcon } from "../../../../../../Assets/Icons/AllIcons";
import { useDelete } from "../../../../../../Hooks/useDelete";

const PurchaseRecipe = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const { purchaseId } = useParams();
    const location = useLocation();
    const auth = useAuth();

    const {
        refetch: refetchRecipes,
        loading: loadingRecipes,
        data: dataRecipes,
    } = useGet({ url: `${apiUrl}/admin/purchase_recipe/${purchaseId}` });

    // Add useChangeState for delete operation
    const { deleteData, loadingDelete, responseDelete } = useDelete();

    const [recipes, setRecipes] = useState([]);
    const [productName, setProductName] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 20;

    // Store the full recipe object when opening delete modal
    const [openDelete, setOpenDelete] = useState(null);

    // Pagination
    const totalPages = Math.ceil(recipes.length / recipesPerPage);
    const currentRecipes = recipes.slice(
        (currentPage - 1) * recipesPerPage,
        currentPage * recipesPerPage
    );

    useEffect(() => {
        if (dataRecipes?.recipe) {
            setRecipes(dataRecipes.recipe);
            const navName = location.state?.productName;
            if (navName) setProductName(navName);
            else if (dataRecipes.product_name) setProductName(dataRecipes.product_name);
        }
    }, [dataRecipes, location.state]);

    useEffect(() => {
        if (purchaseId) {
            refetchRecipes();
            setCurrentPage(1);
        }
    }, [purchaseId]); // Removed refetchRecipes from deps (stable from hook)

    const handleOpenDelete = (recipe) => {
        setOpenDelete(recipe);
    };

    const handleCloseDelete = () => {
        setOpenDelete(null);
    };

    // Delete Recipe
    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/recipe/delete/${id}`,
            `${name} Deleted Successfully.`
        );

        if (success) {
            setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
            handleCloseDelete();
        }
    };

    const headers = [
        t("#"),
        // t("Product"),
        t("Category"),
        t("Material"),
        t("Unit"),
        t("Weight"),
        t("Actions"),
    ];

    if (loadingRecipes) {
        return (
            <div className="flex items-center justify-center h-96">
                <StaticLoader />
            </div>
        );
    }

    return (
        <div className="p-4 pb-28">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-mainColor hover:text-red-700 transition"
                        title={t("Back")}
                    >
                        <IoArrowBack size={26} />
                    </button>
                    <TitlePage text={`${t("Recipes")}${productName ? `: ${productName}` : ""}`} />
                </div>

                <Link to="add" state={{ productName }}>
                    <AddButton Text={t("Add Recipe")} />
                </Link>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                {headers.map((h, i) => (
                                    <th
                                        key={i}
                                        className="px-6 py-4 text-xs font-medium text-mainColor uppercase tracking-wider text-center"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recipes.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} className="text-center py-12 text-gray-500">
                                        {t("No recipes found for this product")}
                                    </td>
                                </tr>
                            ) : (
                                currentRecipes.map((recipe, idx) => (
                                    <tr key={recipe.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-center text-sm text-thirdColor">
                                            {(currentPage - 1) * recipesPerPage + idx + 1}
                                        </td>
                                        {/* <td className="px-6 py-4 text-center text-sm text-thirdColor">
                                            {recipe.product?.name || "-"}
                                        </td> */}
                                        <td className="px-6 py-4 text-center text-sm text-thirdColor">
                                            {recipe.material_category?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-thirdColor">
                                            {recipe.material?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-thirdColor">
                                            {recipe.unit?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-thirdColor">
                                            {recipe.weight || "0"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-4">
                                                <Link
                                                    to={`edit/${recipe.id}`}
                                                    state={{ recipeData: recipe, productName: productName }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title={t("Edit")}
                                                >
                                                    <EditIcon size={20} />
                                                </Link>
                                                <button
                                                    onClick={() => handleOpenDelete(recipe)}
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    title={t("Delete")}
                                                    disabled={!!openDelete}
                                                >
                                                    <DeleteIcon size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 py-4 border-t flex-wrap">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded bg-mainColor text-white disabled:opacity-50"
                        >
                            {t("Prev")}
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-4 py-2 rounded ${currentPage === i + 1
                                    ? "bg-mainColor text-white"
                                    : "bg-gray-200 text-mainColor hover:bg-gray-300"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded bg-mainColor text-white disabled:opacity-50"
                        >
                            {t("Next")}
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {openDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={handleCloseDelete}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {t("Delete Recipe")}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {t("Are you sure you want to delete")}{" "}
                            <strong>"{openDelete.store_product?.name || t("this recipe")}"</strong>?
                            <br />
                            {t("This action cannot be undone.")}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCloseDelete}
                                className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                            >
                                {t("Cancel")}
                            </button>
                            <button
                                onClick={() => handleDelete(openDelete.id, openDelete.store_product?.name)}
                                disabled={loadingDelete}
                                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-70 transition flex items-center gap-2"
                            >
                                {loadingDelete ? t("Deleting...") : t("Delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseRecipe;