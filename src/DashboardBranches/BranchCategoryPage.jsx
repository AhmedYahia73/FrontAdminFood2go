import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { FiSearch, FiFilter, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { useGet } from "../Hooks/useGet";
import { useChangeState } from "../Hooks/useChangeState";
import { StaticLoader, Switch } from "../Components/Components";
import { useAuth } from "../Context/Auth";

const BranchCategoryPage = () => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const isRTL = i18n.language === "ar";

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'options'

  // Fetch Categories
  const {
    refetch: refetchCategories,
    loading: loadingCategories,
    data: dataCategories,
  } = useGet({
    url: `${apiUrl}/branch/branch_categories?locale=${selectedLanguage}`,
  });

  // Fetch Products for selected category
  const {
    refetch: refetchProducts,
    loading: loadingProducts,
    data: dataProducts,
  } = useGet({
    url: selectedCategoryId
      ? `${apiUrl}/branch/products_in_category/${selectedCategoryId}?locale=${selectedLanguage}`
      : null,
  });

  const { changeState, loadingChange } = useChangeState();

  useEffect(() => {
    if (dataCategories && dataCategories.categories) {
      setCategories(dataCategories.categories);
      if (dataCategories.categories.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(dataCategories.categories[0].id);
      }
    }
  }, [dataCategories]);

  useEffect(() => {
    if (dataProducts && dataProducts.products) {
      setProducts(dataProducts.products);
    } else {
      setProducts([]);
    }
  }, [dataProducts]);

  const handleCategorySelect = (id) => {
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(id);
    }
  };

  const handleStatusChange = async (product) => {
    const newStatus = product.status === 1 ? 0 : 1;
    const response = await changeState(
      `${apiUrl}/branch/branch_product_status/${product.id}`,
      `${product.name} ${t("statusUpdated")}`,
      { status: newStatus }
    );
    if (response) {
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p)
      );
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-2 md:p-6 shadow-sm border-b shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("menuManagement")}</h1>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <FiSearch className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} />
            <input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-mainColor/20 border-transparent transition text-lg`}
            />
          </div>
          {/* <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition">
            <FiFilter />
            <span>{t("filter")}</span>
          </button> */}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className={`w-80 bg-white border-${isRTL ? 'l' : 'r'} overflow-y-auto shrink-0 scrollPage`}>
            {loadingCategories ? (
              <div className="p-8 flex justify-center"><StaticLoader /></div>
            ) : (
              <div className="p-2 space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition ${selectedCategoryId === category.id
                      ? "bg-mainColor/5 text-mainColor border border-mainColor/20"
                      : "text-gray-600 hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-lg">{category.name}</span>
                    </div>
                    {isRTL ? <FiChevronLeft /> : <FiChevronRight />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Products Main Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollPage">
            {loadingProducts ? (
              <div className="flex justify-center items-center h-64"><StaticLoader /></div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-700">{selectedCategory?.name}</h2>
                  <span className="text-gray-400 text-sm">{filteredProducts.length} {t("Products")}</span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">{t("noProductsFound")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col xl:flex-row items-center gap-6 hover:shadow-md transition">
                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                          <img
                            src={product.image_link || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                          <div className="mt-2 text-mainColor font-bold text-lg">
                            {product.price} {t("egp")}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <Switch
                            checked={product.status === 1}
                            handleClick={() => handleStatusChange(product)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile View (Accordion) */}
        <div className="flex lg:hidden flex-1 flex-col overflow-y-auto p-4 space-y-2 scrollPage">
          {loadingCategories ? (
            <div className="p-8 flex justify-center"><StaticLoader /></div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full flex items-center justify-between p-5 transition ${selectedCategoryId === category.id
                    ? "bg-mainColor/5 text-mainColor"
                    : "text-gray-700"
                    }`}
                >
                  <span className="font-bold text-lg">{category.name}</span>
                  <div className={`transition-transform duration-300 ${selectedCategoryId === category.id ? 'rotate-90' : ''}`}>
                    {isRTL ? <FiChevronLeft /> : <FiChevronRight />}
                  </div>
                </button>

                {selectedCategoryId === category.id && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    {loadingProducts ? (
                      <div className="flex justify-center p-4"><StaticLoader /></div>
                    ) : (
                      <div className="space-y-4">
                        {filteredProducts.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">{t("noProductsFound")}</p>
                        ) : (
                          filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={product.image_link || "/placeholder.png"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-800 truncate">{product.name}</h3>
                                <div className="text-mainColor font-bold text-sm">
                                  {product.price} {t("egp")}
                                </div>
                              </div>
                              <Switch
                                checked={product.status === 1}
                                handleClick={() => handleStatusChange(product)}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchCategoryPage;
