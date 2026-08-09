import { TitlePage } from '../../../../Components/Components'
import  EditEmailPage  from '../../../../Pages/Dashboard/Admin/Setting/Email/EditEmail'
import { useTranslation } from 'react-i18next';

const EditEmailLayout = () => {
                  const { t, i18n } = useTranslation();
       
       return (
              <>
                     <TitlePage text={t('EditEmail')} />
                     <EditEmailPage />
              </>
       )
}

export default EditEmailLayout