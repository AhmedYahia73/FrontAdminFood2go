import React from 'react'
import { IoSearch } from 'react-icons/io5'
import { useTranslation } from 'react-i18next';

const SearchBar = ({ type = "text", bgColor = 'bg-mainBgColor', textColor = 'mainColor', pr = "2", value, handleChange, placeholder = 'Search' }) => {
       const { t, i18n } = useTranslation();
       const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';

       return (
              <div className={`relative w-full ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                     <input type={type}
                            name={t("search")}
                            onChange={handleChange}
                            value={value}
                            className={`w-full h-full shadow pl-12 py-3 rounded-3xl outline-none font-TextFontRegular 
                            placeholder-${textColor}
                            ${bgColor}
                            text-${textColor} ${direction === 'rtl' ? 'text-right' : 'text-left'}
                            pr-${pr}`}
                            placeholder={placeholder} />
                     <IoSearch className='absolute text-xl top-3 left-4 text-mainColor font-TextFontSemiBold' />
              </div>
       )
}

export default SearchBar