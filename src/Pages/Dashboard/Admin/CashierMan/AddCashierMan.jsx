import React, { useEffect, useState } from "react";
import {
  PasswordInput,
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
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Select from "react-select";

const AddCashierMan = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const { refetch: refetchBranch, loading: loadingBranch, data: dataBranch } = useGet({
    url: `${apiUrl}/${role}/cashier_man`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/${role}/cashier_man/add`,
  });
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [myId, setMyId] = useState("");
  const [status, setStatus] = useState(0);
  const [takeAway, setTakeAway] = useState(0);
  const [dineIn, setDineIn] = useState(0);
  const [delivery, setDelivery] = useState(0);
  const [realOrder, setRealOrder] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [orderOnline, setOrderOnline] = useState(0);
  const [voidOrder, setVoidOrder] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [image, setImage] = useState(null);
  const [reportPermission, setReportPermission] = useState([]);
  const [selectedReportPermission, setSelectedReportPermission] = useState(null);
  const [manager, setManager] = useState(0);
  const [serviceFees, setServiceFees] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [enterAmount, setEnterAmount] = useState(0);
  const [freeDiscount, setFreeDiscount] = useState(0);
  const [hallOrders, setHallOrders] = useState(0);

  // Role options for react-select
  const roleOptions = [
    { value: "branch_reports", label: t("Branch Reports") },
    { value: "all_reports", label: t("All Reports") },
    { value: "table_status", label: t("Table Status") },
  ];

  // Report permission options mapping
  const getReportPermissionOptions = (roles) => {
    if (!roles) return [];

    const roleTranslations = {
      unactive: t("Unactive"),
      financial: t("Financial"),
      all: t("All Reports")
    };

    return roles.map(role => ({
      value: role,
      label: roleTranslations[role] || role
    }));
  };

  // Fetch branches on component mount
  useEffect(() => {
    refetchBranch();
  }, [refetchBranch]);

  // Update branches state when dataBranch is available
  useEffect(() => {
    if (dataBranch) {
      if (role === "admin") {
        const branchOptions = dataBranch.branches.map((branch) => ({
          value: branch.id,
          label: branch.name,
        }));
        setBranches(branchOptions);
      }

      // Use the mapping function for report permissions
      const reportOptions = getReportPermissionOptions(dataBranch.report_role);
      setReportPermission(reportOptions);
    }
  }, [dataBranch, t]);

  // Navigate back after successful submission
  useEffect(() => {
    if (!loadingPost && response) {
      handleBack();
    }
  }, [response, loadingPost]);

  // Toggle switch states
  const handleStatus = () => setStatus((prev) => (prev === 0 ? 1 : 0));
  const handleTakeAway = () => setTakeAway((prev) => (prev === 0 ? 1 : 0));
  const handleDineIn = () => setDineIn((prev) => (prev === 0 ? 1 : 0));
  const handleDelivery = () => setDelivery((prev) => (prev === 0 ? 1 : 0));
  const handleRealOrder = () => setRealOrder((prev) => (prev === 0 ? 1 : 0));
  const handleDiscount = () => setDiscount((prev) => (prev === 0 ? 1 : 0));
  const handleOrderOnline = () => setOrderOnline((prev) => (prev === 0 ? 1 : 0));
  const handleVoidOrder = () => setVoidOrder((prev) => (prev === 0 ? 1 : 0));
  const handleManager = () => setManager((prev) => (prev === 0 ? 1 : 0));
  const handleServiceFees = () => setServiceFees((prev) => (prev === 0 ? 1 : 0));
  const handleTotalTax = () => setTotalTax((prev) => (prev === 0 ? 1 : 0));
  const handleEnterAmount = () => setEnterAmount((prev) => (prev === 0 ? 1 : 0));
  const handleFreeDiscount = () => setFreeDiscount((prev) => (prev === 0 ? 1 : 0));
  const handleHallOrders = () => setHallOrders((prev) => (prev === 0 ? 1 : 0));

  // Reset form
  const handleReset = () => {
    setUserName("");
    setPassword("");
    setMyId("");
    setStatus(0);
    setTakeAway(0);
    setDineIn(0);
    setDelivery(0);
    setRealOrder(0);
    setDiscount(0);
    setOrderOnline(0);
    setVoidOrder(0);
    setSelectedBranch(null);
    setSelectedRoles([]);
    setImage(null);
    setSelectedReportPermission(null);
    setManager(0);
    setServiceFees(0);
    setTotalTax(0);
    setEnterAmount(0);
    setFreeDiscount(0);
    setHallOrders(0);
  };

  const handleReportPermission = (selectedOption) => {
    setSelectedReportPermission(selectedOption);
  };

  // Handle form submission
  const handleAdd = (e) => {
    e.preventDefault();

    if (!userName) {
      auth.toastError(t("UserNameRequired"));
      return;
    }
    if (!password) {
      auth.toastError(t("PasswordRequired"));
      return;
    }
    if (!myId) {
      auth.toastError(t("MyIdRequired"));
      return;
    }
    if (!selectedBranch && role === "admin") {
      auth.toastError(t("BranchRequired"));
      return;
    }

    const formData = new FormData();
    formData.append("user_name", userName);
    formData.append("password", password);
    formData.append("my_id", myId);
    if (role === "admin") {
      formData.append("branch_id", selectedBranch.value);
    }
    else {
      formData.append("branch_id", auth.userState?.id);
    }
    formData.append("status", status);
    formData.append("take_away", takeAway);
    formData.append("dine_in", dineIn);
    formData.append("delivery", delivery);
    formData.append("real_order", realOrder);
    formData.append("online_order", orderOnline);
    formData.append("discount_perimission", discount);
    formData.append("void_order", voidOrder);
    formData.append("manger", manager);
    formData.append("service_fees", serviceFees);
    formData.append("total_tax", totalTax);
    formData.append("enter_amount", enterAmount);
    formData.append("free_discount", freeDiscount);
    formData.append("hall_orders", hallOrders);

    // Append roles if any selected
    selectedRoles.forEach((role, index) => {
      formData.append(`roles[${index}]`, role.value);
    });

    if (image) {
      formData.append("image", image);
    }

    // Append report permission if selected
    if (selectedReportPermission) {
      formData.append("report", selectedReportPermission.value);
    }

    postData(formData, t("CashierManAddedSuccess"));
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#9E090F",
      borderRadius: "8px",
      padding: "6px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#9E090F",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#9E090F" : "white",
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: state.isSelected ? "#9E090F" : "#E6F0FA", // Fixed hover color
        color: state.isSelected ? "white" : "black",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#333",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#E6F0FA",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#333",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#9E090F",
      "&:hover": {
        backgroundColor: "#9E090F",
        color: "white",
      },
    }),
  };

  return (
    <>
      {loadingPost || loadingBranch ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <section className="pb-28">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-x-2">
              <button
                onClick={handleBack}
                className="transition-colors text-mainColor hover:text-red-700"
                title={t("Back")}
              >
                <IoArrowBack size={24} />
              </button>
              <TitlePage text={t("Add Cashier Man")} />
            </div>
          </div>
          <form className="p-2" onSubmit={handleAdd}>
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2 lg:grid-cols-3">
              {/* User Name */}
              <div className="flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("UserName")}:
                </span>
                <TextInput
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={t("UserName")}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Password")}:
                </span>
                <PasswordInput
                  value={password}
                  placeholder={t("Password")}
                  required={false}
                  backgound="white"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* My ID */}
              <div className="flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("MyId")}:
                </span>
                <TextInput
                  value={myId}
                  onChange={(e) => setMyId(e.target.value)}
                  placeholder={t("MyId")}
                />
              </div>

              {role === "admin" && (
                <div className="flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Branch")}:
                  </span>
                  <Select
                    options={branches}
                    value={selectedBranch}
                    onChange={setSelectedBranch}
                    placeholder={t("SelectBranch")}
                    styles={customStyles}
                    isSearchable
                    className="w-full"
                  />
                </div>
              )}

              {/* Roles Multi-Select */}
              <div className="flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Roles")}:
                </span>
                <Select
                  options={roleOptions}
                  value={selectedRoles}
                  onChange={setSelectedRoles}
                  placeholder={t("Select Roles")}
                  styles={customStyles}
                  isMulti
                  className="w-full"
                />
              </div>

              {/* Report Permission */}
              <div className="flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("ReportPermission")}:
                </span>
                <Select
                  options={reportPermission}
                  value={selectedReportPermission}
                  onChange={handleReportPermission}
                  placeholder={t("SelectReportPermission")}
                  styles={customStyles}
                  isSearchable
                  className="w-full"
                />
              </div>

              {/* Image Upload */}
              <div className="flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Image")}:
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-thirdColor file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-TextFontRegular file:bg-mainColor file:text-white hover:file:bg-red-700"
                />
                {image && (
                  <p className="mt-1 text-sm text-thirdColor">
                    {t("Selected")}: {image.name}
                  </p>
                )}
              </div>

              {/* Manager Switch */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Manager")}:
                </span>
                <Switch handleClick={handleManager} checked={manager} />
              </div>

              {/* Status */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("ActiveStatus")}:
                </span>
                <Switch handleClick={handleStatus} checked={status} />
              </div>

              {/* Take Away */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Take Away")}:
                </span>
                <Switch handleClick={handleTakeAway} checked={takeAway} />
              </div>

              {/* Dine In */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Dine In")}:
                </span>
                <Switch handleClick={handleDineIn} checked={dineIn} />
              </div>

              {/* Delivery */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Delivery")}:
                </span>
                <Switch handleClick={handleDelivery} checked={delivery} />
              </div>

              {/* Real Order */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Real Order")}:
                </span>
                <Switch handleClick={handleRealOrder} checked={realOrder} />
              </div>

              {/*Online Order */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Online Order")}:
                </span>
                <Switch handleClick={handleOrderOnline} checked={orderOnline} />
              </div>

              {/* Discount Perimission */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Discount Perimission")}:
                </span>
                <Switch handleClick={handleDiscount} checked={discount} />
              </div>

              {/* Void Order */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Void Order")}:
                </span>
                <Switch handleClick={handleVoidOrder} checked={voidOrder} />
              </div>

              {/* Service Fees */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Service Fees")}:
                </span>
                <Switch handleClick={handleServiceFees} checked={serviceFees} />
              </div>

              {/* Total Tax */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Total Tax")}:
                </span>
                <Switch handleClick={handleTotalTax} checked={totalTax} />
              </div>

              {/* Enter Amount */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("allowAmountEntry")}:
                </span>
                <Switch handleClick={handleEnterAmount} checked={enterAmount} />
              </div>

              {/* Free Discount */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Free Discount")}:
                </span>
                <Switch handleClick={handleFreeDiscount} checked={freeDiscount} />
              </div>

              {/* Hall Orders */}
              <div className="flex items-start justify-start pt-8 gap-x-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Hall Orders")}:
                </span>
                <Switch handleClick={handleHallOrders} checked={hallOrders} />
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
                  border="border-2"
                  borderColor="border-mainColor"
                  rounded="rounded-full"
                />
              </div>
              <div>
                <SubmitButton
                  text={t("Submit")}
                  rounded="rounded-full"
                  handleClick={handleAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddCashierMan;