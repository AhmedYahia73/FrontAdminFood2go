import React, { useEffect, useState, useCallback } from "react";
import { useGet } from "../../../../Hooks/useGet";
import { useDelete } from "../../../../Hooks/useDelete";
import { StaticLoader } from "../../../../Components/Components";
import { Link } from "react-router-dom";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuth } from "../../../../Context/Auth";
import { useSelector } from "react-redux";
import Select from "react-select";

const TaxesPage = ({ refetch, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const auth = useAuth();
  const { t } = useTranslation();
  const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");

  // 1. Data Fetching
  const { refetch: refetchTaxes, loading: loadingTaxes, data: dataTaxes } = useGet({
    url: `${apiUrl}/admin/settings/tax?locale=${selectedLanguage}`,
  });

  const { data: allListsData } = useGet({
    url: `${apiUrl}/admin/tax_product/lists?locale=${selectedLanguage}`,
  });

  const { data: branchListsData } = useGet({
    url: `${apiUrl}/admin/tax_module/lists?locale=${selectedLanguage}`,
  });

  // 2. Local State
  const [taxes, setTaxes] = useState([]);
  const [targetTaxId, setTargetTaxId] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(false);

  const [viewModal, setViewModal] = useState(false);
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedOnlineTypes, setSelectedOnlineTypes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const taxesPerPage = 10;

  // 3. API Handlers
  const handleViewProducts = (taxId) => {
    setTargetTaxId(taxId);
    setAssignedProducts([]);
    setViewModal(true);
    fetchAssignedProducts(taxId);
  };

  const handleAddProducts = (taxId) => {
    setTargetTaxId(taxId);
    setAssignedProducts([]);
    setSelectedProductIds([]);
    setFilterCategory("all");
    setSelectedBranches([]); // Reset branch
    setSelectedModules([]); // Reset module
    setSelectedOnlineTypes([]); // Reset type
    setAddModal(true);
    fetchAssignedProducts(taxId);
  };

  const fetchAssignedProducts = useCallback(async (taxId) => {
    if (!taxId) return;
    setLoadingAssigned(true);
    try {
      const response = await axios.get(`${apiUrl}/admin/tax_product/view_products/${taxId}?locale=${selectedLanguage}`, {
        headers: { 'Authorization': `Bearer ${auth?.userState?.token}` }
      });
      const products = response.data.products || [];
      setAssignedProducts(products);
      setSelectedProductIds(products.map(p => p.id));
    } catch (error) {
      console.error("Error fetching assigned products", error);
    } finally {
      setLoadingAssigned(false);
    }
  }, [apiUrl, auth?.userState?.token]);

  const { deleteData, loadingDelete } = useDelete();

  const handleDelete = async () => {
    const success = await deleteData(`${apiUrl}/admin/settings/tax/delete/${targetTaxId}`);
    if (success) {
      setDeleteModal(false);
      refetchTaxes();
    }
  };

  /* 
    4. Derived State for Modules 
    If the API returns a list of modules, use them. Otherwise fallback to hardcoded strings.
  */
  const moduleOptions = branchListsData?.modules || branchListsData?.tax_modules
    ? (branchListsData?.modules || branchListsData?.tax_modules).map(m => ({ value: m.id || m.key || m.name, label: m.name || m.label, is_online: m.type === 'online' || m.name === 'Online' }))
    : [
      { value: "take_away", label: t("Take Away") },
      { value: "delivery", label: t("Delivery") },
      { value: "dine_in", label: t("Dine In") },
    ];

  const onlineTypeOptions = [
    { value: "app", label: t("App") },
    { value: "web", label: t("Web") },
  ];

  const handleSubmitSelection = async () => {
    if (selectedBranches.length === 0) {
      auth.toastError(t("Please select at least one branch"));
      return;
    }
    if (selectedModules.length === 0) {
      auth.toastError(t("Please select at least one module"));
      return;
    }

    setLoadingAction(true);
    const formData = new FormData();
    formData.append("tax_id", targetTaxId);

    // Send products as a flat list
    selectedProductIds.forEach((productId, i) => {
      formData.append(`products[${i}]`, productId);
    });

    // Send branches as a flat list
    selectedBranches.forEach((branchId, i) => {
      formData.append(`branch_id[${i}]`, branchId);
    });

    // Send modules as a flat list
    selectedModules.forEach((moduleId, i) => {
      formData.append(`tax_modules[${i}]`, moduleId);
    });

    // Send types as a flat list (only if any online module is selected)
    const hasOnlineModule = selectedModules.some(moduleId =>
      ["take_away", "delivery", "online"].includes(String(moduleId))
      || moduleOptions.find(m => m.value == moduleId)?.is_online
    );
    if (hasOnlineModule) {
      const typesToUse = selectedOnlineTypes.length > 0 ? selectedOnlineTypes : ["all"];
      typesToUse.forEach((onlineType, i) => {
        formData.append(`type[${i}]`, onlineType);
      });
    }

    try {
      await axios.post(`${apiUrl}/admin/tax_product/selecte_products`, formData, {
        headers: {
          'Authorization': `Bearer ${auth?.userState?.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setAddModal(false);
      refetchTaxes();
    } catch (error) {
      console.error("Submit failed", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleSelection = (productId) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const masterProductList = [...(allListsData?.products || []), ...assignedProducts].reduce((acc, current) => {
    if (!acc.find(item => item.id === current.id)) acc.push(current);
    return acc;
  }, []);

  const availableProducts = (allListsData?.products || []).filter(p => {
    const isInCategory = filterCategory === "all" || p.category_id === parseInt(filterCategory) || p.sub_category_id === parseInt(filterCategory);
    return isInCategory && !selectedProductIds.includes(p.id);
  });

  const selectedProductsDetails = masterProductList.filter(p => selectedProductIds.includes(p.id));

  const branchOptions = branchListsData?.branches?.map((branch) => ({
    value: branch.id,
    label: branch.name,
  })) || [];

  const handleMultiSelectChange = (selected, allOptions, setter) => {
    if (selected && selected.some(opt => opt.value === 'all')) {
      setter(allOptions.map(o => o.value));
    } else {
      setter(selected ? selected.map(o => o.value) : []);
    }
  };

  const isSelectedHasOnline = selectedModules.some(moduleId => {
    return ["take_away", "delivery", "online"].includes(String(moduleId)) || moduleOptions.find(m => m.value == moduleId)?.is_online;
  });

  const indexOfLastTax = currentPage * taxesPerPage;
  const indexOfFirstTax = indexOfLastTax - taxesPerPage;
  const currentTaxes = taxes.slice(indexOfFirstTax, indexOfLastTax);
  const totalPages = Math.ceil(taxes.length / taxesPerPage);

  useEffect(() => { refetchTaxes(); }, [refetchTaxes, refetch]);
  useEffect(() => { if (dataTaxes?.taxes) setTaxes(dataTaxes.taxes); }, [dataTaxes]);

  const headers = [t("sl"), t("name"), t("amount"), t("Products"), t("action")];

  return (
    <div className="flex flex-col w-full p-2 md:p-4">
      {loadingTaxes ? (
        <div className="flex items-center justify-center h-56"><StaticLoader /></div>
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-center border-collapse min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((name, index) => (
                    <th key={index} className="p-3 text-mainColor font-bold border-b whitespace-nowrap">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTaxes.map((tax, index) => (
                  <tr className="hover:bg-gray-50 border-b" key={tax.id}>
                    <td className="p-3">{(currentPage - 1) * taxesPerPage + index + 1}</td>
                    <td className="p-3 whitespace-nowrap">{tax.name}</td>
                    <td className="p-3">{tax.type === "precentage" ? `${tax.amount}%` : tax.amount}</td>
                    <td className="p-3">
                      <button onClick={() => handleViewProducts(tax.id)} className="text-mainColor underline italic">
                        {t("view products")}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleAddProducts(tax.id)} className="text-2xl text-green-600 font-bold">+</button>
                        <Link to={`edit/${tax.id}`}><EditIcon /></Link>
                        <button onClick={() => { setTargetTaxId(tax.id); setDeleteModal(true); }} className="text-red-500 hover:scale-110 transition-transform">
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6 gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50">{t("Previous")}</button>
            <span className="font-medium text-sm">{t("Page")} {currentPage} {t("of")} {totalPages || 1}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50">{t("Next")}</button>
          </div>

          {/* DELETE MODAL */}
          <Dialog open={deleteModal} onClose={() => setDeleteModal(false)} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/40" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="bg-white p-6 rounded-lg max-w-sm w-full text-center shadow-xl">
                <h3 className="text-lg font-bold mb-4">{t("Are you sure you want to delete this tax?")}</h3>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded-md">{t("Cancel")}</button>
                  <button onClick={handleDelete} disabled={loadingDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">{loadingDelete ? t("Deleting...") : t("Delete")}</button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>

          {/* ADD/MANAGE MODAL */}
          <Dialog open={addModal} onClose={() => setAddModal(false)} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/40" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-2xl">
                {loadingAssigned ? (
                  <div className="h-96 flex items-center justify-center"><StaticLoader /></div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 md:mb-6 gap-3">
                      <h3 className="text-2xl font-bold text-mainColor">{t("TaxProducts")}</h3>
                      <select
                        className="border p-2 rounded-lg"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <option value="all">{t("FilterbyCategory")}</option>
                        {allListsData?.categories?.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[250px]">
                      <div className="border rounded-xl flex flex-col overflow-hidden bg-white">
                        <div className="bg-gray-100 p-3 font-bold border-b flex justify-between items-center">
                          <span>{t("AvailableProducts")}</span>
                          <button onClick={() => {
                             setSelectedProductIds(prev => [...new Set([...prev, ...availableProducts.map(p => p.id)])]);
                          }} className="text-sm text-mainColor underline hover:text-green-600">
                            {t("Select All")}
                          </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                          {availableProducts.length > 0 ? availableProducts.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 border-b">
                              <span className="text-sm">{p.name}</span>
                              <button onClick={() => toggleSelection(p.id)} className="bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center">+</button>
                            </div>
                          )) : <p className="text-center text-gray-400 mt-10">{t("No products found")}</p>}
                        </div>
                      </div>
                      <div className="border rounded-xl flex flex-col bg-gray-50 overflow-hidden">
                        <div className="bg-mainColor text-white p-3 font-bold border-b flex justify-between items-center">
                          <span>{t("Selected")} ({selectedProductIds.length})</span>
                          <button onClick={() => setSelectedProductIds([])} className="text-sm underline hover:text-red-200">
                            {t("Clear All")}
                          </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                          {selectedProductsDetails.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 border-b bg-white mb-1 shadow-sm rounded px-3">
                              <span className="text-sm">{p.name}</span>
                              <button onClick={() => toggleSelection(p.id)} className="text-red-500 font-bold text-lg">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Branch & Module Selection Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 min-h-[150px] border-t">
                      {/* Branch Select */}
                      <div className="flex flex-col gap-2 z-30 relative">
                        <label className="font-bold text-gray-700">{t("Select Branch")}</label>
                        <Select
                           isMulti
                           options={[{ value: 'all', label: t('Select All') }, ...branchOptions]}
                           value={branchOptions.filter(o => selectedBranches.includes(o.value))}
                           onChange={(selected) => handleMultiSelectChange(selected, branchOptions, setSelectedBranches)}
                           placeholder={t("Select Branches...")}
                           className="w-full text-black"
                           classNamePrefix="select"
                           closeMenuOnSelect={false}
                        />
                      </div>

                      {/* Module Select */}
                      <div className="flex flex-col gap-2 z-20 relative">
                        <label className="font-bold text-gray-700">{t("Select Module")}</label>
                        <Select
                           isMulti
                           options={[{ value: 'all', label: t('Select All') }, ...moduleOptions]}
                           value={moduleOptions.filter(o => selectedModules.includes(o.value))}
                           onChange={(selected) => handleMultiSelectChange(selected, moduleOptions, setSelectedModules)}
                           placeholder={t("Select Modules...")}
                           className="w-full text-black"
                           classNamePrefix="select"
                           closeMenuOnSelect={false}
                        />
                      </div>

                      {/* Online Type Select (Conditional) */}
                      {isSelectedHasOnline && (
                        <div className="flex flex-col gap-2 z-10 relative">
                          <label className="font-bold text-gray-700">{t("Online Type")}</label>
                          <Select
                             isMulti
                             options={[{ value: 'all', label: t('Select All') }, ...onlineTypeOptions]}
                             value={onlineTypeOptions.filter(o => selectedOnlineTypes.includes(o.value))}
                             onChange={(selected) => handleMultiSelectChange(selected, onlineTypeOptions, setSelectedOnlineTypes)}
                             placeholder={t("Select Online Types...")}
                             className="w-full text-black"
                             classNamePrefix="select"
                             closeMenuOnSelect={false}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end mt-6 gap-3">
                      <button onClick={() => setAddModal(false)} className="px-6 py-2 border rounded-lg">{t("Cancel")}</button>
                      <button onClick={handleSubmitSelection} className="bg-mainColor text-white px-8 py-2 rounded-lg font-bold disabled:opacity-50" disabled={loadingAction}>
                        {loadingAction ? t("Saving...") : t("Save Changes")}
                      </button>
                    </div>
                  </>
                )}
              </DialogPanel>
            </div>
          </Dialog>

          {/* VIEW MODAL */}
          <Dialog open={viewModal} onClose={() => setViewModal(false)} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/40" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="w-full max-w-md bg-white p-6 rounded-lg shadow-2xl">
                <h3 className="text-xl font-bold text-mainColor mb-4 border-b pb-2">{t("Assigned Products")}</h3>
                <div className="min-h-[200px] max-h-60 overflow-y-auto flex flex-col">
                  {loadingAssigned ? (
                    <div className="flex-1 flex items-center justify-center"><StaticLoader /></div>
                  ) : assignedProducts.length > 0 ? (
                    assignedProducts.map(p => <div key={p.id} className="p-2 border-b text-gray-700">{p.name}</div>)
                  ) : (
                    <div className="flex-1 flex items-center justify-center"><p className="text-gray-400 py-4">{t("No products assigned")}</p></div>
                  )}
                </div>
                <button className="mt-6 w-full bg-mainColor text-white py-2 rounded-md font-bold" onClick={() => setViewModal(false)}>{t("Close")}</button>
              </DialogPanel>
            </div>
          </Dialog>
        </>
      )
      }
    </div >
  );
};

export default TaxesPage;