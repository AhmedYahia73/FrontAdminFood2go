import React, { useEffect, useState } from "react";
import {
  StaticButton,
  StaticLoader,
  SubmitButton,
  TextInput,
  TitlePage,
} from "../../../../../Components/Components";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  IoArrowBack,
  IoEye,
  IoCash,
  IoPencil,
  IoChevronBack,
  IoChevronForward,
  IoPrint,
} from "react-icons/io5";
import { useGet } from "../../../../../Hooks/useGet";
import Select from "react-select";
import * as XLSX from 'xlsx';
import { IoFileTrayFull } from "react-icons/io5";

const ExpensesPayment = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();

  // API Calls
  const {
    refetch: refetchLists,
    data: dataLists,
    loading: loadingList,
  } = useGet({
    url: `${apiUrl}/admin/expenses_list/lists`,
  });

  const {
    refetch: refetchExpenses,
    loading: loadingExpenses,
    data: dataExpenses,
  } = useGet({
    url: `${apiUrl}/admin/expenses_list`,
  });

  const { postData: postAdd, loadingPost: loadingAdd } = usePost({
    url: `${apiUrl}/admin/expenses_list/add`,
  });

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const { postData: postUpdate, loadingPost: loadingUpdate } = usePost({
    url:
      selectedExpense && showEditModal
        ? `${apiUrl}/admin/expenses_list/update/${selectedExpense.id}`
        : "",
  });

  const [expenses, setExpenses] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Add Modal - All fields
  const [expenseName, setExpenseName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [cashierId, setCashierId] = useState("");
  const [cashierManId, setCashierManId] = useState("");
  const [financialAccountId, setFinancialAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Filter States
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");

  // Edit Modal - Only these
  const [editExpenseName, setEditExpenseName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editFinancialAccountId, setEditFinancialAccountId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");

  // Options
  const [branchOptions, setBranchOptions] = useState([]);
  const [cashierOptions, setCashierOptions] = useState([]);
  const [cashierManOptions, setCashierManOptions] = useState([]);
  const [financialOptions, setFinancialOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    refetchLists();
    refetchExpenses();
  }, []);

  useEffect(() => {
    if (dataExpenses?.expenses) {
      setExpenses(dataExpenses.expenses);
      // Reset to page 1 when data changes (e.g. after add/edit)
      setCurrentPage(1);
    }
  }, [dataExpenses]);

  useEffect(() => {
    if (dataLists) {
      setBranchOptions(
        dataLists.branches?.map((b) => ({ value: b.id, label: b.name })) || []
      );
      setCashierOptions(
        dataLists.cashiers?.map((c) => ({ value: c.id, label: c.name })) || []
      );
      setCashierManOptions(
        dataLists.cashier_man?.map((cm) => ({
          value: cm.id,
          label: cm.user_name,
        })) || []
      );
      setFinancialOptions(
        dataLists.financial?.map((f) => ({ value: f.id, label: f.name })) || []
      );
      setCategoryOptions(
        dataLists.categories?.map((c) => ({ value: c.id, label: c.name })) || []
      );
    }
  }, [dataLists]);

  // Pagination Logic
  const filteredExpenses = expenses.filter((exp) => {
    const matchDate = filterDate ? exp.date === filterDate : true;
    const matchTime = filterTime ? exp.time?.toLowerCase().includes(filterTime.toLowerCase()) : true;
    return matchDate && matchTime;
  });

  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setExpenseName("");
    setBranchId("");
    setCashierId("");
    setCashierManId("");
    setFinancialAccountId("");
    setCategoryId("");
    setAmount("");
    setNote("");
    setShowPayModal(true);
  };

  // Open Edit Modal
  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setEditExpenseName(expense.expense || "");
    setEditCategoryId(expense.category?.id || "");
    setEditFinancialAccountId(expense.financial_account?.id || "");
    setEditAmount(expense.amount || "");
    setEditNote(expense.note || "");
    setShowEditModal(true);
  };

  // Submit Add
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (
      !expenseName ||
      !branchId ||
      !cashierId ||
      !cashierManId ||
      !financialAccountId ||
      !categoryId ||
      !amount
    ) {
      auth.toastError(t("Please fill all required fields"));
      return;
    }

    const formData = new FormData();
    formData.append("expense", expenseName);
    formData.append("branch_id", branchId);
    formData.append("cashier_id", cashierId);
    formData.append("cahier_man_id", cashierManId);
    formData.append("financial_account_id", financialAccountId);
    formData.append("category_id", categoryId);
    formData.append("amount", amount);
    if (note) formData.append("note", note);

    const success = await postAdd(formData, t("Expense Paid Successfully"));
    if (success) {
      setShowPayModal(false);
      refetchExpenses();
    }
  };

  // Submit Edit
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (
      !editExpenseName ||
      !editCategoryId ||
      !editFinancialAccountId ||
      !editAmount
    ) {
      auth.toastError(t("Please fill all required fields"));
      return;
    }

    const formData = new FormData();
    formData.append("expense", editExpenseName);
    formData.append("category_id", editCategoryId);
    formData.append("financial_account_id", editFinancialAccountId);
    formData.append("amount", editAmount);
    if (editNote) formData.append("note", editNote);

    const success = await postUpdate(
      formData,
      t("Expense Updated Successfully")
    );
    if (success) {
      setShowEditModal(false);
      refetchExpenses();
    }
  };

  // useEffect(() => {
  //     if (selectedExpense && showEditModal) {
  //         postUpdate.url = `${apiUrl}/admin/expenses_list/update/${selectedExpense.id}`;
  //     }
  // }, [selectedExpense, showEditModal]);

  const customStyles = {
    control: (base) => ({
      ...base,
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      padding: "4px",
      "&:hover": { borderColor: "#9E090F" },
      boxShadow: "none",
    }),
  };

  const handlePrint = (type, data) => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      auth.toastError(t("Please allow popups to print"));
      return;
    }

    const isSingle = type === "single";
    let content = "";

    if (isSingle) {
      content = `
        <div class="receipt">
          <div class="header">
            <h1>${t("Expense")}</h1>
            <p>${new Date().toLocaleString()}</p>
          </div>
          <div class="content">
            <div class="row"><strong>${t("Expense Name")}:</strong> <span>${data.expense || "-"}</span></div>
            <div class="row"><strong>${t("Amount")}:</strong> <span class="amount">${data.amount}</span></div>
            <div class="row"><strong>${t("Category")}:</strong> <span>${data.category?.name || "-"}</span></div>
            <div class="row"><strong>${t("Branch")}:</strong> <span>${data.branch?.name || "-"}</span></div>
            <div class="row"><strong>${t("Cashier")}:</strong> <span>${data.cashier?.name || "-"}</span></div>
            <div class="row"><strong>${t("Cashier Man")}:</strong> <span>${data.cahier_man?.user_name || "-"}</span></div>
            <div class="row"><strong>${t("Financial Account")}:</strong> <span>${data.financial_account?.name || "-"}</span></div>
            <div class="row"><strong>${t("Admin")}:</strong> <span>${data.admin?.name || "-"}</span></div>
            <div class="row"><strong>${t("Date")}:</strong> <span>${data.date || "-"}</span></div>
            <div class="row"><strong>${t("Time")}:</strong> <span>${data.time || "-"}</span></div>
            <div class="notes">
              <strong>${t("Note")}:</strong>
              <p>${data.note || t("No notes")}</p>
            </div>
          </div>
        </div>
      `;
    } else {
      const items = (data || []).map(exp => `
        <div class="receipt-item">
          <div class="item-grid">
            <div class="field"><strong>${t("Expense Name")}:</strong> <span>${exp.expense || "-"}</span></div>
            <div class="field"><strong>${t("Amount")}:</strong> <span class="amount-val">${Number(exp.amount).toFixed(2)}</span></div>
            <div class="field"><strong>${t("Category")}:</strong> <span>${exp.category?.name || "-"}</span></div>
            <div class="field"><strong>${t("Branch")}:</strong> <span>${exp.branch?.name || "-"}</span></div>
            <div class="field"><strong>${t("Cashier")}:</strong> <span>${exp.cashier?.name || "-"}</span></div>
            <div class="field"><strong>${t("Cashier Man")}:</strong> <span>${exp.cahier_man?.user_name || "-"}</span></div>
            <div class="field"><strong>${t("Financial Account")}:</strong> <span>${exp.financial_account?.name || "-"}</span></div>
            <div class="field"><strong>${t("Admin")}:</strong> <span>${exp.admin?.name || "-"}</span></div>
            <div class="field"><strong>${t("Date")}:</strong> <span>${exp.date || "-"}</span></div>
            <div class="field"><strong>${t("Time")}:</strong> <span>${exp.time || "-"}</span></div>
          </div>
          <div class="item-note">
            <strong>${t("Note")}:</strong> ${exp.note || "-"}
          </div>
        </div>
      `).join("");

      const total = (data || []).reduce((sum, exp) => sum + Number(exp.amount), 0).toFixed(2);

      content = `
        <div class="report">
          <div class="header">
            <h1>${t("Expenses Report")}</h1>
            <div class="report-total">
               <span>${t("Grand Total")}:</span>
               <span class="total-big">${total}</span>
            </div>
          </div>
          <div class="vouchers-list">
            ${items}
          </div>
        </div>
      `;

    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${isSingle ? t("Receipt") + " #" + data.id : t("Expenses Report")}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { 
              font-family: 'Inter', system-ui, sans-serif; 
              padding: 40px; 
              color: #1a1a1a; 
              line-height: 1.5;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #1a1a1a; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
              position: relative;
            }
            .side-info { position: absolute; top: 0; right: 0; text-align: right; font-size: 0.9em; color: #666; }
            .header h1 { margin: 0; text-transform: uppercase; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; }
            .subtitle { color: #666; margin-top: 5px; font-weight: 600; text-transform: uppercase; font-size: 0.8em; }
            
            .receipt .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
            .receipt .amount { font-size: 1.8em; font-weight: 800; color: #1e40af; }
            .notes { margin-top: 25px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
            .notes strong { display: block; margin-bottom: 5px; color: #64748b; font-size: 0.8em; text-transform: uppercase; }
            .notes p { margin: 0; font-style: italic; }
            
            .footer { margin-top: 50px; text-align: center; }
            .thanks { font-weight: 800; font-size: 1.2em; margin-bottom: 5px; }
            .brand { color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.9em; }
            
            .report-total { display: flex; justify-content: center; align-items: baseline; gap: 15px; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 2px solid #e2e8f0; }
            .report-total span { font-weight: 800; text-transform: uppercase; color: #64748b; }
            .total-big { font-size: 2.5em; color: #1e40af; }

            .vouchers-list { display: flex; flex-direction: column; gap: 30px; }
            .receipt-item { page-break-inside: avoid; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; background: white; }
            .item-header { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; font-weight: 800; color: #64748b; font-size: 0.9em; }
            .item-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .field { border-bottom: 1px solid #f8fafc; padding-bottom: 5px; }
            .field strong { font-size: 0.8em; color: #94a3b8; text-transform: uppercase; margin-right: 5px; }
            .amount-val { font-weight: 800; color: #1e40af; font-size: 1.1em; }
            .item-note { margin-top: 15px; padding-top: 10px; border-top: 1px dashed #e2e8f0; font-size: 0.9em; color: #475569; }
            
            @media print {
              body { padding: 0; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body dir="${auth.language === "ar" ? "rtl" : "ltr"}">
          ${content}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportToExcel = () => {
    if (filteredExpenses.length === 0) return;

    const dataToExport = filteredExpenses.map((exp) => ({
      [t("ID")]: exp.id,
      [t("Expense")]: exp.expense,
      [t("Category")]: exp.category?.name || "-",
      [t("Amount")]: exp.amount,
      [t("Branch")]: exp.branch?.name || "-",
      [t("Cashier")]: exp.cashier?.name || "-",
      [t("Cashier Man")]: exp.cahier_man?.user_name || "-",
      [t("Financial Account")]: exp.financial_account?.name || "-",
      [t("Admin")]: exp.admin?.name || "-",
      [t("Date")]: exp.date || "-",
      [t("Time")]: exp.time || "-",
      [t("Note")]: exp.note || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("Expenses"));
    XLSX.writeFile(workbook, `Expenses_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between p-4 bg-white shadow-sm no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-mainColor hover:text-red-700 transition-colors"
          >
            <IoArrowBack size={28} />
          </button>
          <TitlePage text={t("Pay Expenses")} />
        </div>
        <div className="flex flex-wrap flex-row items-center gap-2 mt-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-3 px-6 py-2.5 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
          >
            <IoCash size={22} />
            <span className="text-lg font-bold">{t("Pay")}</span>
          </button>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-3 px-6 py-2.5 text-white bg-gradient-to-r from-green-600 to-green-700 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
            title={t("Export to Excel")}
          >
            <IoFileTrayFull size={22} />
            <span className="text-lg font-bold">{t("Excel")}</span>
          </button>
          <button
            onClick={() => handlePrint("all", filteredExpenses)}
            className="flex items-center gap-3 px-6 py-2.5 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
          >
            <IoPrint size={22} />
            <span className="text-lg font-bold">{t("Print")}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white shadow-sm no-print mt-2 rounded-lg">
        <div className="flex flex-col min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 mb-1">{t("Filter by Date")}</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border-2 border-gray-200 rounded-lg outline-none focus:border-mainColor transition-all"
          />
        </div>
        <div className="flex flex-col min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 mb-1">{t("Filter by Time")}</label>
          <input
            type="time"
            value={filterTime}
            onChange={(e) => {
              setFilterTime(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border-2 border-gray-200 rounded-lg outline-none focus:border-mainColor transition-all"
          />
        </div>
        <div className="flex items-end flex-grow justify-end">
          <button
            onClick={() => {
              setFilterDate("");
              setFilterTime("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-sm font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-all"
          >
            {t("Clear Filters")}
          </button>
        </div>
      </div>


      {/* Table + Pagination */}
      <div className="p-4 pb-20 mt-4 bg-white rounded-lg shadow no-print">
        {loadingExpenses || loadingList ? (
          <div className="flex justify-center py-20">
            <StaticLoader />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="text-white bg-mainColor">
                  <tr>
                    <th className="px-6 py-3 text-center">{t("ID")}</th>
                    <th className="px-6 py-3 text-center">{t("Expense")}</th>
                    <th className="px-6 py-3 text-center">{t("Category")}</th>
                    <th className="px-6 py-3 text-center">{t("Amount")}</th>
                    <th className="px-6 py-3 text-center">{t("Date")}</th>
                    <th className="px-6 py-3 text-center">{t("Time")}</th>
                    <th className="px-6 py-3 text-center">{t("Branch")}</th>
                    <th className="px-6 py-3 text-center">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentExpenses.map((exp) => (
                    <tr key={exp.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">{exp.id}</td>
                      <td className="px-6 py-4 font-medium text-center">
                        {exp.expense}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {exp.category?.name || "-"}
                      </td>
                      <td className="px-6 py-4 font-bold text-center text-green-600">
                        {exp.amount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {exp.date || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {exp.time || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {exp.branch?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleEdit(exp)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <IoPencil size={22} />
                          </button>
                          <button
                            onClick={() => handlePrint("single", exp)}
                            className="p-1.5 text-green-600 hover:text-white hover:bg-green-600 rounded-full transition-all duration-200"
                            title={t("Print Receipt")}
                          >
                            <IoPrint size={22} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExpense(exp);
                              setShowDetailsModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <IoEye size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="w-full flex flex-col items-center justify-between p-2 mt-6 border-t md:flex-row">
                <div className="mb-4 text-sm text-gray-600 sm:mb-0">
                  {t("Showing")} {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} {t("of")}{" "}
                  {totalItems} {t("entries")}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <IoChevronBack size={18} />
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Simple logic to show first, last, and pages around current
                      const isVisible =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                      if (!isVisible) {
                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[32px] h-8 px-2 rounded text-sm font-semibold transition-all ${currentPage === pageNum
                            ? "bg-mainColor text-white shadow-md scale-110"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <IoChevronForward size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ADD / PAY MODAL */}
      {
        showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 no-print">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
                <h3 className="text-2xl font-bold text-mainColor">
                  {t("Pay New Expense")}
                </h3>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="text-3xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <form
                onSubmit={handleSubmitPayment}
                className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
              >
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Expense")} *
                  </label>
                  <TextInput
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    placeholder={t("Enter expense name")}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Category")} *
                  </label>
                  <Select
                    options={categoryOptions}
                    value={categoryOptions.find((o) => o.value === categoryId)}
                    onChange={(o) => setCategoryId(o?.value || "")}
                    styles={customStyles}
                    isSearchable
                    placeholder={t("Select Category")}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Branch")} *
                  </label>
                  <Select
                    options={branchOptions}
                    value={branchOptions.find((o) => o.value === branchId)}
                    onChange={(o) => setBranchId(o?.value || "")}
                    styles={customStyles}
                    isSearchable
                    placeholder={t("Select Branch")}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Cashier")} *
                  </label>
                  <Select
                    options={cashierOptions}
                    value={cashierOptions.find((o) => o.value === cashierId)}
                    onChange={(o) => setCashierId(o?.value || "")}
                    styles={customStyles}
                    isSearchable
                    placeholder={t("Select Cashier")}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Cashier Man")} *
                  </label>
                  <Select
                    options={cashierManOptions}
                    value={cashierManOptions.find(
                      (o) => o.value === cashierManId
                    )}
                    onChange={(o) => setCashierManId(o?.value || "")}
                    styles={customStyles}
                    isSearchable
                    placeholder={t("Select Cashier Man")}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Financial Account")} *
                  </label>
                  <Select
                    options={financialOptions}
                    value={financialOptions.find(
                      (o) => o.value === financialAccountId
                    )}
                    onChange={(o) => setFinancialAccountId(o?.value || "")}
                    styles={customStyles}
                    isSearchable
                    placeholder={t("Select Account")}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Amount")} *
                  </label>
                  <TextInput
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Note")}
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg outline-none focus:border-mainColor"
                    placeholder={t("Optional note...")}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t md:col-span-2">
                  <StaticButton
                    text={t("Cancel")}
                    handleClick={() => setShowPayModal(false)}
                    bgColor="bg-gray-300"
                    Color="text-gray-700"
                  />
                  <SubmitButton text={t("Pay Now")} loading={loadingAdd} />
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* EDIT MODAL */}
      {showEditModal && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-2xl font-bold text-mainColor">
                {t("EditExpense")}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-3xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("ExpenseName")} *
                  </label>
                  <TextInput
                    value={editExpenseName}
                    onChange={(e) => setEditExpenseName(e.target.value)}
                    placeholder={t("Enter expense name")}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Category")} *
                  </label>
                  <Select
                    options={categoryOptions}
                    value={categoryOptions.find(
                      (o) => o.value === editCategoryId
                    )}
                    onChange={(o) => setEditCategoryId(o?.value || "")}
                    styles={customStyles}
                    isSearchable
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Financial Account")} *
                  </label>
                  <Select
                    options={financialOptions}
                    value={financialOptions.find(
                      (o) => o.value === editFinancialAccountId
                    )}
                    onChange={(o) => setEditFinancialAccountId(o?.value || "")}
                    styles={customStyles}
                    isSearchable
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Amount")} *
                  </label>
                  <TextInput
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Note")}
                  </label>
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    rows={3}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg outline-none focus:border-mainColor"
                    placeholder={t("Optionalnote")}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t">
                <StaticButton
                  text={t("Cancel")}
                  handleClick={() => setShowEditModal(false)}
                  bgColor="bg-gray-300"
                  Color="text-gray-700"
                />
                <SubmitButton
                  text={t("UpdateExpense")}
                  loading={loadingUpdate}
                />
              </div>
            </form>
          </div>
        </div>
      )
      }

      {/* DETAILS MODAL */}
      {
        showDetailsModal && selectedExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 no-print">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl">
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-2xl font-bold text-mainColor">
                  {t("Expense Details")}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-3xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                <DetailItem label={t("ID")} value={selectedExpense.id} />
                <DetailItem
                  label={t("Expense")}
                  value={selectedExpense.expense}
                />
                <DetailItem
                  label={t("Category")}
                  value={selectedExpense.category?.name}
                />
                <DetailItem label={t("Amount")} value={selectedExpense.amount} />
                <DetailItem
                  label={t("Branch")}
                  value={selectedExpense.branch?.name}
                />
                <DetailItem
                  label={t("Cashier")}
                  value={selectedExpense.cashier?.name}
                />
                <DetailItem
                  label={t("Cashier Man")}
                  value={selectedExpense.cahier_man?.user_name}
                />
                <DetailItem
                  label={t("Financial Account")}
                  value={selectedExpense.financial_account?.name}
                />
                <DetailItem
                  label={t("Admin")}
                  value={selectedExpense.admin?.name}
                />
                <DetailItem
                  label={t("Note")}
                  value={selectedExpense.note || "-"}
                />
                <DetailItem
                  label={t("Date")}
                  value={selectedExpense.date}
                />
                <DetailItem
                  label={t("Time")}
                  value={selectedExpense.time}
                />
              </div>
              <div className="p-5 text-right border-t">
                <StaticButton
                  text={t("Close")}
                  handleClick={() => setShowDetailsModal(false)}
                  bgColor="bg-mainColor"
                  Color="text-white"
                  rounded="rounded-full"
                />
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span className="text-lg font-semibold text-gray-900">{value || "-"}</span>
  </div>
);

export default ExpensesPayment;
