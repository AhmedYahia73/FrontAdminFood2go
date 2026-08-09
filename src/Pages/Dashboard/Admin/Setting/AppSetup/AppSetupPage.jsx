import React, { useEffect, useState, useRef } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import {
  LoaderLogin,
  SubmitButton,
  TextInput,
  UploadInput,
  Switch,
} from "../../../../../Components/Components";
import { useTranslation } from "react-i18next";

const AppSetupPage = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();
  const {
    refetch: refetchMainData,
    loading: loadingMainData,
    data: dataMainData,
  } = useGet({
    url: `${apiUrl}/admin/settings/main_data`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/main_data/update`,
  });

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    ar_name: "",
    facebook: "",
    instagram: "",
    logo: null,
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    image6: null,
    first_color: "",
    second_color: "",
    third_color: "",
    continues_status: 0,
  });

  // Refs for file inputs
  const logoRef = useRef(null);
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);
  const image3Ref = useRef(null);
  const image4Ref = useRef(null);
  const image5Ref = useRef(null);
  const image6Ref = useRef(null);

  useEffect(() => {
    refetchMainData();
  }, [refetchMainData]);

  // Populate form data when main data is fetched
  useEffect(() => {
    if (dataMainData?.main_data) {
      setFormData({
        name: dataMainData.main_data?.name || "",
        ar_name: dataMainData.main_data?.ar_name || "",
        facebook: dataMainData.main_data?.facebook || "",
        instagram: dataMainData.main_data?.instagram || "",
        logo: dataMainData.main_data?.logo_link || null,
        image1: dataMainData.main_data?.image1_link || null,
        image2: dataMainData.main_data?.image2_link || null,
        image3: dataMainData.main_data?.image3_link || null,
        image4: dataMainData.main_data?.image4_link || null,
        image5: dataMainData.main_data?.image5_link || null,
        image6: dataMainData.main_data?.image6_link || null,
        first_color: dataMainData.main_data?.first_color || "",
        second_color: dataMainData.main_data?.second_color || "",
        third_color: dataMainData.main_data?.third_color || "",
        continues_status: dataMainData.main_data?.continues_status || 0,
      });
    }
  }, [dataMainData]);

  // Handle text input changes
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = () => {
    setFormData((prev) => ({
      ...prev,
      continues_status: prev.continues_status === 1 ? 0 : 1,
    }));
  };

  // Handle file input changes
  const handleFileChange = (name, file) => {
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  // Trigger file input click
  const handleUploadClick = (ref) => {
    ref.current.click();
  };

  const handleChangeMainData = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.ar_name) {
      t("enterMainData");
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      // Check if value is not null or undefined
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    postData(submitData, t("App Setup Changed Success"));
  };

  return (
    <>
      {loadingPost || loadingMainData ? (
        <div className="flex items-center justify-center w-full">
          <LoaderLogin />
        </div>
      ) : (
        <section>
          <form onSubmit={handleChangeMainData}>
            <div className="flex flex-wrap items-center justify-start w-full gap-4 mb-4 sm:flex-col lg:flex-row">
              {/* Name */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Name")}</label>
                <TextInput
                  value={formData.name}
                  onChange={handleTextChange}
                  placeholder={t("Enter Name")}
                  name="name"
                />
              </div>
              {/* Arabic Name */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Arabic Name")}</label>
                <TextInput
                  value={formData.ar_name}
                  onChange={handleTextChange}
                  placeholder={t("Enter Arabic Name")}
                  name="ar_name"
                />
              </div>
              {/* Facebook */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Facebook Link")}</label>
                <TextInput
                  value={formData.facebook}
                  onChange={handleTextChange}
                  placeholder={t("Enter Facebook Link")}
                  name="facebook"
                />
              </div>
              {/* Instagram */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Instagram Link")}</label>
                <TextInput
                  value={formData.instagram}
                  onChange={handleTextChange}
                  placeholder={t("Enter Instagram Link")}
                  name="instagram"
                />
              </div>
              {/* logo Upload */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Logo")}</label>
                <UploadInput
                  uploadFileRef={logoRef}
                  handleFileChange={(e) => handleFileChange("logo", e.target.files[0])}
                  placeholder={t("Upload Logo")}
                  value={formData.logo ? formData.logo : ""}
                  onClick={() => handleUploadClick(logoRef)}
                />
              </div>
              {/* Image 1 Upload */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Image 1")}</label>
                <UploadInput
                  uploadFileRef={image1Ref}
                  handleFileChange={(e) => handleFileChange("image1", e.target.files[0])}
                  placeholder={t("Upload Image 1")}
                  value={formData.image1 ? formData.image1 : ""}
                  onClick={() => handleUploadClick(image1Ref)}
                />
              </div>
              {/* Image 2 Upload */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Image 2")}</label>
                <UploadInput
                  uploadFileRef={image2Ref}
                  handleFileChange={(e) => handleFileChange("image2", e.target.files[0])}
                  placeholder={t("Upload Image 2")}
                  value={formData.image2 ? formData.image2 : ""}
                  onClick={() => handleUploadClick(image2Ref)}
                />
              </div>
              {/* Image 3 Upload */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Image 3")}</label>
                <UploadInput
                  uploadFileRef={image3Ref}
                  handleFileChange={(e) => handleFileChange("image3", e.target.files[0])}
                  placeholder={t("Upload Image 3")}
                  value={formData.image3 ? formData.image3 : ""}
                  onClick={() => handleUploadClick(image3Ref)}
                />
              </div>
              {/* Image 4 Upload */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Image 4")}</label>
                <UploadInput
                  uploadFileRef={image4Ref}
                  handleFileChange={(e) => handleFileChange("image4", e.target.files[0])}
                  placeholder={t("Upload Image 4")}
                  value={formData.image4 ? formData.image4 : ""}
                  onClick={() => handleUploadClick(image4Ref)}
                />
              </div>
              {/* Image 5 Upload */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Image 5")}</label>
                <UploadInput
                  uploadFileRef={image5Ref}
                  handleFileChange={(e) => handleFileChange("image5", e.target.files[0])}
                  placeholder={t("Upload Image 5")}
                  value={formData.image5 ? formData.image5 : ""}
                  onClick={() => handleUploadClick(image5Ref)}
                />
              </div>
              {/* Image 6 Upload */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Image 6")}</label>
                <UploadInput
                  uploadFileRef={image6Ref}
                  handleFileChange={(e) => handleFileChange("image6", e.target.files[0])}
                  placeholder={t("Upload Image 6")}
                  value={formData.image6 ? formData.image6 : ""}
                  onClick={() => handleUploadClick(image6Ref)}
                />
              </div>
              {/* First Color */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("First Color")}</label>
                <TextInput
                  value={formData.first_color}
                  onChange={handleTextChange}
                  placeholder={t("Enter First Color (e.g., #FFFFFF)")}
                  name="first_color"
                />
              </div>
              {/* Second Color */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Second Color")}</label>
                <TextInput
                  value={formData.second_color}
                  onChange={handleTextChange}
                  placeholder={t("Enter Second Color (e.g., #FFFFFF)")}
                  name="second_color"
                />
              </div>
              {/* Third Color */}
              <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                <label>{t("Third Color")}</label>
                <TextInput
                  value={formData.third_color}
                  onChange={handleTextChange}
                  placeholder={t("Enter Third Color (e.g., #FFFFFF)")}
                  name="third_color"
                />
              </div>
              {/* Continues Status */}
              <div className="sm:w-full lg:w-[30%] flex items-center justify-start gap-x-2">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Scroll Spy")}
                </span>
                <Switch
                  handleClick={handleSwitchChange}
                  checked={formData.continues_status === 1}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-x-4">
              <div>
                <SubmitButton
                  text={t("Change")}
                  rounded="rounded-full"
                  handleClick={handleChangeMainData}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AppSetupPage;