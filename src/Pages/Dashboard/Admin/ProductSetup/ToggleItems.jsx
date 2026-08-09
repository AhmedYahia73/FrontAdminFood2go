import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Switch } from "../../../../Components/Components";

export default function ToggleItems({ id, type }) {
  const [branches, setBranches] = useState([]);
  const [branchStatus, setBranchStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  if (!token) {
    return (
      <div className="p-4 text-center text-red-600">
        {t("TokennotfoundPleaselogin")}
      </div>
    );
  }

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const endpoint =
          type === "category"
            ? `${apiUrl}/admin/category/branch_category/${id}`
            : `${apiUrl}/admin/branch/branch_in_product/${id}`;
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.branches) {
          setBranches(response.data.branches);

          // Initialize statuses from localStorage or API response
          const initialStatuses = {};
          response.data.branches.forEach((branch) => {
            initialStatuses[branch.id] =
              type === "category"
                ? branch.category_status
                : branch.product_status;
          });

          setBranchStatus(initialStatuses);
          setLoading(false);
        } else {
          setError(t("Unexpected response structure"));
          setLoading(false);
        }
      } catch (error) {
        console.error(`${type} fetch error:`, error);
        setError(t("Failed to fetch branches"));
        setLoading(false);
      }
    };

    fetchBranches();
  }, [token, id, type, t]);

  const toggleStatus = async (branch_id) => {
    const currentStatus = branchStatus[branch_id] || 0;
    const newStatus = currentStatus ? 0 : 1;

    try {
      const endpoint =
        type === "category"
          ? `${apiUrl}/admin/branch/branch_category_status/${id}`
          : `${apiUrl}/admin/branch/branch_product_status/${id}`;
      const payload =
        type === "category"
          ? { branch_id, status: newStatus }
          : { branch_id, status: newStatus, product_id: id };

      await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBranchStatus((prev) => ({
        ...prev,
        [branch_id]: newStatus,
      }));
    } catch (error) {
      console.error("Toggle error:", error);
      alert(`Error updating status: ${error.response?.status || "Unknown"}`);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-mainColor">{t("Loadingbranches")}</div>
    );
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (branches.length === 0)
    return <div className="p-6 text-center">{t("Nobranchesfound")}</div>;

  return (
    <div className="p-6 font-TextFontRegular">
      <h2 className="pb-2 mb-4 text-2xl font-bold border-b border-gray-300 text-mainColor">
        {t(type === "category" ? "BranchCategoryControl" : "BranchProductControl")}
      </h2>
      <p className="mb-6 text-sm text-gray-600">{t("Totalbranches")}: {branches.length}</p>
      <ul className="space-y-4">
        {branches.map((branch) => {
          const status = branchStatus[branch.id] || 0;
          return (
            <li
              key={branch.id}
              className="flex items-center justify-between px-6 py-4 bg-white border rounded-lg shadow-sm"
            >
              <span className="text-lg font-medium text-mainColor">{branch.name}</span>
              <Switch
                checked={status === 1}
                handleClick={() => toggleStatus(branch.id)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}