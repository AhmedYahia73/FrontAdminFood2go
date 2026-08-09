import React from 'react'
import { useTranslation } from 'react-i18next';

const ForgetPassPage = () => {
                    const { t, i18n } = useTranslation();
       
       return (
              <div>{t("ForgetPassPage")}</div>
       )
}

export default ForgetPassPage