import React, { useEffect , useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useGet } from "../../../../Hooks/useGet";

const BannerProductsModal = ({ isOpen, onClose, banner }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchBanners,
    loading: loadingBanners,
    data: dataBanners,
  } = useGet({
    url: `${apiUrl}/admin/banner/lists/${banner?.id}`,
  });
  
  useEffect(() => {
    refetchBanners();
  }, [refetchBanners]);

 useEffect(() => {
    if (dataBanners && dataBanners?.categories?.length > 0 && dataBanners?.products?.length > 0) {
      setCategories(dataBanners.categories)
      setProducts(dataBanners.products)
    }
  }, [dataBanners]); // Only run this effect when `data` changes
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                {t("Banner Products & Categories")}
              </DialogTitle>
              
              <div className="space-y-6">
                {/* Categories Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">{t("Categories")}:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {categories.length > 0 ? (
                        categories.map((cat, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {cat.name || cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">{t("No categories assigned")}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products Section */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">{t("Products")}:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {products.length > 0 ? (
                        products.map((prod, i) => (
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

export default BannerProductsModal;
