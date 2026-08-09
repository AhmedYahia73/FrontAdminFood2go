import React, { useEffect, useRef, useState } from "react";
import {
    NumberInput,
    PasswordInput,
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    UploadInput,
} from "../../../../Components/Components";
import { usePost } from "../../../../Hooks/usePostJson";
import { useGet } from "../../../../Hooks/useGet";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "primereact/multiselect";
import { useNavigate } from "react-router-dom";

const AddCaptianOrder = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/pos/captain/add`,
    });
    const {
        refetch: refetchLists,
        loading: loadingLists,
        data: dataLists,
    } = useGet({ url: `${apiUrl}/admin/pos/captain` });

    const { t } = useTranslation();
    const ImageRef = useRef();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [userName, setUserName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [allLocations, setAllLocations] = useState([]); // Store all locations
    const [filteredLocations, setFilteredLocations] = useState([]); // Locations filtered by branch
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [image, setImage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [status, setStatus] = useState(0);
    const [waiter, setWaiter] = useState(0);

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

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImage(file.name);
        }
    };

    const handleImageClick = (ref) => {
        if (ref.current) {
            ref.current.click();
        }
    };

    // Handle status toggle
    const handleChangeStatus = () => {
        setStatus(status === 0 ? 1 : 0);
    };

    const handleWaiterChange = () => {
        setWaiter(waiter === 0 ? 1 : 0);
    };

    // Reset form
    const handleReset = () => {
        setName("");
        setUserName("");
        setPhone("");
        setPassword("");
        setImage("");
        setImageFile(null);
        setStatus(0);
        setSelectedLocations([]);
        setSelectedBranch(null);
        setFilteredLocations([]);
        setWaiter(0);
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
        formData.append("name", name);
        formData.append("user_name", userName);
        formData.append("phone", phone);
        formData.append("password", password);
        if (imageFile) {
            formData.append("image", imageFile);
        }
        formData.append("status", status);
        formData.append("waiter", waiter);
        if (selectedBranch) {
            formData.append("branch_id", selectedBranch.id);
        }
        selectedLocations.forEach((location, index) => {
            formData.append(`locations[${index}]`, location.id);
        });

        await postData(formData, t("Captain Added Success!"));
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
                    {/* Name */}
                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Name")}:
                        </span>
                        <TextInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("Name")}
                        />
                    </div>
                    {/* User Name */}
                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("User Name")}:
                        </span>
                        <TextInput
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder={t("User Name")}
                        />
                    </div>
                    {/* Phone */}
                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Phone")}:
                        </span>
                        <NumberInput
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={t("Phone")}
                        />
                    </div>
                    {/* Image */}
                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Image")}:
                        </span>
                        <UploadInput
                            value={image}
                            uploadFileRef={ImageRef}
                            placeholder={t("Image")}
                            handleFileChange={handleImageChange}
                            onChange={(e) => setImage(e.target.value)}
                            onClick={() => handleImageClick(ImageRef)}
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
                    {/* Waiter */}
                    <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                            {t("Waiter")}:
                        </span>
                        <Switch handleClick={handleWaiterChange} checked={waiter} />
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

export default AddCaptianOrder;