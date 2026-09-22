import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Context/Auth';
import axios from 'axios';
import echo from '../../echo';
import { IoNotificationsOutline } from 'react-icons/io5';
import { HiOutlineCheckCircle, HiOutlineBellAlert } from 'react-icons/hi2';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const NotificationDropdown = () => {
    const { t, i18n } = useTranslation();
    const auth = useAuth();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const isRtl = i18n.language === 'ar';

    const role = auth.userState?.role || localStorage.getItem("role");
    const branchId = auth.userState?.id;

    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    const dropdownRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const fallbackIntervalRef = useRef(null);

    const getAuthHeaders = () => {
        const token = auth?.userState?.token || localStorage.getItem("token") || "";
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        };
    };

    // ─── Non-intrusive sound chime ──────────────────────────────────────────
    const playSubtleChime = useCallback(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {
            console.debug('Chime muted:', e);
        }
    }, []);

    // ─── Fetch Unread Count (API Fallback / Initial) ─────────────────────────
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await axios.get(`${apiUrl}/admin/home/notifications_count`, getAuthHeaders());
            const count = res.data?.count ?? res.data?.notifications_count ?? 0;
            setUnreadCount(Number(count));
        } catch (err) {
            console.error('Failed to fetch notifications count:', err);
        }
    }, [apiUrl]);

    // ─── Fetch Notifications List ───────────────────────────────────────────
    const fetchNotifications = useCallback(async (pageToFetch = 1, append = false) => {
        if (pageToFetch === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const res = await axios.get(`${apiUrl}/admin/home/notifications?page=${pageToFetch}`, getAuthHeaders());
            const paginator = res.data?.notifications;
            const newItems = paginator?.data || (Array.isArray(paginator) ? paginator : []);

            setNotifications((prev) => {
                if (!append) return newItems;
                // Merge and prevent duplicates by ID
                const existingIds = new Set(prev.map((n) => n.id));
                const filtered = newItems.filter((item) => !existingIds.has(item.id));
                return [...prev, ...filtered];
            });

            if (paginator && typeof paginator.current_page === 'number') {
                setPage(paginator.current_page);
                setHasMore(paginator.current_page < paginator.last_page);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to fetch notifications list:', err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [apiUrl]);

    // ─── Infinite Scroll Handler ────────────────────────────────────────────
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 40 && hasMore && !isLoadingMore && !isLoading) {
            fetchNotifications(page + 1, true);
        }
    };

    // ─── Realtime (Echo) Subscription ───────────────────────────────────────
    useEffect(() => {
        fetchUnreadCount();

        if (!echo) {
            // Echo disabled or no app key — fallback to periodic count polling
            fallbackIntervalRef.current = setInterval(fetchUnreadCount, 60000);
            return () => {
                if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
            };
        }

        // Determine channel: branch uses branch channel, otherwise newNotification
        const channelName = role === 'branch' && branchId ? `newNotification.${branchId}` : 'newNotification';
        const channel = echo.channel(channelName);

        const handleRealtimeNotification = (data) => {
            console.log('📢 Realtime Notification received on', channelName, data);

            const receivedNotif = {
                id: data.id || `temp-${Date.now()}`,
                notification: data.notification,
                is_read: Boolean(data.is_read),
                created_at: data.created_at || new Date().toISOString(),
                branch_ids: data.branch_ids || [],
            };

            setNotifications((prev) => {
                if (prev.some((n) => n.id === receivedNotif.id)) return prev;
                return [receivedNotif, ...prev];
            });

            setUnreadCount((c) => c + 1);
            playSubtleChime();
        };

        channel.listen('.NewNotificationEvent', handleRealtimeNotification);

        // Connection events
        const pusher = echo.connector?.pusher;
        if (pusher) {
            const onDisconnect = () => {
                if (!fallbackIntervalRef.current) {
                    fallbackIntervalRef.current = setInterval(fetchUnreadCount, 60000);
                }
            };
            const onConnect = () => {
                if (fallbackIntervalRef.current) {
                    clearInterval(fallbackIntervalRef.current);
                    fallbackIntervalRef.current = null;
                }
            };
            pusher.connection.bind('disconnected', onDisconnect);
            pusher.connection.bind('connected', onConnect);
        }

        return () => {
            echo.leaveChannel(channelName);
            if (fallbackIntervalRef.current) {
                clearInterval(fallbackIntervalRef.current);
            }
        };
    }, [role, branchId, fetchUnreadCount, playSubtleChime]);

    // ─── Click outside dropdown to close ────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── Handle Toggle Open ─────────────────────────────────────────────────
    const handleToggle = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            // Load fresh notifications on open
            fetchNotifications(1, false);
            fetchUnreadCount();
        }
    };

    // ─── Mark Single Item as Read ───────────────────────────────────────────
    const handleMarkSingleAsRead = async (item) => {
        if (item.is_read) return;

        // Optimistic UI update
        setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await axios.post(
                `${apiUrl}/admin/home/notifications/mark_as_read`,
                { id: item.id },
                getAuthHeaders()
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    // ─── Mark All as Read ───────────────────────────────────────────────────
    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 && notifications.every((n) => n.is_read)) return;

        setIsMarkingAll(true);
        // Optimistic UI update
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            await axios.post(
                `${apiUrl}/admin/home/notifications/mark_as_read`,
                {},
                getAuthHeaders()
            );
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        } finally {
            setIsMarkingAll(false);
        }
    };

    // ─── Format Time Ago ────────────────────────────────────────────────────
    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return formatDistanceToNow(date, {
                addSuffix: true,
                locale: isRtl ? ar : enUS,
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="relative flex-shrink-0" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                type="button"
                onClick={handleToggle}
                className="relative p-1 rounded-full text-mainColor hover:bg-gray-100 transition-colors focus:outline-none"
                title={t("System Notifications", "System Notifications")}
                aria-label="System Notifications"
            >
                <IoNotificationsOutline className="text-xl md:text-3xl" />
                {unreadCount > 0 && (
                    <span className="absolute flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full -top-1 -right-1 shadow-sm animate-in fade-in zoom-in duration-200">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-10 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in slide-in-from-top-2`}
                    style={{ maxHeight: '480px' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm md:text-base">
                                {t("Notifications", "الإشعارات")}
                            </span>
                            {unreadCount > 0 && (
                                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {unreadCount} {t("new", "جديد")}
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAll}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                                <HiOutlineCheckCircle className="text-sm" />
                                <span>{t("Mark all read", "تحديد الكل كمقروء")}</span>
                            </button>
                        )}
                    </div>

                    {/* Notification List Container */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="overflow-y-auto flex-1 divide-y divide-gray-100"
                        style={{ maxHeight: '380px' }}
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs">{t("Loading notifications...", "جاري تحميل الإشعارات...")}</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400 gap-2 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <HiOutlineBellAlert className="text-2xl" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    {t("No notifications yet", "لا توجد إشعارات حالياً")}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {t("You'll be notified when something arrives", "ستظهر الإشعارات هنا عند وصول تنبيهات جديدة")}
                                </span>
                            </div>
                        ) : (
                            <>
                                {notifications.map((item) => {
                                    const isRead = Boolean(item.is_read);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleMarkSingleAsRead(item)}
                                            className={`p-3.5 transition-all duration-150 cursor-pointer flex gap-3 items-start relative ${
                                                isRead
                                                    ? 'bg-slate-50/70 hover:bg-slate-100/70 text-gray-500'
                                                    : 'bg-white hover:bg-blue-50/40 text-gray-900 border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-500 shadow-sm'
                                            }`}
                                        >
                                            {/* Status Dot / Icon */}
                                            <div className="flex-shrink-0 mt-0.5">
                                                {!isRead ? (
                                                    <span className="flex h-2.5 w-2.5 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-block h-2 w-2 rounded-full bg-gray-300"></span>
                                                )}
                                            </div>

                                            {/* Notification Content */}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-xs md:text-sm leading-relaxed ${
                                                        isRead ? 'font-normal text-gray-500' : 'font-semibold text-gray-800'
                                                    }`}
                                                >
                                                    {item.notification}
                                                </p>
                                                {item.created_at && (
                                                    <span className="block mt-1 text-[11px] text-gray-400 font-normal">
                                                        {formatTime(item.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Bottom Spinner when fetching next page */}
                                {isLoadingMore && (
                                    <div className="py-3 flex justify-center items-center gap-2 text-xs text-gray-400 bg-gray-50/50">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>{t("Loading more...", "جاري تحميل المزيد...")}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50/80 border-t border-gray-100 text-center text-[11px] text-gray-400 flex-shrink-0">
                            {hasMore ? t("Scroll down for older notifications", "قم بالتمرير للأسفل لعرض إشعارات أقدم") : t("All notifications loaded", "تم عرض جميع الإشعارات")}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
