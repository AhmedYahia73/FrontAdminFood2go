import React, { useEffect, useState } from "react";
import {
    DateInput,
    StaticButton,
    StaticLoader,
    SubmitButton,
    TextInput,
    TitlePage,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import Select from 'react-select';

const EditPurchaseConsumersion = () => {
    const { purchaseConsumersionId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    // API Calls
    const { refetch: refetchLists, loading: loadingLists, data: dataLists } = useGet({
        url: `${apiUrl}/admin/purchase_consumersion/lists`,
    });

    const { refetch: refetchItem, loading: loadingItem, data: itemData } = useGet({
        url: `${apiUrl}/admin/purchase_consumersion/item/${purchaseConsumersionId}`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_consumersion/update/${purchaseConsumersionId}`,
    });

    // Form States
    const [type, setType] = useState("product"); // "product" | "material"
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMaterialCategory, setSelectedMaterialCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [date, setDate] = useState("");

    // Options
    const [branches, setBranches] = useState([]);
    const [stores, setStores] = useState([]);
    const [categories, setCategories] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    // Load lists
    useEffect(() => {
        refetchLists();
        refetchItem();
    }, []);

    useEffect(() => {
        if (dataLists) {
            setBranches(dataLists.branches?.map(b => ({ value: b.id, label: b.name })) || []);
            setStores(dataLists.stores?.map(s => ({ value: s.id, label: s.name })) || []);
            setCategories(dataLists.categories?.map(c => ({ value: c.id, label: c.name })) || []);
            setMaterialCategories(dataLists.material_categories?.map(c => ({ value: c.id, label: c.name })) || []);

            setProducts(dataLists.products?.map(p => ({
                value: p.id,
                label: p.name,
                category_id: p.category_id
            })) || []);

            setMaterials(dataLists.materials?.map(m => ({
                value: m.id,
                label: m.name,
                category_id: m.category_id
            })) || []);
        }
    }, [dataLists]);

    // Detect type & prefill form when item loads
    useEffect(() => {
        if (itemData?.data) {
            const c = itemData.data;

            setQuantity(c.quintity || c.quantity || "");
            setDate(c.date || "");

            // Detect Type
            if (c.product_id || c.product) {
                setType("product");
            } else if (c.material_id || c.material) {
                setType("material");
            }

            // Wait for options to load, then set values
            const timer = setTimeout(() => {
                setSelectedBranch(branches.find(b => b.value === c.branch_id) || null);
                setSelectedStore(stores.find(s => s.value === c.store_id) || null);

                if (type === "product" && c.category_id) {
                    const cat = categories.find(cat => cat.value === c.category_id);
                    setSelectedCategory(cat || null);
                }
                if (type === "material" && c.category_material_id) {
                    const mcat = materialCategories.find(cat => cat.value === c.category_material_id);
                    setSelectedMaterialCategory(mcat || null);
                }

                if (type === "product" && c.product_id) {
                    const prod = products.find(p => p.value === c.product_id);
                    setSelectedItem(prod || { value: c.product_id, label: c.product || "Unknown Product" });
                }
                if (type === "material" && c.material_id) {
                    const mat = materials.find(m => m.value === c.material_id);
                    setSelectedItem(mat || { value: c.material_id, label: c.material || "Unknown Material" });
                }
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [itemData, branches, stores, categories, materialCategories, products, materials, type]);

    // Filter items based on selected category
    useEffect(() => {
        const list = type === "product" ? products : materials;
        const catId = type === "product" ? selectedCategory?.value : selectedMaterialCategory?.value;

        if (catId && list.length > 0) {
            const filtered = list.filter(item => item.category_id === catId);
            setFilteredItems(filtered);
        } else {
            setFilteredItems([]);
        }
    }, [type, selectedCategory, selectedMaterialCategory, products, materials]);

    // Reset category/item when type changes
    useEffect(() => {
        setSelectedCategory(null);
        setSelectedMaterialCategory(null);
        setSelectedItem(null);
        setFilteredItems([]);
    }, [type]);

    // Submit success
    useEffect(() => {
        if (!loadingPost && response?.status === 200) {
            auth.toastSuccess(t("Purchase Consumption Updated Successfully"));
            navigate(-1);
        }
    }, [response, loadingPost]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedBranch) return auth.toastError(t("Please select branch"));
        if (!selectedStore) return auth.toastError(t("Please select store"));
        if (!selectedItem) return auth.toastError(t("Please select item"));
        if (!quantity || quantity <= 0) return auth.toastError(t("Please enter valid quantity"));
        if (!date) return auth.toastError(t("Please select date"));

        const fd = new FormData();
        fd.append("branch_id", selectedBranch.value);
        fd.append("store_id", selectedStore.value);
        fd.append("quintity", quantity);
        fd.append("date", date);

        if (type === "product") {
            fd.append("category_id", selectedCategory.value);
            fd.append("product_id", selectedItem.value);
        } else {
            fd.append("category_material_id", selectedMaterialCategory.value);
            fd.append("material_id", selectedItem.value);
        }

        postData(fd);
    };

    const handleReset = () => {
        refetchItem(); // Reload original data
    };

    const handleBack = () => navigate(-1);

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
        })
    };

    return (
        <>
            {loadingLists || loadingItem || loadingPost ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="pb-32">
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-x-2">
                            <button onClick={handleBack} className="text-mainColor hover:text-red-700">
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Edit Purchase Consumption")} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-2">
                        {/* Type Toggle */}
                        <div className="flex justify-center gap-12 mb-8 p-6 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="product"
                                    checked={type === "product"}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-6 h-6 text-blue-600"
                                />
                                <span className="text-xl font-medium">{t("Product")}</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    value="material"
                                    checked={type === "material"}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-6 h-6 text-blue-600"
                                />
                                <span className="text-xl font-medium">{t("Material")}</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Branch */}
                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">{t("Branch")} *</span>
                                <Select value={selectedBranch} onChange={setSelectedBranch} options={branches}
                                    placeholder={t("Select Branch")} isClearable isSearchable styles={selectStyles} />
                            </div>

                            {/* Store */}
                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">{t("Store")} *</span>
                                <Select value={selectedStore} onChange={setSelectedStore} options={stores}
                                    placeholder={t("Select Store")} isClearable isSearchable styles={selectStyles} />
                            </div>

                            {/* Category */}
                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">
                                    {type === "product" ? t("Product Category") : t("Material Category")} *
                                </span>
                                <Select
                                    value={type === "product" ? selectedCategory : selectedMaterialCategory}
                                    onChange={type === "product" ? setSelectedCategory : setSelectedMaterialCategory}
                                    options={type === "product" ? categories : materialCategories}
                                    placeholder={t("Select Category")}
                                    isClearable isSearchable styles={selectStyles}
                                />
                            </div>

                            {/* Item */}
                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">
                                    {type === "product" ? t("Product") : t("Material")} *
                                </span>
                                <Select
                                    value={selectedItem}
                                    onChange={setSelectedItem}
                                    options={filteredItems}
                                    placeholder={selectedCategory || selectedMaterialCategory ? t("Select...") : t("Select category first")}
                                    isClearable isSearchable
                                    isDisabled={!selectedCategory && !selectedMaterialCategory}
                                    styles={selectStyles}
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">{t("Quantity")} *</span>
                                <TextInput type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                                    placeholder={t("Enter Quantity")} min="0.01" step="0.01" />
                            </div>

                            {/* Date */}
                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">{t("Date")} *</span>
                                <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-end w-full gap-x-4 mt-6">
                            <div>
                                <StaticButton
                                    text={t("Reset")}
                                    handleClick={handleReset}
                                    bgColor="bg-transparent"
                                    Color="text-mainColor"
                                    border="border-2"
                                    borderColor="border-mainColor"
                                    rounded="rounded-full"
                                />
                            </div>
                            <div>
                                <SubmitButton
                                    text={t("Update")}
                                    rounded="rounded-full"
                                    handleClick={handleSubmit}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default EditPurchaseConsumersion;