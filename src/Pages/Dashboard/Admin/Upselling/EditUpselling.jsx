import React, { useEffect, useRef, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput, 
    TitlePage
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import Select from 'react-select';
import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

const EditUpselling = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { upsellingId } = useParams();

    const {
        refetch: refetchTranslation,
        loading: loadingTranslation,
        data: dataTranslation,
    } = useGet({
        url: `${apiUrl}/admin/translation`,
    });

    const {
        refetch: refetchUpsellingData,
        loading: loadingUpsellingData,
        data: dataUpsellingData,
    } = useGet({
        url: `${apiUrl}/admin/upsaling/item/${upsellingId}`,
    });

    const {
        refetch: refetchList,
        loading: loadingList,
        data: dataList,
    } = useGet({
        url: `${apiUrl}/admin/upsaling/lists`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/upsaling/update/${upsellingId}`,
    });

    const auth = useAuth();

    // State variables
    const [names, setNames] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [status, setStatus] = useState(1);
    const [taps, setTaps] = useState([]);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    useEffect(() => {
        refetchTranslation();
        refetchList();
        refetchUpsellingData();
    }, [refetchTranslation, refetchList, refetchUpsellingData, upsellingId]);

    useEffect(() => {
        if (dataTranslation?.translation) {
            setTaps(dataTranslation.translation);
            
            // Only initialize names if we haven't loaded the upselling data yet
            if (!initialDataLoaded) {
                const initialNames = dataTranslation.translation.map(tap => ({
                    name: "",
                    tranlation_id: tap.id,
                    tranlation_name: tap.name
                }));
                setNames(initialNames);
            }
        }
    }, [dataTranslation, initialDataLoaded]);

    useEffect(() => {
        if (dataUpsellingData && dataTranslation?.translation && !initialDataLoaded) {
            const upsellingData = dataUpsellingData;
            
            // Set status
            setStatus(upsellingData.status);
            
            // Map names from API response to our state format
            const mappedNames = dataTranslation.translation.map(tap => {
                // Find if there's a name for this translation in the API response
                const existingName = upsellingData.names.find(
                    name => name.tranlation_id === tap.id
                );
                
                return {
                    name: existingName ? existingName.product_name : "",
                    tranlation_id: tap.id,
                    tranlation_name: tap.name
                };
            });
            
            setNames(mappedNames);
            
            // Set selected products
            const productSelections = upsellingData.products.map(product => ({
                value: product.id,
                label: product.name
            }));
            setSelectedProducts(productSelections);
            
            setInitialDataLoaded(true);
        }
    }, [dataUpsellingData, dataTranslation, initialDataLoaded]);

    useEffect(() => {
        if (response && response.status === 200 && !loadingPost) {
            handleBack();
        }
    }, [response]);

    // Handle product selection
    const handleProductChange = (selectedOptions) => {
        setSelectedProducts(selectedOptions || []);
    };

    // Handle name input change for specific language
    const handleNameChange = (index, value) => {
        setNames(prev => {
            const updatedNames = [...prev];
            updatedNames[index] = {
                ...updatedNames[index],
                name: value
            };
            return updatedNames;
        });
    };

    const handleStatusChange = () => {
        setStatus(prev => prev === 1 ? 0 : 1);
    };

    const handleReset = () => {
        if (dataUpsellingData?.upselling && dataTranslation?.translation) {
            const upsellingData = dataUpsellingData.upselling;
            
            // Reset to original data
            setStatus(upsellingData.status);
            
            const mappedNames = dataTranslation.translation.map(tap => {
                const existingName = upsellingData.names.find(
                    name => name.tranlation_id === tap.id
                );
                
                return {
                    name: existingName ? existingName.product_name : "",
                    tranlation_id: tap.id,
                    tranlation_name: tap.name
                };
            });
            
            setNames(mappedNames);
            
            const productSelections = upsellingData.products.map(product => ({
                value: product.id,
                label: product.name
            }));
            setSelectedProducts(productSelections);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        // Validate that all names are filled
        const emptyName = names.find(item => !item.name || item.name.trim() === "");
        if (emptyName) {
            auth.toastError(t("enterListNames"));
            return;
        }

        // Validate that at least one product is selected
        if (selectedProducts.length === 0) {
            auth.toastError(t("selectAtLeastOneProduct"));
            return;
        }

        const formData = new FormData();

        // Add names in the required format
        names.forEach((nameObj, index) => {
            formData.append(`names[${index}][name]`, nameObj.name);
            formData.append(`names[${index}][tranlation_id]`, nameObj.tranlation_id);
            formData.append(`names[${index}][tranlation_name]`, nameObj.tranlation_name);
        });

        // Add product IDs
        selectedProducts.forEach(product => {
            formData.append('product_ids[]', product.value);
        });

        // Add status
        formData.append("status", status);

        postData(formData, "Upselling List Updated Successfully");
    };

    // Prepare product options for react-select
    const productOptions = dataList?.products?.map(product => ({
        value: product.id,
        label: product.name
    })) || [];

    return (
        <>
            {loadingTranslation || loadingUpsellingData || loadingPost ? (
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
                            <TitlePage text={t("Edit Upselling")} />
                        </div>
                    </div>
                    <form onSubmit={handleUpdate}>
                        {/* Content */}
                        <div className="sm:py-3 lg:py-6">
                            <div className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row">

                                {/* Name Inputs for each language */}
                                {taps.map((tap, index) => (
                                    <div
                                        key={tap.id}
                                        className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1"
                                    >
                                        <span className="text-xl font-TextFontRegular text-thirdColor">
                                            {t("Name")} ({tap.name}):
                                        </span>
                                        <TextInput
                                            value={names[index]?.name || ""}
                                            onChange={(e) => handleNameChange(index, e.target.value)}
                                            placeholder={`${t("ListName")} ${tap.name}`}
                                        />
                                    </div>
                                ))}

                                {/* Product Selection */}
                                <div className="sm:w-full lg:w-[60%] flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("SelectProducts")}:
                                    </span>
                                    <Select
                                        isMulti
                                        options={productOptions}
                                        value={selectedProducts}
                                        onChange={handleProductChange}
                                        placeholder={t("SelectProducts")}
                                        className="w-full"
                                        classNamePrefix="select"
                                    />
                                </div>

                                {/* Status Switch */}
                                <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-8">
                                    <div className="flex items-center justify-start w-2/4 gap-x-1">
                                        <span className="text-xl font-TextFontRegular text-thirdColor">
                                            {t("Status")}:
                                        </span>
                                        <Switch
                                            handleClick={handleStatusChange}
                                            checked={status === 1}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full gap-x-4">
                            <div>
                                <StaticButton
                                    text={t("Reset")}
                                    handleClick={handleReset}
                                    bgColor="bg-transparent"
                                    Color="text-mainColor"
                                    border={"border-2"}
                                    borderColor={"border-mainColor"}
                                    rounded="rounded-full"
                                />
                            </div>
                            <div>
                                <SubmitButton
                                    text={t("Update")}
                                    rounded="rounded-full"
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default EditUpselling;