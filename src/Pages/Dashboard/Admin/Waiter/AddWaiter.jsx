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
import { useNavigate } from "react-router-dom";

const AddWaiter = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/waiter/add`,
    });
    const {
        refetch: refetchLists,
        loading: loadingLists,
        data: dataLists,
    } = useGet({ url: `${apiUrl}/admin/waiter` });

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
    }, [refetchLists]);

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
            
            // Clear selected locations when branch changes
            setSelectedLocations([]);
        } else {
            setFilteredLocations([]);
            setSelectedLocations([]);
        }
    }, [selectedBranch, allLocations]);

    // Handle branch selection
    const handleBranchChange = (e) => {
        setSelectedBranch(e.value);
    };

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
        formData.append("password", password);
        formData.append("status", status);
        if (selectedBranch) {
            formData.append("branch_id", selectedBranch.id);
        }
        selectedLocations.forEach((location, index) => {
            formData.append(`locations[${index}]`, location.id);
        });

        await postData(formData, t("Waiter Added Success!"));
    };

    return (
        <>
            {loadingPost || loadingLists ? (
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
                                text={t("Add")}
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

export default AddWaiter;