// import React, { useEffect } from "react";
// import { Link } from "react-router-dom";

// const statusColors = {
//   pending: "bg-yellow-100 text-yellow-700",
//   canceled: "bg-red-100 text-red-700",
//   processing: "bg-blue-100 text-blue-700",
//   confirmed: "bg-green-100 text-green-700",
//   out_for_delivery: "bg-purple-100 text-purple-700",
// };

// const RecentOrders = ({ recent_orders }) => {

//   return (
//     <div className="bg-white py-3 px-4 w-full h-[32rem] overflow-hidden mx-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-TextFontSemiBold text-mainColor">Recent Orders</h3>
//         <Link to={'/dashboard/orders/all'} className="text-sm underline text-mainColor">
//           View All
//         </Link>
//       </div>

//       {recent_orders.lenght === 0 ? (
//         <div className="text-center font-TextFontMedium text-mainColor">
//           Not Found Orders
//         </div>
//       ) : (
//         <div className="h-full overflow-y-scroll scrollDrop">
//           {recent_orders.map((order) => (
//             <div
//               key={order.id}
//               className="flex items-center justify-between px-2 py-3 border-b border-gray-200 last:border-b-0"
//             >
//               <div >
//                 <p className="font-TextFontMedium">
//                   Order# {order.order_number ? order.order_number : 0}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {order.order_date},{" "}
//                   {(() => {
//                     const [hour, minute] = order.date.split(":").map(Number);
//                     const period = hour >= 12 ? "PM" : "AM";
//                     const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM/PM
//                     return `${formattedHour}:${minute < 10 ? "0" + minute : minute
//                       } ${period}`;
//                   })()}
//                 </p>
//               </div>
//               <div
//                 className={`px-3 py-1  rounded-full text-sm font-TextFontMedium ${statusColors[order.order_status.toLowerCase().replace(" ", "_")]
//                   }`}
//               >
//                 {order.order_status}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RecentOrders;

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  canceled: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
};

const RecentOrders = ({ recent_orders }) => {
  useEffect(() => {
  }, [recent_orders]);
  const {t}=useTranslation();

  return (
    <div className="bg-white py-3 px-4 w-full h-[32rem] overflow-hidden mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-TextFontSemiBold text-mainColor">{t("RecentOrders")}</h3>
        <Link to={'/dashboard/orders/all'} className="text-sm underline text-mainColor">
          {t("ViewAll")}
        </Link>
      </div>

      {recent_orders.lenght === 0 ? (
        <div className="text-center font-TextFontMedium text-mainColor">
          {t("NotFoundOrders")}
        </div>
      ) : (
        <div className="h-full overflow-y-scroll scrollDrop">
          {recent_orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between px-2 py-3 border-b border-gray-200 last:border-b-0"
            >
              <div >
                <p className="font-TextFontMedium">
               {t("Order#")} {order.order_number ? order.order_number : 0}
                </p>
                <p className="text-sm text-gray-500">
                  {order.order_date}
                </p>
              </div>
              <div
                className={`px-3 py-1  rounded-full text-sm font-TextFontMedium ${statusColors[order.order_status.toLowerCase().replace(" ", "_")]
                  }`}
              >
                {order.order_status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
