import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import { addCanceledOrder } from "../../Store/CreateSlices";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../Context/Auth.jsx";

const NewOrdersComponent = ({ isOpen, onClose, onCheckOrders }) => {
  const popUpRef = useRef();
  const newOrders = useSelector((state) => state.newOrders);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const route = role === "branch" ? "/branch/orders" : "/dashboard/orders";

  const handleClickOutside = (event) => {
    if (popUpRef.current && !popUpRef.current.contains(event.target)) {
      onClose();
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const count = newOrders?.count || 0;


  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-30">
      <div
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative overflow-hidden text-center transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl"
            ref={popUpRef}
          >
            {/* Header */}
            <div className="flex items-center justify-center w-full my-5 text-3xl text-gray-500 gap-x-4 font-TextFontSemiBold">
              <MdOutlineShoppingCart className="text-4xl" />
              {t("newOrders", { count })}
            </div>

            {/* Footer */}
            <div className="flex justify-between px-4 py-3 mx-auto border-t-4 sm:px-6">
              <button
                onClick={onClose}
                className="inline-flex justify-center px-6 py-3 mt-3 text-xl text-white bg-red-600 rounded-md shadow-sm font-TextFontMedium hover:bg-red-700 sm:mt-0 sm:w-auto"
              >
                {t("Close")}
              </button>
              <Link
                to={`${route}/details/${newOrders?.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onCheckOrders) onCheckOrders(newOrders?.id);
                  onClose();
                  navigate(`${route}/details/${newOrders?.id}`);
                }}
                className="inline-flex justify-center px-6 py-3 mt-3 text-xl text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:mt-0 sm:w-auto hover:bg-mainColor-dark"
              >
                {t("letmecheck")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default NewOrdersComponent;
