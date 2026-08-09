import React, { useEffect, useRef, useState } from "react";
import {
  DropDown,
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

import { MultiSelect } from "primereact/multiselect";
import { useTranslation } from "react-i18next";

const AddCategorySection = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t, i18n } = useTranslation();

  const {
    refetch: refetchTranslation,
    loading: loadingTranslation,
    data: dataTranslation,
  } = useGet({
    url: `${apiUrl}/admin/translation`,
  });

  const {
    refetch: refetchCategory,
    loading: loadingCategory,
    data: dataCategory,
  } = useGet({
    url: `${apiUrl}/admin/category`,
  });

  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/category/add`,
  });

  const dropDownCategoriesParent = useRef();
  const ImageRef = useRef();
  const BannerRef = useRef();
  const auth = useAuth();

  // const [taps, setTaps] = useState([{ id: 1, name: 'English(EN)' }, { id: 2, name: 'Arabic(Ar)' }, { id: 3, name: 'garman' }])
  const [taps, setTaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesParent, setCategoriesParent] = useState([]);
  const [categoriesPriority, setCategoriesPriority] = useState([]);

  const [selectedCategoriesAddons, setSelectedCategoriesAddons] = useState([]);
  const [statecategoriesAddonse, setStatecategoriesAddonse] = useState(
    t("Select Category Addons")
  );
  const [categoriesAddonse, setCategoriesAddonse] = useState([]);
  const [currentTap, setCurrentTap] = useState(0);
  const [categoryName, setCategoryName] = useState([]);
  const [priority, setPriority] = useState("");
  const [appType, setAppType] = useState("all");
  const [statusCategory, setStatusCategory] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);

  const [stateCategoriesParent, setStateCategoriesParent] = useState(
    t("Select Category Parent")
  );
  const [categoriesParentId, setCategoriesParentId] = useState("");
  const [isOpenCategoriesParent, setIsOpenCategoriesParent] = useState(false);

  const [stateCategoriesPriority, setStateCategoriesPriority] = useState(
    t("Select Category Priority")
  );
  const [categoriesPriorityId, setCategoriesPriorityId] = useState("");
  const [isOpenCategoriesPriority, setIsOpenCategoriesPriority] =
    useState(false);

  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [banner, setBanner] = useState("");
  const [bannerFile, setBannerFile] = useState(null);

  useEffect(() => {
    refetchTranslation(); // Refetch data when the component mounts
    refetchCategory(); // Refetch data when the component mounts
  }, [refetchTranslation, refetchCategory]);

  useEffect(() => {
    if (dataTranslation) {
      setTaps(dataTranslation.translation);
    }
  }, [dataTranslation]);

  useEffect(() => {
    refetchCategory();
    // setUpdate(!update)
  }, [refetchCategory, update]);
  useEffect(() => {
    if (dataCategory) {
      setCategories(dataCategory.categories);
      setCategoriesParent(
        [
          { id: "", name: t("Select Category Parent") },
          ...dataCategory.parent_categories,
        ] || []
      );
      setCategoriesAddonse(dataCategory.addons);
      setCategoriesPriority(() => {
        const priorities = [];

        for (let index = 0; index <= dataCategory.categories.length; index++) {
          const element = index + 1;

          const priorityObj = {
            id: element,
            name: element,
          };

          priorities.push(priorityObj);
        }

        return priorities;
      });
    }
  }, [dataCategory]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(file.name);
    }
  };
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBanner(file.name);
    }
  };

  const handleImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };
  const handleBannerClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handleOpenDropdown = (dropdown) => {
    if (dropdown === "parent") {
      setIsOpenCategoriesParent(!isOpenCategoriesParent);
      setIsOpenCategoriesPriority(false);
    } else if (dropdown === "priority") {
      setIsOpenCategoriesParent(false);
      setIsOpenCategoriesPriority(!isOpenCategoriesPriority);
    }
  };

  const handleOpenOptionCategoriesParent = () =>
    setIsOpenCategoriesParent(false);
  const handleOpenOptionCategoriesPriority = () =>
    setIsOpenCategoriesPriority(false);

  const handleSelectCategoriesParent = (option) => {
    setCategoriesParentId(option.id);
    setStateCategoriesParent(option.name);
  };
  const handleSelectCategoriesPriority = (option) => {
    setCategoriesPriorityId(option.id);
    setStateCategoriesPriority(option.name);
  };

  const HandleStatusCategory = () => {
    const currentState = statusCategory;
    {
      currentState === 0 ? setStatusCategory(1) : setStatusCategory(0);
    }
  };
  const HandleActiveCategory = () => {
    const currentActive = activeCategory;
    {
      currentActive === 0 ? setActiveCategory(1) : setActiveCategory(0);
    }
  };

  const handleTap = (index) => {
    setCurrentTap(index);
  };

  useEffect(() => {
    if (!loadingPost) {
      setCurrentTap(0);
      setCategoryName([]);
      setImage("");
      setImageFile(null);
      setBanner("");
      setBannerFile(null);
      setStateCategoriesParent(t("Select Category Parent"));
      setCategoriesParentId("");
      // setStateCategoriesPriority('Select Category Priority')
      setPriority("");
      // setCategoriesPriorityId('')
      setAppType("all");
      setStatecategoriesAddonse(t("Select Category Addons"));
      setSelectedCategoriesAddons([]);
      setStatusCategory(0);
      setActiveCategory(0);
    }
    // refetchCategory()
    setUpdate(!update);
  }, [response]);

  const handleReset = () => {
    categoryName.map((name, index) => {
      setCategoryName((prev) => {
        const updatedNames = [...prev];

        // Ensure the array is long enough
        if (updatedNames.length <= index) {
          updatedNames.length = index + 1; // Resize array
        }

        // Create or update the object at the current index
        updatedNames[index] = {
          ...updatedNames[index], // Retain existing properties if any
          tranlation_id: "", // Use the ID from tap
          category_name: "", // Use the captured string value
          tranlation_name: "", // Use tap.name for tranlation_name
        };

        return updatedNames;
      });
    });
    // setCategoryName([])
    setImage("");
    setImageFile(null);
    setBanner("");
    setBannerFile(null);
    setStateCategoriesParent("Select Category Parent");
    // setParent('')
    // setStateCategoriesPriority('Select Category Priority')
    setPriority("");
    setAppType("all");
    setStatecategoriesAddonse("Select Category Addons");
    setSelectedCategoriesAddons([]);
    setStatusCategory(0);
    setActiveCategory(0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (
        dropDownCategoriesParent.current &&
        !dropDownCategoriesParent.current.contains(event.target)
        // dropDownCategoriesPriority.current && !dropDownCategoriesPriority.current.contains(event.target

        // )
      ) {
        setIsOpenCategoriesParent(null);
        // setIsOpenCategoriesPriority(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategoryAdd = (e) => {
    e.preventDefault();

    if (categoryName.length === 0) {
      auth.toastError(t("enterCategoryNames"));
      return;
    }
    // if (categoryName.length !== taps.length) {
    //        auth.toastError('please Enter All Category Names')
    //        return;
    // }

    if (!imageFile) {
  auth.toastError(t("setCategoryImage"));
      return;
    }
    if (!bannerFile) {
  auth.toastError(t("setCategoryBanner"));
      return;
    }
    const formData = new FormData();

    categoryName.forEach((name, index) => {
      // Corrected the typo and added translation_id and translation_name
      formData.append(
        `category_names[${index}][tranlation_id]`,
        name.tranlation_id
      );
      formData.append(
        `category_names[${index}][category_name]`,
        name.category_name
      );
      formData.append(
        `category_names[${index}][tranlation_name]`,
        name.tranlation_name
      );
    });

    if (categoriesParentId) {
      formData.append("category_id", categoriesParentId);
    }

    formData.append("priority", priority);
    // Assuming selectedCategoriesAddons is an array of selected objects with `id` properties
    selectedCategoriesAddons.forEach((addon, index) => {
      formData.append(`addons_id[${index}]`, addon.id); // Append each ID as an array element in FormData
    });

    formData.append("image", imageFile);
    formData.append("banner_image", bannerFile);

    formData.append("app_type", appType);
    formData.append("status", statusCategory);
    formData.append("active", activeCategory);

    postData(formData, "Category Added Success");
  };
  return (
    <>
      {loadingTranslation || loadingCategory || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleCategoryAdd}>
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
                  }  pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                >
                  {tap.name}
                </span>
              ))}
            </div>
            {/* Content*/}
            <div className="sm:py-3 lg:py-6">
              {taps.map(
                (tap, index) =>
                  currentTap === index && (
                    <div
                      className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                      key={tap.id}
                    >
                      {/* Name Input */}
                      <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                          {t("Name")} {tap.name}:
                        </span>
                        <TextInput
                          value={categoryName[index]?.category_name} // Access category_name property
                          onChange={(e) => {
                            const inputValue = e.target.value; // Ensure this is a string
                            setCategoryName((prev) => {
                              const updatedNames = [...prev];

                              // Ensure the array is long enough
                              if (updatedNames.length <= index) {
                                updatedNames.length = index + 1; // Resize array
                              }

                              // Create or update the object at the current index
                              updatedNames[index] = {
                                ...updatedNames[index], // Retain existing properties if any
                                tranlation_id: tap.id, // Use the ID from tap
                                category_name: inputValue, // Use the captured string value
                                tranlation_name: tap.name || "Default Name", // Use tap.name for tranlation_name
                              };

                              return updatedNames;
                            });
                          }}
                          placeholder={t("CategoryName")}
                        />
                      </div>

                      {/* Conditional Rendering for First Tab Only */}
                      {currentTap === 0 && (
                        <>
                          {/* Category Parent */}
                          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                              {t("CategoryParent")}:
                            </span>
                            <DropDown
                              ref={dropDownCategoriesParent}
                              handleOpen={() => handleOpenDropdown("parent")}
                              stateoption={stateCategoriesParent}
                              openMenu={isOpenCategoriesParent}
                              handleOpenOption={
                                handleOpenOptionCategoriesParent
                              }
                              options={categoriesParent}
                              onSelectOption={handleSelectCategoriesParent}
                              border={false}
                            />
                          </div>
                          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                              {t("PriorityNum")} :
                            </span>
                            <NumberInput
                              value={priority} // Access addon_name property
                              onChange={(e) => setPriority(e.target.value)}
                              placeholder={t("PriorityNum")} 
                            />
                          </div>
                          {/* Category Addons */}
                          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                              {t("CategoryAddons")}:
                            </span>
                            <MultiSelect
                              value={selectedCategoriesAddons}
                              onChange={(e) =>
                                setSelectedCategoriesAddons(e.value)
                              }
                              options={categoriesAddonse}
                              optionLabel="name"
                              display="chip"
                              placeholder={statecategoriesAddonse}
                              maxSelectedLabels={3}
                              className="w-full bg-white md:w-20rem"
                            />
                          </div>
                          {/* Category Image */}
                          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                              {t('CategoryImage')}:
                            </span>
                            <UploadInput
                              value={image}
                              uploadFileRef={ImageRef}
                              placeholder={t('CategoryImage')}
                              handleFileChange={handleImageChange}
                              onChange={(e) => setImage(e.target.value)}
                              onClick={() => handleImageClick(ImageRef)}
                            />
                          </div>

                          {/* Banner Image */}
                          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                              {t("BannerImage")}:
                            </span>
                            <UploadInput
                              value={banner}
                              uploadFileRef={BannerRef}
                              placeholder={t("BannerImage")}
                              handleFileChange={handleBannerChange}
                              onChange={(e) => setBanner(e.target.value)}
                              onClick={() => handleBannerClick(BannerRef)}
                            />
                          </div>
                          {/* App Type */}
                          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                              {t("App Type")}:
                            </span>
                            <select
                              value={appType}
                              onChange={(e) => setAppType(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-thirdColor text-base font-TextFontRegular bg-white focus:outline-none focus:ring-2 focus:ring-mainColor"
                            >
                              <option value="all">{t("All")}</option>
                              <option value="web">{t("Web")}</option>
                              <option value="app">{t("App")}</option>
                            </select>
                          </div>

                          <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-8">
                            <div className="flex items-center justify-start w-2/4 gap-x-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Status")}:
                              </span>
                              <Switch
                                handleClick={HandleStatusCategory}
                                checked={statusCategory}
                              />
                            </div>
                            {/* <div classNam/e="w-1/5 flex sm:flex-col sm:items-start lg:flex-row lg:items-center justify-start gap-x-1 pt-2"> */}
                            <div className="flex items-center justify-start w-2/4 gap-x-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Active")}:
                              </span>
                              <Switch
                                handleClick={HandleActiveCategory}
                                checked={activeCategory}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
              )}
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
                  handleClick={handleCategoryAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddCategorySection;
