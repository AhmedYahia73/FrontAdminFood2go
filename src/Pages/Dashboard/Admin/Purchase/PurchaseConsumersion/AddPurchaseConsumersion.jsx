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
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import Select from 'react-select';

const AddPurchaseConsumersion = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const {
        refetch: refetchLists,
        loading: loadingLists,
        data: dataLists,
    } = useGet({ url: `${apiUrl}/admin/purchase_consumersion/lists` });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_consumersion/add`,
    });

    // Form States
    const [type, setType] = useState("product"); // "product" | "material"
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMaterialCategory, setSelectedMaterialCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null); // product or material
    const [quantity, setQuantity] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Options
    const [branches, setBranches] = useState([]);
    const [stores, setStores] = useState([]);
    const [categories, setCategories] = useState([]); // product categories
    const [materialCategories, setMaterialCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        refetchLists();
    }, []);

    useEffect(() => {
        if (dataLists) {
            setBranches(dataLists.branches?.map(b => ({ value: b.id, label: b.name })) || []);
            setStores(dataLists.stores?.map(s => ({ value: s.id, label: s.name })) || []);
            setCategories(dataLists.categories?.map(c => ({ value: c.id, label: c.name })) || []);
            setMaterialCategories(dataLists.material_categories?.map(c => ({ value: c.id, label: c.name })) || []);

            const productOpts = dataLists.products?.map(p => ({
                value: p.id,
                label: p.name,
                category_id: p.category_id
            })) || [];
            setProducts(productOpts);

            const materialOpts = dataLists.materials?.map(m => ({
                value: m.id,
                label: m.name,
                category_id: m.category_id
            })) || [];
            setMaterials(materialOpts);
        }
    }, [dataLists]);

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
        setSelectedItem(null);
    }, [type, selectedCategory, selectedMaterialCategory, products, materials]);

    // Reset category & item on type change
    useEffect(() => {
        setSelectedCategory(null);
        setSelectedMaterialCategory(null);
        setSelectedItem(null);
        setFilteredItems([]);
    }, [type]);

    useEffect(() => {
        if (!loadingPost && response?.status === 200) {
            auth.toastSuccess(t("Purchase Consumption Added Successfully"));
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
        setType("product");
        setSelectedBranch(null);
        setSelectedStore(null);
        setSelectedCategory(null);
        setSelectedMaterialCategory(null);
        setSelectedItem(null);
        setQuantity("");
        setDate(new Date().toISOString().split('T')[0]);
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
            {loadingLists || loadingPost ? (
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
                            <TitlePage text={t("Add Consumption")} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-2">
                        {/* Type Selection */}
                        <div className="flex justify-center gap-12 p-6 mb-8 rounded-lg">
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

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {/* Branch */}
                            <div>
                                <span className="block mb-2 text-xl font-TextFontRegular text-thirdColor">{t("Branch")} *</span>
                                <Select value={selectedBranch} onChange={setSelectedBranch} options={branches}
                                    placeholder={t("Select Branch")} isClearable isSearchable styles={selectStyles} />
                            </div>

                            {/* Store */}
                            <div>
                                <span className="block mb-2 text-xl font-TextFontRegular text-thirdColor">{t("Store")} *</span>
                                <Select value={selectedStore} onChange={setSelectedStore} options={stores}
                                    placeholder={t("Select Store")} isClearable isSearchable styles={selectStyles} />
                            </div>

                            {/* Category */}
                            <div>
                                <span className="block mb-2 text-xl font-TextFontRegular text-thirdColor">
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

                            {/* Item (Product/Material) */}
                            <div>
                                <span className="block mb-2 text-xl font-TextFontRegular text-thirdColor">
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
                                <span className="block mb-2 text-xl font-TextFontRegular text-thirdColor">{t("Quantity")} *</span>
                                <TextInput type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                                    placeholder={t("Enter Quantity")} min="0.01" step="0.01" />
                            </div>

                            {/* Date */}
                            <div>
                                <span className="block mb-2 text-xl font-TextFontRegular text-thirdColor">{t("Date")} *</span>
                                <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-end w-full mt-6 gap-x-4">
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
                                    text={t("Submit")}
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

export default AddPurchaseConsumersion;