import React, { useEffect, useState } from "react";
import {
    StaticLoader,
    Switch,
    TitlePage,
    StaticButton,
    SubmitButton,
    TextInput,
    AddButton,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { t } from "i18next";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import Select from 'react-select';

const StockTransfer = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();

    const {
        refetch: refetchPurchaseTransfer,
        loading: loadingPurchaseTransfer,
        data: dataPurchaseTransfer,
    } = useGet({ url: `${apiUrl}/admin/purchase_transfer` });

    const { changeState, loadingChange } = useChangeState();
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_transfer/transfer`,
    });

    // States
    const [PurchaseTransfers, setPurchaseTransfers] = useState([]);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [transferType, setTransferType] = useState("product");

    const [transferForm, setTransferForm] = useState({
        from_store_id: "",
        to_store_id: "",
        category_id: "",
        product_id: "",
        category_material_id: "",
        material_id: "",
        unit_id: "",
        quintity: ""
    });

    // Options
    const [stores, setStores] = useState([]);
    const [categories, setCategories] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    // Selected
    const [selectedFromStore, setSelectedFromStore] = useState(null);
    const [selectedToStore, setSelectedToStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMaterialCategory, setSelectedMaterialCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(PurchaseTransfers.length / itemsPerPage);
    const currentItems = PurchaseTransfers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        if (dataPurchaseTransfer) {
            if (dataPurchaseTransfer.purchases) setPurchaseTransfers(dataPurchaseTransfer.purchases);

            if (dataPurchaseTransfer.stores) {
                setStores(dataPurchaseTransfer.stores.map(s => ({ value: s.id, label: s.name })));
            }
            if (dataPurchaseTransfer.categories) {
                setCategories(dataPurchaseTransfer.categories.map(c => ({ value: c.id, label: c.name })));
            }
            if (dataPurchaseTransfer.material_categories) {
                setMaterialCategories(dataPurchaseTransfer.material_categories.map(c => ({ value: c.id, label: c.name })));
            }
            if (dataPurchaseTransfer.products) setProducts(dataPurchaseTransfer.products);
            if (dataPurchaseTransfer.materials) setMaterials(dataPurchaseTransfer.materials);

            if (dataPurchaseTransfer.units) {
                setUnits(dataPurchaseTransfer.units.map(u => ({ value: u.id || u.name, label: u.name })));
            }
        }
    }, [dataPurchaseTransfer]);

    useEffect(() => { refetchPurchaseTransfer(); }, []);

    // Filter items
    useEffect(() => {
        const list = transferType === "product" ? products : materials;
        const catId = transferType === "product" ? selectedCategory?.value : selectedMaterialCategory?.value;

        if (catId && list.length > 0) {
            const filtered = list
                .filter(item => item.category_id === catId)
                .map(item => ({ value: item.id, label: item.name }));
            setFilteredItems(filtered);
        } else {
            setFilteredItems([]);
        }
        setSelectedItem(null);
    }, [selectedCategory, selectedMaterialCategory, transferType, products, materials]);

    // Reset on type change
    useEffect(() => {
        setSelectedCategory(null);
        setSelectedMaterialCategory(null);
        setSelectedItem(null);
        setSelectedUnit(null);
        setFilteredItems([]);
        setTransferForm(prev => ({
            ...prev,
            category_id: "",
            product_id: "",
            category_material_id: "",
            material_id: "",
            unit_id: ""
        }));
    }, [transferType]);

    // Handlers
    const handleFromStoreChange = (opt) => {
        setSelectedFromStore(opt);
        setTransferForm(prev => ({ ...prev, from_store_id: opt ? opt.value : "" }));
        setSelectedToStore(null);
    };

    const handleToStoreChange = (opt) => {
        setSelectedToStore(opt);
        setTransferForm(prev => ({ ...prev, to_store_id: opt ? opt.value : "" }));
    };

    const handleCategoryChange = (opt) => {
        setSelectedCategory(opt);
        setTransferForm(prev => ({ ...prev, category_id: opt ? opt.value : "" }));
    };

    const handleMaterialCategoryChange = (opt) => {
        setSelectedMaterialCategory(opt);
        setTransferForm(prev => ({ ...prev, category_material_id: opt ? opt.value : "" }));
    };

    const handleItemChange = (opt) => {
        setSelectedItem(opt);
        if (transferType === "product") {
            setTransferForm(prev => ({ ...prev, product_id: opt ? opt.value : "" }));
        } else {
            setTransferForm(prev => ({ ...prev, material_id: opt ? opt.value : "" }));
        }
    };

    const handleUnitChange = (opt) => {
        setSelectedUnit(opt);
        setTransferForm(prev => ({ ...prev, unit_id: opt ? opt.value : "" }));
    };

    const handleQuantityChange = (e) => {
        setTransferForm(prev => ({ ...prev, quintity: e.target.value }));
    };

    const resetForm = () => {
        setTransferForm({
            from_store_id: "", to_store_id: "", category_id: "", product_id: "",
            category_material_id: "", material_id: "", unit_id: "", quintity: ""
        });
        setSelectedFromStore(null); setSelectedToStore(null);
        setSelectedCategory(null); setSelectedMaterialCategory(null);
        setSelectedItem(null); setSelectedUnit(null);
        setTransferType("product");
    };

    const handleCloseTransferDialog = () => {
        setShowTransferDialog(false);
        resetForm();
    };

    const handleTransferSubmit = (e) => {
        e.preventDefault();

        if (!transferForm.from_store_id) return auth.toastError(t("Please select source store"));
        if (!transferForm.to_store_id) return auth.toastError(t("Please select destination store"));
        if (transferForm.from_store_id === transferForm.to_store_id)
            return auth.toastError(t("Source and destination stores cannot be the same"));
        if (!transferForm.unit_id) return auth.toastError(t("Please select unit"));
        if (!transferForm.quintity || transferForm.quintity <= 0)
            return auth.toastError(t("Please enter valid quantity"));

        if (transferType === "product" && !transferForm.product_id)
            return auth.toastError(t("Please select product"));
        if (transferType === "material" && !transferForm.material_id)
            return auth.toastError(t("Please select material"));

        const fd = new FormData();
        fd.append("from_store_id", transferForm.from_store_id);
        fd.append("to_store_id", transferForm.to_store_id);
        fd.append("quintity", transferForm.quintity);
        fd.append("unit_id", transferForm.unit_id);

        if (transferType === "product") {
            fd.append("category_id", transferForm.category_id);
            fd.append("product_id", transferForm.product_id);
        } else {
            fd.append("category_material_id", transferForm.category_material_id);
            fd.append("material_id", transferForm.material_id);
        }

        postData(fd, t("Transfer completed successfully"));
    };

    useEffect(() => {
        if (response && response.status === 200 && !loadingPost) {
            handleCloseTransferDialog();
            refetchPurchaseTransfer();
        }
    }, [response, loadingPost]);

    const handleChangeStatus = async (id, name, status) => {
        const newStatus = status === "approve" ? "reject" : "approve";
        await changeState(
            `${apiUrl}/admin/purchase_transfer/status/${id}`,
            `${name} Status Changed to ${newStatus}.`,
            { status: newStatus }
        );
        setPurchaseTransfers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const getStatusDisplay = (status) => ({
        text: status === "approve" ? t("Approved") : t("Rejected"),
        color: status === "approve" ? "text-green-600" : "text-red-600",
        bgColor: status === "approve" ? "bg-green-100" : "bg-red-100"
    });

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            padding: '0.25rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
            '&:hover': { borderColor: '#9CA3AF' }
        })
    };

    // Updated headers to show correct item & category
    const headers = [
        t("SL"),
        t("Type"),
        t("Category"),        // Will show Product Category OR Material Category
        t("Item"),           // Will show Product OR Material
        t("From Store"),
        t("To Store"),
        t("Quantity"),
        t("Unit"),
        t("Approval")
    ];

    return (
        <div className="flex items-start justify-start w-full overflow-x-scroll p-2 pb-28 scrollSection">
            {loadingPurchaseTransfer ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <div className="flex flex-col w-full">
                    <div className='flex flex-col items-center justify-between md:flex-row mb-6'>
                        <TitlePage text={t('Stock Transfer')} />
                        <AddButton Text={t("Transfer")} handleClick={() => setShowTransferDialog(true)} />
                    </div>

                    {/* Transfer Dialog */}
                    {showTransferDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-thirdColor">{t("Transfer Store")}</h3>
                                    <button onClick={handleCloseTransferDialog} className="text-3xl text-gray-500 hover:text-gray-700">×</button>
                                </div>

                                <form onSubmit={handleTransferSubmit}>
                                    <div className="flex justify-center gap-12 mb-8">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="type" value="product" checked={transferType === "product"}
                                                onChange={(e) => setTransferType(e.target.value)} className="w-6 h-6 text-blue-600" />
                                            <span className="text-xl font-medium">{t("Product")}</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="type" value="material" checked={transferType === "material"}
                                                onChange={(e) => setTransferType(e.target.value)} className="w-6 h-6 text-blue-600" />
                                            <span className="text-xl font-medium">{t("Material")}</span>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* From & To Store */}
                                        <div>
                                            <label className="block text-lg font-medium text-thirdColor mb-1">{t("From Store")} *</label>
                                            <Select value={selectedFromStore} onChange={handleFromStoreChange} options={stores}
                                                placeholder={t("Select source...")} isClearable isSearchable styles={selectStyles} />
                                        </div>
                                        <div>
                                            <label className="block text-lg font-medium text-thirdColor mb-1">{t("To Store")} *</label>
                                            <Select value={selectedToStore} onChange={handleToStoreChange}
                                                options={stores.filter(s => s.value !== selectedFromStore?.value)}
                                                placeholder={t("Select destination...")} isClearable isSearchable
                                                isDisabled={!selectedFromStore} styles={selectStyles} />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-lg font-medium text-thirdColor mb-1">
                                                {transferType === "product" ? t("Product Category") : t("Material Category")} *
                                            </label>
                                            <Select
                                                value={transferType === "product" ? selectedCategory : selectedMaterialCategory}
                                                onChange={transferType === "product" ? handleCategoryChange : handleMaterialCategoryChange}
                                                options={transferType === "product" ? categories : materialCategories}
                                                placeholder={t("Select category...")} isClearable isSearchable styles={selectStyles} />
                                        </div>

                                        {/* Item */}
                                        <div>
                                            <label className="block text-lg font-medium text-thirdColor mb-1">
                                                {transferType === "product" ? t("Product") : t("Material")} *
                                            </label>
                                            <Select value={selectedItem} onChange={handleItemChange} options={filteredItems}
                                                placeholder={(selectedCategory || selectedMaterialCategory) ? t("Select...") : t("Select category first")}
                                                isClearable isSearchable isDisabled={!selectedCategory && !selectedMaterialCategory}
                                                styles={selectStyles} />
                                        </div>

                                        {/* Unit & Quantity */}
                                        <div>
                                            <label className="block text-lg font-medium text-thirdColor mb-1">{t("Unit")} *</label>
                                            <Select value={selectedUnit} onChange={handleUnitChange} options={units}
                                                placeholder={t("Select unit")} isClearable isSearchable styles={selectStyles} />
                                        </div>
                                        <div>
                                            <label className="block text-lg font-medium text-thirdColor mb-1">{t("Quantity")} *</label>
                                            <TextInput type="number" value={transferForm.quintity} onChange={handleQuantityChange}
                                                placeholder={t("Enter quantity")} min="0.01" step="0.01" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4 mt-8">
                                        <StaticButton text={t("Cancel")} handleClick={handleCloseTransferDialog} />
                                        <SubmitButton text={t("Transfer")} loading={loadingPost} />
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ORIGINAL TABLE - NOW SHOWS MATERIAL & MATERIAL CATEGORY CORRECTLY */}
                    <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
                        <thead className="w-full">
                            <tr className="w-full border-b-2">
                                {headers.map((name, index) => (
                                    <th key={index}
                                        className="min-w-[120px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3">
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="w-full">
                            {PurchaseTransfers.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} className="text-xl text-center text-mainColor font-TextFontMedium py-8">
                                        {t("No Purchase Transfer Found")}
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((transfer, index) => {
                                    const statusDisplay = getStatusDisplay(transfer.status);

                                    // Smart display logic
                                    const transferType = transfer.product && transfer.category ? "product" : "material";
                                    const itemName = transfer.product || transfer.material || "-";
                                    const categoryName = transfer.category || transfer.category_material || "-";

                                    return (
                                        <tr className="w-full border-b-2" key={transfer.id}>
                                            <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="min-w-[180px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl font-medium overflow-hidden">
                                                {transferType === "product" ? "Product" : "Material"}
                                            </td>
                                            <td className="min-w-[160px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {categoryName}
                                            </td>
                                            <td className="min-w-[180px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl font-medium overflow-hidden">
                                                {itemName}
                                            </td>
                                            <td className="min-w-[150px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {transfer.from_store || "-"}
                                            </td>
                                            <td className="min-w-[150px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                {transfer.to_store || "-"}
                                            </td>
                                            <td className="min-w-[100px] py-2 text-center text-thirdColor font-semibold">
                                                {transfer.quintity || "0"}
                                            </td>
                                            <td className="min-w-[100px] py-2 text-center text-thirdColor">
                                                {transfer.unit || "-"}
                                            </td>
                                            <td className="min-w-[150px] py-2 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Switch
                                                        checked={transfer.status === "approve"}
                                                        handleClick={() => handleChangeStatus(transfer.id, itemName, transfer.status)}
                                                        disabled={loadingChange}
                                                    />
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                                                        {statusDisplay.text}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {/* ORIGINAL PAGINATION */}
                    {PurchaseTransfers.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
                            {currentPage !== 1 && (
                                <button onClick={() => setCurrentPage(p => p - 1)}
                                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium">
                                    {t("Prev")}
                                </button>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page ? "bg-mainColor text-white" : "text-mainColor"}`}>
                                    {page}
                                </button>
                            ))}
                            {totalPages !== currentPage && (
                                <button onClick={() => setCurrentPage(p => p + 1)}
                                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium">
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

export default StockTransfer;