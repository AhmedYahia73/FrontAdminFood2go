import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useGet } from "../../../../Hooks/useGet";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { LoaderLogin } from "../../../../Components/Components";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { IoArrowBack, IoAddCircle, IoPencil } from "react-icons/io5";

const ProductVariation = () => {
    const { productId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");
    const productName = location.state?.product_name || "";

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const { refetch, loading, data } = useGet({
        url: `${apiUrl}/admin/variation_recipe/view_variations/${productId}?locale=${selectedLanguage}`,
    });

    const [variations, setVariations] = useState([]);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (data && data.variations) {
            setVariations(data.variations);
        }
    }, [data]);

    const handleViewOptions = (variation) => {
        setSelectedVariation(variation);
        setIsOptionsOpen(true);
    };

    const handleCloseOptions = () => {
        setSelectedVariation(null);
        setIsOptionsOpen(false);
    };

    const handleNavigateToRecipes = (optionId) => {
        // Navigate to Variation Recipe page with Option ID
        navigate(`variation_recipe/${optionId}`, { relative: "path", state: { productName: productName } });
    };

    const headers = [
        t("#"),
        t("Variation Name"),
        t("Options"),
        t("Recipes"),
    ];

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentVariations = variations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(variations.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return <LoaderLogin />;
    }

    return (
        <div className="w-full flex flex-col gap-y-3 p-4">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                    <IoArrowBack size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">
                    {t("Product")}: <span className="text-mainColor">{productName}</span>
                </h1>
            </div>

            <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm">
                <table className="w-full min-w-[600px]">
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
                        {currentVariations.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                                    {t("No variations found")}
                                </td>
                            </tr>
                        ) : (
                            currentVariations.map((variation, index) => (
                                <tr key={variation.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                                        {indexOfFirstItem + index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                                        {variation.name}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                                        <button
                                            onClick={() => handleViewOptions(variation)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-mainColor rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mainColor"
                                        >
                                            {t("View Options")}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`add`, { state: { productName: productName } })}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                                                title={t("Add Recipes")}
                                            >
                                                <IoAddCircle size={22} />
                                                <span className="text-sm font-semibold">{t("Add")}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        {t("Previous")}
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 text-sm border rounded ${currentPage === page
                                ? "bg-mainColor text-white border-mainColor"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        {t("Next")}
                    </button>
                </div>
            )}

            {/* Options Modal */}
            <Dialog
                open={isOptionsOpen}
                onClose={handleCloseOptions}
                className="relative z-50"
            >
                <DialogBackdrop className="fixed inset-0 bg-black/30 bg-opacity-75 transition-opacity" />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 border-b pb-2">
                                {t("Options for")} {selectedVariation?.name}
                            </h3>

                            <div className="mt-2 max-h-[60vh] overflow-y-auto">
                                {selectedVariation?.options && selectedVariation.options.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t("#")}</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t("Option Name")}</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t("Recipes")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedVariation.options.map((option, idx) => (
                                                <tr key={option.id}>
                                                    <td className="px-4 py-2 text-center text-sm text-gray-500">{idx + 1}</td>
                                                    <td className="px-4 py-2 text-center text-sm font-medium text-gray-900">{option.name}</td>
                                                    <td className="px-4 py-2 text-center text-sm text-gray-500">
                                                        <button
                                                            onClick={() => handleNavigateToRecipes(option.id)}
                                                            className="text-blue-600 hover:text-blue-900 underline cursor-pointer"
                                                        >
                                                            {t("View Recipes")}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">{t("No options available")}</p>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-mainColor px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                    onClick={handleCloseOptions}
                                >
                                    {t("Close")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ProductVariation;