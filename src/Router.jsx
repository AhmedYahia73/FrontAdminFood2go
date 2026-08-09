
import LoaderLogin from "./Components/Loaders/LoaderLogin.jsx";
import React, { Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
const AddonsLayout = React.lazy(() => import("./layouts/Dashboard/Addons/AddonsLayout"));
const AddProductLayout = React.lazy(() => import("./layouts/Dashboard/ProductSetup/AddProductLayout"));
const AllOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/AllOrders/AllOrdersLayout"));
const BannersLayout = React.lazy(() => import("./layouts/Dashboard/Banners/BannersLayout"));
const BranchesLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Branches/BranchesLayout"));
const CanceledOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/CanceledOrders/CanceledOrdersLayout"));
const CancelTimeLayout = React.lazy(() => import("./layouts/Dashboard/Setting/CancelTime/CancelTimeLayout"));
const CategoryLayout = React.lazy(() => import("./layouts/Dashboard/CategorySetup/CategoryLayout"));
const CitiesLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Cities/CitiesLayout"));
const ConfirmedOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/ConfirmedOrders/ConfirmedOrdersLayout"));
const DashboardLayout = React.lazy(() => import("./layouts/Dashboard/Home/DashboardLayout"));
const AdminLandingPage = React.lazy(() => import("./Pages/Dashboard/Admin/Home/AdminLandingPage"));
const DealOrderLayout = React.lazy(() => import("./layouts/Dashboard/DealOrder/DealOrderLayout"));
const DeliveredOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/DeliveredOrders/DeliveredOrdersLayout"));
const DeliveryManLayout = React.lazy(() => import("./layouts/Dashboard/DeliveryMan/DeliveryManLayout"));
const DeliveryTimeLayout = React.lazy(() => import("./layouts/Dashboard/Setting/DeliveryTime/DeliveryTimeLayout"));
const DetailsOrderLayout = React.lazy(() => import("./layouts/Dashboard/Orders/DetailsOrder/DetailsOrderLayout"));
const DiscountLayout = React.lazy(() => import("./layouts/Dashboard/Discount/DiscountLayout"));
const EditAddonsLayout = React.lazy(() => import("./layouts/Dashboard/Addons/EditAddonsLayout"));
const EditBannerLayout = React.lazy(() => import("./layouts/Dashboard/Banners/EditBannerLayout"));
const EditBranchLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Branches/EditBranchLayout"));
const EditCategoryLayout = React.lazy(() => import("./layouts/Dashboard/CategorySetup/EditCategoryLayout"));
const EditCityLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Cities/EditCityLayout"));
const EditDeliveryManLayout = React.lazy(() => import("./layouts/Dashboard/DeliveryMan/EditDeliveryManLayout"));
const EditDiscountLayout = React.lazy(() => import("./layouts/Dashboard/Discount/EditDiscountLayout"));
const EditOfferLayout = React.lazy(() => import("./layouts/Dashboard/Offers/EditOfferLayout"));
const EditPaymentMethodLayout = React.lazy(() => import("./layouts/Dashboard/Setting/PaymentMethod/EditPaymentMethodLayout"));
const EditProductLayout = React.lazy(() => import("./layouts/Dashboard/ProductSetup/EditProductLayout"));
const EditTaxLayout = React.lazy(() => import("./layouts/Dashboard/Taxes/EditTaxLayout"));
const EditZoneLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Zones/EditZoneLayout"));
const FailedOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/FailedOrders/FailedOrdersLayout"));
const ForgetPassLayout = React.lazy(() => import("./layouts/Authentication/ForgetPassLayout"));
const InvoiceOrderLayout = React.lazy(() => import("./layouts/Dashboard/Orders/InvoiceOrder/InvoiceOrderLayout"));
const LanguagesLayout = React.lazy(() => import("./layouts/Dashboard/Languages/LanguagesLayout"));
const LoginLayout = React.lazy(() => import("./layouts/Authentication/LoginLayout"));
const OffersLayout = React.lazy(() => import("./layouts/Dashboard/Offers/OffersLayout"));
const OrdersPaymentLayout = React.lazy(() => import("./layouts/Dashboard/OrdersPayment/OrderPaymentLayout"));
const OrderTypeLayout = React.lazy(() => import("./layouts/Dashboard/Setting/OrderType/OrderTypeLayout"));
const OutForDeliveryOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/OutForDeliveryOrders/OutForDeliveryOrdersLayout"));
const PaymentMethodLayout = React.lazy(() => import("./layouts/Dashboard/Setting/PaymentMethod/PaymentMethodLayout"));
const PendingOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/PendingOrders/PendingOrdersLayout"));
const ProcessingOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/ProcessingOrders/ProcessingOrdersLayout"));
const ProductLayout = React.lazy(() => import("./layouts/Dashboard/ProductSetup/ProductLayout"));
const ResturantTimeLayout = React.lazy(() => import("./layouts/Dashboard/Setting/ResturantTime/ResturantTimeLayout"));
const ReturnedOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/ReturnedOrders/ReturnedOrdersLayout"));
const ScheduleOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/ScheduleOrders/ScheduleOrdersLayout"));
const SongLayout = React.lazy(() => import("./layouts/Dashboard/Song/SongLayout"));
const TaxesLayout = React.lazy(() => import("./layouts/Dashboard/Taxes/TaxesLayout"));
const TaxTypeLayout = React.lazy(() => import("./layouts/Dashboard/Taxes/TaxTypeLayout"));
const ZonesLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Zones/ZonesLayout"));
const CouponLayout = React.lazy(() => import("./layouts/Dashboard/Coupon/CouponLayout"));
const EditCouponLayout = React.lazy(() => import("./layouts/Dashboard/Coupon/EditCouponLayout"));
const BuyOfferLayout = React.lazy(() => import("./layouts/Dashboard/BuyOffer/BuyOfferLayout"));
const DealsLayout = React.lazy(() => import("./layouts/Dashboard/Deals/DealsLayout"));
const EditDealLayout = React.lazy(() => import("./layouts/Dashboard/Deals/EditDealLayout"));
const AutomaticPaymentLayout = React.lazy(() => import("./layouts/Dashboard/Setting/AutomaticPayment/AutomaticPaymentLayout"));
const CustomersLayout = React.lazy(() => import("./layouts/Dashboard/Users/Customers/CustomersLayout"));
const EditCustomersLayout = React.lazy(() => import("./layouts/Dashboard/Users/Customers/EditCustomersLayout"));
const BusinessSetupLayout = React.lazy(() => import("./layouts/Dashboard/BusinessSetup/BusinessSetupLayout"));
const EditRoleLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Roles/EditRoleLayout"));
const RolesLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Roles/RolesLayout"));
const AdminsLayout = React.lazy(() => import("./layouts/Dashboard/Users/Admins/AdminsLayout"));
const EditAdminLayout = React.lazy(() => import("./layouts/Dashboard/Users/Admins/EditAdminLayout"));
const MenuLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Menu/MenuLayout"));
const BranchCategoryLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Branches/BranchCategoryLayout"));
const CategoryProductLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Branches/CategoryProductLayout"));
const ProductVariationLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Branches/ProductVariationLayout"));
const VariationOptionLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Branches/VariationOptionLayout"));
const EmailLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Email/EmailLayout"));
const AddRoleLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Roles/AddRoleLayout"));
const ScheduleTimeLayout = React.lazy(() => import("./layouts/Dashboard/Setting/ScheduleTime/ScheduleTimeLayout"));
const EditScheduleTimeLayout = React.lazy(() => import("./layouts/Dashboard/Setting/ScheduleTime/EditScheduleTimeLayout"));
const RefundOrdersLayout = React.lazy(() => import("./layouts/Dashboard/Orders/RefundOrders/RefundOrdersLayout"));
const CancelationNotificationLayout = React.lazy(() => import("./layouts/Dashboard/Setting/CancelationNotification/CancelationNotificationLayout"));
const PolicySupportLayout = React.lazy(() => import("./layouts/Dashboard/Setting/PolicySupport/PolicySupportLayout"));
const CaptianOrderLayout = React.lazy(() => import("./layouts/Dashboard/CaptianOrder/CaptianOrderLayout"));
const AddCaptianOrderLayout = React.lazy(() => import("./layouts/Dashboard/CaptianOrder/AddCaptianOrderLayout"));
const EditCaptianOrderLayout = React.lazy(() => import("./layouts/Dashboard/CaptianOrder/EditCaptianOrderLayout"));
const WaiterLayout = React.lazy(() => import("./layouts/Dashboard/Waiter/WaiterLayout"));
const AddWaiterLayout = React.lazy(() => import("./layouts/Dashboard/Waiter/AddWaiterLayout"));
const EditWaiterLayout = React.lazy(() => import("./layouts/Dashboard/Waiter/EditWaiterLayout"));
const VoidReasonLayout = React.lazy(() => import("./layouts/Dashboard/VoidReason/VoidReasonLayout"));
const EditVoidReasonLayout = React.lazy(() => import("./layouts/Dashboard/VoidReason/EditVoidReasonLayout"));
const AddHallLocationsLayout = React.lazy(() => import("./layouts/Dashboard/Setting/HallLocations/AddHallLocationsLayout"));
import ProtectedLogin from "./ProtectedData/ProtectedLogin";
import NotFoundPage from "./Pages/NotFoundPage/NotFoundPage";
import App from "./App";
const AddBranchSection = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/addBranchSection"));
const AddFinacialAccountPage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/FinacialAccount/AddFinacialAccountPage"));
const AddHallLocations = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/HallLocations/AddHallLocations"));
const AddWaiter = React.lazy(() => import("./Pages/Dashboard/Admin/Waiter/AddWaiter"));
const BusinessSettingsPage = React.lazy(() => import("./Pages/Dashboard/Admin/BusinessSetup/BusinessSettingsPage"));
const CustomerLoginPage = React.lazy(() => import("./Pages/Dashboard/Admin/BusinessSetup/CustomerLoginPage"));
const EditFinacialAccountPage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/FinacialAccount/EditFinacialAccountPage"));
const EditHallLocations = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/HallLocations/EditHallLocations"));
const EditRolePage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Roles/EditRole"));
const FinacialAccountPage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/FinacialAccount/FinacialAccountPage"));
const HallLocations = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/HallLocations/HallLocations"));
const MainBranchSetupPage = React.lazy(() => import("./Pages/Dashboard/Admin/BusinessSetup/MainBranchSetupPage"));
const OrdersPage = React.lazy(() => import("./Pages/Dashboard/Admin/BusinessSetup/OrdersPage"));
const OrdersPaymentHistoryPage = React.lazy(() => import("./Pages/Dashboard/Admin/OrdersPayment/OrdersPaymentHistoryPage"));
const OrdersPaymentPendingPage = React.lazy(() => import("./Pages/Dashboard/Admin/OrdersPayment/OrdersPaymentPendingPage"));
const RestaurantTimeSlotPage = React.lazy(() => import("./Pages/Dashboard/Admin/BusinessSetup/RestaurantTimeSlotPage"));
const LogOrders = React.lazy(() => import("./Pages/Dashboard/Admin/Orders/LogOrders/LogOrders"));
const EditEmailPage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Email/EditEmail"));
const GroupLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Group/GroupLayout"));
const EditGroupLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Group/EditGroupLayout"));
const ExtraLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Extra/ExtraLayout"));
const EditExtraLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Extra/EditExtraLayout"));
const AppSetupLayout = React.lazy(() => import("./layouts/Dashboard/Setting/AppSetup/AppSetupLayout"));
//const ToggleItems = React.lazy(() => import("./Pages/Dashboard/Admin/ProductSetup/ToggleItems"));
const BranchList = React.lazy(() => import("./DashboardBranches/BranchList"));
const BranchCustomer = React.lazy(() => import("./DashboardBranches/BranchCustomer/BranchCustomer"));
const BranchCustomerAdd = React.lazy(() => import("./DashboardBranches/BranchCustomer/BranchCustomerAdd"));
const BranchAddressAdd = React.lazy(() => import("./DashboardBranches/BranchCustomer/BranchAddressAdd"));
const BranchOffer = React.lazy(() => import("./DashboardBranches/BranchOffer"));
const KitchenType = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/KitchenType/KitchenType"));
const AddKitchenType = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/KitchenType/AddKitchenType"));
const EditKitchenType = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/KitchenType/EditKitchenType"));
const HallLocationsLayout = React.lazy(() => import("./layouts/Dashboard/Setting/HallLocations/HallLocationsLayout"));
const TablesLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Tables/TablesLayout"));
const EditTablesLayout = React.lazy(() => import("./layouts/Dashboard/Setting/Tables/EditTablesLayout"));
const EditHallLocationLayout = React.lazy(() => import("./layouts/Dashboard/Setting/HallLocations/EditHallLocationLayout"));
const CaptianOrder = React.lazy(() => import("./Pages/Dashboard/Admin/CapitanOrder/CapitanOrder"));
const AddCaptianOrder = React.lazy(() => import("./Pages/Dashboard/Admin/CapitanOrder/AddCapitanOrder"));
const EditCaptianOrder = React.lazy(() => import("./Pages/Dashboard/Admin/CapitanOrder/EditCapitanOrder"));
const LandingPage = React.lazy(() => import("./LandingPage/LandingPage"));
const Cashier = React.lazy(() => import("./Pages/Dashboard/Admin/Cashier/Cashier"));
const AddCashier = React.lazy(() => import("./Pages/Dashboard/Admin/Cashier/AddCashier"));
const EditCashier = React.lazy(() => import("./Pages/Dashboard/Admin/Cashier/EditCashier"));
const CashierMan = React.lazy(() => import("./Pages/Dashboard/Admin/CashierMan/CashierMan"));
const AddCashierMan = React.lazy(() => import("./Pages/Dashboard/Admin/CashierMan/AddCashierMan"));
const EditCashierMan = React.lazy(() => import("./Pages/Dashboard/Admin/CashierMan/EditCashierMan"));
const CustomersDue = React.lazy(() => import("./Pages/Dashboard/Admin/Users/CustomersDue/CustomersDue"));
const Upselling = React.lazy(() => import("./Pages/Dashboard/Admin/Upselling/Upselling"));
const AddUpselling = React.lazy(() => import("./Pages/Dashboard/Admin/Upselling/AddUpselling"));
const EditUpselling = React.lazy(() => import("./Pages/Dashboard/Admin/Upselling/EditUpselling"));
const GroupModules = React.lazy(() => import("./Pages/Dashboard/Admin/GroupModules/GroupModules"));
const GroupModuleProducts = React.lazy(() => import("./Pages/Dashboard/Admin/GroupModules/GroupModuleProduct"));
const AddGroupModules = React.lazy(() => import("./Pages/Dashboard/Admin/GroupModules/AddGroupModules"));
const EditGroupModules = React.lazy(() => import("./Pages/Dashboard/Admin/GroupModules/EditGroupModules"));
const OrderPercentage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/OrderPercentage/OrderPercentage"));
const Recipes = React.lazy(() => import("./Pages/Dashboard/Admin/ProductSetup/Recipes/Recipes"));
const AddRecipes = React.lazy(() => import("./Pages/Dashboard/Admin/ProductSetup/Recipes/AddRecipes"));
const EditRecipes = React.lazy(() => import("./Pages/Dashboard/Admin/ProductSetup/Recipes/EditRecipes"));
const DiscountModule = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/DiscountModule/DiscountModule"));
const AddDiscountModule = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/DiscountModule/AddDiscountModule"));
const EditDiscountModule = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/DiscountModule/EditDiscountModule"));
const DiscountCode = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/DiscountCode/DiscountCode"));
const AddDiscountCode = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/DiscountCode/AddDiscountCode"));
const EditDiscountCode = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/DiscountCode/EditDiscountCode"));
const SinglePageDetails = React.lazy(() => import("./Pages/Dashboard/Admin/Users/Customers/SinglePageDetails"));
const ExpensesCategory = React.lazy(() => import("./Pages/Dashboard/Admin/Expenses/ExpensesCategory/ExpensesCategory"));
const AddExpensesCategory = React.lazy(() => import("./Pages/Dashboard/Admin/Expenses/ExpensesCategory/AddExpensesCategory"));
const EditExpensesCategory = React.lazy(() => import("./Pages/Dashboard/Admin/Expenses/ExpensesCategory/EditExpensesCategory"));
const OrdersReports = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/OrdersReports/OrdersReports"));
const CashierShiftReport = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/CashierShiftReport/CashierShiftReport"));
const FinacialReports = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/FinacialReports/FinacialReports"));
const InvoicesReports = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/InvoicesReports/InvoicesReports"));
const HallReports = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/HallReports/HallReports"));
const EndShifts = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/EndShifts/EndShifts"));

const ExpensesList = React.lazy(() => import("./Pages/Dashboard/Admin/Expenses/ExpensesList/ExpensesList"));
const AddExpensesList = React.lazy(() => import("./Pages/Dashboard/Admin/Expenses/ExpensesList/AddExpensesList"));
const EditExpensesList = React.lazy(() => import("./Pages/Dashboard/Admin/Expenses/ExpensesList/EditExpensesList"));
const ExpensesPayment = React.lazy(() => import("./Pages/Dashboard/Admin/Expenses/ExpensesPayment/ExpensesPayment"));
const ServiceFees = React.lazy(() => import("./Pages/Dashboard/Admin/ServiceFees/ServiceFees"));
const AddServiceFees = React.lazy(() => import("./Pages/Dashboard/Admin/ServiceFees/AddServiceFees"));
const EditServiceFees = React.lazy(() => import("./Pages/Dashboard/Admin/ServiceFees/EditServiceFees"));
const MaterialCategory = React.lazy(() => import("./Pages/Dashboard/Admin/MaterialModule/MaterialCategory/MaterialCategory"));
const AddMaterialCategory = React.lazy(() => import("./Pages/Dashboard/Admin/MaterialModule/MaterialCategory/AddMaterialCategory"));
const EditMaterialCategory = React.lazy(() => import("./Pages/Dashboard/Admin/MaterialModule/MaterialCategory/EditMaterialCategory"));
const MaterialList = React.lazy(() => import("./Pages/Dashboard/Admin/MaterialModule/MaterialList/MaterialList"));
const AddMaterialList = React.lazy(() => import("./Pages/Dashboard/Admin/MaterialModule/MaterialList/AddMaterialList"));
const EditMaterialList = React.lazy(() => import("./Pages/Dashboard/Admin/MaterialModule/MaterialList/EditMaterialList"));
const ManufacturingHistory = React.lazy(() => import("./Pages/Dashboard/Admin/Manufacturing/ManufacturingHistory"));
const AddManufacturing = React.lazy(() => import("./Pages/Dashboard/Admin/Manufacturing/AddManufacturing"));
const PurchaseConsumersion = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseConsumersion/PurchaseConsumersion"));
const AddPurchaseConsumersion = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseConsumersion/AddPurchaseConsumersion"));
const EditPurchaseConsumersion = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseConsumersion/EditPurchaseConsumersion"));
const PurchaseWasted = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseWasted/PurchaseWasted"));
const AddPurchaseWasted = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseWasted/AddPurchaseWasted"));
const EditPurchaseWasted = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseWasted/EditPurchaseWasted"));
const PurchaseList = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseList/PurchaseList"));
const AddPurchaseList = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseList/AddPurchaseList"));
const EditPurchaseList = React.lazy(() => import("./Pages/Dashboard/Admin/Purchase/PurchaseList/EditPurchaseList"));
const PreparationMan = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/PreparationMan/PreparationMan"));
const AddPreparationMan = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/PreparationMan/AddPreparationMan"));
const EditPreparationMan = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/PreparationMan/EditPreparationMan"));
const DeliveryManOrdersParent = React.lazy(() => import("./Pages/Dashboard/Admin/DeliveryMan/DeliveryManOrder/DeliveryManOrdersParent"));
// const ReceiptLanguage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/ReceiptLanguage/ReceiptLanguage"));
const OrdersDeliveryParent = React.lazy(() => import("./Pages/Dashboard/Admin/OrdersDelivery/OrdersDeliveryParent"));
const DeletedCustomer = React.lazy(() => import("./Pages/Dashboard/Admin/Users/DeletedCustomer/DeletedCustomer"));
const DueGroupModule = React.lazy(() => import("./Pages/Dashboard/Admin/GroupModules/DueGroupModule"));
const LanguageSystem = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/LanguageSystem/LanguageSystem"));
const Store = React.lazy(() => import("./Pages/Dashboard/Admin/Store/Store"));
const AddStore = React.lazy(() => import("./Pages/Dashboard/Admin/Store/AddStore"));
const EditStore = React.lazy(() => import("./Pages/Dashboard/Admin/Store/EditStore"));
const StoreMan = React.lazy(() => import("./Pages/Dashboard/Admin/StoreMan/StoreMan"));
const AddStoreMan = React.lazy(() => import("./Pages/Dashboard/Admin/StoreMan/AddStoreMan"));
const EditStoreMan = React.lazy(() => import("./Pages/Dashboard/Admin/StoreMan/EditStoreMan"));
const InventoryMaterial = React.lazy(() => import("./Pages/Dashboard/Admin/Inventory/InventoryMaterial"));
const InventoryProduct = React.lazy(() => import("./Pages/Dashboard/Admin/Inventory/InventoryProduct"));
const FreeDiscount = React.lazy(() => import("./Pages/Dashboard/Admin/FreeDiscount/FreeDiscount"));
const Popup = React.lazy(() => import("./Pages/Dashboard/Admin/Popup/Popup"));
const VoidList = React.lazy(() => import("./Pages/Dashboard/Admin/VoidList/VoidList"));
const PurchaseCount = React.lazy(() => import("./Pages/Dashboard/Admin/StockCount/StockCount"));
// const ReceiptLanguage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/ReceiptLanguage/ReceiptLanguage"));
const StockCount = React.lazy(() => import("./Pages/Dashboard/Admin/StockCount/StockCount"));
const StockTransfer = React.lazy(() => import("./Pages/Dashboard/Admin/StockTransfer/StockTransfer"));
const PurchaseCategory = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseCategory/PurchaseCategory"));
const AddPurchaseCategory = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseCategory/AddPurchaseCategory"));
const EditPurchaseCategory = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseCategory/EditPurchaseCategory"));
const PurchaseProduct = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseProduct/PurchaseProduct"));
const AddPurchaseProduct = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseProduct/AddPurchaseProduct"));
const EditPurchaseProduct = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseProduct/EditPurchaseProduct"));
const PurchaseRecipe = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseProduct/PurchaseRecipes/PurchaseRecipe"));
const AddPurchaseRecipe = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseProduct/PurchaseRecipes/AddPurchaseRecipe"));
const EditPurchaseRecipe = React.lazy(() => import("./Pages/Dashboard/Admin/ProductReceipes/PurchaseProduct/PurchaseRecipes/EditPurchaseRecipe"));
const FakeOrderPage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/FakeOrder/FakeOrderPage"));
const ReceiptDesignPage = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/ReceiptDesign/ReceiptDesignPage"));
const Bundles = React.lazy(() => import("./Pages/Dashboard/Admin/Bundles/Bundles"));
const AddBundles = React.lazy(() => import("./Pages/Dashboard/Admin/Bundles/AddBundles"));
const EditBundles = React.lazy(() => import("./Pages/Dashboard/Admin/Bundles/EditBundles"));
const SocialMedia = React.lazy(() => import("./Pages/Dashboard/Admin/SocialMedia/SocialMedia"));
const AddSocialMedia = React.lazy(() => import("./Pages/Dashboard/Admin/SocialMedia/AddSocialMedia"));
const EditSocialMedia = React.lazy(() => import("./Pages/Dashboard/Admin/SocialMedia/EditSocialMedia"));
const ProductVariation = React.lazy(() => import("./Pages/Dashboard/Admin/ProductSetup/ProductVariation"));
const VariationRecipe = React.lazy(() => import("./Pages/Dashboard/Admin/ProductSetup/VariationRecipe/VariationRecipe"));
const AddVariationRecipe = React.lazy(() => import("./Pages/Dashboard/Admin/ProductSetup/VariationRecipe/AddVariationRecipe"));
const EditVariationRecipe = React.lazy(() => import("./Pages/Dashboard/Admin/ProductSetup/VariationRecipe/EditVariationRecipe"));
const RealTimeSalesReports = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/SalesReport/RealTimeSalesReports"));
const PricingProduct = React.lazy(() => import("./Pages/Dashboard/Admin/PricingProduct/PricingProduct"));
const ProductsReports = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/ProductsReports/ProductsReports"));
const ProductsMovements = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/ProductsMovements/ProductsMovements"));
const DineReports = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/DineReports/DineReports"));
const CashierShortage = React.lazy(() => import("./Pages/Dashboard/Admin/Reports/CashierShortage/CashierShortage"));
const PrinterModule = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/KitchenType/PrinterModule/PrinterModule"));
const AddPrinterModule = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/KitchenType/PrinterModule/AddPrinterModule"));
const EditPrinterModule = React.lazy(() => import("./Pages/Dashboard/Admin/Setting/Branches/KitchenType/PrinterModule/EditPrinterModule"));

const ProductOffers = React.lazy(() => import("./Pages/Dashboard/Admin/ProductOffers/ProductOffers"));
const AddProductOffer = React.lazy(() => import("./Pages/Dashboard/Admin/ProductOffers/AddProductOffer"));
const EditProductOffer = React.lazy(() => import("./Pages/Dashboard/Admin/ProductOffers/EditProductOffer"));
const DineOrders = React.lazy(() => import("./Pages/Dashboard/Admin/Orders/DineOrders/DineOrders"));

const ProductSetupLayout = () => {
  return (
    <Suspense fallback={<LoaderLogin />}>
      <Outlet />
    </Suspense>
  );
};
const SettingLayout = () => {
  return (
    <Suspense fallback={<LoaderLogin />}>
      <Outlet />
    </Suspense>
  );
};
const OrderLayout = () => {
  return (
    <Suspense fallback={<LoaderLogin />}>
      <Outlet />
    </Suspense>
  );
};
const AppBranchCategoryLayout = () => {
  return (
    <Suspense fallback={<LoaderLogin />}>
      <Outlet />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  // {
  //   patgh: "/",
  //   element: <ProtectedLogin />,
  //   children: [
  //     {
  //       path: '',
  //       element: <LandingPage />,
  //     }
  //   ]
  // },
  /* Login Admin */
  {
    path: "/",
    element: <ProtectedLogin />,
    children: [
      {
        path: "",
        element: <LoginLayout />,
      },
    ],
  },

  /* Forget Password User */
  {
    path: "/forget_password",
    element: <ProtectedLogin />,
    children: [
      {
        path: "",
        element: <ForgetPassLayout />,
      },
    ],
  },
  {
    /** 
    {
    path: "/product/:id",
    element: <ToggleItems />
  },
  */
  },

  /* Dashboard Branch or main app routes after login */
  {
    path: "/branch",
    element: <ProtectedLogin />,
    children: [
      {
        path: "",
        element: <App />,
        children: [
          {
            path: "",
            element: <DashboardLayout />,
          },
          {
            path: "deals",
            element: <BranchList />,
          },
          {
            path: "customer",
            children: [
              {
                path: "",
                index: true,
                element: <BranchCustomer />,
              },
              {
                path: "add",
                element: <BranchCustomerAdd />,
              },
              {
                path: "address-add",
                element: <BranchAddressAdd />,
              },
              {
                path: "edit-address/:id",
                element: <BranchAddressAdd />,
              },
            ],
          },
          {
            path: "order-offers",
            children: [
              {
                path: "",
                index: true,
                element: <BranchOffer />,
              },
              {
                path: "add",
                element: <BranchCustomerAdd />,
              },
              {
                path: "address-add",
                element: <BranchAddressAdd />,
              },
              {
                path: "edit-address/:id",
                element: <BranchAddressAdd />,
              },
            ],
          },
          {
            path: "orders",
            element: <OrderLayout />,
            children: [
              /* All orders */
              {
                path: "all",
                element: <AllOrdersLayout />,
              },
              {
                path: "pending",
                element: <PendingOrdersLayout />,
              },
              {
                path: "confirmed",
                element: <ConfirmedOrdersLayout />,
              },
              {
                path: "processing",
                element: <ProcessingOrdersLayout />,
              },
              {
                path: "out_for_delivery",
                element: <OutForDeliveryOrdersLayout />,
              },
              {
                path: "delivered",
                element: <DeliveredOrdersLayout />,
              },
              {
                path: "returned",
                element: <ReturnedOrdersLayout />,
              },
              {
                path: "refund",
                element: <RefundOrdersLayout />,
              },
              {
                path: "failed",
                element: <FailedOrdersLayout />,
              },
              {
                path: "canceled",
                element: <CanceledOrdersLayout />,
              },
              {
                path: "schedule",
                element: <ScheduleOrdersLayout />,
              },
              {
                path: "log",
                element: <LogOrders />,
              },

              /* Details Order */
              {
                path: "details/:orderId",
                element: <DetailsOrderLayout />,
              },
              /* Invoice Order */
              {
                path: "invoice/:orderId",
                element: <InvoiceOrderLayout />,
              },
            ],
          },
          {
            path: "cashier",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <Cashier />,
              },
              {
                path: "add",
                element: <AddCashier />,
              },
              {
                path: "edit/:cashierId",
                element: <EditCashier />,
              },
            ],
          },
          {
            path: "cashier_man",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <CashierMan />,
              },
              {
                path: "add",
                element: <AddCashierMan />,
              },
              {
                path: "edit/:cashierManId",
                element: <EditCashierMan />,
              },
            ],
          },
          {
            path: "delivery_man",
            children: [
              {
                path: "",
                element: <DeliveryManLayout />,
              },
              {
                path: "edit/:deliveryManId",
                element: <EditDeliveryManLayout />,
              },
              {
                path: "delivery-man-orders/:id",
                element: <DeliveryManOrdersParent />,
              },
            ],
          },
          {
            path: "financial_account",
            children: [
              {
                path: "",
                children: [
                  {
                    index: true,
                    element: <FinacialAccountPage />,
                  },
                  {
                    path: "add",
                    element: <AddFinacialAccountPage />,
                  },
                  {
                    path: "edit/:financialId",
                    element: <EditFinacialAccountPage />,
                  },
                ],
              },
            ],
          },
          {
            path: "expenses",
            element: <Outlet />,
            children: [
              {
                path: "expenses_category",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <ExpensesCategory />,
                      },
                      {
                        path: "add",
                        element: <AddExpensesCategory />,
                      },
                      {
                        path: "edit/:expensesCategoryId",
                        element: <EditExpensesCategory />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "expenses_payment",
                element: <ExpensesPayment />,
              },
            ],
          },
          {
            path: "category",
            children: [
              {
                path: "",
                element: <CategoryLayout />,
              },
            ],
          },
          {
            path: "setup_product",
            element: <ProductSetupLayout />,
            children: [
              {
                path: "product",
                element: <Outlet />,
                children: [
                  {
                    path: "",
                    element: <ProductLayout />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  /* Dashboard or main app routes after login */
  {
    path: "/dashboard",
    element: <ProtectedLogin />,
    children: [
      {
        path: "",
        element: <App />,
        children: [
          {
            path: "",
            element: <AdminLandingPage />,
          },
          {
            path: "home-overview",
            element: <DashboardLayout />,
          },
          {
            path: "addons",
            children: [
              {
                path: "",
                element: <AddonsLayout />,
              },
              {
                path: "edit/:addonId",
                element: <EditAddonsLayout />,
              },
            ],
          },
          {
            path: "category",
            children: [
              {
                path: "",
                element: <CategoryLayout />,
              },
              {
                path: "edit/:categoryId",
                element: <EditCategoryLayout />,
              },
            ],
          },
          {
            path: "banners",
            children: [
              {
                path: "",
                element: <BannersLayout />,
              },
              {
                path: "edit/:bannerId",
                element: <EditBannerLayout />,
              },
            ],
          },

          {
            path: "setup_product",
            element: <ProductSetupLayout />,
            children: [
              {
                path: "product",
                element: <Outlet />,
                children: [
                  {
                    path: "",
                    element: <ProductLayout />,
                  },
                  {
                    path: "recipes/:productId",
                    element: <Outlet />,
                    children: [
                      {
                        path: "",
                        element: <Recipes />,
                      },
                      {
                        path: "add",
                        element: <AddRecipes />,
                      },
                      {
                        path: "edit/:recipeId",
                        element: <EditRecipes />,
                      },
                    ],
                  },
                  {
                    path: "product_variation/:productId",
                    element: <Outlet />,
                    children: [
                      {
                        path: "",
                        element: <Outlet />,
                        children: [
                          {
                            path: "",
                            element: <ProductVariation />,
                          },
                          {
                            path: "variation_recipe/:optionId",
                            element: <Outlet />,
                            children: [
                              {
                                path: "",
                                element: <VariationRecipe />
                              },
                              {
                                path: "edit_recipe/:optionId", // Keeping as optionId to match existing pattern if needed, or strictly recipeId
                                element: <EditVariationRecipe />
                              },

                            ]
                          },
                          {
                            path: "add",
                            element: <AddVariationRecipe />
                          },

                        ]
                      }
                    ]
                  },
                ],
              },
              {
                path: "product/add",
                element: <AddProductLayout />,
              },
              {
                path: "product/edit/:productId",
                element: <EditProductLayout />,
              },
              {
                path: "pricing_product", // /dashboard/setup_product/pricing_product
                element: <PricingProduct />,
              },
            ],
          },
          {
            path: "product_offers",
            children: [
              {
                path: "",
                element: <ProductOffers />,
              },
              {
                path: "add",
                element: <AddProductOffer />,
              },
              {
                path: "edit/:id",
                element: <EditProductOffer />,
              },
            ],
          },
          {
            path: "branches",
            children: [
              {
                path: "",
                element: <BranchesLayout />,
              },
              {
                path: "add",
                element: <AddBranchSection />,
              },
              {
                path: "edit/:branchId",
                element: <EditBranchLayout />,
              },
              {
                path: "branch_kitchen/:branchId",
                element: <Outlet />,
                children: [
                  {
                    path: "",
                    element: <KitchenType />,
                  },
                  {
                    path: "add",
                    element: <AddKitchenType />,
                  },
                  {
                    path: "edit/:kitchenId",
                    element: <EditKitchenType />,
                  },
                  {
                    path: "printer_module/:kitchenId",
                    element: <Outlet />,
                    children: [
                      {
                        path: "",
                        element: <PrinterModule />,
                      },
                      {
                        path: "add",
                        element: <AddPrinterModule />,
                      },
                      {
                        path: "edit/:printerId",
                        element: <EditPrinterModule />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "branch_birsta/:branchId",
                element: <Outlet />,
                children: [
                  {
                    path: "",
                    element: <KitchenType />,
                  },
                  {
                    path: "add",
                    element: <AddKitchenType />,
                  },
                  {
                    path: "edit/:birstaId",
                    element: <EditKitchenType />,
                  },
                  {
                    path: "printer_module/:birstaId",
                    element: <Outlet />,
                    children: [
                      {
                        path: "",
                        element: <PrinterModule />,
                      },
                      {
                        path: "add",
                        element: <AddPrinterModule />,
                      },
                      {
                        path: "edit/:printerId",
                        element: <EditPrinterModule />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "branch_category/:branchId",
                element: <AppBranchCategoryLayout />,
                children: [
                  {
                    path: "",
                    element: <BranchCategoryLayout />,
                  },
                  {
                    path: "category_product/:productId",
                    element: <CategoryProductLayout />,
                  },
                  {
                    path: "product_variation/:variationId",
                    element: <ProductVariationLayout />,
                  },
                  {
                    path: "variation_option/:optionId",
                    element: <VariationOptionLayout />,
                  },
                ],
              },
              {
                path: "preparation_man/:branchId",
                element: <Outlet />,
                children: [
                  {
                    path: "",
                    element: <PreparationMan />,
                  },
                  {
                    path: "add",
                    element: <AddPreparationMan />,
                  },
                  {
                    path: "edit/:preparationManId",
                    element: <EditPreparationMan />,
                  },
                ],
              },
            ],
          },
          {
            path: "setting",
            element: <SettingLayout />,
            children: [
              {
                path: "roles",
                children: [
                  {
                    path: "",
                    element: <RolesLayout />,
                  },
                  {
                    path: "add",
                    element: <AddRoleLayout />,
                  },
                  {
                    path: "edit/:roleId",
                    element: <EditRolePage />,
                  },
                ],
              },
              {
                path: "payment_method",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <PaymentMethodLayout />,
                      },
                      {
                        path: "edit/:paymentMethodId",
                        element: <EditPaymentMethodLayout />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "financial_account",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <FinacialAccountPage />,
                      },
                      {
                        path: "add",
                        element: <AddFinacialAccountPage />,
                      },
                      {
                        path: "edit/:financialId",
                        element: <EditFinacialAccountPage />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "menu",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <MenuLayout />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "automatic_payment",
                children: [
                  {
                    path: "",
                    element: <AutomaticPaymentLayout />,
                  },
                  // {
                  //   path: 'edit/:cityId',
                  //   element: <EditCityLayout />,
                  // }
                ],
              },
              {
                path: "cities",
                children: [
                  {
                    path: "",
                    element: <CitiesLayout />,
                  },
                  {
                    path: "edit/:cityId",
                    element: <EditCityLayout />,
                  },
                ],
              },
              {
                path: "schedule_time",
                children: [
                  {
                    path: "",
                    element: <ScheduleTimeLayout />,
                  },
                  {
                    path: "edit/:scheduleId",
                    element: <EditScheduleTimeLayout />,
                  },
                ],
              },
              {
                path: "hall_locations",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <HallLocationsLayout />,
                      },
                      {
                        path: "add",
                        element: <AddHallLocationsLayout />,
                      },
                      {
                        path: "edit/:hallId",
                        element: <EditHallLocationLayout />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "hall_tables",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <TablesLayout />,
                      },
                      {
                        path: "edit/:tableId",
                        element: <EditTablesLayout />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "zones",
                children: [
                  {
                    path: "",
                    element: <ZonesLayout />,
                  },
                  {
                    path: "edit/:zoneId",
                    element: <EditZoneLayout />,
                  },
                ],
              },
              {
                path: "groups",
                children: [
                  {
                    path: "",
                    element: <GroupLayout />,
                  },
                  {
                    path: "edit/:groupId",
                    element: <EditGroupLayout />,
                  },
                  {
                    path: "view/:groupExtraId",
                    element: <Outlet />,
                    children: [
                      {
                        path: "",
                        element: <ExtraLayout />,
                      },
                      {
                        path: "edit/:groupEditExtraId",
                        element: <EditExtraLayout />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "order_type",
                element: <OrderTypeLayout />,
              },
              {
                path: "resturant_time",
                element: <ResturantTimeLayout />,
              },
              {
                path: "cancel_time",
                element: <CancelTimeLayout />,
              },
              {
                path: "delivery_time",
                element: <DeliveryTimeLayout />,
              },
              {
                path: "sound",
                element: <SongLayout />,
              },
              {
                path: "notification",
                element: <CancelationNotificationLayout />,
              },
              {
                path: "policy_support",
                element: <PolicySupportLayout />,
              },
              // {
              //   path: "receipt_language",
              //   element: <ReceiptLanguage />,
              // },
              {
                path: "app_setup",
                element: <AppSetupLayout />,
              },
              {
                path: "fake_order",
                element: <FakeOrderPage />,
              },
              {
                path: "void_reason",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <VoidReasonLayout />,
                      },
                      {
                        path: "edit/:voidReasonId",
                        element: <EditVoidReasonLayout />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "order_percentage",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <OrderPercentage />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "language_system",
                element: <LanguageSystem />,
              },
              {
                path: "business_setup",
                element: <BusinessSetupLayout />,
                children: [
                  {
                    path: "business_settings",
                    element: <BusinessSettingsPage />,
                  },
                  {
                    path: "main_branch_setup",
                    element: <MainBranchSetupPage />,
                  },
                  {
                    path: "restaurant_time_slot",
                    element: <RestaurantTimeSlotPage />,
                  },
                  {
                    path: "customer_login",
                    element: <CustomerLoginPage />,
                  },
                  {
                    path: "orders",
                    element: <OrdersPage />,
                  },
                ],
              },
              {
                path: "receipt_design",
                element: <ReceiptDesignPage />,
              },
              {
                path: "languages",
                children: [
                  {
                    path: "",
                    element: <LanguagesLayout />,
                  },
                ],
              },
            ],
          },
          {
            path: "taxes",
            children: [
              {
                path: "all_taxes",
                children: [
                  {
                    path: "",
                    element: <TaxesLayout />,
                  },
                  {
                    path: "edit/:taxId",
                    element: <EditTaxLayout />,
                  },
                ],
              },
              {
                path: "tax_type",
                element: <TaxTypeLayout />,
              },
            ],
          },
          {
            path: "orders_payment",
            element: <OrdersPaymentLayout />,

            children: [
              {
                path: "",
                index: true,
                element: <OrdersPaymentPendingPage />,
              },
              {
                path: "payment_pending",
                element: <OrdersPaymentPendingPage />,
              },
              {
                path: "payment_history",
                element: <OrdersPaymentHistoryPage />,
              },
            ],
          },
          {
            path: "delivery_man",
            children: [
              {
                path: "",
                element: <DeliveryManLayout />,
              },
              {
                path: "edit/:deliveryManId",
                element: <EditDeliveryManLayout />,
              },
              {
                path: "delivery-man-orders/:id",
                element: <DeliveryManOrdersParent />,
              },
            ],
          },
          {
            path: "users",
            children: [
              {
                path: "admins",
                children: [
                  {
                    path: "",
                    element: <AdminsLayout />,
                  },
                  {
                    path: "edit/:adminId",
                    element: <EditAdminLayout />,
                  },
                ],
              },
              {
                path: "customers",
                children: [
                  {
                    path: "",
                    element: <CustomersLayout />,
                  },
                  {
                    path: "edit/:customerId",
                    element: <EditCustomersLayout />,
                  },
                  {
                    path: "customer/:userId",
                    element: <SinglePageDetails />,
                  },
                ],
              },
              {
                path: "due_customers",
                element: <CustomersDue />,
              },
              {
                path: "deleted_customers",
                element: <DeletedCustomer />,
              },
            ],
          },
          {
            path: "deals",
            children: [
              {
                path: "",
                element: <DealsLayout />,
              },
              {
                path: "edit/:dealId",
                element: <EditDealLayout />,
              },
            ],
          },
          {
            path: "offers",
            children: [
              {
                path: "",
                element: <OffersLayout />,
              },
              {
                path: "edit/:offerId",
                element: <EditOfferLayout />,
              },
            ],
          },
          {
            path: "coupon",
            children: [
              {
                path: "",
                element: <CouponLayout />,
              },
              {
                path: "edit/:couponId",
                element: <EditCouponLayout />,
              },
            ],
          },
          {
            path: "discount",
            children: [
              {
                path: "",
                element: <DiscountLayout />,
              },
              {
                path: "edit/:discountId",
                element: <EditDiscountLayout />,
              },
            ],
          },
          {
            path: "discount_code",
            children: [
              {
                path: "",
                children: [
                  {
                    index: true,
                    element: <DiscountCode />,
                  },
                  {
                    path: "add",
                    element: <AddDiscountCode />,
                  },
                  {
                    path: "edit/:codeId",
                    element: <EditDiscountCode />,
                  },
                ],
              },
            ],
          },
          {
            path: "deal_order",
            element: <DealOrderLayout />,
          },
          {
            path: "buy_offer",
            element: <BuyOfferLayout />,
          },

          {
            path: "emails",
            children: [
              {
                path: "",
                element: <EmailLayout />,
              },
              {
                path: "edit/:emailId",
                element: <EditEmailPage />,
              },
            ],
          },

          {
            path: "orders",
            element: <OrderLayout />,
            children: [
              /* All orders */
              {
                path: "all",
                element: <AllOrdersLayout />,
              },
              {
                path: "pending",
                element: <PendingOrdersLayout />,
              },
              {
                path: "confirmed",
                element: <ConfirmedOrdersLayout />,
              },
              {
                path: "processing",
                element: <ProcessingOrdersLayout />,
              },
              {
                path: "out_for_delivery",
                element: <OutForDeliveryOrdersLayout />,
              },
              {
                path: "delivered",
                element: <DeliveredOrdersLayout />,
              },
              {
                path: "returned",
                element: <ReturnedOrdersLayout />,
              },
              {
                path: "refund",
                element: <RefundOrdersLayout />,
              },
              {
                path: "failed",
                element: <FailedOrdersLayout />,
              },
              {
                path: "canceled",
                element: <CanceledOrdersLayout />,
              },
              {
                path: "schedule",
                element: <ScheduleOrdersLayout />,
              },
              {
                path: "log",
                element: <LogOrders />,
              },
              {
                path: "dine_orders",
                element: <DineOrders />,
              },

              /* Details Order */
              {
                path: "details/:orderId",
                element: <DetailsOrderLayout />,
              },
              /* Invoice Order */
              {
                path: "invoice/:orderId",
                element: <InvoiceOrderLayout />,
              },
            ],
          },

          {
            path: "all_orders_delivery",
            element: <OrdersDeliveryParent />,
          },

          {
            path: "captain_order",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <CaptianOrderLayout />,
              },
              {
                path: "add",
                element: <AddCaptianOrderLayout />,
              },
              {
                path: "edit/:captainId",
                element: <EditCaptianOrderLayout />,
              },
            ],
          },

          {
            path: "waiter",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <WaiterLayout />,
              },
              {
                path: "add",
                element: <AddWaiterLayout />,
              },
              {
                path: "edit/:waiterId",
                element: <EditWaiterLayout />,
              },
            ],
          },
          {
            path: "cashier",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <Cashier />,
              },
              {
                path: "add",
                element: <AddCashier />,
              },
              {
                path: "edit/:cashierId",
                element: <EditCashier />,
              },
            ],
          },
          {
            path: "cashier_man",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <CashierMan />,
              },
              {
                path: "add",
                element: <AddCashierMan />,
              },
              {
                path: "edit/:cashierManId",
                element: <EditCashierMan />,
              },
            ],
          },
          {
            path: "upselling",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <Upselling />,
              },
              {
                path: "add",
                element: <AddUpselling />,
              },
              {
                path: "edit/:upsellingId",
                element: <EditUpselling />,
              },
            ],
          },
          {
            path: "discount_module",
            children: [
              {
                path: "",
                children: [
                  {
                    index: true,
                    element: <DiscountModule />,
                  },
                  {
                    path: "add",
                    element: <AddDiscountModule />,
                  },
                  {
                    path: "edit/:moduleId",
                    element: <EditDiscountModule />,
                  },
                ],
              },
            ],
          },
          {
            path: "service_fees",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <ServiceFees />,
              },
              {
                path: "add",
                element: <AddServiceFees />,
              },
              {
                path: "edit/:serviceFeeId",
                element: <EditServiceFees />,
              },
            ],
          },
          {
            path: "purchase",
            element: <Outlet />,
            children: [
              {
                path: "purchase_list",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <PurchaseList />,
                      },
                      {
                        path: "add",
                        element: <AddPurchaseList />,
                      },
                      {
                        path: "edit/:purchaseListId",
                        element: <EditPurchaseList />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "purchase_consumption",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <PurchaseConsumersion />,
                      },
                      {
                        path: "add",
                        element: <AddPurchaseConsumersion />,
                      },
                      {
                        path: "edit/:purchaseConsumersionId",
                        element: <EditPurchaseConsumersion />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "purchase_wasted",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <PurchaseWasted />,
                      },
                      {
                        path: "add",
                        element: <AddPurchaseWasted />,
                      },
                      {
                        path: "edit/:purchaseWastedId",
                        element: <EditPurchaseWasted />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: "recipe_products",
            children: [
              {
                path: "category",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <PurchaseCategory />,
                      },
                      {
                        path: "add",
                        element: <AddPurchaseCategory />,
                      },
                      {
                        path: "edit/:purchaseCategoryId",
                        element: <EditPurchaseCategory />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "product",
                children: [
                  {
                    path: "",
                    element: <PurchaseProduct />, // Must contain <Outlet /> inside this component
                  },
                  {
                    path: "add",
                    element: <AddPurchaseProduct />,
                  },
                  {
                    path: "edit/:purchaseProductId",
                    element: <EditPurchaseProduct />,
                  },
                  {
                    path: "recipes/:purchaseId",
                    element: <Outlet />, // parent route for recipes
                    children: [
                      {
                        path: "",
                        element: <PurchaseRecipe />,
                      },
                      {
                        path: "add",
                        element: <AddPurchaseRecipe />,
                      },
                      {
                        path: "edit/:recipeId",
                        element: <EditPurchaseRecipe />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: "stock_transfer",
            element: <StockTransfer />,
          },
          {
            path: "material",
            element: <Outlet />,
            children: [
              {
                path: "material_category",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <MaterialCategory />,
                      },
                      {
                        path: "add",
                        element: <AddMaterialCategory />,
                      },
                      {
                        path: "edit/:materialCategoryId",
                        element: <EditMaterialCategory />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "material_products",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <MaterialList />,
                      },
                      {
                        path: "add",
                        element: <AddMaterialList />,
                      },
                      {
                        path: "edit/:materialId",
                        element: <EditMaterialList />,
                      },
                    ],
                  },
                ],
              },
            ],
          },

          {
            path: "manufacturing",
            children: [
              {
                path: "",
                children: [
                  {
                    index: true,
                    element: <ManufacturingHistory />,
                  },
                  {
                    path: "add",
                    element: <AddManufacturing />,
                  },
                ],
              },
            ],
          },

          {
            path: "stock",
            element: <Outlet />,
            children: [
              {
                path: "",
                children: [
                  {
                    path: "stock_list",
                    children: [
                      {
                        index: true,
                        element: <Store />,
                      },
                      {
                        path: "add",
                        element: <AddStore />,
                      },
                      {
                        path: "edit/:storeId",
                        element: <EditStore />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "stock_man",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <StoreMan />,
                      },
                      {
                        path: "add",
                        element: <AddStoreMan />,
                      },
                      {
                        path: "edit/:storeManId",
                        element: <EditStoreMan />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "stock_count",
                element: <StockCount />,
              },
            ],
          },

          {
            path: "inventory",
            element: <Outlet />,
            children: [
              {
                path: "",
                children: [
                  {
                    path: "inventory_products",
                    children: [
                      {
                        index: true,
                        element: <InventoryProduct />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "inventory_materials",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <InventoryMaterial />,
                      },
                    ],
                  },
                ],
              },
            ],
          },

          {
            path: "expenses",
            element: <Outlet />,
            children: [
              {
                path: "expenses_category",
                children: [
                  {
                    path: "",
                    children: [
                      {
                        index: true,
                        element: <ExpensesCategory />,
                      },
                      {
                        path: "add",
                        element: <AddExpensesCategory />,
                      },
                      {
                        path: "edit/:expensesCategoryId",
                        element: <EditExpensesCategory />,
                      },
                    ],
                  },
                ],
              },
              // {
              //   path: 'expenses_list',
              //   children: [
              //     {
              //       path: '',
              //       children: [
              //         {
              //           index: true,
              //           element: <ExpensesList />,
              //         },
              //         {
              //           path: 'add',
              //           element: <AddExpensesList />,
              //         },
              //         {
              //           path: 'edit/:expensesId',
              //           element: <EditExpensesList />
              //         }
              //       ]
              //     },
              //   ]
              // },
              {
                path: "expenses_payment",
                element: <ExpensesPayment />,
              },
            ],
          },

          {
            path: "free_discount",
            element: <FreeDiscount />,
          },

          {
            path: "reports",
            element: <Outlet />,
            children: [
              {
                path: "cashier_report",
                element: <CashierShiftReport />,
              },
              {
                path: "orders_reports",
                element: <OrdersReports />,
              },
              {
                path: "financial_reports",
                element: <FinacialReports />,
              },
              {
                path: "real_time_sales_reports",
                element: <RealTimeSalesReports />,
              },
              {
                path: "product_reports",
                element: <ProductsReports />,
              },
              {
                path: "products_movements",
                element: <ProductsMovements />,
              },
              {
                path: "dine_reports",
                element: <DineReports />,
              },
              {
                path: "invoices_reports",
                element: <InvoicesReports />,
              },
              {
                path: "hall_reports",
                element: <HallReports />,
              },
              {
                path: "cashier_shortage",
                element: <CashierShortage />,
              },
              {
                path: "end_shifts",
                element: <EndShifts />,
              }
            ],
          },

          {
            path: "group_modules",
            children: [
              {
                path: "",
                children: [
                  {
                    index: true,
                    element: <GroupModules />,
                  },
                  {
                    path: "products/:groupId",
                    element: <GroupModuleProducts />,
                  },
                  {
                    path: "add",
                    element: <AddGroupModules />,
                  },
                  {
                    path: "edit/:groupId",
                    element: <EditGroupModules />,
                  },
                  {
                    path: "due/:groupId",
                    element: <DueGroupModule />,
                  },
                ],
              },
            ],
          },
          {
            path: "popup",
            element: <Popup />,
          },
          {
            path: "void_orders",
            element: <VoidList />,
          },
          {
            path: "bundles",
            element: <Outlet />,
            children: [
              {
                index: true,
                element: <Bundles />,
              },
              {
                path: "add",
                element: <AddBundles />,
              },
              {
                path: "edit/:bundleId",
                element: <EditBundles />,
              },
            ]
          },
          {
            path: "social_media",
            children: [
              {
                path: "",
                element: <SocialMedia />,
              },
              {
                path: "add",
                element: <AddSocialMedia />,
              },
              {
                path: "edit/:socialId",
                element: <EditSocialMedia />,
              },
            ],
          },
        ],
      },
    ],
  },

  /* Catch-all for 404 */
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
