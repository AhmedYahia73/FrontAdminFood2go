import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import {
  TitlePage,
  TextInput,
  SubmitButton,
  StaticButton,
  Switch,
  StaticLoader,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { useGet } from "../../../../Hooks/useGet";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const AddStoreMan = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);

  const { data, loading } = useGet({
    url: `${apiUrl}/admin/purchase_store_man`,
  });
  const {
    postData,
    loading: loadingPost,
    response,
  } = usePost({
    url: `${apiUrl}/admin/purchase_store_man/add`,
  });

  const storeOptions = (data?.stores || []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  useEffect(() => {
    if (response && !loadingPost) {
      auth.toastSuccess(t("Store Man added successfully"));
      navigate(-1);
    }
  }, [response, loadingPost]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName || !phone || !password || !selectedStore) {
      auth.toastError(t("Please fill all required fields"));
      return;
    }

    const formData = new FormData();
    formData.append("user_name", userName);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("status", status);
    if (image) formData.append("image", image);
    if (selectedStore) formData.append("store_id", selectedStore.value);

    postData(formData, t("Adding store man..."));
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      padding: "0.5rem",
      borderColor: "#D1D5DB",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#DBEAFE",
      borderRadius: "9999px",
    }),
  };

  return (
    <div className="w-full p-4 pb-20">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-mainColor hover:text-red-600"
        >
          <IoArrowBack size={28} />
        </button>
        <TitlePage text={t("Add Store Man")} />
      </div>

      {loading ? (
        <StaticLoader />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white shadow-lg rounded-2xl"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-xl font-medium text-thirdColor">
                {t("Name")} *
              </label>
              <TextInput
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t("Enter name")}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-xl font-medium text-thirdColor">
                {t("Phone")} *
              </label>
              <TextInput
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("Enter phone or email")}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-xl font-medium text-thirdColor">
                {t("Password")} *
              </label>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Enterpassword")}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-xl font-medium text-thirdColor">
                {t("Store")} *
              </label>
              <Select
                value={selectedStore}
                onChange={setSelectedStore}
                options={storeOptions}
                placeholder={t("Select store")}
                isClearable
                styles={selectStyles}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-xl font-medium text-thirdColor">
                {t("Image")}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full p-3 border rounded-lg"
              />
              {image && (
                <p className="mt-2 text-sm text-green-600">{image.name}</p>
              )}
            </div>
            <div className="flex items-center gap-6 pt-6">
              <span className="text-xl font-medium text-thirdColor">
                {t("Status")}:
              </span>
              <Switch
                checked={status === 1}
                handleClick={() => setStatus((s) => (s === 1 ? 0 : 1))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10">
            <div>
              <StaticButton
                text={t("Cancel")}
                handleClick={() => navigate(-1)}
                bgColor="bg-gray-200"
                Color="text-mainColor"
              />
            </div>
            <div>
              <SubmitButton
                text={loadingPost ? t("Saving...") : t("Add")}
                disabled={loadingPost}
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddStoreMan;
