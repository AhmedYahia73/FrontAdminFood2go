import React, { useEffect, useRef, useState } from "react";
import { useGet } from "../../../../Hooks/useGet";
import {
  DropDown,
  LoaderLogin,
  NumberInput,
  StaticButton,
  SubmitButton,
  Switch,
  TextInput,
  TimeInput,
  TitlePage,
  UploadInput,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { MultiSelect } from "primereact/multiselect";
import ButtonAdd from "../../../../Components/Buttons/AddButton";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";

const AddProductPage = () => {
  const { t, i18n } = useTranslation();
  const selectedLanguage = i18n.language;

  const auth = useAuth();
  /* Get Data */
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
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
  } = useGet({ url: `${apiUrl}/admin/category?locale=${selectedLanguage}` });
  const {
    refetch: refetchProduct,
    loading: loadingProduct,
    data: dataProduct,
  } = useGet({
    url: `${apiUrl}/admin/product?locale=${selectedLanguage}`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/product/add`,
  });
  /* Refs */
  const variationTypeRef = useRef([]);
  const [openVariationIndex, setOpenVariationIndex] = useState(null); // Tracks which variation's dropdown is open

  const categoryRef = useRef();
  const subCategoryRef = useRef();
  const itemTypeRef = useRef();
  const stockTypeRef = useRef();
  const discountRef = useRef();
  const taxRef = useRef();
  const productImageRef = useRef();
  const groupRef = useRef();
  const unitRef = useRef();
  const appTypeRef = useRef();

  /* States */
  const [taps, setTaps] = useState([]);
  const [currentProductNamesTap, setCurrentProductNamesTap] = useState(0);
  const [currentExcludeNamesTap, setCurrentExcludeNamesTap] = useState(0);
  const [currentExtraNamesTap, setCurrentExtraNamesTap] = useState(0);
  const [currentVariationTap, setCurrentVariationTap] = useState(0);
  const [currentVariationOptionTap, setCurrentVariationOptionTap] = useState(0);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filterSubCategories, setFilterSubCategories] = useState([]);
  const [addons, setAddons] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState({}); // Object to store extras for each group

  // New states for weight functionality
  const [weightStatus, setWeightStatus] = useState(0);
  const [weightPoint, setWeightPoint] = useState("");
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedUnitState, setSelectedUnitState] = useState(t("Selected Unit"));

  const [itemTypes, setItemTypes] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
  const [appTypes, setAppTypes] = useState([]);

  useEffect(() => {
    setItemTypes([
      { id: "", name: t("Selected Item Type") },
      { id: "online", name: t("online") },
      { id: "offline", name: t("offline") },
      { id: "all", name: t("all") },
    ]);
    setStockTypes([
      { id: "", name: t("Selected Stock Type") },
      { id: "unlimited", name: t("unlimited") },
      { id: "daily", name: t("daily") },
      { id: "fixed", name: t("fixed") },
    ]);
    setAppTypes([
      { id: "", name: t("Selected App Type") },
      { id: "all", name: t("all") },
      { id: "web", name: t("web") },
      { id: "app", name: t("app") },
    ]);
  }, [t, i18n.language]);

  // Selected Data
  // Product Names
  const [productNames, setProductNames] = useState([]);

  // Product Description
  const [descriptionNames, setDescriptionNames] = useState([]);

  // Product Exclude
  const [productExclude, setProductExclude] = useState([]);

  // Product Extra
  const [productExtra, setProductExtra] = useState([]);

  // Product Variations
  const [productVariations, setProductVariations] = useState([]);

  // Product Category
  const [selectedCategoryState, setSelectedCategoryState] = useState(
    t("Selected Category")
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Product SubCategory
  const [selectedSubCategoryState, setSelectedSubCategoryState] = useState(
    t("Selected Subcategory")
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");

  // Product Discount
  const [selectedDiscountState, setSelectedDiscountState] = useState(
    t("Selected Discount")
  );
  const [selectedDiscountId, setSelectedDiscountId] = useState("");

  // Product Tax
  const [selectedTaxState, setSelectedTaxState] = useState(t("Selected Tax"));
  const [selectedTaxId, setSelectedTaxId] = useState("");

  // Product Addons
  const [selectedAddonsState, setSelectedAddonsState] = useState(
    t("Selected Addons")
  );
  const [selectedAddonsId, setSelectedAddonsId] = useState([]);

  // Product Item Types
  const [selectedItemTypeState, setSelectedItemTypeState] = useState(
    t("Selected Item Type")
  );
  const [selectedItemTypeName, setSelectedItemTypeName] = useState("");

  // Product Stock Types
  const [selectedStockTypeState, setSelectedStockTypeState] = useState(
    t("Selected Stock Type")
  );
  const [selectedStockTypeName, setSelectedStockTypeName] = useState("");

  // Product App Type
  const [selectedAppTypeState, setSelectedAppTypeState] = useState(
    t("Selected App Type")
  );
  const [selectedAppTypeName, setSelectedAppTypeName] = useState("");
  // Product Stock Number
  const [productStockNumber, setProductStockNumber] = useState("");

  // Product Price && Point
  const [productPrice, setProductPrice] = useState("");
  const [productPoint, setProductPoint] = useState("");
  const [productPriority, setProductPriority] = useState("");
  const [productCode, setProductCode] = useState("");

  // Product From && To Status
  const [productStatusFrom, setProductStatusFrom] = useState("");
  const [productStatusTo, setProductStatusTo] = useState("");

  // Product Status && Recommended && Time Status
  const [productStatus, setProductStatus] = useState(0);
  const [productRecommended, setProductRecommended] = useState(0);
  const [productTimeStatus, setProductTimeStatus] = useState(0);
  const [productRecipe, setProductRecipe] = useState(0);

  // Product Image
  const [productImage, setProductImage] = useState(null);
  const [productImageName, setProductImageName] = useState(t("Choose Photo"));

  // Product Group
  const [selectedGroupState, setSelectedGroupState] = useState(
    t("Selected Group")
  );
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const [selectedOptionGroups, setSelectedOptionGroups] = useState({});
  const [selectedOptionExtras, setSelectedOptionExtras] = useState({});

  /* dropdown Status */
  const [isOPenProductCategory, setIsOPenProductCategory] = useState(false);
  const [isOPenProductSubCategory, setIsOPenProductSubCategory] = useState(false);
  const [isOPenProductItemType, setIsOPenProductItemType] = useState(false);
  const [isOPenProductStockType, setIsOPenProductStockType] = useState(false);
  const [isOPenProductDiscount, setIsOPenProductDiscount] = useState(false);
  const [isOPenProductTax, setIsOPenProductTax] = useState(false);
  const [isOPenProductGroup, setIsOPenProductGroup] = useState(false);
  const [isOPenProductUnit, setIsOPenProductUnit] = useState(false);
  const [isOPenProductAppType, setIsOPenProductAppType] = useState(false);

  /* Refetch Data */
  useEffect(() => {
    refetchTranslation(); // Get Language Translation data when the component mounts
    refetchCategory(); // Get Categories && Addons && SubCategories data when the component mounts
    refetchProduct(); // Get Discounts && Taxes data when the component mounts
  }, [i18n.language]); // Refetch when language changes

  useEffect(() => {
    /* Set data to Taps Languages Translation */
    if (dataTranslation) {
      setTaps(dataTranslation?.translation || []); // Update taps if dataTranslation exists
    }
    /* Set data to Categories && Addons && SubCategories */
    if (dataCategory) {
      setCategories(
        [
          { id: "", name: t("Select Category") },
          ...dataCategory.parent_categories,
        ] || []
      );
      setSubCategories(
        [
          { id: "", name: t("Select Subcategory") },
          ...dataCategory?.sub_categories,
        ] || []
      );
      setAddons(dataCategory?.addons || []);
    }
    /* Set data to Discounts && Taxes */
    if (dataProduct) {
      setDiscounts(
        [{ id: "", name: t("Select Discount") }, ...dataProduct?.discounts] || []
      );
      setTaxes(
        [{ id: "", name: t("Select Tax") }, ...dataProduct?.taxes] || []
      );
      setGroups(dataProduct?.group || []);
      // Get units from product data if available
      if (dataProduct.units) {
        setUnits([{ id: "", name: t("Select Unit") }, ...dataProduct.units]);
      }
    }
  }, [dataTranslation, dataCategory, dataProduct]);

  // Handle weight status change
  const handleWeightStatusChange = () => {
    setWeightStatus(prev => prev === 1 ? 0 : 1);
    // Reset weight fields when toggling
    setWeightPoint("");
    setSelectedUnit("");
    setSelectedUnitState(t("Selected Unit"));
  };

  // Update placeholders when language changes
  useEffect(() => {
    if (!selectedCategoryId) setSelectedCategoryState(t("Selected Category"));
    if (!selectedSubCategoryId) setSelectedSubCategoryState(t("Selected Subcategory"));
    if (!selectedDiscountId) setSelectedDiscountState(t("Selected Discount"));
    if (!selectedTaxId) setSelectedTaxState(t("Selected Tax"));
    if (!selectedGroupId) setSelectedGroupState(t("Selected Group"));
    if (!selectedItemTypeName) setSelectedItemTypeState(t("Selected Item Type"));
    if (!selectedStockTypeName) setSelectedStockTypeState(t("Selected Stock Type"));
    if (!selectedAppTypeName) setSelectedAppTypeState(t("Selected App Type"));
    if (!selectedUnit) setSelectedUnitState(t("Selected Unit"));
    if (selectedAddonsId.length === 0) setSelectedAddonsState(t("Selected Addons"));
    if (!productImage) setProductImageName(t("Choose Photo"));
  }, [i18n.language, t]);

  const handleSelectUnit = (option) => {
    setSelectedUnit(option.id);
    setSelectedUnitState(option.name);
  };

  const handleOpenUnit = () => {
    handleCloseAllDropdowns();
    setIsOPenProductUnit(!isOPenProductUnit);
  };

  const handleOpenOptionProductUnit = () => setIsOPenProductUnit(false);

  // Exclude Product
  const handleAddExclude = () => {
    const newExclude = {
      names: taps.map((tap) => ({
        exclude_name: "",
        tranlation_id: tap.id,
        tranlation_name: tap.name,
      })),
    };

    setProductExclude((prevProductnewExclude) => [
      ...prevProductnewExclude,
      newExclude,
    ]);
  };

  const handleRemoveExclude = (index) => {
    setProductExclude((prevProductExclude) =>
      prevProductExclude.filter((_, idx) => idx !== index)
    );
  };

  // Add a new Variation
  const handleAddVariation = () => {
    const newVariation = {
      type: "",
      required: 0,
      weight: 0,
      weight_unit: "",
      min: "",
      max: "",
      names: taps.map((tap) => ({
        name: "",
        tranlation_id: tap.id,
        tranlation_name: tap.name,
      })),
      options: [
        {
          names: taps.map((tap) => ({
            name: "",
            tranlation_id: tap.id,
            tranlation_name: tap.name,
          })),
          extra: [
            {
              extra_names: taps.map((tap) => ({
                extra_name: "",
                tranlation_id: tap.id,
                tranlation_name: tap.name,
              })),
              extra_price: "",
            },
          ],
          points: "",
          price: "",
          status: 0,
        },
      ],
    };
    setProductVariations((prevVariations) => [...prevVariations, newVariation]);
  };

  // Remove a Variation
  const handleRemoveVariation = (index) => {
    setProductVariations((prevVariations) =>
      prevVariations.filter((_, idx) => idx !== index)
    );
  };

  // Example for updating nested options array
  const updateVariationState = (
    setProductVariations,
    variationIndex,
    field,
    tapName,
    updatedValue
  ) => {
    setProductVariations((prevProductVariations) =>
      prevProductVariations.map((item, idx) =>
        idx === variationIndex
          ? {
            ...item,
            [field]: item[field].map((subField) =>
              subField.tranlation_name === tapName
                ? { ...subField, name: updatedValue }
                : subField
            ),
          }
          : item
      )
    );
  };

  // Add a new Option to a specific Variation
  const handleAddOption = (variationIndex) => {
    const newOption = {
      names: taps.map((tap) => ({
        name: "",
        tranlation_id: tap.id,
        tranlation_name: tap.name,
      })),
      extra: [
        {
          extra_names: taps.map((tap) => ({
            extra_name: "",
            tranlation_id: tap.id,
            tranlation_name: tap.name,
          })),
          extra_price: "",
        },
      ],
      price: "",
      points: "",
      status: 0,
    };

    setProductVariations((prevVariations) =>
      prevVariations.map((variation, idx) =>
        idx === variationIndex
          ? { ...variation, options: [...variation.options, newOption] }
          : variation
      )
    );
  };

  // DropDowns
  const handleOpenVariationType = (index) => {
    setOpenVariationIndex((prevIndex) => (prevIndex === index ? null : index)); // Toggle open state for the selected index
  };

  const handleOpenOptionProductVariationType = () => {
    setOpenVariationIndex(null); // Close the dropdown
  };

  const handleCloseAllDropdowns = () => {
    setIsOPenProductCategory(false);
    setIsOPenProductSubCategory(false);
    setIsOPenProductItemType(false);
    setIsOPenProductStockType(false);
    setIsOPenProductDiscount(false);
    setIsOPenProductTax(false);
    setIsOPenProductGroup(false);
    setIsOPenProductUnit(false);
    setIsOPenProductAppType(false);
  };

  const handleOpenCategory = () => {
    handleCloseAllDropdowns();
    setIsOPenProductCategory(!isOPenProductCategory);
  };
  const handleOpenSubCategory = () => {
    handleCloseAllDropdowns();
    setIsOPenProductSubCategory(!isOPenProductSubCategory);
  };
  const handleOpenItemType = () => {
    handleCloseAllDropdowns();
    setIsOPenProductItemType(!isOPenProductItemType);
  };
  const handleOpenStockType = () => {
    handleCloseAllDropdowns();
    setIsOPenProductStockType(!isOPenProductStockType);
  };
  const handleOpenDiscount = () => {
    handleCloseAllDropdowns();
    setIsOPenProductDiscount(!isOPenProductDiscount);
  };
  const handleOpenTax = () => {
    handleCloseAllDropdowns();
    setIsOPenProductTax(!isOPenProductTax);
  };

  const handleOpenOptionProductCategory = () => setIsOPenProductCategory(false);
  const handleOpenOptionProductSubCategory = () => setIsOPenProductSubCategory(false);
  const handleOpenOptionProductItemType = () => setIsOPenProductItemType(false);
  const handleOpenOptionProductStockType = () => setIsOPenProductStockType(false);
  const handleOpenOptionProductDiscount = () => setIsOPenProductDiscount(false);
  const handleOpenOptionProductTax = () => setIsOPenProductTax(false);

  const handleOpenAppType = () => {
    handleCloseAllDropdowns();
    setIsOPenProductAppType(!isOPenProductAppType);
  };
  const handleOpenOptionProductAppType = () => setIsOPenProductAppType(false);
  const handleSelectProductAppType = (option) => {
    setSelectedAppTypeName(option.id);
    setSelectedAppTypeState(option.name);
  };

  const handleSelectProductVariationType = (option, variationIndex) => {
    // Update the `type` of the variation at `variationIndex`
    setProductVariations((prevProductVariations) =>
      prevProductVariations.map((ele, index) =>
        index === variationIndex
          ? { ...ele, type: option.name, min: "", max: "" }
          : ele
      )
    );
  };
  const handleSelectProductCategory = (option) => {
    setSelectedCategoryId(option.id);
    setSelectedCategoryState(option.name);
    const filterSup = subCategories.filter(
      (sup) => sup.category_id === option.id
    );
    setFilterSubCategories([
      { id: "", name: "Selected Subcategory" },
      ...filterSup,
    ]);
  };
  const handleSelectProductSubCategory = (option) => {
    setSelectedSubCategoryId(option.id);
    setSelectedSubCategoryState(option.name);
  };
  const handleSelectProductItemType = (option) => {
    setSelectedItemTypeName(option.id);
    setSelectedItemTypeState(option.name);
  };
  const handleSelectProductStockType = (option) => {
    setSelectedStockTypeName(option.id);
    setSelectedStockTypeState(option.name);
    setProductStockNumber("");
  };
  const handleSelectProductDiscount = (option) => {
    setSelectedDiscountId(option.id);
    setSelectedDiscountState(option.name);
  };
  const handleSelectProductTax = (option) => {
    setSelectedTaxId(option.id);
    setSelectedTaxState(option.name);
  };
  const handleProductStatus = () => {
    const currentState = productStatus;
    {
      currentState === 0 ? setProductStatus(1) : setProductStatus(0);
    }
  };
  const handleProductRecommended = () => {
    const currentState = productRecommended;
    {
      currentState === 0 ? setProductRecommended(1) : setProductRecommended(0);
    }
  };
  const handleProductTimeStatus = () => {
    const currentState = productTimeStatus;
    {
      currentState === 0 ? setProductTimeStatus(1) : setProductTimeStatus(0);
    }
    setProductStatusFrom(null);
    setProductStatusTo(null);
  };
  const handleProductRecipe = () => {
    const currentState = productRecipe;
    {
      currentState === 0 ? setProductRecipe(1) : setProductRecipe(0);
    }
  };
  // Image
  const handleProductImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };
  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      setProductImageName(file.name);
    }
  };

  // Close All dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target) &&
        subCategoryRef.current &&
        !subCategoryRef.current.contains(event.target) &&
        itemTypeRef.current &&
        !itemTypeRef.current.contains(event.target) &&
        stockTypeRef.current &&
        !stockTypeRef.current.contains(event.target) &&
        discountRef.current &&
        !discountRef.current.contains(event.target) &&
        taxRef.current &&
        !taxRef.current.contains(event.target) &&
        groupRef.current &&
        !groupRef.current.contains(event.target) &&
        unitRef.current &&
        !unitRef.current.contains(event.target)
      ) {
        handleCloseAllDropdowns();
      }

      // Handle closing variation dropdowns
      if (variationTypeRef.current) {
        let clickedInsideAnyVariation = false;
        for (let i = 0; i < variationTypeRef.current.length; i++) {
          const ref = variationTypeRef.current[i];
          if (ref && ref.contains(event.target)) {
            clickedInsideAnyVariation = true;
            break;
          }
        }

        if (!clickedInsideAnyVariation) {
          setOpenVariationIndex(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    setIsOPenProductCategory,
    setIsOPenProductSubCategory,
    setIsOPenProductItemType,
    setIsOPenProductStockType,
    setIsOPenProductDiscount,
    setIsOPenProductTax,
    setOpenVariationIndex,
    setIsOPenProductGroup,
    setIsOPenProductUnit,
  ]);

  // Go To Languages Tap About Product Names
  const handleProductNamesTap = (index) => {
    setCurrentProductNamesTap(index);
  };
  // Go To Languages Tap About Exclude Names
  const handleExcludeNamesTap = (index) => {
    setCurrentExcludeNamesTap(index);
  };
  // Go To Languages Tap About Extra Names
  const handleExtraNamesTap = (index) => {
    setCurrentExtraNamesTap(index);
  };
  // Go To Languages Tap About Product Variation
  const handleVariationTap = (index) => {
    setCurrentVariationTap(index);
  };
  // Go To Languages Tap About Product Variation
  const handleVariationOptionTap = (index) => {
    setCurrentVariationOptionTap(index);
  };

  /* Reset Details Product */
  const handleReset = () => {
    setCurrentProductNamesTap(0);
    setCurrentExcludeNamesTap(0);
    setCurrentExtraNamesTap(0);
    setCurrentVariationTap(0);
    setCurrentVariationOptionTap(0);
    setProductNames([]);
    setDescriptionNames([]);
    setProductExclude([]);
    setProductExtra([]);
    setProductVariations([]);
    setSelectedCategoryState(t("Selected Category"));
    setSelectedCategoryId("");
    setSelectedSubCategoryState(t("Selected SubCategory"));
    setSelectedSubCategoryId("");
    setSelectedDiscountState(t("Selected Discount"));
    setSelectedDiscountId("");
    setSelectedTaxState(t("Selected Tax"));
    setSelectedTaxId("");
    setSelectedAddonsState(t("Selected Addons"));
    setSelectedGroupState(t("Selected Groups"));
    setSelectedAddonsId("");
    setSelectedItemTypeState(t("Selected Item Type"));
    setSelectedItemTypeName("");
    setSelectedStockTypeState(t("Selected Stock Type"));
    setSelectedStockTypeName("");
    setSelectedAppTypeState(t("Selected App Type"));
    setSelectedAppTypeName("");
    setProductStockNumber("");
    setProductPrice("");
    setProductPoint("");
    setProductPriority("");
    setProductCode("");
    setProductStatusFrom("");
    setProductStatusTo("");
    setProductStatus(0);
    setProductRecommended(0);
    setProductTimeStatus(0);
    setProductRecipe(0);
    setProductImage(null);
    setProductImageName(t("Choose Photo"));
    // Reset weight fields
    setWeightStatus(0);
    setWeightPoint("");
    setSelectedUnit("");
    setSelectedUnitState(t("Selected Unit"));
  };

  // Remove an option from a specific Option within a Variation
  const handleRemoveOption = (variationIndex, optionIndex) => {
    setProductVariations((prevVariations) =>
      prevVariations.map((variation, vIdx) =>
        vIdx === variationIndex
          ? {
            ...variation,
            options: variation.options.filter(
              (_, oIdx) => oIdx !== optionIndex
            ),
          }
          : variation
      )
    );
  };

  // Handle group selection and auto-select all extras
  const handleGroupChange = (e) => {
    const selected = e.value;
    setSelectedGroups(selected);
    // Update selectedExtras: auto-select all extras for newly selected groups
    const updatedExtras = { ...selectedExtras };
    selected.forEach((groupId) => {
      if (!updatedExtras[groupId]) {
        // If group is newly selected, select all its extras by default
        const extras = getExtrasForGroup(groupId);
        updatedExtras[groupId] = extras.map((extra) => extra.id);
      }
    });
    // Remove extras for deselected groups
    Object.keys(updatedExtras).forEach((groupId) => {
      if (!selected.includes(Number(groupId))) {
        delete updatedExtras[groupId];
      }
    });
    setSelectedExtras(updatedExtras);
  };

  // Handle extra selection for a specific group
  const handleExtraChange = (groupId, selectedExtraIds) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [groupId]: selectedExtraIds,
    }));
  };

  // Filter extras for a specific group
  const getExtrasForGroup = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    return group && group.extra ? group.extra : [];
  };

  // Handle group selection for a specific variation option
  const handleOptionGroupChange = (variationIndex, optionIndex, selectedGroupIds) => {
    const key = `${variationIndex}-${optionIndex}`;
    setSelectedOptionGroups((prev) => ({
      ...prev,
      [key]: selectedGroupIds,
    }));
    // Update selectedOptionExtras: auto-select all extras for newly selected groups
    const updatedExtras = { ...selectedOptionExtras[key] } || {};
    selectedGroupIds.forEach((groupId) => {
      if (!updatedExtras[groupId]) {
        const extras = getExtrasForGroup(groupId);
        updatedExtras[groupId] = extras.map((extra) => extra.id);
      }
    });
    // Remove extras for deselected groups
    Object.keys(updatedExtras).forEach((groupId) => {
      if (!selectedGroupIds.includes(Number(groupId))) {
        delete updatedExtras[groupId];
      }
    });
    setSelectedOptionExtras((prev) => ({
      ...prev,
      [key]: updatedExtras,
    }));
  };

  // Handle extras selection for a specific group within a variation option
  const handleOptionExtrasChange = (variationIndex, optionIndex, groupId, selectedExtraIds) => {
    const key = `${variationIndex}-${optionIndex}`;
    setSelectedOptionExtras((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [groupId]: selectedExtraIds,
      },
    }));
  };

  /* Add Product */
  const handleproductAdd = (e) => {
    e.preventDefault();

    if(!selectedCategoryId){
      auth.toastError(t("Pleaseselectcategory"));
      return;
    }

    const formData = new FormData();
    formData.append("category_id", selectedCategoryId);
    formData.append("sub_category_id", selectedSubCategoryId);
    formData.append("item_type", selectedItemTypeName);
    formData.append("stock_type", selectedStockTypeName);
    formData.append("app_type", selectedAppTypeName);
    formData.append("number", productStockNumber);
    formData.append("price", productPrice);
    formData.append("discount_id", selectedDiscountId);
    formData.append("tax_id", selectedTaxId);
    formData.append("points", productPoint);
    formData.append("order", productPriority);
    if (productCode) {
      formData.append("product_code", productCode);
    }

    formData.append("product_time_status", productTimeStatus);
    if (productStatusFrom) {
      formData.append("from", productStatusFrom);
    }
    if (productStatusTo) {
      formData.append("to", productStatusTo);
    }
    formData.append("recommended", productRecommended);
    formData.append("status", productStatus);
    formData.append("recipe", productRecipe);
    formData.append("image", productImage);

    // Add weight status and related fields
    formData.append("weight_status", weightStatus);
    if (weightStatus === 1) {
      formData.append("weight_point", weightPoint);
      formData.append("unit_id", selectedUnit);
    }
    if (selectedAddonsId.length > 0) {
      const addonIds = selectedAddonsId.map((addon) => addon.id);
      addonIds.forEach((id, indexID) => {
        formData.append(`addons[${indexID}]`, id);
      });
    }

    productNames.forEach((name, index) => {
      formData.append(`product_names[${index}][product_name]`, name.product_name);
      formData.append(`product_names[${index}][tranlation_id]`, name.tranlation_id);
      formData.append(`product_names[${index}][tranlation_name]`, name.tranlation_name);
    });

    {
      descriptionNames.forEach((name, index) => {
        formData.append(`product_descriptions[${index}][product_description]`, name.description_name)
        formData.append(`product_descriptions[${index}][tranlation_name]`, name.tranlation_name)
        formData.append(`product_descriptions[${index}][tranlation_id]`, name.tranlation_id)
      })
    }

    // Only include exclude and extra sections if weight_status is not 1
    if (weightStatus !== 1) {
      if (Array.isArray(productExclude)) {
        productExclude.forEach((exclude, index) => {
          if (Array.isArray(exclude.names)) {
            exclude.names.forEach((exName, exInd) => {
              formData.append(`excludes[${index}][names][${exInd}][exclude_name]`, exName.exclude_name);
              formData.append(`excludes[${index}][names][${exInd}][tranlation_id]`, exName.tranlation_id);
              formData.append(`excludes[${index}][names][${exInd}][tranlation_name]`, exName.tranlation_name);
            });
          }
        });
      }

      // Send only the selected extra IDs from selectedExtras for top-level extra
      if (Object.keys(selectedExtras).length > 0) {
        let extraIndex = 0;
        Object.entries(selectedExtras).forEach(([groupId, extraIds]) => {
          if (Array.isArray(extraIds)) {
            extraIds.forEach((extraId) => {
              formData.append(`extra[${extraIndex}][id]`, extraId);
              extraIndex++;
            });
          }
        });
      }
    }

    if (Array.isArray(productVariations)) {
      productVariations.forEach((variation, indexVar) => {

        /* Names */
        if (Array.isArray(variation.names)) {
          variation.names.forEach((name, index) => {
            formData.append(`variations[${indexVar}][names][${index}][name]`, name.name);
            formData.append(`variations[${indexVar}][names][${index}][tranlation_name]`, name.tranlation_name);
            formData.append(`variations[${indexVar}][names][${index}][tranlation_id]`, name.tranlation_id);
          });
        } else {
          console.warn(`variation.names is not a valid array for variation index ${indexVar}`);
        }

        if (Array.isArray(variation.options)) {
          variation.options.forEach((option, indexOption) => {
            // Extra Option Handling using selectedOptionExtras
            const extraKey = `${indexVar}-${indexOption}`;
            const selectedExtrasForOption = selectedOptionExtras[extraKey] || {};

            if (Object.keys(selectedExtrasForOption).length > 0) {
              let extraIndex = 0;
              Object.values(selectedExtrasForOption).flat().forEach((extraId) => {
                formData.append(
                  `variations[${indexVar}][options][${indexOption}][extra][${extraIndex}][extra]`,
                  extraId !== undefined ? String(extraId) : ""
                );
                extraIndex++;
              });
            } else {
              console.warn(`No extras found for option ${extraKey}`);
            }

            // Names Option Handling
            if (Array.isArray(option.names) && option.names.length > 0) {
              option.names.forEach((optionNa, indexOpNa) => {
                formData.append(
                  `variations[${indexVar}][options][${indexOption}][names][${indexOpNa}][name]`,
                  optionNa.name && typeof optionNa.name === "string" ? optionNa.name : ""
                );
                formData.append(
                  `variations[${indexVar}][options][${indexOption}][names][${indexOpNa}][tranlation_id]`,
                  optionNa.tranlation_id !== undefined ? String(optionNa.tranlation_id) : ""
                );
                formData.append(
                  `variations[${indexVar}][options][${indexOption}][names][${indexOpNa}][tranlation_name]`,
                  typeof optionNa.tranlation_name === "string" ? optionNa.tranlation_name : ""
                );
              });
            }

            // Append other option-specific data
            formData.append(`variations[${indexVar}][options][${indexOption}][price]`, option.price || 0);
            formData.append(`variations[${indexVar}][options][${indexOption}][status]`, option.status);
            formData.append(`variations[${indexVar}][options][${indexOption}][points]`, option.points || 0);
          });
        }

        // Append general variation data
        formData.append(`variations[${indexVar}][type]`, variation.type === t("multiple") ? "multiple" : "single");
        formData.append(`variations[${indexVar}][min]`, variation.min);
        formData.append(`variations[${indexVar}][max]`, variation.max);
        formData.append(`variations[${indexVar}][required]`, variation.required ? 1 : 0);
        formData.append(`variations[${indexVar}][weight]`, variation.weight ? 1 : 0);
        if (variation.weight === 1) {
          formData.append(`variations[${indexVar}][weight_unit]`, variation.weight_unit || "");
        }
      });
    }
    postData(formData, t("Product Added Success"));
  };

  useEffect(() => {
    if (response && response.status === 200) {
      handleReset();
    }
  }, [response]);

  return (
    <>
      {loadingTranslation ||
        loadingCategory ||
        loadingProduct ||
        loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full">
            <LoaderLogin />
          </div>
        </>
      ) : (
        <form
          onSubmit={handleproductAdd}
          className="flex flex-col items-center justify-center w-full gap-5 pb-24"
        >
          <div className="flex flex-col items-start justify-start w-full gap-5">
            {/* Product Names && Description */}
            <div className="flex flex-col items-start justify-start w-full gap-4 pb-4 border-b-4 border-gray-300">
              <div className="flex items-center justify-start w-full gap-x-6">
                {taps.map((tap, index) => (
                  <span
                    key={tap.id}
                    onClick={() => handleProductNamesTap(index)}
                    className={`${currentProductNamesTap === index
                      ? "text-mainColor border-b-4 border-mainColor"
                      : "text-thirdColor"
                      }  pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                  >
                    {tap.name}
                  </span>
                ))}
              </div>

              <div className="w-full">
                {taps.map(
                  (tap, index) =>
                    currentProductNamesTap === index && (
                      <div
                        className="flex items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                        key={tap.id}
                      >
                        {/* Product Name Input */}
                        <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                          <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("ProductName")} {tap.name}:
                          </span>
                          <TextInput
                            value={productNames[index]?.product_name}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              setProductNames((prev) => {
                                const updatedProductNames = [...prev];
                                if (updatedProductNames.length <= index) {
                                  updatedProductNames.length = index + 1;
                                }
                                updatedProductNames[index] = {
                                  ...updatedProductNames[index],
                                  tranlation_id: tap.id,
                                  product_name: inputValue,
                                  tranlation_name: tap.name || "Default Name",
                                };
                                return updatedProductNames;
                              });
                            }}
                            placeholder={t("Product Name")}
                          />
                        </div>

                        {/* Product Description Input */}
                        <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                          <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Product Description")} {tap.name}:
                          </span>
                          <TextInput
                            value={descriptionNames[index]?.description_name}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              setDescriptionNames((prev) => {
                                const updatedDescriptionNames = [...prev];
                                if (updatedDescriptionNames.length <= index) {
                                  updatedDescriptionNames.length = index + 1;
                                }
                                updatedDescriptionNames[index] = {
                                  ...updatedDescriptionNames[index],
                                  tranlation_id: tap.id,
                                  description_name: inputValue,
                                  tranlation_name: tap.name || "Default Name",
                                };
                                return updatedDescriptionNames;
                              });
                            }}
                            placeholder={t("Product Description")}
                          />
                        </div>

                        {/* Weight Status Switch */}
                        <div className="sm:w-full lg:w-[30%] flex items-center justify-start gap-x-3 lg:mt-6">
                          <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Weight Status")}:
                          </span>
                          <Switch
                            handleClick={handleWeightStatusChange}
                            checked={weightStatus === 1}
                          />
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Weight Fields */}
            {weightStatus === 1 && (
              <div className="flex items-start justify-start w-full gap-5 sm:flex-col lg:flex-row">
                {/* Weight Point */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Weight Point")}:
                  </span>
                  <NumberInput
                    value={weightPoint}
                    onChange={(e) => setWeightPoint(e.target.value)}
                    placeholder={t("Weight Point")}
                  />
                </div>
                {/* Unit Selection */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Unit")}:
                  </span>
                  <DropDown
                    ref={unitRef}
                    handleOpen={handleOpenUnit}
                    stateoption={selectedUnitState}
                    openMenu={isOPenProductUnit}
                    handleOpenOption={handleOpenOptionProductUnit}
                    options={units}
                    onSelectOption={handleSelectUnit}
                  />
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="flex items-start justify-start w-full gap-5 sm:flex-col lg:flex-row">
              {/* Product Category  */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Category Name")}:
                </span>
                <DropDown
                  ref={categoryRef}
                  handleOpen={handleOpenCategory}
                  stateoption={selectedCategoryState}
                  openMenu={isOPenProductCategory}
                  handleOpenOption={handleOpenOptionProductCategory}
                  options={categories}
                  onSelectOption={handleSelectProductCategory}
                />
              </div>
              {/* Product SubCategory  */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("SubCategory Name")}:
                </span>
                <DropDown
                  ref={subCategoryRef}
                  handleOpen={handleOpenSubCategory}
                  stateoption={selectedSubCategoryState}
                  openMenu={isOPenProductSubCategory}
                  handleOpenOption={handleOpenOptionProductSubCategory}
                  options={filterSubCategories}
                  onSelectOption={handleSelectProductSubCategory}
                />
              </div>
              {/* Product Addons  */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Addons Names")}:
                </span>
                <MultiSelect
                  value={selectedAddonsId}
                  onChange={(e) => setSelectedAddonsId(e.value)}
                  options={addons}
                  optionLabel="name"
                  display="chip"
                  placeholder={selectedAddonsState}
                  maxSelectedLabels={3}
                  className="w-full bg-white shadow md:w-20rem"
                />
              </div>
            </div>

            <div className="flex items-start justify-start w-full gap-5 sm:flex-col lg:flex-row">
              {/* Product Item Type  */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Item Type")}:
                </span>
                <DropDown
                  ref={itemTypeRef}
                  handleOpen={handleOpenItemType}
                  stateoption={selectedItemTypeState}
                  openMenu={isOPenProductItemType}
                  handleOpenOption={handleOpenOptionProductItemType}
                  options={itemTypes}
                  onSelectOption={handleSelectProductItemType}
                />
              </div>
              {/* Product Stock Type  */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Stock Type")}:
                </span>
                <DropDown
                  ref={stockTypeRef}
                  handleOpen={handleOpenStockType}
                  stateoption={selectedStockTypeState}
                  openMenu={isOPenProductStockType}
                  handleOpenOption={handleOpenOptionProductStockType}
                  options={stockTypes}
                  onSelectOption={handleSelectProductStockType}
                />
              </div>

              {/* App Type */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("App Type")}:
                </span>
                <DropDown
                  ref={appTypeRef}
                  handleOpen={handleOpenAppType}
                  stateoption={selectedAppTypeState}
                  openMenu={isOPenProductAppType}
                  handleOpenOption={handleOpenOptionProductAppType}
                  options={appTypes}
                  onSelectOption={handleSelectProductAppType}
                />
              </div>
            </div>

            <div className="flex items-start justify-start w-full gap-5 sm:flex-col lg:flex-row">
              {selectedStockTypeName === "daily" ||
                selectedStockTypeName === "fixed" ? (
                <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Number")}:
                  </span>
                  <NumberInput
                    value={productStockNumber}
                    onChange={(e) => setProductStockNumber(e.target.value)}
                    placeholder={t("Number")}
                  />
                </div>
              ) : (
                ""
              )}

              {/* Product Price */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Price")}:
                </span>
                <NumberInput
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder={t("Price")}
                />
              </div>
            </div>

            <div className="flex items-start justify-start w-full gap-5 sm:flex-col lg:flex-row">
              {/* Product Discount  */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Discount Name")}:
                </span>
                <DropDown
                  ref={discountRef}
                  handleOpen={handleOpenDiscount}
                  stateoption={selectedDiscountState}
                  openMenu={isOPenProductDiscount}
                  handleOpenOption={handleOpenOptionProductDiscount}
                  options={discounts}
                  onSelectOption={handleSelectProductDiscount}
                />
              </div>
              {/* Product Tax  */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Tax Name")}:
                </span>
                <DropDown
                  ref={taxRef}
                  handleOpen={handleOpenTax}
                  stateoption={selectedTaxState}
                  openMenu={isOPenProductTax}
                  handleOpenOption={handleOpenOptionProductTax}
                  options={taxes}
                  onSelectOption={handleSelectProductTax}
                />
              </div>
              {/* Product Point */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Point")}:
                </span>
                <NumberInput
                  value={productPoint}
                  onChange={(e) => setProductPoint(e.target.value)}
                  placeholder={t("Point")}
                />
              </div>
            </div>

            <div className="flex items-start justify-start w-full gap-5 mt-2 sm:flex-col lg:flex-row">
              {/* Product Image */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Product Image")}:
                </span>
                <UploadInput
                  value={productImageName}
                  uploadFileRef={productImageRef}
                  placeholder={t("Product Image")}
                  handleFileChange={handleProductImageChange}
                  onChange={(e) => setProductImage(e.target.value)}
                  onClick={() => handleProductImageClick(productImageRef)}
                />
              </div>

              {/* Product Code */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Code")}:
                </span>
                <NumberInput
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder={t("Code")}
                />
              </div>

              {/* Product Priority */}
              <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Priority")}:
                </span>
                <NumberInput
                  value={productPriority}
                  onChange={(e) => setProductPriority(e.target.value)}
                  placeholder={t("Priority")}
                />
              </div>
            </div>

            <div className="flex items-start justify-start w-full gap-4 sm:flex-col lg:flex-row">
              {/* Product Status */}
              <div className="sm:w-full lg:w-[20%] flex items-center justify-start gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Status")}:
                </span>
                <Switch
                  handleClick={handleProductStatus}
                  checked={productStatus}
                />
              </div>
              {/* Product Product Recommended */}
              <div className="sm:w-full lg:w-[40%] flex items-center justify-start gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("ProductRecommended")}:
                </span>
                <Switch
                  handleClick={handleProductRecommended}
                  checked={productRecommended}
                />
              </div>
              {/* Product Recipe */}
              <div className="sm:w-full lg:w-[20%] flex items-center justify-start gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Recipe")}:
                </span>
                <Switch
                  handleClick={handleProductRecipe}
                  checked={productRecipe}
                />
              </div>
              {/* Product Time Status */}
              <div className="sm:w-full lg:w-[35%] flex items-center justify-start gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("ProductTimeStatus")}:
                </span>
                <Switch
                  handleClick={handleProductTimeStatus}
                  checked={productTimeStatus}
                />
              </div>
            </div>

            <div className="flex items-start justify-start w-full gap-4 sm:flex-col lg:flex-row">
              {productTimeStatus === 1 && (
                <>
                  <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("From")}:
                    </span>
                    <TimeInput
                      value={productStatusFrom ?? ""}
                      onChange={(e) => setProductStatusFrom(e.target.value)}
                    />
                  </div>

                  <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("To")}:
                    </span>
                    <TimeInput
                      value={productStatusTo ?? ""}
                      onChange={(e) => setProductStatusTo(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Only show exclude and extra sections if weight_status is not 1 */}
            {weightStatus !== 1 && (
              <>
                {/* Group and Extras Section */}
                <div className="w-full p-6 shadow-lg bg-gray-50 rounded-2xl">
                  {/* Group MultiSelect */}
                  <div className="mb-6 w-full sm:w-full lg:w-[30%] ">
                    <label className="block mb-2 text-lg font-semibold text-gray-700">
                      {t("Group Extra Names")}:
                    </label>
                    <MultiSelect
                      value={selectedGroups}
                      onChange={handleGroupChange}
                      options={groups}
                      optionLabel="name"
                      optionValue="id"
                      display="chip"
                      placeholder={selectedGroupState}
                      className="w-full transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      panelClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                    />
                  </div>

                  {/* Extras MultiSelects */}
                  {selectedGroups.length > 0 && (
                    <div className="space-y-6">
                      {selectedGroups.map((groupId) => {
                        const group = groups.find((g) => g.id === groupId);
                        return (
                          <div
                            key={groupId}
                            className="p-4 bg-white shadow-sm rounded-xl animate-fadeIn"
                          >
                            <label className="block mb-2 text-lg font-semibold text-gray-700">
                              {t("Extra Names")} for {group?.name || 'Group'}:
                            </label>
                            <MultiSelect
                              value={selectedExtras[groupId] || []}
                              onChange={(e) => handleExtraChange(groupId, e.value)}
                              options={getExtrasForGroup(groupId)}
                              optionLabel="name"
                              optionValue="id"
                              display="chip"
                              placeholder={t("Select Extras")}
                              className="w-full transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                              panelClassName="bg-white border border-gray-200 rounded-lg shadow-lg"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Exclude Names */}
                <div className="flex flex-col items-start justify-start w-full gap-4 pb-4 border-b-4 border-gray-300">
                  {productExclude.length !== 0 && (
                    <div className="flex items-center justify-start w-full gap-x-6">
                      {taps.map((tap, index) => (
                        <span
                          key={tap.id}
                          onClick={() => handleExcludeNamesTap(index)}
                          className={`${currentExcludeNamesTap === index
                            ? "text-mainColor border-b-4 border-mainColor"
                            : "text-thirdColor"
                            }  pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                        >
                          {tap.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="w-full">
                    {taps.map(
                      (tap, index) =>
                        currentExcludeNamesTap === index && (
                          <div
                            className="flex flex-col items-center justify-center w-full gap-4"
                            key={tap.id}
                          >
                            {(productExclude || []).map((ele, indexMap) => (
                              <div
                                className="flex items-center justify-start w-full gap-5"
                                key={`${tap.id}-${indexMap}`}
                              >
                                {/* Exclude Name Input */}
                                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                  <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("ExcludeName")} {tap.name}:
                                  </span>
                                  <TextInput
                                    value={
                                      ele.names.find(
                                        (name) => name.tranlation_name === tap.name
                                      )?.exclude_name
                                    }
                                    onChange={(e) => {
                                      const updatedValue = e.target.value;
                                      setProductExclude((prevProductExclude) =>
                                        prevProductExclude.map((item, idx) =>
                                          idx === indexMap
                                            ? {
                                              ...item,
                                              names: item.names.map((name) =>
                                                name.tranlation_name === tap.name
                                                  ? {
                                                    ...name,
                                                    exclude_name: updatedValue,
                                                  }
                                                  : name
                                              ),
                                            }
                                            : item
                                        )
                                      );
                                    }}
                                    placeholder={t("ExcludeName")}
                                  />
                                </div>

                                {/* Remove Button */}
                                {index === 0 && (
                                  <div className="flex items-end mt-10">
                                    <StaticButton
                                      text={t("Remove")}
                                      handleClick={() =>
                                        handleRemoveExclude(indexMap)
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                            {index === 0 && (
                              <div
                                className={`w-full flex items-center ${productExclude.length === 0
                                  ? "justify-center"
                                  : "justify-start"
                                  }`}
                              >
                                <ButtonAdd
                                  isWidth={true}
                                  Color="mainColor"
                                  Text={
                                    productExclude.length === 0
                                      ? t("AddExclude")
                                      : t("AddMoreExclude")
                                  }
                                  handleClick={handleAddExclude}
                                />
                              </div>
                            )}
                          </div>
                        )
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Product Variations - Always show regardless of weight status */}
            <div className="flex flex-col items-start justify-start w-full gap-4 pb-4 border-b-4 border-gray-300">
              {productVariations.length !== 0 && (
                <div className="flex items-center justify-start w-full gap-x-6">
                  {taps.map((tap, index) => (
                    <span
                      key={tap.id}
                      onClick={() => handleVariationTap(index)}
                      className={`${currentVariationTap === index
                        ? "text-mainColor border-b-4 border-mainColor"
                        : "text-thirdColor"
                        } pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                    >
                      {tap.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="w-full">
                {taps.map(
                  (tap, index) =>
                    currentVariationTap === index && (
                      <div
                        className="flex flex-col items-center justify-center w-full gap-4"
                        key={tap.id}
                      >
                        {(productVariations || []).map((ele, indexVariation) => (
                          <div
                            className="flex flex-wrap items-start justify-start w-full gap-5 p-3 border-4 shadow border-mainColor rounded- Pty-2xl sm:flex-col lg:flex-row"
                            key={`${tap.id}-${indexVariation}`}
                          >
                            {/* Variation Name */}
                            <div className="sm:w-full lg:w-[30%] flex sm:flex-col lg:flex-row items-start justify-start gap-5">
                              <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                  {t("VariationName")} {tap.name}:
                                </span>
                                <TextInput
                                  value={
                                    ele.names.find((name) => name.tranlation_name === tap.name)?.name
                                  }
                                  onChange={(e) =>
                                    updateVariationState(
                                      setProductVariations,
                                      indexVariation,
                                      "names",
                                      tap.name,
                                      e.target.value
                                    )
                                  }
                                  placeholder={t("VariationName")}
                                />
                              </div>
                            </div>
                            {index === 0 && (
                              <>
                                <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                                  <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Variation Type")}:
                                  </span>
                                  <DropDown
                                    ref={(el) => (variationTypeRef.current[indexVariation] = el)}
                                    handleOpen={() => handleOpenVariationType(indexVariation)}
                                    stateoption={ele.type || "Select Type"}
                                    openMenu={openVariationIndex === indexVariation}
                                    handleOpenOption={handleOpenOptionProductVariationType}
                                    options={[
                                      { name: t("single") },
                                      { name: t("multiple") },
                                    ]}
                                    onSelectOption={(option) =>
                                      handleSelectProductVariationType(option, indexVariation)
                                    }
                                  />
                                </div>

                                {ele.type === t("multiple") && (
                                  <>
                                    <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                                      <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Min")}:
                                      </span>
                                      <NumberInput
                                        value={ele.min}
                                        onChange={(e) => {
                                          const updatedValue = e.target.value;
                                          setProductVariations((prevProductVariations) =>
                                            prevProductVariations.map((item, idx) =>
                                              idx === indexVariation
                                                ? { ...item, min: updatedValue }
                                                : item
                                            )
                                          );
                                        }}
                                        placeholder={t("Min")}
                                      />
                                    </div>
                                    <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                                      <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Max")}:
                                      </span>
                                      <NumberInput
                                        value={ele.max}
                                        onChange={(e) => {
                                          const updatedValue = e.target.value;
                                          setProductVariations((prevProductVariations) =>
                                            prevProductVariations.map((item, idx) =>
                                              idx === indexVariation
                                                ? { ...item, max: updatedValue }
                                                : item
                                            )
                                          );
                                        }}
                                        placeholder={t("Max")}
                                      />
                                    </div>
                                  </>
                                )}

                                <div className="w-[32%] flex mt-10 items-center justify-center gap-x-3">
                                  <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Required")}:
                                  </span>
                                  <Switch
                                    handleClick={() => {
                                      setProductVariations((prevProductVariations) =>
                                        prevProductVariations.map((item, idx) =>
                                          idx === indexVariation
                                            ? {
                                              ...item,
                                              required: item.required === 1 ? 0 : 1,
                                            }
                                            : item
                                        )
                                      );
                                    }}
                                    checked={ele.required === 1}
                                  />
                                </div>
                                <div className="w-[32%] flex mt-10 items-center justify-center gap-x-3">
                                  <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Weight")}:
                                  </span>
                                  <Switch
                                    handleClick={() => {
                                      setProductVariations((prevProductVariations) =>
                                        prevProductVariations.map((item, idx) =>
                                          idx === indexVariation
                                            ? {
                                              ...item,
                                              weight: item.weight === 1 ? 0 : 1,
                                            }
                                            : item
                                        )
                                      );
                                    }}
                                    checked={ele.weight === 1}
                                  />
                                </div>
                                {ele.weight === 1 && (
                                  <div className="w-[32%] flex flex-col mt-4 items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor mb-1">{t("Weight Unit")}:</span>
                                    <select
                                      className="w-full px-4 py-3 border rounded-md outline-none border-mainColor bg-white"
                                      value={ele.weight_unit || ""}
                                      onChange={(e) => {
                                        const updatedValue = e.target.value;
                                        setProductVariations((prevProductVariations) =>
                                          prevProductVariations.map((item, idx) =>
                                            idx === indexVariation
                                              ? { ...item, weight_unit: updatedValue }
                                              : item
                                          )
                                        );
                                      }}
                                    >
                                      {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                <div className="w-full">
                                  <TitlePage text={t("Options Variation")} />
                                </div>
                              </>
                            )}

                            {index === 0 && (
                              <>
                                {/* Options Tabs */}
                                <div className="flex items-center justify-start w-full gap-x-6">
                                  {taps.map((tapOption, indexOptionTap) => (
                                    <span
                                      key={tapOption.id}
                                      onClick={() => handleVariationOptionTap(indexOptionTap)}
                                      className={`${currentVariationOptionTap === indexOptionTap
                                        ? "text-mainColor border-b-4 border-mainColor"
                                        : "text-thirdColor"
                                        } pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                                    >
                                      {tapOption.name}
                                    </span>
                                  ))}
                                </div>

                                {/* Render each variation's options */}
                                {taps.map(
                                  (tapOption, indexOptionTap) =>
                                    currentVariationOptionTap === indexOptionTap && (
                                      <div
                                        className="flex flex-col items-start justify-start w-full gap-4"
                                        key={tapOption.id}
                                      >
                                        <div className="flex flex-wrap items-start justify-start gap-5 sm:w-full">
                                          {ele.options.map((option, indexOption) => (
                                            <div
                                              className="flex flex-wrap items-start justify-start gap-5 p-5 pt-0 shadow-md sm:w-full rounded-xl"
                                              key={`${indexOption}-${tapOption.id}`}
                                            >
                                              {/* Option Name */}
                                              <div className="w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                                  {t("OptionName")} {tapOption.name}:
                                                </span>
                                                <TextInput
                                                  value={
                                                    option.names.find(
                                                      (nameObj) => nameObj.tranlation_name === tapOption.name
                                                    )?.name
                                                  }
                                                  onChange={(e) => {
                                                    const updatedValue = e.target.value;
                                                    setProductVariations((prevVariations) =>
                                                      prevVariations.map((variation, vIdx) =>
                                                        vIdx === indexVariation
                                                          ? {
                                                            ...variation,
                                                            options: variation.options.map(
                                                              (opt, oIdx) =>
                                                                oIdx === indexOption
                                                                  ? {
                                                                    ...opt,
                                                                    names: opt.names.map(
                                                                      (nameObj) =>
                                                                        nameObj.tranlation_name === tapOption.name
                                                                          ? {
                                                                            ...nameObj,
                                                                            name: updatedValue,
                                                                          }
                                                                          : nameObj
                                                                    ),
                                                                  }
                                                                  : opt
                                                            ),
                                                          }
                                                          : variation
                                                      )
                                                    );
                                                  }}
                                                  placeholder={t("OptionName")}
                                                />
                                              </div>
                                              {indexOptionTap === 0 && (
                                                <>
                                                  {/* Option Price */}
                                                  <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                                      {t("Price")}:
                                                    </span>
                                                    <NumberInput
                                                      value={option.price}
                                                      allowNegative={true}
                                                      onChange={(e) => {
                                                        const updatedValue = e.target.value;
                                                        setProductVariations((prevProductVariations) =>
                                                          prevProductVariations.map((item, idx) =>
                                                            idx === indexVariation
                                                              ? {
                                                                ...item,
                                                                options: item.options.map(
                                                                  (opt, oIdx) =>
                                                                    oIdx === indexOption
                                                                      ? {
                                                                        ...opt,
                                                                        price: updatedValue,
                                                                      }
                                                                      : opt
                                                                ),
                                                              }
                                                              : item
                                                          )
                                                        );
                                                      }}
                                                      placeholder={t("Price")}
                                                    />
                                                  </div>
                                                  {/* Option Points */}
                                                  <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                                      {t("Point")}:
                                                    </span>
                                                    <NumberInput
                                                      value={option.points}
                                                      onChange={(e) => {
                                                        const updatedValue = e.target.value;
                                                        setProductVariations((prevProductVariations) =>
                                                          prevProductVariations.map((item, idx) =>
                                                            idx === indexVariation
                                                              ? {
                                                                ...item,
                                                                options: item.options.map(
                                                                  (opt, oIdx) =>
                                                                    oIdx === indexOption
                                                                      ? {
                                                                        ...opt,
                                                                        points: updatedValue,
                                                                      }
                                                                      : opt
                                                                ),
                                                              }
                                                              : item
                                                          )
                                                        );
                                                      }}
                                                      placeholder={t("Point")}
                                                    />
                                                  </div>
                                                  {/* Option Status */}
                                                  <div className="w-[20%] flex items-center justify-start gap-x-3 lg:mt-3">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                                      {t("Status")}:
                                                    </span>
                                                    <Switch
                                                      handleClick={() =>
                                                        setProductVariations((prevProductVariations) =>
                                                          prevProductVariations.map((item, idx) =>
                                                            idx === indexVariation
                                                              ? {
                                                                ...item,
                                                                options: item.options.map(
                                                                  (opt, oIdx) =>
                                                                    oIdx === indexOption
                                                                      ? {
                                                                        ...opt,
                                                                        status: opt.status ? 0 : 1,
                                                                      }
                                                                      : opt
                                                                ),
                                                              }
                                                              : item
                                                          )
                                                        )
                                                      }
                                                      checked={option.status === 1}
                                                    />
                                                  </div>
                                                  {/* Only show group and extras for variation options if weight_status is not 1 */}
                                                  {weightStatus !== 1 && (
                                                    <div className="flex flex-col w-full gap-4 sm:gap-6">
                                                      {/* Group Selection */}
                                                      <div className="w-full sm:w-full lg:w-[30%] flex flex-col items-start gap-y-2">
                                                        <label className="text-lg font-semibold text-gray-800">
                                                          {t("Select Group")}:
                                                        </label>
                                                        <MultiSelect
                                                          value={selectedOptionGroups[`${indexVariation}-${indexOption}`] || []}
                                                          onChange={(e) => handleOptionGroupChange(indexVariation, indexOption, e.value)}
                                                          options={groups.map((group) => ({
                                                            name: group.name,
                                                            value: group.id,
                                                          }))}
                                                          optionLabel="name"
                                                          optionValue="value"
                                                          display="chip"
                                                          placeholder={t("Select Groups")}
                                                          className="w-full text-gray-700 transition-all duration-300 bg-white border border-gray-300 shadow-sm rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                                                          filter
                                                          filterPlaceholder={t("Search Groups")}
                                                          maxSelectedLabels={3}
                                                          aria-label={t("Select Groups")}
                                                        />
                                                      </div>

                                                      {/* Extras Selection for Each Group */}
                                                      {selectedOptionGroups[`${indexVariation}-${indexOption}`]?.length > 0 && (
                                                        <div className="items-start w-full p-4 shadow-sm gap-y-3 bg-gray-50 rounded-xl">
                                                          <label className="text-lg font-semibold text-gray-800">
                                                            {t("Select Extras")}:
                                                          </label>
                                                          <div className="w-full space-y-3">
                                                            {selectedOptionGroups[`${indexVariation}-${indexOption}`].map((groupId) => {
                                                              const group = groups.find((g) => g.id === groupId);
                                                              return (
                                                                <div
                                                                  key={groupId}
                                                                  className="w-full p-3 transition-shadow duration-200 bg-white rounded-lg shadow-sm hover:shadow-md"
                                                                >
                                                                  <label className="block mb-1 text-sm font-medium text-gray-600">
                                                                    {t("Extras for")} {group?.name || t("Group")}:
                                                                  </label>
                                                                  <MultiSelect
                                                                    value={selectedOptionExtras[`${indexVariation}-${indexOption}`]?.[groupId] || []}
                                                                    onChange={(e) => handleOptionExtrasChange(indexVariation, indexOption, groupId, e.value)}
                                                                    options={getExtrasForGroup(groupId)}
                                                                    optionLabel="name"
                                                                    optionValue="id"
                                                                    display="chip"
                                                                    placeholder={t("Select Extras")}
                                                                    className="w-full text-gray-700 transition-all duration-300 bg-white border border-gray-300 shadow-sm rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                                                                    filter
                                                                    filterPlaceholder={t("Search Extras")}
                                                                    maxSelectedLabels={5}
                                                                    aria-label={`${t("Select Extras")} for ${group?.name || t("Group")}`}
                                                                  />
                                                                </div>
                                                              );
                                                            })}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                  {/* Remove Option Button */}
                                                  {ele.options.length > 1 && (
                                                    <div className="sm:w-full lg:w-[20%] flex items-center justify-center lg:mt-8">
                                                      <StaticButton
                                                        text={t("Removeoption")}
                                                        handleClick={() =>
                                                          handleRemoveOption(indexVariation, indexOption)
                                                        }
                                                      />
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                        <div className="flex items-center justify-center sm:w-full">
                                          <ButtonAdd
                                            isWidth={true}
                                            Color="mainColor"
                                            Text={t("AddOption")}
                                            handleClick={() => handleAddOption(indexVariation)}
                                          />
                                        </div>
                                      </div>
                                    )
                                )}
                                <div className="flex items-center justify-end sm:w-full">
                                  <div className="sm:w-full lg:w-auto">
                                    <StaticButton
                                      text={t("RemoveVariation")}
                                      handleClick={() => handleRemoveVariation(indexVariation)}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {index === 0 && (
                          <div
                            className={`w-full flex items-center ${productVariations.length === 0 ? "justify-center" : "justify-start"
                              }`}
                          >
                            <ButtonAdd
                              isWidth={true}
                              Color="mainColor"
                              Text={
                                productVariations.length === 0
                                  ? t("Add Variation")
                                  : t("Add More Variation")
                              }
                              handleClick={handleAddVariation}
                            />
                          </div>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>
          </div>

          {/* Buttons*/}
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
                text={t("AddProduct")}
                rounded="rounded-full"
                handleClick={handleproductAdd}
              />
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default AddProductPage;