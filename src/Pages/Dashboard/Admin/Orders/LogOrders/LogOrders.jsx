import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePost } from "../../../../../Hooks/usePostJson"; // ✅ reuse your post hook

const LogOrders = () => {
  const [logData, setLogData] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { t } = useTranslation();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const role = localStorage.getItem("role");

  // ✅ Choose endpoint based on role
  const logUrl =
    role === "branch"
      ? `${apiUrl}/branch/online_order/order_log`
      : `${apiUrl}/admin/order/log`;

  const { postData, loadingPost, response } = usePost({
    url: logUrl,
    type: true, // use application/json
  });

  const headers = ["SL", "Admin Name", "Date", "From-Status", "To-Status"];

  useState(() => {
    if (response && response.data && response.data.log_order) {
      setLogData(response.data.log_order);
    } else {
      setLogData([]);
    }}, [response]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId) return;

    const payload = { order_id: orderId };
    postData(payload);
  };

  const handleAdminClick = (admin) => {
    setSelectedAdmin(admin);
    setShowAdminModal(true);
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
  };

  return (
    <div className="w-full py-6">
      <div className="max-w-md mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder={t("EnterOrderID")}
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-mainColor"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white rounded bg-mainColor hover:bg-gray-700"
          >
            {t("Search")}
          </button>
        </form>
      </div>

      <div className="w-full overflow-x-auto">
        {loadingPost ? (
          <p className="text-lg text-center text-gray-500">{t("Loading")}</p>
        ) : logData.length === 0 ? (
          <p className="text-center text-gray-500">
            {orderId
              ? t("NologsfoundforthisorderID")
              : t("EnteranorderIDtosearch")}
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                {headers.map((name, index) => (
                  <th
                    key={index}
                    className="px-4 py-2 text-sm text-center text-mainColor lg:text-base"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logData.map((log, index) => (
                <tr key={log.id} className="border-b">
                  <td className="px-4 py-2 text-center">{index + 1}</td>
                  <td
                    className="px-4 py-2 text-center text-blue-500 cursor-pointer hover:underline"
                    onClick={() => handleAdminClick(log.admin)}
                  >
                    {log.admin?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {log.date ? new Date(log.date).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 text-center">{log.from_status}</td>
                  <td className="px-4 py-2 text-center">{log.to_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Admin Details Modal */}
      {showAdminModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{t("AdminDetails")}</h3>
              <button
                onClick={closeAdminModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p>
                <span className="font-semibold">{t("Name")}:</span>{" "}
                {selectedAdmin.name}
              </p>
              <p>
                <span className="font-semibold">{t("Email")}:</span>{" "}
                {selectedAdmin.email}
              </p>
              <p>
                <span className="font-semibold">{t("Phone")}:</span>{" "}
                {selectedAdmin.phone}
              </p>
              <p>
                <span className="font-semibold">{t("Role")}:</span>{" "}
                {selectedAdmin.role}
              </p>
              <p>
                <span className="font-semibold">{t("Status")}:</span>{" "}
                {selectedAdmin.status === 1 ? t("Active") : t("Inactive")}
              </p>

              {selectedAdmin.image && (
                <div>
                  <span className="font-semibold">{t("Image")}:</span>
                  <img
                    src={`${selectedAdmin.image_link}/${selectedAdmin.image}`}
                    alt="Admin"
                    className="mt-2 max-h-40"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogOrders;
