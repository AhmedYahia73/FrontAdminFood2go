import React, { useEffect, useRef, useState } from "react";
import {
  DropDown,
  EmailInput,
  NumberInput,
  PasswordInput,
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
  TimeInput,
  TitlePage,
  UploadInput,
  MapPreview,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useGet } from "../../../../../Hooks/useGet";
import { useTranslation } from "react-i18next";

const AddBannerSection = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchCities,
    loading: loadingCities,
    data: dataCities,
  } = useGet({
    url: `${apiUrl}/admin/settings/city`,
  });
  const {
    refetch: refetchTranslation,
    loading: loadingTranslation,
    data: dataTranslation,
  } = useGet({
    url: `${apiUrl}/admin/translation`,
  });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/branch/add`,
  });
  const { t, i18n } = useTranslation();

  const dropDownCities = useRef();
  const ImageRef = useRef();
  const CoverRef = useRef();
  const auth = useAuth();
  const [taps, setTaps] = useState([]);
  const [currentTap, setCurrentTap] = useState(0);

  const [cities, setCities] = useState([]);

  const [branchName, setBranchName] = useState([]);
  const [branchAddress, setBranchAddress] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchPassword, setBranchPassword] = useState("");
  const [foodPreparationTime, setFoodPreparationTime] = useState("00:00");
  const [branchLatitude, setBranchLatitude] = useState("");
  const [branchLongitude, setBranchLongitude] = useState("");
  const [branchCoverage, setBranchCoverage] = useState("");

  const [activeBranch, setActiveBranch] = useState(1);
  const [activeBranchPhone, setActiveBranchPhone] = useState(0);
  const [notActiveReason, setNotActiveReason] = useState("");

  const [stateCity, setStateCity] = useState(t("Select City"));
  const [cityId, setCityId] = useState("");
  const [isOpenCity, setIsOpenCity] = useState(false);

  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [cover, setCover] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    refetchCities(); // Refetch data when the component mounts
    refetchTranslation(); // Refetch data when the component mounts
  }, [refetchCities, refetchTranslation]);

  useEffect(() => {
    if (dataTranslation) {
      setTaps(dataTranslation.translation);
    }
  }, [dataTranslation]);

  useEffect(() => {
    if (dataCities) {
      setCities([{ id: "", name: t("Select City") }, ...dataCities.cities] || []);
    }
  }, [dataCities]);

  const handleTap = (index) => {
    setCurrentTap(index);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(file.name);
    }
  };
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCover(file.name);
    }
  };

  const handleImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };
  const handleCoverClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handleOpenCities = () => setIsOpenCity(!isOpenCity);
  const handleOpenOptionCites = () => setIsOpenCity(false);

  const handleSelectCity = (option) => {
    setCityId(option.id);
    setStateCity(option.name);
  };

  const handleStatusBranch = () => {
    const currentState = activeBranch;
    {
      currentState === 0 ? setActiveBranch(1) : setActiveBranch(0);
    }
  };
  const handleStatusBranchPhone = () => {
    const currentState = activeBranchPhone;
    {
      currentState === 0 ? setActiveBranchPhone(1) : setActiveBranchPhone(0);
    }
  };

  useEffect(() => {
    if (!loadingPost) {
      handleReset();
    }
    // refetchCategory()
  }, [response]);

  const handleTimeChange = (e) => {
    const timeValue = e.target.value; // This will always be in "hh:mm" format from the browser
    setFoodPreparationTime(timeValue); // Save it directly
  };

  const handleReset = () => {
    setBranchName([]);
    branchName.map((name, index) => {
      setBranchName((prev) => {
        const updatedNames = [...prev];

        // Ensure the array is long enough
        if (updatedNames.length <= index) {
          updatedNames.length = index + 1; // Resize array
        }

        // Create or update the object at the current index
        updatedNames[index] = {
          ...updatedNames[index], // Retain existing properties if any
          tranlation_id: "", // Use the ID from tap
          branch_name: "", // Use the captured string value
          tranlation_name: "", // Use tap.name for tranlation_name
        };

        return updatedNames;
      });
    });
    setBranchAddress("");
    setBranchEmail("");
    setBranchPhone("");
    setBranchPassword("");
    setFoodPreparationTime("00:00");
    setBranchLatitude("");
    setBranchLongitude("");
    setBranchCoverage("");
    setActiveBranch(1);
    setActiveBranchPhone(0);
    setNotActiveReason("");
    setStateCity(t("Select City"));
    setCityId("");
    setIsOpenCity(false);
    setImage("");
    setImageFile(null);
    setCover("");
    setCoverFile(null);
    setCurrentTap(0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (
        dropDownCities.current &&
        !dropDownCities.current.contains(event.target)
      ) {
        setIsOpenCity(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBranchAdd = (e) => {
    e.preventDefault();

    if (branchName.length === 0) {
      auth.toastError(t("please Enter Branch Names"));
      return;
    }

    if (!branchAddress) {
      auth.toastError(t("Please Enter Branch Address"));
      return;
    }
    if (!branchPhone) {
      auth.toastErrort(t("Please Enter Branch Phone"));
      return;
    }
    if (!branchEmail) {
      auth.toastError(t("Please Enter Branch Email"));
      return;
    }
    if (!branchEmail.includes("@")) {
      auth.toastError(t("Please Add @ after branch email"));
      return;
    }
    if (!branchPassword) {
      auth.toastError(t("Please Enter Branch Password"));
      return;
    }
    if (!branchCoverage) {
      auth.toastError(t("Please Enter Branch Coverage"));
      return;
    }
    if (!cityId) {
      auth.toastError(t("Please Select City"));
      return;
    }
    if (!branchLatitude) {
      auth.toastError(t("Please Enter Branch Latitude"));
      return;
    }
    if (!branchLongitude) {
      auth.toastError(t("Please Enter Branch Longitude"));
      return;
    }
    if (foodPreparationTime == "00:00") {
      auth.toastError(t("Please Enter Food Preparion Time"));
      return;
    }
    if (!imageFile) {
      auth.toastError(t("Please Enter Image"));
      return;
    }
    if (!coverFile) {
      auth.toastError(t("Please Enter Cover File"));
      return;
    }
    if (activeBranch === 0 && !notActiveReason) {
      auth.toastError(t("Please Enter Branch Not Active Reason"));
      return;
    }

    const formData = new FormData();

    formData.append("address", branchAddress);
    formData.append("email", branchEmail);
    formData.append("phone", branchPhone);
    formData.append("password", branchPassword);
    formData.append("food_preparion_time", foodPreparationTime);
    formData.append("latitude", branchLatitude);
    formData.append("longitude", branchLongitude);
    formData.append("coverage", branchCoverage * 1000); // Convert KM to meters for backend
    formData.append("city_id", cityId);
    formData.append("status", activeBranch);
    formData.append("phone_status", activeBranchPhone);
    formData.append("image", imageFile);
    formData.append("cover_image", coverFile);
    {
      (activeBranch === 0 && notActiveReason) &&
        formData.append("block_reason", notActiveReason)
    }
    branchName.forEach((name, index) => {
      // Corrected the typo and added translation_id and translation_name
      formData.append(
        `branch_names[${index}][tranlation_id]`,
        name.tranlation_id
      );
      formData.append(`branch_names[${index}][branch_name]`, name.branch_name);
      formData.append(
        `branch_names[${index}][tranlation_name]`,
        name.tranlation_name
      );
    });

    postData(formData, t("Branch Added Success"));
  };
  return (
    <>
      {loadingCities || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section className="flex flex-col mb-20">
          <TitlePage text={t("AddNewBranch")} />
          <form onSubmit={handleBranchAdd}>
            {/* Taps */}
            <div className="flex items-center justify-start w-full py-2 gap-x-6">
              {taps.map((tap, index) => (
                <span
                  key={tap.id}
                  onClick={() => handleTap(index)}
                  className={`${currentTap === index
                    ? "text-mainColor border-b-4 border-mainColor"
                    : "text-thirdColor"
                    }  pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                >
                  {tap.name}
                </span>
              ))}
            </div>
            {/* Content*/}
            <div className="py-3">
              {taps.map(
                (tap, index) =>
                  currentTap === index && (
                    <div
                      className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                      key={tap.id}
                    >
                      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {/* Branch Name */}
                        <div className="flex flex-col items-start justify-center w-full gap-y-1">
                          <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Name")} {tap.name}:
                          </span>
                          <TextInput
                            value={branchName[index]?.branch_name} // Access zone_names property
                            onChange={(e) => {
                              const inputValue = e.target.value; // Ensure this is a string
                              setBranchName((prev) => {
                                const updatedNames = [...prev];

                                // Ensure the array is long enough
                                if (updatedNames.length <= index) {
                                  updatedNames.length = index + 1; // Resize array
                                }

                                // Create or update the object at the current index
                                updatedNames[index] = {
                                  ...updatedNames[index], // Retain existing properties if any
                                  tranlation_id: tap.id, // Use the ID from tap
                                  branch_name: inputValue, // Use the captured string value
                                  tranlation_name: tap.name || "Default Name", // Use tap.name for tranlation_name
                                };

                                return updatedNames;
                              });
                            }}
                            placeholder={t("BranchName")}
                          />
                        </div>

                        {currentTap === 0 && (
                          <>
                            {/* Branch Address */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("BranchAddress")}:
                              </span>
                              <TextInput
                                value={branchAddress}
                                onChange={(e) =>
                                  setBranchAddress(e.target.value)
                                }
                                placeholder={t("BranchAddress")}
                              />
                            </div>
                            {/* Branch Phone */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("BranchPhone")}:
                              </span>
                              <NumberInput
                                value={branchPhone}
                                onChange={(e) => setBranchPhone(e.target.value)}
                                placeholder={t("BranchPhone")}
                              />
                            </div>
                            {/* Branch Email */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("BranchEmail")}:
                              </span>
                              <TextInput
                                // backgound='white'
                                value={branchEmail}
                                onChange={(e) => setBranchEmail(e.target.value)}
                                placeholder={t("BranchEmail")}
                              />
                            </div>
                            {/* Branch Password */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("BranchPassword")}:
                              </span>
                              <PasswordInput
                                backgound="white"
                                value={branchPassword}
                                onChange={(e) =>
                                  setBranchPassword(e.target.value)
                                }
                                placeholder={t("BranchPassword")}
                              />
                            </div>
                            {/* Cities */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("City")}:
                              </span>
                              <DropDown
                                ref={dropDownCities}
                                handleOpen={handleOpenCities}
                                stateoption={stateCity}
                                openMenu={isOpenCity}
                                handleOpenOption={handleOpenOptionCites}
                                onSelectOption={handleSelectCity}
                                options={cities}
                                border={false}
                              />
                            </div>
                            {/* Branch Latitude */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("BranchLatitude")}:
                              </span>
                              <TextInput
                                value={branchLatitude}
                                onChange={(e) =>
                                  setBranchLatitude(e.target.value)
                                }
                                placeholder={t("BranchLatitude")}
                              />
                            </div>
                            {/* Branch Longitude */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("BranchLongitude")}:
                              </span>
                              <TextInput
                                value={branchLongitude}
                                onChange={(e) =>
                                  setBranchLongitude(e.target.value)
                                }
                                placeholder={t("BranchLongitude")}
                              />
                            </div>
                            {/* Branch Coverage */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("BranchCoverage")} ({t("km")}):
                              </span>
                              <NumberInput
                                value={branchCoverage}
                                onChange={(e) =>
                                  setBranchCoverage(e.target.value)
                                }
                                placeholder={`${t("BranchCoverage")} (${t("km")})`}
                              />
                            </div>
                            <div className="w-full col-span-1 md:col-span-2 xl:col-span-3">
                              <MapPreview
                                lat={branchLatitude}
                                lng={branchLongitude}
                                radius={branchCoverage}
                                onLocationSelect={(lat, lng) => {
                                  setBranchLatitude(lat);
                                  setBranchLongitude(lng);
                                }}
                              />
                            </div>
                            {/* Branch Preparion Time */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("FoodPreparationTime")}:
                              </span>
                              <CustomTimeInput
                                value={foodPreparationTime}
                                onChange={(newTime) =>
                                  setFoodPreparationTime(newTime)
                                }
                              />
                            </div>
                            {/* Branch Image */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
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
                            {/* Banner Cover Image */}
                            <div className="flex flex-col items-start justify-center w-full gap-y-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("CoverImage")}:
                              </span>
                              <UploadInput
                                value={cover}
                                uploadFileRef={CoverRef}
                                placeholder={t("CoverImage")}
                                handleFileChange={handleCoverChange}
                                onChange={(e) => setCover(e.target.value)}
                                onClick={() => handleCoverClick(CoverRef)}
                              />
                            </div>
                            <div className="flex items-center justify-start w-full gap-3">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Active")}:
                              </span>
                              <Switch
                                handleClick={handleStatusBranch}
                                checked={activeBranch}
                              />
                            </div>
                            {/* Branch Not Active Reason */}
                            {
                              activeBranch === 0 && (
                                <div className="flex flex-col items-start justify-center w-full gap-y-1">
                                  <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("BranchNotActiveReason")}:
                                  </span>
                                  <TextInput
                                    value={notActiveReason}
                                    onChange={(e) =>
                                      setNotActiveReason(e.target.value)
                                    }
                                    placeholder={t("Reason")}
                                  />
                                </div>
                              )}
                            <div className="flex items-center justify-start w-full gap-3">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("ActiveBranchPhone")}:
                              </span>
                              <Switch
                                handleClick={handleStatusBranchPhone}
                                checked={activeBranchPhone}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
              )}
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
                  handleClick={handleBranchAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

const CustomTimeInput = ({ value, onChange }) => {
  const { t } = useTranslation()
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  ); // Pad hours to 2 digits
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  ); // Pad minutes to 2 digits

  const handleTimeChange = (type, newValue) => {
    const [currentHours, currentMinutes] = value.split(":");
    const updatedTime =
      type === "hours"
        ? `${newValue}:${currentMinutes}`
        : `${currentHours}:${newValue}`;
    onChange(updatedTime); // Ensure value is always in HH:mm format
  };

  return (
    <div className="flex gap-2">
      <span className="text-xl font-TextFontRegular text-thirdColor">
        {t("Hours")}:
      </span>
      <select
        value={value.split(":")[0]} // Get hours part from the value
        onChange={(e) => handleTimeChange("hours", e.target.value)}
        className="px-2 py-1 border rounded"
      >
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span className="text-xl font-TextFontRegular text-thirdColor">
        {t("Minutes")}:
      </span>
      <select
        value={value.split(":")[1]} // Get minutes part from the value
        onChange={(e) => handleTimeChange("minutes", e.target.value)}
        className="px-2 py-1 border rounded"
      >
        {minutes.map((minute) => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AddBannerSection;
