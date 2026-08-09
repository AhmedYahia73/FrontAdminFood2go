import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../Hooks/useGet';
import { setNewCanceledOrder } from '../../Store/CreateSlices';
import { NewCancellationOrderComponent } from '../Components';
import { useNotificationSound } from './NotificationListener';

const CancellationNotificationHandler = ({ apiUrl, role }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { playNotificationSound } = useNotificationSound();
    const [isOpen, setIsOpen] = useState(false);
    const prevCancelOrderIdRef = useRef(null);

    const cancellationUrl =
        role === "admin" ? `${apiUrl}/admin/settings/cancelation` : null;

    const {
        refetch: refetchCancellations,
        data: dataCancellations,
    } = useGet({
        url: cancellationUrl,
    });

    const canceledOrders = useSelector((state) => state.canceledOrders);

    const notifyUser = (uniqueId = null) => {
        playNotificationSound();

        if (document.hidden && Notification.permission === 'granted') {
            try {
                new Notification(t("Order Cancelled"), {
                    body: t("An order has been cancelled"),
                    tag: uniqueId,
                    renotify: true
                });
            } catch (e) {
                console.error("Notification error:", e);
            }
        }
    };

    useEffect(() => {
        if (dataCancellations && dataCancellations.orders && dataCancellations.orders.length > 0) {
            const latestOrder = dataCancellations.orders[0];
            if (latestOrder.id !== prevCancelOrderIdRef.current) {
                dispatch(setNewCanceledOrder(latestOrder.id));
                prevCancelOrderIdRef.current = latestOrder.id;

                notifyUser(`cancel-${latestOrder.id}`);
            }
        }
    }, [dataCancellations, canceledOrders, playNotificationSound, dispatch, t]);

    useEffect(() => {
        if (role === "admin") {
            const interval = setInterval(() => {
                refetchCancellations();
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [role, refetchCancellations]);

    useEffect(() => {
        setIsOpen(!!canceledOrders?.newOrder);
    }, [canceledOrders?.newOrder]);

    const handleClose = () => {
        setIsOpen(false);
        dispatch(setNewCanceledOrder(null));
    };

    return (
        <>
            {isOpen && (
                <NewCancellationOrderComponent
                    isOpen={isOpen}
                    onClose={handleClose}
                />
            )}
        </>
    );
};

export default CancellationNotificationHandler;
