import React, { useEffect, useState } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import {
    LoaderLogin,
    Switch,
    TitleSection,
} from "../../../../../Components/Components";
import { useTranslation } from "react-i18next";

const ReceiptDesignPage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t } = useTranslation();

    // State for receipt design fields
    const [logo, setLogo] = useState(0);
    const [name, setName] = useState(0);
    const [address, setAddress] = useState(0);
    const [branch, setBranch] = useState(0);
    const [phone, setPhone] = useState(0);
    const [cashierName, setCashierName] = useState(0);
    const [footer, setFooter] = useState(0);
    const [taxes, setTaxes] = useState(0);
    const [services, setServices] = useState(0);
    const [tableNum, setTableNum] = useState(0);
    const [preparationNum, setPreparationNum] = useState(0);

    // Get receipt design settings
    const {
        refetch: refetchReceiptDesign,
        loading: loadingReceiptDesign,
        data: dataReceiptDesign,
    } = useGet({
        url: `${apiUrl}/admin/reciept_design`,
    });

    // Update receipt design settings
    const { changeState, loadingChange } = useChangeState();

    // Fetch data on component mount
    useEffect(() => {
        refetchReceiptDesign();
    }, [refetchReceiptDesign]);

    // Populate form data when data is fetched
    useEffect(() => {
        if (dataReceiptDesign) {
            setLogo(dataReceiptDesign.logo || 0);
            setName(dataReceiptDesign.name || 0);
            setAddress(dataReceiptDesign.address || 0);
            setBranch(dataReceiptDesign.branch || 0);
            setPhone(dataReceiptDesign.phone || 0);
            setCashierName(dataReceiptDesign.cashier_name || 0);
            setFooter(dataReceiptDesign.footer || 0);
            setTaxes(dataReceiptDesign.taxes || 0);
            setServices(dataReceiptDesign.services || 0);
            setTableNum(dataReceiptDesign.table_num || 0);
            setPreparationNum(dataReceiptDesign.preparation_num || 0);
        }
    }, [dataReceiptDesign]);

    // Handle toggle changes
    const handleToggle = async (field, currentValue, setter) => {
        const newValue = currentValue === 1 ? 0 : 1;
        setter(newValue);

        const response = await changeState(
            `${apiUrl}/admin/reciept_design/update`,
            `${field} Changed Status.`,
            { [field]: newValue } // Pass status as an object if changeState expects an object
        );

        if (response) {
            refetchReceiptDesign();
        }
    };

    return (
        <>
            {loadingReceiptDesign || loadingChange ? (
                <div className="flex items-center justify-center w-full h-56">
                    <LoaderLogin />
                </div>
            ) : (
                <section className="pb-28">
                    <div className="w-full mb-6">
                        <TitleSection text={t("Receipt Design Settings")} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Logo */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Logo")}:
                            </span>
                            <Switch
                                checked={logo}
                                handleClick={() => handleToggle("logo", logo, setLogo)}
                            />
                        </div>

                        {/* Name */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Name")}:
                            </span>
                            <Switch
                                checked={name}
                                handleClick={() => handleToggle("name", name, setName)}
                            />
                        </div>

                        {/* Address */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Address")}:
                            </span>
                            <Switch
                                checked={address}
                                handleClick={() => handleToggle("address", address, setAddress)}
                            />
                        </div>

                        {/* Branch */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Branch")}:
                            </span>
                            <Switch
                                checked={branch}
                                handleClick={() => handleToggle("branch", branch, setBranch)}
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Phone")}:
                            </span>
                            <Switch
                                checked={phone}
                                handleClick={() => handleToggle("phone", phone, setPhone)}
                            />
                        </div>

                        {/* Cashier Name */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Cashier Name")}:
                            </span>
                            <Switch
                                checked={cashierName}
                                handleClick={() => handleToggle("cashier_name", cashierName, setCashierName)}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Footer")}:
                            </span>
                            <Switch
                                checked={footer}
                                handleClick={() => handleToggle("footer", footer, setFooter)}
                            />
                        </div>

                        {/* Taxes */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Taxes")}:
                            </span>
                            <Switch
                                checked={taxes}
                                handleClick={() => handleToggle("taxes", taxes, setTaxes)}
                            />
                        </div>

                        {/* Services */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Services")}:
                            </span>
                            <Switch
                                checked={services}
                                handleClick={() => handleToggle("services", services, setServices)}
                            />
                        </div>

                        {/* Table Number */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Table Number")}:
                            </span>
                            <Switch
                                checked={tableNum}
                                handleClick={() => handleToggle("table_num", tableNum, setTableNum)}
                            />
                        </div>

                        {/* Preparation Number */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Preparation Number")}:
                            </span>
                            <Switch
                                checked={preparationNum}
                                handleClick={() => handleToggle("preparation_num", preparationNum, setPreparationNum)}
                            />
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default ReceiptDesignPage;
