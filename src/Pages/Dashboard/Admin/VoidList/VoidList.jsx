import React, { useEffect, useState } from "react";
import { TitlePage, StaticLoader } from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";

import { useTranslation } from "react-i18next";

import {
  FiEye,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiInfo,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const VoidList = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const { data, loading } = useGet({
    url: `${apiUrl}/admin/order/void_orders`,
  });
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const orders = data?.orders || [];
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount);
  };

  const handlePrintPdf = () => {
    if (orders.length === 0) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.text(t("Void Orders Report"), 14, 22);

    const tableData = orders.map((order) => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString(),
      order.branch?.name || "—",
      `${order.amount} EGP`,
      order.void_reason || t("Not specified"),
      order.void || t("-")
    ]);

    autoTable(doc, {
      startY: 30,
      head: [[
        t("Order No"),
        t("Date"),
        t("Branch"),
        t("Amount"),
        t("Void Reason"),
        t("Void")
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] } // Red color matching the void theme
    });

    doc.save(`Void_Orders_Report_${date.replace(/\//g, '-')}.pdf`);
  };

  const handleExportExcel = () => {
    if (orders.length === 0) return;
    const date = new Date().toLocaleDateString();

    const data = orders.map((order) => ({
      [t("Order No")]: order.order_number,
      [t("Date")]: new Date(order.created_at).toLocaleString(),
      [t("Branch")]: order.branch?.name || "—",
      [t("Amount")]: order.amount,
      [t("Void Reason")]: order.void_reason || t("Not specified"),
      [t("Void")]: order.void || t("-")
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Void Orders");
    XLSX.writeFile(workbook, `Void_Orders_Report_${date.replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <TitlePage text={t("Void Orders")} />

        {orders.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm font-bold"
            >
              <FaFileExcel size={18} />
              {t("Excel")}
            </button>
            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-sm font-bold"
            >
              <FaFilePdf size={18} />
              {t("PDF")}
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <StaticLoader />
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="py-20 text-center bg-gray-50 rounded-2xl">
          <FiInfo size={60} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-600">
            {t("No voided orders found")}
          </h3>
        </div>
      )}

      {/* Table */}
      {!loading && orders.length > 0 && (
        <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-white bg-red-600">
                <tr>
                  <th
                    className={`px-6 py-4 ${lang == "ar" ? "text-right" : "text-left"
                      } `}
                  >
                    {t("Order No")}
                  </th>
                  <th className={`px-6 py-4 ${lang == "ar" ? "text-right" : "text-left"
                    } `}>{t("Date")}</th>
                  <th className={`px-6 py-4 ${lang == "ar" ? "text-right" : "text-left"
                    } `}>{t("Branch")}</th>
                  <th className={`px-6 py-4 ${lang == "ar" ? "text-right" : "text-left"
                    } `}>{t("Amount")}</th>
                  <th className={`px-6 py-4 ${lang == "ar" ? "text-right" : "text-left"
                    } `}>{t("Void Reason")}</th>
                  <th className={`px-6 py-4 ${lang == "ar" ? "text-right" : "text-left"
                    } `}>{t("Void")}</th>
                  <th className="px-6 py-4 text-center">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition cursor-pointer hover:bg-red-50"
                    onClick={() => openModal(order)}
                  >
                    <td className="px-6 py-5 font-bold text-red-700">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-5 text-gray-700">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-5 font-medium">
                      {order.branch?.name || "—"}
                    </td>
                    <td className="px-6 py-5 font-bold text-red-600">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${order.void_reason
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {order.void_reason || t("Not specified")}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-medium text-gray-800">
                        {order.void || t("-")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(order);
                        }}
                        className="p-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex justify-between">
              <p className="font-semibold">
                {t("Total Voided Orders")}:{" "}
                <span className="text-red-600">{orders.length}</span>
              </p>
              <p className="font-semibold">
                {t("Total Lost Amount")}:
                <span className="ml-2 text-red-600">
                  {formatCurrency(orders.reduce((sum, o) => sum + o.amount, 0))}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
          <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white shadow-2xl rounded-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 text-white bg-red-600 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">
                  {t("Order Details")} #{selectedOrder.order_number}
                </h2>
                <p className="text-red-100">{t("Voided Order")}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 transition rounded-lg hover:bg-red-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">
                    Basic Info
                  </h3>
                  <div className="space-y-3">
                    <DetailRow label={t("Order ID")} value={selectedOrder.id} />
                    <DetailRow
                      label={t("Order Number")}
                      value={selectedOrder.order_number}
                    />
                    <DetailRow
                      label={t("Created At")}
                      value={formatDate(selectedOrder.created_at)}
                    />
                    <DetailRow
                      label={t("Amount")}
                      value={formatCurrency(selectedOrder.amount)}
                      bold
                    />
                    <DetailRow label={t("Type")} value={selectedOrder.type} />
                    <DetailRow
                      label={t("Order Type")}
                      value={
                        selectedOrder.order_type === "take_away"
                          ? "Take Away"
                          : "Delivery"
                      }
                    />
                    <DetailRow
                      label={t("Source")}
                      value={selectedOrder.source?.toUpperCase()}
                    />
                    <DetailRow
                      label={t("Status")}
                      value={selectedOrder.order_status}
                      badge
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">
                    Void Information
                  </h3>
                  <div className="space-y-3">
                    <DetailRow
                      label={t("Void Reason")}
                      value={selectedOrder.void_reason || t("Not provided")}
                      highlight={!!selectedOrder.void_reason}
                    />
                    <DetailRow
                      label={t("Void")}
                      value={selectedOrder.void || t("-")}
                      highlight
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">
                    {t("Customer & Location")}
                  </h3>
                  <div className="space-y-3">
                    <DetailRow
                      label={t("Customer Name")}
                      value={
                        `${selectedOrder.user?.f_name || ""} ${selectedOrder.user?.l_name || ""
                          }`.trim() || "—"
                      }
                    />
                    <DetailRow
                      label={t("Phone")}
                      value={selectedOrder.user?.phone || "—"}
                    />
                    <DetailRow
                      label={t("Branch")}
                      value={selectedOrder.branch?.name || "—"}
                    />
                    <DetailRow
                      label={t("Zone")}
                      value={selectedOrder.address?.zone?.zone || "—"}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">
                    Payment & Delivery
                  </h3>
                  <div className="space-y-3">
                    <DetailRow
                      label={t("Payment Method")}
                      value={selectedOrder.payment_method?.name || "—"}
                    />
                    <DetailRow
                      label={t("Delivery Man")}
                      value={selectedOrder.delivery?.name || "—"}
                    />
                    <DetailRow
                      label={t("Schedule")}
                      value={selectedOrder.schedule?.name || "—"}
                    />
                    <DetailRow
                      label={t("Transaction ID")}
                      value={selectedOrder.transaction_id || "—"}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">
                    Other Info
                  </h3>
                  <div className="space-y-3">
                    <DetailRow
                      label={t("Points Earned")}
                      value={selectedOrder.points}
                    />
                    <DetailRow
                      label={t("Rate")}
                      value={
                        selectedOrder.rate ? `${selectedOrder.rate}/5` : "—"
                      }
                    />
                    <DetailRow
                      label={t("Rejected Reason")}
                      value={selectedOrder.rejected_reason || "—"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 text-right border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-6 py-3 text-white transition bg-gray-600 rounded-xl hover:bg-gray-700"
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Detail Row Component
const DetailRow = ({
  label,
  value,
  bold = false,
  highlight = false,
  badge = false,
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="font-medium text-gray-600">{label}:</span>
    <span
      className={`font-semibold ${bold
        ? "text-lg text-red-600"
        : highlight
          ? "text-red-700"
          : "text-gray-900"
        } ${badge
          ? "px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
          : ""
        }`}
    >
      {value || "—"}
    </span>
  </div>
);

export default VoidList;
