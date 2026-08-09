import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import { AddButton, StaticLoader, Switch, TitlePage } from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { t } from "i18next";

const Bundles = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Main bundles list
    const { refetch, loading, data } = useGet({ url: `${apiUrl}/admin/bundles` });

    // For single bundle details
    const [selectedBundleId, setSelectedBundleId] = useState(null);
    const {
        data: bundleDetailData,
        loading: bundleDetailLoading,
    } = useGet({
        url: selectedBundleId ? `${apiUrl}/admin/bundles/bundle_item/${selectedBundleId}` : null,
        skip: !selectedBundleId
    });

    const { changeState, loading: loadingChange } = useChangeState();
    const { deleteData, loading: loadingDelete } = useDelete();

    const [bundles, setBundles] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const [deleteBundleName, setDeleteBundleName] = useState(null); // ← Added for delete modal
    const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
    const [selectedBundle, setSelectedBundle] = useState(null);
    const [bundleProducts, setBundleProducts] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(bundles.length / itemsPerPage);
    const currentItems = bundles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        if (data && data?.bundles) {
            setBundles(data.bundles);
        }
    }, [data]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Handle bundle detail data when loaded
    useEffect(() => {
        if (bundleDetailData && selectedBundleId) {
            const bundleInfo = {
                id: bundleDetailData.id,
                name: bundleDetailData.name ||
                    bundleDetailData.bundle_names?.find(n => n.tranlation_name === "en")?.name ||
                    bundleDetailData.bundle_names?.[0]?.name ||
                    "No name",
                description: bundleDetailData.description ||
                    bundleDetailData.bundle_decriptions?.find(d => d.tranlation_name === "en")?.name ||
                    bundleDetailData.bundle_decriptions?.[0]?.name ||
                    "No description",
                image: bundleDetailData.image || null,
                price: bundleDetailData.price || 0,
                discount: bundleDetailData.discount || "—",
                tax: bundleDetailData.tax || "—",
                points: bundleDetailData.points || 0,
            };

            setSelectedBundle(bundleInfo);
            setBundleProducts(bundleDetailData.products || []);
            setIsProductsModalOpen(true);
        }
    }, [bundleDetailData, selectedBundleId]);

    const handleStatusChange = async (id, name, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const success = await changeState(
            `${apiUrl}/admin/bundles/status/${id}`,
            `${name} status updated`,
            { status: newStatus }
        );
        if (success) {
            setBundles(prev => prev.map(b => (b.id === id ? { ...b, status: newStatus } : b)));
        }
    };

    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/bundles/delete/${id}`,
            `${name} deleted successfully`
        );
        if (success) {
            setBundles(prev => prev.filter(b => b.id !== id));
            setOpenDelete(null);
            setDeleteBundleName(null);
        }
    };

    const showBundleProducts = (bundleId) => {
        setSelectedBundleId(bundleId);
    };

    const closeProductsModal = () => {
        setIsProductsModalOpen(false);
        setSelectedBundle(null);
        setBundleProducts([]);
        setSelectedBundleId(null);
    };

    const openDeleteModal = (id, name) => {
        setOpenDelete(id);
        setDeleteBundleName(name);
    };

    return (
        <div className="p-4">
            {(loading || loadingChange || loadingDelete || bundleDetailLoading) ? (
                <div className="flex justify-center py-20">
                    <StaticLoader />
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <TitlePage text={t("Bundles")} />
                        <Link to="add">
                            <AddButton Text={t("Add")} />
                        </Link>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">SL</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Image")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Name")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Price")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Products")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Status")}</th>
                                        <th className="px-6 py-4 text-center text-mainColor font-medium text-sm">{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-16 text-gray-500 text-lg">
                                                {t("No bundles found")}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((bundle, i) => (
                                            <tr key={bundle.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="text-center py-5 text-gray-700">
                                                    {(currentPage - 1) * itemsPerPage + i + 1}
                                                </td>
                                                <td className="text-center py-5">
                                                    <div className="flex items-center justify-center">
                                                        <img
                                                            src={bundle.image}
                                                            alt={bundle.name}
                                                            className="w-16 h-16 object-cover rounded-full"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="text-center py-5 font-medium text-gray-800">{bundle.name}</td>
                                                <td className="text-center py-5 text-gray-600">{bundle.price || "—"}</td>

                                                <td className="text-center py-5">
                                                    <button
                                                        onClick={() => showBundleProducts(bundle.id)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
                                                    >
                                                        {t("View Products")}
                                                    </button>
                                                </td>

                                                <td className="text-center py-5">
                                                    <Switch
                                                        checked={bundle.status === 1}
                                                        handleClick={() => handleStatusChange(bundle.id, bundle.name, bundle.status)}
                                                    />
                                                </td>
                                                <td className="text-center py-5">
                                                    <div className="flex justify-center gap-4">
                                                        <Link to={`edit/${bundle.id}`}>
                                                            <EditIcon className="w-5 h-5 text-mainColor hover:text-blue-700" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openDeleteModal(bundle.id, bundle.name)}
                                                        >
                                                            <DeleteIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
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
                            <div className="flex justify-center items-center gap-3 py-6 bg-gray-50">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-5 py-2 bg-mainColor text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t("Prev")}
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 rounded-full font-medium transition-all ${currentPage === i + 1
                                                ? "bg-mainColor text-white"
                                                : "bg-gray-200 text-mainColor hover:bg-gray-300"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-5 py-2 bg-mainColor text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Products Details Dialog */}
            {isProductsModalOpen && selectedBundle && (
                <Dialog open={isProductsModalOpen} onClose={closeProductsModal} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-60" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-mainColor">{selectedBundle.name}</h2>
                                    <p className="text-gray-600 mt-2">{selectedBundle.description}</p>
                                </div>
                                {selectedBundle.image && (
                                    <img
                                        src={selectedBundle.image}
                                        alt={selectedBundle.name}
                                        className="w-32 h-32 object-cover rounded-xl border shadow-sm"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500">Price</p>
                                    <p className="font-semibold text-lg">{selectedBundle.price}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500">Discount</p>
                                    <p className="font-semibold text-lg">{selectedBundle.discount}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500">Tax</p>
                                    <p className="font-semibold text-lg">{selectedBundle.tax}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-500">Points</p>
                                    <p className="font-semibold text-lg">{selectedBundle.points}</p>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mb-5">{t("Selected Products & Variations")}</h3>

                            {bundleDetailLoading ? (
                                <div className="flex justify-center py-12">
                                    <StaticLoader />
                                </div>
                            ) : bundleProducts.length === 0 ? (
                                <p className="text-center text-gray-500 py-12">No products found in this bundle</p>
                            ) : (
                                <div className="space-y-6">
                                    {bundleProducts.map(product => (
                                        <div key={product.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                                            <h4 className="font-bold text-lg mb-4 text-gray-800">{product.name}</h4>

                                            {product.variations?.length > 0 ? (
                                                <div className="space-y-5">
                                                    {product.variations.map(variation => (
                                                        <div key={variation.id} className="pl-4 border-l-4 border-indigo-300">
                                                            <p className="font-medium text-indigo-700 mb-2">
                                                                {variation.variation}
                                                                {variation.type === "multiple" && ` (${variation.min || 0} - ${variation.max || "∞"})`}
                                                            </p>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {variation.options
                                                                    ?.filter(opt => opt.selected === 1)
                                                                    .map(opt => (
                                                                        <div
                                                                            key={opt.id}
                                                                            className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                                                                        >
                                                                            <span className="font-medium">{opt.name}</span>
                                                                            <span className="text-green-600 font-semibold">+{opt.price}</span>
                                                                        </div>
                                                                    ))}

                                                                {variation.options?.filter(opt => opt.selected === 1).length === 0 && (
                                                                    <span className="text-gray-500 italic text-sm">No option selected</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">No variations available</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-10 text-center">
                                <button
                                    onClick={closeProductsModal}
                                    className="px-10 py-3 bg-mainColor text-white rounded-full font-medium hover:bg-opacity-90 transition"
                                >
                                    {t("Close")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog - FIXED */}
            {openDelete && (
                <Dialog open={true} onClose={() => {
                    setOpenDelete(null);
                    setDeleteBundleName(null);
                }}>
                    <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                            <Warning width="64" height="64" className="mx-auto mb-4 text-red-600" />
                            <h3 className="text-xl font-bold mb-4">
                                {t("Delete")} {deleteBundleName ? `"${deleteBundleName}"` : "this bundle"}?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {t("This action cannot be undone.")}
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => {
                                        setOpenDelete(null);
                                        setDeleteBundleName(null);
                                    }}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-100"
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    onClick={() => handleDelete(openDelete, deleteBundleName)}
                                    className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700"
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

export default Bundles;