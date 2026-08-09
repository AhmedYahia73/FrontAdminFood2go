import React, { useEffect, useState } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import {
    LoaderLogin,
    SubmitButton,
    TextInput,
    TimeInput,
} from "../../../../../Components/Components";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

const PolicySupportPage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const {
        refetch: refetchPolicySupport,
        loading: loadingPolicySupport,
        data: dataPolicySupport,
    } = useGet({
        url: `${apiUrl}/admin/settings/policy`,
    });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/settings/policy/update`,
    });

    const [policy, setPolicy] = useState("");
    const [support, setSupport] = useState("");
    const [returnPolicy, setReturnPolicy] = useState("");
    const [deliveryPolicy, setDeliveryPolicy] = useState("");

    const { t, i18n } = useTranslation();

    useEffect(() => {
        refetchPolicySupport();
    }, [refetchPolicySupport]);

    useEffect(() => {
        if (dataPolicySupport && dataPolicySupport.data) {
            setPolicy(dataPolicySupport.data?.policy || "");
            setSupport(dataPolicySupport.data?.support || "");
            setReturnPolicy(dataPolicySupport.data?.return_policy || "");
            setDeliveryPolicy(dataPolicySupport.data?.delivery_policy || "");
        }
    }, [dataPolicySupport]); // Only run this effect when `data` changes

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("policy", policy);
        formData.append("support", support);
        formData.append("return_policy", returnPolicy);
        formData.append("delivery_policy", deliveryPolicy);

        postData(formData, t("Support and policy Changed Success"));
    };
    return (
        <>
            {loadingPost || loadingPolicySupport ? (
                <>
                    <div className="flex items-center justify-center w-full">
                        <LoaderLogin />
                    </div>
                </>
            ) : (
                <section>
                    <form onSubmit={handleSubmit}>
                        <div className="flex w-full gap-6 mb-4 flex-col p-6">
                            {/* Policy */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Policy")}:
                                </span>
                                <textarea
                                    value={policy}
                                    onChange={(e) => setPolicy(e.target.value)}
                                    placeholder="Enter The Policy"
                                    rows="4" cols="50"
                                    className={
                                        "w-full border-2 rounded-2xl outline-none px-2 py-3 shadow text-2xl text-thirdColor border-mainColor"
                                    }
                                />
                            </div>

                            {/* Support */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Support")}:
                                </span>
                                <textarea
                                    value={support}
                                    onChange={(e) => setSupport(e.target.value)}
                                    placeholder="Enter The Support"
                                    rows="4" cols="50"
                                    className={
                                        "w-full border-2 rounded-2xl outline-none px-2 py-3 shadow text-2xl text-thirdColor border-mainColor"
                                    }
                                />
                            </div>

                            {/* Return Policy */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Return Policy")}:
                                </span>
                                <textarea
                                    value={returnPolicy}
                                    onChange={(e) => setReturnPolicy(e.target.value)}
                                    placeholder="Enter The Return Policy"
                                    rows="4" cols="50"
                                    className={
                                        "w-full border-2 rounded-2xl outline-none px-2 py-3 shadow text-2xl text-thirdColor border-mainColor"
                                    }
                                />
                            </div>

                            {/* Delivery Policy */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Delivery Policy")}:
                                </span>
                                <textarea
                                    value={deliveryPolicy}
                                    onChange={(e) => setDeliveryPolicy(e.target.value)}
                                    placeholder="Enter The Delivery Policy"
                                    rows="4" cols="50"
                                    className={
                                        "w-full border-2 rounded-2xl outline-none px-2 py-3 shadow text-2xl text-thirdColor border-mainColor"
                                    }
                                />
                            </div>
                        </div>

                        {/* Buttons*/}
                        <div className="flex items-center justify-end w-full gap-x-4">
                            <div className="">
                                <SubmitButton
                                    text={t("Change")}
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

export default PolicySupportPage;
