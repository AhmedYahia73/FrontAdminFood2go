import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
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
import { FiPlus, FiTrash2 } from "react-icons/fi";

const AddPurchaseProduct = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({ url: `${apiUrl}/admin/purchase_product`, });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/purchase_product/add`,
        type: true, // Use JSON
    });

    const {
        data: dataLists,
        loading: loadingLists,
    } = useGet({ url: `${apiUrl}/admin/material_product/lists` });
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [minStock, setMinStock] = useState("");
    const [status, setStatus] = useState(1);
    const [storeOptions, setStoreOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [productStores, setProductStores] = useState([
        { start_stock: "", cost: "", unit_id: "", store_id: "" },
    ]);

    useEffect(() => {
        refetchList();
    }, [refetchList]);

    useEffect(() => {
        if (dataList && dataList.categories) {
            const options = dataList.categories.map(category => ({
                value: category.id,
                label: category.name
            }));
            setCategoryOptions(options);
        }
    }, [dataList]);

    useEffect(() => {
        if (dataLists) {
            if (dataLists.stores) {
                setStoreOptions(dataLists.stores.map(s => ({ value: s.id, label: s.name })));
            }
            if (dataLists.units) {
                setUnitOptions(dataLists.units.map(u => ({ value: u.id, label: u.name })));
            }
        }
    }, [dataLists]);

    // Navigate back after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

    // Toggle status
    const handleStatus = () => {
        setStatus((prev) => (prev === 1 ? 0 : 1));
    };

    // Reset form
    const handleReset = () => {
        setName("");
        setSelectedCategory(null);
        setStatus(1);
        setDescription("");
        setMinStock("");
        setProductStores([{ start_stock: "", cost: "", unit_id: "", store_id: "" }]);
    };

    const handleAddStore = () => {
        setProductStores([
            ...productStores,
            { start_stock: "", cost: "", unit_id: "", store_id: "" },
        ]);
    };

    const handleRemoveStore = (index) => {
        const updated = productStores.filter((_, i) => i !== index);
        setProductStores(updated);
    };

    const handleStoreChange = (index, field, value) => {
        const updated = [...productStores];
        updated[index][field] = value;
        setProductStores(updated);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCategory) {
            auth.toastError(t("Please select a category"));
            return;
        }

        if (!name) {
            auth.toastError(t("Enter Product Name"));
            return;
        }

        // Basic validation for stores
        for (const store of productStores) {
            if (!store.store_id || !store.unit_id || !store.start_stock || !store.cost) {
                auth.toastError(t("Please fill all store details"));
                return;
            }
        }

        const payload = {
            category_id: selectedCategory.value,
            name,
            description,
            min_stock: minStock,
            status,
            product_store: productStores.map(s => ({
                ...s,
                start_stock: Number(s.start_stock),
                cost: Number(s.cost)
            }))
        };

        postData(payload, t("Recipe Product Added Success"));
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Custom styles for react-select
    const customStyles = {
        control: (base, state) => ({
            ...base,
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 8px',
            fontSize: '16px',
            fontFamily: 'inherit',
            boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : 'none',
            borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
            '&:hover': {
                borderColor: state.isFocused ? '#3b82f6' : '#d1d5db'
            }
        }),
        option: (base, state) => ({
            ...base,
            fontSize: '16px',
            fontFamily: 'inherit',
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            '&:hover': {
                backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
            }
        })
    };

    return (
        <>
            {loadingPost ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-x-2">
                            <button
                                onClick={handleBack}
                                className="text-mainColor hover:text-red-700 transition-colors"
                                title={t("Back")}
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Add Product")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleSubmit}>
                        <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {/* Name */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Product Name")}:
                                </span>
                                <TextInput
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("Enter Product Name")}
                                />
                            </div>

                            {/* Description */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Product Description")}:
                                </span>
                                <TextInput
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t("Enter Product Description")}
                                />
                            </div>

                            {/* Category Select */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Category")}:
                                </span>
                                <Select
                                    options={categoryOptions}
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    placeholder={t("Select Category")}
                                    isSearchable
                                    styles={customStyles}
                                    isLoading={loadingList}
                                    className="w-full"
                                    noOptionsMessage={() => t("No categories available")}
                                />
                            </div>

                            {/* Minimum Stock */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Min Stock Quantity")}:
                                </span>
                                <TextInput
                                    value={minStock}
                                    onChange={(e) => setMinStock(e.target.value)}
                                    placeholder={t("Enter Min Stock Quantity")}
                                />
                            </div>

                            {/* Status */}
                            <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                                <div className="flex items-center justify-start gap-x-3">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Active")}:
                                    </span>
                                    <Switch handleClick={handleStatus} checked={status} />
                                </div>
                            </div>
                        </div>

                        {/* Product Stores Section */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-mainColor">{t("Product Stores")}</h3>
                                <button
                                    type="button"
                                    onClick={handleAddStore}
                                    className="flex items-center gap-2 px-4 py-2 bg-mainColor text-white rounded-lg hover:bg-mainColor/90 transition"
                                >
                                    <FiPlus /> {t("Add Store")}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {productStores.map((store, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-gray-700">{t("Store")}</span>
                                            <Select
                                                options={storeOptions}
                                                value={storeOptions.find(o => o.value === store.store_id)}
                                                onChange={(val) => handleStoreChange(index, "store_id", val.value)}
                                                placeholder={t("Select Store")}
                                                styles={customStyles}
                                                isLoading={loadingLists}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-gray-700">{t("Unit")}</span>
                                            <Select
                                                options={unitOptions}
                                                value={unitOptions.find(o => o.value === store.unit_id)}
                                                onChange={(val) => handleStoreChange(index, "unit_id", val.value)}
                                                placeholder={t("Select Unit")}
                                                styles={customStyles}
                                                isLoading={loadingLists}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-gray-700">{t("Start Stock")}</span>
                                            <TextInput
                                                value={store.start_stock}
                                                onChange={(e) => handleStoreChange(index, "start_stock", e.target.value)}
                                                placeholder={t("0")}
                                                type="number"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-gray-700">{t("Cost")}</span>
                                            <TextInput
                                                value={store.cost}
                                                onChange={(e) => handleStoreChange(index, "cost", e.target.value)}
                                                placeholder={t("0.00")}
                                                type="number"
                                            />
                                        </div>
                                        <div className="flex items-end justify-center pb-2">
                                            {productStores.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveStore(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title={t("Remove Store")}
                                                >
                                                    <FiTrash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
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

export default AddPurchaseProduct;