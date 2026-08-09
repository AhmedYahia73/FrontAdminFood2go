import React, { useEffect, useState } from "react";
import {
  PasswordInput,
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { useGet } from "../../../../Hooks/useGet";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "primereact/multiselect";
import { useNavigate, useParams } from "react-router-dom";

const EditWaiter = () => {
  const { waiterId } = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/waiter/update/${waiterId}`,
  });
  const { refetch: refetchWaiter, loading: loadingWaiter, data: dataWaiter } = useGet({ url: `${apiUrl}/admin/waiter/item/${waiterId}` });
  const { refetch: refetchLists, loading: loadingLists, data: dataLists } = useGet({ url: `${apiUrl}/admin/waiter` });

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [allLocations, setAllLocations] = useState([]); // Store all locations
  const [filteredLocations, setFilteredLocations] = useState([]); // Locations filtered by branch
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [status, setStatus] = useState(0);

  // Fetch branches and locations
  useEffect(() => {
    refetchLists();
    refetchWaiter();
  }, [refetchLists, refetchWaiter]);

  useEffect(() => {
    if (dataLists) {
      setAllLocations(dataLists.cafe_locations || []);
      setBranches(dataLists.branches || []);
    }
  }, [dataLists]);

  // Filter locations when branch changes
  useEffect(() => {
    if (selectedBranch && allLocations.length > 0) {
      // Filter locations by branch_id
      const filtered = allLocations.filter(
        location => location.branch_id === selectedBranch.id
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [selectedBranch, allLocations]);

  // Handle branch selection
  const handleBranchChange = (e) => {
    const branch = e.value;
    setSelectedBranch(branch);
    
    // If branch changes, filter locations and clear selected locations if they don't belong to the new branch
    if (branch && allLocations.length > 0) {
      const filtered = allLocations.filter(
        location => location.branch_id === branch.id
      );
      setFilteredLocations(filtered);
      
      // Filter selected locations to only keep those that belong to the new branch
      const validSelectedLocations = selectedLocations.filter(
        location => location.branch_id === branch.id
      );
      setSelectedLocations(validSelectedLocations);
    } else {
      setFilteredLocations([]);
      setSelectedLocations([]);
    }
  };

  // Populate form with existing waiter data
  useEffect(() => {
    if (dataWaiter) {
      const waiter = dataWaiter.waiter;
      setUserName(waiter.user_name || "");
      setStatus(waiter.status || 0);
      setSelectedBranch(waiter.branch || null);
      
      // Set selected locations after branch is set
      if (waiter.branch && waiter.locations) {
        setSelectedLocations(waiter.locations || []);
      }
    } 
  }, [dataWaiter]);

  // When branch and all locations are loaded, filter locations for the selected branch
  useEffect(() => {
    if (selectedBranch && allLocations.length > 0 && dataWaiter) {
      const filtered = allLocations.filter(
        location => location.branch_id === selectedBranch.id
      );
      setFilteredLocations(filtered);
    }
  }, [selectedBranch, allLocations, dataWaiter]);

  // Handle status toggle
  const handleChangeStatus = () => {
    setStatus(status === 0 ? 1 : 0);
  };

  // Reset form
  const handleReset = () => {
    setUserName("");
    setPassword("");
    setStatus(0);
    setSelectedLocations([]);
    setSelectedBranch(null);
    setFilteredLocations([]);
  };

  // Reset form after successful submission
  useEffect(() => {
    if (!loadingPost && response) {
      navigate(-1);
    }
  }, [response, loadingPost]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if branch is selected
    if (!selectedBranch) {
      alert(t("Please select a branch first"));
      return;
    }

    const formData = new FormData();
    formData.append("user_name", userName);
    
    // Only append password if it's provided (for updates)
    if (password) {
      formData.append("password", password);
    }
    
    formData.append("status", status);
    if (selectedBranch) {
      formData.append("branch_id", selectedBranch.id);
    }
    selectedLocations.forEach((location, index) => {
      formData.append(`locations[${index}]`, location.id);
    });

    await postData(formData, t("Waiter Updated Success!"));
  };

  return (
    <>
      {loadingPost || loadingLists || loadingWaiter ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <form
          className="flex flex-wrap items-start justify-start w-full gap-4 sm:flex-col lg:flex-row"
          onSubmit={handleSubmit}
        >
          {/* User Name */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("UserName")}:
            </span>
            <TextInput
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t("UserName")}
            />
          </div>
          {/* Password */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Password")}:
            </span>
            <PasswordInput
              backgound="white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("Password")}
            />
            <span className="text-sm text-gray-500">
              {t("Leave empty to keep current password")}
            </span>
          </div>
          {/* Branch - Moved before Locations */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Branch")}:
            </span>
            <Dropdown
              value={selectedBranch}
              onChange={handleBranchChange}
              options={branches}
              optionLabel="name"
              placeholder={t("Select Branch")}
              className="w-full bg-white md:w-20rem"
            />
          </div>
          {/* Locations - Now depends on branch selection */}
          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Locations")}:
            </span>
            <MultiSelect
              value={selectedLocations}
              onChange={(e) => setSelectedLocations(e.value)}
              options={filteredLocations}
              optionLabel="name"
              display="chip"
              placeholder={
                selectedBranch 
                  ? t("Select Locations") 
                  : t("Please select a branch first")
              }
              maxSelectedLabels={3}
              className="w-full bg-white md:w-20rem"
              disabled={!selectedBranch} // Disable if no branch selected
            />
          </div>
          {/* Status */}
          <div className="xl:w-[30%] flex items-center justify-start mt-4 gap-x-4">
            <span className="text-xl font-TextFontRegular text-thirdColor">
              {t("Active")}:
            </span>
            <Switch handleClick={handleChangeStatus} checked={status} />
          </div>
          {/* Buttons */}
          <div className="flex items-center justify-end w-full gap-x-4">
            <div className="">
              <StaticButton
                text={t("Reset")}
                handleClick={handleReset}
                bgColor="bg-transparent"
                Color="text-mainColor"
                border={"border-2"}
                borderColor={"border-mainColor"}
                rounded="rounded-full"
              />
            </div>
            <div className="">
              <SubmitButton
                text={t("Edit")}
                rounded="rounded-full"
                handleClick={handleSubmit}
              />
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default EditWaiter;