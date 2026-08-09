import React, { useEffect, useRef, useState } from "react";
import {
  DropDown,
  DateInput,
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

const AddCouponPage = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchCoupon,
    loading: loadingCoupon,
    data: dataCoupon,
  } = useGet({
    url: `${apiUrl}/admin/coupon`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/coupon/add`,
  });
  const { t, i18n } = useTranslation();

  const auth = useAuth();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [usageNumber, setUsageNumber] = useState("");
  const [userUsageNumber, setUserUsageNumber] = useState("");

  const [maxDiscountStatus, setMaxDiscountStatus] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState("");

  const [activeCoupon, setActiveCoupon] = useState(0);

  /* Coupon Type */
  const [couponType] = useState([{ name: "First Order" }, { name: "Normal" }]);
  const [selectedCouponType, setSelectedCouponType] =
    useState(t("Select Coupon Type"));
  const [couponTypeName, setCouponTypeName] = useState("");
  const [isOpenCouponType, setIsOpenCouponType] = useState(false);
  const dropDownCouponType = useRef();

  /* Coupon Value Type */
  const [valueType] = useState([{ name: "Percentage" }, { name: "Value" }]);
  const [selectedValueType, setSelectedValueType] =
    useState(t("Select Value Type"));
  const [valueTypeName, setValueTypeName] = useState("");
  const [isOpenValueType, setIsOpenValueType] = useState(false);
  const dropDownValueType = useRef();

  /* Coupon Product Options */
  const [productOptions] = useState([{ name: "All" }, { name: "Selected" }]);
  const [selectedProductOptions, setSelectedProductOptions] = useState(
    "Select Products Options"
  ); // Currently selected state
  const [productOptionsName, setProductOptionsName] = useState(""); // Type name value
  const [isOpenProductOptions, setIsOpenProductOptions] = useState(false); // Dropdown open/close state
  const dropDownProductOptionsRef = useRef(); // Ref for dropdown

  /* Coupon Product */
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [stateProduct, setStateProduct] = useState(t("Select Product"));
  const [productId, setProductId] = useState("");
  const [isOpenProduct, setIsOpenProduct] = useState(false);
  const dropDownProductRef = useRef(); // Ref for dropdown

  /* Coupon Usage Type */
  const [usageType] = useState([{ name: "Fixed" }, { name: "UnLimited" }]);
  const [selectedUsageType, setSelectedUsageType] =
    useState(t("Select Usage Type"));
  const [usageTypeName, setUsageTypeName] = useState("");
  const [isOpenUsageType, setIsOpenUsageType] = useState(false);
  const dropDownUsageType = useRef();

  /* Coupon User Usage Type*/
  const [userUsageType] = useState([{ name: "Fixed" }, { name: "UnLimited" }]);
  const [selectedUserUsageType, setSelectedUserUsageType] = useState(
    t("Select User Usage Type")
  );
  const [userUsageTypeName, setUserUsageTypeName] = useState("");
  const [isOpenUserUsageType, setIsOpenUserUsageType] = useState(false);
  const dropDownUserUsageType = useRef();

  useEffect(() => {
    refetchCoupon();
  }, [refetchCoupon]);

  useEffect(() => {
    if (dataCoupon) {
      setProducts(dataCoupon.products);
    }
  }, [dataCoupon]);

  /* Coupon Type */
  const handleOpenCouponType = () => {
    setIsOpenCouponType(!isOpenCouponType);
    setIsOpenValueType(false);
    setIsOpenProductOptions(false);
    setIsOpenProduct(false);
    setIsOpenUsageType(false);
    setIsOpenUserUsageType(false);
  };

  const handleOpenOptionCouponType = () => setIsOpenCouponType(false);

  const handleSelectCouponType = (option) => {
    setCouponTypeName(option.name);
    setSelectedCouponType(option.name);
  };

  /* Coupon Value Type */
  const handleOpenValueType = () => {
    setIsOpenCouponType(false);
    setIsOpenValueType(!isOpenValueType);
    setIsOpenProductOptions(false);
    setIsOpenProduct(false);
    setIsOpenUsageType(false);
    setIsOpenUserUsageType(false);
  };

  const handleOpenOptionValueType = () => setIsOpenValueType(false);

  const handleSelectValueType = (option) => {
    setValueTypeName(option.name);
    setSelectedValueType(option.name);
  };

  /* Coupon Product Options */
  const handleOpenProductOptions = () => {
    setIsOpenCouponType(false);
    setIsOpenValueType(false);
    setIsOpenProductOptions(!isOpenProductOptions);
    setIsOpenProduct(false);
    setIsOpenUsageType(false);
    setIsOpenUserUsageType(false);
  };

  const handleOpenOptionProductOptions = () => setIsOpenProductOptions(false);

  const handleSelectProductOptions = (option) => {
    setProductOptionsName(option.name);
    setSelectedProductOptions(option.name);
  };

  /* Coupon Product */
  const handleOpenProduct = () => {
    setIsOpenCouponType(false);
    setIsOpenValueType(false);
    setIsOpenProductOptions(false);
    setIsOpenProduct(!isOpenProduct);
    setIsOpenUsageType(false);
    setIsOpenUserUsageType(false);
  };

  const handleOpenOptionProduct = () => setIsOpenProduct(false);

  const handleSelectProduct = (option) => {
    setSelectedProduct(option.name);
    setProductId(option.id);
  };

  /* Coupon Usage Type */
  const handleOpenUsageType = () => {
    setIsOpenCouponType(false);
    setIsOpenValueType(false);
    setIsOpenProductOptions(false);
    setIsOpenProduct(false);
    setIsOpenUsageType(!isOpenUsageType);
    setIsOpenUserUsageType(false);
  };

  const handleOpenOptionUsageType = () => setIsOpenUsageType(false);

  const handleSelectUsageType = (option) => {
    setSelectedUsageType(option.name);
    setUsageTypeName(option.name);
  };

  /* Coupon User Usage Type */
  const handleOpenUserUsageType = () => {
    setIsOpenCouponType(false);
    setIsOpenValueType(false);
    setIsOpenProductOptions(false);
    setIsOpenProduct(false);
    setIsOpenUsageType(false);
    setIsOpenUserUsageType(!isOpenUserUsageType);
  };

  const handleOpenOptionUserUsageType = () => setIsOpenUserUsageType(false);

  const handleSelectUserUsageType = (option) => {
    setSelectedUserUsageType(option.name);
    setUserUsageTypeName(option.name);
  };

  /* Coupon Active Min Discount */
  const HandleActiveMinDiscount = () => {
    const currentState = maxDiscountStatus;
    {
      currentState === 0 ? setMaxDiscountStatus(1) : setMaxDiscountStatus(0);
    }
  };

  /* Coupon Active Min Discount */
  const HandleActiveCoupon = () => {
    const currentState = activeCoupon;
    {
      currentState === 0 ? setActiveCoupon(1) : setActiveCoupon(0);
    }
  };

  useEffect(() => {
    if (!loadingPost) {
      setTitle("");
      setCode("");
      setStartDate("");
      setExpireDate("");
      setCouponTypeName("");
      setDiscountAmount("");
      setSelectedProductOptions(t("Select Products Options"));
      setProducts("");
      setMinPurchase("");
      setActiveCoupon(0);
      setMaxDiscountStatus(0);
      setMaxDiscount("");
      setSelectedCouponType(t("Select Coupon Type"));
      setSelectedUserUsageType(t("Select User Usage Type"));
      setSelectedUsageType(t("Select Usage Type"));
      setUsageNumber("");
      setUserUsageNumber("");
      setStateProduct(t("Select Product"));
      setSelectedProduct([]);
      setValueTypeName("");
      setSelectedValueType(t("Select Value Type"));
    }
    setUpdate(!update);
  }, [response]);

  const handleReset = () => {
    setTitle("");
    setCode("");
    setStartDate("");
    setExpireDate("");
    setCouponTypeName("");
    setDiscountAmount("");
    setSelectedProductOptions("Select Products Options");
    setProducts("");
    setMinPurchase("");
    setActiveCoupon(0);
    setMaxDiscountStatus(0);
    setMaxDiscount("");
    setSelectedCouponType("Select Coupon Type");
    setSelectedUserUsageType("Select User Usage Type");
    setSelectedUsageType("Select Usage Type");
    setUsageNumber("");
    setUserUsageNumber("");
    setStateProduct("Select Product");
    setSelectedProduct([]);
    setValueTypeName("");
    setSelectedValueType("Select Value Type");
  };

  const handleCouponAdd = (e) => {
    e.preventDefault();

    if (!title) {
      auth.toastError(t("enterTitle"));
      return;
    }

    if (!code) {
      auth.toastError(t("enterCode"));
      return;
    }

    if (!startDate) {
      auth.toastError(t("enterStartDate"));
      return;
    }

    if (!expireDate) {
      auth.toastError(t("enterExpireDate"));
      return;
    }

    if (!valueTypeName) {
      auth.toastError(t("selectValueType"));
      return;
    }

    if (!discountAmount) {
      auth.toastError(t("enterDiscountAmount"));
      return;
    }

    if (!productOptionsName) {
      auth.toastError(t("selectProductOption"));
      return;
    }

    if (productOptionsName === "selected" && selectedProduct.length === 0) {
      auth.toastError(t("selectProduct"));
      return;
    }

    if (!couponTypeName) {
      auth.toastError(t("selectCouponType"));
      return;
    }

    if (!minPurchase) {
      auth.toastError(t("selectMinPurchase"));
      return;
    }

    if (!usageTypeName) {
      auth.toastError(t("selectUsageType"));
      return;
    }

    if (!userUsageTypeName) {
      auth.toastError(t("selectUserUsageType"));
      return;
    }

    if (usageTypeName === "Fixed" && !usageNumber) {
      auth.toastError(t("enterUsageNumber"));
      return;
    }

    if (userUsageTypeName === "Fixed" && !userUsageNumber) {
      auth.toastError(t("enterUserUsageNumber"));
      return;
    }

    if (maxDiscountStatus === 1 && !maxDiscount) {
      auth.toastError(t("enterMaxDiscount"));
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("code", code);
    formData.append("start_date", startDate);
    formData.append("expire_date", expireDate);

    if (valueTypeName === "Percentage") {
      formData.append("discount_type", "percentage");
    } else {
      formData.append("discount_type", "value");
    }

    formData.append("discount", discountAmount);

    if (productOptionsName === "All") {
      formData.append("product", "all");
    } else {
      formData.append("product", "selected");
    }

    selectedProduct.forEach((product, index) => {
      formData.append(`products_id[${index}]`, product.id);
    });

    if (couponTypeName === "Normal") {
      formData.append("type", "normal");
    } else {
      formData.append("type", "first_order");
    }

    formData.append("min_purchase", minPurchase);
    formData.append("status", activeCoupon);

    if (usageTypeName === "Fixed") {
      formData.append("number_usage_status", "fixed");
      formData.append("number_usage", usageNumber);
    } else {
      formData.append("number_usage_status", "unlimited");
    }

    if (userUsageTypeName === "Fixed") {
      formData.append("number_usage_user_status", "fixed");
      formData.append("number_usage_user", userUsageNumber);
    } else {
      formData.append("number_usage_user_status", "unlimited");
    }

    formData.append("max_discount_status", maxDiscountStatus);
    formData.append("max_discount", maxDiscount);

    postData(formData, "Coupon Added Success");
  };

  return (
    <>
      {loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleCouponAdd}>
            <div className="flex flex-wrap items-center justify-start w-full gap-4 mb-4 sm:flex-col lg:flex-row">
              {/* Coupon Title */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("CouponName")}:
                </span>
                <TextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("CouponName")}
                />
              </div>
              {/* Coupon Code */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
               {t("CouponCode")}   :
                </span>
                <TextInput
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t("CouponCode")}
                />
              </div>
              {/* Coupon Start Date */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("CouponStartDate")}:
                </span>
                <DateInput
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder={t("CouponStartDate")}
                  maxDate={false}
                />
              </div>
              {/* Coupon Expire Date */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("CouponExpireDate")}:
                </span>
                <DateInput
                  value={expireDate}
                  onChange={(e) => setExpireDate(e.target.value)}
                  placeholder={t("CouponExpireDate")}
                  maxDate={false}
                />
              </div>
              {/* Value Types */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("SelectCouponValueType")}:
                </span>
                <DropDown
                  ref={dropDownValueType}
                  handleOpen={handleOpenValueType}
                  stateoption={selectedValueType}
                  openMenu={isOpenValueType}
                  handleOpenOption={handleOpenOptionValueType}
                  onSelectOption={handleSelectValueType}
                  options={valueType}
                  border={false}
                />
              </div>
              {/* Coupon Discount Amount */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("CouponDiscountAmount")}:
                </span>
                <NumberInput
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder={t("CouponDiscountAmount")}
                  maxDate={false}
                />
              </div>
              {/* Product Options */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("SelectProductOptions")}:
                </span>
                <DropDown
                  ref={dropDownProductOptionsRef}
                  handleOpen={handleOpenProductOptions}
                  stateoption={selectedProductOptions}
                  openMenu={isOpenProductOptions}
                  handleOpenOption={handleOpenOptionProductOptions}
                  onSelectOption={handleSelectProductOptions}
                  options={productOptions}
                  border={false}
                />
              </div>
              {/* Products */}
              {productOptionsName === "Selected" && (
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("SelectProduct")}:
                  </span>
                  <MultiSelect
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.value)}
                    options={products}
                    optionLabel="name"
                    display="chip"
                    placeholder={stateProduct}
                    maxSelectedLabels={3}
                    className="w-full p-1 md:w-20rem text-mainColor"
                    filter
                  />
                </div>
              )}
              {/* Discount Types */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("SelectCouponType")}:
                </span>
                <DropDown
                  ref={dropDownCouponType}
                  handleOpen={handleOpenCouponType}
                  stateoption={selectedCouponType}
                  openMenu={isOpenCouponType}
                  handleOpenOption={handleOpenOptionCouponType}
                  onSelectOption={handleSelectCouponType}
                  options={couponType}
                  border={false}
                />
              </div>
              {/* Coupon Min Purchase */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("CouponMinPurchase")}:
                </span>
                <NumberInput
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  placeholder= {t("CouponMinPurchase")}
                  maxDate={false}
                />
              </div>
              {/* Coupon Usage Type */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("SelectUsageType")}:
                </span>
                <DropDown
                  ref={dropDownUsageType}
                  handleOpen={handleOpenUsageType}
                  stateoption={selectedUsageType}
                  openMenu={isOpenUsageType}
                  handleOpenOption={handleOpenOptionUsageType}
                  onSelectOption={handleSelectUsageType}
                  options={usageType}
                  border={false}
                />
              </div>
              {/* Coupon Usage Number */}
              {usageTypeName === "Fixed" && (
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("CouponUsageNumber")}:
                  </span>
                  <NumberInput
                    value={usageNumber}
                    onChange={(e) => setUsageNumber(e.target.value)}
                    placeholder={t("CouponUsageNumber")}
                    maxDate={false}
                  />
                </div>
              )}

              {/* Coupon User Usage Type */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("SelectUseUsageType")}:
                </span>
                <DropDown
                  ref={dropDownUserUsageType}
                  handleOpen={handleOpenUserUsageType}
                  stateoption={selectedUserUsageType}
                  openMenu={isOpenUserUsageType}
                  handleOpenOption={handleOpenOptionUserUsageType}
                  onSelectOption={handleSelectUserUsageType}
                  options={userUsageType}
                  border={false}
                />
              </div>
              {/* Coupon User Usage Number */}
              {userUsageTypeName === "Fixed" && (
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("CouponUserUsageNumber")}:
                  </span>
                  <NumberInput
                    value={userUsageNumber}
                    onChange={(e) => setUserUsageNumber(e.target.value)}
                    placeholder={t("CouponUserUsageNumber")}
                    maxDate={false}
                  />
                </div>
              )}

              {/* Coupon Active Max Discount */}
              <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-8">
                <div className="flex items-center justify-start gap-x-3">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("ActiveMaxDiscount")}:
                  </span>
                  <Switch
                    handleClick={HandleActiveMinDiscount}
                    checked={maxDiscountStatus}
                  />
                </div>
              </div>

              {/* Coupon Max Discount */}
              {maxDiscountStatus === 1 && (
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("CouponMaxDiscount")}:
                  </span>
                  <NumberInput
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Coupon Max Discount"
                    maxDate={false}
                  />
                </div>
              )}

              {/* Coupon Active  */}
              <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-8">
                <div className="flex items-center justify-start gap-x-3">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("ActiveCoupon")}:
                  </span>
                  <Switch
                    handleClick={HandleActiveCoupon}
                    checked={activeCoupon}
                  />
                </div>
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
                  handleClick={handleCouponAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddCouponPage;
