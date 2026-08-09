import React, { useEffect, useState, useCallback } from 'react';
import { useGet } from '../../../../../Hooks/useGet';
import { useChangeState } from '../../../../../Hooks/useChangeState';
import { StaticLoader, Switch } from '../../../../../Components/Components';
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Reusable Toggle Component ──
const ToggleSetting = ({ labelKey, isChecked, onToggle, isLoading }) => {
       const { t } = useTranslation();
       const statusText = isChecked ? t('Enabled') : t('Disabled');

       return (
              <div className="flex items-center justify-start gap-x-3 p-4 bg-white shadow-md rounded-lg min-w-[300px]">
                     <span className="flex-grow font-medium text-gray-700">{t(labelKey)}:</span>
                     <Switch
                            checked={isChecked}
                            handleClick={onToggle}
                            disabled={isLoading}
                     />
                     <span className={`text-sm font-semibold ${isChecked ? 'text-green-600' : 'text-red-600'}`}>
                            ({statusText})
                     </span>
              </div>
       );
};

// ── Main Component ──
const CancellationNotificationPage = () => {
       const { t } = useTranslation();
       const { changeState } = useChangeState();

       const {
              refetch: refetchNotification,
              loading: loadingNotification,
              data: dataNotification
       } = useGet({
              url: `${API_BASE_URL}/admin/settings/cancelation_notification`,
       });

       const [repeated, setRepeated] = useState(0);
       const [rOnlineNoti, setROnlineNoti] = useState(0);
       const [updating, setUpdating] = useState(false);

       // Initialize from API
       useEffect(() => {
              if (!dataNotification) return;

              // Using the actual field names returned by the GET endpoint
              setRepeated(Number(dataNotification.repeated || dataNotification.repeated_notification) || 0);
              setROnlineNoti(Number(dataNotification.r_online_noti || dataNotification.r_order_online) || 0);
       }, [dataNotification]);

       // Initial fetch
       useEffect(() => {
              refetchNotification();
       }, [refetchNotification]);

       // Update function - always sends both current values
       const updateBothSettings = useCallback(async (currentRepeated, currentROnline) => {
              setUpdating(true);

              const payload = {
                     repeated: currentRepeated,
                     r_online_noti: currentROnline
              };

              const response = await changeState(
                     `${API_BASE_URL}/admin/settings/update_cancelation_notification`,
                     t("Notification settings updated successfully"),
                     payload
              );

              if (response && !response?.errors) {
                     // Keep local state in sync (optional - can also refetch)
                     setRepeated(currentRepeated);
                     setROnlineNoti(currentROnline);
                     refetchNotification(); // Recommended to stay 100% in sync
              } else {
                     console.error("Update failed:", response?.errors);
                     // TODO: show error notification/toast to user
              }

              setUpdating(false);
       }, [changeState, t, refetchNotification]);

       // Toggle handlers - calculate new value and send immediately
       const toggleRepeated = useCallback(() => {
              const newRepeated = repeated === 1 ? 0 : 1;
              setRepeated(newRepeated);
              updateBothSettings(newRepeated, rOnlineNoti);
       }, [repeated, rOnlineNoti, updateBothSettings]);

       const toggleROnline = useCallback(() => {
              const newROnline = rOnlineNoti === 1 ? 0 : 1;
              setROnlineNoti(newROnline);
              updateBothSettings(repeated, newROnline);
       }, [repeated, rOnlineNoti, updateBothSettings]);

       const isLoading = loadingNotification || updating;

       return (
              <div className="min-h-screen p-4">
                     {isLoading ? (
                            <div className="flex items-center justify-center h-96">
                                   <StaticLoader />
                            </div>
                     ) : (
                            <section className="flex flex-col items-start w-full max-w-lg gap-y-5">
                                   <ToggleSetting
                                          labelKey="Repeated Cancellation Notification"
                                          isChecked={repeated === 1}
                                          onToggle={toggleRepeated}
                                          isLoading={updating}
                                   />

                                   <ToggleSetting
                                          labelKey="General Repeated Notification (online orders)"
                                          isChecked={rOnlineNoti === 1}
                                          onToggle={toggleROnline}
                                          isLoading={updating}
                                   />
                            </section>
                     )}
              </div>
       );
};

export default CancellationNotificationPage;