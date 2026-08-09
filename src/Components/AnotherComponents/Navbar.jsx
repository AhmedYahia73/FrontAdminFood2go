import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../Context/Auth.jsx';
import { SearchBar, StaticButton, StaticLoader, SubmitButton, TextInput, PasswordInput } from '../Components.js';
import { CiGlobe } from 'react-icons/ci';
import { IoBagHandleOutline } from 'react-icons/io5';
import { IoIosArrowDown, IoMdNotificationsOutline } from 'react-icons/io';
import RedLogo from '../../Assets/Images/RedLogo.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeCategory, removeUser, setGlobalSearch, setNewOrders } from '../../Store/CreateSlices.jsx';
import { removeCanceledOrder } from '../../Store/CreateSlices';
import { useChangeState } from '../../Hooks/useChangeState.jsx';
import { useGet } from '../../Hooks/useGet.jsx';
import { usePost } from '../../Hooks/usePostJson';
import "../../i18n.js";
import { useTranslation } from "react-i18next";
import { GrLanguage } from "react-icons/gr";
import { RiApps2Line } from "react-icons/ri";
import { setLanguage } from '../../Store/CreateSlices';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = useSelector((state) => state.search?.query || '');
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const cancelationDropdownRef = useRef(null);
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const route = role === "branch" ? "/branch/orders" : "/dashboard/orders";

  const [cancelationStatuses, setCancelationStatuses] = useState([]);
  const [selectedCancelId, setSelectedCancelId] = useState('');
  const [selectedOption, setSelectedOption] = useState('EN');
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cancelationOpen, setCancelationOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { postData } = usePost({
    url: `${apiUrl}/admin/profile/update`,
  });

  const { refetch: refetchProfile, loading: profileLoading, data: profileData } = useGet({
    url: `${apiUrl}/admin/profile`,
  });


  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en";
    i18n.changeLanguage(savedLanguage);
    dispatch(setLanguage(savedLanguage));
  }, [i18n]);

  // Replace handleLanguage with this:
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    dispatch(setLanguage(lang));
  };

  // Fetch user profile data when dialog opens
  useEffect(() => {
    if (profileDialogOpen) {
      refetchProfile();
    }
  }, [profileDialogOpen, refetchProfile]);

  // Set form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setUserData(profileData);
      setName(profileData.name || '');
      setEmail(profileData.email || '');
      setPhone(profileData.phone || '');
      setImagePreview(profileData.image || '');
    }
  }, [profileData]);

  const cancelationUrl =
    role === "admin" ? `${apiUrl}/admin/settings/cancelation` : null;

  const {
    refetch: refetchCancelation,
    loading: loadingCancelation,
    data: dataCancelation,
  } = useGet({
    url: cancelationUrl,
  });

  const { changeState, loading: loadingChange } = useChangeState();

  // Fetch cancellation data
  useEffect(() => {
    refetchCancelation();
  }, [refetchCancelation]);

  // Update cancellation statuses when API data is received
  useEffect(() => {
    if (dataCancelation && dataCancelation.orders) {
      setCancelationStatuses(dataCancelation.orders);
    }
  }, [dataCancelation]);

  // Handle online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (cancelationDropdownRef.current && !cancelationDropdownRef.current.contains(event.target)) {
        setCancelationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (value) => {
    setSelectedOption(value);
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(!open);
  };

  const handleCancelationClickOpen = () => {
    setCancelationOpen(!cancelationOpen);
  };

  const handleLogout = () => {
    auth.logout();
    dispatch(removeUser());
    dispatch(removeCategory());
    localStorage.clear(); // ✅ Clears all keys from localStorage
    navigate("/", { replace: true });
  };

  const handleProfileImageClick = () => {
    setProfileDialogOpen(true);
  };

  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
    setPassword(''); // Clear password field when closing
    setImage(null); // Clear selected image
    setImagePreview(userData?.image || ''); // Reset to original image
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);

    // Only append password if it's provided
    if (password) {
      formData.append("password", password);
    }

    // Only append image if a new one is selected
    if (image) {
      formData.append("image", image);
    }

    try {
      await postData(formData, t("ProfileUpdatedSuccess"));
      // Refresh the profile data after update
      refetchProfile();
      // Update auth context with new data
      if (auth.updateUser) {
        auth.updateUser({ name, email, phone, image: imagePreview });
      }
      handleCloseProfileDialog();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleResetForm = () => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
      setPassword('');
      setImage(null);
      setImagePreview(userData.image || '');
    }
  };

  const canceledOrders = useSelector((state) => state.canceledOrders);
  const newOrders = useSelector((state) => state.newOrders);

  const { postData: markAsRead } = usePost({
    url: `${apiUrl}/admin/order/is_read`,
  });

  const handleMarkAsRead = (orderId) => {
    if (orderId) {
      const formData = new FormData();
      formData.append('order_id', orderId);
      markAsRead(formData, { params: { order_id: orderId } });

      // Update local state immediately for better UX
      const currentOrders = Array.isArray(newOrders.orders) ? newOrders.orders : Object.values(newOrders.orders || {});
      const updatedOrders = currentOrders.filter(id => String(id) !== String(orderId));
      dispatch(setNewOrders({
        count: updatedOrders.length,
        id: updatedOrders.length > 0 ? updatedOrders[updatedOrders.length - 1] : null,
        orders: updatedOrders
      }));
    }
  };

  const handleRemoveOrder = (orderId) => {
    dispatch(removeCanceledOrder(orderId));
  };

  const handleChangeStatus = async (id) => {
    const response = await changeState(
      `${apiUrl}/admin/settings/cancelation_status/${id}`,
      'Cancellation status updated.'
    );

    if (response && !response.errors) {
      refetchCancelation();
      setCancelationOpen(false);
    }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-2 md:px-4 py-0 md:py-1 shadow-md gap-x-2 md:gap-x-4 flex-nowrap">
        <div className="flex items-center justify-start flex-1 md:w-6/12 lg:w-4/12 xl:w-3/12 gap-x-1 md:gap-x-2 min-w-0">
          <div className="relative z-10 w-14 hidden md:block">
            {(imagePreview || auth?.userState?.image) ? (
              <button
                type="button"
                onClick={handleProfileImageClick}
                className="cursor-pointer"
              >
                <img
                  src={imagePreview ? imagePreview : auth?.userState?.image}
                  className="object-cover object-center p-1 bg-white border-2 rounded-full min-w-14 max-w-14 min-h-14 max-h-14 border-mainColor cursor-pointer hover:opacity-80 transition-opacity"
                  alt="Profile"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleProfileImageClick}
                className="cursor-pointer"
              >
                <RedLogo width={60} height={60} />
              </button>
            )}
            <span
              className={`absolute z-10 sm:right-0 lg:-right-0 ${isOnline ? 'bg-green-400' : 'bg-red-600'
                } rounded-full bottom-1 w-[18px] h-[18px] animate-pulse`}
            ></span>
          </div>
          <div className="w-40 sm:w-10/12 md:w-10/12">
            <span className="w-full text-xs md:text-2xl text-left text-mainColor font-TextFontSemiBold truncate block">
              {t("Hello")}, {name ? name : auth?.userState?.name || ""}
            </span>
            <div className="flex items-center w-full md:w-11/12 text-mainColor text-[10px] md:text-base">
              <i>
                <GrLanguage className="text-xs md:text-base" />
              </i>
              <select
                value={i18n.language}
                onChange={handleLanguageChange}
                className="flex items-center py-1 bg-transparent border border-white rounded text-mainColor"
              >
                <option value="en">EN</option>
                <option value="ar">Ar</option>
              </select>
            </div>
          </div>
        </div>

        {(location.pathname === '/dashboard' || location.pathname === '/dashboard/') && (
          <div className="flex-1 w-full hidden lg:block">
            <SearchBar
              placeholder={t('Search for modules')}
              value={searchQuery}
              handleChange={(e) => dispatch(setGlobalSearch(e.target.value))}
            />
          </div>
        )}

        <div className="flex items-center gap-1 md:gap-8 flex-shrink-0 ml-auto">
          {/* Cancellation Status Icon */}
          <div className="relative" ref={cancelationDropdownRef}>
            <button
              type="button"
              onClick={handleCancelationClickOpen}
              className="relative p-1"
            >
              <IoBagHandleOutline className="text-xl md:text-3xl text-mainColor" />
              {cancelationStatuses.length > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-600 rounded-full -top-1 -right-1">
                  {cancelationStatuses.length}
                </span>
              )}
            </button>
            {cancelationOpen && (
              <div className="absolute right-0 z-40 w-64 py-1 mt-2 overflow-y-auto bg-white rounded-md shadow-lg max-h-80">
                {loadingCancelation ? (
                  <div className="px-4 py-2 text-gray-700">{t("Loading...")}</div>
                ) : cancelationStatuses.length === 0 ? (
                  <div className="px-4 py-2 text-gray-700">{t("No cancellation orders")}</div>
                ) : (
                  <>
                    <div className="px-4 py-2 font-semibold border-b">{t("Cancellation Orders")}</div>
                    {cancelationStatuses.map((status) => (
                      <div
                        key={status.id}
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                      >
                        <Link
                          to={`${route}/details/${status.id}`}
                          onClick={() => setSelectedCancelId(status.id)}
                          className="flex-1 text-left"
                        >
                          <span className="flex-1 text-left cursor-pointer">
                            {status.name || `Order #${status.id}`}
                          </span>
                        </Link>
                        <button
                          onClick={() => handleChangeStatus(status.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                          aria-label="Remove Cancellation Order"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Apps Link */}
          <Link
            to="/dashboard"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            title={t("All Modules")}
          >
            <RiApps2Line className="text-xl md:text-3xl text-mainColor" />
          </Link>

          {/* Notification Dropdown */}
          <div className="relative flex-shrink-0" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-1"
            >
              <IoMdNotificationsOutline className="text-xl md:text-3xl text-mainColor" />
              {newOrders.count > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-600 rounded-full -top-1 -right-1">
                  {newOrders.count}
                </span>
              )}
            </button>
            {/* Notification Dropdown Content */}
            {notificationOpen && (
              <div className="absolute right-0 top-8 z-40 w-64 py-1 mt-2 overflow-y-auto bg-white rounded-md shadow-lg max-h-80">
                {(!newOrders.orders || (Array.isArray(newOrders.orders) ? newOrders.orders.length === 0 : Object.keys(newOrders.orders).length === 0)) ? (
                  <div className="px-4 py-2 text-gray-700">{t("No Waiting Orders")}</div>
                ) : (
                  <>
                    <div className="px-4 py-2 font-semibold border-b">{t("Waiting Orders")}</div>
                    {(Array.isArray(newOrders.orders) ? newOrders.orders : Object.values(newOrders.orders)).map((orderId) => (
                      <div
                        key={orderId}
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                      >
                        <Link
                          to={`${route}/details/${orderId}`}
                          onClick={() => {
                            setNotificationOpen(false);
                            handleMarkAsRead(orderId);
                          }}
                          className="flex-1 text-left"
                        >
                          Order #{orderId}
                        </Link>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <StaticButton
            Size="text-[10px] md:text-base"
            px="px-2 md:px-4"
            py="py-1"
            type="button"
            text={t("Logout")}
            handleClick={handleLogout}
          />
        </div>
      </nav>

      {/* Profile Update Dialog */}
      <Dialog open={profileDialogOpen} onClose={handleCloseProfileDialog} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <DialogPanel className="relative w-full max-w-md overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8">
              <div className="px-6 pt-5 pb-4 bg-white sm:p-6">
                <DialogTitle as="h3" className="text-xl font-TextFontSemiBold text-mainColor mb-4">
                  {t("Update Profile")}
                </DialogTitle>

                {profileLoading ? (
                  <div className="flex justify-center py-8">
                    <StaticLoader />
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center justify-center mb-4">
                      <div className="relative">
                        <img
                          src={imagePreview || auth?.userState?.image}
                          className="object-cover w-24 h-24 border-2 rounded-full border-mainColor"
                          alt="Profile"
                        />
                        <label
                          htmlFor="image-upload"
                          className="absolute bottom-0 right-0 p-1 bg-white border-2 rounded-full cursor-pointer border-mainColor"
                        >
                          <svg className="w-4 h-4 text-mainColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Name Input */}
                    <div className="w-full flex flex-col items-start justify-center gap-y-1">
                      <span className="text-sm font-TextFontRegular text-thirdColor">
                        {t("Name")}:
                      </span>
                      <TextInput
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        name="name"
                        placeholder={t("Enter Name")}
                        background="white"
                        borderColor="gray-300"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="w-full flex flex-col items-start justify-center gap-y-1">
                      <span className="text-sm font-TextFontRegular text-thirdColor">
                        {t("Email")}:
                      </span>
                      <TextInput
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        name="email"
                        placeholder={t("Enter Email")}
                        background="white"
                        borderColor="gray-300"
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="w-full flex flex-col items-start justify-center gap-y-1">
                      <span className="text-sm font-TextFontRegular text-thirdColor">
                        {t("Phone")}:
                      </span>
                      <TextInput
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        name="phone"
                        placeholder={t("Enter Phone")}
                        background="white"
                        borderColor="gray-300"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="w-full flex flex-col items-start justify-center gap-y-1">
                      <span className="text-sm font-TextFontRegular text-thirdColor">
                        {t("Password")} ({t("Optional")}):
                      </span>
                      <PasswordInput
                        background="white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("Enter New Password")}
                        name="password"
                        backgound="bg-white"
                        borderColor="gray-300"
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Buttons */}
              <div className="px-6 py-4 bg-gray-50 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <SubmitButton
                  text={updateLoading ? t("Updating...") : t("Update")}
                  rounded="rounded-md"
                  handleClick={handleUpdateProfile}
                  disabled={updateLoading || profileLoading}
                  bgColor="bg-mainColor"
                  hoverBgColor="hover:bg-mainColor-dark"
                  Size="text-sm"
                  className="px-4 py-2"
                />
                <StaticButton
                  text={t("Reset")}
                  handleClick={handleResetForm}
                  bgColor="bg-gray-200"
                  Color="text-gray-700"
                  border="border-2"
                  borderColor="border-gray-300"
                  rounded="rounded-md"
                  Size="text-sm"
                  className="px-4 py-2"
                />
                <StaticButton
                  text={t("Cancel")}
                  handleClick={handleCloseProfileDialog}
                  bgColor="bg-white"
                  Color="text-gray-700"
                  border="border-2"
                  borderColor="border-gray-300"
                  rounded="rounded-md"
                  Size="text-sm"
                  className="px-4 py-2"
                />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Navbar;