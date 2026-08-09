import React, { useEffect, useState, useRef } from "react";
import {
  LoaderLogin,
  NumberInput,
  StaticButton,
  SubmitButton,
  TimeInput,
  TitleSection,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";

const RestaurantTimeSlotPage = ({ refetch }) => {
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const toast = useRef(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTimeSlot, setNewTimeSlot] = useState({
    from: "",
    hours: "",
    branch_id: null,
  });
  const { t, i18n } = useTranslation();

  const [editingSlot, setEditingSlot] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const {
    refetch: refetchTimeSlot,
    loading: loadingTime,
    data: dataSlot,
  } = useGet({
    url: `${apiUrl}/admin/settings/business_setup/time_slot`,
  });

  const { postData: postCustom, loadingPost: loadingCustom } = usePost({
    url: `${apiUrl}/admin/settings/business_setup/time_slot/add_custom`,
  });

  const { postData: postTimeSlot, loadingPost: loadingTimeSlot } = usePost({
    url: `${apiUrl}/admin/settings/business_setup/time_slot/add_times`,
  });

  const { postData: postUpdateTimeSlot, loadingPost: loadingUpdateTimeSlot } =
    usePost({
      url: `${apiUrl}/admin/settings/business_setup/time_slot/update_times/${selectedTime}`,
    });

  const [optionName, setOptionName] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([]);
  const [days, setDays] = useState([
    { name: "Sunday" },
    { name: "Monday" },
    { name: "Tuesday" },
    { name: "Wednesday" },
    { name: "Thursday" },
    { name: "Friday" },
    { name: "Saturday" },
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
        const customDays = dataSlot.days.map((day) => ({ name: day }));
        setSelectedDays(customDays);
        setOptionName("customize");
      }

      if (dataSlot.time_setting?.length > 0) {
        const slotsWithBranches = dataSlot.time_setting.map((slot) => ({
          ...slot,
          branch:
            dataSlot.branches?.find((b) => b.id === slot.branch_id) || null,
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
    if (!time) return "";
    if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
    return time;
  };

  const validateTimeSlot = (slot) => {
    if (!slot.from) return t("Opening time is required");
    if (!slot.hours || isNaN(parseInt(slot.hours, 10)))
      return t("Valid number of hours is required");
    if (!slot.branch_id || isNaN(slot.branch_id))
      return t("Branch selection is required");
    return null;
  };

  const handleAddTimeSlot = async () => {
    const error = validateTimeSlot(newTimeSlot);
    if (error) {
      auth.toastError("error", "Validation Error", error);
      return;
    }

    const formattedTime = formatTimeToHHMMSS(newTimeSlot.from);
    const branch = branches.find((b) => b.id === newTimeSlot.branch_id);
    const tempId = Date.now();

    const payload = {
      from: formattedTime,
      hours: parseInt(newTimeSlot.hours, 10),
      branch_id: parseInt(newTimeSlot.branch_id, 10),
    };

    const response = await postTimeSlot(payload);

    if (response?.id) {
      setTimeSlots([
        ...timeSlots,
        {
          ...newTimeSlot,
          from: formattedTime,
          branch,
          id: response.id, // Use server-generated ID
        },
      ]);
      auth.toastSuccess(t("Time slot added and saved to server"));
    } else {
      throw new Error("No ID returned from server");
    }
    setNewTimeSlot({ from: "", hours: "", branch_id: null });
  };

  const handleEditSlot = (slot) => {
    setEditingSlot({ ...slot });
    setSelectedTime(slot.id ? slot.id.toString() : slot.tempId.toString());
    setShowEditDialog(true);
  };

  const handleUpdateSlot = async () => {
    const error = validateTimeSlot(editingSlot);
    if (error) {
      auth.toastError("error", "Validation Error", error);
      return;
    }
    const formattedTime = formatTimeToHHMMSS(editingSlot.from);
    const updatedSlot = {
      ...editingSlot,
      from: formattedTime,
      branch: branches.find((b) => b.id === editingSlot.branch_id),
    };

    if (editingSlot.id && typeof editingSlot.id === "number") {
      const response = await postUpdateTimeSlot({
        from: formattedTime,
        hours: parseInt(editingSlot.hours, 10),
        branch_id: editingSlot.branch_id,
      });

      if (response) {
        setTimeSlots(
          timeSlots.map((slot) =>
            slot.id === editingSlot.id ? updatedSlot : slot
          )
        );
        auth.toastSuccess(t("Time slot updated successfully"));
      }
    }
    setShowEditDialog(false);
    setEditingSlot(null);
    setSelectedTime("");
  };

  const handleSubmitTimeSlots = async (e) => {
    e.preventDefault();
    if (timeSlots.length === 0) {
      auth.toastError("Please add at least one time slot");
      return;
    }

    setIsSubmittingTimeSlots(true);
    const results = await Promise.allSettled(
      timeSlots
        .filter((slot) => !slot.id) // Only process slots without server ID (i.e., failed local adds)
        .map(async (slot) => {
          const error = validateTimeSlot(slot);
          if (error) {
            throw new Error(`Invalid slot: ${error}`);
          }

          const payload = {
            from: formatTimeToHHMMSS(slot.from),
            hours: parseInt(slot.hours, 10),
            branch_id: parseInt(slot.branch_id, 10),
          };
          const response = await postTimeSlot(payload);
          return { slot, response };
        })
    );

    const updatedSlots = timeSlots.map((slot, index) => {
      if (slot.id) return slot; // Skip slots already posted
      const result = results.find(
        (r, i) => timeSlots[i].tempId === slot.tempId
      );
      if (result?.status === "fulfilled" && result.value.response?.id) {
        const { response } = result.value;
        return {
          ...slot,
          id: response.id,
          tempId: undefined,
          branch: branches.find((b) => b.id === slot.branch_id) || slot.branch,
        };
      }
      auth.toastError(
        `Failed to process slot: ${result?.reason?.message || "Unknown error"}`
      );
      return slot;
    });

    setTimeSlots(updatedSlots);
  };

  const handleSubmitCustomDays = async (e) => {
    e.preventDefault();
    if (optionName !== "customize" || selectedDays.length === 0) {
      auth.toastError(t("Please select at least one day in customize mode"));
      return;
    }

    setIsSubmittingCustom(true);
    try {
      await postCustom({
        custom: selectedDays.map((day) => day.name),
      });
      auth.toastSuccess(t("Custom days saved successfully"));
      refetchTimeSlot();
    } catch (error) {
      auth.toastError(`Failed to save custom days: ${error.message}`);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleReset = () => {
    setTimeSlots([]);
    setNewTimeSlot({ from: "", hours: "", branch_id: null });
    setOptionName("daily");
    setSelectedDays([]);
    setSelectedTime("");
  };

  return (
    <>
      <Toast ref={toast} />
      {loadingTime || loadingTimeSlot || loadingCustom ? (
        <div className="flex items-center justify-center w-full h-56">
          <LoaderLogin />
        </div>
      ) : (
        <div className="flex flex-col items-start w-full gap-4">
          <TitleSection text={t("Restaurant Operating Hours")} />

          <div className="flex w-full gap-8 mt-4">
            <span
              className={`text-xl font-TextFontRegular cursor-pointer ${
                optionName === "daily" ? "text-mainColor" : "text-thirdColor"
              }`}
              onClick={() => setOptionName("daily")}
            >
              {t("Daily")}
            </span>
            <span
              className={`text-xl font-TextFontRegular cursor-pointer ${
                optionName === "customize"
                  ? "text-mainColor"
                  : "text-thirdColor"
              }`}
              onClick={() => setOptionName("customize")}
            >
              {t("Customize")}
            </span>
          </div>

          {optionName === "customize" && (
            <div className="flex flex-col items-start w-full mt-3 gap-y-1">
              <span className="text-xl text-thirdColor">
                {t(t("SelectDay"))}:
              </span>
              <MultiSelect
                value={selectedDays}
                onChange={(e) => setSelectedDays(e.value)}
                options={days}
                optionLabel="name"
                placeholder={t("SelectDay")}
                filter
                className="w-full md:w-1/2"
                disabled={isSubmittingCustom}
              />
              <div className="mt-4">
                <SubmitButton
                  text={
                    isSubmittingCustom ? "Saving Days..." : "Save Custom Days"
                  }
                  rounded="rounded-full"
                  handleClick={handleSubmitCustomDays}
                  disabled={isSubmittingCustom || loadingTimeSlot}
                />
              </div>
            </div>
          )}

          <div className="w-full mt-6">
            <h3 className="mb-4 text-xl font-semibold">{t("Time Slots")}</h3>

            {timeSlots.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                {t("No time slots configured yet")}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot.id || slot.tempId}
                    className="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {slot.branch?.name || "Branch Not Selected"}
                        </p>
                        <p>
                          {t("From")}: {slot.from}
                        </p>
                        <p>
                          {t("Hours")}: {slot.hours}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSlot(slot)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isSubmittingTimeSlots || loadingTimeSlot}
                        >
                          {t("Edit")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="w-full p-4 rounded-lg bg-gray-50">
              <h4 className="mb-3 text-lg font-medium">
                {t("Add New Time Slot")}
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Branch")} *
                  </label>
                  <Dropdown
                    value={newTimeSlot.branch_id}
                    options={branches.map((branch) => ({
                      label: branch.name,
                      value: branch.id,
                    }))}
                    onChange={(e) =>
                      setNewTimeSlot({
                        ...newTimeSlot,
                        branch_id: e.value,
                      })
                    }
                    placeholder={t("Select Branch")}
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Opening Time")} *
                  </label>
                  <TimeInput
                    value={newTimeSlot.from}
                    onChange={(e) =>
                      setNewTimeSlot({
                        ...newTimeSlot,
                        from: e.target.value,
                      })
                    }
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Hours")} *
                  </label>
                  <NumberInput
                    value={newTimeSlot.hours}
                    onChange={(e) =>
                      setNewTimeSlot({
                        ...newTimeSlot,
                        hours: e.target.value,
                      })
                    }
                    placeholder={t("Enter number of hours")}
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddTimeSlot}
                className="px-4 py-2 mt-4 text-white rounded bg-mainColor hover:bg-red-700 disabled:bg-gray-400"
                disabled={isSubmittingTimeSlots || loadingTimeSlot}
              >
                {loadingTimeSlot ? t("Saving") : t("Add Time Slot")}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end w-full mt-6 gap-x-4">
            <StaticButton
              text={t("Reset")}
              handleClick={handleReset}
              bgColor="bg-transparent"
              Color="text-mainColor"
              border="border-2"
              borderColor="border-mainColor"
              rounded="rounded-full"
              disabled={
                isSubmittingCustom || isSubmittingTimeSlots || loadingTimeSlot
              }
            />
            <SubmitButton
              text={
                isSubmittingTimeSlots
                  ? t("Saving Time Slots")
                  : t("Save Time Slots")
              }
              rounded="rounded-full"
              handleClick={handleSubmitTimeSlots}
              disabled={
                isSubmittingCustom || isSubmittingTimeSlots || loadingTimeSlot
              }
            />
          </div>

          <Dialog
            visible={showEditDialog}
            onHide={() => !isSubmittingTimeSlots && setShowEditDialog(false)}
            header={t("Edit Time Slot")}
            className="w-full md:w-1/2"
          >
            {editingSlot && (
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Branch")} *
                  </label>
                  <Dropdown
                    value={editingSlot.branch_id}
                    options={branches.map((branch) => ({
                      label: branch.name,
                      value: branch.id,
                    }))}
                    onChange={(e) =>
                      setEditingSlot({
                        ...editingSlot,
                        branch_id: e.value,
                      })
                    }
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Opening Time")}*
                  </label>
                  <TimeInput
                    value={editingSlot.from}
                    onChange={(e) =>
                      setEditingSlot({
                        ...editingSlot,
                        from: e.target.value,
                      })
                    }
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("Hours")} *
                  </label>
                  <NumberInput
                    value={editingSlot.hours}
                    onChange={(e) =>
                      setEditingSlot({
                        ...editingSlot,
                        hours: e.target.value,
                      })
                    }
                    placeholder={t("Enter number of hours")}
                    className="w-full"
                    disabled={isSubmittingTimeSlots || loadingTimeSlot}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditDialog(false);
                      setSelectedTime("");
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
                    {isSubmittingTimeSlots || loadingTimeSlot
                      ? t("Updating")
                      : t("Update")}
                  </button>
                </div>
              </div>
            )}
          </Dialog>
        </div>
      )}
    </>
  );
};

export default RestaurantTimeSlotPage;
