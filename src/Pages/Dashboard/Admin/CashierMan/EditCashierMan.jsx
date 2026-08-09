import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

const EditCashierMan = () => {
  const { cashierManId } = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");

  const { refetch: refetchCashierManItem, loading: loadingCashierManItem, data: dataCashierManItem } = useGet({
    url: `${apiUrl}/${role}/cashier_man/item/${cashierManId}`,
  });
  const { refetch: refetchBranch, loading: loadingBranch, data: dataBranch } = useGet({
    url: `${apiUrl}/${role}/cashier_man`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/${role}/cashier_man/update/${cashierManId}`,
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
  const [existingImage, setExistingImage] = useState(null);
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

  // Fetch cashier and branches on component mount
  useEffect(() => {
    refetchCashierManItem();
    refetchBranch();
  }, [refetchCashierManItem, refetchBranch]);

  // Update branches and report permissions when dataBranch is available
  useEffect(() => {
    if (dataBranch) {
      // Set branches
      if (dataBranch.branches) {
        const branchOptions = dataBranch.branches.map((branch) => ({
          value: branch.id,
          label: branch.name,
        }));
        setBranches(branchOptions);
      }

      // Set report permissions
      if (dataBranch.report_role) {
        const reportOptions = getReportPermissionOptions(dataBranch.report_role);
        setReportPermission(reportOptions);
      }
    }
  }, [dataBranch, t]);

  // Pre-populate form with cashier data
  useEffect(() => {
    if (dataCashierManItem && dataCashierManItem.cashier_man) {
      const cashier = dataCashierManItem.cashier_man;
      setUserName(cashier.user_name || "");
      setMyId(cashier.my_id || "");
      setStatus(cashier.status || 0);
      setTakeAway(cashier.take_away || 0);
      setDineIn(cashier.dine_in || 0);
      setDelivery(cashier.delivery || 0);
      setRealOrder(cashier.real_order || 0);
      setDiscount(cashier.discount_perimission || 0);
      setOrderOnline(cashier.online_order || 0);
      setVoidOrder(cashier.void_order || 0);
      setManager(cashier.manger || 0);
      setServiceFees(cashier.service_fees || 0);
      setTotalTax(cashier.total_tax || 0);
      setEnterAmount(cashier.enter_amount || 0);
      setFreeDiscount(cashier.free_discount || 0);
      setHallOrders(cashier.hall_orders || 0);
      setExistingImage(cashier.image_link || null);

      // Set branch
      if (cashier.branch_id && branches.length > 0) {
        const branch = branches.find((b) => b.value === cashier.branch_id);
        setSelectedBranch(branch || null);
      }

      // Set roles
      if (cashier.roles && cashier.roles.length > 0) {
        const roles = cashier.roles.map((role) => ({
          value: role.roles,
          label: t(role.roles.replace("_", " ").toLowerCase()),
        }));
        setSelectedRoles(roles);
      }

      // Set report permission (this is the key fix)
      if (cashier.report && reportPermission.length > 0) {
        const reportOption = reportPermission.find(option => option.value === cashier.report);
        setSelectedReportPermission(reportOption || null);
      }
    }
  }, [dataCashierManItem, branches, reportPermission, t]);

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

  const handleReportPermission = (selectedOption) => {
    setSelectedReportPermission(selectedOption);
  };

  // Reset form to fetched data
  const handleReset = () => {
    if (dataCashierManItem && dataCashierManItem.cashier_man) {
      const cashier = dataCashierManItem.cashier_man;
      setUserName(cashier.user_name || "");
      setPassword("");
      setMyId(cashier.my_id || "");
      setStatus(cashier.status || 0);
      setTakeAway(cashier.take_away || 0);
      setDineIn(cashier.dine_in || 0);
      setDelivery(cashier.delivery || 0);
      setRealOrder(cashier.real_order || 0);
      setDiscount(cashier.discount_perimission || 0);
      setOrderOnline(cashier.online_order || 0);
      setVoidOrder(cashier.void_order || 0);
      setManager(cashier.manger || 0);
      setServiceFees(cashier.service_fees || 0);
      setTotalTax(cashier.total_tax || 0);
      setEnterAmount(cashier.enter_amount || 0);
      setFreeDiscount(cashier.free_discount || 0);
      setHallOrders(cashier.hall_orders || 0);
      setImage(null);
      setExistingImage(cashier.image_link || null);

      if (cashier.branch_id && branches.length > 0) {
        const branch = branches.find((b) => b.value === cashier.branch_id);
        setSelectedBranch(branch || null);
      }

      if (cashier.roles && cashier.roles.length > 0) {
        const roles = cashier.roles.map((role) => ({
          value: role.roles,
          label: t(role.roles.replace("_", " ").toLowerCase()),
        }));
        setSelectedRoles(roles);
      } else {
        setSelectedRoles([]);
      }

      // Reset report permission
      if (cashier.report && reportPermission.length > 0) {
        const reportOption = reportPermission.find(option => option.value === cashier.report);
        setSelectedReportPermission(reportOption || null);
      } else {
        setSelectedReportPermission(null);
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userName) {
      auth.toastError(t("UserNameRequired"));
      return;
    }
    if (!myId) {
      auth.toastError(t("MyIdRequired"));
      return;
    }
    if (!selectedBranch) {
      auth.toastError(t("BranchRequired"));
      return;
    }

    const formData = new FormData();
    formData.append("user_name", userName);
    if (password) {
      formData.append("password", password);
    }
    formData.append("my_id", myId);
    formData.append("branch_id", selectedBranch.value);
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

    // Append report permission if selected
    if (selectedReportPermission) {
      formData.append("report", selectedReportPermission.value);
    }

    selectedRoles.forEach((role, index) => {
      formData.append(`roles[${index}]`, role.value);
    });

    if (image) {
      formData.append("image", image);
    }

    postData(formData, t("CashierManUpdatedSuccess"));
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
      setExistingImage(URL.createObjectURL(file));
    }
  };

  // Fixed custom styles for react-select (hover issue)
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
        backgroundColor: state.isSelected ? "#9E090F" : "#E6F0FA",
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
      {loadingPost || loadingBranch || loadingCashierManItem ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <section className="pb-28">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-x-2">
              <button
                onClick={handleBack}
                className="text-mainColor hover:text-red-700 transition-colors"
                title={t("Back")}
              >
                <IoArrowBack size={24} />
              </button>
              <TitlePage text={t("Edit Cashier Man")} />
            </div>
          </div>
          <form className="p-2" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                  placeholder={t("PasswordOptional")}
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

              {/* Branch Selection */}
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

              {/* Roles Multi-Select */}
              <div className="flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Roles")}:
                </span>
                <Select
                  options={roleOptions}
                  value={selectedRoles}
                  onChange={setSelectedRoles}
                  placeholder={t("SelectRoles")}
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
                {existingImage ? (
                  <img
                    src={existingImage}
                    alt="Current cashier"
                    className="w-24 h-24 rounded-full mb-2 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <span className="text-sm text-thirdColor">{t("No Image")}</span>
                  </div>
                )}
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
              <div className="flex items-start justify-start gap-x-3 pt-8">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Manager")}:
                </span>
                <Switch handleClick={handleManager} checked={manager} />
              </div>

              {/* Status */}
              <div className="flex items-start justify-start gap-x-3 pt-8">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("ActiveStatus")}:
                </span>
                <Switch handleClick={handleStatus} checked={status} />
              </div>

              {/* Take Away */}
              <div className="flex items-start justify-start gap-x-3 pt-8">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Take Away")}:
                </span>
                <Switch handleClick={handleTakeAway} checked={takeAway} />
              </div>

              {/* Dine In */}
              <div className="flex items-start justify-start gap-x-3 pt-8">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Dine In")}:
                </span>
                <Switch handleClick={handleDineIn} checked={dineIn} />
              </div>

              {/* Delivery */}
              <div className="flex items-start justify-start gap-x-3 pt-8">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Delivery")}:
                </span>
                <Switch handleClick={handleDelivery} checked={delivery} />
              </div>

              {/* Real Order */}
              <div className="flex items-start justify-start gap-x-3 pt-8">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Real Order")}:
                </span>
                <Switch handleClick={handleRealOrder} checked={realOrder} />
              </div>

              {/*Online Order */}
              <div className="flex items-start justify-start gap-x-3 pt-8">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Online Order")}:
                </span>
                <Switch handleClick={handleOrderOnline} checked={orderOnline} />
              </div>

              {/* Discount Perimission */}
              <div className="flex items-start justify-start gap-x-3 pt-8">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Discount Perimission")}:
                </span>
                <Switch handleClick={handleDiscount} checked={discount} />
              </div>

              {/* Void Order */}
              <div className="flex items-start justify-start gap-x-3 pt-8">
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
                  text={t("Update")}
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

export default EditCashierMan;