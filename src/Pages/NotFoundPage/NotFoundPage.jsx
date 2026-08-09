import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
         const { t, i18n } = useTranslation();
       
  return (
    <>
      <section className="bg-white h-[100vh] flex justify-center">
        <div className="max-w-screen-xl m-auto">
          <div className="mx-auto text-center max-w-screen">
            <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-[#D01025]">
              404
            </h1>
            <p className="mb-4 text-3xl tracking-tight ltr font-TextFontSemiBold md:text-4xl">
              {t("NotFoundPage")}
            </p>
            {/* <Link to="/" className="inline-flex text-white bg-[#D01025] hover:bg-[#8d1c29] focus:ring-4 focus:outline-none focus:ring-primary-300 font-TextFontMedium rounded-lg text-sm px-5 py-2.5 text-center my-4">الرجوع الى الصفحة الرئيسية</Link> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFoundPage;
