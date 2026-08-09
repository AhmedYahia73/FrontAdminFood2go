import React, { useEffect, useRef, useState } from "react";
import {
  EmailInput,
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
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";

const AddAdminSection = ({ update, setUpdate, dataPositions }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/admin/add`,
  });

  const auth = useAuth();
  const ImageRef = useRef();
  const IdentityImageRef = useRef();

  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [adminPositions, setAdminPositions] = useState([]);
  const [adminPositionSelected, setAdminPositionSelected] = useState(null);
  const { t, i18n } = useTranslation();

  const [identityTypes, setIdentityTypes] = useState([
    { name: "Identity Card" },
    { name: "Passport" },
  ]);
  const [identityTypeSelected, setIdentityTypeSelected] = useState(null);

  const [identityNumber, setIdentityNumber] = useState("");

  const [identityImage, setIdentityImage] = useState("");
  const [identityImageFile, setIdentityImageFile] = useState(null);

  const [adminImage, setAdminImage] = useState("");
  const [adminImageFile, setAdminImageFile] = useState(null);

  const [adminStatus, setAdminStatus] = useState(0);

  useEffect(() => {
    setAdminPositions(dataPositions);
  }, [dataPositions]);

  const handleAdminImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdminImageFile(file);
      setAdminImage(file.name);
    }
  };
  const handleAdminImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handleIdentityImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdentityImageFile(file);
      setIdentityImage(file.name);
    }
  };
  const handleIdentityImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };
  const handleAdminStatus = () => {
    const currentActive = adminStatus;
    {
      currentActive === 0 ? setAdminStatus(1) : setAdminStatus(0);
    }
  };

  const handleReset = () => {
    setAdminName("");
    setAdminPhone("");
    setAdminEmail("");
    setAdminPassword("");

    // setAdminPositionState('');
    setAdminPositionSelected(null);

    setAdminImage("");
    setAdminImageFile(null);

    setAdminStatus(0);
  };

  useEffect(() => {
    if (!loadingPost) {
      handleReset();
      setUpdate(!update);
    }
  }, [response]);

  const handleAdminAdd = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", adminName);
    formData.append("phone", adminPhone);
    formData.append("email", adminEmail);
    formData.append("password", adminPassword);

    formData.append("image", adminImageFile);

    formData.append("user_position_id", adminPositionSelected.id);
    formData.append("status", adminStatus);

    postData(formData, t("Admin Added Success"));
  };

  return (
    <>
      {loadingPost ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <>
          <form
            className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row"
            onSubmit={handleAdminAdd}
          >
            {/* First Name */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Name")}:
              </span>
              <TextInput
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder={t("Name")}
              />
            </div>
            {/* admin Phone */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Phone")}:
              </span>
              <NumberInput
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder={t("Phone")}
              />
            </div>
            {/* Admin Image */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Image")}:
              </span>
              <UploadInput
                value={adminImage}
                uploadFileRef={ImageRef}
                placeholder={t("Image")}
                handleFileChange={handleAdminImageChange}
                onChange={(e) => setAdminImage(e.target.value)}
                onClick={() => handleAdminImageClick(ImageRef)}
              />
            </div>
            {/* Email */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Email")}:
              </span>
              <EmailInput
                backgound="white"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
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
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={t("Password")}
              />
            </div>
            {/* Admin Positions */}
            <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Roles")}:
              </span>
              <Dropdown
                value={adminPositionSelected}
                onChange={(e) => setAdminPositionSelected(e.value)}
                options={adminPositions}
                optionLabel="name"
                placeholder={t("SelectRole")}
                className="w-full text-xl text-secoundColor font-TextFontMedium"
              />
            </div>

            {/* admin Status */}
            <div className="xl:w-[30%] flex items-center justify-start mt-4 gap-x-4 ">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                {t("Active")}:
              </span>
              <Switch handleClick={handleAdminStatus} checked={adminStatus} />
            </div>

            {/* Buttons */}
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
                  text={t("Add")}
                  rounded="rounded-full"
                  handleClick={handleAdminAdd}
                />
              </div>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default AddAdminSection;
