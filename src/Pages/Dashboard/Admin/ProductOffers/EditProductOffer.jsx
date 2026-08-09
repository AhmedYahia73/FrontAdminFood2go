import React, { useEffect, useState } from "react";
import {
    NumberInput,
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TimeInput,
    TitlePage,
    DateInput,
} from "../../../../Components/Components";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useAuth } from "../../../../Context/Auth";
import { useGet } from "../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Select from 'react-select';
import { IoArrowBack } from "react-icons/io5";

const EditProductOffer = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const { refetch: refetchItem, loading: loadingItem, data: dataItem } = useGet({
        url: `${apiUrl}/admin/product_offer/${id}`,
    });

    const { changeState, loadingChange, responseChange } = useChangeState();

    const { data: listData, loading: listLoading } = useGet({
        url: `${apiUrl}/admin/product_offer/lists`,
    });

    const [name, setName] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");
    const [discount, setDiscount] = useState("");
    const [time_from, setTimeFrom] = useState("");
    const [time_to, setTimeTo] = useState("");
    const [delay, setDelay] = useState("");
    const [status, setStatus] = useState(1);

    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedModules, setSelectedModules] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [daysOptions, setDaysOptions] = useState([]);
    const [modulesOptions, setModulesOptions] = useState([]);
    const [productsOptions, setProductsOptions] = useState([]);

    useEffect(() => {
        if (listData) {
            if (listData.days) {
                setDaysOptions(listData.days.map(day => ({ value: day, label: t(day) })));
            }
            if (listData.modules) {
                setModulesOptions(listData.modules.map(mod => ({ value: mod, label: t(mod) })));
            }
            if (listData.products) {
                setProductsOptions(listData.products.map(prod => ({ value: prod.id, label: prod.name })));
            }
        }
    }, [listData, t]);

    useEffect(() => {
        if (dataItem?.offer) {
            const offer = dataItem.offer;
            setName(offer.name || "");
            setStartDate(offer.start_date || "");
            setEndDate(offer.end_date || "");
            setDiscount(offer.discount || 0);
            setTimeFrom(offer.time_from || "");
            setTimeTo(offer.time_to || "");
            setDelay(offer.delay || 0);
            setStatus(offer.status !== undefined ? offer.status : 1);
        }
    }, [dataItem]);

    // Update selected options when options are loaded and offer is available
    useEffect(() => {
        if (dataItem?.offer && daysOptions.length > 0) {
            const offer = dataItem.offer;
            const days = offer.days || offer.day || [];
            const initialDays = days.map(d => {
                const val = typeof d === 'object' ? d.value || d.name : d;
                const found = daysOptions.find(opt => opt.value === val);
                return found || { value: val, label: t(val) };
            });
            setSelectedDays(initialDays);
        }
    }, [dataItem, daysOptions, t]);

    useEffect(() => {
        if (dataItem?.offer && modulesOptions.length > 0) {
            const offer = dataItem.offer;
            const modules = offer.modules || offer.module || [];
            const initialModules = Array.isArray(modules) ? modules.map(m => {
                const val = typeof m === 'object' ? m.value || m.name : m;
                const found = modulesOptions.find(opt => opt.value === val);
                return found || { value: val, label: t(val) };
            }) : [];
            setSelectedModules(initialModules);
        }
    }, [dataItem, modulesOptions, t]);

    useEffect(() => {
        if (dataItem?.offer && productsOptions.length > 0) {
            const offer = dataItem.offer;
            const products = offer.products || offer.product || [];
            const initialProducts = Array.isArray(products) ? products.map(p => {
                const val = typeof p === 'object' ? p.id : p;
                const found = productsOptions.find(opt => opt.value === val);
                return found || { value: val, label: '...' };
            }) : [];
            setSelectedProducts(initialProducts);
        }
    }, [dataItem, productsOptions]);

    useEffect(() => {
        if (!loadingChange && responseChange) {
            navigate(-1);
        }
    }, [responseChange, loadingChange, navigate]);

    const handleChangeStatus = () => {
        setStatus((prev) => (prev === 0 ? 1 : 0));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name) {
            auth.toastError(t("Please Enter Name"));
            return;
        }

        const formatTime = (time) => {
            if (!time) return "";
            const parts = time.split(":");
            if (parts.length === 2) return `${time}:00`;
            return time;
        };

        const data = {
            name,
            start_date,
            end_date,
            discount,
            time_from: formatTime(time_from),
            time_to: formatTime(time_to),
            delay,
            status,
            module: selectedModules.map(m => m.value),
            days: selectedDays.map(d => d.value),
            products: selectedProducts.map(p => p.value)
        };

        changeState(`${apiUrl}/admin/product_offer/${id}`, t("Offer Updated Successfully"), data);
    };

    const selectStyle = {
        control: (base) => ({
            ...base,
            borderColor: '#d1d5db',
            borderRadius: '0.375rem',
            padding: '2px 4px',
            backgroundColor: 'white'
        })
    };

    return (
        <>
            {loadingChange || listLoading || loadingItem ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="flex flex-col mb-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                            <IoArrowBack size={24} />
                        </button>
                        <TitlePage text={t("Edit Product Offer")} />
                    </div>                    <form onSubmit={handleSubmit}>
                        <div className="py-3">
                            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {/* Name */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Name")}:
                                    </span>
                                    <TextInput
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t("Enter Name")}
                                        background="white"
                                    />
                                </div>

                                {/* Discount */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Discount")}:
                                    </span>
                                    <div className="relative w-full">
                                        <NumberInput
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                            placeholder={t("Enter Discount")}
                                            background="white"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-thirdColor">%</span>
                                    </div>
                                </div>

                                {/* Delay */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Delay")}:
                                    </span>
                                    <NumberInput
                                        value={delay}
                                        onChange={(e) => setDelay(e.target.value)}
                                        placeholder={t("Enter Delay")}
                                        background="white"
                                    />
                                </div>

                                {/* Start Date */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Start Date")}:
                                    </span>
                                    <DateInput
                                        value={start_date}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>

                                {/* End Date */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("End Date")}:
                                    </span>
                                    <DateInput
                                        value={end_date}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>

                                {/* Time From */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Time From")}:
                                    </span>
                                    <TimeInput
                                        value={time_from}
                                        onChange={(e) => setTimeFrom(e.target.value)}
                                    />
                                </div>

                                {/* Time To */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Time To")}:
                                    </span>
                                    <TimeInput
                                        value={time_to}
                                        onChange={(e) => setTimeTo(e.target.value)}
                                    />
                                </div>

                                {/* Modules */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Modules")}:
                                    </span>
                                    <Select
                                        value={selectedModules}
                                        onChange={setSelectedModules}
                                        options={modulesOptions}
                                        isMulti
                                        placeholder={t("Select Modules")}
                                        className="w-full"
                                        styles={selectStyle}
                                    />
                                </div>

                                {/* Days */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Days")}:
                                    </span>
                                    <Select
                                        value={selectedDays}
                                        onChange={setSelectedDays}
                                        options={daysOptions}
                                        isMulti
                                        placeholder={t("Select Days")}
                                        className="w-full"
                                        styles={selectStyle}
                                    />
                                </div>

                                {/* Products */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1 col-span-1 md:col-span-2 xl:col-span-3">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Products")}:
                                    </span>
                                    <Select
                                        value={selectedProducts}
                                        onChange={setSelectedProducts}
                                        options={productsOptions}
                                        isMulti
                                        placeholder={t("Select Products")}
                                        className="w-full"
                                        styles={selectStyle}
                                    />
                                </div>

                                {/* Status Switch */}
                                <div className="flex items-start justify-start w-full pt-8 gap-x-1">
                                    <div className="flex items-center justify-start w-2/4 gap-x-1">
                                        <span className="text-xl font-TextFontRegular text-thirdColor">
                                            {t("Status")}:
                                        </span>
                                        <Switch
                                            handleClick={handleChangeStatus}
                                            checked={status === 1}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full mt-6 gap-x-4">
                            <div>
                                <StaticButton
                                    text={t("Cancel")}
                                    handleClick={() => navigate(-1)}
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
}

export default EditProductOffer;
