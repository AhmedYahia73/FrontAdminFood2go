import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useGet } from "../../../../../../Hooks/useGet";
import { useDelete } from "../../../../../../Hooks/useDelete";
import { useChangeState } from "../../../../../../Hooks/useChangeState";
import { usePost } from "../../../../../../Hooks/usePostJson";
import {
    AddButton,
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TitleSection,
} from "../../../../../../Components/Components";
import { DeleteIcon, EditIcon } from "../../../../../../Assets/Icons/AllIcons";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import Warning from "../../../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "primereact/multiselect";
import { IoAddCircleOutline } from "react-icons/io5";
import { useSelector } from "react-redux";

const KitchenType = () => {
    const { branchId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");
    const [branchType, setBranchType] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [openDelete, setOpenDelete] = useState(null);
    const [openProductModal, setOpenProductModal] = useState(null);
    const [openProductsModal, setOpenProductsModal] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const typesPerPage = 20;
    const isBirsta = location.pathname.includes("branch_birsta");

    const endpoint = isBirsta
        ? `${apiUrl}/admin/pos/kitchens/brista?branch_id=${branchId}`
        : `${apiUrl}/admin/pos/kitchens?branch_id=${branchId}`;

    const { refetch: refetchType, loading: loadingType, data: dataType } = useGet({ url: endpoint });
    const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({
        url: `${apiUrl}/admin/pos/kitchens/lists?locale=${selectedLanguage}`,
    });

    const { deleteData, loadingDelete } = useDelete();
    const { changeState } = useChangeState();
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/pos/kitchens/select_product`,
    });

    // Pagination with useMemo
    const totalPages = Math.ceil(branchType.length / typesPerPage);
    const currentTypes = useMemo(() => {
        return branchType.slice(
            (currentPage - 1) * typesPerPage,
            currentPage * typesPerPage
        );
    }, [branchType, currentPage]);

    // Reset page if current page exceeds total after delete
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    useEffect(() => {
        refetchType();
        refetchList();
    }, [selectedLanguage]);

    useEffect(() => {
        if (dataType && (dataType.kitchens || dataType.brista)) {
            setBranchType(dataType.kitchens || dataType.brista);
        }
    }, [dataType]);

    useEffect(() => {
        if (dataList) {
            setProducts(dataList.products || []);
            setCategories(dataList.category || []);
            setFilteredProducts(dataList.products || []);
        }
    }, [dataList]);

    // Smart filtering for products
    useEffect(() => {
        if (selectedCategories.length > 0) {
            const catIds = selectedCategories.map((c) => c.id);
            const filtered = products.filter((product) =>
                catIds.some((id) =>
                    id == product.category_id || id == product.sub_category_id
                )
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [selectedCategories, products]);

    // Close modal and refetch after save
    useEffect(() => {
        if (!loadingPost && response) {
            handleCloseProductModal();
            refetchType();
        }
    }, [response, loadingPost]);

    const handleChangeStatus = async (id, name, status) => {
        const res = await changeState(
            `${apiUrl}/admin/pos/kitchens/status/${id}`,
            t("StatusChangedSuccess", { name }),
            { status }
        );
        if (res) {
            setBranchType((prev) =>
                prev.map((type) => (type.id === id ? { ...type, status } : type))
            );
        }
    };

    const handleOpenProductsModal = (type) => setOpenProductsModal(type);
    const handleCloseProductsModal = () => setOpenProductsModal(null);

    const handleOpenDelete = (id) => setOpenDelete(id);
    const handleCloseDelete = () => setOpenDelete(null);

    const handleDelete = async (id, name) => {
        const success = await deleteData(
            `${apiUrl}/admin/pos/kitchens/delete/${id}`,
            t("DeletedSuccess", { name })
        );
        if (success) {
            setBranchType((prev) => prev.filter((type) => type.id !== id));
            handleCloseDelete();
        }
    };

    // FIXED: Match by ID and use exact objects from master lists
    const handleOpenProductModal = (kitchenId) => {
        const kitchen = branchType.find((k) => k.id == kitchenId);
        if (!kitchen) return;

        setOpenProductModal(kitchenId);

        // Match assigned categories with the ones from /lists endpoint
        const assignedCategories = (kitchen.category || [])
            .map((cat) => categories.find((c) => c.id == cat.id))
            .filter(Boolean);

        setSelectedCategories(assignedCategories);

        // Match assigned products ONLY (don't auto-add all products from categories)
        const assignedProducts = (kitchen.products || [])
            .map((prod) => products.find((p) => p.id == prod.id))
            .filter(Boolean);

        setSelectedProducts(assignedProducts);

        // The filtered products will be set by the useEffect based on selectedCategories
    };

    const handleCloseProductModal = () => {
        setOpenProductModal(null);
        setSelectedProducts([]);
        setSelectedCategories([]);
        setFilteredProducts(products);
    };

    // Send clean JSON instead of FormData
    const handleAddProducts = async () => {
        const payload = {
            kitchen_id: openProductModal,
            product_id: selectedProducts.map((p) => p.id),
            category_id: selectedCategories.map((c) => c.id),
        };

        postData(
            payload,
            t("ProductsAddedSuccess", { type: t(isBirsta ? "Birsta" : "Kitchen") })
        );
    };

    const formatTimeDisplay = (time) => {
        if (!time) return "-";
        if (time.includes(":")) {
            const parts = time.split(":");
            return parts[2] === "00" ? `${parts[0]}:${parts[1]}` : time;
        }
        return time;
    };

    const headers = [
        "#",
        t("Name"),
        t("Branch"),
        t("Preparing Time"),
        t("Products"),
        t("Printer Module"),
        t("Status"),
        t("Action"),
    ];

    return (
        <div className="w-full pb-28">
            {loadingType || loadingList || loadingDelete || loadingPost ? (
                <div className="w-full mt-40">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full gap-5">
                    <div className="w-full flex justify-between mt-5">
                        <TitleSection text={t(isBirsta ? "Birsta Table" : "Kitchen Table")} />
                        <AddButton handleClick={() => navigate("add")} />
                    </div>

                    {branchType.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl mb-4">{t("Not Found Types")}</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full overflow-x-scroll sm:min-w-0 scrollPage">
                                <thead>
                                    <tr className="w-full border-b-2">
                                        {headers.map((name, i) => (
                                            <th
                                                key={i}
                                                className="min-w-[120px] text-mainColor text-center font-TextFontLight pb-3"
                                            >
                                                {name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTypes.map((type, index) => (
                                        <tr key={type.id} className="border-b-2">
                                            <td className="text-center py-2">
                                                {(currentPage - 1) * typesPerPage + index + 1}
                                            </td>
                                            <td className="text-center py-2">{type.name || "-"}</td>
                                            <td className="text-center py-2">{type.branch?.name || "-"}</td>
                                            <td className="text-center py-2">
                                                {formatTimeDisplay(type.preparing_time)}
                                            </td>
                                            <td className="text-center py-2">
                                                <button
                                                    onClick={() => handleOpenProductsModal(type)}
                                                    className="px-4 py-2 bg-mainColor text-white rounded-full text-sm hover:bg-opacity-90"
                                                >
                                                    {type.products?.length || 0} {t("Products")}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Link
                                                    to={`printer_module/${type.id}`} state={{ kitchenName: type?.name }}
                                                    className="text-mainColor font-bold hover:underline"
                                                >
                                                    {t("View")}
                                                </Link>
                                            </td>
                                            <td className="text-center py-2">
                                                <Switch
                                                    checked={type.status === 1}
                                                    handleClick={() =>
                                                        handleChangeStatus(
                                                            type.id,
                                                            type.name,
                                                            type.status === 1 ? 0 : 1
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="text-center py-3">
                                                <div className="flex justify-center gap-3">
                                                    <Link to={`edit/${type.id}`} state={{ type, isBirsta }}>
                                                        <EditIcon />
                                                    </Link>
                                                    <button onClick={() => handleOpenDelete(type.id)}>
                                                        <DeleteIcon />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenProductModal(type.id)}
                                                        title={t("AddProduct")}
                                                    >
                                                        <IoAddCircleOutline className="text-2xl text-mainColor" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 my-6 flex-wrap">
                                    {currentPage > 1 && (
                                        <button
                                            onClick={() => setCurrentPage((p) => p - 1)}
                                            className="px-4 py-2 bg-mainColor text-white rounded-xl"
                                        >
                                            {t("Prev")}
                                        </button>
                                    )}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4 py-2 rounded-full ${currentPage === page
                                                ? "bg-mainColor text-white"
                                                : "text-mainColor border border-mainColor"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    {currentPage < totalPages && (
                                        <button
                                            onClick={() => setCurrentPage((p) => p + 1)}
                                            className="px-4 py-2 bg-mainColor text-white rounded-xl"
                                        >
                                            {t("Next")}
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* View Products Modal */}
            {openProductsModal && (
                <Dialog open={true} onClose={handleCloseProductsModal} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-lg max-w-md w-full p-6 max-h-screen overflow-y-auto">
                            <DialogTitle className="text-xl font-bold text-mainColor mb-4">
                                {t("Products")} - {openProductsModal.name}
                            </DialogTitle>
                            {openProductsModal.products?.length > 0 ? (
                                <div className="space-y-3">
                                    {openProductsModal.products.map((p) => (
                                        <div key={p.id} className="p-3 bg-gray-50 rounded border">
                                            <div className="font-medium">{p.name}</div>
                                            {p.description && (
                                                <div className="text-sm text-gray-600 mt-1">{p.description}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">{t("NoProducts")}</p>
                            )}
                            <button
                                onClick={handleCloseProductsModal}
                                className="mt-6 w-full py-3 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                {t("Close")}
                            </button>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}

            {/* Add/Edit Products Modal */}
            {openProductModal && (
                <Dialog open={true} onClose={handleCloseProductModal} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-lg max-w-lg w-full p-6 relative">
                            <DialogTitle className="text-2xl font-bold text-mainColor mb-6">
                                {t("AddProductsTo", {
                                    name: branchType.find((k) => k.id === openProductModal)?.name,
                                })}
                            </DialogTitle>

                            {loadingPost && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                                    <StaticLoader />
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        {t("SelectCategories")}
                                    </label>
                                    <MultiSelect
                                        value={selectedCategories}
                                        onChange={(e) => {
                                            const newCats = e.value || [];
                                            const oldCatIds = selectedCategories.map((c) => c.id);
                                            const newCatIds = newCats.map((c) => c.id);

                                            // Determine which categories were added and which were removed
                                            const addedCats = newCats.filter(
                                                (c) => !oldCatIds.includes(c.id)
                                            );
                                            const removedCatIds = oldCatIds.filter(
                                                (id) => !newCatIds.includes(id)
                                            );

                                            // Products to add from new categories
                                            const productsToAdd = addedCats.flatMap((cat) =>
                                                products.filter((p) => p.category_id == cat.id)
                                            );

                                            setSelectedProducts((prev) => {
                                                // 1. Remove products belonging to categories that were just unselected
                                                let updatedProducts = prev.filter(
                                                    (p) => !removedCatIds.some(id => id == p.category_id)
                                                );

                                                // 2. Add products from newly selected categories (avoid duplicates)
                                                const existingIds = updatedProducts.map((p) => p.id);
                                                const uniqueNew = productsToAdd.filter(
                                                    (p) => !existingIds.some(id => id == p.id)
                                                );

                                                return [...updatedProducts, ...uniqueNew];
                                            });

                                            setSelectedCategories(newCats);
                                        }}
                                        options={categories}
                                        optionLabel="name"
                                        placeholder={t("SelectCategories")}
                                        display="chip"
                                        filter
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        {t("SelectProducts")}
                                    </label>
                                    <MultiSelect
                                        value={selectedProducts}
                                        onChange={(e) => setSelectedProducts(e.value)}
                                        options={filteredProducts}
                                        optionLabel="name"
                                        placeholder={t("SelectProducts")}
                                        display="chip"
                                        filter
                                        className="w-full"
                                        disabled={loadingPost}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <StaticButton
                                    text={loadingPost ? t("Submitting") : t("save")}
                                    handleClick={handleAddProducts}
                                    disabled={loadingPost || selectedProducts.length === 0}
                                />
                                <StaticButton
                                    text={t("Cancel")}
                                    handleClick={handleCloseProductModal}
                                    bgColor="bg-gray-200"
                                    Color="text-gray-800"
                                />
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}

            {/* Delete Confirmation */}
            {openDelete && (
                <Dialog open={true} onClose={handleCloseDelete} className="relative z-50">
                    <DialogBackdrop className="fixed inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
                            <Warning className="mx-auto mb-4" width={48} height={48} />
                            <p className="text-lg mb-6">
                                {t("YouwilldeleteType")}{" "}
                                {branchType.find((t) => t.id === openDelete)?.name}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() =>
                                        handleDelete(
                                            openDelete,
                                            branchType.find((t) => t.id === openDelete)?.name
                                        )
                                    }
                                    className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    {t("Delete")}
                                </button>
                                <button
                                    onClick={handleCloseDelete}
                                    className="px-6 py-3 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    {t("Cancel")}
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default KitchenType;