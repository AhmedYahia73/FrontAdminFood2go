import React, { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../../Assets/Icons/AllIcons";
import { Link } from "react-router-dom";
import {
  AddButton,
  StaticLoader,
  Switch,
  TitlePage,
} from "../../../../../Components/Components";
import { useGet } from "../../../../../Hooks/useGet";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { t } from "i18next";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";

const CustomersDue = () => {
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchCustomerDue,
    loading: loadingCustomerDue,
    data: dataCustomerDue,
  } = useGet({
    url: `${apiUrl}/admin/customer/due_user`,
  });

  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/customer/pay_debit`,
  });

  const [CustomerDues, setCustomerDues] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentData, setPaymentData] = useState({
    user_id: "",
    amount: "",
    financials: [{ id: "", amount: "" }],
  });
  const [errors, setErrors] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const CustomerDuesPerPage = 20;

  const totalPages = Math.ceil(CustomerDues.length / CustomerDuesPerPage);
  const currentCustomerDues = CustomerDues.slice(
    (currentPage - 1) * CustomerDuesPerPage,
    currentPage * CustomerDuesPerPage
  );

  // Update CustomerDues when data changes
  useEffect(() => {
    if (dataCustomerDue && dataCustomerDue.users) {
      setCustomerDues(dataCustomerDue.users);
    }
  }, [dataCustomerDue]);

  useEffect(() => {
    refetchCustomerDue();
  }, [refetchCustomerDue]);

  // Calculate total allocated amount
  const getTotalAllocatedAmount = () => {
    return paymentData.financials.reduce((sum, financial) => {
      return sum + parseFloat(financial.amount || 0);
    }, 0);
  };

  // Calculate remaining amount from total payment
  const getRemainingPaymentAmount = () => {
    const paymentAmount = parseFloat(paymentData.amount) || 0;
    const totalAllocated = getTotalAllocatedAmount();
    return Math.max(0, paymentAmount - totalAllocated);
  };

  // Calculate total remaining due after payment
  const getRemainingDueAmount = () => {
    const dueAmount = selectedCustomer?.due || 0;
    const paymentAmount = parseFloat(paymentData.amount) || 0;
    return Math.max(0, dueAmount - paymentAmount);
  };

  // Open payment modal
  const openPaymentModal = (customer) => {
    setSelectedCustomer(customer);
    setPaymentData({
      user_id: customer.id,
      amount: customer.due.toString(), // Default to full amount
      financials: [{ id: "", amount: "" }],
    });
    setErrors({});
    setIsPaymentModalOpen(true);
  };

  // Handle payment amount change
  const handlePaymentAmountChange = (value) => {
    const dueAmount = selectedCustomer?.due || 0;
    const numericValue = parseFloat(value) || 0;

    if (numericValue > dueAmount) {
      setErrors((prev) => ({
        ...prev,
        amount: `Cannot exceed due amount of ${dueAmount} EGP`,
      }));
      return;
    }

    if (numericValue < 0) {
      setErrors((prev) => ({
        ...prev,
        amount: "Payment amount cannot be negative",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, amount: "" }));
    setPaymentData((prev) => ({
      ...prev,
      amount: value,
    }));

    // If payment amount is less than current allocation, adjust financials
    const totalAllocated = getTotalAllocatedAmount();
    if (numericValue < totalAllocated) {
      // Reduce financial amounts proportionally or reset if needed
      const adjustmentRatio = numericValue / totalAllocated;
      setPaymentData((prev) => ({
        ...prev,
        amount: value,
        financials: prev.financials.map((financial) => ({
          ...financial,
          amount: financial.amount
            ? (parseFloat(financial.amount) * adjustmentRatio).toFixed(2)
            : "",
        })),
      }));
    }
  };

  // Handle financial amount change with smart validation
  const handleFinancialAmountChange = (index, value) => {
    const paymentAmount = parseFloat(paymentData.amount) || 0;
    const currentAmount = parseFloat(value) || 0;
    const remainingPaymentAmount = getRemainingPaymentAmount();
    const currentRowAmount = parseFloat(
      paymentData.financials[index]?.amount || 0
    );

    // Calculate the actual amount change
    const amountChange = currentAmount - currentRowAmount;

    // Check if this change would exceed the payment amount
    if (currentAmount > paymentAmount) {
      setErrors((prev) => ({
        ...prev,
        [`financial_${index}`]: `Amount cannot exceed payment amount of ${paymentAmount} EGP`,
      }));
      return;
    }

    // Check if this change would exceed remaining payment amount
    if (amountChange > remainingPaymentAmount && remainingPaymentAmount >= 0) {
      setErrors((prev) => ({
        ...prev,
        [`financial_${index}`]: `Only ${remainingPaymentAmount.toFixed(
          2
        )} EGP available in payment`,
      }));
      return;
    }

    // Clear errors for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`financial_${index}`];
      return newErrors;
    });

    updateFinancialData(index, "amount", value);
  };

  // Auto-distribute remaining payment amount
  const autoDistributeRemaining = () => {
    const remainingPaymentAmount = getRemainingPaymentAmount();
    const emptyFinancials = paymentData.financials.filter(
      (f) => !f.amount || f.amount === "0" || f.amount === ""
    );

    if (emptyFinancials.length > 0 && remainingPaymentAmount > 0) {
      const distributedAmount = (
        remainingPaymentAmount / emptyFinancials.length
      ).toFixed(2);

      setPaymentData((prev) => ({
        ...prev,
        financials: prev.financials.map((financial) =>
          !financial.amount ||
          financial.amount === "0" ||
          financial.amount === ""
            ? { ...financial, amount: distributedAmount }
            : financial
        ),
      }));
    }
  };

  // Set payment to full due amount
  const setFullPayment = () => {
    const dueAmount = selectedCustomer?.due || 0;
    setPaymentData((prev) => ({
      ...prev,
      amount: dueAmount.toString(),
    }));
  };

  // Set payment to partial amount
  const setPartialPayment = (amount) => {
    setPaymentData((prev) => ({
      ...prev,
      amount: amount.toString(),
    }));
  };

  // Add new financial method row
  const addFinancialRow = () => {
    setPaymentData((prev) => ({
      ...prev,
      financials: [...prev.financials, { id: "", amount: "" }],
    }));
  };

  // Remove financial method row
  const removeFinancialRow = (index) => {
    if (paymentData.financials.length > 1) {
      setPaymentData((prev) => ({
        ...prev,
        financials: prev.financials.filter((_, i) => i !== index),
      }));
    }
  };

  // Update financial method data
  const updateFinancialData = (index, field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      financials: prev.financials.map((financial, i) =>
        i === index ? { ...financial, [field]: value } : financial
      ),
    }));
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    const dueAmount = selectedCustomer?.due || 0;
    const paymentAmount = parseFloat(paymentData.amount) || 0;
    const totalAllocated = getTotalAllocatedAmount();

    // Validate total payment amount
    if (paymentAmount > dueAmount) {
      setErrors((prev) => ({
        ...prev,
        amount: `Payment amount cannot exceed due amount of ${dueAmount} EGP`,
      }));
      return;
    }

    if (paymentAmount <= 0) {
      setErrors((prev) => ({
        ...prev,
        amount: "Payment amount must be greater than 0",
      }));
      return;
    }

    if (totalAllocated > paymentAmount) {
      setErrors((prev) => ({
        ...prev,
        financials: `Total allocated amount (${totalAllocated}) exceeds payment amount (${paymentAmount})`,
      }));
      return;
    }

    if (totalAllocated !== paymentAmount) {
      setErrors((prev) => ({
        ...prev,
        financials:
          "Total payment methods amount must equal the payment amount",
      }));
      return;
    }

    // Filter out empty financial entries
    const validFinancials = paymentData.financials.filter(
      (f) => f.id && f.amount && parseFloat(f.amount) > 0
    );

    if (validFinancials.length === 0) {
      setErrors((prev) => ({
        ...prev,
        financials: "Please add at least one payment method with amount",
      }));
      return;
    }

    const paymentPayload = {
      user_id: paymentData.user_id,
      amount: paymentData.amount,
      financials: validFinancials,
    };

    postData(paymentPayload);
  };

  useEffect(() => {
    if (!loadingPost && response && response.status === 200) {
      setIsPaymentModalOpen(false);
      refetchCustomerDue();
      auth.toastSuccess("Payment successful!");
    }
  }, [loadingPost, response, refetchCustomerDue]);

  const headers = [
    t("SL"),
    t("Name"),
    t("Phone"),
    t("Email"),
    t("Due Amount"),
    t("Action"),
  ];

  const remainingPaymentAmount = getRemainingPaymentAmount();
  const remainingDueAmount = getRemainingDueAmount();
  const totalAllocated = getTotalAllocatedAmount();
  const isFullyAllocated =
    remainingPaymentAmount === 0 &&
    totalAllocated === parseFloat(paymentData.amount || 0);
  const isPartialPayment =
    parseFloat(paymentData.amount || 0) < (selectedCustomer?.due || 0);

  return (
    <div className="flex items-start justify-start w-full p-2 overflow-x-scroll pb-28 scrollSection">
      {loadingCustomerDue ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="w-full md:w-1/2">
              <TitlePage text={t("Customer Due Table")} />
            </div>
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
              {CustomerDues.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("No customers with due amounts")}
                  </td>
                </tr>
              ) : (
                currentCustomerDues.map((CustomerDue, index) => (
                  <tr className="w-full border-b-2" key={CustomerDue.id}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * CustomerDuesPerPage + index + 1}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {CustomerDue?.name || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {CustomerDue?.phone || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {CustomerDue?.email || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {CustomerDue?.due || "0"} EGP
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <button
                        onClick={() => openPaymentModal(CustomerDue)}
                        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        {t("Pay Due")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Payment Modal */}
          <Dialog
            open={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            className="relative z-50"
          >
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPanel className="flex flex-col w-full max-w-2xl bg-white rounded-xl max-h-[90vh]">
                {/* Fixed Header */}
                <div className="flex items-center justify-between flex-shrink-0 p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t("Pay Due Amount")}
                  </h2>
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="p-2 text-gray-500 transition-colors hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {selectedCustomer && (
                      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <h3 className="font-semibold text-gray-800">
                          {t("Customer")}: {selectedCustomer.name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-red-600">
                            {t("Total Due")}: {selectedCustomer.due} {t("EGP")}
                          </span>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isPartialPayment
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isPartialPayment
                              ? t("Partial Payment")
                              : t("Full Payment")}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {t("Phone")}: {selectedCustomer.phone}
                        </p>
                        {isPartialPayment && (
                          <p className="mt-1 text-sm font-medium text-orange-600">
                            {t("Remaining Due After Payment")}:{" "}
                            {remainingDueAmount.toFixed(2)} {t("EGP")}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block font-medium text-gray-700">
                            {t("Total Payment Amount")}
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPartialPayment(100)}
                              className="px-3 py-1 text-xs text-gray-700 transition-colors bg-gray-100 rounded hover:bg-gray-200"
                            >
                              100 {t("EGP")}
                            </button>
                            <button
                              type="button"
                              onClick={setFullPayment}
                              className="px-3 py-1 text-xs text-blue-700 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                            >
                              {t("Full Amount")}
                            </button>
                          </div>
                        </div>
                        <input
                          type="number"
                          value={paymentData.amount}
                          onChange={(e) =>
                            handlePaymentAmountChange(e.target.value)
                          }
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.amount ? "border-red-500" : "border-gray-300"
                          }`}
                          max={selectedCustomer?.due}
                          step="0.01"
                          placeholder={t("Enter payment amount")}
                        />
                        {errors.amount && (
                          <p className="flex items-center mt-2 text-sm text-red-600">
                            ⚠️ {errors.amount}
                          </p>
                        )}
                       <p className="mt-1 text-sm text-gray-500">
  {t("You can pay any amount up to")} {selectedCustomer?.due} {t("EGP")}
