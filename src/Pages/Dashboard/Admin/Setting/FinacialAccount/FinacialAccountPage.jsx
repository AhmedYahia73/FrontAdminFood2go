import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGet } from '../../../../../Hooks/useGet';
import { useChangeState } from '../../../../../Hooks/useChangeState';
import { useDelete } from '../../../../../Hooks/useDelete';
import { AddButton, StaticLoader, Switch, TitleSection, TextInput } from '../../../../../Components/Components';
import { DeleteIcon, EditIcon, TransferIcon } from '../../../../../Assets/Icons/AllIcons';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import Warning from '../../../../../Assets/Icons/AnotherIcons/WarningIcon';
import { useTranslation } from "react-i18next";
import { usePost } from '../../../../../Hooks/usePostJson';
import Select from 'react-select';
import { useAuth } from '../../../../../Context/Auth';

const FinancialAccountPage = ({ refetch }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const financialAccountUrl =
    role === "branch"
      ? `branch`
      : `admin/settings`;


  const { refetch: refetchFinancialAccount, loading: loadingFinancialAccount, data: dataFinancialAccount } = useGet({
    url: `${apiUrl}/${financialAccountUrl}/financial`,
  });
  const { changeState, loadingChange } = useChangeState();
  const { deleteData, loadingDelete } = useDelete();
  const [financialAccounts, setFinancialAccounts] = useState([]);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openDelete, setOpenDelete] = useState(null);
  const [openBranchesModal, setOpenBranchesModal] = useState(null);

  const [openTransfer, setOpenTransfer] = useState(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const { postData, loadingPost } = usePost({
    url: `${apiUrl}/${financialAccountUrl}/financial_transfer/transfer`,
  });

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [tempOrder, setTempOrder] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const financialAccountsPerPage = 20;

  const totalPages = Math.ceil(financialAccounts.length / financialAccountsPerPage);
  const currentFinancialAccounts = financialAccounts.slice(
    (currentPage - 1) * financialAccountsPerPage,
    currentPage * financialAccountsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    refetchFinancialAccount();
  }, [refetchFinancialAccount, refetch]);

  useEffect(() => {
    if (dataFinancialAccount && dataFinancialAccount.financials) {
      setFinancialAccounts(dataFinancialAccount.financials);
    }
  }, [dataFinancialAccount]);

  const handleChangeStatus = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/${financialAccountUrl}/financial/status/${id}`,
      t('StatusChangedSuccess', { name }),
      { status }
    );
    if (response) {
      setFinancialAccounts((prev) =>
        prev.map((account) =>
          account.id === id ? { ...account, status } : account
        )
      );
    }
  };

  const handleChangeOrder = async (id, name, newOrder) => {
    const orderUrl = role === "branch" ? `branch/financial/order/${id}` : `admin/settings/financial/order/${id}`;
    const response = await changeState(
      `${apiUrl}/${orderUrl}`,
      `${name} Order Changed Success`,
      { order: newOrder }
    );
    if (response) {
      setFinancialAccounts((prev) =>
        prev.map((account) =>
          account.id === id ? { ...account, order: newOrder } : account
        )
      );
    }
    setEditingOrderId(null);
  };

  const handleOpenDelete = (id) => {
    setOpenDelete(id);
  };

  const handleCloseDelete = () => {
    setOpenDelete(null);
  };

  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/${financialAccountUrl}/financial/delete/${id}`,
      t('DeletedSuccess', { name })
    );
    if (success) {
      setFinancialAccounts(financialAccounts.filter((account) => account.id !== id));
      handleCloseDelete();
    }
  };

  const handleOpenBranchesModal = (account) => {
    setOpenBranchesModal(account);
  };

  const handleCloseBranchesModal = () => {
    setOpenBranchesModal(null);
  };

  const handleOpenTransfer = (account) => {
    setOpenTransfer(account);
    setTransferTo('');
    setTransferAmount('');
  };

  const handleCloseTransfer = () => {
    setOpenTransfer(null);
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) return;

    const data = {
      from_financial_id: openTransfer.id,
      to_financial_id: transferTo,
      amount: transferAmount
    };

    const success = await postData(data, t('TransferSuccess'));
    if (success) {
      handleCloseTransfer();
      refetchFinancialAccount();
    }
  };

  const headers = [
    '#',
    t('Name'),
    role == "admin" ? t("Branch") : null,
    t('Image'),
    t('Balance'),
    t('Description'),
    t('OrderNumber'),
    t('Discount'),
    t('Main'),
    t('Status'),
    t('Action'),
  ];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loadingFinancialAccount || loadingChange || loadingDelete ? (
        <div className="w-full mt-40">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full gap-5">
          <div className="flex justify-between mt-5">
            <TitleSection text={t('FinancialAccountTable')} />
            <AddButton handleClick={() => navigate('add')} />
          </div>

          <table className="block w-full overflow-x-scroll sm:min-w-0 scrollPage">
            <thead className="w-full">
              <tr className="w-full border-b-2">
                {headers.filter(name => name !== null).map((name, index) => (
                  <th
                    className="min-w-[120px] sm:w-[8%] lg:w-[5%] text-mainColor text-center font-TextFontLight sm:text-sm lg:text-base xl:text-lg pb-3"
                    key={index}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="w-full">
              {financialAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.filter(name => name !== null).length}
                    className="text-xl text-center text-mainColor font-TextFontMedium"
                  >
                    {t('NotfindfinancialAccount')}
                  </td>
                </tr>
              ) : (
                currentFinancialAccounts.map((financialAccount, index) => (
                  <tr className="w-full border-b-2" key={index}>
                    <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {(currentPage - 1) * financialAccountsPerPage + index + 1}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {financialAccount.name}
                    </td>
                    {role === "admin" ? (
                      <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center px-3 py-1 text-sm font-TextFontMedium text-white bg-mainColor rounded-full hover:bg-opacity-80 transition-colors duration-300"
                          onClick={() => handleOpenBranchesModal(financialAccount)}
                        >
                          {financialAccount.branch.length} {t('Branches')}
                        </button>
                        {openBranchesModal?.id === financialAccount.id && (
                          <Dialog
                            open={true}
                            onClose={handleCloseBranchesModal}
                            className="relative z-20"
                          >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
                              <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-md">
                                  <div className="px-4 pt-5 pb-4 sm:p-6">
                                    <DialogTitle as="h3" className="text-lg font-TextFontSemiBold text-mainColor">
                                      {t('BranchesForAccount', { name: financialAccount.name })}
                                    </DialogTitle>
                                    <div className="mt-4 max-h-64 overflow-y-auto">
                                      {financialAccount.branch.length > 0 ? (
                                        financialAccount.branch.map((branch) => (
                                          <div
                                            key={branch.id}
                                            className="flex flex-col p-3 mb-2 bg-gray-50 rounded-md border border-gray-200"
                                          >
                                            <div className="text-sm font-TextFontMedium text-mainColor">
                                              {t('BranchName')}: {branch.name}
                                            </div>
                                            <div className="text-xs text-gray-900">
                                              {t('Address')}: {branch.address || t('NoAddress')}
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-sm text-thirdColor">
                                          {t('NoBranches')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="px-4 py-3 sm:px-6">
                                    <button
                                      type="button"
                                      onClick={handleCloseBranchesModal}
                                      className="inline-flex justify-center w-full px-6 py-3 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:w-auto"
                                    >
                                      {t('Close')}
                                    </button>
                                  </div>
                                </DialogPanel>
                              </div>
                            </div>
                          </Dialog>
                        )}
                      </td>
                    ) : null}
                    <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 overflow-hidden">
                      <div className="flex justify-center">
                        <img
                          src={financialAccount.logo_link}
                          className="rounded-full bg-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                          alt={t('ImageAlt')}
                        />
                      </div>
                    </td>
                    <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {financialAccount.balance || "-"}
                    </td>
                    <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {financialAccount.details}
                    </td>
                    <td className="min-w-[100px] sm:min-w-[80px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {editingOrderId === financialAccount.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            className="w-16 p-1 text-center border rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                            value={tempOrder}
                            onChange={(e) => setTempOrder(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="text-xs px-2 py-1 bg-mainColor text-white rounded-md"
                            onClick={() => handleChangeOrder(financialAccount.id, financialAccount.name, tempOrder)}
                          >
                            {t("Save")}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>{financialAccount.order || "-"}</span>
                          <button
                            type="button"
                            className="text-xs text-mainColor font-TextFontMedium underline"
                            onClick={() => {
                              setEditingOrderId(financialAccount.id);
                              setTempOrder(financialAccount.order || "");
                            }}
                          >
                            {t("Change")}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {financialAccount.discount === 1 ? t('Active') : t('Inactive')}
                    </td>
                    <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      {financialAccount.main === 1 ? t('Active') : t('Inactive')}
                    </td>
                    <td className="min-w-[120px] sm:min-w-[80px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                      <Switch
                        checked={financialAccount.status === 1}
                        handleClick={() => {
                          handleChangeStatus(
                            financialAccount.id,
                            financialAccount.name,
                            financialAccount.status === 1 ? 0 : 1
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`edit/${financialAccount.id}`}>
                          <EditIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenTransfer(financialAccount)}
                        >
                          <TransferIcon />
                        </button>
                        {financialAccount.balance == 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(financialAccount.id)}
                          >
                            <DeleteIcon />
                          </button>
                        )}
                        {openDelete === financialAccount.id && (
                          <Dialog
                            open={true}
                            onClose={handleCloseDelete}
                            className="relative z-10"
                          >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                              <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
                                  <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                                    <Warning width="28" height="28" aria-hidden="true" />
                                    <div className="mt-2 text-center">
                                      {t('YouwilldeletefinancialAccount')} {financialAccount?.name || '-'}
                                    </div>
                                  </div>
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                      onClick={() => handleDelete(financialAccount.id, financialAccount.name)}
                                    >
                                      {t('Delete')}
                                    </button>
                                    <button
                                      type="button"
                                      data-autofocus
                                      onClick={handleCloseDelete}
                                      className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                                    >
                                      {t('Cancel')}
                                    </button>
                                  </div>
                                </DialogPanel>
                              </div>
                            </div>
                          </Dialog>
                        )}
                        {openTransfer?.id === financialAccount.id && (
                          <Dialog
                            open={true}
                            onClose={handleCloseTransfer}
                            className="relative z-30"
                          >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
                              <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
                                  <div className="px-4 pt-5 pb-4 sm:p-6">
                                    <DialogTitle as="h3" className="text-lg font-TextFontSemiBold text-mainColor mb-4">
                                      {t('TransferMoney')}
                                    </DialogTitle>

                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('From')}</label>
                                        <input type="text" disabled value={financialAccount.name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2" />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('To')}</label>
                                        <Select
                                          className="mt-1"
                                          options={financialAccounts
                                            .filter(acc => acc.id !== financialAccount.id)
                                            .map(acc => ({ value: acc.id, label: acc.name }))}
                                          value={financialAccounts
                                            .filter(acc => acc.id !== financialAccount.id)
                                            .find(acc => acc.id === transferTo)
                                            ? { value: transferTo, label: financialAccounts.find(a => a.id === transferTo)?.name }
                                            : null}
                                          onChange={(option) => setTransferTo(option ? option.value : '')}
                                          placeholder={t('SelectAccount')}
                                          isClearable
                                          menuPortalTarget={document.body}
                                          menuPosition="fixed"
                                          menuPlacement="auto" // or "top" if modal is low on screen
                                          styles={{
                                            menuPortal: (provided) => ({
                                              ...provided,
                                              zIndex: 9999,
                                            }),
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('Amount')}</label>
                                        <TextInput
                                          value={transferAmount}
                                          onChange={(e) => setTransferAmount(e.target.value)}
                                          placeholder={t('Amount')}
                                          name="amount"
                                          type="number"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                      type="button"
                                      className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                      onClick={handleTransfer}
                                      disabled={loadingPost}
                                    >
                                      {loadingPost ? t('Processing') : t('Transfer')}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCloseTransfer}
                                      className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                                    >
                                      {t('Cancel')}
                                    </button>
                                  </div>
                                </DialogPanel>
                              </div>
                            </div>
                          </Dialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {financialAccounts.length > 0 && (
            <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
              {currentPage !== 1 && (
                <button
                  type="button"
                  className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  {t('Prev')}
                </button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page ? 'bg-mainColor text-white' : 'text-mainColor'
                    }`}
                >
                  {page}
                </button>
              ))}
              {totalPages !== currentPage && (
                <button
                  type="button"
                  className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  {t('Next')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialAccountPage;