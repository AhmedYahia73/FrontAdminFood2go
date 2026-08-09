import React, { useEffect, useRef, useState } from "react";
import {
  DropDown,
  EmailInput,
  LoaderLogin,
  NumberInput,
  PasswordInput,
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
  UploadInput,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useGet } from "../../../../../Hooks/useGet";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const EditCustomersPage = () => {
  const { customerId } = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchCustomer,
    loading: loadingCustomer,
    data: dataCustomer,
  } = useGet({ url: `${apiUrl}/admin/customer/item/${customerId}` });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/customer/update/${customerId}`,
  });

  const auth = useAuth();
  const navigate = useNavigate();
  const ImageRef = useRef();
  const { t, i18n } = useTranslation();

  const [customerFname, setCustomerFname] = useState("");
  const [customerLname, setCustomerLname] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerImage, setCustomerImage] = useState("");
  const [customerImageFile, setCustomerImageFile] = useState(null);
  const [customerStatus, setCustomerStatus] = useState(0);
  const [customerDueStatus, setCustomerDueStatus] = useState(0);
  const [customerMaxDue, setCustomerMaxDue] = useState("");

  useEffect(() => {
    refetchCustomer();
  }, [refetchCustomer]);

  useEffect(() => {
    if (dataCustomer && dataCustomer.customers) {
      setCustomers(dataCustomer.customers);
    }
  }, [dataCustomer]);

  useEffect(() => {
    if (dataCustomer && dataCustomer.customer) {
      const customer = dataCustomer.customer;
      setCustomerFname(customer.f_name || "");
      setCustomerLname(customer.l_name || "");
      setCustomerPhone(customer.phone || "");
      setCustomerImage(customer.image_link || "");
      setCustomerEmail(customer.email || "");
      setCustomerStatus(customer.status || 0);
      setCustomerDueStatus(customer.due_status || 0);
      setCustomerMaxDue(customer.max_due || "");
    }
  }, [dataCustomer]);

  const handleCustomerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomerImageFile(file);
      setCustomerImage(file.name);
    }
  };

  const handleCustomerImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handleCustomerStatus = () => {
    setCustomerStatus((prev) => (prev === 0 ? 1 : 0));
  };

  const handleCustomerDueStatus = () => {
    setCustomerDueStatus((prev) => (prev === 0 ? 1 : 0));
  };

  const handleCancel = () => {
    navigate(-1, { replace: true });
  };

  const handleReset = () => {
    setCustomerFname("");
    setCustomerLname("");
    setCustomerPhone("");
    setCustomerImage("");
    setCustomerImageFile(null);
    setCustomerEmail("");
    setCustomerPassword("");
    setCustomerStatus(0);
    setCustomerDueStatus(0);
    setCustomerMaxDue("");
  };

  useEffect(() => {
    if (!loadingPost && response) {
      handleCancel();
    }
  }, [response]);

  const handleCustomerEdit = async (e) => {
    e.preventDefault();

    if (!customerFname) {
      auth.toastError(t("please Enter First Name"));
      return;
    }
    if (!customerLname) {
      auth.toastError(t("please Enter Last Name"));
      return;
    }
    if (!customerPhone) {
      auth.toastError(t("please Enter The Phone"));
      return;
    }
    if (!customerEmail) {
      auth.toastError(t("please Enter The Email"));
      return;
    }
    if (!customerEmail.includes("@")) {
      auth.toastError(t("please Enter '@' After The Email"));
      return;
    }

    const formData = new FormData();

    formData.append("f_name", customerFname);
    formData.append("l_name", customerLname);
    formData.append("phone", customerPhone);
    formData.append("email", customerEmail);
    // Only append password if it is not empty
    if (customerPassword) {
      formData.append("password", customerPassword);
    }
    formData.append("status", customerStatus || 0);
    formData.append("due_status", customerDueStatus || 0);
    formData.append("max_due", customerMaxDue || "");

    if (customerImageFile) {
      formData.append("image", customerImageFile);
    }

    postData(formData, t("Customer Updated Success"));
  };

  return (
    <>
      {loadingCustomer || loadingPost ? (
        <div className="flex items-center justify-center w-full">
          <LoaderLogin />
        </div>
      ) : (
        <>
          <form
            className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row"
            onSubmit={handleCustomerEdit}
          >
            {/* First Name */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("First Name")}:
              </span>
              <TextInput
                value={customerFname}
                onChange={(e) => setCustomerFname(e.target.value)}
                placeholder={t("First Name")}
              />
            </div>
            {/* Last Name */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Last Name")}:
              </span>
              <TextInput
                value={customerLname}
                onChange={(e) => setCustomerLname(e.target.value)}
                placeholder={t("Last Name")}
              />
            </div>
            {/* Customer Phone */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Customer Phone")}:
              </span>
              <NumberInput
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t("Customer Phone")}
              />
            </div>
            {/* Customer Image */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Customer Photo")}:
              </span>
              <UploadInput
                value={customerImage}
                uploadFileRef={ImageRef}
                placeholder={t("Customer Photo")}
                handleFileChange={handleCustomerImageChange}
                onChange={(e) => setCustomerImage(e.target.value)}
                onClick={() => handleCustomerImageClick(ImageRef)}
              />
            </div>
            {/* Email */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Email")}:
              </span>
              <EmailInput
                backgound="white"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder={t("Email")}
              />
            </div>
            {/* Password */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Password")}:
              </span>
              <PasswordInput
                backgound="white"
                required={false}
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                placeholder={t("Password")}
              />
            </div>
            {/* Customer Status */}
            <div className="xl:w-[30%] flex items-center justify-start gap-x-4">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Customer Status")}:
              </span>
              <Switch
                handleClick={handleCustomerStatus}
                checked={customerStatus}
              />
            </div>
            {/* Customer Due Status */}
            <div className="xl:w-[30%] flex items-center justify-start gap-x-4">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Customer Due Status")}:
              </span>
              <Switch
                handleClick={handleCustomerDueStatus}
                checked={customerDueStatus}
              />
            </div>
            {/* Customer Max Due */}
            {customerDueStatus ? (
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Customer Max Due")}:
                </span>
                <NumberInput
                  value={customerMaxDue}
                  onChange={(e) => setCustomerMaxDue(e.target.value)}
                  placeholder={t("Customer Max Due")}
                />
              </div>
            ) : (
              ""
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end w-full gap-x-4">
              <div>
                <StaticButton
                  text={t("Cancel")}
                  handleClick={handleCancel}
                  bgColor="bg-transparent"
                  Color="text-mainColor"
                  border="border-2"
                  borderColor="border-mainColor"
                  rounded="rounded-full"
                />
              </div>
              <div>
                <SubmitButton
                  text={t("Edit")}
                  rounded="rounded-full"
                  handleClick={handleCustomerEdit}
                />
              </div>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default EditCustomersPage;