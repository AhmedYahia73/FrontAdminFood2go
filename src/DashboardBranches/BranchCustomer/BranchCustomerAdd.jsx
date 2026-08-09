import { usePost } from "../../Hooks/usePostJson";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import AddressMap from "./AddressMap";
import { toast } from 'react-toastify';
import { useGet } from "../../Hooks/useGet";
import { useNavigate } from "react-router-dom";

export default function BranchCustomerAdd() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();
const navigate = useNavigate();
  const [newAddressData, setNewAddressData] = useState({
    name: "",
    phone: "",
    zone_id: "", // This will hold the selected zone ID
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
  const [zones, setZones] = useState([]); // State to store zones data

  // Hook for posting new address data
  const { postData , loadingPost , response } = usePost({
    url: `${apiUrl}/branch/customer/add`,
  });

  // Hook for fetching zones data
  // Note: renamed refetchTaxes to refetchZones for clarity since it fetches zones
  const { refetch: refetchZones, data: zonesData } = useGet({
    url: `${apiUrl}/branch/customer`, // This endpoint is correct if it returns { zones: [...] }
  });

  // Fetch zones on component mount
  useEffect(() => {
    refetchZones();
  }, [refetchZones]); // Depend on refetchZones

  // NEW useEffect to populate the zones state from zonesData
  useEffect(() => {
    if (zonesData && zonesData.zones && zonesData.zones.length > 0) {
      setZones(zonesData.zones);
      // Optionally set the first zone as default selected
      setNewAddressData((prev) => ({
        ...prev,
        zone_id: zonesData.zones[0].id.toString(), // Ensure it's a string if your select expects string values
      }));
    } else {
      setZones([]); // Clear zones if no data or empty
    }
  }, [zonesData]); // Depend on zonesData to react when it changes

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
    if(response && response.data.success) {
        toast.success(t("Customers added successfully"));
        // Optionally reset form here if needed
        setNewAddressData({
          name: "",
          phone: "",
          zone_id: zones.length > 0 ? zones[0].id.toString() : "", // Reset to first zone or empty
          address: "",
          street: "",
          building_num: "",
          floor_num: "",
          apartment: "",
          additional_data: "",
          type: "",
          map: { lat: null, lng: null }
        });
        navigate("/branch/customer");
      }}, [response]);

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    // Prepare data, converting map object to string or specific format if needed by backend
    const dataToSend = {
        ...newAddressData,
        map: newAddressData.map.lat && newAddressData.map.lng 
             ? `${newAddressData.map.lat},${newAddressData.map.lng}` // Example: "lat,lng" string
             : null // Or handle as required by your API for no map
    };

    postData(dataToSend); // Use dataToSend
  };

  return (
    <div className="bg-white p-6 w-full mx-auto max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-TextFontSemiBold text-mainColor mb-4">
        {t("Add New Customer")}
      </h2>

      <form onSubmit={handleSubmitAdd} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Customer Name")}
            </label>
            <input
              type="text"
              name="name"
              value={newAddressData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
              required
            />
          </div>

          {/* Customer Phone Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("Customer Phone")}
            </label>
            <input
              type="text"
              name="phone"
              value={newAddressData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor"
              required
            />
          </div>

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
                <option key={zone.id} value={zone.id.toString()}> {/* Ensure value is string */}
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

          {/* Other Address Details */}
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
            onClick={() => window.history.back()}
            disabled={addLoading}
          >
            {t("Cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-mainColor rounded-xl hover:bg-mainColor/90 duration-300 disabled:opacity-50"
            disabled={addLoading}
          >
            {addLoading ? t("Adding...") : t("Add")}
          </button>
        </div>
      </form>
    </div>
  );
}