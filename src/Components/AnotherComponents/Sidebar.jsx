import React, { useEffect, useState } from 'react'
import { LinksSidebar } from '../Components'
import WhiteLogo from '../../Assets/Images/WhiteLogo'
import { useAuth } from '../../Context/Auth'
import { useTranslation } from 'react-i18next';
const Sidebar = () => {
       const { t, i18n } = useTranslation();
       const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';

       const auth = useAuth();
       const [stateSide, setStateSide] = useState(() => {
              // Retrieve initial sidebar state from context or localStorage
              const savedState = auth.hideSidebar ?? localStorage.getItem('stateSidebar');
              return savedState ?? JSON.parse(savedState);
       });

       const handleSidebar = () => {
              setStateSide((prevState) => {
                     const newState = !prevState;
                     localStorage.setItem('stateSidebar', JSON.stringify(newState));
                     auth.hideSide(newState); // Update the context as well
                     return newState;
              });
       };

       useEffect(() => {
              // Keep the context state in sync with the local component state
              auth.hideSide(stateSide);
       }, [stateSide]);

       return (
              <aside className="bg-mainColor py-6 text-lg px-3 rounded-tr-[38px] rounded-br-[38px] h-screen duration-300 flex flex-col">
                     {/* Header */}
                     <div
                            dir={direction}
                            className="flex items-center justify-between w-full pb-1 border-b-2 cursor-pointer border-b-gray-300"
                            onClick={handleSidebar}
                     >
                            <span className={`${stateSide ? 'block' : 'hidden'} font-TextFontLight text-white text-2xl`}>
                                   {t("projectName")}
                            </span>
                            <WhiteLogo width={50} height={50} />
                     </div>

                     {/* Scrollable Links Area */}
                     <div className="flex-1 overflow-y-auto scrollSidebar scroll-smooth mt-4 px-1">
                            <LinksSidebar />
                     </div>
              </aside>
       )
}

export default Sidebar