
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGet } from '../../../../../Hooks/useGet';
import { useChangeState } from '../../../../../Hooks/useChangeState';
import { StaticLoader, Switch } from '../../../../../Components/Components';
import { useTranslation } from "react-i18next";

const VariationOptionPage = ({ refetch }) => {
  // Extract branchId and variationId from URL parameters.
  const { branchId, variationId ,optionId} = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
                 const {  t,i18n } = useTranslation();

  // Fetch data for the given variationId.
  const { refetch: refetchBranchOption, loading: loadingBranchOption, data: dataBranchOption } = useGet({
    url: `${apiUrl}/admin/branch/branch_options/${optionId}`
  });

  // Store the selected variation (object) in state.
  const [selectedVariation, setSelectedVariation] = useState(null);
  const { changeState: changeStateOptions, loadingChange: loadingChangeOptions } = useChangeState();

  // Pagination state (if there are more than 20 options)
  const [currentPage, setCurrentPage] = useState(1);
  const optionsPerPage = 20;

  useEffect(() => {
    refetchBranchOption();
  }, [refetchBranchOption, refetch]);

  useEffect(() => {
    if (dataBranchOption && dataBranchOption.variations) {
      // Find the variation that matches variationId.
      const variation = dataBranchOption.variations.find(
        variation => String(variation.id) === String(optionId)
      );
      setSelectedVariation(variation);
    }

  }, [dataBranchOption, variationId]);

  useEffect(() => {
  }, [selectedVariation]);

  // Extract the options from the selected variation (or default to an empty array).
  const options = selectedVariation ? selectedVariation.options || [] : [];

  // Pagination calculations.
  const totalPages = Math.ceil(options.length / optionsPerPage);
  const currentOptions = options.slice(
    (currentPage - 1) * optionsPerPage,
    currentPage * optionsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to change an option's status.
  const handleChangeOptionStatus = async (id, name, status) => {
    const response = await changeStateOptions(
      `${apiUrl}/admin/branch/branch_option_status/${id}`,
      `${name} Changed Status.`,
      { status, branch_id: branchId }
    );
    if (response) {
      // Update the status of the matching option in the selected variation.
      setSelectedVariation(prevVariation => {
        if (!prevVariation) return prevVariation;
        return {
          ...prevVariation,
          options: prevVariation.options.map(opt =>
            opt.id === id ? { ...opt, status } : opt
          )
        };
      });
    }
  };

  const headers = [t("#"), t("Name"), t("Price"), t("Point"), t("Status")];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loadingBranchOption || loadingChangeOptions ? (
        <div className="w-full mt-40">
          <StaticLoader />
        </div>
      ) : (
        <div className="block w-full overflow-x-scroll border-collapse sm:min-w-0 scrollSection">
              <table className="w-full sm:min-w-0">
                     <thead className="w-full">
                            <tr className="w-full border-b-2">
                                   {headers.map((name, index) => (
                                          <th className="min-w-[120px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3" key={index}>
                                                 {name}
                                          </th>
                                   ))}
                            </tr>
                     </thead>
                     <tbody className="w-full">
                            {(options.length === 0 && selectedVariation) ? (
                                   <tr>
                                          <td colSpan={12} className='text-xl text-center text-mainColor font-TextFontMedium '>                    {t("NotfindOptions")}
</td>
                                   </tr>
                            ) : (
                                   currentOptions.map((option, index) => ( // Example with two rows
                                          <tr className="w-full border-b-2" key={index}>
                                                 <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                        {(currentPage - 1) * optionsPerPage + index + 1}
                                                 </td>
                                                 <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                        {option?.name || '-'}
                                                 </td>
                                                 <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                        {option?.price || '-'}
                                                 </td>
                                                 <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                        {option?.points || '-'}
                                                 </td>
                                                 <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                                                        <Switch
                                                                checked={option.status === 1}
                                                                handleClick={() => {
                                                                    handleChangeOptionStatus(option.id, option.name, option.status === 1 ? 0 : 1);
                                                                }}
                                                        />
                                                </td>
                                          </tr>
                                   ))

                            )}
                     </tbody>
              </table>
              {options.length > 0 && (
                     <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
                            {currentPage !== 1 && (
                                   <button type='button' className='px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium' onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                   <button
                                          key={page}
                                          onClick={() => handlePageChange(page)}
                                          className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page ? 'bg-mainColor text-white' : ' text-mainColor'}`}
                                   >
                                          {page}
                                   </button>
                            ))}
                            {totalPages !== currentPage && (
                                   <button type='button' className='px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium' onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                            )}
                     </div>
              )}
       </div>
      )}
    </div>
  );
};

export default VariationOptionPage;
