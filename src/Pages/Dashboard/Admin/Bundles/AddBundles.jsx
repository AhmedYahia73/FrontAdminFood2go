import React, { useEffect, useState } from "react";
import {
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { useGet } from "../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoAddCircle, IoTrash, IoImageOutline, IoInformationCircleOutline, IoPricetagOutline } from "react-icons/io5";
import Select from 'react-select';
import { toast } from "react-toastify";

const AddBundles = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { refetch: refetchTranslation, data: dataTranslation } = useGet({ url: `${apiUrl}/admin/translation` });
    const { refetch: refetchList, data: listData } = useGet({ url: `${apiUrl}/admin/bundles/lists` });
    const { postData, loadingPost, response } = usePost({ url: `${apiUrl}/admin/bundles/add` });

    const [bundleNames, setBundleNames] = useState([]);
    const [bundleDescriptions, setBundleDescriptions] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([{
        categoryId: null,
        id: null,
        selectedVariationIds: [],   // New: selected variation IDs (multi)
        variations: {}              // active state & options for each variation
    }]);
    const [price, setPrice] = useState("");
    const [points, setPoints] = useState("");
    const [status, setStatus] = useState(1);  // New: status state
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [selectedTax, setSelectedTax] = useState(null);

    const selectStyles = {
        control: (base) => ({
            ...base,
            borderRadius: '12px',
            padding: '2px',
            borderColor: '#F3F4F6',
            boxShadow: 'none',
            '&:hover': { borderColor: '#e5e7eb' }
        }),
    };

    useEffect(() => {
        refetchList();
        refetchTranslation();
    }, []);

    useEffect(() => {
        if (dataTranslation?.translation) {
            const names = dataTranslation.translation.map(trans => ({ translation_id: trans.id, translation_name: trans.name, value: "" }));
            const descriptions = dataTranslation.translation.map(trans => ({ translation_id: trans.id, translation_name: trans.name, value: "" }));
            setBundleNames(names);
            setBundleDescriptions(descriptions);
        }
    }, [dataTranslation]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const addProductField = () => setSelectedProducts([...selectedProducts, {
        categoryId: null,
        id: null,
        selectedVariationIds: [],
        variations: {}
    }]);

    const handleToggleVariation = (prodIdx, varId) => {
        const list = [...selectedProducts];
        const current = list[prodIdx].variations[varId] || { active: false, options: [] };
        list[prodIdx].variations[varId] = { ...current, active: !current.active, options: current.active ? [] : current.options };
        setSelectedProducts(list);
    };

    const handleSelectOption = (prodIdx, varId, val, isMulti, max) => {
        const list = [...selectedProducts];
        if (isMulti) {
            if (val && val.length <= max) {
                list[prodIdx].variations[varId].options = val.map(o => o.value);
            } else if (val && val.length > max) {
                toast.error(`${t("Max limit is")} ${max}`);
                return;
            }
        } else {
            list[prodIdx].variations[varId].options = val ? [val.value] : [];
        }
        setSelectedProducts(list);
    };

    useEffect(() => {
        if (response && response?.status === 200 && !loadingPost) {
            navigate("/dashboard/bundles");
        }
    }, [response]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (image) formData.append("image", image);
        formData.append("price", price);
        formData.append("points", points);
        formData.append("status", status);  // Now sending status

        if (selectedDiscount?.value) formData.append("discount_id", selectedDiscount.value);
        if (selectedTax?.value) formData.append("tax_id", selectedTax.value);

        bundleNames.forEach((item, index) => {
            formData.append(`bundle_names[${index}][tranlation_id]`, item.translation_id);
            formData.append(`bundle_names[${index}][tranlation_name]`, item.translation_name);
            formData.append(`bundle_names[${index}][name]`, item.value);
        });

        bundleDescriptions.forEach((item, index) => {
            formData.append(`bundle_descriptions[${index}][tranlation_id]`, item.translation_id);
            formData.append(`bundle_descriptions[${index}][tranlation_name]`, item.translation_name);
            formData.append(`bundle_descriptions[${index}][description]`, item.value);
        });

        selectedProducts.forEach((prod, pIdx) => {
            if (prod.id) {
                formData.append(`products[${pIdx}][id]`, prod.id);
                const activeVariations = Object.entries(prod.variations).filter(([_, v]) => v.active);
                activeVariations.forEach(([varId, vData], vIdx) => {
                    formData.append(`products[${pIdx}][variation][${vIdx}][id]`, varId);
                    vData.options.forEach((optId, oIdx) => {
                        formData.append(`products[${pIdx}][variation][${vIdx}][options][${oIdx}]`, optId);
                    });
                });
            }
        });

        await postData(formData);
    };

    return (
        <section className="p-4 md:p-8 bg-[#F9FAFB] min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </button>
                    <TitlePage text={t("Create New Bundle")} />
                </div>
                {/* Status Switch - exactly like Edit page */}
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-600">{t("Status")}:</span>
                    <Switch checked={status === 1} handleClick={() => setStatus(status === 1 ? 0 : 1)} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* BASIC INFORMATION - unchanged */}
                <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6 text-mainColor font-bold text-xl border-b pb-4">
                        <IoInformationCircleOutline size={24} />
                        {t("Basic Information")}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            {bundleNames.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t("Bundle Name")} ({item.translation_name})</label>
                                    <TextInput
                                        placeholder={t("Enter name")}
                                        value={item.value}
                                        onChange={(e) => {
                                            const updated = [...bundleNames];
                                            updated[idx].value = e.target.value;
                                            setBundleNames(updated);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-6">
                            {bundleDescriptions.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t("Description")} ({item.translation_name})</label>
                                    <textarea
                                        rows={2}
                                        className="w-full border-2 rounded-2xl border-gray-50 bg-gray-50/50 focus:bg-white focus:border-mainColor outline-none p-4 transition-all text-lg"
                                        placeholder={t("Describe your bundle...")}
                                        value={item.value}
                                        onChange={(e) => {
                                            const updated = [...bundleDescriptions];
                                            updated[idx].value = e.target.value;
                                            setBundleDescriptions(updated);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PRODUCTS SECTION - updated variations logic */}
                <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8 border-b pb-4">
                        <div className="flex items-center gap-2 text-mainColor font-bold text-xl">
                            <IoPricetagOutline size={24} />
                            {t("Bundle Content")}
                        </div>
                        <button type="button" onClick={addProductField} className="flex items-center gap-2 bg-mainColor/10 text-mainColor px-4 py-2 rounded-xl font-bold hover:bg-mainColor hover:text-white transition-all">
                            <IoAddCircle size={20} /> {t("Add Product")}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {selectedProducts.map((prodEntry, prodIdx) => {
                            const filteredProducts = listData?.products?.filter(p => p.category_id === prodEntry.categoryId ? (p.category_id === prodEntry.categoryId) : (p.sub_category_id === prodEntry.categoryId)) || [];
                            const currentProductData = listData?.products?.find(p => p.id === prodEntry.id);

                            return (
                                <div key={prodIdx} className="group p-6 border border-gray-100 rounded-[2rem] bg-gray-50/50 hover:bg-white hover:shadow-md transition-all relative">
                                    <button type="button" onClick={() => setSelectedProducts(selectedProducts.filter((_, i) => i !== prodIdx))} className="absolute -top-2 -right-2 bg-red-50 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm">
                                        <IoTrash size={18} />
                                    </button>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t("Category")}</label>
                                                <Select
                                                    styles={selectStyles}
                                                    options={listData?.categories?.map(c => ({ value: c.id, label: c.name }))}
                                                    onChange={(opt) => {
                                                        const list = [...selectedProducts];
                                                        list[prodIdx].categoryId = opt.value;
                                                        list[prodIdx].id = null;
                                                        list[prodIdx].selectedVariationIds = [];
                                                        list[prodIdx].variations = {};
                                                        setSelectedProducts(list);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t("Product")}</label>
                                                <Select
                                                    styles={selectStyles}
                                                    isDisabled={!prodEntry.categoryId}
                                                    options={filteredProducts.map(p => ({ value: p.id, label: p.name }))}
                                                    onChange={(opt) => {
                                                        const list = [...selectedProducts];
                                                        list[prodIdx].id = opt.value;
                                                        list[prodIdx].selectedVariationIds = [];
                                                        list[prodIdx].variations = {};
                                                        setSelectedProducts(list);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* New: Multi-select variations first */}
                                        {currentProductData?.variations?.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-sm font-bold text-gray-600 mb-3">{t("Select Variations")}:</p>
                                                <Select
                                                    isMulti
                                                    styles={selectStyles}
                                                    options={currentProductData.variations.map(v => ({ value: v.id, label: v.name }))}
                                                    value={currentProductData.variations
                                                        .filter(v => prodEntry.selectedVariationIds.includes(v.id))
                                                        .map(v => ({ value: v.id, label: v.name }))}
                                                    onChange={(selected) => {
                                                        const list = [...selectedProducts];
                                                        list[prodIdx].selectedVariationIds = selected ? selected.map(s => s.value) : [];
                                                        // Reset variations state for non-selected ones
                                                        const newVariations = {};
                                                        selected?.forEach(sel => {
                                                            if (list[prodIdx].variations[sel.value]) {
                                                                newVariations[sel.value] = list[prodIdx].variations[sel.value];
                                                            } else {
                                                                newVariations[sel.value] = { active: false, options: [] };
                                                            }
                                                        });
                                                        list[prodIdx].variations = newVariations;
                                                        setSelectedProducts(list);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Show switches + options only for selected variations */}
                                        {currentProductData?.variations?.length > 0 && prodEntry.selectedVariationIds.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-sm font-bold text-gray-600 mb-3">{t("Enable Variations")}:</p>
                                                <div className="space-y-3">
                                                    {currentProductData.variations
                                                        .filter(v => prodEntry.selectedVariationIds.includes(v.id))
                                                        .map((v) => (
                                                            <div key={v.id} className="bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium text-gray-700">{v.name}</span>
                                                                    <Switch
                                                                        checked={prodEntry.variations[v.id]?.active || false}
                                                                        handleClick={() => handleToggleVariation(prodIdx, v.id)}
                                                                    />
                                                                </div>
                                                                {prodEntry.variations[v.id]?.active && (
                                                                    <div className="mt-3 animate-fade-in">
                                                                        <Select
                                                                            isMulti={v.type === "multiple"}
                                                                            styles={selectStyles}
                                                                            options={v.options.map(o => ({ value: o.id, label: `${o.name} (+${o.price})` }))}
                                                                            onChange={(val) => handleSelectOption(prodIdx, v.id, val, v.type === "multiple", v.max)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PRICING & IMAGE - unchanged */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white shadow-sm border border-gray-100 rounded-3xl p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">{t("Bundle Price")}</label>
                                <TextInput type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">{t("Loyalty Points")}</label>
                                <TextInput type="number" placeholder="0" value={points} onChange={(e) => setPoints(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">{t("Apply Discount")}</label>
                                <Select styles={selectStyles} options={listData?.discounts?.map(d => ({ value: d.id, label: d.name }))} onChange={setSelectedDiscount} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">{t("Tax Class")}</label>
                                <Select styles={selectStyles} options={listData?.taxes?.map(tx => ({ value: tx.id, label: tx.name }))} onChange={setSelectedTax} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                        <label className="text-sm font-semibold text-gray-700 mb-4 self-start">{t("Bundle Media")}</label>
                        <div className="relative group w-full h-48 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 hover:bg-gray-100 hover:border-mainColor transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="p-4 bg-white rounded-2xl shadow-sm text-mainColor mb-3 group-hover:scale-110 transition-transform">
                                        <IoImageOutline size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500">{t("Click to upload")}</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pb-10">
                    <button type="button" onClick={() => navigate(-1)} className="px-10 py-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all">{t("Cancel")}</button>
                    <div className="w-64">
                        <SubmitButton text={t("Add Bundle")} loading={loadingPost} />
                    </div>
                </div>
            </form>
        </section>
    );
};

export default AddBundles;