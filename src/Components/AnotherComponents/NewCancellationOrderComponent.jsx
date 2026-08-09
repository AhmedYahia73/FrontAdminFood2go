import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { IoWarningOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { setNewCanceledOrder, removeCanceledOrder } from "../../Store/CreateSlices";
import { useChangeState } from "../../Hooks/useChangeState.jsx";
import { useAuth } from "../../Context/Auth.jsx";

const NewCancellationOrderComponent = ({ isOpen, onClose }) => {
    const popUpRef = useRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();
    const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
    const route = role === "branch" ? "/branch/orders" : "/dashboard/orders";

    const newCanceledOrder = useSelector((state) => state.canceledOrders.newOrder);
    const { changeState, loading } = useChangeState();

    const handleClose = () => {
        dispatch(setNewCanceledOrder(null));
        onClose();
    };

    const handleChangeStatus = async (id) => {
        const response = await changeState(
            `${apiUrl}/admin/settings/cancelation_status/${id}`,
            'Cancellation notification acknowledged.'
        );

        if (response && !response.errors) {
            // We can remove it from the list if we want, or just close the popup
            dispatch(removeCanceledOrder(id));
            handleClose();
        }
    };

    const handleClickOutside = (event) => {
        if (popUpRef.current && !popUpRef.current.contains(event.target)) {
            handleClose();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!newCanceledOrder) return null;

    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            <div
                className="fixed inset-0 transition-opacity bg-black bg-opacity-60 backdrop-blur-sm"
                aria-hidden="true"
            />
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
                    <div
                        className="relative overflow-hidden text-center transition-all transform bg-white border-t-8 border-red-600 rounded-2xl shadow-2xl sm:my-8 sm:w-full sm:max-w-md p-6"
                        ref={popUpRef}
                    >
                        {/* Elegant Cancel Design */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-20 h-20 mb-4 bg-red-100 rounded-full animate-pulse">
                                <IoWarningOutline className="text-5xl text-red-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {t("Order Cancelled")}
                            </h3>

                            <p className="text-gray-500 mb-6 px-4">
                                {t("Notification for cancellation order")}
                                <span className="font-bold text-red-600 ml-1">#{newCanceledOrder}</span>
                            </p>

                            <div className="flex flex-col w-full gap-4">
                                <div className="flex flex-col w-full gap-3 md:flex-row">
                                    <Link
                                        to={`${route}/details/${newCanceledOrder}`}
                                        onClick={() => handleClose()}
                                        className="flex-1 flex items-center justify-center px-4 py-2.5 text-base font-semibold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 shadow-lg shadow-red-100"
                                    >
                                        {t("letmecheck")}
                                    </Link>

                                    <button
                                        onClick={() => handleChangeStatus(newCanceledOrder)}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center px-4 py-2.5 text-base font-semibold text-gray-700 transition-all bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-95 border border-gray-200"
                                    >
                                        {loading ? t("Updating...") : t("Mark as Read")}
                                    </button>
                                </div>

                                {/* <button
                                    onClick={handleClose}
                                    className="w-full py-2 text-base font-medium text-gray-900 transition-colors hover:text-gray-600"
                                >
                                    {t("Later")}
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default NewCancellationOrderComponent;
