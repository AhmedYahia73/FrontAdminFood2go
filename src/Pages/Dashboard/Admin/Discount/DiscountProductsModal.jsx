import React, { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { StaticLoader, SubmitButton } from "../../../../Components/Components";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../Context/Auth";

const DiscountProductsModal = ({ isOpen, onClose, discountId }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. Fetch available categories and products
  const { refetch: fetchAvailable, loading: loadingAvailable, data: availableData } = useGet({
    url: `${apiUrl}/admin/settings/discount/lists/${discountId}`,
  });

  // 2. Fetch already selected products
  const { refetch: fetchSelected, loading: loadingSelected, data: selectedData } = useGet({
    url: `${apiUrl}/admin/settings/discount/show_products/${discountId}`,
  });

  // 3. Post data
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/settings/discount/discount_product`,
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (isOpen && discountId) {
      fetchAvailable();
      fetchSelected();
    }
  }, [isOpen, discountId]);

  useEffect(() => {
    if (availableData) {
      const cats = availableData.categories || [];
      const prods = availableData.products || [];
      setCategories(cats.map(c => ({ value: c.id, label: c.name })));
      setProducts(prods.map(p => ({ value: p.id, label: p.name })));
    }
  }, [availableData]);

  useEffect(() => {
    if (selectedData) {
       const selCats = selectedData.categories || [];
       const selProds = selectedData.products || [];
       setSelectedCategories(selCats.map(c => ({ value: c.id || c, label: c.name || c })));
       setSelectedProducts(selProds.map(p => ({ value: p.id || p, label: p.name || p })));
    }
  }, [selectedData]);

  useEffect(() => {
    if (response) {
       onClose();
    }
  }, [response]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("discount_id", discountId);
    selectedCategories.forEach((c) => formData.append("categories[]", c.value));
    selectedProducts.forEach((p) => formData.append("products[]", p.value));
    postData(formData, t("Products Added Successfully"));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                    {t("Add Products to Discount")}
                  </DialogTitle>
                  
                  {loadingAvailable || loadingSelected || loadingPost ? (
                     <div className="flex justify-center py-10"><StaticLoader /></div>
                  ) : (
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="w-full">
                           <label className="block text-sm font-medium text-gray-700 mb-1">{t("Categories")}</label>
                           <Select
                             isMulti
                             options={categories}
                             value={selectedCategories}
                             onChange={setSelectedCategories}
                             placeholder={t("Select Categories")}
                             menuPortalTarget={document.body}
                             styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                           />
                        </div>
                        <div className="w-full">
                           <label className="block text-sm font-medium text-gray-700 mb-1">{t("Products")}</label>
                           <Select
                             isMulti
                             options={products}
                             value={selectedProducts}
                             onChange={setSelectedProducts}
                             placeholder={t("Select Products")}
                             menuPortalTarget={document.body}
                             styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                           />
                        </div>
                        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                          <SubmitButton
                            text={t("Save")}
                            handleClick={handleSubmit}
                            rounded="rounded-md"
                          />
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:mr-3"
                            onClick={onClose}
                          >
                            {t("Cancel")}
                          </button>
                        </div>
                     </form>
                  )}
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default DiscountProductsModal;
