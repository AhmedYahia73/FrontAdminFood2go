import React, { useEffect, useRef, useState } from "react";
import {
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
  TitlePage,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const AddUpselling = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const {
    refetch: refetchTranslation,
    loading: loadingTranslation,
    data: dataTranslation,
  } = useGet({
    url: `${apiUrl}/admin/translation`,
  });

  const {
    refetch: refetchList,
    loading: loadingList,
    data: dataList,
  } = useGet({
    url: `${apiUrl}/admin/upsaling/lists`,
  });

  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/upsaling/add`,
  });

  const auth = useAuth();

  // State variables
  const [names, setNames] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [status, setStatus] = useState(1);
  const [taps, setTaps] = useState([]);

  useEffect(() => {
    refetchTranslation();
    refetchList();
  }, [refetchTranslation, refetchList]);

  useEffect(() => {
    if (dataTranslation?.translation) {
      setTaps(dataTranslation.translation);
      // Initialize names array with translation data
      const initialNames = dataTranslation.translation.map((tap) => ({
        name: "",
        tranlation_id: tap.id,
        tranlation_name: tap.name,
      }));
      setNames(initialNames);
    }
  }, [dataTranslation]);

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
    setNames((prev) => {
      const updatedNames = [...prev];
      updatedNames[index] = {
        ...updatedNames[index],
        name: value,
      };
      return updatedNames;
    });
  };

  const handleStatusChange = () => {
    setStatus((prev) => (prev === 1 ? 0 : 1));
  };

  const handleReset = () => {
    setNames(
      taps.map((tap) => ({
        name: "",
        tranlation_id: tap.id,
        tranlation_name: tap.name,
      }))
    );
    setSelectedProducts([]);
    setStatus(1);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  const handleAdd = (e) => {
    e.preventDefault();

    // Validate that all names are filled
    const emptyName = names.find(
      (item) => !item.name || item.name.trim() === ""
    );
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
      formData.append(
        `names[${index}][tranlation_name]`,
        nameObj.tranlation_name
      );
    });

    // Add product IDs
    selectedProducts.forEach((product) => {
      formData.append("product_ids[]", product.value);
    });

    // Add status
    formData.append("status", status);

    postData(formData, "Upselling List Added Successfully");
  };

  // Prepare product options for react-select
  const productOptions =
    dataList?.products?.map((product) => ({
      value: product.id,
      label: product.name,
    })) || [];

  return (
    <>
      {loadingTranslation || loadingList || loadingPost ? (
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
              <TitlePage text={t("Add Upselling")} />
            </div>
          </div>
          <form onSubmit={handleAdd}>
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
                <SubmitButton text={t("Submit")} rounded="rounded-full" />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddUpselling;
