import React, { useEffect, useRef, useState } from "react";
import { useGet } from "../../../../../Hooks/useGet";
import { usePost } from "../../../../../Hooks/usePostJson";
import {
  Switch,
  TextInput,
  UploadInput,
  StaticLoader,
  SubmitButton,
  DropDown,
} from "../../../../../Components/Components";
import { useChangeState } from "../../../../../Hooks/useChangeState";
import { useTranslation } from "react-i18next";

const GeideaPayment = ({ payment, onStatusChange, refetch }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();

  // Fetch Geidea settings from dedicated endpoint
  const {
    refetch: refetchGeidea,
    loading: loadingGeidea,
    data: dataGeidea,
  } = useGet({ url: `${apiUrl}/admin/settings/payment_methods/geidia` });

  const { postData, loadingPost } = usePost({
    url: `${apiUrl}/admin/settings/payment_methods/geidia/update`,
  });

  const { changeState, loadingChange } = useChangeState();

  // Form state
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const LogoRef = useRef();

  const [geideaPublicKey, setGeideaPublicKey] = useState("");
  const [apiPassword, setApiPassword] = useState("");
  const [currentStatus, setCurrentStatus] = useState(payment?.status ?? 1);

  // Environment dropdown
  const environmentOptions = React.useMemo(() => [
    { name: t("egypt"), value: "egypt" },
    { name: t("saudi_arabia"), value: "saudi_arabia" },
    { name: t("uae"), value: "uae" },
  ], [t]);
  const [stateEnvironment, setStateEnvironment] = useState(t("SelectEnvironment"));
  const [environmentValue, setEnvironmentValue] = useState("");
  const [isOpenEnvironment, setIsOpenEnvironment] = useState(false);
  const dropDownEnvironmentRef = useRef();

  // Fetch on mount
  useEffect(() => {
    refetchGeidea();
  }, [refetchGeidea]);

  // Populate form from API response
  useEffect(() => {
    if (dataGeidea) {
      const d = dataGeidea;
      setName(d.name || payment?.name || "");
      setLogo(d.logo || payment?.logo_link || "");
      setLogoFile(d.logo || payment?.logo_link || null);
      setGeideaPublicKey(d.geidea_public_key || "");
      setApiPassword(d.api_password || "");
      setCurrentStatus(d.status ?? payment?.status ?? 1);

      const env = d.environment || "";
      if (env) {
        const selectedOption = environmentOptions.find(opt => opt.value === env);
        setStateEnvironment(selectedOption ? selectedOption.name : env);
        setEnvironmentValue(env);
      } else {
        setStateEnvironment(t("SelectEnvironment"));
        setEnvironmentValue("");
      }
    }
  }, [dataGeidea, environmentOptions, t, payment]);

  // Sync status from parent tab switching
  useEffect(() => {
    setCurrentStatus(payment?.status ?? 1);
  }, [payment]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogo(file.name);
    }
  };

  const handleImageClick = () => {
    if (LogoRef.current) LogoRef.current.click();
  };

  const handleOpenEnvironment = () => setIsOpenEnvironment((prev) => !prev);
  const handleCloseEnvironment = () => setIsOpenEnvironment(false);
  const handleSelectEnvironment = (option) => {
    setStateEnvironment(option.name);
    setEnvironmentValue(option.value);
  };

  const handleChangeStatus = async () => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const res = await changeState(
      `${apiUrl}/admin/settings/payment_methods/geidia/status?status=${newStatus}`,
      `${name} ${t("ChangedStatus")}`,
      { status: newStatus }
    );
    if (res) {
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange(payment?.id, newStatus);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("status", currentStatus);
    formData.append("geidea_public_key", geideaPublicKey);
    formData.append("api_password", apiPassword);
    formData.append("environment", environmentValue);
    if (logoFile && typeof logoFile !== "string") {
      formData.append("logo", logoFile);
    }

    const res = await postData(formData, t("GeideaUpdatedSuccess"));
    if (res) {
      if (refetch) refetch();
    }
  };

  if (loadingGeidea || loadingPost || loadingChange) {
    return (
      <div className="flex items-center justify-center w-full h-56">
        <StaticLoader />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-start w-full gap-4">

        {/* Header: name + status toggle + logo preview */}
        <div className="flex items-center w-full gap-x-4">
          <div className="flex items-center gap-x-2">
            <span className="p-2 text-2xl font-TextFontSemiBold text-mainColor">
              {payment?.name}:
            </span>
            <Switch
              checked={currentStatus === 1}
              handleClick={handleChangeStatus}
            />
          </div>
          <div className="flex justify-center">
            <img
              src={
                typeof logoFile === "string" && logoFile.startsWith("http")
                  ? logoFile
                  : payment?.logo_link
              }
              className="border-2 rounded-full bg-mainColor min-w-24 min-h-24 max-w-24 max-h-24 object-cover"
              alt="Geidea Logo"
            />
          </div>
        </div>

        {/* Name */}
        <div className="sm:w-full lg:w-[30%] flex flex-col items-start gap-y-1">
          <span className="text-xl font-TextFontRegular text-thirdColor">
            {t("Name")}:
          </span>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Name")}
          />
        </div>

        {/* Logo upload */}
        <div className="sm:w-full lg:w-[30%] flex flex-col items-start gap-y-1">
          <span className="text-xl font-TextFontRegular text-thirdColor">
            {t("GeideaLogo")}:
          </span>
          <UploadInput
            value={logo}
            uploadFileRef={LogoRef}
            placeholder={t("GeideaLogo")}
            handleFileChange={handleImageChange}
            onClick={handleImageClick}
          />
        </div>

        {/* Geidea Public Key */}
        <div className="sm:w-full lg:w-[30%] flex flex-col items-start gap-y-1">
          <span className="text-xl font-TextFontRegular text-thirdColor">
            {t("GeideaPublicKey")}:
          </span>
          <TextInput
            value={geideaPublicKey}
            onChange={(e) => setGeideaPublicKey(e.target.value)}
            placeholder={t("GeideaPublicKey")}
          />
        </div>

        {/* API Password */}
        <div className="sm:w-full lg:w-[30%] flex flex-col items-start gap-y-1">
          <span className="text-xl font-TextFontRegular text-thirdColor">
            {t("GeideaApiPassword")}:
          </span>
          <TextInput
            value={apiPassword}
            onChange={(e) => setApiPassword(e.target.value)}
            placeholder={t("GeideaApiPassword")}
          />
        </div>

        {/* Environment dropdown */}
        <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
          <span className="text-xl font-TextFontRegular text-thirdColor">
            {t("GeideaEnvironment")}:
          </span>
          <DropDown
            ref={dropDownEnvironmentRef}
            handleOpen={handleOpenEnvironment}
            stateoption={stateEnvironment}
            openMenu={isOpenEnvironment}
            handleOpenOption={handleCloseEnvironment}
            options={environmentOptions}
            onSelectOption={handleSelectEnvironment}
            border={false}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end w-full gap-x-4 mt-6">
        <div className="">
          <SubmitButton
            text={t("Edit")}
            rounded="rounded-full"
            handleClick={handleSubmit}
          />
        </div>
      </div>
    </form>
  );
};

export default GeideaPayment;
