import { useTranslation } from 'react-i18next';

const TitlePage = ({ text, size = "text-3xl" }) => {
       const { i18n } = useTranslation();
       const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';

       return (
              <>
                     <div className={`${direction === 'rtl' ? 'text-right' : 'text-left'} w-full py-2`}>
                            <span className={`${size} font-TextFontMedium text-mainColor`}>{text}</span>
                     </div>
              </>
       )
}

export default TitlePage