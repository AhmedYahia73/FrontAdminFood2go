import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../Hooks/useGet';
import { usePost } from '../../Hooks/usePostJson';
import { setNewOrders, triggerRefresh } from '../../Store/CreateSlices';
import { NewOrdersComponent } from '../Components';
import { useNotificationSound } from './NotificationListener';
import { useAuth } from '../../Context/Auth';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import echo from '../../echo';

const OrderNotificationHandler = ({ apiUrl, role }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const auth = useAuth();
    const { playNotificationSound } = useNotificationSound();
    const [isOpen, setIsOpen] = useState(false);
    const [allCount, setAllCount] = useState(0);
    const notifiedIdsRef = useRef(new Set());
    const queryClient = useQueryClient();

    // Track whether real-time is connected — starts as null (unknown)
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(null);
    const fallbackIntervalRef = useRef(null);

    // ─── Count API (kept as-is) ────────────────────────────────────────────────
    const branchesUrl =
        role === 'branch'
            ? `${apiUrl}/branch/online_order/count_orders`
            : `${apiUrl}/admin/order/count`;

    const {
        refetch: refetchCountOrders,
        data: dataCountOrders,
    } = useGet({ 
        url: branchesUrl,
        staleTime: 0,
        gcTime: 0 
    });

    useEffect(() => {
        refetchCountOrders();
    }, [refetchCountOrders]);

    useEffect(() => {
        if (dataCountOrders) {
            setAllCount(dataCountOrders.orders);
        }
    }, [dataCountOrders]);

    // ─── Fallback Notification URL (NOT via useGet — called manually only) ─────
    // This is only called via axios directly when real-time is DOWN.
    // We do NOT use useGet here to avoid auto-firing on mount.
    const notificationUrl =
        role === 'branch'
            ? `${apiUrl}/branch/online_order/notification`
            : `${apiUrl}/admin/order/notification`;

    // ─── Mark as read ──────────────────────────────────────────────────────────
    const markAsReadUrl = `${apiUrl}/admin/order/is_read`;
    const { postData: markAsRead } = usePost({ url: markAsReadUrl });

    const newOrders = useSelector((state) => state.newOrders);

    // ─── Play sound + browser notification ────────────────────────────────────
    const notifyUser = (uniqueId = null) => {
        playNotificationSound();
        if (document.hidden && Notification.permission === 'granted') {
            try {
                new Notification(`${t('New Order Received')} #${uniqueId}`, {
                    body: t('Check your dashboard for details'),
                    tag: uniqueId,
                    renotify: true,
                });
            } catch (e) {
                console.error('Notification error:', e);
            }
        }
    };

    // ─── Core: process a new order ID (shared by real-time & fallback) ─────────
    const processNewOrder = useCallback((orderIdStr) => {
        let notifiedSession = new Set();
        try {
            const stored = sessionStorage.getItem('notifiedOrders');
            if (stored) notifiedSession = new Set(JSON.parse(stored));
        } catch (e) { /* ignore */ }

        if (notifiedSession.has(orderIdStr) || notifiedIdsRef.current.has(orderIdStr)) {
            console.log('⚠️ Duplicate order ignored:', orderIdStr);
            return;
        }

        notifiedIdsRef.current.add(orderIdStr);
        notifiedSession.add(orderIdStr);
        try {
            sessionStorage.setItem('notifiedOrders', JSON.stringify([...notifiedSession]));
        } catch (e) { /* ignore */ }

        dispatch((_, getState) => {
            const currentOrders = Array.isArray(getState().newOrders?.orders)
                ? getState().newOrders.orders : [];
            const updatedOrders = [...currentOrders, orderIdStr];
            dispatch(setNewOrders({
                count: updatedOrders.length,
                id: orderIdStr,
                orders: updatedOrders,
            }));
        });

        notifyUser(orderIdStr);
        setIsOpen(true);

        // Add a 500ms delay before refetching to ensure the backend DB transaction is fully committed
        setTimeout(() => {
            dispatch(triggerRefresh());
            refetchCountOrders();
            queryClient.invalidateQueries();
        }, 500);

    }, [dispatch, refetchCountOrders, queryClient]);

    // ─── Real-time handler: confirmed payload { order_id: 92118 } ─────────────
    const handleIncomingOrder = useCallback((data) => {
        console.log('📦 Real-time NewOrderEvent received:', data);
        let parsed = typeof data === 'string' ? JSON.parse(data) : data;
        
        // If the payload is wrapped in a Pusher event object, parse the inner data string
        if (parsed?.data && typeof parsed.data === 'string') {
            try {
                parsed = JSON.parse(parsed.data);
            } catch (e) {
                console.error('Failed to parse inner data:', e);
            }
        }

        const orderId = parsed?.order_id ?? parsed?.order?.id ?? parsed?.id ?? null;
        if (!orderId) {
            console.warn('⚠️ Could not extract orderId from real-time event', parsed);
            return;
        }
        processNewOrder(String(orderId));
    }, [processNewOrder]);

    // ─── Fallback: direct axios call — only when real-time is DOWN ─────────────
    const fetchNotificationFallback = useCallback(async () => {
        try {
            const response = await axios.get(notificationUrl, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${auth?.userState?.token || ''}`,
                },
            });

            if (response.status !== 200 || !response.data) return;

            const actualData = response.data?.data ?? response.data;
            const raw_orders = actualData.order_id || [];

            let all_orders = [];
            if (Array.isArray(raw_orders)) {
                all_orders = raw_orders.map(item => {
                    const extractedId = typeof item === 'object' && item !== null ? (item.order_id || item.id || item) : item;
                    return String(extractedId);
                });
            } else if (typeof raw_orders === 'object' && raw_orders !== null) {
                all_orders = Object.values(raw_orders).map(item => {
                    const extractedId = typeof item === 'object' && item !== null ? (item.order_id || item.id || item) : item;
                    return String(extractedId);
                });
            } else if (raw_orders) {
                all_orders = [String(raw_orders)];
            }

            const total = all_orders.length;

            let notifiedSession = new Set();
            try {
                const stored = sessionStorage.getItem('notifiedOrders');
                if (stored) notifiedSession = new Set(JSON.parse(stored));
            } catch (e) { /* ignore */ }

            const hasNew = all_orders.some(id => !notifiedSession.has(id));

            if (hasNew && total > 0) {
                all_orders.forEach(id => processNewOrder(id));
            } else {
                dispatch(setNewOrders({ 
                    count: total, 
                    id: total > 0 ? all_orders[all_orders.length - 1] : null,
                    orders: all_orders 
                }));
            }
        } catch (err) {
            console.error('❌ Fallback notification API error:', err);
        }
    }, [notificationUrl, auth?.userState?.token, processNewOrder, dispatch]);

    // ─── Start / stop fallback polling ────────────────────────────────────────
    const startFallbackPolling = useCallback(() => {
        if (fallbackIntervalRef.current) return; // already running
        console.warn('⚠️ Real-time disconnected — switching to API polling fallback');
        fetchNotificationFallback(); // immediate first call
        fallbackIntervalRef.current = setInterval(() => {
            fetchNotificationFallback();
        }, 30000);
    }, [fetchNotificationFallback]);

    const stopFallbackPolling = useCallback(() => {
        if (fallbackIntervalRef.current) {
            clearInterval(fallbackIntervalRef.current);
            fallbackIntervalRef.current = null;
            console.log('✅ Real-time restored — stopped API polling fallback');
        }
    }, []);

    // ─── Subscribe to Reverb + monitor connection state ───────────────────────
    useEffect(() => {
        // If echo is null (VITE_REVERB_APP_KEY not set), skip real-time entirely
        if (!echo) {
            console.warn('⚠️ Echo is not initialised (no app key) — using API polling fallback');
            setIsRealtimeConnected(false);
            startFallbackPolling();
            return () => stopFallbackPolling();
        }

        const channel = echo.channel('newOrder');
        channel.listen('.NewOrderEvent', handleIncomingOrder);
        console.log('🔌 Subscribed to Reverb channel: newOrder | Event: .NewOrderEvent');

        const pusher = echo.connector?.pusher;

        if (pusher) {
            const onConnected = () => {
                console.log('✅ Reverb WebSocket connected — real-time active, no polling');
                setIsRealtimeConnected(true);
                stopFallbackPolling();
            };

            const onDisconnected = () => {
                console.warn('❌ Reverb WebSocket disconnected — starting fallback polling');
                setIsRealtimeConnected(false);
                startFallbackPolling();
            };

            const onFailed = () => {
                console.error('🚫 Reverb WebSocket failed — starting fallback polling');
                setIsRealtimeConnected(false);
                startFallbackPolling();
            };

            pusher.connection.bind('connected', onConnected);
            pusher.connection.bind('disconnected', onDisconnected);
            pusher.connection.bind('failed', onFailed);
            pusher.connection.bind('unavailable', onDisconnected);

            // Check current connection state immediately on mount
            const currentState = pusher.connection.state;
            console.log('🔍 Initial Reverb connection state:', currentState);
            if (currentState === 'connected') {
                setIsRealtimeConnected(true);
                // ✅ Connected: do NOT start polling
            } else if (['disconnected', 'failed', 'unavailable'].includes(currentState)) {
                setIsRealtimeConnected(false);
                startFallbackPolling();
            }
            // If state is 'connecting', wait for the connected/failed events above

            return () => {
                pusher.connection.unbind('connected', onConnected);
                pusher.connection.unbind('disconnected', onDisconnected);
                pusher.connection.unbind('failed', onFailed);
                pusher.connection.unbind('unavailable', onDisconnected);
                channel.stopListening('.NewOrderEvent');
                echo.leaveChannel('newOrder');
                stopFallbackPolling();
            };
        } else {
            // Echo connector not available at all — fallback immediately
            console.warn('⚠️ Echo connector unavailable — using API polling fallback');
            setIsRealtimeConnected(false);
            startFallbackPolling();

            return () => {
                channel.stopListening('.NewOrderEvent');
                echo.leaveChannel('newOrder');
                stopFallbackPolling();
            };
        }
    }, [role, handleIncomingOrder, startFallbackPolling, stopFallbackPolling]);

    // ─── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => {
        return () => stopFallbackPolling();
    }, [stopFallbackPolling]);

    // ─── Modal controls ────────────────────────────────────────────────────────
    const handleClose = () => setIsOpen(false);

    const handleCheckOrders = (orderId) => {
        if (orderId) {
            const formData = new FormData();
            formData.append('order_id', orderId);
            markAsRead(formData, { params: { order_id: orderId } });

            const currentOrders = Array.isArray(newOrders.orders)
                ? newOrders.orders
                : Object.values(newOrders.orders || {});
            const updatedOrders = currentOrders.filter(
                (id) => String(id) !== String(orderId)
            );
            dispatch(setNewOrders({
                count: Math.max(0, updatedOrders.length),
                id: updatedOrders.length > 0 ? updatedOrders[updatedOrders.length - 1] : null,
                orders: updatedOrders,
            }));
        }
    };

    return (
        <>
            {isOpen && (
                <NewOrdersComponent
                    isOpen={isOpen}
                    onClose={handleClose}
                    onCheckOrders={handleCheckOrders}
                />
            )}
        </>
    );
};

export default OrderNotificationHandler;
