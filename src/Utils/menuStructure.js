import {
    RiHome2Line,
    RiVipDiamondLine,
    RiExchange2Fill,
    RiHome2Line as HomeIcon // Alias for branchRoutes
} from "react-icons/ri";
import { IoBagAddOutline, IoReceiptSharp, IoLanguage, IoBagAddOutline as OrderIcon } from "react-icons/io5";
import {
    MdDeliveryDining,
    MdNoFood,
    MdPriceChange,
    MdOutlinePayments,
    MdOutlineSettingsInputComposite,
    MdDashboard,
    MdDynamicFeed,
    MdDiscount,
    MdDeliveryDining as MdDeliveryDiningIcon,
    MdTableRestaurant
} from "react-icons/md";
import { TbCategory, TbReportSearch, TbBasketDiscount, TbBorderAll, TbSocial } from "react-icons/tb";
import { FiPackage, FiUsers } from "react-icons/fi";
import { PiFlagBanner, PiBaseballCap, PiClockUserFill, PiSlideshowFill } from "react-icons/pi";
import { HiReceiptTax } from "react-icons/hi";
import { GiCaptainHatProfile, GiUpgrade, GiTeamIdea, GiManualMeatGrinder } from "react-icons/gi";
import { FaCashRegister, FaUsersCog, FaShoppingBasket } from "react-icons/fa";
import { FaReceipt } from "react-icons/fa6";
import { IoMdGitBranch } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { BiSolidCoupon, BiSolidOffer, BiSolidDiscount, BiSolidEnvelope, BiSolidPurchaseTagAlt } from "react-icons/bi";
import { GrBundle } from "react-icons/gr";
import { SiMaterialformkdocs } from "react-icons/si";
import { LuBanknote } from "react-icons/lu";

