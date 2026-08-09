import React, { useState, useEffect } from "react";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { LoaderLogin, StaticLoader, TitlePage } from "../../../../Components/Components";
import { useTranslation } from "react-i18next";
import { IoSave, IoFastFood, IoBicycle, IoRestaurant, IoPencil, IoClose, IoLayers } from "react-icons/io5";
import { TbBorderAll, TbBuildingStore } from "react-icons/tb";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Select from "react-select";
import { useAuth } from "../../../../Context/Auth";

const PricingProduct = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();

    // ===============
    // STATES
    // ===============
    const [activeTab, setActiveTab] = useState("all");
    const [products, setProducts] = useState([]);
    
    // POS Editing States
    const [editingRowId, setEditingRowId] = useState(null); 
    const [editPrice, setEditPrice] = useState(""); 
    
    // Branch Pricing States
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const [viewVariationsModal, setViewVariationsModal] = useState(false);
    const [variations, setVariations] = useState([]);
    const [selectedProductForVariations, setSelectedProductForVariations] = useState(null);

    const [editingOptionId, setEditingOptionId] = useState(null);
    const [editOptionPrice, setEditOptionPrice] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedModules, setSelectedModules] = useState(["take_away", "delivery", "dine_in"]);

    const itemsPerPage = 10;

    // ===============
    // FETCH DATA WITH USEGET
    // ===============
    // 1. POS Products
    const posUrl = activeTab === "branch_pricing" ? null : `${apiUrl}/admin/product_pos_pricing/${activeTab}`;
    const { refetch, loading, data } = useGet({ url: posUrl });

    // 2. Branches
    const branchUrl = activeTab === "branch_pricing" ? `${apiUrl}/admin/branch` : null;
    const { data: branchData } = useGet({ url: branchUrl });

    // 3. Branch Products
    const branchProductUrl = (activeTab === "branch_pricing" && selectedBranch) 
        ? `${apiUrl}/admin/branch/branch_product/${selectedBranch.value}` 
        : null;
    const { refetch: refetchBranchProducts, loading: loadingBranchProducts, data: branchProductsData } = useGet({ url: branchProductUrl });

    // 4. Branch Options/Variations
    const branchOptionsUrl = (viewVariationsModal && selectedProductForVariations) 
        ? `${apiUrl}/admin/branch/branch_options/${selectedProductForVariations.id}` 
        : null;
    const { refetch: refetchVariations, loading: loadingVariations, data: variationsData } = useGet({ url: branchOptionsUrl });

    // ===============
    // MUTATIONS WITH USEPOST
    // ===============
    const { postData, loadingPost } = usePost({
        url: `${apiUrl}/admin/product_pos_pricing/update`,
    });

    const { postData: updateBranchProduct, loadingPost: loadingUpdateBranchProduct } = usePost({
        url: `${apiUrl}/admin/branch/product_pricing`,
    });

    const { postData: updateBranchOption, loadingPost: loadingUpdateBranchOption } = usePost({
        url: `${apiUrl}/admin/branch/option_pricing`,
    });

    // ===============
    // EFFECTS
    // ===============
    
    // Sync POS Products
    useEffect(() => {
        if (activeTab !== "branch_pricing" && data && data.product_pricing) {
            setProducts(data.product_pricing);
            setEditingRowId(null);
            setEditPrice("");
        }
    }, [data, activeTab]);

    // Sync Branches
    useEffect(() => {
        if (branchData) {
            setBranches(branchData.branches || branchData || []);
        }
    }, [branchData]);

    // Sync Branch Products
    useEffect(() => {
        if (activeTab === "branch_pricing") {
            if (branchProductsData) {
                setProducts(branchProductsData.products || branchProductsData || []);
                setEditingRowId(null);
                setEditPrice("");
            } else if (!selectedBranch) {
                setProducts([]);
            }
        }
    }, [branchProductsData, activeTab, selectedBranch]);

    // Sync Variations
    useEffect(() => {
        if (viewVariationsModal && variationsData) {
            setVariations(variationsData.variations || variationsData || []);
        }
    }, [variationsData, viewVariationsModal]);

    // ===============
    // HANDLERS
    // ===============
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
        setSearchQuery("");
        setEditingRowId(null);
        setEditPrice("");
        setSelectedProductForVariations(null);
    };

    const handleEditClick = (product) => {
        setEditingRowId(product.id);
        setEditPrice(product.price);
        setSelectedModules(["take_away", "delivery", "dine_in"]);
    };

    const handleCancelClick = () => {
        setEditingRowId(null);
        setEditPrice("");
    };

    const handleUpdate = async (id) => {
        if (!editPrice) return;

        // If it's a branch pricing base product
        if (activeTab === "branch_pricing") {
            if (!selectedBranch) return;
            const formData = new FormData();
            formData.append('product_id', id);
            formData.append('branch_id', selectedBranch.value);
            formData.append('price', editPrice);

            await updateBranchProduct(formData, t("Price Updated Successfully"));
            refetchBranchProducts();
            setEditingRowId(null);
            setEditPrice("");
            return;
        }

        // Old POS Price Update Logic
        const formData = new FormData();
        if (activeTab === "all") {
            if (selectedModules.length === 0) return;
            const allModules = ["take_away", "delivery", "dine_in"];
            const hasAll = allModules.every(m => selectedModules.includes(m));

            if (hasAll) {
                formData.append(`items[0][module]`, "all");
                formData.append(`items[0][product_id]`, id);
                formData.append(`items[0][price]`, editPrice);
            } else {
                selectedModules.forEach((mod, index) => {
                    formData.append(`items[${index}][module]`, mod);
                    formData.append(`items[${index}][product_id]`, id);
                    formData.append(`items[${index}][price]`, editPrice);
                });
            }
        } else {
            formData.append(`items[0][module]`, activeTab);
            formData.append(`items[0][product_id]`, id);
            formData.append(`items[0][price]`, editPrice);
        }

        await postData(formData, t("Price Updated Successfully"));
        refetch();
        setEditingRowId(null);
        setEditPrice("");
    };

    const handleViewVariations = (product) => {
        if (!selectedBranch) return;
        setSelectedProductForVariations(product);
        setViewVariationsModal(true);
        setEditingOptionId(null);
        setVariations([]); // reset before load
    };

    const handleUpdateOption = async (optionId) => {
        if (!editOptionPrice || !selectedBranch) return;

        const formData = new FormData();
        formData.append("option_id", optionId);
        formData.append("branch_id", selectedBranch.value);
        formData.append("price", editOptionPrice);

        await updateBranchOption(formData, t("Option Price Updated"));
        refetchVariations();
        setEditingOptionId(null);
        setEditOptionPrice("");
    };

    // Filters & Pagination
    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentItems = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const tabs = [
        { id: "all", label: t("All"), icon: <TbBorderAll /> },
        { id: "take_away", label: t("Take Away"), icon: <IoFastFood /> },
        { id: "delivery", label: t("Delivery"), icon: <IoBicycle /> },
        { id: "dine_in", label: t("Dine In"), icon: <IoRestaurant /> },
        { id: "branch_pricing", label: t("Branch Pricing"), icon: <TbBuildingStore /> },
    ];

    const branchSelectOptions = branches.map(b => ({ value: b.id, label: b.name }));
    const isLoadingProducts = loading || loadingBranchProducts;

    return (
        <div className="p-4 md:p-6 w-full min-h-screen bg-gray-50/50 flex flex-col gap-6">
            <TitlePage text={t("Product POS Pricing")} />

            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex flex-wrap gap-4 bg-white p-2 rounded-2xl shadow-sm w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? "bg-mainColor text-white shadow-md"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="w-full md:w-auto">
                    <input
                        type="text"
                        placeholder={t("Search by product name...")}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full md:w-80 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mainColor/20 focus:border-mainColor transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Branch Selector */}
            {activeTab === "branch_pricing" && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-2">
                    <label className="font-bold text-gray-700 mb-2 block">{t("Select Branch")}</label>
                    <Select
                        options={branchSelectOptions}
                        value={selectedBranch}
                        onChange={setSelectedBranch}
                        placeholder={t("Select a branch...")}
                        className="w-full md:w-96 text-black"
                        classNamePrefix="select"
                    />
                </div>
            )}

            {/* Main Content Table */}
            <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {isLoadingProducts ? (
                    <div className="flex justify-center items-center py-20">
                        <LoaderLogin />
                    </div>
                ) : ( activeTab === "branch_pricing" && !selectedBranch ? (
                    <div className="flex justify-center items-center py-20 text-gray-500 font-medium">
                        {t("Please select a branch to view products.")}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto p-4">
                            <table className="w-full min-w-[600px] border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">{t("SL")}</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">{t("Product Name")}</th>
                                        {activeTab === "branch_pricing" && (
                                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">{t("Variations")}</th>
                                        )}
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">{t("Price")}</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">{t("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={activeTab === "branch_pricing" ? "5" : "4"} className="px-6 py-8 text-center text-gray-500">
                                                {t("No products found")}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((product, index) => {
                                            const isEditing = editingRowId === product.id;
                                            // Make sure we use loading state specific to the item being updated for branch product
                                            const isUpdatingBranchProduct = isEditing && loadingUpdateBranchProduct && activeTab === "branch_pricing";
                                            const isUpdatingPosProduct = isEditing && loadingPost && activeTab !== "branch_pricing";
                                            const isUpdatingAny = isUpdatingBranchProduct || isUpdatingPosProduct;

                                            return (
                                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-800">
                                                        {product.name}
                                                    </td>
                                                    
                                                    {/* Variables Column for Branch Pricing */}
                                                    {activeTab === "branch_pricing" && (
                                                        <td className="px-6 py-4 text-center">
                                                            <button 
                                                                onClick={() => handleViewVariations(product)}
                                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-mainColor hover:text-green-600 transition-colors border border-transparent hover:border-green-200 py-1.5 px-3 rounded-lg bg-green-50"
                                                            >
                                                                <IoLayers size={16} />
                                                                {t("View Variations")}
                                                            </button>
                                                        </td>
                                                    )}

                                                    <td className="px-6 py-4 text-center text-lg text-mainColor font-bold">
                                                        {isEditing ? (
                                                            <div className="flex flex-col items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={editPrice}
                                                                    onChange={(e) => setEditPrice(e.target.value)}
                                                                    className="w-32 px-3 py-1.5 border border-red-400 rounded-lg text-center text-gray-900 font-bold focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all shadow-sm"
                                                                    autoFocus
                                                                />
                                                                {activeTab === "all" && (
                                                                    <div className="flex flex-wrap justify-center gap-2 mt-1 px-2">
                                                                        {tabs.filter(t => t.id !== "all" && t.id !== "branch_pricing").map(m => (
                                                                            <label key={m.id} className="flex items-center gap-1.5 text-[10px] cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-md border border-gray-200 transition-colors">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-3 h-3 accent-mainColor"
                                                                                    checked={selectedModules.includes(m.id)}
                                                                                    onChange={(e) => {
                                                                                        if (e.target.checked) {
                                                                                            setSelectedModules([...selectedModules, m.id]);
                                                                                        } else {
                                                                                            setSelectedModules(selectedModules.filter(item => item !== m.id));
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <span className="font-semibold text-gray-600 uppercase tracking-tighter">{m.label}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            product.price
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdate(product.id)}
                                                                        disabled={isUpdatingAny}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-mainColor text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                                                    >
                                                                        {isUpdatingAny ? <StaticLoader /> : <IoSave size={18} />}
                                                                        <span className="text-sm font-bold">
                                                                            {activeTab === "all" ? t("Save to All") : t("Save")}
                                                                        </span>
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelClick}
                                                                        disabled={isUpdatingAny}
                                                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all shadow-sm"
                                                                    >
                                                                        <IoClose size={20} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEditClick(product)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-sm border border-red-200"
                                                                >
                                                                    <IoPencil size={18} />
                                                                    <span className="text-sm font-bold">{t("Update")}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 py-6 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {t("Prev")}
                                </button>

                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        if (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={`page-${pageNum}`}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all shadow-sm ${currentPage === pageNum
                                                        ? "bg-mainColor text-white"
                                                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        } else if (
                                            (pageNum === currentPage - 2 && currentPage > 3) ||
                                            (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                                        ) {
                                            return <span key={`dots-${pageNum}`} className="px-1 text-gray-400">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {t("Next")}
                                </button>
                            </div>
                        )}
                    </>
                ))}
            </div>

            {/* VARIATIONS MODAL */}
            <Dialog open={viewVariationsModal} onClose={() => setViewVariationsModal(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                <IoLayers className="text-mainColor" />
                                {t("Variations")} - <span className="text-mainColor">{selectedProductForVariations?.name}</span>
                            </h3>
                            <button onClick={() => setViewVariationsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <IoClose size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingVariations ? (
                                <div className="flex justify-center items-center h-40">
                                    <StaticLoader />
                                </div>
                            ) : variations.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 font-medium">
                                    {t("No variations found for this product.")}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {variations.map((variation) => (
                                        <div key={variation.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                            {/* Variation Header */}
                                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                                <h4 className="font-bold text-gray-800 flex items-center justify-between">
                                                    <span>{variation.name}</span>
                                                    <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full uppercase">
                                                        {variation.type}
                                                    </span>
                                                </h4>
                                            </div>
                                            
                                            {/* Options List */}
                                            <div className="divide-y divide-gray-100 bg-white">
                                                {variation.options?.map((option) => {
                                                    const isEditingOption = editingOptionId === option.id;
                                                    const isSavingThisOption = isEditingOption && loadingUpdateBranchOption;
                                                    
                                                    return (
                                                        <div key={option.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4">
                                                            <div className="font-medium text-gray-700">
                                                                {option.name}
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {isEditingOption ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={editOptionPrice}
                                                                            onChange={(e) => setEditOptionPrice(e.target.value)}
                                                                            className="w-24 px-3 py-1.5 border border-red-400 rounded-lg text-center text-gray-900 font-bold focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all shadow-sm"
                                                                            placeholder={t("Price")}
                                                                            autoFocus
                                                                            disabled={isSavingThisOption}
                                                                        />
                                                                        <button
                                                                            onClick={() => handleUpdateOption(option.id)}
                                                                            disabled={isSavingThisOption}
                                                                            className="p-2 bg-mainColor text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm"
                                                                        >
                                                                            {isSavingThisOption ? <StaticLoader /> : <IoSave size={18} />}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingOptionId(null)}
                                                                            disabled={isSavingThisOption}
                                                                            className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all shadow-sm"
                                                                        >
                                                                            <IoClose size={18} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="text-lg font-bold text-mainColor w-24 text-right">
                                                                            {option.price}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingOptionId(option.id);
                                                                                setEditOptionPrice(option.price);
                                                                            }}
                                                                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-mainColor hover:border-red-200 transition-all shadow-sm"
                                                                        >
                                                                            <IoPencil size={16} />
                                                                            <span className="text-sm font-bold">{t("Edit")}</span>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {(!variation.options || variation.options.length === 0) && (
                                                    <div className="p-4 text-center text-sm text-gray-400 italic">
                                                        {t("No options for this variation")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
};

export default PricingProduct;
