import React, { useEffect, useRef, useState } from "react";
import {
    NumberInput,
    StaticButton,
    StaticLoader,
    SubmitButton,
    Switch,
    TextInput,
    TitlePage,
    UploadInput,
} from "../../../../../Components/Components";
import DropDown from "../../../../../Components/AnotherComponents/DropDown"; // Import the DropDown component
import { usePost } from "../../../../../Hooks/usePostJson";
import { useGet } from "../../../../../Hooks/useGet";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useChangeState } from "../../../../../Hooks/useChangeState";

const AddTablesPage = () => {
    const { tableId } = useParams();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchTable, loading: loadingTable, data: dataTable } = useGet({ url: `${apiUrl}/admin/caffe_tables/item/${tableId}` });
    const { refetch: refetchList, loading: loadingList, data: dataList } = useGet({
        url: `${apiUrl}/admin/caffe_tables`,
    });
    const { postData, loadingPost, response } = usePost({
        url: `${apiUrl}/admin/caffe_tables/update/${tableId}`,
    });
    const { t } = useTranslation();
    const { toastError } = useAuth();
    const navigate =useNavigate();

    const [locations, setLocations] = useState([]);
    const [tableNumber, setTableNumber] = useState("");
    const [capacity, setCapacity] = useState("");
    const [selectedLocation, setSelectedLocation] = useState(null); // State for selected branch
    const [openMenu, setOpenMenu] = useState(false); // State for dropdown menu open/close
    const [status, setStatus] = useState(0);
    const [occupied, setOccupied] = useState(0);

    useEffect(() => {
        refetchList();
        refetchTable();
    }, [refetchList, refetchTable]);

    useEffect(() => {
        if (dataList && dataList.locations) {
            setLocations(dataList.locations);
        }
    }, [dataList]);

    useEffect(() => {
        if (dataTable && dataTable.cafe_tables) {
            const data = dataTable.cafe_tables[0];
            setTableNumber(data?.table_number || '')
            setSelectedLocation(data?.location)
            setCapacity(data?.capacity)
            setStatus(data?.status)
            // setOccupied(data?.branch)
        }
    }, [dataTable]);

    useEffect(() => {
        if (!loadingPost && response) {
            navigate(-1)
        }
    }, [response]);

    const handleReset = () => {
        setTableNumber("");
        setCapacity("");
        setStatus(0);
        setOccupied(0);
        setSelectedLocation(null);
    };

    const handleOpen = () => {
        setOpenMenu(!openMenu);
    };

    const handleOpenOption = () => {
        setOpenMenu(false);
    };

    const handleSelectLocation = (option) => {
        setSelectedLocation(option);
    };

    const handleChangeStatus = () => {
        setStatus((prev) => (prev === 0 ? 1 : 0));
    };

    const handleChangeOccupied = () => {
        setOccupied((prev) => (prev === 0 ? 1 : 0));
    };

    const handleHallAdd = (e) => {
        e.preventDefault();

        if (!tableNumber) {
            toastError(t("Please Enter Table Number"));
            return;
        }

        if (!capacity) {
            toastError(t("Please Enter Capacity"));
            return;
        }

        if (!selectedLocation) {
            toastError(t("select Location"));
            return;
        }

        const formData = new FormData();
        formData.append("table_number", tableNumber);
        formData.append("location_id", selectedLocation.id); // Assuming branch has an id property
        formData.append("capacity", capacity);
        formData.append("occupied", occupied);
        formData.append("status", status);

        postData(formData,"Table Edit Sucess!"); // Submit the form data
    };

    return (
        <>
            {loadingPost || loadingList || loadingTable ? (
                <div className="flex items-center justify-center w-full h-56">
                    <StaticLoader />
                </div>
            ) : (
                <section className="flex flex-col">
                    <form onSubmit={handleHallAdd}>
                        <div className="sm:py-3 lg:py-6">
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {/* Table Number */}
                                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Table Number")}:
                                    </span>
                                    <TextInput
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        placeholder={t("Table Number")} // Fixed placeholder
                                    />
                                </div>
                                {/* Capacity */}
                                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Capacity")}:
                                    </span>
                                    <NumberInput
                                        value={capacity}
                                        onChange={(e) => setCapacity(e.target.value)}
                                        placeholder={t("Capacity")} // Fixed placeholder
                                    />
                                </div>
                                {/* Location Dropdown */}
                                <div className="w-full flex flex-col items-start justify-center gap-y-1">
                                    <span className="text-xl font-TextFontRegular text-thirdColor">
                                        {t("Hall Name")}:
                                    </span>
                                    <DropDown
                                        options={locations} // Pass the locations array
                                        stateoption={selectedLocation ? selectedLocation.name : t("Select Hall Name")} // Display selected branch or placeholder
                                        openMenu={openMenu}
                                        handleOpen={handleOpen}
                                        handleOpenOption={handleOpenOption}
                                        onSelectOption={handleSelectLocation}
                                        border={true}
                                    />
                                </div>
                                {/* Occupied  */}
                                <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                                    <div className="flex items-center justify-start w-2/4 gap-x-1">
                                        <span className="text-xl font-TextFontRegular text-thirdColor">
                                            {t("Occupied")}:
                                        </span>
                                        <Switch
                                            handleClick={handleChangeOccupied}
                                            checked={occupied}
                                        />
                                    </div>
                                </div>
                                {/* Status */}
                                <div className="w-full flex items-start justify-start gap-x-1 pt-8">
                                    <div className="flex items-center justify-start w-2/4 gap-x-1">
                                        <span className="text-xl font-TextFontRegular text-thirdColor">
                                            {t("Status")}:
                                        </span>
                                        <Switch
                                            handleClick={handleChangeStatus}
                                            checked={status}
                                        />
                                    </div>
                                </div>
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
                                    text={t("Edit")}
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

export default AddTablesPage;