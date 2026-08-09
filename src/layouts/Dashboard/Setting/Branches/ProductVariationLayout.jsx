import React, { useState } from "react";
import { TitlePage, TitleSection } from "../../../../Components/Components";
import ProductVariationPage from "../../../../Pages/Dashboard/Admin/Setting/Branches/ProductVariationPage";
import { useTranslation } from "react-i18next";

const ProductVariationLayout = () => {
  const { t, i18n } = useTranslation();

  const [update, setUpdate] = useState(false);
  return (
    <>
      <TitlePage text={t("ProductsVariation")} />
      <ProductVariationPage refetch={update} />
    </>
  );
};

export default ProductVariationLayout;