</p>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <label className="block font-medium text-gray-700">
                              {t("Payment Methods")}
                            </label>
                            <p className="mt-1 text-sm text-gray-500">
                              {t("Allocated")}:{" "}
                              <span className="font-semibold">
                                {totalAllocated.toFixed(2)} EGP
                              </span>
                              {remainingPaymentAmount > 0 && (
                                <span className="ml-2">
                                  • {t("Available")}:{" "}
                                  <span className="font-semibold text-green-600">
                                    {remainingPaymentAmount.toFixed(2)} EGP
                                  </span>
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={autoDistributeRemaining}
                              disabled={remainingPaymentAmount <= 0}
                              className="px-3 py-2 text-sm text-blue-700 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {t("Auto-Distribute")}
                            </button>
                            <button
                              type="button"
                              onClick={addFinancialRow}
                              className="px-3 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                            >
                              + {t("Add Method")}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {paymentData.financials.map((financial, index) => (
                            <div
                              key={index}
                              className="flex gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <select
                                  value={financial.id}
                                  onChange={(e) =>
                                    updateFinancialData(
                                      index,
                                      "id",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">
                                    {t("Select Payment Method")}
                                  </option>
                                  {dataCustomerDue?.financials?.map(
                                    (method) => (
                                      <option key={method.id} value={method.id}>
                                        {method.name}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              <div className="flex-1">
                                <input
                                  type="number"
                                  value={financial.amount}
                                  onChange={(e) =>
                                    handleFinancialAmountChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="0.00"
                                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors[`financial_${index}`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                  max={paymentData.amount}
                                  step="0.01"
                                />
                                {errors[`financial_${index}`] && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {errors[`financial_${index}`]}
                                  </p>
                                )}
                              </div>

                              {paymentData.financials.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeFinancialRow(index)}
                                  className="flex-shrink-0 px-3 py-2 text-red-600 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {errors.financials && (
                          <p className="flex items-center mt-2 text-sm text-red-600">
                            ⚠️ {errors.financials}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="flex justify-end flex-shrink-0 gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={loadingPost || !isFullyAllocated}
                    className="px-6 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loadingPost ? (
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t("Processing...")}
                      </span>
                    ) : (
                      `${t("Pay")} ${paymentData.amount || 0} ${t("EGP")}`
                    )}
                  </button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>

          {/* Pagination */}
          {CustomerDues.length > 0 && (
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
    </div>
  );
};

export default CustomersDue;
