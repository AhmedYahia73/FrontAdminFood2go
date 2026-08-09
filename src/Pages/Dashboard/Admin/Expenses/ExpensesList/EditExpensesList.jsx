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
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import Select from 'react-select';

const EditExpenses = () => {
    const { expensesId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    
    const { 
        refetch: refetchList, 
        loading: loadingList, 
        data: dataList 
    } = useGet({
        url: `${apiUrl}/admin/expenses/lists`,
    });

    const {
        refetch: refetchTranslation,
        loading: loadingTranslation,
        data: dataTranslation,
    } = useGet({
        url: `${apiUrl}/admin/translation`,
    });

    const { 
        refetch: refetchExpenses, 
        loading: loadingExpenses, 
        data: dataExpenses 
    } = useGet({
        url: `${apiUrl}/admin/expenses/item/${expensesId}`,
    });

    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/expenses/update/${expensesId}`,
    });

    const { t } = useTranslation();
    const auth = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [names, setNames] = useState([]);
    const [status, setStatus] = useState(1);
    const [taps, setTaps] = useState([]);

    // Set form fields when expenses data is available
    useEffect(() => {
        if (dataExpenses && dataExpenses.expense) {
            const expense = dataExpenses.expense;

            setStatus(expense.status || 1);
            
            // Set selected category if category data exists
            if (expense.category_id) {
                setSelectedCategory({
                    value: expense.category_id,
                    label: expense.category?.name || ""
                });
            }

            // Map expense_names from API response to our state format
            if (dataExpenses.expense_names && dataTranslation?.translation) {
                const mappedNames = dataTranslation.translation.map(tap => {
                    // Find if there's a name for this translation in the API response
                    const existingName = dataExpenses.expense_names.find(
                        name => name.tranlation_id === tap.id
                    );

                    return {
                        name: existingName ? existingName.expense_name : "",
                        tranlation_id: tap.id,
                        tranlation_name: tap.name
                    };
                });

                setNames(mappedNames);
            } else if (dataTranslation?.translation) {
                // Initialize with empty names if no expense_names exist
                const initialNames = dataTranslation.translation.map(tap => ({
                    name: "",
                    tranlation_id: tap.id,
                    tranlation_name: tap.name
                }));
                setNames(initialNames);
            }
        }
    }, [dataExpenses, dataTranslation]);

    // Format categories for react-select when dataList is available
    useEffect(() => {
        if (dataList && dataList.categories) {
            setCategories(dataList.categories);
            const options = dataList.categories.map(category => ({
                value: category.id,
                label: category.name
            }));
            setCategoryOptions(options);
        }
    }, [dataList]);

    useEffect(() => {
        if (dataTranslation?.translation) {
            setTaps(dataTranslation.translation);
        }
    }, [dataTranslation]);

    useEffect(() => {
        refetchList();
        refetchExpenses();
        refetchTranslation();
    }, [refetchList, refetchExpenses, refetchTranslation]);

    // Navigate back after successful submission
    useEffect(() => {
        if (!loadingPost && response) {
            handleBack();
        }
    }, [response, loadingPost]);

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

    // Toggle status
    const handleStatus = () => {
        setStatus((prev) => (prev === 1 ? 0 : 1));
    };

    // Reset form to original values
    const handleReset = () => {
        if (dataExpenses && dataExpenses.expense) {
            const expense = dataExpenses.expense;

            setStatus(expense.status || 1);
            
            // Reset selected category
            if (expense.category_id) {
                setSelectedCategory({
                    value: expense.category_id,
                    label: expense.category?.name || ""
                });
            }

            // Reset names
            if (dataExpenses.expense_names && dataTranslation?.translation) {
                const mappedNames = dataTranslation.translation.map(tap => {
                    const existingName = dataExpenses.expense_names.find(
                        name => name.tranlation_id === tap.id
                    );

                    return {
                        name: existingName ? existingName.expense_name : "",
                        tranlation_id: tap.id,
                        tranlation_name: tap.name
                    };
                });

                setNames(mappedNames);
            }
        }
    };

    // Handle form submission
    const handleUpdate = (e) => {
        e.preventDefault();

        if (!selectedCategory) {
            auth.toastError(t("Please select a category"));
            return;
        }

        // Validate that all names are filled
        const emptyName = names.find(item => !item.name || item.name.trim() === "");
        if (emptyName) {
            auth.toastError(t("Enter all expense names"));
            return;
        }

        const formData = new FormData();
        formData.append("category_id", selectedCategory.value);

        // Add names in the required format
        names.forEach((nameObj, index) => {
            formData.append(`names[${index}][name]`, nameObj.name);
            formData.append(`names[${index}][tranlation_id]`, nameObj.tranlation_id);
            formData.append(`names[${index}][tranlation_name]`, nameObj.tranlation_name);
        });

        formData.append("status", status);

        postData(formData, t("Expenses Updated Success"));
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
            {loadingPost || loadingExpenses || loadingTranslation ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section>
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-x-2">
                            <button
                                onClick={handleBack}
                                className="transition-colors text-mainColor hover:text-red-700"
                                title={t("Back")}
                            >
                                <IoArrowBack size={24} />
                            </button>
                            <TitlePage text={t("Edit Expenses")} />
                        </div>
                    </div>
                    <form className="p-2" onSubmit={handleUpdate}>
                        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {/* Category Select */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
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

                            {/* Name Inputs for each language */}
                            {taps.map((tap, index) => (
                                <div
                                    key={tap.id}
                                    className="flex flex-col items-start justify-center w-full gap-y-1"
                                >
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Expenses Name")} ({tap.name}):
                                    </span>
                                    <TextInput
                                        value={names[index]?.name || ""}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        placeholder={`${t("Enter Expenses Name")} ${tap.name}`}
                                    />
                                </div>
                            ))}

                            {/* Status */}
                            <div className="flex items-start justify-start w-full pt-8 gap-x-1">
                                <div className="flex items-center justify-start gap-x-3">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Active")}:
                                    </span>
                                    <Switch handleClick={handleStatus} checked={status} />
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
                                    text={t("Update")}
                                    rounded="rounded-full"
                                    handleClick={handleUpdate}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default EditExpenses;