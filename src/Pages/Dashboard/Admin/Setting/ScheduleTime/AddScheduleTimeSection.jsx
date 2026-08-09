import React, { useEffect, useRef, useState } from "react";
import {
  DropDown,
  NumberInput,
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
import { useTranslation } from "react-i18next";

const AddScheduleTimeSection = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const {
    refetch: refetchTranslation,
    loading: loadingTranslation,
    data: dataTranslation,
  } = useGet({
    url: `${apiUrl}/admin/translation`,
  });

  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/schedule_time_slot/add`,
  });
  const { t, i18n } = useTranslation();

  const auth = useAuth();
  const [taps, setTaps] = useState([]);

  const [currentTap, setCurrentTap] = useState(0);
  const [scheduleName, setScheduleName] = useState([]);
  const [status, setStatus] = useState(0);

  useEffect(() => {
    refetchTranslation(); // Refetch data when the component mounts
  }, [refetchTranslation]);

  useEffect(() => {
    if (dataTranslation) {
      setTaps(dataTranslation.translation);
    }
  }, [dataTranslation]);

  const HandleStatusSchedule = () => {
    const currentState = status;
    {
      currentState === 0 ? setStatus(1) : setStatus(0);
    }
  };
  const handleTap = (index) => {
    setCurrentTap(index);
  };

  useEffect(() => {
    if (!loadingPost) {
      setStatus(0);
    }
    // refetchCategory()
    setUpdate(!update);
  }, [response]);

  const handleReset = () => {
    scheduleName.map((name, index) => {
      setScheduleName((prev) => {
        const updatedNames = [...prev];

        // Ensure the array is long enough
        if (updatedNames.length <= index) {
          updatedNames.length = index + 1; // Resize array
        }

        // Create or update the object at the current index
        updatedNames[index] = {
          ...updatedNames[index], // Retain existing properties if any
          tranlation_id: "", // Use the ID from tap
          name: "", // Use the captured string value
          tranlation_name: "", // Use tap.name for tranlation_name
        };

        return updatedNames;
      });
    });

    setStatus(0);
  };

  const handleCategoryAdd = (e) => {
    e.preventDefault();

    if (scheduleName.length === 0) {
      auth.toastError(t("please Enter Schedule Times"));
      return;
    }

    const formData = new FormData();
    scheduleName.forEach((name, index) => {
      // Corrected the typo and added translation_id and translation_name
      formData.append(
        `slot_names[${index}][tranlation_id]`,
        name.tranlation_id
      );
      formData.append(`slot_names[${index}][name]`, name.name);
      formData.append(
        `slot_names[${index}][tranlation_name]`,
        name.tranlation_name
      );
    });

    formData.append("status", status);
    postData(formData, t("Schedule Time Added Success"));
  };
  return (
    <>
      {loadingTranslation || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleCategoryAdd}>
            {/* Taps */}
            <div className="flex items-center justify-start w-full py-2 gap-x-6">
              {taps.map((tap, index) => (
                <span
                  key={tap.id}
                  onClick={() => handleTap(index)}
                  className={`${
                    currentTap === index
                      ? "text-mainColor border-b-4 border-mainColor"
                      : "text-thirdColor"
                  }  pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                >
                  {tap.name}
                </span>
              ))}
            </div>
            {/* Content*/}
            <div className="sm:py-3 lg:py-6">
              {taps.map(
                (tap, index) =>
                  currentTap === index && (
                    <div
                      className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                      key={tap.id}
                    >
                      {/* Name Input */}
                      <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                          {t("Name")} {tap.name}:
                        </span>
                        <TextInput
                          value={scheduleName[index]?.name} // Access category_name property
                          onChange={(e) => {
                            const inputValue = e.target.value; // Ensure this is a string
                            setScheduleName((prev) => {
                              const updatedNames = [...prev];
                              // Ensure the array is long enough
                              if (updatedNames.length <= index) {
                                updatedNames.length = index + 1; // Resize array
                              }
                              // Create or update the object at the current index
                              updatedNames[index] = {
                                ...updatedNames[index], // Retain existing properties if any
                                tranlation_id: tap.id, // Use the ID from tap
                                name: inputValue, // Use the captured string value
                                tranlation_name: tap.name || "Default Name", // Use tap.name for tranlation_name
                              };

                              return updatedNames;
                            });
                          }}
                          placeholder={t("Schedule Time")}
                        />
                      </div>

                      {/* Conditional Rendering for First Tab Only */}
                      {currentTap === 0 && (
                        <>
                          <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-8">
                            <div className="flex items-center justify-start w-2/4 gap-x-1">
                              <span className="text-xl font-TextFontRegular text-thirdColor">
                                {t("Status")}:
                              </span>
                              <Switch
                                handleClick={HandleStatusSchedule}
                                checked={status}
                              />
                            </div>
                          </div>
                        </>
                      )}
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
                  handleClick={handleCategoryAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddScheduleTimeSection;
