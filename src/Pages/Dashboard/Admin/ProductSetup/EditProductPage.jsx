import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
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
import { MultiSelect } from "primereact/multiselect";
import ButtonAdd from "../../../../Components/Buttons/AddButton";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";

const EditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { t, i18n } = useTranslation();
  const selectedLanguage = i18n.language;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  /* Get Data */
  const {
    refetch: refetchProductEdit,
    loading: loadingProductEdit,
    data: dataProductEdit,
  } = useGet({ url: `${apiUrl}/admin/product/item/${productId}` });
  const {
    refetch: refetchTranslation,
    loading: loadingTranslation,
    data: dataTranslation,
  } = useGet({ url: `${apiUrl}/admin/translation` });
  const {
    refetch: refetchCategory,
    loading: loadingCategory,
    data: dataCategory,
  } = useGet({ url: `${apiUrl}/admin/category?locale=${selectedLanguage}` });
  const {
    refetch: refetchProduct,
    loading: loadingProduct,
    data: dataProduct,
  } = useGet({ url: `${apiUrl}/admin/product?locale=${selectedLanguage}` });
  const { postData, loading: loadingPut, response } = usePost({
    url: `${apiUrl}/admin/product/update/${productId}`,
  });

  /* Refs */
  const variationTypeRef = useRef([]);
  const [openVariationIndex, setOpenVariationIndex] = useState(null);
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
  const [selectedExtras, setSelectedExtras] = useState({});
  const [selectedOptionGroups, setSelectedOptionGroups] = useState({});
  const [selectedOptionExtras, setSelectedOptionExtras] = useState({});

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
  const [productNames, setProductNames] = useState([]);
  const [descriptionNames, setDescriptionNames] = useState([]);
  const [productExclude, setProductExclude] = useState([]);
  const [productExtra, setProductExtra] = useState([]);
  const [productVariations, setProductVariations] = useState([]);
  const [selectedCategoryState, setSelectedCategoryState] = useState(t("Selected Category"));
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryState, setSelectedSubCategoryState] = useState(t("Selected Subcategory"));
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedDiscountState, setSelectedDiscountState] = useState(t("Selected Discount"));
  const [selectedDiscountId, setSelectedDiscountId] = useState("");
  const [selectedTaxState, setSelectedTaxState] = useState(t("Selected Tax"));
  const [selectedTaxId, setSelectedTaxId] = useState("");
  const [selectedAddonsState, setSelectedAddonsState] = useState(t("Selected Addons"));
  const [selectedAddonsId, setSelectedAddonsId] = useState([]);
  const [selectedItemTypeState, setSelectedItemTypeState] = useState(t("Selected Item Type"));
  const [selectedItemTypeName, setSelectedItemTypeName] = useState("");
  const [selectedStockTypeState, setSelectedStockTypeState] = useState(t("Selected Stock Type"));
  const [selectedStockTypeName, setSelectedStockTypeName] = useState("");
  const [selectedAppTypeState, setSelectedAppTypeState] = useState(t("Selected App Type"));
  const [selectedAppTypeName, setSelectedAppTypeName] = useState("");
  const [productStockNumber, setProductStockNumber] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productPoint, setProductPoint] = useState("");
  const [productPriority, setProductPriority] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productStatusFrom, setProductStatusFrom] = useState("");
  const [productStatusTo, setProductStatusTo] = useState("");
  const [productStatus, setProductStatus] = useState(0);
  const [productRecommended, setProductRecommended] = useState(0);
  const [productTimeStatus, setProductTimeStatus] = useState(0);
  const [productRecipe, setProductRecipe] = useState(0);
  const [productImage, setProductImage] = useState(null);
  const [productImageName, setProductImageName] = useState(t("Choose Photo"));

  /* Dropdown Status */
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
    refetchProductEdit();
    refetchTranslation();
    refetchCategory();
    refetchProduct();
  }, [i18n.language]); // Refetch when language changes

  /* Set Translation, Category, and Product Data */
  useEffect(() => {
    if (dataTranslation) {
      setTaps(dataTranslation?.translation || []);
    }
    if (dataCategory) {
      setCategories([{ id: "", name: t("Select Category") }, ...dataCategory.parent_categories] || []);
      setSubCategories([{ id: "", name: t("Select Subcategory") }, ...dataCategory?.sub_categories] || []);
      setAddons(dataCategory?.addons || []);
    }
    if (dataProduct) {
      setDiscounts([{ id: "", name: t("Select Discount") }, ...dataProduct?.discounts] || []);
      setTaxes([{ id: "", name: t("Select Tax") }, ...dataProduct?.taxes] || []);
      setGroups(dataProduct?.group || []);
      // Get units from product data if available
      if (dataProduct.units) {
        setUnits([{ id: "", name: t("Select Unit") }, ...dataProduct.units]);
      }
    }
  }, [dataTranslation, dataCategory, dataProduct, t]);

  // Handle weight status change
  const handleWeightStatusChange = () => {
    setWeightStatus(prev => prev === 1 ? 0 : 1);
  };

  // Handle unit selection
  const handleSelectUnit = (option) => {
    setSelectedUnit(option.id);
    setSelectedUnitState(option.name);
  };

  const handleOpenUnit = () => {
    handleCloseAllDropdowns();
    setIsOPenProductUnit(!isOPenProductUnit);
  };

  const handleOpenOptionProductUnit = () => setIsOPenProductUnit(false);

  /* Populate Form with Fetched Product Data */
  useEffect(() => {
    if (!dataProductEdit) return;
    const productEdit = dataProductEdit.product;
    try {
      // ——————————————————————————————
      // 1) BASIC FIELDS
      // ——————————————————————————————
      setProductNames(productEdit.product_names || []);
      setDescriptionNames(
        (productEdit.product_descriptions || []).map(desc => ({
          description_name: desc.product_description,
          tranlation_id: desc.tranlation_id,
          tranlation_name: desc.tranlation_name,
        }))
      );
      setProductExclude(productEdit.exclude || []);

      // ——————————————————————————————
      // 2) WEIGHT FIELDS
      // ——————————————————————————————
      setWeightStatus(productEdit.weight_status || 0);
      setWeightPoint(productEdit.weight_point || "");
      setSelectedUnit(productEdit.unit_id || "");
      setSelectedUnitState(productEdit.unit?.name || t("Selected Unit"));

      // ——————————————————————————————
      // 3) TOP-LEVEL EXTRAS & GROUP MERGE
      // ——————————————————————————————
      const topExtras = productEdit.extra || [];
      setProductExtra(topExtras);
      const topGroupIds = [...new Set(topExtras.map(e => e.group_id))];
      setSelectedGroups(topGroupIds);

      // ——————————————————————————————
      // 4) VARIATIONS & PER-OPTION GROUPS/EXTRAS
      // ——————————————————————————————
      const variationGroups = {};
      const variationExtras = {};
      const formattedVariations = (productEdit.variation || [])
        .filter(v => v != null)
        .map((v, vi) => ({
          id: v.id,
          type: v.type || "single",
          required: v.required || 0,
          weight: v.weight || 0,
          weight_unit: v.weight_unit || "",
          min: v.min ?? "",
          max: v.max ?? "",
          names: (v.names || []).map(n => ({
            name: n.name,
            tranlation_id: n.tranlation_id,
            tranlation_name: n.tranlation_name,
          })),
          options: (v.options || []).map((opt, oi) => {
            const optGroupIds = [...new Set((opt.extra || []).map(e => e.group_id))];
            variationGroups[`${vi}-${oi}`] = optGroupIds;
            variationExtras[`${vi}-${oi}`] = (opt.extra || []).reduce((acc, e) => {
              acc[e.group_id] = acc[e.group_id] || [];
              acc[e.group_id].push(e.id);
              return acc;
            }, {});
            return {
              id: opt.id,
              names: (opt.names || []).map(n => ({
                name: n.name,
                tranlation_id: n.tranlation_id,
                tranlation_name: n.tranlation_name,
              })),
              price: opt.price ?? "",
              points: opt.points ?? "",
              status: opt.status ?? 0,
              extra: (opt.extra || []).map(e => ({
                id: e.id,
                name: e.name,
                group_id: e.group_id,
              })),
            };
          }),
        }));
      setProductVariations(formattedVariations);
      setSelectedOptionGroups(variationGroups);
      setSelectedOptionExtras(variationExtras);

      // ——————————————————————————————
      // 5) REMAINING FIELDS
      // ——————————————————————————————
      setSelectedAddonsId(productEdit.addons || []);
      setSelectedCategoryId(productEdit.category?.id || "");
      setSelectedCategoryState(productEdit.category?.name || t("Selected Category"));
      const filtered = subCategories.filter(s => s.category_id === productEdit.category?.id);
      setFilterSubCategories([{ id: "", name: t("Select Subcategory") }, ...filtered]);
      setSelectedSubCategoryId(productEdit.sub_category?.id || "");
      setSelectedSubCategoryState(productEdit.sub_category?.name || t("Selected Subcategory"));
      setSelectedItemTypeName(productEdit.item_type || "");
      setSelectedItemTypeState(productEdit.item_type || t("Selected Item Type"));
      setSelectedStockTypeName(productEdit.stock_type || "");
      setSelectedStockTypeState(productEdit.stock_type || t("Selected Stock Type"));
      setSelectedAppTypeName(productEdit.app_type || "");
      setSelectedAppTypeState(productEdit.app_type || t("Selected App Type"));
      setProductStockNumber(productEdit.number ?? "");
      setProductPrice(productEdit.price ?? 0);
      setProductPoint(productEdit.points ?? 0);
      setProductPriority(productEdit.order ?? "");
      setProductCode(productEdit.product_code ?? "")
      setSelectedDiscountId(productEdit.discount?.id || "");
      setSelectedDiscountState(productEdit.discount?.name || t("Selected Discount"));
      setSelectedTaxId(productEdit.tax?.id || "");
      setSelectedTaxState(productEdit.tax?.name || t("Selected Tax"));
      setProductStatus(productEdit.status ?? 0);
      setProductRecommended(productEdit.recommended ?? 0);
      setProductTimeStatus(productEdit.product_time_status ?? 0);
      setProductRecipe(productEdit.recipe ?? 0);
      setProductStatusFrom(productEdit.from || "");
      setProductStatusTo(productEdit.to || "");
      setProductImage(productEdit.image_link || null);
      setProductImageName(productEdit.image_link || t("Choose Photo"));
    } catch (error) {
      console.error("Error in useEffect:", error, "Product:", productEdit);
    }
  }, [dataProductEdit, subCategories, taps]);

  /* Pre-select Groups and Extras */
  useEffect(() => {
    if (!dataProductEdit?.product || !groups.length) return;

    const product = dataProductEdit.product;
    const allGroupIds = groups.map((group) => group.id);

    // Top-level extras
    const extrasByGroup = {};
    allGroupIds.forEach((groupId) => {
      const group = groups.find((g) => g.id === groupId);
      const productExtras = product.extra?.filter(
        (extra) => extra.group_id === groupId && extra.variation_id === null
      ) || [];
      extrasByGroup[groupId] = [
        ...new Set(
          productExtras
            .map((extra) => {
              const matchingExtra = group?.extra?.find(
                (gExtra) => gExtra.name === extra.name && gExtra.group_id === extra.group_id
              );
              if (!matchingExtra) {
                console.warn(
                  `No matching group extra found for product extra: ${extra.name} (group_id: ${extra.group_id})`
                );
              }
              return matchingExtra?.id;
            })
            .filter((id) => id !== undefined)
        ),
      ];
    });
    setSelectedExtras(extrasByGroup);

    // Variation-level extras
    const optionGroups = {};
    const optionExtras = {};
    product.variations?.forEach((varn, varIdx) => {
      varn.options?.forEach((opt, optIdx) => {
        const key = `${varIdx}-${optIdx}`;
        // Initialize with all group IDs if no extras are present, to allow selection
        const optGroupIds = opt.extra?.length
          ? [...new Set((opt.extra || []).map((e) => e.group_id))]
          : allGroupIds;
        optionGroups[key] = optGroupIds;
        optionExtras[key] = {};
        optGroupIds.forEach((groupId) => {
          const group = groups.find((g) => g.id === groupId);
          const optionExtrasForGroup = opt.extra?.filter(
            (extra) => extra.group_id === groupId && extra.variation_id === varn.id
          ) || [];
          optionExtras[key][groupId] = [
            ...new Set(
              optionExtrasForGroup
                .map((extra) => {
                  const matchingExtra = group?.extra?.find(
                    (gExtra) => gExtra.name === extra.name && gExtra.group_id === extra.group_id
                  );
                  if (!matchingExtra) {
                    console.warn(
                      `No matching group extra found for variation extra: ${extra.name} (group_id: ${extra.group_id}, variation_id: ${extra.variation_id})`
                    );
                  }
                  return matchingExtra?.id;
                })
                .filter((id) => id !== undefined)
            ),
          ];
        });
      });
    });
    setSelectedOptionGroups(optionGroups);
    setSelectedOptionExtras(optionExtras);
  }, [dataProductEdit, groups]);

  /* Handle Form Submission */
  const handleProductUpdate = (e) => {
    e.preventDefault();

    if (!selectedCategoryId) {
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

    // Debug: Log only extra-related form data
    for (const [key, value] of formData.entries()) {
      if (key.includes("extra")) {
      }
    }
    postData(formData, t("Product Updated Successfully"));
  };

  /* Handle Reset to Original Data */
  const handleReset = () => {
    refetchProductEdit();
  };

  /* Handle Navigation on Success */
  useEffect(() => {
    if (response && response.status === 200) {
      // Instead of navigate(-1), navigate to product page with state
      navigate("/dashboard/setup_product/product", {
        state: {
          ...location.state,
          scrollToProductId: parseInt(productId)
        }
      });
    }
  }, [response, navigate, location.state, productId]);

  /* Handlers */
  const handleAddExclude = () => {
    const newExclude = {
      names: taps.map((tap) => ({
        exclude_name: "",
        tranlation_id: tap.id,
        tranlation_name: tap.name,
      })),
    };
    setProductExclude((prev) => [...prev, newExclude]);
  };

  const handleRemoveExclude = (index) => {
    setProductExclude((prev) => prev.filter((_, idx) => idx !== index));
  };

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
          extra: [],
          points: "",
          price: "",
          status: 0,
        },
      ],
    };
    setProductVariations((prev) => [...prev, newVariation]);
    // Initialize new variation's option groups and extras
    setSelectedOptionGroups((prev) => ({
      ...prev,
      [`${productVariations.length}-0`]: [],
    }));
    setSelectedOptionExtras((prev) => ({
      ...prev,
      [`${productVariations.length}-0`]: {},
    }));
  };

  const handleRemoveVariation = (index) => {
    setProductVariations((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedOptionGroups((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (key.startsWith(`${index}-`)) {
          delete updated[key];
        }
      });
      return updated;
    });
    setSelectedOptionExtras((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (key.startsWith(`${index}-`)) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  const updateVariationState = (setProductVariations, variationIndex, field, tapName, updatedValue) => {
    setProductVariations((prev) =>
      prev.map((item, idx) =>
        idx === variationIndex
          ? {
            ...item,
            [field]: item[field].map((subField) =>
              subField.tranlation_name === tapName ? { ...subField, name: updatedValue } : subField
            ),
          }
          : item
      )
    );
  };

  const handleAddOption = (variationIndex) => {
    const newOption = {
      names: taps.map((tap) => ({
        name: "",
        tranlation_id: tap.id,
        tranlation_name: tap.name,
      })),
      extra: [],
      price: "",
      points: "",
      status: 0,
    };
    setProductVariations((prev) =>
      prev.map((variation, idx) =>
        idx === variationIndex ? { ...variation, options: [...variation.options, newOption] } : variation
      )
    );
    setSelectedOptionGroups((prev) => ({
      ...prev,
      [`${variationIndex}-${productVariations[variationIndex].options.length}`]: [],
    }));
    setSelectedOptionExtras((prev) => ({
      ...prev,
      [`${variationIndex}-${productVariations[variationIndex].options.length}`]: {},
    }));
  };

  const handleRemoveOption = (variationIndex, optionIndex) => {
    setProductVariations((prev) =>
      prev.map((variation, vIdx) =>
        vIdx === variationIndex
          ? { ...variation, options: variation.options.filter((_, oIdx) => oIdx !== optionIndex) }
          : variation
      )
    );
    setSelectedOptionGroups((prev) => {
      const updated = { ...prev };
      delete updated[`${variationIndex}-${optionIndex}`];
      return updated;
    });
    setSelectedOptionExtras((prev) => {
      const updated = { ...prev };
      delete updated[`${variationIndex}-${optionIndex}`];
      return updated;
    });
  };

  const handleOpenVariationType = (index) => {
    setOpenVariationIndex((prev) => (prev === index ? null : index));
  };

  const handleOpenOptionProductVariationType = () => {
    setOpenVariationIndex(null);
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
    setProductVariations((prev) =>
      prev.map((ele, index) =>
        index === variationIndex ? { ...ele, type: option.name, min: "", max: "" } : ele
      )
    );
  };

  const handleSelectProductCategory = (option) => {
    setSelectedCategoryId(option.id);
    setSelectedCategoryState(option.name);
    const filterSup = subCategories.filter((sup) => sup.category_id === option.id);
    setFilterSubCategories([{ id: "", name: t("Select Subcategory") }, ...filterSup]);
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
    setProductStatus((prev) => (prev === 0 ? 1 : 0));
  };

  const handleProductRecommended = () => {
    setProductRecommended((prev) => (prev === 0 ? 1 : 0));
  };

  const handleProductTimeStatus = () => {
    setProductTimeStatus((prev) => (prev === 0 ? 1 : 0));
    if (productTimeStatus === 1) {
      setProductStatusFrom("");
      setProductStatusTo("");
    }
  };

  const handleProductRecipe = () => {
    const currentState = productRecipe;
    {
      currentState === 0 ? setProductRecipe(1) : setProductRecipe(0);
    }
  };

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

  const handleProductNamesTap = (index) => {
    setCurrentProductNamesTap(index);
  };

  const handleExcludeNamesTap = (index) => {
    setCurrentExcludeNamesTap(index);
  };

  const handleVariationTap = (index) => {
    setCurrentVariationTap(index);
  };

  const handleVariationOptionTap = (index) => {
    setCurrentVariationOptionTap(index);
  };

  const handleGroupChange = (e) => {
    const selected = e.value;
    setSelectedGroups(selected);
    const updatedExtras = {};
    selected.forEach((groupId) => {
      updatedExtras[groupId] = selectedExtras[groupId] || [];
    });
    setSelectedExtras(updatedExtras);
  };

  const handleExtraChange = (groupId, selectedExtraIds) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [groupId]: [...new Set(selectedExtraIds)],
    }));
  };

  const getExtrasForGroup = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      console.warn(`Group with ID ${groupId} not found`);
      return [];
    }
    return group.extra || [];
  };

  const handleOptionGroupChange = (variationIndex, optionIndex, selectedGroupIds) => {
    const key = `${variationIndex}-${optionIndex}`;
    setSelectedOptionGroups((prev) => ({
      ...prev,
      [key]: selectedGroupIds,
    }));
    const updatedExtras = selectedOptionExtras[key] || {};
    selectedGroupIds.forEach((groupId) => {
      if (!updatedExtras[groupId]) {
        updatedExtras[groupId] = [];
      }
    });
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

  const handleOptionExtrasChange = (variationIndex, optionIndex, groupId, selectedExtraIds) => {
    const key = `${variationIndex}-${optionIndex}`;
    setSelectedOptionExtras((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [groupId]: [...new Set(selectedExtraIds)],
      },
    }));
  };

  /* Close Dropdowns on Click Outside */
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
  }, []);

  return (
    <>
      {loadingProductEdit || loadingTranslation || loadingCategory || loadingProduct || loadingPut ? (
        <div className="flex items-center justify-center w-full">
          <LoaderLogin />
        </div>
      ) : (
        <form
          onSubmit={handleProductUpdate}
          className="flex flex-col items-center justify-center w-full gap-5 pb-24 mt-5"
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
                      } pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
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
                        <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                          <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("ProductName")} {tap.name}:
                          </span>
                          <TextInput
                            value={productNames[index]?.product_name || ""}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              setProductNames((prev) => {
                                const updated = [...prev];
                                updated[index] = {
                                  ...updated[index],
                                  tranlation_id: tap.id,
                                  product_name: inputValue,
                                  tranlation_name: tap.name,
                                };
                                return updated;
                              });
                            }}
                            placeholder={t("Product Name")}
                          />
                        </div>
                        <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                          <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Product Description")} {tap.name}:
                          </span>
                          <TextInput
                            value={descriptionNames[index]?.description_name || ""}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              setDescriptionNames((prev) => {
                                const updated = [...prev];
                                updated[index] = {
                                  ...updated[index],
                                  tranlation_id: tap.id,
                                  description_name: inputValue,
                                  tranlation_name: tap.name,
                                };
                                return updated;
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
                <div className="w-full p-6 bg-gray-50 rounded-2xl shadow-lg">
                  <div className="mb-6 w-full sm:w-full lg:w-[30%]">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      {t("Group Extra Names")}:
                    </label>
                    <MultiSelect
                      value={selectedGroups}
                      onChange={handleGroupChange}
                      options={groups.map((group) => ({
                        label: group.name || t("Unnamed Group"),
                        value: group.id,
                      }))}
                      optionLabel="label"
                      optionValue="value"
                      display="chip"
                      placeholder={t("Select Groups")}
                      className="w-full bg-white border border-gray-300 rounded-lg shadow-sm"
                    />
                  </div>
                  {selectedGroups.length > 0 && (
                    <div className="space-y-6">
                      {selectedGroups.map((groupId) => {
                        const group = groups.find((g) => g.id === groupId);
                        if (!group || !group.extra) return null;
                        const uniqueExtras = [
                          ...new Map(group.extra.map((extra) => [extra.id, extra])).values(),
                        ];
                        return (
                          <div key={group.id} className="p-4 bg-white rounded-xl shadow-sm">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                              {t("Extra Names")} {t("for")} {group.name || t("Unnamed Group")}:
                            </label>
                            <MultiSelect
                              value={selectedExtras[groupId] || []}
                              onChange={(e) => handleExtraChange(groupId, e.value)}
                              options={uniqueExtras.map((extra) => ({
                                label: extra.name || t("Unnamed Extra"),
                                value: extra.id,
                              }))}
                              optionLabel="label"
                              optionValue="value"
                              display="chip"
                              placeholder={t("Select Extras")}
                              className="w-full bg-white border border-gray-300 rounded-lg shadow-sm"
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
                        currentExcludeNamesTap === index && (
                          <div className="flex flex-col items-center justify-center w-full gap-4" key={tap.id}>
                            {(productExclude || []).map((ele, indexMap) => (
                              <div
                                className="flex items-center justify-start w-full gap-5"
                                key={`${tap.id}-${indexMap}`}
                              >
                                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                  <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("ExcludeName")} {tap.name}:
                                  </span>
                                  <TextInput
                                    value={ele.names.find((name) => name.tranlation_name === tap.name)?.exclude_name || ""}
                                    onChange={(e) => {
                                      const updatedValue = e.target.value;
                                      setProductExclude((prev) =>
                                        prev.map((item, idx) =>
                                          idx === indexMap
                                            ? {
                                              ...item,
                                              names: item.names.map((name) =>
                                                name.tranlation_name === tap.name
                                                  ? { ...name, exclude_name: updatedValue }
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
                                {index === 0 && (
                                  <div className="flex items-end mt-10">
                                    <StaticButton
                                      text={t("Remove")}
                                      handleClick={() => handleRemoveExclude(indexMap)}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                            {index === 0 && (
                              <div
                                className={`w-full flex items-center ${productExclude.length === 0 ? "justify-center" : "justify-start"}`}
                              >
                                <ButtonAdd
                                  isWidth={true}
                                  Color="mainColor"
                                  Text={productExclude.length === 0 ? t("AddExclude") : t("AddMoreExclude")}
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
                      <div className="flex flex-col items-center justify-center w-full gap-4" key={tap.id}>
                        {(productVariations || []).map((ele, indexVariation) => (
                          <div
                            className="flex flex-wrap items-start justify-start w-full gap-5 p-3 border-4 shadow border-mainColor rounded-xl sm:flex-col lg:flex-row"
                            key={`${tap.id}-${indexVariation}`}
                          >
                            <div className="sm:w-full lg:w-[30%] flex sm:flex-col lg:flex-row items-start justify-start gap-5">
                              <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                  {t("VariationName")} {tap.name}:
                                </span>
                                <TextInput
                                  value={ele.names.find((name) => name.tranlation_name === tap.name)?.name || ""}
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
                                    options={[{ name: t("single") }, { name: t("multiple") }]}
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
                                          setProductVariations((prev) =>
                                            prev.map((item, idx) =>
                                              idx === indexVariation ? { ...item, min: updatedValue } : item
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
                                          setProductVariations((prev) =>
                                            prev.map((item, idx) =>
                                              idx === indexVariation ? { ...item, max: updatedValue } : item
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
                                      setProductVariations((prev) =>
                                        prev.map((item, idx) =>
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
                                      setProductVariations((prev) =>
                                        prev.map((item, idx) =>
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
                                        setProductVariations((prev) =>
                                          prev.map((item, idx) =>
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
                                              <div className="w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                                  {t("OptionName")} {tapOption.name}:
                                                </span>
                                                <TextInput
                                                  value={
                                                    option.names.find(
                                                      (nameObj) => nameObj.tranlation_name === tapOption.name
                                                    )?.name || ""
                                                  }
                                                  onChange={(e) => {
                                                    const updatedValue = e.target.value;
                                                    setProductVariations((prev) =>
                                                      prev.map((variation, vIdx) =>
                                                        vIdx === indexVariation
                                                          ? {
                                                            ...variation,
                                                            options: variation.options.map((opt, oIdx) =>
                                                              oIdx === indexOption
                                                                ? {
                                                                  ...opt,
                                                                  names: opt.names.map((nameObj) =>
                                                                    nameObj.tranlation_name === tapOption.name
                                                                      ? { ...nameObj, name: updatedValue }
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
                                                  <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                                      {t("Price")}:
                                                    </span>
                                                    <NumberInput
                                                      value={option.price}
                                                      allowNegative={true}
                                                      onChange={(e) => {
                                                        const updatedValue = e.target.value;
                                                        setProductVariations((prev) =>
                                                          prev.map((item, idx) =>
                                                            idx === indexVariation
                                                              ? {
                                                                ...item,
                                                                options: item.options.map((opt, oIdx) =>
                                                                  oIdx === indexOption
                                                                    ? { ...opt, price: updatedValue }
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
                                                  <div className="sm:w-full lg:w-[33%] flex flex-col items-start justify-center gap-y-1">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                                      {t("Point")}:
                                                    </span>
                                                    <NumberInput
                                                      value={option.points}
                                                      onChange={(e) => {
                                                        const updatedValue = e.target.value;
                                                        setProductVariations((prev) =>
                                                          prev.map((item, idx) =>
                                                            idx === indexVariation
                                                              ? {
                                                                ...item,
                                                                options: item.options.map((opt, oIdx) =>
                                                                  oIdx === indexOption
                                                                    ? { ...opt, points: updatedValue }
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
                                                  <div className="w-[20%] flex items-center justify-start gap-x-3 lg:mt-3">
                                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                                      {t("Status")}:
                                                    </span>
                                                    <Switch
                                                      handleClick={() =>
                                                        setProductVariations((prev) =>
                                                          prev.map((item, idx) =>
                                                            idx === indexVariation
                                                              ? {
                                                                ...item,
                                                                options: item.options.map((opt, oIdx) =>
                                                                  oIdx === indexOption
                                                                    ? { ...opt, status: opt.status ? 0 : 1 }
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
                                                    <div className="w-full flex flex-col gap-4 sm:gap-6">
                                                      <div className="w-full sm:w-full lg:w-[30%] flex flex-col items-start gap-y-2">
                                                        <label className="text-lg font-semibold text-gray-800">
                                                          {t("Select Group")}:
                                                        </label>
                                                        <MultiSelect
                                                          value={selectedOptionGroups[`${indexVariation}-${indexOption}`] || []}
                                                          onChange={(e) =>
                                                            handleOptionGroupChange(indexVariation, indexOption, e.value)
                                                          }
                                                          options={groups.map((group) => ({
                                                            label: group.name || t("Unnamed Group"),
                                                            value: group.id,
                                                          }))}
                                                          optionLabel="label"
                                                          optionValue="value"
                                                          display="chip"
                                                          placeholder={t("Select Groups")}
                                                          className="w-full bg-white border border-gray-300 rounded-xl shadow-sm"
                                                          filter
                                                          filterPlaceholder={t("Search Groups")}
                                                          maxSelectedLabels={3}
                                                        />
                                                      </div>
                                                      {selectedOptionGroups[`${indexVariation}-${indexOption}`]?.length > 0 && (
                                                        <div className="w-full items-start gap-y-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                                                          <label className="text-lg font-semibold text-gray-800">
                                                            {t("Select Extras")}:
                                                          </label>
                                                          <div className="w-full space-y-3">
                                                            {selectedOptionGroups[`${indexVariation}-${indexOption}`].map(
                                                              (groupId) => {
                                                                const group = groups.find((g) => g.id === groupId);
                                                                return (
                                                                  <div
                                                                    key={groupId}
                                                                    className="w-full p-3 bg-white rounded-lg shadow-sm"
                                                                  >
                                                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                                                      {t("Extras for")} {group?.name || t("Unnamed Group")}:
                                                                    </label>
                                                                    <MultiSelect
                                                                      value={
                                                                        selectedOptionExtras[`${indexVariation}-${indexOption}`]?.[
                                                                        groupId
                                                                        ] || []
                                                                      }
                                                                      onChange={(e) =>
                                                                        handleOptionExtrasChange(
                                                                          indexVariation,
                                                                          indexOption,
                                                                          groupId,
                                                                          e.value
                                                                        )
                                                                      }
                                                                      options={getExtrasForGroup(groupId).map((extra) => ({
                                                                        label: extra.name || t("Unnamed Extra"),
                                                                        value: extra.id,
                                                                      }))}
                                                                      optionLabel="label"
                                                                      optionValue="value"
                                                                      display="chip"
                                                                      placeholder={t("Select Extras")}
                                                                      className="w-full bg-white border border-gray-300 rounded-xl shadow-sm"
                                                                      filter
                                                                      filterPlaceholder={t("Search Extras")}
                                                                      maxSelectedLabels={5}
                                                                    />
                                                                  </div>
                                                                );
                                                              }
                                                            )}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                  {ele.options.length > 1 && (
                                                    <div className="sm:w-full lg:w-[20%] flex items-center justify-center lg:mt-8">
                                                      <StaticButton
                                                        text={t("Removeoption")}
                                                        handleClick={() => handleRemoveOption(indexVariation, indexOption)}
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
                            className={`w-full flex items-center ${productVariations.length === 0 ? "justify-center" : "justify-start"}`}
                          >
                            <ButtonAdd
                              isWidth={true}
                              Color="mainColor"
                              Text={productVariations.length === 0 ? t("Add Variation") : t("Add More Variation")}
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
                text={t("UpdateProduct")}
                rounded="rounded-full"
                handleClick={handleProductUpdate}
              />
            </div>
          </div>
        </form >
      )}
    </>
  );
};

export default EditProductPage;