// Admin routes configuration
export const adminRoutes = [
    {
        name: "Dashboard",
        path: "/dashboard/home-overview",
        permission: "Dashboard",
        icon: RiHome2Line,
    },
    // --- Order Management ---
    {
        name: "Online Orders",
        path: "/dashboard/orders",
        permission: "Order",
        icon: IoBagAddOutline,
        subRoutes: [
            { name: "All", path: "/dashboard/orders/all", countKey: "ordersAll" },
            { name: "Pending", path: "/dashboard/orders/pending", countKey: "ordersPending" },
            { name: "Accept", path: "/dashboard/orders/confirmed", countKey: "ordersConfirmed" },
            { name: "Processing", path: "/dashboard/orders/processing", countKey: "ordersProcessing" },
            { name: "OutForDelivery", path: "/dashboard/orders/out_for_delivery", countKey: "ordersOutForDelivery" },
            { name: "Delivered", path: "/dashboard/orders/delivered", countKey: "ordersDelivered" },
            { name: "Returned", path: "/dashboard/orders/returned", countKey: "ordersReturned" },
            { name: "Refund", path: "/dashboard/orders/refund", countKey: "ordersRefund" },
            { name: "FailedToDeliver", path: "/dashboard/orders/failed", countKey: "ordersFailed" },
            { name: "Canceled", path: "/dashboard/orders/canceled", countKey: "ordersCanceled" },
            { name: "Log", path: "/dashboard/orders/log" },
        ],
        redirectTo: "/dashboard/orders/all",
    },
    {
        name: "Dine Orders",
        path: "/dashboard/orders/dine_orders",
        permission: "Order",
        icon: MdTableRestaurant,
    },
    {
        name: "Delivery Orders",
        path: "/dashboard/all_orders_delivery",
        permission: "Order",
        icon: MdDeliveryDining,
    },
    {
        name: "Void Orders",
        path: "/dashboard/void_orders",
        permission: "VoidOrders",
        icon: MdNoFood,
    },
    {
        name: "Orders Payment",
        path: "/dashboard/orders_payment",
        permission: "Payments",
        icon: MdOutlinePayments,
    },
    {
        name: "Buy Offer",
        path: "/dashboard/buy_offer",
        permission: "OfferOrder",
        icon: BiSolidOffer,
    },
    {
        name: "Deal Order",
        path: "/dashboard/deal_order",
        permission: "DealOrder",
        icon: TbReportSearch,
    },
    // --- Products / Menu Management ---
    {
        name: "Category Setup",
        path: "/dashboard/category",
        permission: "Category",
        icon: TbCategory,
    },
    {
        name: "Product",
        path: "/dashboard/setup_product/product",
        permission: "Product",
        icon: FiPackage,
    },
    {
        name: "Product Pricing",
        path: "/dashboard/setup_product/pricing_product",
        permission: "Product",
        icon: MdPriceChange,
    },
    {
        name: "Addons",
        path: "/dashboard/addons",
        permission: "Addons",
        icon: RiVipDiamondLine,
    },
    {
        name: "Upselling",
        path: "/dashboard/upselling",
        permission: "Upselling",
        icon: GiUpgrade,
    },
    {
        name: "Menu",
        path: "/dashboard/setting/menu",
        permission: "Menue",
        icon: RiVipDiamondLine,
    },
    {
        name: "Extra Groups",
        path: "/dashboard/setting/groups",
        permission: "Extra",
        icon: MdOutlineSettingsInputComposite,
    },
    {
        name: "Group Modules",
        path: "/dashboard/group_modules",
        permission: "GroupModules",
        icon: TbBorderAll,
    },
    // --- Inventory & Supply chain ---
    {
        name: "Stock",
        path: "/dashboard/stock",
        permission: "Stock",
        icon: FaShoppingBasket,
        subRoutes: [
            { name: "Purchase Stock", path: "/dashboard/stock/stock_list", permission: "Stock" },
            { name: "Stock Count", path: "/dashboard/stock/stock_count", permission: "Stock" },
        ],
        redirectTo: "/dashboard/stock/stock_list",
    },
    {
        name: "Transfer Stock",
        path: "/dashboard/stock_transfer",
        permission: "Stock",
        icon: RiExchange2Fill,
    },
    {
        name: "Inventory",
        path: "/dashboard/inventory",
        permission: "inventory",
        icon: TbReportSearch,
        subRoutes: [
            { name: "Product Inventory", path: "/dashboard/inventory/inventory_products", permission: "inventory" },
            { name: "Raw Material Inventory", path: "/dashboard/inventory/inventory_materials", permission: "inventory" },
        ],
        redirectTo: "/dashboard/inventory/inventory_products",
    },
    {
        name: "Raw Material",
        path: "/dashboard/material",
        permission: "material",
        icon: SiMaterialformkdocs,
        subRoutes: [
            { name: "Raw Material Category", path: "/dashboard/material/material_category", permission: "material" },
            { name: "Raw Material Product", path: "/dashboard/material/material_products", permission: "material" },
        ],
        redirectTo: "/dashboard/material/material_category",
    },
    {
        name: "Recipe",
        path: "/dashboard/recipe_products",
        permission: "recipe",
        icon: FaReceipt,
        subRoutes: [
            { name: "Recipe Category", path: "/dashboard/recipe_products/category", permission: "recipe" },
            { name: "Recipe Product", path: "/dashboard/recipe_products/product", permission: "recipe" },
        ],
        redirectTo: "/dashboard/recipe_products/category",
    },
    {
        name: "Manufacturing",
        path: "/dashboard/manufacturing",
        permission: "manufacturing",
        icon: GiManualMeatGrinder,
    },
    {
        name: "Purchase",
        path: "/dashboard/purchase",
        permission: "purchase",
        icon: BiSolidPurchaseTagAlt,
        subRoutes: [
            { name: "Purchase List", path: "/dashboard/purchase/purchase_list", permission: "purchase" },
            { name: "Consumption", path: "/dashboard/purchase/purchase_consumption", permission: "purchase" },
            { name: "Wasted", path: "/dashboard/purchase/purchase_wasted", permission: "purchase" },
        ],
        redirectTo: "/dashboard/purchase/purchase_list",
    },
    // --- Branches ---
    {
        name: "Branches",
        path: "/dashboard/branches",
        permission: "Branch",
        icon: IoMdGitBranch,
    },
    {
        name: "Cities",
        path: "/dashboard/setting/cities",
        permission: "City",
        icon: TbCategory,
    },
    {
        name: "Zones",
        path: "/dashboard/setting/zones",
        permission: "Zone",
        icon: PiFlagBanner,
    },
    {
        name: "Hall",
        path: "/dashboard/setting/hall_locations",
        permission: "Hall",
        icon: RiHome2Line,
    },
    {
        name: "Tables",
        path: "/dashboard/setting/hall_tables",
        permission: "Tables",
        icon: TbBorderAll,
    },
    {
        name: "Cashier",
        path: "/dashboard/cashier",
        permission: "Cashier",
        icon: FaCashRegister,
    },
    // --- Staff ---
    {
        name: "Delivery Man",
        path: "/dashboard/delivery_man",
        permission: "Delivery",
        icon: GiCaptainHatProfile,
    },
    {
        name: "Stock Man",
        path: "/dashboard/stock/stock_man",
        permission: "StockMan",
        icon: FaUsersCog,
    },
    {
        name: "Cashier Man",
        path: "/dashboard/cashier_man",
        permission: "CashierMan",
        icon: FaUsersCog,
    },
    {
        name: "Waiter",
        path: "/dashboard/waiter",
        permission: "Waiter",
        icon: PiClockUserFill,
    },
    {
        name: "Captain Order",
        path: "/dashboard/captain_order",
        permission: "captainOrder",
        icon: PiBaseballCap,
    },
    {
        name: "Admin",
        path: "/dashboard/users/admins",
        permission: "Admin",
        icon: FiUsers,
    },
    {
        name: "Admin Roles",
        path: "/dashboard/setting/roles",
        permission: "AdminRoles",
        icon: FaUsersCog,
    },
    // --- Customers ---
    {
        name: "Customers List",
        path: "/dashboard/users/customers",
        permission: "Customer",
        icon: FiUsers,
    },
    {
        name: "Due Customer",
        path: "/dashboard/users/due_customers",
        permission: "Customer",
        icon: FiUsers,
    },
    {
        name: "Deleted Customer",
        path: "/dashboard/users/deleted_customers",
        permission: "Customer",
        icon: FiUsers,
    },
    // --- Financials ---
    {
        name: "Taxes",
        path: "/dashboard/taxes",
        permission: "Setting",
        icon: HiReceiptTax,
        subRoutes: [
            { name: "All Taxes", path: "/dashboard/taxes/all_taxes" },
            { name: "Tax Type", path: "/dashboard/taxes/tax_type" },
        ],
        redirectTo: "/dashboard/taxes/all_taxes",
    },
    {
        name: "Expenses",
        path: "/dashboard/expenses",
        permission: "expenses",
        icon: LuBanknote,
        subRoutes: [
            { name: "Expenses Category", path: "/dashboard/expenses/expenses_category", permission: "expenses" },
            { name: "Expenses Payment", path: "/dashboard/expenses/expenses_payment", permission: "expenses" },
        ],
        redirectTo: "/dashboard/expenses/expenses_category",
    },
    {
        name: "Financial Setup",
        path: "/dashboard/setting",
        permission: "Setting",
        icon: MdOutlineSettingsInputComposite,
        subRoutes: [
            { name: "Payment Method", path: "/dashboard/setting/payment_method", permission: "PaymentMethod" },
            { name: "Financial Account", path: "/dashboard/setting/financial_account", permission: "FinancialAccount" },
        ],
        redirectTo: "/dashboard/setting/payment_method",
    },
    {
        name: "Auto payments",
        path: "/dashboard/setting/automatic_payment",
        permission: "AutomaticPayment",
        icon: MdOutlinePayments,
    },
    {
        name: "Service Fees",
        path: "/dashboard/service_fees",
        permission: "service_fees",
        icon: MdDynamicFeed,
    },
    // --- Marketing ---
    {
        name: "Marketing",
        path: "/dashboard/deals",
        permission: "Deal",
        icon: GiTeamIdea,
        subRoutes: [
            { name: "Product Offers", path: "/dashboard/product_offers", permission: "Product" },
            { name: "Deals", path: "/dashboard/deals", permission: "Deal" },
            { name: "Offers", path: "/dashboard/offers", permission: "PointOffers" },
            { name: "Coupon", path: "/dashboard/coupon", permission: "Coupon" },
            { name: "Popup", path: "/dashboard/popup", permission: "Popup" },
            { name: "Bundles", path: "/dashboard/bundles", permission: "Bundles" },
            { name: "Emails", path: "/dashboard/emails", permission: "Email" },
            { name: "Social Media", path: "/dashboard/social_media", permission: "SocialMedia" },
            { name: "Banners", path: "/dashboard/banners", permission: "Banner" },
            { name: "Discount", path: "/dashboard/discount", permission: "Discount" },
            { name: "Discount Module", path: "/dashboard/discount_module", permission: "DiscountModule" },
            { name: "Discount Code", path: "/dashboard/discount_code", permission: "DiscountCode" },
            { name: "Free Discount", path: "/dashboard/free_discount", permission: "FreeDiscount" },
        ],
    },
    // --- Other ---
    {
        name: "Reports",
        path: "/dashboard/reports",
        permission: "Reports",
        icon: TbReportSearch,
        subRoutes: [
            { name: "Cashier Report", path: "/dashboard/reports/cashier_report" },
            { name: "Orders Reports", path: "/dashboard/reports/orders_reports" },
            { name: "Financial Reports", path: "/dashboard/reports/financial_reports" },
            { name: "Real Time Sales Reports", path: "/dashboard/reports/real_time_sales_reports" },
            { name: "Product Reports", path: "/dashboard/reports/product_reports" },
            { name: "Dine Reports", path: "/dashboard/reports/dine_reports" },
            { name: "Invoices Reports", path: "/dashboard/reports/invoices_reports" },
            { name: "Products Movements", path: "/dashboard/reports/products_movements" },
            { name: "Hall Reports", path: "/dashboard/reports/hall_reports" },
            { name: "Cashier Shortage", path: "/dashboard/reports/cashier_shortage" },
            { name: "End Shifts", path: "/dashboard/reports/end_shifts" },
        ],
        redirectTo: "/dashboard/reports/cashier_report",
    },
    {
        name: "Setting",
        path: "/dashboard/setting",
        permission: "Settings",
        icon: CiSettings,
        subRoutes: [
            { name: "Policy & Support", path: "/dashboard/setting/policy_support", permission: "PolicySupport" },
            { name: "Cancellation Notification", path: "/dashboard/setting/notification", permission: "Notification" },
            { name: "Sound", path: "/dashboard/setting/sound", permission: "Sound" },
            { name: "Order type", path: "/dashboard/setting/order_type", permission: "OrderType" },
            { name: "Notifications", path: "/dashboard/setting/notification", permission: "notification" },
            { name: "Void reasons", path: "/dashboard/setting/void_reason", permission: "VoidReason" },
            { name: "Schedule time", path: "/dashboard/setting/schedule_time", permission: "ScheduleTime" },
            { name: "Cancel time", path: "/dashboard/setting/cancel_time", permission: "CancelTime" },
            { name: "Delivery time", path: "/dashboard/setting/delivery_time", permission: "DeliveryTime" },
            { name: "Receipt design", path: "/dashboard/setting/receipt_design", permission: "receipt_design" },
            { name: "Language", path: "/dashboard/setting/languages", permission: "Settings" },
            { name: "Language system", path: "/dashboard/setting/language_system", permission: "Settings" },
            { name: "Restaurant time", path: "/dashboard/setting/resturant_time", permission: "ResturantTime" },
            { name: "Fake orders", path: "/dashboard/setting/fake_order", permission: "FakeOrder" },
            { name: "Orders percentage", path: "/dashboard/setting/order_percentage", permission: "OrderPercentage" },
            { name: "App setup", path: "/dashboard/setting/app_setup", permission: "AppSetup" },
            { name: "Business Setup", path: "/dashboard/setting/business_setup/business_settings", permission: "CustomerLogin" },
        ],
        redirectTo: "/dashboard/setting/order_type",
    }
];

