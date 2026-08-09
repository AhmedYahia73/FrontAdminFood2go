import { useTranslation } from 'react-i18next';

const TitleSection = ({ text }) => {
             const {  i18n } = useTranslation();
         const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
       return (
              <>
           <div className={`${direction === 'rtl' ? 'text-right' : 'text-left'} w-full py-2`}>
                            <span className="text-2xl font-TextFontMedium text-mainColor">{text}</span>
                     </div>
              </>
       )
}

export default TitleSection