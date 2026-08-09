import React, { useEffect, useState } from "react";
import {
    StaticButton,
    StaticLoader,
    SubmitButton,
    TextInput,
} from "../../../../../Components/Components";
import DropDown from "../../../../../Components/AnotherComponents/DropDown";
import { usePost } from "../../../../../Hooks/usePostJson";
import { useGet } from "../../../../../Hooks/useGet";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import LocationAreaPicker from "../../../../../Components/AnotherComponents/LocationAreaPicker"; // ✅ Import area picker
import { useNavigate } from "react-router-dom";

const AddHallLocations = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({
        url: `${apiUrl}/admin/caffe_location`,
    });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/caffe_location/add`,
    });
    const { t } = useTranslation();
    const { toastError } = useAuth();
    const navigate =useNavigate();

    const [branches, setBranches] = useState([]);
    const [name, setName] = useState("");
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [openMenu, setOpenMenu] = useState(false);
    const [area, setArea] = useState([]); // ✅ multiple points

    useEffect(() => {
        refetchList();
    }, [refetchList]);

    useEffect(() => {
        if (dataList && dataList.branches) {
            setBranches(dataList.branches);
        }
    }, [dataList]);

    useEffect(() => {
        if (!loadingPost && response) {
            navigate(-1);
        }
    }, [response]);

    const handleReset = () => {
        setName("");
        setSelectedBranch(null);
        setArea([]);
    };

    const handleHallAdd = (e) => {
        e.preventDefault();

        if (!name) {
            toastError(t("Please Enter Hall Name"));
            return;
        }
        if (!selectedBranch) {
            toastError(t("selectBranch"));
            return;
        }
        if (!area || area.length === 0) {
            toastError(t("Please select area on the map"));
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("branch_id", selectedBranch.id);
        formData.append("location", JSON.stringify(area)); // ✅ send array of points

        postData(formData, "Hall Add Success!");
    };

    return (
        <>
            {loadingPost || loadingList ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="w-full flex flex-col mb-20">
                    <form onSubmit={handleHallAdd}>
                        <div className="w-full sm:py-3 lg:py-6">
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {/* Hall Name */}
                                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Hall Name")}:
                                    </span>
                                    <TextInput
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t("Hall Name")}
                                    />
                                </div>
                                {/* Branch Dropdown */}
                                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("BranchName")}:
                                    </span>
                                    <DropDown
                                        options={branches}
                                        stateoption={selectedBranch ? selectedBranch.name : t("Select Branch")}
                                        openMenu={openMenu}
                                        handleOpen={() => setOpenMenu(!openMenu)}
                                        handleOpenOption={() => setOpenMenu(false)}
                                        onSelectOption={setSelectedBranch}
                                        border={true}
                                    />
                                </div>
                            </div>

                            {/* Map Area Picker */}
                            <div className="w-full flex flex-col items-start justify-center gap-y-1 mt-4">
                                <span className="text-xl font-TextFontRegular text-thirdColor">
                                    {t("Select Area on Map")}:
                                </span>
                                <LocationAreaPicker onAreaSelect={setArea} />
                                {area.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Selected {area.length} points
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end w-full gap-x-4">
                            <div>
                                <StaticButton
                                    text={t("Reset")}
                                    handleClick={handleReset}
                                    bgColor="bg-transparent"
                                    Color="text-mainColor"
                                    border="border-2"
                                    borderColor="border-mainColor"
                                    rounded="rounded-full"
                                />
                            </div>
                            <div>
                                <SubmitButton
                                    text={t("Submit")}
                                    rounded="rounded-full"
                                    handleClick={handleHallAdd}
                                />
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </>
    );
};

export default AddHallLocations;
