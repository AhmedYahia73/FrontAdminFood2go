import './index.css';
import { Outlet } from 'react-router-dom';
import { useAuth } from './Context/Auth';
import { Navbar, Sidebar, OrderNotificationHandler, CancellationNotificationHandler, NotificationListener } from './Components/Components';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { setSoundNotification } from './Store/CreateSlices';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGet } from './Hooks/useGet';
import { useTranslation } from 'react-i18next';

const App = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // 🔥 Dynamically update the <title>
  useEffect(() => {
    document.title = t('projectName');
  }, [t, i18n.language]);

  const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");

  useEffect(() => {
    const dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = selectedLanguage;
    if (i18n.language !== selectedLanguage) {
      i18n.changeLanguage(selectedLanguage);
    }
  }, [i18n, selectedLanguage]);

  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const auth = useAuth();
  const hideSide = auth.hideSidebar;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const role = localStorage.getItem("role"); // read role

  // Sound notification is always admin (no branch endpoint given)
  const notificationSoundUrl = `${apiUrl}/admin/settings/notification_sound`;

  const {
    refetch: refetchSong,
    data: dataSong,
  } = useGet({
    url: notificationSoundUrl,
  });

  const soundNotification = useSelector((state) => state.soundNotification);
  const dispatch = useDispatch();

  // Load from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem("notification_sound");
    if (cached) {
      dispatch(setSoundNotification(cached));
    }
  }, [dispatch]);

  useEffect(() => {
    // Request notification permission for background alerts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    refetchSong();
  }, [refetchSong]);

  // Update song source when API data is received
  useEffect(() => {
    if (dataSong && dataSong.notification_sound) {
      localStorage.setItem("notification_sound", dataSong.notification_sound);
      dispatch(setSoundNotification(dataSong.notification_sound));
    }
  }, [dataSong, dispatch]);

  return (
    <PrimeReactProvider>
      <NotificationListener soundUrl={soundNotification?.data}>
        <OrderNotificationHandler
          apiUrl={apiUrl}
          role={role}
        />
        <CancellationNotificationHandler
          apiUrl={apiUrl}
          role={role}
        />
      </NotificationListener>
      <div className="relative flex w-full min-h-screen overflow-hidden bg-secoundBgColor">
        {/* Sidebar */}
        <div className={`${hideSide ? 'w-60' : 'w-16'} ${direction === "ltr" ? 'left-0' : 'right-0'} fixed left-0 z-10 duration-300 overflow-hidden ${location.pathname === '/dashboard' || location.pathname === '/dashboard/home-overview' ? 'hidden' : ''}`}>
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className={`
        w-full duration-300
        ${direction === "ltr"
            ? (location.pathname === '/dashboard' || location.pathname === '/dashboard/home-overview' ? 'pl-0' : (hideSide ? 'pl-60' : 'pl-16'))
            : (location.pathname === '/dashboard' || location.pathname === '/dashboard/home-overview' ? 'pr-0' : (hideSide ? 'pr-60' : 'pr-16'))
          }
      `}>
          {/* Navbar */}
          <div className="sticky top-0 z-10 bg-secoundBgColor">
            <Navbar />
          </div>

          {/* Main Content Area */}
          <div className="relative w-full h-full px-3 overflow-y-scroll scrollPage">
            <Outlet />
          </div>
        </div>
      </div>
    </PrimeReactProvider>
  );
};

export default App;