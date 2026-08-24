import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TitlePage, StaticLoader, DateInput, DropDown } from '../../../../Components/Components';
import { useGet } from '../../../../Hooks/useGet';

const CategoryLog = () => {
    const { t, i18n } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [sortOption, setSortOption] = useState({ name: t("descending"), id: 'desc' });
    const [openSort, setOpenSort] = useState(false);
    const sortRef = useRef(null);

    const [appTypeOption, setAppTypeOption] = useState({ name: t("all"), id: 'all' });
    const [openAppType, setOpenAppType] = useState(false);
    const appTypeRef = useRef(null);

    const sortOptions = [
        { name: t("descending"), id: 'desc' },
        { name: t("ascending"), id: 'asc' },
    ];

    const appTypeOptions = [
        { name: t("all"), id: 'all' },
        { name: t("web"), id: 'web' },
        { name: t("mobile"), id: 'mobile' },
    ];

    const { data, loading, refetch } = useGet({
        url: `${apiUrl}/admin/marketing/category_clicks`,
        params: {
            locale: i18n.language === 'ar' ? 'ar' : 'en',
            from: fromDate || undefined,
            to: toDate || undefined,
            sort: sortOption.id,
            app_type: appTypeOption.id,
        }
    });

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setOpenSort(false);
            }
            if (appTypeRef.current && !appTypeRef.current.contains(event.target)) {
                setOpenAppType(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const extractArray = (obj) => {
        if (!obj) return [];
        let results = [];
        
        // Recursively find objects that look like categories
        const search = (item) => {
            if (!item || typeof item !== 'object') return;
            
            // Check if this object is a category item
            if ('id' in item && ('clicks_count' in item || 'clicks' in item || 'name' in item || 'category_name' in item)) {
                results.push(item);
                return;
            }
            
            // Otherwise, search its values
            Object.values(item).forEach(search);
        };
        
        search(obj);
        return results;
    };

    const categoryData = extractArray(data);

    const headers = [t("sl"), t("category_name"), t("clicks")];

    return (
        <div className="w-full pb-20">
            <TitlePage text={t("Category Log")} />
            
            <div className="w-full flex flex-col lg:flex-row gap-4 mb-6 mt-4 p-4 bg-white shadow rounded-xl">
                <div className="w-full lg:w-1/4">
                    <label className="block mb-2 text-mainColor font-TextFontMedium">{t("from")}</label>
                    <DateInput 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        placeholder={t("from")}
                        borderColor="mainColor"
                        required={false}
                    />
                </div>
                <div className="w-full lg:w-1/4">
                    <label className="block mb-2 text-mainColor font-TextFontMedium">{t("to")}</label>
                    <DateInput 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        placeholder={t("to")}
                        borderColor="mainColor"
                        required={false}
                    />
                </div>
                <div className="w-full lg:w-1/4">
                    <label className="block mb-2 text-mainColor font-TextFontMedium">{t("sort")}</label>
                    <DropDown 
                        ref={sortRef}
                        handleOpen={() => setOpenSort(!openSort)}
                        openMenu={openSort}
                        stateoption={t(sortOption.id === 'desc' ? "descending" : "ascending")}
                        handleOpenOption={() => setOpenSort(false)}
                        options={sortOptions.map(opt => ({...opt, name: t(opt.id === 'desc' ? 'descending' : 'ascending')}))}
                        onSelectOption={(opt) => setSortOption(opt)}
                        border={true}
                    />
                </div>
                <div className="w-full lg:w-1/4">
                    <label className="block mb-2 text-mainColor font-TextFontMedium">{t("app_type")}</label>
                    <DropDown 
                        ref={appTypeRef}
                        handleOpen={() => setOpenAppType(!openAppType)}
                        openMenu={openAppType}
                        stateoption={t(appTypeOption.id)}
                        handleOpenOption={() => setOpenAppType(false)}
                        options={appTypeOptions.map(opt => ({...opt, name: t(opt.id)}))}
                        onSelectOption={(opt) => setAppTypeOption(opt)}
                        border={true}
                    />
                </div>
            </div>

            <div className="w-full overflow-x-scroll scrollSection">
                {loading ? (
                    <div className="w-full flex items-center justify-center h-56">
                        <StaticLoader />
                    </div>
                ) : (
                    <table className="w-full sm:min-w-0 shadow rounded-xl bg-white">
                        <thead className="w-full bg-mainColor/10">
                            <tr className="w-full border-b-2">
                                {headers.map((name, index) => (
                                    <th className="min-w-[120px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontMedium sm:text-sm lg:text-base xl:text-lg py-4" key={index}>
                                        {name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="w-full">
                            {categoryData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-xl text-center text-mainColor font-TextFontMedium py-8">
                                        {t("Notfinddata")}
                                    </td>
                                </tr>
                            ) : (
                                categoryData.map((item, index) => (
                                    <tr className="w-full border-b-2 hover:bg-gray-50 transition-colors" key={index}>
                                        <td className="py-4 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl font-TextFontMedium">
                                            {index + 1}
                                        </td>
                                        <td className="py-4 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl font-TextFontMedium">
                                            {item.name || item.category_name || item.title || '-'}
                                        </td>
                                        <td className="py-4 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl font-TextFontMedium">
                                            {item.clicks || item.count || item.clicks_count || 0}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CategoryLog;
