import React, { useEffect, useRef, useState } from 'react'
import { DropDown, NumberInput, StaticButton, StaticLoader, SubmitButton, Switch, TextInput } from '../../../../../Components/Components';
import { usePost } from '../../../../../Hooks/usePostJson';
import { useAuth } from '../../../../../Context/Auth';
import { useGet } from '../../../../../Hooks/useGet';
import { useTranslation } from "react-i18next";

const AddZoneSection = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch: refetchTranslation, loading: loadingTranslation, data: dataTranslation } = useGet({
    url: `${apiUrl}/admin/translation`
  });
  const { refetch: refetchCities, loading: loadingCities, data: dataCities } = useGet({
    url: `${apiUrl}/admin/settings/city`
  });
  const { refetch: refetchBranches, loading: loadingBranches, data: dataBranches } = useGet({ url: `${apiUrl}/admin/branch` });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/zone/add`
  });

  const dropDownCities = useRef();
  const dropDownBranches = useRef();
  const auth = useAuth();
  const [taps, setTaps] = useState([])
  const [currentTap, setCurrentTap] = useState(0);
  const { t, i18n } = useTranslation();


  const [cities, setCities] = useState([])
  const [branches, setBranches] = useState([])
  const [filterBranches, setFilterBranches] = useState([])

  const [zoneName, setZoneName] = useState([]);
  const [zonePrice, setZonePrice] = useState('');

  const [stateCity, setStateCity] = useState(t("Select City"));
  const [cityId, setCityId] = useState('');
  const [isOpenCity, setIsOpenCity] = useState(false);

  const [stateBranch, setStateBranch] = useState(t("Select Branch"));
  const [branchId, setBranchId] = useState('');
  const [isOpenBranch, setIsOpenBranch] = useState(false);

  const [activeZone, setActiveZone] = useState(0);


  useEffect(() => {
    refetchTranslation(); // Refetch data when the component mounts
    refetchCities(); // Refetch data when the component mounts
    refetchBranches(); // Refetch data when the component mounts
  }, [refetchCities, refetchBranches, refetchTranslation]);


  useEffect(() => {
    if (dataTranslation) {
      setTaps(dataTranslation.translation);
    }
  }, [dataTranslation]);


  useEffect(() => {
    if (dataCities) {
      setCities([{ id: '', name: t('Select City') }, ...dataCities.cities] || []);
    }

    if (dataBranches) {
      setBranches([{ id: '', name: t('Select Branch') }, ...dataBranches.branches] || []);
    }
  }, [dataCities, dataBranches]);

  const handleTap = (index) => {
    setCurrentTap(index)
  }

  const handleOpenCities = () => {
    setIsOpenCity(!isOpenCity)
    setIsOpenBranch(false)
  };
  const handleOpenOptionCities = () => setIsOpenCity(false);

  const handleSelectCity = (option) => {
    setCityId(option.id);
    setStateCity(option.name);

    setStateBranch(t('Select Branch'))
    setBranchId('');

    const filterBranchs = branches.filter((branch, index) => branch.city_id == option.id);
    setFilterBranches(filterBranchs)
  };

  const handleOpenBranches = () => {
    setIsOpenCity(false)
    setIsOpenBranch(!isOpenBranch)
  };
  const handleOpenOptionBranches = () => setIsOpenBranch(false);

  const handleSelectBranch = (option) => {
    setBranchId(option.id);
    setStateBranch(option.name);
  };

  const handleStatusZone = () => {
    const currentState = activeZone;
    { currentState === 0 ? setActiveZone(1) : setActiveZone(0) }
  }


  useEffect(() => {
    if (!loadingPost) {
      handleReset()
    }
    // refetchCategory()
    setUpdate(!update)
  }, [response])

  const handleReset = () => {
    setCurrentTap(0)
    setZoneName([])
    zoneName.map((name, index) => {
      setZoneName(prev => {
        const updatedNames = [...prev];

        // Ensure the array is long enough
        if (updatedNames.length <= index) {
          updatedNames.length = index + 1; // Resize array
        }

        // Create or update the object at the current index
        updatedNames[index] = {
          ...updatedNames[index], // Retain existing properties if any
          'tranlation_id': '', // Use the ID from tap
          'zone_name': '', // Use the captured string value
          'tranlation_name': '', // Use tap.name for tranlation_name
        };

        return updatedNames;
      });
    })
    setZonePrice('')
    setStateCity(t('Select City'))
    setCityId('')
    setIsOpenCity(false)
    setStateBranch(t('Select Branch'))
    setBranchId('')
    setIsOpenBranch(false)
    setActiveZone(0)
  }



  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (
        dropDownCities.current && !dropDownCities.current.contains(event.target) &&
        dropDownBranches.current && !dropDownBranches.current.contains(event.target)
      ) {
        setIsOpenCity(null);
        setIsOpenBranch(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const handleZoneAdd = (e) => {
    e.preventDefault();

    if (zoneName.length === 0) {
      auth.toastError(t('please Enter Zone Names'))
      return;
    }

    if (!zonePrice) {
      auth.toastError(t('Please Enter Zone Price'))
      return;
    }
    if (!cityId) {
      auth.toastError(t('Please Select City'))
      return;
    }
    // if (!branchId) {
    //   auth.toastError('Please Select Branch')
    //   return;
    // }


    const formData = new FormData();
    zoneName.forEach((name, index) => {
      // Corrected the typo and added translation_id and translation_name
      formData.append(`zone_names[${index}][tranlation_id]`, name.tranlation_id);
      formData.append(`zone_names[${index}][zone_name]`, name.zone_name);
      formData.append(`zone_names[${index}][tranlation_name]`, name.tranlation_name);
    });

    formData.append('city_id', cityId)
    formData.append('branch_id', branchId)
    formData.append('price', zonePrice)
    formData.append('status', activeZone)

    postData(formData, t('Zone Added Success'));

  };
  return (
    <>
      {loadingCities || loadingBranches || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleZoneAdd}>
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
            {/* Content*/}
            <div className="sm:py-3 lg:py-6">
              {taps.map((tap, index) => (
                currentTap === index && (
                  <div
                    className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                    key={tap.id}
                  >
                    {/* Zone Name */}
                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                      <span className="text-xl font-TextFontRegular text-thirdColor">{t("Name")} {tap.name}:</span>
                      <TextInput
                        value={zoneName[index]?.zone_name} // Access zone_names property
                        onChange={(e) => {
                          const inputValue = e.target.value; // Ensure this is a string
                          setZoneName(prev => {
                            const updatedNames = [...prev];

                            // Ensure the array is long enough
                            if (updatedNames.length <= index) {
                              updatedNames.length = index + 1; // Resize array
                            }

                            // Create or update the object at the current index
                            updatedNames[index] = {
                              ...updatedNames[index], // Retain existing properties if any
                              'tranlation_id': tap.id, // Use the ID from tap
                              'zone_name': inputValue, // Use the captured string value
                              'tranlation_name': tap.name || 'Default Name', // Use tap.name for tranlation_name
                            };

                            return updatedNames;
                          });
                        }}
                        placeholder={t("ZoneName")}
                      />
                    </div>

                    {/* Conditional Rendering for First Tab Only */}
                    {currentTap === 0 && (
                      <>
                        {/* Zone Price */}
                        < div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                          <span className="text-xl font-TextFontRegular text-thirdColor">{t("ZonePrice")}:</span>
                          <NumberInput
                            value={zonePrice}
                            onChange={(e) => setZonePrice(e.target.value)}
                            placeholder={t("ZonePrice")}
                          />
                        </div>
                        {/* Cities */}
                        < div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1" >
                          <span className="text-xl font-TextFontRegular text-thirdColor">{t("City")}:</span>
                          <DropDown
                            ref={dropDownCities}
                            handleOpen={handleOpenCities}
                            stateoption={stateCity}
                            openMenu={isOpenCity}
                            handleOpenOption={handleOpenOptionCities}
                            onSelectOption={handleSelectCity}
                            options={cities}
                            border={false}
                          />
                        </div>
                        {/* Branches */}
                        <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                          <span className="text-xl font-TextFontRegular text-thirdColor">{t("Branch")}:</span>
                          <DropDown
                            ref={dropDownBranches}
                            handleOpen={handleOpenBranches}
                            stateoption={stateBranch}
                            openMenu={isOpenBranch}
                            handleOpenOption={handleOpenOptionBranches}
                            onSelectOption={handleSelectBranch}
                            options={filterBranches}
                            border={false}
                          />
                        </div>
                        <div className="sm:w-full xl:w-[30%] flex items-center justify-start gap-3 pt-10">
                          <span className="text-xl font-TextFontRegular text-thirdColor">{t("Active")}:</span>
                          <Switch handleClick={handleStatusZone} checked={activeZone} />
                        </div>
                      </>
                    )}
                  </div>
                )
              ))}
            </div>
            {/* Buttons*/}
            < div className="flex items-center justify-end w-full mt-5 gap-x-4" >
              <div className="">
                <StaticButton text={t('Reset')} handleClick={handleReset} bgColor='bg-transparent' Color='text-mainColor' border={'border-2'} borderColor={'border-mainColor'} rounded='rounded-full' />
              </div>
              <div className="">
                <SubmitButton
                  text={t('Submit')}
                  rounded='rounded-full'
                  handleClick={handleZoneAdd}
                />
              </div>

            </div >
          </form >
        </section >
      )}
    </>
  )
}

export default AddZoneSection