// Branch routes configuration
export const branchRoutes = [
    {
        name: "Home",
        path: "/branch",
        permission: "Home",
        icon: HomeIcon,
    },
    {
        name: "Online Orders",
        path: "/branch/orders",
        permission: "Order",
        icon: OrderIcon,
        subRoutes: [
            { name: "All", path: "/branch/orders/all", countKey: "ordersAll" },
            { name: "Pending", path: "/branch/orders/pending", countKey: "ordersPending" },
            { name: "Accept", path: "/branch/orders/confirmed", countKey: "ordersConfirmed" },
            { name: "Processing", path: "/branch/orders/processing", countKey: "ordersProcessing" },
            { name: "OutForDelivery", path: "/branch/orders/out_for_delivery", countKey: "ordersOutForDelivery" },
            { name: "Delivered", path: "/branch/orders/delivered", countKey: "ordersDelivered" },
            { name: "Returned", path: "/branch/orders/returned", countKey: "ordersReturned" },
            { name: "Refund", path: "/branch/orders/refund", countKey: "ordersRefund" },
            { name: "FailedToDeliver", path: "/branch/orders/failed", countKey: "ordersFailed" },
            { name: "Canceled", path: "/branch/orders/canceled", countKey: "ordersCanceled" },
            { name: "Log", path: "/branch/orders/log" },
        ],
        redirectTo: "/branch/orders/all",
    },
    {
        name: "Category Setup",
        path: "/branch/category",
        permission: "Category",
        icon: TbCategory,
    },
    {
        name: "Product",
        path: "/branch/setup_product/product",
        permission: "Product",
        icon: FiPackage,
    },
    {
        name: "Branches Deal",
        path: "/branch/deals",
        permission: "Branch",
        icon: TbReportSearch,
    },
    {
        name: "Customers",
        path: "/branch/customer",
        permission: "Customer",
        icon: FiUsers,
    },
    {
        name: "Order Offers",
        path: "/branch/order-offers",
        permission: "OfferOrder",
        icon: BiSolidOffer,
    },
    {
        name: "Cashier",
        path: "/branch/cashier",
        permission: "Cashier",
        icon: FiUsers,
    },
    {
        name: "Cashier Man",
        path: "/branch/cashier_man",
        permission: "CashierMan",
        icon: FiUsers,
    },
    {
        name: "Delivery Man",
        path: "/branch/delivery_man",
        permission: "DeliveryMan",
        icon: FiUsers,
    },
    {
        name: "Financial Account",
        path: "/branch/financial_account",
        permission: "FinancialAccount",
        icon: FiUsers,
    },
    {
        name: "Expenses",
        path: "/dashboard/expenses",
        permission: "expenses",
        icon: LuBanknote,
        subRoutes: [
            { name: "Expenses Category", path: "/dashboard/expenses/expenses_category", permission: "expenses" },
            { name: "Expenses Payment", path: "/dashboard/expenses/expenses_payment", permission: "expenses" },
        ],
        redirectTo: "/dashboard/expenses/expenses_category",
    },
];

