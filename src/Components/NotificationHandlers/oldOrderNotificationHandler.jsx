// import { useEffect, useState, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useTranslation } from 'react-i18next';
// import { useGet } from '../../Hooks/useGet';
// import { usePost } from '../../Hooks/usePostJson';
// import { setNewOrders, triggerRefresh } from '../../Store/CreateSlices';
// import { NewOrdersComponent } from '../Components';
// import { useNotificationSound } from './NotificationListener';

// const OrderNotificationHandler = ({ apiUrl, role }) => {
//     const { t } = useTranslation();
//     const dispatch = useDispatch();
//     const { playNotificationSound } = useNotificationSound();
//     const [isOpen, setIsOpen] = useState(false);
//     const [allCount, setAllCount] = useState(0);
//     const prevCountRef = useRef(0);
//     const prevOrderIdNotifyRef = useRef(null);
//     const notifiedIdsRef = useRef(new Set());

//     const branchesUrl =
//         role === "branch"
//             ? `${apiUrl}/branch/online_order/count_orders`
//             : `${apiUrl}/admin/order/count`;

//     const notificationUrl =
//         role === "branch"
//             ? `${apiUrl}/branch/online_order/notification`
//             : `${apiUrl}/admin/order/notification`;

//     const {
//         refetch: refetchCountOrders,
//         data: dataCountOrders,
//     } = useGet({
//         url: branchesUrl,
//     });

//     const { refetch: refetchNotifications, data: dataNotifications } = useGet({
//         url: notificationUrl,
//     });

//     const markAsReadUrl = `${apiUrl}/admin/order/is_read`;
//     const { postData: markAsRead } = usePost({
//         url: markAsReadUrl,
//     });

//     const newOrders = useSelector((state) => state.newOrders);

//     useEffect(() => {
//         refetchCountOrders();
//     }, [refetchCountOrders]);

//     useEffect(() => {
//         if (dataCountOrders) {
//             setAllCount(dataCountOrders.orders);
//         }
//     }, [dataCountOrders]);

//     const notifyUser = (uniqueId = null) => {
//         playNotificationSound();

//         if (document.hidden && Notification.permission === 'granted') {
//             try {
//                 new Notification(t("New Order Received"), {
//                     body: t("Check your dashboard for details"),
//                     tag: uniqueId,
//                     renotify: true
//                 });
//             } catch (e) {
//                 console.error("Notification error:", e);
//             }
//         }
//     };

//     useEffect(() => {
//         if (dataNotifications) {
//             // Check if data is nested in .data (Laravel standard) or direct
//             const actualData = dataNotifications.data ? dataNotifications.data : dataNotifications;

//             // Mapping based on user feedback:
//             // "new_orders": 3, "order_id": [3677, 3676, 3675]
//             const raw_orders = actualData.order_id || [];

//             // Ensure orders is an array (convert if it's an object or a single value)
//             let all_orders = [];
//             if (Array.isArray(raw_orders)) {
//                 all_orders = raw_orders.map(id => String(id));
//             } else if (typeof raw_orders === 'object' && raw_orders !== null) {
//                 all_orders = Object.values(raw_orders).map(id => String(id));
//             } else if (raw_orders) {
//                 all_orders = [String(raw_orders)];
//             }

//             // CRITICAL: The total count for the badge should be the length of the unread list
//             const total_unread_count = all_orders.length;

//             // Use the first ID in the list as the "primary" ID for deep linking
//             const main_id = all_orders.length > 0 ? all_orders[0] : null;

//             // Session Storage Interaction to prevent repeats on refresh
//             let notifiedSession = new Set();
//             try {
//                 const stored = sessionStorage.getItem('notifiedOrders');
//                 if (stored) {
//                     notifiedSession = new Set(JSON.parse(stored));
//                 }
//             } catch (e) {
//                 console.error("Session storage read error", e);
//             }

//             // Check for truly new IDs we haven't notified about in this session
//             const hasNewUnnotifiedId = all_orders.some(id => !notifiedSession.has(id));

//             // Only trigger if we actually have new unnotified IDs.
//             const shouldTrigger = total_unread_count > 0 && hasNewUnnotifiedId;

//             // Trigger alert if there are new orders or unnotified IDs
//             if (shouldTrigger) {
//                 dispatch(setNewOrders({
//                     count: total_unread_count,
//                     id: main_id,
//                     orders: all_orders
//                 }));

//                 dispatch(triggerRefresh());

//                 notifyUser(main_id);

//                 setIsOpen(true); // Open modal

//                 // Mark all current IDs as notified in this session to prevent repeats
//                 all_orders.forEach(id => notifiedSession.add(id));
//                 try {
//                     sessionStorage.setItem('notifiedOrders', JSON.stringify([...notifiedSession]));
//                 } catch (e) {
//                     console.error("Session storage write error", e);
//                 }

//                 prevCountRef.current = total_unread_count;
//                 if (main_id) prevOrderIdNotifyRef.current = main_id;
//             } else {
//                 // Keep the navbar list and badge updated in sync with the actual unread list
//                 dispatch(setNewOrders({
//                     count: total_unread_count,
//                     orders: all_orders
//                 }));
//                 prevCountRef.current = total_unread_count;
//             }
//         }
//     }, [dataNotifications, playNotificationSound, dispatch, t]);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             refetchNotifications();
//         }, 8000);

//         return () => clearInterval(interval);
//     }, [refetchNotifications]);

//     useEffect(() => {
//         if (dataNotifications) {
//             refetchCountOrders();
//         }
//     }, [dataNotifications, refetchCountOrders]);

//     const handleClose = () => {
//         setIsOpen(false);
//     };

//     const handleCheckOrders = (orderId) => {
//         if (orderId) {
//             const formData = new FormData();
//             formData.append('order_id', orderId);
//             markAsRead(formData, { params: { order_id: orderId } });

//             // Immediate local update to avoid "removing all" or delayed visuals
//             const currentOrders = Array.isArray(newOrders.orders) ? newOrders.orders : Object.values(newOrders.orders || {});
//             const updatedOrders = currentOrders.filter(id => String(id) !== String(orderId));
//             dispatch(setNewOrders({
//                 count: Math.max(0, updatedOrders.length),
//                 orders: updatedOrders
//             }));
//         }
//     };

//     return (
//         <>
//             {isOpen && (
//                 <NewOrdersComponent
//                     isOpen={isOpen}
//                     onClose={handleClose}
//                     onCheckOrders={handleCheckOrders}
//                 />
//             )}
//         </>
//     );
// };

// export default OrderNotificationHandler;
