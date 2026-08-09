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
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import { useGet } from "../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { IoArrowBack } from "react-icons/io5";

const AddProductOffer = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/product_offer`,
    });

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
        if (!loadingPost && response) {
            navigate(-1);
        }
    }, [response, loadingPost, navigate]);

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

        const formData = new FormData();
        formData.append("name", name);
        formData.append("start_date", start_date);
        formData.append("end_date", end_date);
        formData.append("discount", discount);
        formData.append("time_from", formatTime(time_from));
        formData.append("time_to", formatTime(time_to));
        formData.append("delay", delay);
        formData.append("status", status);

        selectedModules.forEach((mod, index) => {
            formData.append(`module[${index}]`, mod.value);
        });

        selectedDays.forEach((day, index) => {
            formData.append(`days[${index}]`, day.value);
        });

        selectedProducts.forEach((prod, index) => {
            formData.append(`products[${index}]`, prod.value);
        });

        postData(formData, t("Offer Added Successfully"));
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
            {loadingPost || listLoading ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="flex flex-col mb-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-mainColor hover:bg-mainColor hover:text-white transition-all">
                            <IoArrowBack size={24} />
                        </button>
                        <TitlePage text={t("Add Product Offer")} />
                    </div>
                    <form onSubmit={handleSubmit}>
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
}

export default AddProductOffer;
