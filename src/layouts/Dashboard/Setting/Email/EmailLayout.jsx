import { useEffect, useState } from "react";
import { TitlePage, TitleSection } from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import EmailPage from "../../../../Pages/Dashboard/Admin/Setting/Email/EmailPage";
import AddEmailSection from "../../../../Pages/Dashboard/Admin/Setting/Email/AddEmailSection";
import { useTranslation } from 'react-i18next';

const EmailLayout = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
           const { t, i18n } = useTranslation();

  const {
    data: emailsData,
    loading: loadingEmails,
    refetch: refetchEmails,
  } = useGet({
    url: `${apiUrl}/admin/settings/business_setup/order_delay_notification`,
  });

  const [update, setUpdate] = useState(false);
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    refetchEmails();
  }, [refetchEmails, update]);

  useEffect(() => {
    if (emailsData && emailsData.order_notification) {
      setEmails(emailsData.order_notification);
    }
  }, [emailsData]);

  return (
    <>
      <TitlePage text={t("AddNewEmail")} />
      <AddEmailSection update={update} setUpdate={setUpdate} />
      <TitleSection text={t("EmailsTable")} />
      <EmailPage
        loadingEmails={loadingEmails}
        emails={emails}
        refetchEmails={refetchEmails}
      />
    </>
  );
};

export default EmailLayout;