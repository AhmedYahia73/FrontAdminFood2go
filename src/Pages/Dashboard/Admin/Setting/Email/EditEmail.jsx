import { useEffect, useState } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import {
  LoaderLogin,
  StaticButton,
  SubmitButton,
  TextInput,
} from "../../../../../Components/Components";
import { useAuth } from "../../../../../Context/Auth";
import axios from "axios";
import { useTranslation } from "react-i18next";

const EditEmailPage = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const auth = useAuth();
                 const {  t,i18n } = useTranslation();
  const [newEmail, setNewEmail] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    if (response) {
      handleBack();
    }
  }, [response]);

  const handleBack = () => {
    navigate(-1, { replace: true });
  };

  const handleEmailEdit = async (e) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      auth.toastError(t("Please enter a new email"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      auth.toastError(t("Please enter a valid email"));
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      auth.toastError(t("No authentication token found. Please log in again."));
      return;
    }

    const updatedUrl = `${apiUrl}/admin/settings/business_setup/order_delay_notification/update/${emailId}?email=${encodeURIComponent(newEmail.trim())}`;

    setLoadingPost(true);
    try {
      const res = await axios.put(updatedUrl, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResponse(res.data);
      auth.toastSuccess(t("Email updated successfully"));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred while updating the email";
      auth.toastError(errorMessage);
    } finally {
      setLoadingPost(false);
    }
  };

  return (
    <>
      {loadingPost ? (
        <div className="flex items-center justify-center w-full py-10">
          <LoaderLogin className="w-10 h-10" />
        </div>
      ) : (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <form onSubmit={handleEmailEdit} className="space-y-10">
            {/* New Email Input */}
            <div className="flex flex-col gap-y-2">
              <label className="text-sm font-semibold text-gray-800">
                {t('New Email')}:
              </label>
              <TextInput
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t("Enter New Email")}
                className="w-full md:w-[50%] !rounded-none text-sm border !border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-6">
              <StaticButton
                text={t("Cancel")}
                handleClick={handleBack}
                bgColor="bg-white"
                Color="text-red-600"
                border="border border-red-600"
                rounded="rounded-lg"
                className="px-8 py-2 text-sm font-semibold transition hover:bg-gray-50"
              />
              <SubmitButton
                text={t("Save Changes")}
                rounded="rounded-lg"
                handleClick={handleEmailEdit}
                className="px-8 py-2 text-sm font-semibold text-white uppercase transition bg-red-600 hover:bg-red-700"
              />
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default EditEmailPage;
