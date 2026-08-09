import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useGet } from "../../../../../Hooks/useGet";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useDelete } from "../../../../../Hooks/useDelete";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AddButton, LoaderLogin, Switch } from "../../../../../Components/Components";
import { IoArrowBack, IoPencil, IoTrash } from "react-icons/io5";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../../Assets/Icons/AnotherIcons/WarningIcon";

const VariationRecipe = () => {
    const { optionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");
    const productName = location.state?.productName || "";

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const { refetch, loading, data } = useGet({
        url: `${apiUrl}/admin/variation_recipe/view_recipes/${optionId}?locale=${selectedLanguage}`,
    });

    const { changeState, loadingChange } = useChangeState();
    const { deleteData, loadingDelete } = useDelete();

    const [recipes, setRecipes] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(recipes.length / itemsPerPage);
    const currentItems = recipes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        if (data && data.recipes) {
            setRecipes(data.recipes);
        }
    }, [data]);

    const handleChangeStatus = async (id, name, status) => {
        const success = await changeState(
            `${apiUrl}/admin/variation_recipe/status/${id}?status=${status}`,
            `${t("Status changed for")} ${name}`
        );
        if (success) {
            refetch();
        }
    };

    const handleDeleteClick = (id) => {
        setOpenDelete(id);
    };

    const confirmDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/variation_recipe/delete/${id}`,
            `${t("Deleted")} ${name}`
        );
        if (success) {
            setRecipes(prev => prev.filter(r => r.id !== id));
            setOpenDelete(null);
            refetch();
        }
    };

    const headers = [
        t("SL"),
        t("Store Category"),
        t("Store Product"),
        t("Weight"),
        t("Unit"),
        t("Status"),
        t("Actions"),
    ];

    if (loading) {
        return <LoaderLogin />;
    }

    // Get Variation Name from the first recipe if available, or state
    const variationName = recipes.length > 0 ? recipes[0].variation : (location.state?.variationName || "");
    const optionName = recipes.length > 0 ? recipes[0].option : (location.state?.optionName || "");
    return (
        <div className="w-full flex flex-col gap-y-3 p-4">
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {t("Variation Recipe")} {productName && <span>- <span className="text-mainColor">{productName}</span></span>}
                        </h1>
                        <div className="flex items-center justify-center gap-2">
                            {variationName && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {t("Variation")}: <span className="font-semibold text-mainColor text-base">{variationName}</span>
                                </p>
                            )}
                            {optionName && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {t("Option")}: <span className="font-semibold text-mainColor text-base">{optionName}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50 border-b-2">
                            <tr>
                                {headers.map((name, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-3 text-center text-sm font-semibold text-mainColor uppercase tracking-wider"
                                    >
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                                        {t("No recipes found")}
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((recipe, index) => (
                                    <tr key={recipe.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                                            {recipe.store_category?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                                            {recipe.store_product?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                                            {recipe.weight}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                                            {recipe.unit?.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={recipe.status === 1 || recipe.status === '1'}
                                                    handleClick={() =>
                                                        handleChangeStatus(
                                                            recipe.id,
                                                            recipe.product_name || recipe.id,
                                                            recipe.status === 1 || recipe.status === '1' ? 0 : 1
                                                        )
                                                    }
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-900">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`edit_recipe/${recipe.id}`, {
                                                        state: {
                                                            recipe: recipe,
                                                            variationName: recipe.variation,
                                                            optionName: recipe.option,
                                                            variationId: recipe.variation_id,
                                                        }
                                                    })}
                                                    className="text-white hover:text-white transition-colors p-2 bg-mainColor rounded-lg hover:bg-red-700 shadow-sm"
                                                    title={t("Edit Recipe")}
                                                >
                                                    <IoPencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(recipe.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 rounded-lg hover:bg-red-100 shadow-sm"
                                                    title={t("Delete Recipe")}
                                                >
                                                    <IoTrash size={18} />
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
                    <div className="flex justify-center items-center gap-3 py-6 bg-gray-50 border-t">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-mainColor text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-red-700"
                        >
                            {t("Prev")}
                        </button>

                        <div className="flex gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-full font-medium text-sm transition-all ${currentPage === i + 1
                                        ? "bg-mainColor text-white"
                                        : "bg-gray-100 text-mainColor hover:bg-gray-200"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-mainColor text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-red-700"
                        >
                            {t("Next")}
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {openDelete && (
                <Dialog open={true} onClose={() => setOpenDelete(null)} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                            <Warning width="64" height="64" className="mx-auto mb-4 text-red-600" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {t("Delete Recipe?")}
                            </h3>
                            <p className="text-lg text-gray-600 mb-8">
                                {t("Are you sure you want to delete")} <br />
                                <span className="font-bold text-mainColor">
                                    {t("Recipe")} #{openDelete}
                                </span>?
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setOpenDelete(null)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-full font-medium hover:bg-gray-50 transition"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    onClick={() => confirmDelete(openDelete, `Recipe #${openDelete}`)}
                                    className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition"
                                >
                                    {t("Delete")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default VariationRecipe;
