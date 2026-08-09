import { useEffect, useState } from "react";
import { useGet } from "../../Hooks/useGet";
import { StaticLoader } from "../../Components/Components";
import { EditIcon } from "../../Assets/Icons/AllIcons";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BranchCustomer = ({ refetch, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [openAddressView, setOpenAddressView] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null); // إضافة customer_id
  const navigate = useNavigate();
  
  const { refetch: refetchTaxes, loading: loadingTaxes, data: dataTaxes } = useGet({
    url: `${apiUrl}/branch/customer`,
  });

  const [customers, setCustomers] = useState([]);
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const taxesPerPage = 20;

  const totalPages = Math.ceil(customers.length / taxesPerPage);

  const currentTaxes = customers.slice(
    (currentPage - 1) * taxesPerPage,
    currentPage * taxesPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    refetchTaxes();
  }, [refetchTaxes, refetch]);

  useEffect(() => {
    if (dataTaxes && dataTaxes.customers) {
      setCustomers(dataTaxes.customers);
    }
  }, [dataTaxes]);

  const headers = [t("sl"), t("name"), t("phone"), t("addresses"), t("actions")];

  const handleEditClick = (customer) => {
    setCurrentCustomer(customer);
    setCustomerName(customer?.name || "");
    setCustomerPhone(customer?.phone || "");
    setOpenEditModal(true);
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    const updatedData = {
      name: customerName,
      phone: customerPhone,
    };

    try {
      const response = await fetch(
        `${apiUrl}/branch/customer/update/${currentCustomer.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        toast.success(t("Customer updated successfully"));
        setOpenEditModal(false);
        refetchTaxes();
      } else {
        toast.error(t("Error updating customer"));
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error(t("Error updating customer"));
    }
  };

  const handleViewAddress = (addresses, customerId) => {
    if (addresses) {
      setOpenAddressView(true);
      setSelectedAddress(addresses);
      setSelectedCustomerId(customerId); // حفظ customer_id
    } else {
      setOpenAddressView(false);
    }
  };

  // Handle Add button click - مع تمرير customer_id
  const onAdd = () => {
    navigate('address-add', { 
      state: { 
        customer_id: selectedCustomerId 
      } 
    });
  };

  // Handle Edit button click - مع تمرير address data و customer_id
  const onEdit = (address) => {
    navigate(`edit-address/${address.id}`, { 
      state: { 
        address: address,
        customer_id: selectedCustomerId 
      } 
    });
  };

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll py-16 scrollSection">
      {loadingTaxes ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-TextFontSemiBold text-mainColor">
              {t("Branch Customers")}
            </h2>
            <Link
              to="add"
              className="flex items-center gap-2 px-4 py-2 bg-mainColor text-white rounded-lg hover:bg-mainColor/90 transition-colors"
            >
              <span className="text-xl">+</span>
              <span>{t("Add Customer")}</span>
            </Link>
          </div>

          <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
            <thead className="w-full">
              <tr className="w-full border-b-2">
                {headers.map((name, index) => (
                  <th
                    className="min-w-[120px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3"
                    key={index}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="w-full">
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-xl text-center text-mainColor font-TextFontMedium py-8"
                  >
                    {t("Not find customers")}
                  </td>
                </tr>
              ) : (
                currentTaxes.map((tax, index) => (
                  <tr className="w-full border-b-2" key={index}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * taxesPerPage + index + 1}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {tax?.name || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {tax?.phone || "-"}
                    </td>
                    <td className="min-w-[80px] py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <span
                        className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                        onClick={() => handleViewAddress(tax?.addresses, tax?.id)} 
                      >
                        {t("View")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(tax)}
                          className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <EditIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {customers.length > 0 && (
            <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
              {currentPage !== 1 && (
                <button
                  type="button"
                  className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  {t("Prev")}
                </button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${
                      currentPage === page
                        ? "bg-mainColor text-white"
                        : " text-mainColor"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              {totalPages !== currentPage && (
                <button
                  type="button"
                  className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  {t("Next")}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        {openAddressView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white max-h-[70vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl relative animate-fade-in">
              <div className="flex justify-between items-center mb-6 max-h-[50vh]">
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("Address")}
                </h2>
                <div className="flex space-x-2">
                  <button
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => onAdd()}
                    aria-label="Add new address"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setOpenAddressView(false)}
                    aria-label="Close dialog"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="text-gray-600 text-base space-y-6">
                {selectedAddress && selectedAddress.length > 0 ? (
                  selectedAddress.map((address, index) => (
                    <div key={index} className="border-l-4 border-mainColor pl-4 py-2 flex justify-between items-start">
                      <div className="grid grid-cols-1 gap-2">
                        <p className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-mainColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="font-medium">{t("Address")}:</span> {address.address}
                        </p>
                        <p><span className="font-medium">{t("Street")}:</span> {address.street}</p>
                        <p><span className="font-medium">{t("Building number")}:</span> {address.building_num}</p>
                        <p><span className="font-medium">{t("Floor number")}:</span> {address.floor_num}</p>
                        <p><span className="font-medium">{t("Apartment")}:</span> {address.apartment}</p>
                        <p><span className="font-medium">{t("Additional data")}:</span> {address.additional_data}</p>
                        <a
                          href={address.map}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-mainColor hover:text-mainColor/80 flex items-center underline"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          {t("View on Map")}
                        </a>
                      </div>
                      <button
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => onEdit(address)}
                        aria-label={`Edit address ${address.address}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 italic">{t("No Address available")}</p>
                )}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  className="px-6 py-2 text-white bg-mainColor rounded-xl hover:bg-mainColor/90 transition-colors duration-300 font-medium"
                  onClick={() => setOpenAddressView(false)}
                >
                  {t("Close")}
                </button>
              </div>
            </div>
          </div>
        )}
        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
    }
  `}</style>
</div>


      {/* Modal for Editing Customer */}
      {openEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-TextFontSemiBold text-mainColor mb-4">
              {t("Edit Customer")}
            </h2>
            <div className="mb-4">
              <label className="block text-sm text-thirdColor mb-2">
                {t("Name")}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-thirdColor mb-2">
                {t("Phone")}
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-white bg-mainColor rounded-xl hover:bg-mainColor/90 duration-300"
                onClick={handleSaveChanges}
              >
                {t("Save")}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-white bg-gray-500 rounded-xl hover:bg-gray-500/90 duration-300 ml-4"
                onClick={() => setOpenEditModal(false)}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchCustomer;
