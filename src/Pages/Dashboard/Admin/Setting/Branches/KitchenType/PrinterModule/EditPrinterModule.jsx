import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
} from "../../../../../../../Components/Components";
import { usePost } from "../../../../../../../Hooks/usePostJson";
import { useGet } from "../../../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Select from 'react-select';
import { IoArrowBack } from "react-icons/io5";

const EditPrinterModule = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { kitchenId } = useParams();
    const { printerId } = useParams();

    // Post Data
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/kitchen_printer/update/${printerId}`,
    });

    // Lists Data (for options)
    const { refetch: refetchLists, loading: loadingLists, data: listData } = useGet({
        url: `${apiUrl}/admin/kitchen_printer/lists`
    });

    // Item Data (for filling form)
    const { refetch: refetchItem, loading: loadingItem, data: itemData } = useGet({
        url: `${apiUrl}/admin/kitchen_printer/item/${printerId}`,
    });

    // Form States
    const [print_status, setPrintStatus] = useState(0);
    const [print_ip, setPrintIp] = useState("");
    const [print_port, setPrintPort] = useState("");
    const [print_name, setPrintName] = useState("");
    const [print_type, setPrintType] = useState({ value: "usb", label: "USB" });

    // Selection States
    const [module, setModule] = useState([]);
    const [moduleOptions, setModuleOptions] = useState([]);
    const [group_product, setGroupProduct] = useState([]);
    const [groupOptions, setGroupOptions] = useState([]);

    useEffect(() => {
        refetchLists();
        refetchItem();
    }, [refetchLists, refetchItem]);

    // Format Options from List Data
    useEffect(() => {
        if (listData) {
            if (listData.group_products) {
                const groups = listData.group_products.map(g => ({
                    value: g.id,
                    label: g.name
                }));
                setGroupOptions(groups);
            }
            if (listData.modules) {
                const mods = listData.modules.map(m => ({
                    value: m,
                    label: t(m)
                }));
                setModuleOptions(mods);
            }
        }
    }, [listData, t]);

    // Populate Form from Item Data
    useEffect(() => {
        if (itemData && itemData.printer_kitchen) {
            const item = itemData.printer_kitchen;

            setPrintName(item.print_name || "");
            setPrintIp(item.print_ip || "");
            setPrintPort(item.print_port || "");
            setPrintStatus(item.print_status || 0);

            if (item.print_type) {
                setPrintType({
                    value: item.print_type,
                    label: item.print_type === 'usb' ? t("USB") : t("Network")
                });
            }

            // Map Modules
            if (item.module && Array.isArray(item.module)) {
                // Assuming item.module is array of strings ["take_away", "delivery"]
                const mappedModules = item.module.map(m => ({
                    value: m,
                    label: t(m)
                }));
                setModule(mappedModules);
            }

            // Map Group Products
            if (item.group_product && Array.isArray(item.group_product)) {
                // Assuming item.group_product is array of objects [{id: 1, name: "Group"}]
                const mappedGroups = item.group_product.map(g => ({
                    value: g.id,
                    label: g.name
                }));
                setGroupProduct(mappedGroups);
            }
        }
    }, [itemData, t]);

    useEffect(() => {
        if (!loadingPost && response) {
            navigate(-1);
        }
    }, [response, loadingPost, navigate]);

    const handleChangePrintStatus = () => {
        setPrintStatus((prev) => (prev === 0 ? 1 : 0));
    };

    const handleReset = () => {
        // Re-populate from itemData
        if (itemData && itemData.printer_kitchen) {
            const item = itemData.printer_kitchen;
            setPrintName(item.print_name || "");
            setPrintIp(item.print_ip || "");
            setPrintPort(item.print_port || "");
            setPrintStatus(item.print_status || 0);

            if (item.print_type) {
                setPrintType({
                    value: item.print_type,
                    label: item.print_type === 'usb' ? t("USB") : t("Network")
                });
            }

            if (item.module && Array.isArray(item.module)) {
                setModule(item.module.map(m => ({ value: m, label: t(m) })));
            } else {
                setModule([]);
            }

            if (item.group_product && Array.isArray(item.group_product)) {
                setGroupProduct(item.group_product.map(g => ({ value: g.id, label: g.name })));
            } else {
                setGroupProduct([]);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("kitchen_id", kitchenId);
        formData.append("print_name", print_name);
        formData.append("print_status", print_status);
        formData.append("print_type", print_type?.value || "usb");
        formData.append("print_ip", print_ip);
        formData.append("print_port", print_port);

        // Append Multi-select values
        module.forEach((m, index) => {
            formData.append(`module[${index}]`, m.value);
        });

        group_product.forEach((g, index) => {
            formData.append(`group_modules[${index}]`, g.value);
        });

        postData(formData, t("PrinterModuleUpdatedSuccess")); // Ensure translation key exists or use generic
    };

    // Shared Select Styles
    const selectStyles = {
        control: (base) => ({
            ...base,
            borderColor: '#d1d5db',
            borderRadius: '0.375rem',
            padding: '4px 2px',
            backgroundColor: 'white',
            boxShadow: 'none',
            '&:hover': { borderColor: '#mainColor' }
        })
    };

    return (
        <>
            {loadingPost || loadingLists || loadingItem ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="flex flex-col mb-20">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-mainColor hover:text-opacity-80 transition-colors"
                        >
                            <IoArrowBack size={24} />
                        </button>
                        <TitlePage text={t("EditPrinterModule")} />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="py-3">
                            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                                {/* Name Input */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Printer Name")}:
                                    </span>
                                    <TextInput
                                        value={print_name}
                                        onChange={(e) => setPrintName(e.target.value)}
                                        name="print_name"
                                        placeholder={t("Enter Printer Name")}
                                        background="white"
                                    />
                                </div>

                                {/* Print IP Input */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Print IP")}:
                                    </span>
                                    <TextInput
                                        value={print_ip}
                                        onChange={(e) => setPrintIp(e.target.value)}
                                        name="print_ip"
                                        placeholder={t("Enter Print IP")}
                                        background="white"
                                    />
                                </div>

                                {/* Print Type Select */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Print Type")}:
                                    </span>
                                    <Select
                                        value={print_type}
                                        onChange={(option) => setPrintType(option)}
                                        options={[
                                            { value: "usb", label: t("USB") },
                                            { value: "network", label: t("Network") }
                                        ]}
                                        placeholder={t("Select Print Type")}
                                        className="w-full"
                                        styles={selectStyles}
                                    />
                                </div>

                                {/* Module Select (Multi) */}
                                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Modules")}:
                                    </span>
                                    <Select
                                        isMulti
                                        value={module}
                                        onChange={(options) => setModule(options || [])}
                                        options={moduleOptions}
                                        placeholder={t("Select Modules")}
                                        className="w-full"
                                        styles={selectStyles}
                                    />
                                </div>

                                {/* Group Product Select (Multi) */}
                                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Group Products")}:
                                    </span>
                                    <Select
                                        isMulti
                                        value={group_product}
                                        onChange={(options) => setGroupProduct(options || [])}
                                        options={groupOptions}
                                        placeholder={t("Select Group Products")}
                                        className="w-full"
                                        styles={selectStyles}
                                    />
                                </div>

                                {/* Print Port Input */}
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Print Port")}:
                                    </span>
                                    <TextInput
                                        value={print_port}
                                        onChange={(e) => setPrintPort(e.target.value)}
                                        name="print_port"
                                        placeholder={t("Enter Print Port")}
                                        background="white"
                                    />
                                </div>

                                {/* Print Status Switch */}
                                <div className="flex items-start justify-start w-full pt-8 gap-x-1">
                                    <div className="flex items-center justify-start w-2/4 gap-x-1">
                                        <span className="text-xl font-TextFontRegular text-thirdColor">
                                            {t("Print Status")}:
                                        </span>
                                        <Switch
                                            handleClick={handleChangePrintStatus}
                                            checked={print_status === 1}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Buttons */}
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

export default EditPrinterModule;
