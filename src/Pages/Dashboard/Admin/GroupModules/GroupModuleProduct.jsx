import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  StaticLoader,
  Switch,
  TitlePage,
  TextInput,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useAuth } from "../../../../Context/Auth";
import { t } from "i18next";
import { IoArrowBack, IoPricetagOutline } from "react-icons/io5";

const GroupModuleProducts = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { groupId } = useParams();
  const location = useLocation();
  const auth = useAuth();

  // Main products list
  const { refetch: refetchGroupProducts, loading: loadingGroupProducts, data: dataGroupProducts } = useGet({
    url: `${apiUrl}/admin/group_price/${groupId}`,
  });

  const { changeState: changePrice } = useChangeState();
  const { changeState: changeStatus } = useChangeState();

  const [products, setProducts] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceValue, setPriceValue] = useState("");
  const [loadingActions, setLoadingActions] = useState({});

  // Variations Modal
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variations, setVariations] = useState([]);

  // Track editing + saving state for variation options
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [optionPriceValue, setOptionPriceValue] = useState("");
  const [savingOptionId, setSavingOptionId] = useState(null);
  const [savingOptionPrice, setSavingOptionPrice] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch variations
  const {
    data: variationsData,
    loading: loadingVariations,
    refetch: fetchVariations,
  } = useGet({
    url: selectedProduct
      ? `${apiUrl}/admin/group_price/variations/${selectedProduct.product_id}/${groupId}`
      : null,
  });

  // Save variation price
  const { postData: saveVariationPrice, loadingPost: savingVariation, response } = usePost({
    url: `${apiUrl}/admin/group_price/variations_price`,
  });

  // Load products
  useEffect(() => {
    if (dataGroupProducts?.products) {
      setProducts(dataGroupProducts.products);
      if (location.state?.groupName) setGroupName(location.state.groupName);
    }
  }, [dataGroupProducts, location.state]);

  // Update variations when loaded
  useEffect(() => {
    if (variationsData) {
      setVariations(variationsData.virations || variationsData.variations || []);
    }
  }, [variationsData]);

  const openVariations = (product) => {
    setSelectedProduct(product);
    setShowVariationsModal(true);
    setEditingOptionId(null);
    setSavingOptionId(null);
    setSavingOptionPrice(null);
    fetchVariations();
  };

  // Start editing variation option price
  const startEditOption = (optionId, currentPrice) => {
    setEditingOptionId(optionId);
    setOptionPriceValue(currentPrice?.toString() || "0");
  };

  // Cancel editing
  const cancelEditOption = () => {
    setEditingOptionId(null);
    setOptionPriceValue("");
  };

  // Save variation option price
  const handleSaveVariationPrice = async (optionId) => {
    const price = parseFloat(optionPriceValue);
    if (isNaN(price) || price < 0) {
      auth.toastError(t("Please enter a valid price"));
      return;
    }

    // Store the values we will need after the request finishes
    setSavingOptionId(optionId);
    setSavingOptionPrice(price);

    await saveVariationPrice({
      option_id: optionId,
      group_product_id: groupId,
      price: price,
    });
  };

  // React to successful variation price save
  useEffect(() => {
    if (
      response &&
      response.status === 200 &&
      !savingVariation &&
      savingOptionId !== null &&
      savingOptionPrice !== null
    ) {
      auth.toastSuccess(t("Variation price updated successfully"));

      setVariations((prev) =>
        prev.map((group) => ({
          ...group,
          options: group.options.map((opt) =>
            opt.id === savingOptionId ? { ...opt, price: savingOptionPrice } : opt
          ),
        }))
      );

      // Cleanup
      setSavingOptionId(null);
      setSavingOptionPrice(null);
      cancelEditOption();
    }
  }, [response, savingVariation, savingOptionId, savingOptionPrice]);

  // Base product price save
  const handleSavePrice = async (productId) => {
    const price = parseFloat(priceValue);
    if (isNaN(price) || price < 0) {
      auth.toastError(t("Invalid price"));
      return;
    }

    setLoadingActions((prev) => ({ ...prev, [`price_${productId}`]: true }));

    const url = `${apiUrl}/admin/group_price/price?product_id=${productId}&group_product_id=${groupId}&price=${price}`;

    try {
      const success = await changePrice(url, t("Price updated"));
      if (success) {
        setProducts((prev) =>
          prev.map((p) => (p.product_id === productId ? { ...p, price } : p))
        );
        setEditingPrice(null);
        setPriceValue("");
      }
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`price_${productId}`]: false }));
    }
  };

  // Base product status toggle
  const handleChangeStatus = async (productId, currentStatus) => {
    const newStatus = !currentStatus;
    setLoadingActions((prev) => ({ ...prev, [`status_${productId}`]: true }));

    const url = `${apiUrl}/admin/group_price/status?product_id=${productId}&group_product_id=${groupId}&status=${newStatus ? 1 : 0}`;

    try {
      await changeStatus(url, t("Status updated"));
      setProducts((prev) =>
        prev.map((p) => (p.product_id === productId ? { ...p, status: newStatus } : p))
      );
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`status_${productId}`]: false }));
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(product =>
    product?.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const headers = [t("SL"), t("Product Name"), t("Price"), t("Status"), t("Change Price"), t("Variations")];

  return (
    <div className="flex flex-col w-full p-2 md:p-4 pb-32 overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-mainColor hover:text-red-700">
            <IoArrowBack size={28} />
          </button>
          <TitlePage text={`${t("Group Module")}: ${groupName || "..."}`} size="text-xl" />
        </div>
      </div>


      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">

        <div className="flex flex-wrap gap-4 bg-white p-2 rounded-2xl shadow-sm w-fit">

          <p className="text-xl font-medium text-mainColor">
            {t("Total Products")}: {products.length}
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder={t("Search by product name...")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-80 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mainColor/20 focus:border-mainColor transition-all shadow-sm"
          />
        </div>
      </div>

      {loadingGroupProducts ? (
        <div className="flex justify-center py-20">
          <StaticLoader />
        </div>
      ) : (
        <>
          {/* Main Table */}
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full min-w-max bg-white">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-6 py-4 text-center text-sm font-medium text-mainColor uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product, i) => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-center">{(currentPage - 1) * productsPerPage + i + 1}</td>
                    <td className="px-6 py-4 text-center font-medium">{product.product_name}</td>
                    <td className="px-6 py-4 text-center">
                      {editingPrice === product.product_id ? (
                        <TextInput
                          type="number"
                          step="0.01"
                          min="0"
                          value={priceValue}
                          onChange={(e) => setPriceValue(e.target.value)}
                          className="w-28 mx-auto text-center"
                        />
                      ) : (
                        <span className="font-bold text-green-600">{product.price || 0} EGP</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={!!product.status}
                        handleClick={() => handleChangeStatus(product.product_id, product.status)}
                        disabled={loadingActions[`status_${product.product_id}`]}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingPrice === product.product_id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleSavePrice(product.product_id)}
                            disabled={loadingActions[`price_${product.product_id}`]}
                            className="px-4 py-2 bg-green-600 text-white rounded text-sm"
                          >
                            {loadingActions[`price_${product.product_id}`] ? t("Saving...") : t("Save")}
                          </button>
                          <button
                            onClick={() => {
                              setEditingPrice(null);
                              setPriceValue("");
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded text-sm"
                          >
                            {t("Cancel")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPrice(product.product_id);
                            setPriceValue(product.price?.toString() || "0");
                          }}
                          className="px-5 py-2 bg-mainColor text-white rounded text-sm"
                        >
                          {t("Change Price")}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openVariations(product)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition"
                      >
                        <IoPricetagOutline size={26} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-5 py-2 bg-mainColor text-white rounded disabled:opacity-50"
              >
                {t("Prev")}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-4 py-2 rounded-full ${currentPage === p ? "bg-mainColor text-white" : "bg-gray-200"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-mainColor text-white rounded disabled:opacity-50"
              >
                {t("Next")}
              </button>
            </div>
          )}
        </>
      )}

      {/* Variations Modal */}
      {showVariationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-8 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-mainColor">
                {t("Variations")} — {selectedProduct?.product_name}
              </h2>
              <button
                onClick={() => setShowVariationsModal(false)}
                className="text-4xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <div className="p-8">
              {loadingVariations ? (
                <div className="flex justify-center py-20">
                  <StaticLoader />
                </div>
              ) : variations.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-12">{t("No variations found")}</p>
              ) : (
                <div className="space-y-8">
                  {variations.map((group) => (
                    <div key={group.id} className="border rounded-xl p-6 bg-gray-50">
                      <h3 className="text-xl font-bold text-mainColor mb-5">{group.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {group.options.map((option) => (
                          <div key={option.id} className="bg-white border rounded-lg p-5 shadow hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-semibold text-gray-800">{option.name}</p>
                              </div>
                            </div>

                            {/* Price Display / Edit */}
                            <div className="flex items-center justify-between">
                              {editingOptionId === option.id ? (
                                <>
                                  <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={optionPriceValue}
                                    onChange={(e) => setOptionPriceValue(e.target.value)}
                                    className="w-32 text-center"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 ml-3">
                                    <button
                                      onClick={() => handleSaveVariationPrice(option.id)}
                                      disabled={savingVariation}
                                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                    >
                                      {savingVariation ? t("Saving...") : "OK"}
                                    </button>
                                    <button
                                      onClick={cancelEditOption}
                                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                    >
                                      {t("Cancel")}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="text-xl font-bold text-green-600">
                                    {option.price ?? 0} EGP
                                  </span>
                                  <button
                                    onClick={() => startEditOption(option.id, option.price)}
                                    className="px-4 py-2 bg-mainColor text-white text-sm rounded hover:opacity-90"
                                  >
                                    {t("Change Price")}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupModuleProducts;