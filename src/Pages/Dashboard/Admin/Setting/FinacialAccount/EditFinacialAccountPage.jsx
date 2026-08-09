import React, { useEffect, useRef, useState } from "react";
import {
  NumberInput,
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
  TitlePage,
  UploadInput,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useGet } from "../../../../../Hooks/useGet"; // Assuming useGet is imported
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "primereact/multiselect";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const EditFinacialAccountPage = () => {
  const { financialId } = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const financialAccountUrl =
    role === "branch"
      ? `branch/financial`
      : `admin/settings/financial`;
  const { refetch: refetchFinancialAccount, loading: loadingFinancialAccount, data: dataFinancialAccount } = useGet({ url: `${apiUrl}/${role}/settings/financial/item/${financialId}` });
  const { refetch: refetchBranches, loading: loadingBranches, data: dataBranches } = useGet({
    url: `${apiUrl}/${financialAccountUrl}`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/${financialAccountUrl}/update/${financialId}`,
  });
  const { t } = useTranslation();
  const { toastError } = useAuth();

  const ImageRef = useRef();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [balance, setBalance] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState(0);
  const [visaStatus, setVisaStatus] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(null); // State for selected branch
  const [openMenu, setOpenMenu] = useState(false); // State for dropdown open/close
  const [main, setMain] = useState(0);
  const [order, setOrder] = useState("");

  useEffect(() => {
    refetchBranches();
    refetchFinancialAccount();
  }, [refetchBranches, refetchFinancialAccount]);

  useEffect(() => {
    if (dataBranches && dataBranches.branches) {
      setBranches(dataBranches.branches);
    }
  }, [dataBranches]);

  useEffect(() => {
    if (dataFinancialAccount && dataFinancialAccount.financial) {
      const data = dataFinancialAccount.financial;
      setName(data?.name || '')
      setDescription(data?.details || '')
      setBalance(data?.balance || 0)
      setImage(data?.logo_link || '')
      setImageFile(data?.logo_link || null)
      setStatus(data?.status || 0)
      setVisaStatus(data?.description_status || 0)
      setDiscount(data?.discount || 0)
      setMain(data?.main || 0)
      setOrder(data?.order || "")
      setSelectedBranch(data?.branch)
    }
  }, [dataFinancialAccount]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(file.name);
    }
  };

  const handleImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handlefinancialAccountStatus = () => {
    setStatus((prev) => (prev === 0 ? 1 : 0));
  };

  const handleVisaStatus = () => {
    setVisaStatus((prev) => (prev === 0 ? 1 : 0));
  };

  const handleDiscountStatus = () => {
    setDiscount((prev) => (prev === 0 ? 1 : 0));
  };

  const handleMainStatus = () => {
    setMain((prev) => (prev === 0 ? 1 : 0));
  };

  useEffect(() => {
    if (!loadingPost && response) {
      navigate(-1)
    }
  }, [response]);

  const handleReset = () => {
    setName("");
    setDescription("");
    setBalance("");
    setImage("");
    setImageFile(null);
    setStatus(0);
    setVisaStatus(0);
    setDiscount(0);
    setMain(0);
    setSelectedBranch(null);
    setOpenMenu(false);
    setOrder("");
  };

  const handlefinancialAccountAdd = (e) => {
    e.preventDefault();

    if (!name) {
      toastError(t("enterfinancialAccountName"));
      return;
    }
    if (!description) {
      toastError(t("enterfinancialAccountDescription"));
      return;
    }
    if (!balance) {
      toastError(t("enterfinancialAccountBalance"));
      return;
    }
    if (!selectedBranch) {
      toastError(t("selectBranch")); // Add new translation key for branch validation
      return;
    }
    if (!order || isNaN(order)) {
      toastError(t("enterValidOrderNumber"));
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("details", description);
    formData.append("balance", balance || 0);
    if (imageFile) {
      formData.append("logo", imageFile);
    }
    formData.append("status", status);
    formData.append("discount", discount);
    formData.append("description_status", visaStatus);
    formData.append("main", main);
    formData.append("order", order);
    if (role === 'admin') {
      selectedBranch.forEach((branch, index) => {
        formData.append(`branch_id[${index}]`, branch.id); // Append each ID as an array element in FormData
      });
    }
    postData(formData, t("Financial Account Updated Success")); // Updated to use t() for success message
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      {loadingPost || loadingBranches || loadingFinancialAccount ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <section className="flex flex-col">
          <div className="flex items-center gap-x-2">
            <button
              onClick={handleBack}
              className="text-mainColor hover:text-red-700 transition-colors"
              title={t("Back")}
            >
              <IoArrowBack size={24} />
            </button>
            <TitlePage text={t("Edit Financial Account")} />
          </div>

          <form onSubmit={handlefinancialAccountAdd}>
            <div className="sm:py-3 lg:py-6">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Name Input */}
                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Name")}:
                  </span>
                  <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("Name")}
                  />
                </div>
                {/* Branch Dropdown */}
                {role === "admin" && (
                  <div className="w-full flex flex-col items-start justify-center gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("BranchName")}:
                    </span>
                    <MultiSelect
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.value)}
                      options={branches}
                      optionLabel="name"
                      display="chip"
                      placeholder={t("selectBranch")}
                      // maxSelectedLabels={3}
                      className="w-full p-1 md:w-20rem text-mainColor"
                      filter
                    />
                  </div>
                )}
                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Description")}:
                  </span>
                  <TextInput
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("Description")}
                  />
                </div>
                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Balance")}:
                  </span>
                  <NumberInput
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder={t("Balance")} // Fixed placeholder
                  />
                </div>
                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("OrderNumber")}:
                  </span>
                  <NumberInput
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder={t("OrderNumber")}
                  />
                </div>
                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Image")}:
                  </span>
                  <UploadInput
                    value={image}
                    uploadFileRef={ImageRef}
                    placeholder={t("Image")}
                    handleFileChange={handleImageChange}
                    onChange={(e) => setImage(e.target.value)}
                    onClick={() => handleImageClick(ImageRef)}
                  />
                </div>
                <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                  <div className="flex items-center justify-start w-2/4 gap-x-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("Visa Status")}:
                    </span>
                    <Switch
                      handleClick={handleVisaStatus}
                      checked={visaStatus}
                    />
                  </div>
                </div>
                <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                  <div className="flex items-center justify-start w-2/4 gap-x-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("Discount Status")}:
                    </span>
                    <Switch
                      handleClick={handleDiscountStatus}
                      checked={discount}
                    />
                  </div>
                </div>
                <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                  <div className="flex items-center justify-start w-2/4 gap-x-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("Status")}:
                    </span>
                    <Switch
                      handleClick={handlefinancialAccountStatus}
                      checked={status}
                    />
                  </div>
                </div>
                <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                  <div className="flex items-center justify-start w-2/4 gap-x-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("Main")}:
                    </span>
                    <Switch
                      handleClick={handleMainStatus}
                      checked={main}
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
                  border="border-2"
                  borderColor="border-mainColor"
                  rounded="rounded-full"
                />
              </div>
              <div>
                <SubmitButton
                  text={t("Submit")}
                  rounded="rounded-full"
                  handleClick={handlefinancialAccountAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default EditFinacialAccountPage;