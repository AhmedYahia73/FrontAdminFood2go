import React, { useEffect, useRef, useState } from "react";
import {
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  UploadInput,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";

const AddMenuPage = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/menue/add`,
  });

  const auth = useAuth();
  const [menus, setMenus] = useState([
    { id: Date.now(), image: "", imageFile: null, status: 0 },
  ]);
  const imageRefs = useRef([]);
  const { t, i18n } = useTranslation();

  const handleImageChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      setMenus((prevMenus) =>
        prevMenus.map((menu) =>
          menu.id === id ? { ...menu, imageFile: file, image: file.name } : menu
        )
      );
    }
  };
  const handleImageClick = (index) => {
    if (imageRefs.current[index]) {
      imageRefs.current[index].click();
    }
  };

  const handleMenuStatus = (id) => {
    setMenus((prevMenus) =>
      prevMenus.map((menu) =>
        menu.id === id ? { ...menu, status: menu.status === 0 ? 1 : 0 } : menu
      )
    );
  };

  const addMoreMenu = () => {
    setMenus([
      ...menus,
      { id: Date.now(), image: "", imageFile: null, status: 0 },
    ]);
  };

  const removeMenu = (id) => {
    if (menus.length > 1) {
      setMenus(menus.filter((menu) => menu.id !== id));
    }
  };

  useEffect(() => {
    if (!loadingPost) {
      handleReset();
    }
    setUpdate(!update);
  }, [response]);

  const handleReset = () => {
    setMenus([{ id: Date.now(), image: "", imageFile: null, status: 0 }]);
  };

  const handleMenuAdd = (e) => {
    e.preventDefault();

    if (menus.some((menu) => !menu.imageFile)) {
      auth.toastError(t("Please set all menu images"));
      return;
    }

    const formData = new FormData();
    menus.forEach((menu, index) => {
      formData.append(`images[${index}][image]`, menu.imageFile);
      formData.append(`images[${index}][status]`, menu.status);
    });

    postData(formData, t("Menu Added Successfully"));
  };

  return (
    <>
      {loadingPost ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <section>
          <form onSubmit={handleMenuAdd}>
            {menus.map((menu, index) => (
              <div key={menu.id} className="sm:py-3 lg:py-6">
                <div className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row">
                  <div className="sm:w-full lg:w-[30%] flex flex-col items-start gap-y-1">
                    <span className="text-xl font-TextFontRegular text-thirdColor">
                      {t("Menu Image")}:
                    </span>
                    <UploadInput
                      value={menu.image}
                      uploadFileRef={(el) => (imageRefs.current[index] = el)}
                      onClick={() => handleImageClick(index)}
                      placeholder={t("Menu Image")}
                      handleFileChange={(e) => handleImageChange(e, menu.id)}
                      onChange={(e) => setImage(e.target.value)}
                      // onClick={() => handleImageClick(ImageRef)}
                    />
                  </div>
                  <div className="sm:w-full lg:w-[15%] flex items-start justify-start gap-x-1 pt-8">
                    <div className="flex items-center justify-start w-2/4 gap-x-1">
                      <span className="text-xl font-TextFontRegular text-thirdColor">
                        {t("Status")}:
                      </span>
                      <Switch
                        handleClick={() => handleMenuStatus(menu.id)}
                        checked={menu.status}
                      />
                    </div>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      className="px-2 py-2 mt-2 text-lg rounded-md text-mainColor md:mt-8 hover:bg-mainColor hover:text-white"
                      onClick={() => removeMenu(menu.id)}
                    >
                      - {t("Remove")}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 mb-2 text-lg text-mainColor"
              onClick={addMoreMenu}
            >
              + {t("AddMoreMenuImage")}
            </button>

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
                  handleClick={handleMenuAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddMenuPage;
