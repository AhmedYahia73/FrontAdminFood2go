import React, { useEffect, useRef, useState } from 'react';
import { useGet } from '../../../../Hooks/useGet';
import { usePost } from '../../../../Hooks/usePostJson';
import { LoaderLogin, SubmitButton, UploadInput } from '../../../../Components/Components';
import { useTranslation } from "react-i18next";
import { useAuth } from '../../../../Context/Auth';

const SongPage = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const auth = useAuth();

  // Main Notification Sound (General/Default)
  const { refetch: refetchMainSound, loading: loadingMain, data: dataMain } = useGet({
    url: `${apiUrl}/admin/settings/notification_sound`,
  });

  // Captain Sound
  const { refetch: refetchCaptainSound, loading: loadingCaptain, data: dataCaptain } = useGet({
    url: `${apiUrl}/admin/notification_sound/captain`,
  });

  // Cashier Sound
  const { refetch: refetchCashierSound, loading: loadingCashier, data: dataCashier } = useGet({
    url: `${apiUrl}/admin/notification_sound/cashier`,
  });

  // Post hooks for each sound type
  const { postData: postMainSound, loading: loadingPostMain } = usePost({
    url: `${apiUrl}/admin/settings/notification_sound_update`,
  });

  const { postData: postCaptainSound, loading: loadingPostCaptain } = usePost({
    url: `${apiUrl}/admin/notification_sound/update_captain`,
  });

  const { postData: postCashierSound, loading: loadingPostCashier } = usePost({
    url: `${apiUrl}/admin/notification_sound/update_cashier`,
  });

  // Refs for file inputs and audio elements
  const mainSongRef = useRef();
  const captainSongRef = useRef();
  const cashierSongRef = useRef();
  const mainAudioRef = useRef();
  const captainAudioRef = useRef();
  const cashierAudioRef = useRef();

  // State for each sound type
  const [mainSong, setMainSong] = useState('');
  const [mainSongFile, setMainSongFile] = useState(null);
  const [mainSongFileOld, setMainSongFileOld] = useState(null);

  const [captainSong, setCaptainSong] = useState('');
  const [captainSongFile, setCaptainSongFile] = useState(null);
  const [captainSongFileOld, setCaptainSongFileOld] = useState(null);

  const [cashierSong, setCashierSong] = useState('');
  const [cashierSongFile, setCashierSongFile] = useState(null);
  const [cashierSongFileOld, setCashierSongFileOld] = useState(null);

  const { t, i18n } = useTranslation();

  // Fetch all sounds on component mount
  useEffect(() => {
    refetchMainSound();
    refetchCaptainSound();
    refetchCashierSound();
  }, [refetchMainSound, refetchCaptainSound, refetchCashierSound]);

  // Update main sound
  useEffect(() => {
    if (dataMain && dataMain.notification_sound) {
      setMainSongFileOld(dataMain.notification_sound);
    }
  }, [dataMain]);

  // Update captain sound
  useEffect(() => {
    if (dataCaptain && dataCaptain.sound) {
      setCaptainSongFileOld(dataCaptain.sound);
    }
  }, [dataCaptain]);

  // Update cashier sound
  useEffect(() => {
    if (dataCashier && dataCashier.sound) {
      setCashierSongFileOld(dataCashier.sound);
    }
  }, [dataCashier]);

  // File change handlers
  const handleMainSongChange = (e) => {
    handleFileChange(e, setMainSongFile, setMainSong);
  };

  const handleCaptainSongChange = (e) => {
    handleFileChange(e, setCaptainSongFile, setCaptainSong);
  };

  const handleCashierSongChange = (e) => {
    handleFileChange(e, setCashierSongFile, setCashierSong);
  };

  const handleFileChange = (e, setSongFile, setSong) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        auth.toastError(t('Please upload a valid audio file.'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        auth.toastError(t('File size should be less than 5MB.'));
        return;
      }

      setSongFile(file);
      setSong(URL.createObjectURL(file));
    }
  };

  const handleSongClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      [mainSong, captainSong, cashierSong].forEach(song => {
        if (song) URL.revokeObjectURL(song);
      });
    };
  }, [mainSong, captainSong, cashierSong]);

  // Form submission handlers
  const handleChangeMainSound = (e) => {
    e.preventDefault();
    if (!mainSongFile) {
      auth.toastError(t('Please upload a new notification sound.'));
      return;
    }
    const formData = new FormData();
    formData.append('notification_sound', mainSongFile);
    postMainSound(formData, t('Notification Sound Changed Successfully'));
  };

  const handleChangeCaptainSound = (e) => {
    e.preventDefault();
    if (!captainSongFile) {
      auth.toastError(t('Please upload a new captain notification sound.'));
      return;
    }
    const formData = new FormData();
    formData.append('sound', captainSongFile);
    postCaptainSound(formData, t('Captain Sound Changed Successfully'));
  };

  const handleChangeCashierSound = (e) => {
    e.preventDefault();
    if (!cashierSongFile) {
      auth.toastError(t('Please upload a new cashier notification sound.'));
      return;
    }
    const formData = new FormData();
    formData.append('sound', cashierSongFile);
    postCashierSound(formData, t('Cashier Sound Changed Successfully'));
  };

  // Reset functions
  const resetForm = (setSongFile, setSong, ref) => {
    setSongFile(null);
    setSong('');
    if (ref.current) ref.current.value = '';
  };

  const isLoading = loadingMain || loadingCaptain || loadingCashier ||
    loadingPostMain || loadingPostCaptain || loadingPostCashier;

  // Sound section component to avoid repetition
  const SoundSection = ({
    title,
    currentSound,
    newSound,
    songFile,
    fileRef,
    audioRef,
    onFileChange,
    onSubmit,
    onReset,
    uploadText,
    changeText
  }) => (
    <div className="p-6 border border-gray-200 rounded-lg">
      <h2 className="text-2xl font-TextFontSemiBold text-mainColor mb-6">
        {title}
      </h2>

      <form onSubmit={onSubmit}>
        {/* Current Sound */}
        {currentSound && (
          <div className="flex flex-col items-start justify-start w-full gap-y-2 mb-6">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Current Sound")}:
            </span>
            <audio
              className="mt-2 drop-shadow"
              ref={audioRef}
              src={currentSound}
              controls
              onError={() => console.error(t('Audio failed to load.'))}
            />
          </div>
        )}

        {/* New Sound Preview */}
        {newSound && (
          <div className="flex flex-col items-start justify-start w-full gap-y-2 mb-4">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("New Sound Preview")}:
            </span>
            <audio className="mt-2 drop-shadow" src={newSound} controls />
          </div>
        )}

        {/* Upload Input */}
        <div className="sm:w-full lg:w-[50%] flex flex-col items-start justify-center gap-y-1 mb-6">
          <UploadInput
            value={songFile ? songFile.name : uploadText}
            uploadFileRef={fileRef}
            placeholder={uploadText}
            handleFileChange={onFileChange}
            onClick={() => handleSongClick(fileRef)}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-start w-full gap-x-4">
          {songFile && (
            <button
              type="button"
              onClick={onReset}
              className="px-6 py-3 text-mainColor border-2 border-mainColor rounded-full hover:bg-gray-50 transition-colors font-TextFontMedium"
            >
              {t('Cancel')}
            </button>
          )}
          <div className="flex items-center justify-end w-full gap-x-4">
            <div className="text-sm text-gray-500">
            <SubmitButton
              text={changeText}
              rounded="rounded-full"
              handleClick={onSubmit}
              disabled={!songFile}
            />
            </div>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center w-full">
          <LoaderLogin />
        </div>
      ) : (
        <section className="space-y-8 pb-32">
          {/* Main Notification Sound */}
          <SoundSection
            title={t("Main Notification Sound")}
            currentSound={mainSongFileOld}
            newSound={mainSong}
            songFile={mainSongFile}
            fileRef={mainSongRef}
            audioRef={mainAudioRef}
            onFileChange={handleMainSongChange}
            onSubmit={handleChangeMainSound}
            onReset={() => resetForm(setMainSongFile, setMainSong, mainSongRef)}
            uploadText={t('Upload Main Notification Sound')}
            changeText={t('Change Main Sound')}
          />

          {/* Captain Sound */}
          <SoundSection
            title={t("Captain Notification Sound")}
            currentSound={captainSongFileOld}
            newSound={captainSong}
            songFile={captainSongFile}
            fileRef={captainSongRef}
            audioRef={captainAudioRef}
            onFileChange={handleCaptainSongChange}
            onSubmit={handleChangeCaptainSound}
            onReset={() => resetForm(setCaptainSongFile, setCaptainSong, captainSongRef)}
            uploadText={t('Upload Captain Notification Sound')}
            changeText={t('Change Captain Sound')}
          />

          {/* Cashier Sound */}
          <SoundSection
            title={t("Cashier Notification Sound")}
            currentSound={cashierSongFileOld}
            newSound={cashierSong}
            songFile={cashierSongFile}
            fileRef={cashierSongRef}
            audioRef={cashierAudioRef}
            onFileChange={handleCashierSongChange}
            onSubmit={handleChangeCashierSound}
            onReset={() => resetForm(setCashierSongFile, setCashierSong, cashierSongRef)}
            uploadText={t('Upload Cashier Notification Sound')}
            changeText={t('Change Cashier Sound')}
          />
        </section>
      )}
    </>
  );
};

export default SongPage;