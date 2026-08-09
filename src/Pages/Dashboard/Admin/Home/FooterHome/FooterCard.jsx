import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FooterCard = ({
  title,
  link,
  layout,
  topCustomers,
  topSelling,
  offers,
}) => {
  const {  t,i18n } = useTranslation();
  const FooterContent = () => {

    switch (layout) {
      case "TopSelling": {
        return (
          <div className="w-full h-[170px] flex flex-col gap-y-4 pb-2 overflow-y-scroll scrollDrop">
            {topSelling.length === 0 ? (
              <div className="flex items-center justify-center w-full text-xl text-center h-4/5 font-TextFontMedium text-mainColor">
                {t("NotTopSellingProductsFound")}
              </div>
            ) : (
              topSelling.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-4 space-x-4 border-b-2 border-gray-300 shadow-md rounded-xl"
                >
                  <img
                    src={order.image_link}
                    loading="lazy"
                    alt="Product"
                    className="object-cover object-center w-20 h-25 rounded-xl"
                  />
                  <div className="flex flex-col items-start w-full">
                    <p className="text-sm font-TextFontMedium">{order.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.description}
                    </p>
                    <p className="text-lg font-TextFontMedium text-mainColor">
                      {order.price}  {t("EGP")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      }
      case "Deals": {
        return (
          <div className="w-full h-[170px] flex flex-col gap-y-4 pb-2 overflow-y-scroll scrollDrop">
            {offers.length === 0 ? (
              <div className="flex items-center justify-center w-full text-xl text-center h-4/5 font-TextFontMedium text-mainColor">
                {t("NotDealsFound")}
              </div>
            ) : (
              offers.map((offer) => (
                <div className="flex flex-col w-full py-3 shadow-md gap-y-2 rounded-2xl"
                  key={offer.id}>
                  <div className="flex justify-start w-full px-3">
                    <div className="w-3/12">
                      <img
                        src={offer.image_link}
                        alt="Offer"
                        loading="lazy"
                        className="object-cover object-center w-20 h-20 rounded-full"
                      />
                    </div>
                    <div className="flex flex-col items-center w-8/12 text-4xl gap-y-2 font-TextFontSemiBold text-mainColor">
                      <span>
                        {offer.title}
                      </span>
                      <span>
                        {offer.price} {t("EGP")}
                      </span>
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <p className="text-gray-500 font-TextFontMedium">
                      {offer.description}, {offer.title}
                    </p>
                  </div>
                </div>

              ))
            )}
          </div>
        );
      }
      default:
        return (
          <div className="w-full h-[170px] flex flex-col gap-y-4 px-2 pb-2 overflow-y-scroll scrollDrop">
            {Object.values(topCustomers).length === 0 ? (
              <div className="flex items-center justify-center w-full text-xl text-center h-4/5 font-TextFontMedium text-mainColor">
                {t("NotCustomersFound")}
              </div>
            ) : (
              Object.values(topCustomers).map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between w-full gap-5 p-4 border-b-2 border-gray-300 shadow-md gap-x-4 rounded-xl "
                >
                  <div className="flex items-center justify-center w-3/12">
                    <img
                      src={customer.image_link}
                      loading="lazy"
                      alt="photo"
                      className="object-cover object-center w-16 h-16 rounded-full"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center w-5/12">
                    <p className="text-gray-500 font-TextFontMedium">{`${customer.name}`}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>

                  <span
                    className="flex items-center justify-center w-3/12 text-mainColor"
                  >
                     {t("Order")}: {customer.orders_count}
                  </span>
                </div>
              ))
            )}
          </div>
        );
    }
  };

  return (
    <div className="sm:w-full  lg:w-[48%] xl:w-[32%] rounded-xl  bg-white py-3 px-4 border border-gray-300 shadow-lg">
      <div className="flex items-center justify-between pb-1 mb-4 border-b-2">
        <h3 className="text-xl font-TextFontSemiBold text-mainColor">{title}</h3>
        <Link
          to={link}
          className="text-sm underline text-mainColor font-TextFontMedium"
        >
          {t("ViewAll")}
        </Link>
      </div>
      {FooterContent()}
    </div>
  );
};

export default FooterCard;
