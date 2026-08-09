import React, { useEffect, useRef, useState } from 'react'
import { StaticButton, StaticLoader, SubmitButton, Switch, TextInput, UploadInput } from '../../../../../Components/Components';
import { usePost } from '../../../../../Hooks/usePostJson';
import { useAuth } from '../../../../../Context/Auth';
import { useTranslation } from "react-i18next";
import { useGet } from '../../../../../Hooks/useGet';

const AddCitySection = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/city/add`
  });
  const { refetch: refetchTranslation, loading: loadingTranslation, data: dataTranslation } = useGet({
    url: `${apiUrl}/admin/translation`
  });
  const auth = useAuth();
  const { t, i18n } = useTranslation();
  const [taps, setTaps] = useState([])
  const [currentTap, setCurrentTap] = useState(0);

  const [cityName, setCityName] = useState([]);
  const [cityStatus, setCityStatus] = useState(0);

  useEffect(() => {
    refetchTranslation();
  }, [refetchTranslation]);

  useEffect(() => {
    if (dataTranslation) {
      setTaps(dataTranslation.translation);
    }
  }, [dataTranslation]);

  const handleTap = (index) => {
    setCurrentTap(index)
  }

  const handleCityStatus = () => {
    const currentState = cityStatus;
    { currentState === 0 ? setCityStatus(1) : setCityStatus(0) }
  }

  useEffect(() => {
    if (!loadingPost) {
      handleReset()
    }
    setUpdate(!update)
  }, [response])

  const handleReset = () => {
    setCurrentTap(0)
    setCityName([])
    cityName.map((name, index) => {
      setCityName(prev => {
        const updatedNames = [...prev];
        // Ensure the array is long enough
        if (updatedNames.length <= index) {
          updatedNames.length = index + 1; // Resize array
        }
        // Create or update the object at the current index
        updatedNames[index] = {
          ...updatedNames[index], // Retain existing properties if any
          'tranlation_id': '', // Use the ID from tap
          'city_name': '', // Use the captured string value
          'tranlation_name': '', // Use tap.name for tranlation_name
        };
        return updatedNames;
      });
    })

    setCityStatus(0)
  }

  const handleCityAdd = (e) => {
    e.preventDefault();

    if (cityName.length === 0) {
      auth.toastError(t('enterCityName'))
      return;
    }
    const formData = new FormData();
    cityName.forEach((name, index) => {
      // Corrected the typo and added translation_id and translation_name
      formData.append(`city_names[${index}][tranlation_id]`, name.tranlation_id);
      formData.append(`city_names[${index}][city_name]`, name.city_name);
      formData.append(`city_names[${index}][tranlation_name]`, name.tranlation_name);
    });

    formData.append('status', cityStatus);
    postData(formData, t('City Added Success'));

  };
  return (
    <>
      {loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleCityAdd}>
            {/* Taps */}
            <div className="flex items-center justify-start w-full py-2 gap-x-6">
              {taps.map((tap, index) => (
                <span
                  key={tap.id}
                  onClick={() => handleTap(index)}
                  className={`${currentTap === index ? 'text-mainColor border-b-4 border-mainColor' : 'text-thirdColor'}  pb-1 text-xl font-TextFontMedium transition-colors duration-300 cursor-pointer hover:text-mainColor`}
                >
                  {tap.name}
                </span>

              ))}
            </div>

            <div className="sm:py-3 lg:py-6">
              {taps.map((tap, index) => (
                currentTap === index && (
                  <div
                    className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                    key={tap.id}
                  >
                    {/* city Name */}
                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                      <span className="text-xl font-TextFontRegular text-thirdColor">{t("Name")} {tap.name}:</span>
                      <TextInput
                        value={cityName[index]?.city_name} // Access zone_names property
                        onChange={(e) => {
                          const inputValue = e.target.value; // Ensure this is a string
                          setCityName(prev => {
                            const updatedNames = [...prev];

                            // Ensure the array is long enough
                            if (updatedNames.length <= index) {
                              updatedNames.length = index + 1; // Resize array
                            }

                            // Create or update the object at the current index
                            updatedNames[index] = {
                              ...updatedNames[index], // Retain existing properties if any
                              'tranlation_id': tap.id, // Use the ID from tap
                              'city_name': inputValue, // Use the captured string value
                              'tranlation_name': tap.name || 'Default Name', // Use tap.name for tranlation_name
                            };

                            return updatedNames;
                          });
                        }}
                        placeholder={t("City Name")}
                      />
                    </div>
                    {/* Conditional Rendering for First Tab Only */}
                    {currentTap === 0 && (
                      <>
                        <div className="sm:w-full xl:w-[30%] flex items-start justify-start gap-x-1 pt-10">
                          <div className='flex items-center justify-start w-2/4 gap-x-1'>
                            <span className="text-xl font-TextFontRegular text-thirdColor">{t("Active")}:</span>
                            <Switch handleClick={handleCityStatus} checked={cityStatus} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              ))}
            </div>
            {/* Buttons*/}
            < div className="flex items-center justify-end w-full gap-x-4" >
              <div className="">
                <StaticButton text={t('Reset')} handleClick={handleReset} bgColor='bg-transparent' Color='text-mainColor' border={'border-2'} borderColor={'border-mainColor'} rounded='rounded-full' />
              </div>
              <div className="">
                <SubmitButton
                  text={t('Submit')}
                  rounded='rounded-full'
                  handleClick={handleCityAdd}
                />
              </div>

            </div>
          </form>
        </section>
      )}
    </>
  )
}

export default AddCitySection