import React, { useEffect, useRef, useState } from "react";
import { DeleteIcon, EditIcon } from "../../../../Assets/Icons/AllIcons";
import { Link, useNavigate } from "react-router-dom";
import {
  AddButton,
  DropDown,
  NumberInput,
  StaticLoader,
  Switch,
  TextInput,
} from "../../../../Components/Components";
import { useGet } from "../../../../Hooks/useGet";
import { useChangeState } from "../../../../Hooks/useChangeState";
import { useDelete } from "../../../../Hooks/useDelete";
import { useDispatch } from "react-redux";
import { setCategory } from "../../../../Store/CreateSlices";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Warning from "../../../../Assets/Icons/AnotherIcons/WarningIcon";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useAuth } from "../../../../Context/Auth";

const CategoryPage = ({ refetch, setUpdate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");
  const selectedLanguage = useSelector((state) => state.language?.selected ?? "en");
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const categoryUrl =
    role === "branch"
      ? `branch/branch_categories`
      : `admin/category`;

  const {
    refetch: refetchCategory,
    loading: loadingCategory,
    data: dataCategory,
  } = useGet({
    url: `${apiUrl}/${categoryUrl}?locale=${selectedLanguage}`,
  });
  const { changeState, loadingChange, responseChange } = useChangeState();
  const { deleteData, loadingDelete, responseDelete } = useDelete();
  const dropDownRefs = useRef([]); // Array to store multiple refs
  const { t, i18n } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [categoryAddons, setCategoryAddons] = useState([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // Track the index of the open dropdown
  const [selectedOptions, setSelectedOptions] = useState({}); // Store selected options for each row
  const [priorityChange, setPriorityChange] = useState(""); // Store selected options for each row

  const [openSupCategory, setOpenSupCategory] = useState(null);
  const [openPriority, setOpenPriority] = useState(null);
  const [openSupDelete, setOpenSupDelete] = useState(null);
  const [openDelete, setOpenDelete] = useState(null);
  const [openProducts, setOpenProducts] = useState(null); // State for products dialog
  const [categoryProducts, setCategoryProducts] = useState([]); // State to store products data
  const [loadingProducts, setLoadingProducts] = useState(false); // Loading state for products

  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const categoriesPerPage = 20; // Limit to 20 categories per page

  // Calculate total number of pages
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  // Get the categories for the current page
  const currentCategories = categories.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage
  );

  // handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fetch categories when the component mounts or when refetch is called
  useEffect(() => {
    refetchCategory();
  }, [refetchCategory, refetch]); // Empty dependency array to only call refetch once on mount

  // View supp category
  const handleOpenSupCategory = (item) => {
    setOpenSupCategory(item);
  };
  const handleCloseSupCategory = () => {
    setOpenSupCategory(null);
  };

  // Products handlers
  const handleOpenProducts = async (categoryId) => {
    setOpenProducts(categoryId);
    setLoadingProducts(true);

    try {
      // Get the token from localStorage or wherever you store it
      const token = localStorage.getItem('token'); // or sessionStorage, cookies, etc.
      const productUrl = role === "branch"
        ? `${apiUrl}/branch/products_in_category/${categoryId}`
        : `${apiUrl}/admin/product/products_in_category/${categoryId}`;

      const response = await fetch(productUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.products) {
        setCategoryProducts(data.products);
      } else {
        setCategoryProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setCategoryProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCloseProducts = () => {
    setOpenProducts(null);
    setCategoryProducts([]);
  };

  const handleOpenPriority = (item) => {
    setOpenPriority(item);
  };
  const handleClosePriority = () => {
    setOpenPriority(null);
  };
  const handleOpenSupDelete = (item) => {
    setOpenSupDelete(item);
  };
  const handleCloseSupDelete = () => {
    setOpenSupDelete(null);
  };
  const handleOpenDelete = (item) => {
    setOpenDelete(item);
  };
  const handleCloseDelete = () => {
    setOpenDelete(null);
  };
  // Change categories status
  const handleChangeStaus = async (id, name, status) => {
    const url =
      role === "branch"
        ? `${apiUrl}/branch/branch_category_status/${id}`
        : `${apiUrl}/${categoryUrl}/status/${id}`;

    const response = await changeState(
      url,
      `${name} Changed Status.`,
      { status }
    );

    if (response) {
      // Update categories only if changeState succeeded
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === id ? { ...category, status: status } : category
        )
      );
    }
  };
  const handleChangeActive = async (id, name, status) => {
    const response = await changeState(
      `${apiUrl}/${categoryUrl}/active/${id}`,
      `${name} Changed Active.`,
      { active: status } // Pass status as an object if changeState expects an object
    );

    if (response) {
      // Update categories only if changeState succeeded
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === id ? { ...category, active: status } : category
        )
      );
      setUpdate(!refetch);
    }

    // Log the updated categories after the state update
    setCategories((prevCategories) => {
      const updatedCategories = prevCategories.map((category) =>
        category.id === id ? { ...category, active: status } : category
      );
      return updatedCategories;
    });
  };

  // Change categories priority
  const handleChangePriority = async (id, name) => {
    const response = await changeState(
      `${apiUrl}/${categoryUrl}/priority/${id}`,
      `${name} Changed Priority.`,
      { priority: priorityChange } // Pass priority as an object if changeState expects an object
    );

    if (response) {
      setPriorityChange("");
      setOpenPriority(null);
      refetchCategory();
      setUpdate(!refetch);
    }
  };

  // Delete Category
  const handleSupDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/${categoryUrl}/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      // Update categories only if changeState succeeded
      setCategories(
        categories.map((category) => {
          if (category.id === id) {
            // Filter out the deleted subcategory
            return {
              ...category,
              sub_categories: category.sub_categories.filter(
                (sub) => sub.id !== subcategoryId
              ),
            };
          }
          return category;
        })
      );
      setOpenSupCategory(null);
      setUpdate(!refetch);
    }
  };
  const handleDelete = async (id, name) => {
    const success = await deleteData(
      `${apiUrl}/${categoryUrl}/delete/${id}`,
      `${name} Deleted Success.`
    );

    if (success) {
      // Update categories only if changeState succeeded
      setCategories(categories.filter((category) => category.id !== id));
      setUpdate(!refetch);
    }
  };

  // Update categories when `data` changes
  useEffect(() => {
    if (dataCategory && dataCategory.categories) {
      // setCategories(dataCategory.categories);
      setCategories(dataCategory.parent_categories || []);

      if (role === "branch") {
        setCategories(dataCategory.categories || []);
      }
      // dispatch(setCategory)
      setCategoryAddons(dataCategory.addons);
    }
  }, [dataCategory]); // Only run this effect when `data` changes

  const handleOpen = (index) => {
    setOpenMenuIndex((prevIndex) => (prevIndex === index ? null : index)); // Toggle the dropdown
  };

  // const handleSelectOption = (index, option) => {
  //        setSelectedOptions(prev => ({ ...prev, [index]: option.name })); // Update selected option for the dropdown
  //        setOpenMenuIndex(null); // Close the dropdown after selecting
  // };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (
        !dropDownRefs.current.some((ref) => ref && ref.contains(event.target))
      ) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const headers =
    role === "branch"
      ? [t("serialNumber"), t("name"), t("Products"), t("status")]
      : [
        t("serialNumber"),
        t("image"),
        t("banner"),
        t("name"),
        t("subcategory"),
        t("Products"), // Added products column
        t("status"),
        t("active"),
        t("priority"),
        t("action"),
      ];

  return (
    <div className="flex items-start justify-start w-full overflow-x-scroll pb-28 scrollSection">
      {loadingCategory || loadingChange || loadingDelete ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticLoader />
        </div>
      ) : (
        <div className="flex flex-col w-full">
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
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.filter(name => name !== null).length}
                    className="text-xl text-center text-mainColor font-TextFontMedium "
                  >
                    {t("Not find categories")}
                  </td>
                </tr>
              ) : (
                currentCategories.map(
                  (
                    category,
                    index // Example with two rows
                  ) => (
                    <tr className="w-full border-b-2" key={index}>
                      <td className="min-w-[80px] sm:min-w-[50px] sm:w-1/12 lg:w-1/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {(currentPage - 1) * categoriesPerPage + index + 1}
                      </td>
                      {role !== "branch" && (
                        <>
                          <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 overflow-hidden">
                            <div className="flex justify-center">
                              <img
                                src={category.image_link}
                                className="border-2 rounded-full bg-mainColor border-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                                alt="Photo"
                              />
                            </div>
                          </td>
                          <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 overflow-hidden">
                            <div className="flex justify-center">
                              <img
                                src={category.banner_link}
                                className="border-2 rounded-full bg-mainColor border-mainColor min-w-14 min-h-14 max-w-14 max-h-14"
                                loading="lazy"
                                alt="Photo"
                              />
                            </div>
                          </td>
                        </>
                      )}
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        {category.name}
                      </td>
                      {role !== "branch" && (
                        <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                          <span
                            className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                            onClick={() => handleOpenSupCategory(category.id)}
                          >
                            {t("View")}
                          </span>

                          {openSupCategory === category.id && (
                            <Dialog
                              open={true}
                              onClose={handleCloseSupCategory}
                              className="relative z-10"
                            >
                              <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                              <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                  <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl">
                                    {/* Permissions List */}
                                    <div className="flex flex-wrap items-center justify-center w-full gap-4 px-4 my-4 sm:p-6 sm:pb-4">
                                      {category.sub_categories.length === 0 ? (
                                        <div className="w-full my-4 text-lg text-center text-gray-500 font-TextFontSemiBold">
                                          {t("No subcategory available for this category")}
                                        </div>
                                      ) : (
                                        category.sub_categories.map(
                                          (supcategory, index) => {
                                            const displayIndex = index + 1;
                                            return (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between px-3 py-3 duration-300 shadow-md hover:shadow-none rounded-xl bg-gray-50 gap-x-2"
                                              >
                                                <span className="text-lg capitalize text-mainColor lg:text-xl font-TextFontSemiBold">
                                                  {displayIndex}.{" "}
                                                  {supcategory.name}
                                                </span>
                                                <Link
                                                  to={`edit/${supcategory.id}`}
                                                >
                                                  <EditIcon />
                                                </Link>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleOpenSupDelete(
                                                      supcategory.id
                                                    )
                                                  }
                                                >
                                                  <DeleteIcon />
                                                </button>
                                                {openSupDelete ===
                                                  supcategory.id && (
                                                    <Dialog
                                                      open={true}
                                                      onClose={handleCloseSupDelete}
                                                      className="relative z-10"
                                                    >
                                                      <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                                                      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                                        <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                                          <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
                                                            <div className="flex flex-col items-center justify-center px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                                                              <Warning
                                                                width="28"
                                                                height="28"
                                                                aria-hidden="true"
                                                              />
                                                              <div className="flex items-center">
                                                                <div className="mt-2 text-center">
                                                                  {t("You will delete supcategory")}{" "}
                                                                  {supcategory?.name ||
                                                                    "-"}
                                                                </div>
                                                              </div>
                                                            </div>
                                                            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                              <button
                                                                className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                                                onClick={() =>
                                                                  handleSupDelete(
                                                                    supcategory.id,
                                                                    supcategory.name
                                                                  )
                                                                }
                                                              >
                                                                {t("Delete")}
                                                              </button>

                                                              <button
                                                                type="button"
                                                                data-autofocus
                                                                onClick={
                                                                  handleCloseSupDelete
                                                                }
                                                                className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                                                              >
                                                                {t("Cancel")}
                                                              </button>
                                                            </div>
                                                          </DialogPanel>
                                                        </div>
                                                      </div>
                                                    </Dialog>
                                                  )}
                                              </div>
                                            );
                                          }
                                        )
                                      )}
                                    </div>

                                    {/* Dialog Footer */}
                                    <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                      <button
                                        type="button"
                                        onClick={handleCloseSupCategory}
                                        className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                      >
                                        {t("Close")}
                                      </button>
                                    </div>
                                  </DialogPanel>
                                </div>
                              </div>
                            </Dialog>
                          )}
                        </td>
                      )}

                      {/* Products Column - For All Roles */}
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <span
                          className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                          onClick={() => handleOpenProducts(category.id)}
                        >
                          {t("View")}
                        </span>

                        {openProducts === category.id && (
                          <Dialog
                            open={true}
                            onClose={handleCloseProducts}
                            className="relative z-10"
                          >
                            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                              <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl">
                                  <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 font-TextFontSemiBold">
                                      {t("Products in")}: {category.name}
                                    </h3>
                                  </div>

                                  {/* Products List */}
                                  <div className="max-h-96 overflow-y-auto">
                                    {loadingProducts ? (
                                      <div className="flex items-center justify-center py-8">
                                        <StaticLoader />
                                      </div>
                                    ) : categoryProducts.length === 0 ? (
                                      <div className="w-full my-4 text-lg text-center text-gray-500 font-TextFontSemiBold py-8">
                                        {t("No products available for this category")}
                                      </div>
                                    ) : (
                                      <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {categoryProducts.map((product, index) => (
                                            <div
                                              key={product.id}
                                              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                            >
                                              <button
                                                onClick={() => navigate('/dashboard/setup_product/product', { state: { scrollToProductId: product.id } })}
                                                className="text-lg font-TextFontMedium text-mainColor text-center hover:underline focus:outline-none"
                                              >
                                                {index + 1}. {product.name}
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Dialog Footer */}
                                  <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
                                    <button
                                      type="button"
                                      onClick={handleCloseProducts}
                                      className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontMedium sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                    >
                                      {t("Close")}
                                    </button>
                                  </div>
                                </DialogPanel>
                              </div>
                            </div>
                          </Dialog>
                        )}
                      </td>
                      <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                        <Switch
                          checked={category.status === 1}
                          handleClick={() => {
                            handleChangeStaus(
                              category.id,
                              category.name,
                              category.status === 1 ? 0 : 1
                            );
                          }}
                        />
                      </td>
                      {role !== "branch" && (
                        <>
                          <td className="min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl overflow-hidden">
                            <Switch
                              checked={category.active === 1}
                              handleClick={() => {
                                handleChangeActive(
                                  category.id,
                                  category.name,
                                  category.active === 1 ? 0 : 1
                                );
                              }}
                            />
                          </td>
                          <td className="relative min-w-[150px] sm:min-w-[100px] sm:w-2/12 lg:w-2/12 py-2 text-center text-thirdColor text-sm sm:text-base lg:text-lg xl:text-xl">
                            <span
                              className="text-xl border-b-2 cursor-pointer text-mainColor border-mainColor font-TextFontSemiBold"
                              onClick={() => handleOpenPriority(category.id)}
                            >
                              {category.priority}
                            </span>
                            {openPriority === category.id && (
                              <Dialog
                                open={true}
                                onClose={handleClosePriority}
                                className="relative z-10"
                              >
                                <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                  <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                                    <DialogPanel className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-4xl">
                                      {/* Permissions List */}
                                      <div className="flex items-baseline justify-center w-8/12 gap-4 px-4 mx-auto my-4 sm:p-6 sm:pb-4">
                                        <span className="text-2xl font-TextFontRegular text-thirdColor">
                                          {t("Priority")}:
                                        </span>
                                        <NumberInput
                                          value={priorityChange} // Access category_name property
                                          onChange={(e) =>
                                            setPriorityChange(e.target.value)
                                          }
                                          placeholder={
                                            category.priority || t("Priority Num")
                                          }
                                        />
                                      </div>

                                      {/* Dialog Footer */}
                                      <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-x-2">
                                        {/* <AddButton /> */}
                                        <button
                                          type="button"
                                          onClick={handleClosePriority}
                                          className="inline-flex justify-center w-full px-6 py-3 text-sm text-white shadow-sm rounded-xl bg-mainColor font-TextFontMedium sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                        >
                                          {t("Close")}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleChangePriority(
                                              category.id,
                                              category.name
                                            )
                                          } // Renamed 'handleClick' to 'onClick'
                                          className="inline-flex justify-center w-full px-6 py-3 text-sm bg-white border-2 shadow-sm rounded-xl font-TextFontMedium text-mainColor sm:mt-0 sm:w-auto hover:bg-mainColor-dark focus:outline-none"
                                        >
                                          {t("Change Priority")}
                                        </button>
                                      </div>
                                    </DialogPanel>
                                  </div>
                                </div>
                              </Dialog>
                            )}
                          </td>
                        </>
                      )}
                      {role == "admin" && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link to={`edit/${category.id}`}>
                              <EditIcon />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(category.id)}
                            >
                              <DeleteIcon />
                            </button>
                            {openDelete === category.id && (
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
                                        <Warning
                                          width="28"
                                          height="28"
                                          aria-hidden="true"
                                        />
                                        <div className="flex items-center">
                                          <div className="mt-2 text-center">
                                            {t("youwilldeletecategory")}{" "}
                                            {category?.name || "-"}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                          className="inline-flex justify-center w-full px-6 py-3 text-sm text-white rounded-md shadow-sm bg-mainColor font-TextFontSemiBold sm:ml-3 sm:w-auto"
                                          onClick={() =>
                                            handleDelete(
                                              category.id,
                                              category.name
                                            )
                                          }
                                        >
                                          {t("Delete")}
                                        </button>

                                        <button
                                          type="button"
                                          data-autofocus
                                          onClick={handleCloseDelete}
                                          className="inline-flex justify-center w-full px-6 py-3 mt-3 text-sm text-gray-900 bg-white rounded-md shadow-sm font-TextFontMedium ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                                        >
                                          {t("Cancel")}
                                        </button>
                                      </div>
                                    </DialogPanel>
                                  </div>
                                </div>
                              </Dialog>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                )
              )}
            </tbody>
          </table >
          {
            categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center my-6 gap-x-4">
                {currentPage !== 1 && (
                  <button
                    type="button"
                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {t("Prev")}
                  </button>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 mx-1 text-lg font-TextFontSemiBold rounded-full duration-300 ${currentPage === page
                        ? "bg-mainColor text-white"
                        : " text-mainColor"
                        }`}
                    >
                      {page}
                    </button>
                  )
                )}
                {totalPages !== currentPage && (
                  <button
                    type="button"
                    className="px-4 py-2 text-lg text-white rounded-xl bg-mainColor font-TextFontMedium"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {t("Next")}
                  </button>
                )}
              </div>
            )
          }
        </div >
      )}
    </div >
  );
};

export default CategoryPage;