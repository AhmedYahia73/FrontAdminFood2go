import React, { useEffect, useRef, useState } from "react";
import {
  DateInput,
  DropDown,
  EmailInput,
  LoaderLogin,
  NumberInput,
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
  TitleSection,
  UploadInput,
} from "../../../../Components/Components";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from 'react-i18next';

import moment from "moment-timezone";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useAuth } from "../../../../Context/Auth";

const BusinessSettingsPage = () => {
  const LogoRef = useRef();
  const coverImageRef = useRef();
  const IconRef = useRef();
  const { t, i18n } = useTranslation();

  const auth = useAuth();
  const CountriesRef = useRef();
  const TimeZoneRef = useRef();
  const TimeFormatRef = useRef();
  const CurrencyRef = useRef();

  const [maintenanceMode, setMaintenanceMode] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAlternativePhone, setCompanyAlternativePhone] = useState("");
  const [companyWhatsapp, setCompanyWhatsapp] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  const [androidLink, setAndroidLink] = useState("");
  const [iosLink, setIosLink] = useState("");
  const [orderActive, setOrderAcive] = useState(0);
  const [androidActive, setAndroidActive] = useState(0);
  const [iosActive, setIOSAcive] = useState(0);
  const [mapActive, setMapActive] = useState(0);

  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const [coverImage, setCoverImage] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);

  const [icon, setIcon] = useState("");
  const [iconFile, setIconFile] = useState(null);

  const [stateCountries, setStateCountries] = useState("Select Country");
  const [selectedCountry, setSelectedCountry] = useState("");

  const [countries, setCountries] = useState(
    [
      'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola',
      'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
      'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
      'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
      'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
      'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
      'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile',
      'China', 'Colombia', 'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of the',
      'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
      'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
      'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
      'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
      'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
      'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
      'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland',
      'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
      'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
      'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South',
      'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
      'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
      'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia',
      'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
      'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
      'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
      'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
      'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway',
      'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
      'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
      'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
      'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
      'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
      'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
      'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
      'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
      'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste',
      'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
      'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
      'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
      'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia',
      'Zimbabwe'
    ]
  );
  const [isOpenCountries, setIsOpenCountries] = useState(false);

  const [stateTimeZone, setStateTimeZone] = useState("Select Time Zone");
  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const [timeZone, setTimeZone] = useState([]);

  const [isOpenTimeZone, setIsOpenTimeZone] = useState(false);

  const [isOpenTimeFormat, setIsOpenTimeFormat] = useState(false);

  // const [stateCurrency, setStateCurrency] = useState('Select Currency');
  // const [currency, setCurrency] = useState([{ name: 'EGP' }, { name: 'USD' }, { name: 'GBP' }, { name: 'CAD' }]);
  // const [isOpenCurrency, setIsOpenCurrency] = useState(false);

  const [leftCurrency, setLeftCurrency] = useState(0);
  const [rightCurrency, setRightCurrency] = useState(0);

  const [companyCopyrightText, setCompanyCopyrightText] = useState("");

  const [stateTimeFormat, setStateTimeFormat] = useState("Select Time Format");
  const [selectedTimeFormat, setSelectedTimeFormat] = useState("");
  const [timeFormat, setTimeFormat] = useState([
    { name: "am/pm" },
    { name: "24hours" },
  ]);

  const [allSystem, setAllSystem] = useState(0);
  const [branchPanel, setBranchPanel] = useState(0);
  const [customerApp, setCustomerApp] = useState(0);
  const [webApp, setWebApp] = useState(0);
  const [deliverymanApp, setDeliverymanApp] = useState(0);
  const [preparationNumber, setPreparationNumber] = useState(0);

  const [forDay, setForDay] = useState(0);
  const [forWeek, setForWeek] = useState(0);
  const [untilChange, setUntilChange] = useState(0);
  const [Customize, setCustomize] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [websiteLink, setWebsiteLink] = useState("");
  const [qrCode, setQrCode] = useState("");

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchCompany,
    loading: loadingCompany,
    data: dataCompany,
  } = useGet({
    url: `${apiUrl}/admin/settings/business_setup/company`,
  });

  const {
    refetch: refetchCity,
    loading: loadingCity,
    data: dataCity,
  } = useGet({
    url: `${apiUrl}/admin/settings/city`
  });

  const [dataCompanyInfo, setDataCompanyInfo] = useState([]);

  const [dataCurrency, setDataCurrency] = useState([]);
  const [stateCurrency, setStateCurrency] = useState("Select Currency");
  const [currencyId, setCurrencyId] = useState("");
  const [isOpenCurrency, setIsOpenCurrency] = useState(false);
  const [dataMain, setDataMain] = useState([])
  const [dataMaintennance, setDataMaintenance] = useState({})
  const [formDataMaintenance, setFormDataMaintenance] = useState({});

  const [scale, setScale] = useState('')
  const [reportTime, setReportTime] = useState('')

  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/business_setup/company/add`,
  });

  useEffect(() => {
    refetchCompany();
    refetchCity();
  }, [refetchCompany, refetchCity]);


  useEffect(() => {
    if (dataCompany) {
      setCompanyName(dataCompany?.company_info?.name || '');
      setCompanyPhone(dataCompany?.company_info?.phone || '');
      setCompanyAlternativePhone(dataCompany?.company_info?.phone2 || '');
      setCompanyWhatsapp(dataCompany?.company_info?.watts || '');
      setCompanyEmail(dataCompany?.company_info?.email || '');
      setCompanyAddress(dataCompany?.company_info?.address || '');
      setIcon(dataCompany?.company_info?.fav_icon_link || '');
      setLogo(dataCompany?.company_info?.logo_link || '');
      setCoverImage(dataCompany?.company_info?.cover_app_image_link || '');
      setStateCountries(dataCompany?.company_info?.country || stateCountries);
      setSelectedCountry(dataCompany?.company_info?.country || selectedCountry)

      setAndroidLink(dataCompany?.company_info?.android_link || '')
      setIosLink(dataCompany?.company_info?.ios_link || '')
      setOrderAcive(dataCompany?.company_info?.order_online || 0)
      setAndroidActive(dataCompany?.company_info?.android_switch || 0)
      setIOSAcive(dataCompany?.company_info?.ios_switch || 0)
      setMapActive(dataCompany?.company_info?.show_map || 0)
      setPreparationNumber(dataCompany?.company_info?.preparation_num_status || 0)

      setStateTimeZone(dataCompany?.company_info?.time_zone || '');
      setSelectedTimeZone({ name: dataCompany?.company_info?.time_zone || '' });

      setSelectedTimeFormat(dataCompany?.company_info?.time_format || stateTimeFormat)
      setStateTimeFormat(dataCompany?.company_info?.time_format || stateTimeFormat)

      setDataMaintenance(dataCompany?.maintenance || {})
      setAllSystem(dataCompany?.maintenance?.all || 0)
      setBranchPanel(dataCompany?.maintenance?.branch || 0)
      setCustomerApp(dataCompany?.maintenance?.customer || 0)
      setWebApp(dataCompany?.maintenance?.web || 0)
      setDeliverymanApp(dataCompany?.maintenance?.delivery || 0)
      setForDay(dataCompany?.maintenance?.day || 0)
      setForWeek(dataCompany?.maintenance?.week || 0)
      setUntilChange(dataCompany?.maintenance?.until_change || 0)
      setCustomize(dataCompany?.maintenance?.customize || 0)
      setMaintenanceMode(dataCompany?.maintenance?.status || 0)
      setStartDate(dataCompany?.maintenance?.start_date || '')
      setEndDate(dataCompany?.maintenance?.end_date || '')
      setWebsiteLink(dataCompany?.website || '')
      setQrCode(dataCompany?.qr_code || '')
      setScale(dataCompany?.scale || '')
      setReportTime(dataCompany?.company_info?.report_time || 0)

      if (dataCompany.company_info.currency_id) {
        const matchedCurrency = dataCompany.currency.find(
          (curr) => curr.id === dataCompany.company_info.currency_id
        );

        if (matchedCurrency) {
          setStateCurrency(matchedCurrency.name);
          setCurrencyId(matchedCurrency.id);
        }
      }
      setCompanyCopyrightText(dataCompany.company_info.copy_right);
      if (dataCompany.company_info.currency_position === "right") {
        setLeftCurrency(0);
        setRightCurrency(1);
      } else {
        setLeftCurrency(1);
        setRightCurrency(0);
      }
    }
  }, [dataCompany]);

  const handelAddCompany = async (e) => {
    e.preventDefault();


    // Validation for required fields

    if (!companyName) {
      auth.toastError(t("Please enter companyName"));
      return;
    }
    if (!companyPhone) {
      auth.toastError(t("Please enter companyPhone"));
      return;
    }
    if (!companyEmail) {
      auth.toastError(t("Please enter companyEmail"));
      return;
    }
    if (!companyAddress) {
      auth.toastError(t("Please enter companyAddress"));
    }
    if (!logo) {
      auth.toastError(t("Please enter logo"));
    }
    if (!coverImage) {
      auth.toastError(t("Please enter cover app logo"));
      return;
    }
    if (!icon) {
      auth.toastError(t("Please enter icon"));
    }
    if (!selectedTimeZone) {
      auth.toastError(t("Please enter timeZone"));
    }
    if (!timeFormat) {
      auth.toastError(t("Please enter timeFormat"));
    }

    //      if (!currency) {
    //        auth.toastError('Please enter currency');
    //      }

    if (!companyCopyrightText) {
      auth.toastError(t("Please enter companyCopyrightText"));
    }


    if (leftCurrency === 0 && rightCurrency === 0) {
      auth.toastError(t("Please enter either leftCurrency or rightCurrency"));
    }

    if (maintenanceMode !== 0) {
      if (allSystem === 0 && branchPanel === 0 && customerApp === 0 && webApp === 0 && deliverymanApp === 0) {
        auth.toastError(t("Please select at least one system"));
        return;
      }
    }

    const updatedData = {
      status: maintenanceMode,
      all: allSystem,
      branch: branchPanel,
      customer: customerApp,
      web: webApp,
      delivery: deliverymanApp,
      day: forDay,
      week: forWeek,
      until_change: untilChange,
      customize: Customize,
    };

    if (Customize === 1) {
      updatedData.start_date = startDate;
      updatedData.end_date = endDate;
    }

    const formData = new FormData();
    formData.append("name", companyName);
    formData.append("phone", companyPhone);
    formData.append("phone2", companyAlternativePhone);
    formData.append("watts", companyWhatsapp);
    formData.append("email", companyEmail);
    formData.append("address", companyAddress);
    formData.append("address", companyAddress);

    formData.append("android_link", androidLink);
    formData.append("ios_link", iosLink);
    formData.append("order_online", orderActive || 0);
    formData.append("android_switch", androidActive || 0);
    formData.append("ios_switch", iosActive || 0);
    formData.append("show_map", mapActive || 0);
    formData.append("preparation_num_status", preparationNumber || 0);

    formData.append("logo", logoFile);
    formData.append("cover_app_image", coverImageFile);

    formData.append("fav_icon", iconFile);
    formData.append("time_zone", JSON.stringify(selectedTimeZone?.name || ""));

    formData.append("time_format", stateTimeFormat);
    formData.append("currency_id", currencyId);
    formData.append("country", selectedCountry);

    if (leftCurrency === 0 && rightCurrency === 0) {
      formData.append("currency_position", "");
    } else if (leftCurrency === 0 && rightCurrency === 1) {
      formData.append("currency_position", "right");
    } else if (leftCurrency === 1 && rightCurrency === 0) {
      formData.append("currency_position", "left");
    }

    formData.append("copy_right", companyCopyrightText);

    if (scale) {
      formData.append("scale", scale);
    }

    if (reportTime) {
      formData.append("report_time", reportTime);
    }

    for (const [key, value] of Object.entries(updatedData)) {
      formData.append(`maintenance[${key}]`, value);
    }

    formData.append("web_site", websiteLink);

    postData(formData, "Business Setup Success");
  };

  useEffect(() => {
    const timeZones = moment.tz.names().map((name) => ({ name: name }));
    setTimeZone(timeZones);
  }, []);

  const closeAll = () => {
    setIsOpenCountries(false);
    setIsOpenTimeZone(false);
    setIsOpenTimeFormat(false);
    // setIsOpenCurrency(false)
    setIsOpenCurrency(false);
  };
  const handleOpenCurrency = () => {
    closeAll();
    setIsOpenCurrency(!isOpenCurrency);
  };

  const handleOpenOptionCurrency = () => setIsOpenCurrency(false);

  const handleOpenCountries = () => {
    closeAll();
    setIsOpenCountries(!isOpenCountries);
  };
  const handleOpenTimeZone = () => {
    closeAll();
    setIsOpenTimeZone(!isOpenTimeZone);
  };
  const handleOpenTimeFormat = () => {
    closeAll();
    setIsOpenTimeFormat(!isOpenTimeFormat);
  };

  const handleSelectCurrency = (option) => {
    setCurrencyId(option.id);
    setStateCurrency(option.name);
  };

  const handleSelectCountry = (country) => {
    setCountries(country.id)
    setStateCountries(country.name);
  };
  const handleSelectTimeZone = (timeZone) => {
    setStateTimeZone(timeZone.name);
  };
  const handleSelectTimeFormat = (timeFormat) => {
    setSelectedTimeFormat(timeFormat.name);
    setStateTimeFormat(timeFormat.name);
  };
  // const handleSelectCurrency = (currency) => {
  //        setStateCurrency(currency.name );
  // };

  const handleClickLeftCurrency = (e) => {
    const isChecked = e.target.checked;
    setLeftCurrency(isChecked ? 1 : 0);
    setRightCurrency(0);
  };
  const handleClickRightCurrency = (e) => {
    const isChecked = e.target.checked;
    setRightCurrency(isChecked ? 1 : 0);
    setLeftCurrency(0);
  };

  const handleClickAllSystem = (e) => {
    const isChecked = e.target.checked;
    setAllSystem(isChecked ? 1 : 0);
  };
  const handleClickBranchPanel = (e) => {
    const isChecked = e.target.checked;
    setBranchPanel(isChecked ? 1 : 0);
  };
  const handleClickCustomerApp = (e) => {
    const isChecked = e.target.checked;
    setCustomerApp(isChecked ? 1 : 0);
  };
  const handleClickWebApp = (e) => {
    const isChecked = e.target.checked;
    setWebApp(isChecked ? 1 : 0);
  };
  const handleClickDeliverymanApp = (e) => {
    const isChecked = e.target.checked;
    setDeliverymanApp(isChecked ? 1 : 0);
  };
  const handleClickOrderActive = (e) => {
    const isChecked = e.target.checked;
    setOrderAcive(isChecked ? 1 : 0);
  };
  const handleClickAndroidActive = (e) => {
    const isChecked = e.target.checked;
    setAndroidActive(isChecked ? 1 : 0);
  };
  const handleClickIOSActive = (e) => {
    const isChecked = e.target.checked;
    setIOSAcive(isChecked ? 1 : 0);
  };
  const handleClickMapActive = (e) => {
    const isChecked = e.target.checked;
    setMapActive(isChecked ? 1 : 0);
  };
  const handleClickPreparationNumber = (e) => {
    const isChecked = e.target.checked;
    setPreparationNumber(isChecked ? 1 : 0);
  };

  const handleClickMaintenanceMode = (e) => {
    const isChecked = e.target.checked;
    setMaintenanceMode(isChecked ? 1 : 0);

    if (!isChecked) {
      setAllSystem(0);
      setBranchPanel(0);
      setCustomerApp(0);
      setWebApp(0);
      setDeliverymanApp(0);
      setForDay(0);
      setForWeek(0);
      setUntilChange(0);
      setCustomize(0);
      setStartDate("");
      setEndDate("");
    }
  };

  const handleClickForDay = (e) => {
    const isChecked = e.target.checked;
    setForDay(isChecked ? 1 : 0);
    setForWeek(0);
    setUntilChange(0);
    setCustomize(0);

    setStartDate(startDate || '')
    setEndDate(endDate || '')
  };
  const handleClickForWeek = (e) => {
    const isChecked = e.target.checked;
    setForDay(0);
    setForWeek(isChecked ? 1 : 0);
    setUntilChange(0);
    setCustomize(0);

    setStartDate(startDate || '')
    setEndDate(endDate || '')
  };
  const handleClickUntilChange = (e) => {
    const isChecked = e.target.checked;
    setForDay(0);
    setForWeek(0);
    setUntilChange(isChecked ? 1 : 0);
    setCustomize(0);

    setStartDate(startDate || '')
    setEndDate(endDate || '')
  };
  const handleClickCustomize = (e) => {
    const isChecked = e.target.checked;
    setForDay(0);
    setForWeek(0);
    setUntilChange(0);
    setCustomize(isChecked ? 1 : 0);

    setStartDate(startDate || '')
    setEndDate(endDate || '')
  };

  // Logo handler
  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file); // Assuming setLogoFile is defined elsewhere
      setLogo(file.name); // Set the file name as the value for logo
    } else {
      setLogo(''); // Reset logo value if no file is selected
    }
  };

  // Cover Image handler
  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file); // Assuming setLogoFile is defined elsewhere
      setCoverImage(file.name); // Set the file name as the value for logo
    }
  };

  // Icon handler
  const handleIcon = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file); // Assuming setIconFile is defined elsewhere
      setIcon(file.name); // Set the file name as the value for icon
    } else {
      setIcon(''); // Reset icon value if no file is selected
    }
  };

  const handleLogoClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };
  const handleCoverImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };
  const handleIconClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handleQrCodeClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (
        CountriesRef.current &&
        !CountriesRef.current.contains(event.target) &&
        TimeZoneRef.current &&
        !TimeZoneRef.current.contains(event.target) &&
        TimeFormatRef.current &&
        !TimeFormatRef.current.contains(event.target) &&
        CurrencyRef.current &&
        !CurrencyRef.current.contains(event.target)
      ) {
        setIsOpenCountries(false);
        setIsOpenTimeZone(false);
        setIsOpenTimeFormat(false);
        setIsOpenCurrency(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleReset = () => {
    setCompanyName("");
    setCompanyPhone("");
    setCompanyAlternativePhone("")
    setCompanyWhatsapp("")
    setCompanyEmail("");
    setCompanyAddress("");
    setLogoFile("");
    setLogo("");
    setCoverImage("");
    setCoverImageFile("");
    setIconFile("");
    setStateCountries("Select Country");
    setSelectedCountry("");
    setStateTimeZone("Select Time Zone");
    setSelectedTimeZone("");
    setStateTimeFormat("Select Time Format");
    setSelectedTimeFormat("");
    setStateCurrency('Select Currency');
    setCurrencyId('');
    setLeftCurrency(0);
    setRightCurrency(0);
    setCompanyCopyrightText("");
    setPreparationNumber(0);
    setMaintenanceMode(0);
    setAllSystem(0);
    setBranchPanel(0);
    setCustomerApp(0);
    setWebApp(0);
    setDeliverymanApp(0);
    setForDay(0);
    setForWeek(0);
    setUntilChange(0);
    setCustomize(0);
    setStartDate("");
    setEndDate("");
    setWebsiteLink("");
    setMapActive(0);
    setScale("");
    setReportTime("");
    setQrCode("");
    setQrCodeFile("");
  };

  return (
    <>
      {loadingCompany || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <LoaderLogin />
          </div>
        </>
      ) : (
        <form
          className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row"
          onSubmit={handelAddCompany}
        >
          <div className="w-full">
            <TitleSection text={t("System Maintenance")} />
            <p className="text-xl font-TextFontMedium text-secoundColor">
              {t("By")}
            </p>
          </div>
          {/* Maintenance Mode */}
          <div className="sm:w-full xl:w-[30%] flex items-center justify-start gap-3">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("MaintenanceMode")}:
            </span>
            <div>
              <Switch
                checked={maintenanceMode}
                handleClick={handleClickMaintenanceMode}
              />
            </div>
          </div>

          <TitleSection text={t("Company Information")} />
          {/* Company Name */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("CompanyName")}:
            </span>
            <TextInput
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t("CompanyName")}
            />
          </div>
          {/* Company Phone */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Company Phone")}
            </span>
            <NumberInput
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder={t("Company Phone")}
            />
          </div>
          {/* Company Alternative Phone */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("CompanyAlternativePhone")}
            </span>
            <NumberInput
              value={companyAlternativePhone}
              onChange={(e) => setCompanyAlternativePhone(e.target.value)}
              placeholder={t("CompanyAlternativePhone")}
            />
          </div>
          {/* Company WhatsApp Phone */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Company WhatsApp Phone")}
            </span>
            <NumberInput
              value={companyWhatsapp}
              onChange={(e) => setCompanyWhatsapp(e.target.value)}
              placeholder={t("Company WhatsApp Phone")}
            />
          </div>
          {/* Company Email */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("CompanyEmail")}:
            </span>
            <EmailInput
              backgound="white"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder={t("CompanyEmail")}
            />
          </div>
          {/* Company Address */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("CompanyAddress")}:
            </span>
            <TextInput
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder={t("CompanyAddress")}
            />
          </div>
          {/* Logo */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">{t("Logo")}:</span>
            <UploadInput
              value={logo}
              uploadFileRef={LogoRef}
              placeholder={t("Logo")}
              handleFileChange={handleLogo}
              onChange={(e) => setLogo(e.target.value)}
              onClick={() => handleLogoClick(LogoRef)}
            />
          </div>
          {/* CoverImage */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">{t("AppCoverImage")}:</span>
            <UploadInput
              value={coverImage}
              uploadFileRef={coverImageRef}
              placeholder={t("AppCoverImage")}
              handleFileChange={handleCoverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              onClick={() => handleCoverImageClick(coverImageRef)}
            />
          </div>
          {/* Icon */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">{t("FavIcon")}:</span>
            <UploadInput
              value={icon}
              uploadFileRef={IconRef}
              placeholder={t("FavIcon")}
              handleFileChange={handleIcon}
              onChange={(e) => setIcon(e.target.value)}
              onClick={() => handleIconClick(IconRef)}
            />
          </div>
          {/* Company Android Link */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("AppAndroidLink")}:
            </span>
            <TextInput
              value={androidLink}
              onChange={(e) => setAndroidLink(e.target.value)}
              placeholder={t("AppAndroidLink")}
            />
          </div>
          {/* Company Ios Link */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("AppIOSLink")}:
            </span>
            <TextInput
              value={iosLink}
              onChange={(e) => setIosLink(e.target.value)}
              placeholder={t("AppIOSLink")}
            />
          </div>
          {/*Website Link */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Website Link")}:
            </span>
            <TextInput
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              placeholder={t("Website Link")}
            />
          </div>
          {/* scale */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Scale")}:
            </span>
            <TextInput
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              placeholder={t("Scale")}
            />
          </div>
          {/* Report Time */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Report Time")}:
            </span>
            <TextInput
              value={reportTime}
              onChange={(e) => setReportTime(e.target.value)}
              placeholder={t("Report Time")}
            />
          </div>

          <div className="sm:w-full lg:w-[30%] flex items-center gap-2 mt-8 justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">{t("Order Active")}  </span>
            <div>
              <Switch
                checked={orderActive}
                handleClick={handleClickOrderActive}
              />
            </div>
          </div>

          <div className="sm:w-full lg:w-[30%] flex items-center gap-2 mt-8 justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">{t('Preparation Number')} </span>
            <div>
              <Switch
                checked={preparationNumber}
                handleClick={handleClickPreparationNumber}
              />
            </div>
          </div>

          <div className="sm:w-full lg:w-[30%] flex items-center gap-2 mt-8 justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">{t("Android  Active")}</span>
            <div>
              <Switch
                checked={androidActive}
                handleClick={handleClickAndroidActive}
              />
            </div>
          </div>

          <div className="sm:w-full lg:w-[30%] flex items-center gap-2 mt-8 justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">{t("IOS  Active")} </span>
            <div>
              <Switch
                checked={iosActive}
                handleClick={handleClickIOSActive}
              />
            </div>
          </div>

          <div className="sm:w-full lg:w-[30%] flex items-center gap-2 mt-8 justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">{t("Show Map Status")} </span>
            <div>
              <Switch
                checked={mapActive}
                handleClick={handleClickMapActive}
              />
            </div>
          </div>

          {qrCode !== null && (
            <div className="sm:w-full lg:w-[30%] flex flex-col items-center justify-center gap-y-1 mt-5">
              <img
                src={qrCode}
                alt="QR Code"
                className="object-contain w-48 h-48 mx-auto"
              />
              <p className="text-sm text-center text-gray-600">
                {t("Current QR Code")}
              </p>
            </div>
          )}

          <TitleSection text={t("BusinessInformation")} />

          {/* Countries */}
          {/* <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                                   <span className="text-xl font-TextFontRegular text-thirdColor">Countries:</span>
                                   <DropDown
                                          ref={CountriesRef}
                                          handleOpen={handleOpenCountries}
                                          stateoption={stateCountries}
                                          openMenu={isOpenCountries}
                                          handleOpenOption={handleOpenCountries}
                                          onSelectOption={handleSelectCountry}
                                          options={countries}
                                          border={false}
                                   />
                            </div> */}
          {/* Countries 2 */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Countries")}:
            </span>
            <Dropdown
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.value)}
              options={countries}
              optionLabel="name"
              placeholder={t("SelectaCountry")}
              filter
              className="w-full md:w-14rem"
            />
          </div>
          {/* Time Zone */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("TimeZone")}:
            </span>
            <Dropdown
              value={selectedTimeZone}
              onChange={(e) => setSelectedTimeZone(e.value)}
              options={timeZone}
              optionLabel="name"
              placeholder={stateTimeZone || selectedTimeZone.name}
              filter
              className="w-full md:w-14rem"
            />
          </div>
          {/* Time Format */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("TimeFormat")}:
            </span>
            <DropDown
              ref={TimeFormatRef}
              handleOpen={handleOpenTimeFormat}
              stateoption={stateTimeFormat}
              openMenu={isOpenTimeFormat}
              handleOpenOption={handleOpenTimeFormat}
              onSelectOption={handleSelectTimeFormat}
              options={timeFormat}
              border={false}
            />
          </div>
          {/* Currency */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Currency")}:
            </span>
            <DropDown
              ref={CurrencyRef}
              handleOpen={handleOpenCurrency}
              stateoption={stateCurrency}
              openMenu={isOpenCurrency}
              handleOpenOption={handleOpenOptionCurrency}
              onSelectOption={handleSelectCurrency}
              options={[{ id: '', name: 'Select Currency' }, ...dataCompany.currency] || []}
              border={false}
            />
          </div>

          <div className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row">
            {/* Currency Position */}
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t('CurrencyPosition')}:
            </span>
            <div className="sm:w-full xl:w-[30%] flex items-center justify-start gap-3">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                (E£)         {t("Left")}:
              </span>
              <div>
                <Switch
                  checked={leftCurrency}
                  handleClick={handleClickLeftCurrency}
                />
              </div>
            </div>
            <div className="sm:w-full xl:w-[30%] flex items-center justify-start gap-3">
              <span className="text-xl font-TextFontRegular text-thirdColor">
                (E£)             {t("Right")}:
              </span>
              <div>
                <Switch
                  checked={rightCurrency}
                  handleClick={handleClickRightCurrency}
                />
              </div>
            </div>
          </div>

          {/* Company Copyright Text */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("CompanyCopyrightText")}:
            </span>
            <TextInput
              value={companyCopyrightText}
              onChange={(e) => setCompanyCopyrightText(e.target.value)}
              placeholder={t("CompanyCopyrightText")}
            />
          </div>

          {maintenanceMode === 1 && (
            <>
              <div className="w-full">
                <TitleSection text={t("Select System")} />
                <p className="text-xl font-TextFontMedium text-secoundColor">
                  {t("Selectthesystems")}

                </p>
              </div>
              {/* All System */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("AllSystem")}:
                </span>
                <div>
                  <Switch
                    checked={allSystem}
                    handleClick={handleClickAllSystem}
                  />
                </div>
              </div>
              {/* Branch Panel */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("BranchPanel")}:
                </span>
                <div>
                  <Switch
                    checked={branchPanel}
                    handleClick={handleClickBranchPanel}
                  />
                </div>
              </div>
              {/* Customer App */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("CustomerApp")}:
                </span>
                <div>
                  <Switch
                    checked={customerApp}
                    handleClick={handleClickCustomerApp}
                  />
                </div>
              </div>
              {/* Web App */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("WebApp")}:
                </span>
                <div>
                  <Switch checked={webApp} handleClick={handleClickWebApp} />
                </div>
              </div>
              {/* Deliveryman App */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("DeliverymanApp")}:
                </span>
                <div>
                  <Switch
                    checked={deliverymanApp}
                    handleClick={handleClickDeliverymanApp}
                  />
                </div>
              </div>

              <div className="w-full">
                <TitleSection text={t("Maintenance Date & Time")} />
                <p className="text-xl font-TextFontMedium text-secoundColor">
                  {t("Choosethemaintenance")}                </p>
              </div>

              {/* For 24 Hours */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("For24Hours")}:
                </span>
                <div>
                  <Switch checked={forDay} handleClick={handleClickForDay} />
                </div>
              </div>
              {/*  For 1 Week */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("For1Week")}:
                </span>
                <div>
                  <Switch checked={forWeek} handleClick={handleClickForWeek} />
                </div>
              </div>
              {/* Until I Change */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("UntilIChange")}:
                </span>
                <div>
                  <Switch
                    checked={untilChange}
                    handleClick={handleClickUntilChange}
                  />
                </div>
              </div>
              {/* Customize */}
              <div className="sm:w-full xl:w-[20%] flex items-center justify-start gap-3">
                <span className="text-xl font-TextFontRegular text-thirdColor">
                  {t("Customize")}:
                </span>
                <div>
                  <Switch
                    checked={Customize}
                    handleClick={handleClickCustomize}
                  />
                </div>
              </div>
              {Customize === 1 && (

                <>
                  {/* Start Date */}
                  <div className="sm:w-full xl:w-[30%] flex items-center justify-start gap-3">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("StartDate")}:                    </span>
                    <div>
                      <DateInput
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        maxDate={false}
                        minDate={true}
                      />
                    </div>
                  </div>
                  {/* End Date */}
                  <div className="sm:w-full xl:w-[30%] flex items-center justify-start gap-3">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("EndDate")}:
                    </span>
                    <div>
                      <DateInput
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        maxDate={false}
                        minDate={true}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )
          }

          {/* Buttons */}
          <div className="flex items-center justify-end w-full mb-32 gap-x-4">
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
                handleClick={handelAddCompany}
              />
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default BusinessSettingsPage;