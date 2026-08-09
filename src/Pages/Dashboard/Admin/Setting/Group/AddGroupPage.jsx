import React, { useEffect, useRef, useState } from "react";
import { usePost } from "../../../../../Hooks/usePostJson";
import {
  StaticButton,
  StaticLoader,
  SubmitButton,
  Switch,
  TextInput,
} from "../../../../../Components/Components";
import { useAuth } from "../../../../../Context/Auth";
import { useTranslation } from "react-i18next";

const AddGroupPage = ({ update, setUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/group/add`,
  });
  const { t, i18n } = useTranslation();

  const auth = useAuth();

  const [GroupName, setGroupName] = useState("");

  const [activeGroup, setActiveGroup] = useState(0);

  const handleStatusGroup = () => {
    const currentState = activeGroup;
    {
      currentState === 0 ? setActiveGroup(1) : setActiveGroup(0);
    }
  };

  useEffect(() => {
    if (!loadingPost) {
      handleReset();
    }
    setUpdate(!update);
  }, [response]);

  const handleReset = () => {
    setGroupName("");
    setActiveGroup(0);
  };

  const handleGroupAdd = (e) => {
    e.preventDefault();

    if (!GroupName) {
      auth.toastError(t("GroupName")); // ترجمة النص
      return;
    }

    const formData = new FormData();

    formData.append("name", GroupName);
    formData.append("status", activeGroup);

    postData(formData, t("Group Added Success"));
  };
  return (
    <>
      {loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full h-56">
            <StaticLoader />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleGroupAdd}>
            {/* Content*/}
            <div className="sm:py-3 lg:py-6">
              <div className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row">
                {/* Zone Name */}
                <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Group Name")}:
                  </span>
                  <TextInput
                    value={GroupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder={t("Group Name")}
                  />
                </div>

                <div className="sm:w-full xl:w-[30%] flex items-center justify-start gap-3 pt-10">
                  <span className="text-xl font-TextFontRegular text-thirdColor">
                    {t("Active")}:
                  </span>
                  <Switch
                    handleClick={handleStatusGroup}
                    checked={activeGroup}
                  />
                </div>
              </div>
            </div>

            {/* Buttons*/}
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
                  text={t("Submit")}
                  rounded="rounded-full"
                  handleClick={handleGroupAdd}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default AddGroupPage;
