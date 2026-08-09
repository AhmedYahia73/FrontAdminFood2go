import { useState } from "react";
import {
  StaticButton,
  StaticLoader,
  SubmitButton,
  TextInput,
} from "../../../../../Components/Components";
import { useAuth } from "../../../../../Context/Auth";
import axios from "axios";
import { useTranslation } from "react-i18next";

const AddEmailSection = ({ setUpdate }) => {
  const auth = useAuth();
  const { t, i18n } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setEmail("");
    setName("");
  };

  const handleEmailAdd = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      auth.toastError(t('enterEmail'));
      return;
    }

    if (!name.trim()) {
      auth.toastError(t('enterName'));
      return;
    }

    const finalUrl = `${apiUrl}/admin/settings/business_setup/order_delay_notification/add?email=${encodeURIComponent(email.trim())}`;

    const bodyData = new URLSearchParams();
    bodyData.append("name", name.trim());

    try {
      setLoading(true);

      await axios.post(finalUrl, bodyData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // << اضفنا التوكن هنا
        },
      });

      auth.toastSuccess(t("Email Added Successfully"));
      handleReset();
      setUpdate((prev) => !prev);
    } catch (error) {
      console.error("Error adding email:", error);
      auth.toastError(
        error.response?.data?.message || "Failed to add email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <section>
          <form onSubmit={handleEmailAdd}>
            <div className="sm:py-3 lg:py-6">
              <div className="flex flex-wrap w-full gap-4">
                {/* Email Input */}
                <div className="w-[25%] flex flex-col gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Email")}:
                  </span>
                  <TextInput
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("Enter Email")}
                  />
                </div>

                {/* Name Input */}
                <div className="w-[25%] flex flex-col gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Name")}:
                  </span>
                  <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("Enter Your Name")}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-[50%] m-auto flex justify-end gap-x-4 mt-4">
              <StaticButton
                text={t("Reset")}
                handleClick={handleReset}
                bgColor="bg-transparent"
                Color="text-mainColor"
                border="border-2"
                borderColor="border-mainColor"
                rounded="rounded-full"
                className="px-4 py-2 text-base"
              />
              <SubmitButton
                text={t("Submit")}
                rounded="rounded-full"
                handleClick={handleEmailAdd}
                className="px-4 py-2 text-base"
              />
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddEmailSection;
