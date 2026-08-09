import React, { useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useGet } from "../../../../Hooks/useGet";
import { StaticLoader } from "../../../../Components/Components";
import { useTranslation } from "react-i18next";

const DiscountDetailsModal = ({ isOpen, onClose, discount }) => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const discountId = discount?.id;

  const { refetch: fetchSelected, loading: loadingSelected, data: selectedData } = useGet({
    url: `${apiUrl}/admin/settings/discount/show_products/${discountId}`,
  });

  useEffect(() => {
    if (isOpen && discountId) {
      fetchSelected();
    }
  }, [isOpen, discountId]);

  let modules = [];
  if (discount?.module) {
    if (typeof discount.module === 'string') {
      try {
        modules = JSON.parse(discount.module);
      } catch (e) {
        modules = discount.module.split(',');
      }
    } else if (Array.isArray(discount.module)) {
      modules = discount.module;
    }
  }

  const selectedProducts = selectedData?.products || [];
  const selectedCategories = selectedData?.categories || [];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                {t("Discount Details")} - {discount?.name}
              </DialogTitle>
              
              <div className="space-y-6">
                {/* Modules Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">{t("Modules")}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {modules.length > 0 ? (
                      modules.map((mod, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {mod}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">{t("No modules selected")}</span>
                    )}
                  </div>
                </div>

                {/* Categories & Products Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">{t("Assigned Items")}:</h4>
                  {loadingSelected ? (
                    <div className="flex justify-center py-4"><StaticLoader /></div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-600 mb-2">{t("Categories")}</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedCategories.length > 0 ? (
                            selectedCategories.map((cat, i) => (
                              <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {cat.name || cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">{t("No categories assigned")}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-gray-600 mb-2">{t("Products")}</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedProducts.length > 0 ? (
                            selectedProducts.map((prod, i) => (
                              <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                {prod.name || prod}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">{t("No products assigned")}</span>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                {t("Close")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default DiscountDetailsModal;
