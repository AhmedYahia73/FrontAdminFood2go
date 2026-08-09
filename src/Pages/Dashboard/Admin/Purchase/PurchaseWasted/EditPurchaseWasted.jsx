import React, { useEffect, useState } from "react";
import {
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

const EditPurchaseWasted = () => {
    const { purchaseWastedId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const { refetch: refetchLists, loading: loadingLists, data: dataLists } = useGet({
        url: `${apiUrl}/admin/wasted`,
    });

    const { refetch: refetchItem, loading: loadingItem, data: itemData } = useGet({
        url: `${apiUrl}/admin/wasted/item/${purchaseWastedId}`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/wasted/update/${purchaseWastedId}`,
    });

    // Form States
    const [type, setType] = useState("product");
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMaterialCategory, setSelectedMaterialCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState(""); // ← NEW

    const [stores, setStores] = useState([]);
    const [categories, setCategories] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        refetchLists();
        refetchItem();
    }, []);

    useEffect(() => {
        if (dataLists) {
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

    // Prefill form
    useEffect(() => {
        if (itemData && dataLists) {
            const c = itemData;

            setQuantity(c.quantity || c.quintity || "");
            setReason(c.reason || ""); // ← Prefill reason

            if (c.product_id || c.product) setType("product");
            else if (c.material_id || c.material) setType("material");

            setTimeout(() => {
                setSelectedStore(stores.find(s => s.value === c.store_id) || null);

                if (type === "product" && c.category_id) {
                    const cat = categories.find(cat => cat.value === c.category_id);
                    setSelectedCategory(cat || null);
                }
                if (type === "material" && c.category_material_id) {
                    const mcat = materialCategories.find(cat => cat.value === c.category_material_id);
                    setSelectedMaterialCategory(mcat || null);
                }

                if (type === "product" && (c.product_id || c.product)) {
                    const prod = products.find(p => p.value === (c.product_id || c.product?.id)) ||
                        { value: c.product_id, label: c.product?.name || "Unknown" };
                    setSelectedItem(prod);
                }
                if (type === "material" && (c.material_id || c.material)) {
                    const mat = materials.find(m => m.value === (c.material_id || c.material?.id)) ||
                        { value: c.material_id, label: c.material?.name || "Unknown" };
                    setSelectedItem(mat);
                }
            }, 100);
        }
    }, [itemData, dataLists, stores, categories, materialCategories, products, materials, type]);

    useEffect(() => {
        const list = type === "product" ? products : materials;
        const catId = type === "product" ? selectedCategory?.value : selectedMaterialCategory?.value;

        if (catId && list.length > 0) {
            setFilteredItems(list.filter(item => item.category_id === catId));
        } else {
            setFilteredItems([]);
        }
    }, [type, selectedCategory, selectedMaterialCategory, products, materials]);

    useEffect(() => {
        setSelectedCategory(null);
        setSelectedMaterialCategory(null);
        setSelectedItem(null);
        setFilteredItems([]);
    }, [type]);

    useEffect(() => {
        if (!loadingPost && response?.status === 200) {
            auth.toastSuccess(t("Wasted Item Updated Successfully"));
            navigate(-1);
        }
    }, [response, loadingPost]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedStore) return auth.toastError(t("Please select store"));
        if (!selectedItem) return auth.toastError(t("Please select item"));
        if (!quantity || quantity <= 0) return auth.toastError(t("Please enter valid quantity"));
        if (!reason.trim()) return auth.toastError(t("Please enter a reason"));

        const fd = new FormData();
        fd.append("store_id", selectedStore.value);
        fd.append("quantity", quantity);
        fd.append("reason", reason.trim());

        if (type === "product") {
            fd.append("category_id", selectedCategory.value);
            fd.append("product_id", selectedItem.value);
        } else {
            fd.append("category_material_id", selectedMaterialCategory.value);
            fd.append("material_id", selectedItem.value);
        }

        postData(fd);
    };

    const handleReset = () => refetchItem();
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
                            <TitlePage text={t("Edit Wasted Item")} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-2">
                        {/* Type Toggle */}
                        <div className="flex justify-center gap-12 mb-8 p-6 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="type" value="product" checked={type === "product"} onChange={(e) => setType(e.target.value)} className="w-6 h-6 text-red-600" />
                                <span className="text-xl font-medium">{t("Product")}</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="type" value="material" checked={type === "material"} onChange={(e) => setType(e.target.value)} className="w-6 h-6 text-red-600" />
                                <span className="text-xl font-medium">{t("Material")}</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">{t("Store")} *</span>
                                <Select value={selectedStore} onChange={setSelectedStore} options={stores} placeholder={t("Select Store")} isClearable isSearchable styles={selectStyles} />
                            </div>

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

                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">
                                    {type === "product" ? t("Product") : t("Material")} *
                                </span>
                                <Select
                                    value={selectedItem}
                                    onChange={setSelectedItem}
                                    options={filteredItems}
                                    placeholder={(selectedCategory || selectedMaterialCategory) ? t("Select...") : t("Select category first")}
                                    isClearable isSearchable
                                    isDisabled={!selectedCategory && !selectedMaterialCategory}
                                    styles={selectStyles}
                                />
                            </div>

                            <div>
                                <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">{t("Quantity")} *</span>
                                <TextInput type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t("Enter Quantity")} min="0.01" step="0.01" />
                            </div>
                        </div>

                        {/* Reason Field */}
                        <div className="mt-8">
                            <span className="text-xl font-TextFontRegular text-thirdColor block mb-2">{t("Reason")} *</span>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={t("Enter reason for wasted item")}
                                required
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Buttons */}
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

export default EditPurchaseWasted;