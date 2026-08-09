import React, { useEffect, useState, useRef } from 'react';
import { LoaderLogin, NumberInput, StaticButton, SubmitButton, TimeInput, TitleSection } from '../../../../../Components/Components';
import { useGet } from '../../../../../Hooks/useGet';
import { usePost } from '../../../../../Hooks/usePostJson';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useAuth } from '../../../../../Context/Auth';
import { useTranslation } from 'react-i18next';
import { useDelete } from '../../../../../Hooks/useDelete';
import { DeleteIcon } from '../../../../../Assets/Icons/AllIcons';
import Warning from '../../../../../Assets/Icons/AnotherIcons/WarningIcon';
import { Dialog as HuiDialog, DialogBackdrop, DialogPanel } from '@headlessui/react';

const RestaurantTimeSlotPage = ({ refetch }) => {
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const toast = useRef(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState({
    from: '',
    hours: '',
    minutes: '',
    branch_id: null
  });
  const { t, i18n } = useTranslation();

  const [editingSlot, setEditingSlot] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [openDelete, setOpenDelete] = useState(null);

  const { deleteData, loadingDelete } = useDelete();

  const { refetch: refetchTimeSlot, loading: loadingTime, data: dataSlot } = useGet({
    url: `${apiUrl}/admin/settings/business_setup/time_slot`
  });

  const { postData: postCustom, loadingPost: loadingCustom } = usePost({
    url: `${apiUrl}/admin/settings/business_setup/time_slot/add_custom`,
    type: true // Ensure JSON content type
  });

  const { postData: postTimeSlot, loadingPost: loadingTimeSlot } = usePost({
    url: `${apiUrl}/admin/settings/business_setup/time_slot/add_times`
  });

  const { postData: postUpdateTimeSlot, loadingPost: loadingUpdateTimeSlot } = usePost({
    url: `${apiUrl}/admin/settings/business_setup/time_slot/update_times/${editingSlot?.id}`
  });

  const [optionName, setOptionName] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([]);
  const [days, setDays] = useState([
    { name: 'Sunday' },
    { name: 'Monday' },
    { name: 'Tuesday' },
    { name: 'Wednesday' },
    { name: 'Thursday' },
    { name: 'Friday' },
    { name: 'Saturday' }
  ]);
  const [branches, setBranches] = useState([]);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [isSubmittingTimeSlots, setIsSubmittingTimeSlots] = useState(false);

  useEffect(() => {
    refetchTimeSlot();
  }, [refetchTimeSlot]);

  useEffect(() => {
    if (dataSlot) {
      setBranches(dataSlot.branches || []);

      if (dataSlot.days?.length > 0) {
        const customDays = dataSlot.days
          .filter(day => day !== 'none')
          .map(day => ({ name: day }));
        setSelectedDays(customDays);
        setOptionName('daily');
      }

      if (dataSlot.time_setting?.length > 0) {
        const slotsWithBranches = dataSlot.time_setting.map(slot => ({
          ...slot,
          branch: dataSlot.branches?.find(b => b.id === slot.branch_id) || null
        }));
        setTimeSlots(slotsWithBranches);
      }
    }
  }, [dataSlot]);

  useEffect(() => {
    if (!loadingUpdateTimeSlot && !loadingTimeSlot && !loadingCustom) {
      refetchTimeSlot();
      handleReset();
    }
  }, [loadingUpdateTimeSlot, loadingTimeSlot, loadingCustom]);

  const formatTimeToHHMMSS = (time) => {
    if (!time) return '';
    if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
    return time;
  };

  const validateTimeSlot = (slot) => {
    if (!slot.from) return t('Opening time is required');
    // Check if it's a string/number and not empty, allowing '0'
    if (slot.hours === '' || isNaN(parseInt(slot.hours, 10))) return t('Valid number of hours is required');
    if (slot.minutes === '' || isNaN(parseInt(slot.minutes, 10))) return t('Valid number of minutes is required');
    if (!slot.branch_id) return t('Branch selection is required');
    return null;
  };

  const handleAddTimeSlot = async () => {
    const error = validateTimeSlot(newTimeSlot);
    if (error) {
      auth.toastError('error', 'Validation Error', error);
      return;
    }

    const formattedTime = formatTimeToHHMMSS(newTimeSlot.from);
    const branch = branches.find(b => b.id === newTimeSlot.branch_id);
    const tempId = Date.now();

    const payload = {
      from: formattedTime,
      hours: parseInt(newTimeSlot.hours, 10),
      minutes: parseInt(newTimeSlot.minutes, 10),
      branch_id: parseInt(newTimeSlot.branch_id, 10)
    };

    const response = await postTimeSlot(payload);
    if (response?.id) {
      setTimeSlots([...timeSlots, {
        ...newTimeSlot,
        from: formattedTime,
        branch,
        id: response.id
      }]);
      auth.toastSuccess(t('Branch Time added and saved to server'));
    } else {
      throw new Error(t('No ID returned from server'));
    }
    setNewTimeSlot({ from: '', hours: '', minutes: '', branch_id: null });
  };

  const handleEditSlot = (slot) => {
    setEditingSlot({ ...slot });
    setSelectedTime(slot.id ? slot.id.toString() : slot.tempId.toString());
    setShowEditDialog(true);
  };

  const handleUpdateSlot = async () => {
    const error = validateTimeSlot(editingSlot);
    if (error) {
      auth.toastError('error', 'Validation Error', error);
      return;
    }
    const formattedTime = formatTimeToHHMMSS(editingSlot.from);
    const updatedSlot = {
      ...editingSlot,
      from: formattedTime,
      branch: branches.find(b => b.id === editingSlot.branch_id)
    };

    if (editingSlot.id && typeof editingSlot.id === 'number') {
      const response = await postUpdateTimeSlot({
        from: formattedTime,
        hours: parseInt(editingSlot.hours, 10),
        minutes: parseInt(editingSlot.minutes, 10),
        branch_id: editingSlot.branch_id
      });

      if (response) {
        setTimeSlots(timeSlots.map(slot =>
          slot.id === editingSlot.id ? updatedSlot : slot
        ));
        auth.toastSuccess(t('Branch Time updated successfully'));
      }
    }
    setShowEditDialog(false);
    setEditingSlot(null);
    setSelectedTime('');
  };

  const handleSubmitTimeSlots = async (e) => {
    e.preventDefault();
    if (timeSlots.length === 0) {
      auth.toastError(t('Please add at least one Branch Time'));
      return;
    }

    setIsSubmittingTimeSlots(true);
    const results = await Promise.allSettled(
      timeSlots
        .filter(slot => !slot.id)
        .map(async (slot) => {
          const error = validateTimeSlot(slot);
          if (error) {
            throw new Error(`Invalid slot: ${error}`);
          }

          const payload = {
            from: formatTimeToHHMMSS(slot.from),
            hours: parseInt(slot.hours, 10),
            minutes: parseInt(slot.minutes, 10),
            branch_id: parseInt(slot.branch_id, 10)
          };

          const response = await postTimeSlot(payload);
          return { slot, response };
        })
    );

    const updatedSlots = timeSlots.map((slot, index) => {
      if (slot.id) return slot;
      const result = results.find((r, i) => timeSlots[i].tempId === slot.tempId);
      if (result?.status === 'fulfilled' && result.value.response?.id) {
        const { response } = result.value;
        return {
          ...slot,
          id: response.id,
          tempId: undefined,
          branch: branches.find(b => b.id === slot.branch_id) || slot.branch
        };
      }
      auth.toastError(`Failed to process slot: ${result?.reason?.message || 'Unknown error'}`);
      return slot;
    });

    setTimeSlots(updatedSlots);
  };

  const handleSubmitCustomDays = async (e) => {
    e.preventDefault();

    setIsSubmittingCustom(true);
    try {
      await postCustom({
        custom: selectedDays.length > 0 ? selectedDays.map(day => day.name) : []
      });
      refetchTimeSlot();
    } catch (error) {
      console.error('Submit custom days error:', error);
      auth.toastError(`Failed to save custom days: ${error.message}`);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleReset = () => {
    setTimeSlots([]);
    setNewTimeSlot({ from: '', hours: '', minutes: '', branch_id: null });
    setOptionName('daily');
    setSelectedDays([]);
    setSelectedTime('');
  };

  const handleOpenDelete = (id) => {
    setOpenDelete(id);
  };

  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const success = await deleteData(
      `${apiUrl}/admin/settings/business_setup/time_slot/delete_times/${id}`,
      t('Branch Time deleted successfully')
    );
    if (success) {
      setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
      handleCloseDelete();
      refetchTimeSlot();
    }
  };

  return (
    <>
      <Toast ref={toast} />
      {loadingTime || loadingTimeSlot || loadingCustom ? (
        <div className="flex items-center justify-center w-full h-56">
          <LoaderLogin />
        </div>
      ) : (
        <div className="flex flex-col items-start w-full gap-4 mb-20">
          <div className="flex w-full gap-8 mt-4">
            <span
              className={`text-xl font-TextFontRegular cursor-pointer ${optionName === 'daily' ? 'text-mainColor' : 'text-thirdColor'}`}
              onClick={() => setOptionName('daily')}
            >
              {t("Daily")}
            </span>
            <span
              className={`text-xl font-TextFontRegular cursor-pointer ${optionName === 'customize' ? 'text-mainColor' : 'text-thirdColor'}`}
              onClick={() => setOptionName('customize')}
            >
              {t("Customize")}
            </span>
          </div>

          {optionName === 'daily' &&
            <div className="w-full mt-6">
              <h3 className="mb-4 text-xl font-semibold">{t("Branch Times")}</h3>

              {timeSlots.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  {t("No Branch Times configured yet")}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
                  {timeSlots.map((slot, index) => (
                    <div key={slot.id || slot.tempId} className="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{slot.branch?.name || 'Branch Not Selected'}</p>
                          <p>{t("From")}: {slot.from}</p>
                          <p>{t("Hours")}: {slot.hours}</p>
                          <p>{t("Minutes")}: {slot.minutes}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditSlot(slot)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isSubmittingTimeSlots || loadingTimeSlot || loadingDelete}
                          >
                            {t("Edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(slot.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isSubmittingTimeSlots || loadingTimeSlot || loadingDelete}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="w-full p-4 rounded-lg bg-gray-50">
                <h4 className="mb-3 text-lg font-medium">{t("Add New Branch Time")}</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t("Branch *")}</label>
                    <Dropdown
                      value={newTimeSlot.branch_id}
                      options={branches.map(branch => ({
                        label: branch.name,
                        value: branch.id
                      }))}
                      onChange={(e) => setNewTimeSlot({
                        ...newTimeSlot,
                        branch_id: e.value
                      })}
                      placeholder={t("Select Branch")}
                      className="w-full"
                      disabled={isSubmittingTimeSlots || loadingTimeSlot}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t("Opening Time *")}</label>
                    <TimeInput
                      value={newTimeSlot.from}
                      onChange={(e) => setNewTimeSlot({
                        ...newTimeSlot,
                        from: e.target.value
                      })}
                      className="w-full"
                      disabled={isSubmittingTimeSlots || loadingTimeSlot}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t("Hours *")}</label>
                    <NumberInput
                      value={newTimeSlot.hours}
                      onChange={(e) => setNewTimeSlot({
                        ...newTimeSlot,
                        hours: e.target.value
                      })}
                      placeholder={t("Enter number of hours")}
                      className="w-full"
                      disabled={isSubmittingTimeSlots || loadingTimeSlot}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{t("Minutes *")}</label>
                    <NumberInput
                      value={newTimeSlot.minutes}
                      onChange={(e) => setNewTimeSlot({
                        ...newTimeSlot,
                        minutes: e.target.value
                      })}
                      placeholder={t("Enter number of minutes")}
                      className="w-full"
                      disabled={isSubmittingTimeSlots || loadingTimeSlot}
                      min={0}
                      max={59}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddTimeSlot}
                  className="px-4 py-2 mt-4 text-white rounded bg-mainColor hover:bg-red-700 disabled:bg-gray-400"
                  disabled={isSubmittingTimeSlots || loadingTimeSlot}
                >
                  {loadingTimeSlot ? t("Saving") : t('Add Branch Time')}
                </button>
              </div>
            </div>
          }

          {optionName === 'customize' && (
            <div className="flex flex-col items-start w-full mt-3 gap-y-1">
              <span className="text-xl text-thirdColor">{t('SelectDays')}:</span>
              <MultiSelect
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.value)}
                options={days}
                optionLabel="name"
                placeholder={t('SelectDays')}
                filter
                className="w-full md:w-1/2"
                disabled={isSubmittingCustom}
              />
              <div className="mt-4">
                <StaticButton
                  text={isSubmittingCustom ? t('Saving Days...') : t('Save Custom Days')}
                  rounded="rounded-full"
                  handleClick={handleSubmitCustomDays}
                  disabled={isSubmittingCustom || loadingTimeSlot}
                />
              </div>
            </div>
          )}

          <Dialog
            visible={showEditDialog}
            onHide={() => !isSubmittingTimeSlots && setShowEditDialog(false)}
            header="Edit Branch Time"
            className="w-full md:w-1/2"
          >
            {editingSlot && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">{t("Branch *")}</label>
                  <Dropdown
                    value={editingSlot.branch_id}
                    options={branches.map(branch => ({
                      label: branch.name,
                      value: branch.id
                    }))}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      branch_id: e.value
                    })}
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">{t("Opening Time *")}</label>
                  <TimeInput
                    value={editingSlot.from}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      from: e.target.value
                    })}
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">{t("Hours *")}</label>
                  <NumberInput
                    value={editingSlot.hours}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      hours: e.target.value
                    })}
                    placeholder={t("Enter number of hours")}
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">{t("Minutes")}</label>
                  <NumberInput
                    value={editingSlot.minutes}
                    onChange={(e) => setEditingSlot({
                      ...editingSlot,
                      minutes: e.target.value
                    })}
                    placeholder={t("Enter number of minutes")}
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                    min={0}
                    max={59}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditDialog(false);
                      setSelectedTime('');
                    }}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:bg-gray-200"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateSlot}
                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-300"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  >
                    {isSubmittingTimeSlots || loadingTimeSlot ? t('Updating...') : t('Update')}
                  </button>
                </div>
              </div>
            )}
          </Dialog>

          {openDelete && (
            <HuiDialog open={true} onClose={handleCloseDelete} className="relative z-10">
              <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
              <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                  <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                      <Warning width="28" height="28" aria-hidden="true" />
                      <div className="mt-2 text-center">
                        {t("You will delete this branch time slot")}
                      </div>
                    </div>
                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                        onClick={() => handleDelete(openDelete)}
                      >
                        {t("Delete")}
                      </button>
                      <button
                        type="button"
                        data-autofocus
                        onClick={handleCloseDelete}
                        className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                      >
                        {t("Cancel")}
                      </button>
                    </div>
                  </DialogPanel>
                </div>
              </div>
            </HuiDialog>
          )}
        </div>
      )}
    </>
  );
};

export default RestaurantTimeSlotPage;