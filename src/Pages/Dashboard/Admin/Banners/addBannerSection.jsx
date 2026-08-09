import React, { useEffect, useState } from "react";
import {
  NumberInput,
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
  UploadInput,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";
import Select from "react-select";

import { useTranslation } from "react-i18next";

const AddBannerSection = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchData,
    loading: loadingData,
    data: allData,
  } = useGet({
    url: `${apiUrl}/admin/banner`,
  });
  const {
    refetch: refetchCategory,
    loading: loadingCategory,
    data: dataCategory,
  } = useGet({ url: `${apiUrl}/admin/category` });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/banner/add`,
  });
  const { t, i18n } = useTranslation();

  const ImageRef = React.useRef([]);
  const auth = useAuth();

  // const [taps, setTaps] = useState([{ id: 1, name: 'English(EN)' }, { id: 2, name: 'Arabic(Ar)' }, { id: 3, name: 'garman' }])
  const [taps, setTaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);

  const [currentTap, setCurrentTap] = useState(0);

  const [bannerOrder, setBannerOrder] = useState("");

  const [bannerStatus, setBannerStatus] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const [image, setImage] = useState([]);
  const [imageFile, setImageFile] = useState([]);

  useEffect(() => {
    refetchData(); // Refetch data when the component mounts
    refetchCategory(); // Refetch data when the component mounts
  }, [refetchData, refetchCategory]);

  const categoryOptions = (categories || []).map((category) => ({
    value: category.id,
    label: category.name,
  }));
  const productOptions = (products || []).map((product) => ({
    value: product.id,
    label: product.name || product.title,
  }));
  const dealOptions = (deals || []).map((deal) => ({
    value: deal.id,
    label: deal.name || deal.title,
  }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#9E090F",
      borderRadius: "8px",
      minHeight: "48px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#9E090F",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#9E090F" : state.isFocused ? "#FDECEC" : "white",
      color: state.isSelected ? "white" : "#333",
    }),
  };

  useEffect(() => {
    if (
      allData &&
      dataCategory &&
      allData?.translations &&
      allData?.categories &&
      allData?.products &&
      allData?.deals
    ) {
      setTaps(allData?.translations || []);
      setCategories(dataCategory.parent_categories || []);
      setProducts(allData?.products || []);
      setDeals(allData?.deals || []);
    }
  }, [allData, dataCategory]);

  const handleImageClick = (index) => {
    if (ImageRef.current[index]) {
      ImageRef.current[index].click(); // Trigger click on the correct input
    }
  };

  const handleSelectCategory = (selectedOptions) => {
    setSelectedCategories(selectedOptions || []);
  };

  const handleSelectProduct = (selectedOptions) => {
    setSelectedProducts(selectedOptions || []);
  };

  const handleSelectDeal = (option) => {
    setSelectedDeal(option);
  };

  const handleTap = (index) => {
    setCurrentTap(index);
  };

  useEffect(() => {
    if (!loadingPost) {
      handleReset();
    }
    refetchData();
    setUpdate(!update);
  }, [response]);

  const handleStatusBanner = () => {
    const currentActive = bannerStatus;
    {
      currentActive === 0 ? setBannerStatus(1) : setBannerStatus(0);
    }
  };

  const handleReset = () => {
    setCurrentTap(0);
    setBannerOrder("");
    setSelectedCategories([]);
    setSelectedProducts([]);
    setSelectedDeal(null);
    setImage([]);
    setImageFile([]);
    setBannerStatus(0);
  };

  const handleBannerAdd = (e) => {
    e.preventDefault();

    if (imageFile.length === 0) {
      auth.toastError(t("PleaseEnterBannerImage"));
      return;
    }

    // if (imageFile.length !== taps.length) {
    //   auth.toastError('Please Enter All Banner Image');
    //   return;
    // }

    // if (!categoryId && !dealId) {
    //   if (!categoryId) {
    //     auth.toastError(t("pleaseSelectCategory"));
    //     return;
    //   }
    //   if (!productId) {
    //     auth.toastError(t("pleaseSelectProduct"));
    //     return;
    //   }
    //   if (!dealId) {
    //     auth.toastError(t("pleaseSelectDeal"));
    //     return;
    //   }
    // }

    // if (categoryId && !productId) {
    //   if (!productId) {
    //     auth.toastError(t("pleaseSelectProduct"));
    //     return;
    //   }
    // }

    if (!bannerOrder) {
      auth.toastError(t("pleaseEntertheOrder"));
      return;
    }

    const formData = new FormData();

    imageFile.forEach((img, index) => {
      formData.append(`images[${index}][image]`, img.image);
      formData.append(`images[${index}][translation_id]`, img.tranlation_id);
      formData.append(`images[${index}][tranlation_name]`, img.tranlation_name);
    });

    formData.append("order", bannerOrder);
    selectedCategories.forEach((category) => {
      formData.append("categories[]", category.value);
    });
    selectedProducts.forEach((product) => {
      formData.append("products[]", product.value);
    });
    formData.append("deal_id", selectedDeal?.value || "");
    formData.append("status", bannerStatus);
    postData(formData, "Banner Added Success");
  };

  return (
    <>
      {loadingData || loadingCategory || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleBannerAdd}>
            {/* Taps */}
            <div className="flex items-center justify-start w-full py-2 gap-x-6">
              {taps.map((tap, index) => (
                <span
                  key={tap.id}
                  onClick={() => handleTap(index)}
                  className={`${
                    currentTap === index
                      ? "text-mainColor border-b-4 border-mainColor"
                      : "text-thirdColor"
                  }  pb-1 text - xl font - TextFontMedium transition - colors duration - 300 cursor - pointer hover: text - mainColor`}
                >
                  {tap.name}
                </span>
              ))}
            </div>
            {/* Content*/}
            <div className="sm:py-3 lg:py-6">
              {taps.map((tap, index) => {
                // Ensure the ref array contains a valid ref for each input
                if (!ImageRef.current[index]) {
                  ImageRef.current[index] = null; // Initialize as null
                }

                return (
                  currentTap === index && (
                    <div
                      className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                      key={tap.id}
                    >
                      {/* Banner Image */}
                      <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                          {t("BannerImage")} {tap.name}:
                        </span>
                        <UploadInput
                          value={image[index]?.image || ""} // Show the selected image name or default to empty
                          uploadFileRef={(el) => (ImageRef.current[index] = el)} // Dynamically assign ref
                          placeholder={t("BannerImage")}
                          handleFileChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Update imageFile state with the file and related data
                              setImageFile((prev) => {
                                const updatedImages = [...prev];
                                updatedImages[index] = {
                                  tranlation_id: tap.id,
                                  image: file,
                                  tranlation_name: tap.name || "Default Name",
                                };
                                return updatedImages;
                              });

                              // Update image state with the file name
                              setImage((prev) => {
                                const updatedNames = [...prev];
                                updatedNames[index] = { image: file.name }; // Set the file name at the correct index
                                return updatedNames;
                              });
                            }
                          }}
                          onClick={() => handleImageClick(index)} // Trigger file input click
                        />
                      </div>
                    </div>
                  )
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-start w-full gap-4 mb-4">
              <div className="sm:w-full xl:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Category")}:
                </span>
                <Select
                  isMulti
                  options={categoryOptions}
                  value={selectedCategories}
                  onChange={handleSelectCategory}
                  placeholder={t("Select Category")}
                  styles={customStyles}
                  className="w-full"
                />
              </div>
              <div className="sm:w-full xl:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Product")}:
                </span>
                <Select
                  isMulti
                  options={productOptions}
                  value={selectedProducts}
                  onChange={handleSelectProduct}
                  placeholder={t("Select Product")}
                  styles={customStyles}
                  className="w-full"
                />
              </div>
              <div className="sm:w-full xl:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Deal")}:
                </span>
                <Select
                  options={dealOptions}
                  value={selectedDeal}
                  onChange={handleSelectDeal}
                  placeholder={t("Select Deal")}
                  styles={customStyles}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-start w-full gap-8 mb-4">
              {/* Banner Order */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("BannerOrder")}:
                </span>
                <NumberInput
                  value={bannerOrder}
                  onChange={(e) => setBannerOrder(e.target.value)}
                  placeholder={t("BannerOrder")}
                />
              </div>
              {/* Banner Status */}
              <div className="sm:w-full lg:w-[30%] flex items-center justify-start lg:mt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Active")}:
                </span>
                <Switch
                  handleClick={handleStatusBanner}
                  checked={bannerStatus}
                />
              </div>
            </div>

            {/* Buttons*/}
            <div className="flex items-center justify-end w-full gap-x-4">
              <div className="">
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
              <div className="">
                <SubmitButton
                  text={t("Submit")}
                  rounded="rounded-full"
                  handleClick={handleBannerAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddBannerSection;
