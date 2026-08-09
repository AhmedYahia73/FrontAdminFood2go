import { usePost } from "../../Hooks/usePostJson";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import AddressMap from "./AddressMap";
import { toast } from 'react-toastify';
import { useGet } from "../../Hooks/useGet";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function BranchAddressAddEdit() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // للحصول على الـ ID من الـ URL
  const location = useLocation();
  
  // تحديد إذا كان Edit أم Add
  const isEdit = Boolean(id);
  
  // الحصول على الداتا الممررة من الصفحة السابقة (في حالة Edit)
  const addressData = location.state?.address;
  const customerIdFromState = location.state?.customer_id;

  const [newAddressData, setNewAddressData] = useState({
    customer_id: "",
    zone_id: "",
    address: "",
    street: "",
    building_num: "",
    floor_num: "",
    apartment: "",
    additional_data: "",
    type: "",
    map: { lat: null, lng: null }
  });

  const [addLoading, setAddLoading] = useState(false);
  const [zones, setZones] = useState([]);

  // Hook for posting/updating address data
  const { postData , loadingPost , response } = usePost({
    url: isEdit 
      ? `${apiUrl}/branch/address/update/${id}`
      : `${apiUrl}/branch/address/add`,
  });

  // Hook for fetching zones data
  const { refetch: refetchZones, data: zonesData } = useGet({
    url: `${apiUrl}/branch/customer`,
  });

  // Fetch zones on component mount
  useEffect(() => {
    refetchZones();
  }, [refetchZones]);

  // Populate zones from API data
  useEffect(() => {
    if (zonesData && zonesData.zones && zonesData.zones.length > 0) {
      setZones(zonesData.zones);
      
      // إذا كان Add، اختر أول zone كـ default
      if (!isEdit) {
        setNewAddressData((prev) => ({
          ...prev,
          zone_id: zonesData.zones[0].id.toString(),
        }));
      }
    } else {
      setZones([]);
    }
  }, [zonesData, isEdit]);

  // تعيين customer_id من الـ state في حالة Add
  useEffect(() => {
    if (!isEdit && customerIdFromState) {
      setNewAddressData((prev) => ({
        ...prev,
        customer_id: customerIdFromState.toString(),
      }));
    }
  }, [isEdit, customerIdFromState]);

  // في حالة Edit، املأ البيانات
  useEffect(() => {
    if (isEdit && addressData) {
      // تحويل الـ map string إلى object
      let mapData = { lat: null, lng: null };
      if (addressData.map && typeof addressData.map === 'string') {
        const coords = addressData.map.split(',');
        if (coords.length === 2) {
          mapData = {
            lat: parseFloat(coords[0]),
            lng: parseFloat(coords[1])
          };
        }
      } else if (addressData.map && typeof addressData.map === 'object') {
        mapData = addressData.map;
      }

      setNewAddressData({
        customer_id: customerIdFromState || addressData.customer_id || "",
        zone_id: addressData.zone_id?.toString() || "",
        address: addressData.address || "",
        street: addressData.street || "",
        building_num: addressData.building_num || "",
        floor_num: addressData.floor_num || "",
        apartment: addressData.apartment || "",
        additional_data: addressData.additional_data || "",
        type: addressData.type || "",
        map: mapData
      });
    }
  }, [isEdit, addressData, customerIdFromState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddressData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMapLocationSelect = (location) => {
    setNewAddressData((prev) => ({
      ...prev,
      map: location,
    }));
  };

  useEffect(() => {
     if (response && response?.data.success) {
        toast.success(
          isEdit 
            ? t("Address updated successfully") 
            : t("Address added successfully")
        );
        
        // إعادة تعيين النموذج في حالة Add
        if (!isEdit) {
          setNewAddressData({
            customer_id: customerIdFromState?.toString() || "", // احتفظ بـ customer_id
            zone_id: zones.length > 0 ? zones[0].id.toString() : "",
            address: "",
            street: "",
            building_num: "",
            floor_num: "",
            apartment: "",
            additional_data: "",
            type: "",
            map: { lat: null, lng: null }
          });
        }
        
        navigate("/branch/customer");
      }},[response]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    // إعداد البيانات للإرسال
    const dataToSend = {
      ...newAddressData,
      map: newAddressData.map.lat && newAddressData.map.lng 
           ? `${newAddressData.map.lat},${newAddressData.map.lng}`
           : null
    };

    // في حالة Add، تأكد من وجود customer_id
    if (!isEdit && !dataToSend.customer_id) {
      toast.error(t("Customer ID is required"));
      setAddLoading(false);
      return;
    }

     postData(dataToSend);
  };

  return (
    <div className="bg-white p-6 w-full mx-auto max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-TextFontSemiBold text-mainColor mb-4">
        {isEdit ? t("Edit Address") : t("Add New Address")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Customer ID Field - مخفي في حالة Add، يظهر فقط للقراءة */}
          {/* {!isEdit && customerIdFromState && (
            // <div>
            //   <label className="block text-sm font-medium text-gray-700 mb-1">
            //     {t("Customer ID")}
            //   </label>
            //   <input
            //     type="text"
            //     name="customer_id"
            //     value={newAddressData.customer_id}
            //     className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            //     readOnly
            //     disabled
            //   />
            // </div>
          )} */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Zone")}
            </label>
            <select
              name="zone_id"
              value={newAddressData.zone_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
              required
            >
              <option value="">{t("Select a zone")}</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id.toString()}>
                  {zone.zone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Address")}
            </label>
            <input
              type="text"
              name="address"
              value={newAddressData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Street")}
            </label>
            <input
              type="text"
              name="street"
              value={newAddressData.street}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Building Number")}
            </label>
            <input
              type="number"
              name="building_num"
              value={newAddressData.building_num}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Floor Number")}
            </label>
            <input
              type="number"
              name="floor_num"
              value={newAddressData.floor_num}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Apartment")}
            </label>
            <input
              type="number"
              name="apartment"
              value={newAddressData.apartment}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Additional Data")}
            </label>
            <input
              type="text"
              name="additional_data"
              value={newAddressData.additional_data}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Address Type")}
            </label>
            <select
              name="type"
              value={newAddressData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
              required
            >
              <option value="">{t("Select type")}</option>
              <option value="home">{t("Home")}</option>
              <option value="work">{t("Work")}</option>
              <option value="other">{t("Other")}</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("Select Location on Map")}
          </label>
          <AddressMap
            initialLocation={newAddressData.map.lat && newAddressData.map.lng ? newAddressData.map : null}
            onLocationSelect={handleMapLocationSelect}
          />
          <p className="text-sm text-gray-500 mt-2">
            {newAddressData.map.lat && newAddressData.map.lng
              ? `${t("Selected Coordinates")}: Lat ${newAddressData.map.lat.toFixed(4)}, Lng ${newAddressData.map.lng.toFixed(4)}`
              : t("Click on the map or drag the marker to select a location.")
            }
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 duration-300"
            onClick={() => navigate("/branch/customer")}
            disabled={addLoading}
          >
            {t("Cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-mainColor rounded-xl hover:bg-mainColor/90 duration-300 disabled:opacity-50"
            disabled={addLoading}
          >
            {addLoading 
              ? (isEdit ? t("Updating...") : t("Adding...")) 
              : (isEdit ? t("Update") : t("Add"))
            }
          </button>
        </div>
      </form>
    </div>
  );
}