export const ADMIN_MENU_CATEGORIES = [
    // {
    //     id: "home",
    //     name: "Home",
    //     description: "Access all modules and lists",
    //     icon: RiHome2Line,
    //     routes: ["Home"],
    // },
    {
        id: "dashboard",
        name: "Dashboard",
        description: "Statistics and overview",
        icon: MdDashboard,
        routes: ["Dashboard"],
    },
    {
        id: "order_management",
        name: "Order management",
        description: "Manage online, delivery, and void orders",
        icon: IoBagAddOutline,
        routes: [
            "Online Orders",
            "Delivery Orders",
            "Void Orders",
            "Orders Payment",
            "Buy Offer",
            "Deal Order",
            "Dine Orders",
        ],
    },
    {
        id: "menu_management",
        name: "ProductsManagement",
        description: "Setup categories, products, pricing, and recipes",
        icon: TbCategory,
        routes: [
            "Product",
            "Category Setup",
            "Product Pricing",
            "Addons",
            "Upselling",
            "Menu",
            "Extra Groups",
            "Group Modules",
        ],
    },
    {
        id: "inventory_supply",
        name: "Inventory & Supply chain",
        description: "Manage stock, inventory, and manufacturing",
        icon: FaShoppingBasket,
        routes: [
            "Stock",
            "Transfer Stock",
            "Inventory",
            "Manufacturing",
            "Purchase",
            "Recipe",
            "Raw Material",
        ],
    },
    {
        id: "branches",
        name: "Branches",
        description: "Setup branches, cities, zones, and tables",
        icon: IoMdGitBranch,
        routes: [
            "Branches",
            "Cities",
            "Zones",
            "Hall",
            "Tables",
            "Cashier",
        ],
    },
    {
        id: "staff",
        name: "Staff",
        description: "Manage delivery men, stock men, and admins",
        icon: FiUsers,
        routes: [
            "Delivery Man",
            "Stock Man",
            "Cashier Man",
            "Waiter",
            "Captain Order",
            "Admin",
            "Admin Roles",
        ],
    },
    {
        id: "customers",
        name: "Customers",
        description: "User list and management",
        icon: FiUsers,
        routes: [
            "Customers List",
            "Due Customer",
            "Deleted Customer",
        ],
    },
    {
        id: "financials",
        name: "Financials",
        description: "Taxes, expenses, and payment methods",
        icon: LuBanknote,
        routes: [
            "Taxes",
            "Expenses",
            "Financial Setup",
            "Auto payments",
            "Service Fees",
        ],
    },
    {
        id: "marketing",
        name: "Marketing",
        description: "Deals, offers, coupons, product offers and more",
        icon: GiTeamIdea,
        routes: ["Marketing"],
    },
    {
        id: "reports",
        name: "Reports",
        description: "Analytical reports and insights",
        icon: TbReportSearch,
        routes: ["Reports"],
    },
    {
        id: "settings",
        name: "Settings",
        description: "App configuration",
        icon: CiSettings,
        routes: ["Setting"],
    },
];
