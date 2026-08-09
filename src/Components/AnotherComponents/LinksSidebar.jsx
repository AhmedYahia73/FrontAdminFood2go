import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/Auth";
import { IoIosArrowForward } from "react-icons/io";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { MdDashboard } from "react-icons/md";
import { ADMIN_MENU_CATEGORIES, adminRoutes, branchRoutes } from "../../Utils/menuStructure";
import { OrderCountsComponent } from "../../Store/CreateSlices";

const LinksSidebar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathName = location.pathname;
  const hideSide = auth.hideSidebar;
  const { t } = useTranslation();

  // Real order counts from /admin/order/count API
  const orderCounts = useSelector((state) => state.orderCounts);

  // Map count keys to actual counts from API
  const counts = useMemo(
    () => ({
      ordersAll: orderCounts?.orders || 0,
      ordersPending: orderCounts?.pending || 0,
      ordersConfirmed: orderCounts?.processing || 0,
      ordersProcessing: orderCounts?.confirmed || 0,
      ordersOutForDelivery: orderCounts?.out_for_delivery || 0,
      ordersDelivered: orderCounts?.delivered || 0,
      ordersReturned: orderCounts?.returned || 0,
      ordersRefund: orderCounts?.refund || 0,
      ordersFailed: orderCounts?.faild_to_deliver || 0,
      ordersCanceled: orderCounts?.canceled || 0,
      ordersSchedule: orderCounts?.scheduled || 0,
    }),
    [orderCounts]
  );

  const [hoveredLink, setHoveredLink] = useState("");
  const [activeLink, setActiveLink] = useState({ name: "", subRoute: "" });

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const [permissions, setPermissions] = useState([]);
  useEffect(() => {
    const rawRoles = auth?.userState?.user_positions?.roles || [];
    const computedPermissions = rawRoles.map((role) => role?.role || role);

    if (computedPermissions.includes("Home") && !computedPermissions.includes("Dashboard")) {
      computedPermissions.push("Dashboard");
    }

    // Ensure "PosReports" role grants access to "Reports" permission (and all its sub-items)
    if (computedPermissions.includes("PosReports") && !computedPermissions.includes("Reports")) {
      computedPermissions.push("Reports");
    }

    setPermissions(computedPermissions);
    // console.log("computedPermissions", computedPermissions);
  }, [auth?.userState?.user_positions?.roles]);


  const currentRoutes = useMemo(() => {
    const routes = isAdmin ? adminRoutes : branchRoutes;
    return routes;
  }, [isAdmin, role]);

  // Handle active link detection
  const findActiveRoute = useCallback(() => {
    // 1. Check for exact subroute matches across all routes
    for (const route of currentRoutes) {
      if (route.subRoutes) {
        // Sort subRoutes by path length descending to match most specific path first
        const sortedSubRoutes = [...route.subRoutes].sort((a, b) => b.path.length - a.path.length);
        const sub = sortedSubRoutes.find((s) => pathName.startsWith(s.path));
        if (sub) {
          return { name: route.name, subRoute: sub.name };
        }
      }
    }

    // 2. Check for route path matches (including prefix matching for deep paths)
    // Sort routes by path length descending to find the most specific match
    const sortedRoutes = [...currentRoutes].sort((a, b) => b.path.length - a.path.length);
    for (const route of sortedRoutes) {
      // For shared roots like /dashboard or /branch, require exact match
      const isRootPath = route.path === "/dashboard" || route.path === "/branch";
      if (isRootPath) {
        if (pathName === route.path) return { name: route.name, subRoute: "" };
        continue;
      }

      // Prefix match for other routes (e.g., /dashboard/branches/...)
      if (pathName.startsWith(route.path)) {
        return { name: route.name, subRoute: "" };
      }
    }

    return { name: "", subRoute: "" };
  }, [pathName, currentRoutes]);

  useEffect(() => {
    setActiveLink(findActiveRoute());
  }, [findActiveRoute]);

  // Navigation handlers
  // Main route click handler
  const handleMainRouteClick = useCallback(
    (e, route) => {
      e.preventDefault(); // Prevent default Link behavior

      const targetPath = route.redirectTo || route.path;

      // Preserve current search params
      const search = location.search;
      const targetUrl = search ? `${targetPath}${search}` : targetPath;

      // Only navigate if the current path is different from the target path
      if (pathName !== targetPath) {
        navigate(targetUrl);
      }
    },
    [navigate, pathName, location.search]
  );

  // Sub route click handler
  const handleSubRouteClick = useCallback(
    (e, subRoute) => {
      e.preventDefault(); // Prevent default Link behavior
      const search = location.search;
      const targetUrl = search ? `${subRoute.path}${search}` : subRoute.path;
      navigate(targetUrl);
    },
    [navigate, location.search]
  );

  // ✅ Main Filtering Logic
  const filteredRoutes = useMemo(() => {
    const isSuperAdmin = auth?.userState?.user_positions?.name === "Super Admin";

    // Non-admin users (like Branch users) see all routes
    if (!isAdmin) return currentRoutes;

    // Get active category from search params
    const searchParams = new URLSearchParams(location.search);
    let activeCategoryId = searchParams.get('category');

    // Auto-detect category if missing from query params
    if (!activeCategoryId || activeCategoryId === 'home') {
      const detected = findActiveRoute();
      if (detected.name) {
        const category = ADMIN_MENU_CATEGORIES.find(c => c.routes.includes(detected.name));
        if (category) {
          activeCategoryId = category.id;
        }
      }
    }

    let routesToFilter = currentRoutes;

    if (activeCategoryId && activeCategoryId !== 'home') {
      const activeCategory = ADMIN_MENU_CATEGORIES.find(c => c.id === activeCategoryId);
      if (activeCategory) {
        routesToFilter = currentRoutes.filter(route =>
          activeCategory.routes.includes(route.name)
        );
      }
    }

    // Filter routes for Admins
    const filtered = routesToFilter
      .map((route) => {
        if (isSuperAdmin) return route;

        // If the route has subroutes, filter them by permission
        if (route.subRoutes) {
          const allowedSubRoutes = route.subRoutes.filter((sub) => {
            // 1. If subroute has specific permission, check it (Overrides parent)
            if (sub.permission) {
              return permissions.includes(sub.permission);
            }
            // 2. If no specific permission, inherit parent permission
            if (route.permission) {
              return permissions.includes(route.permission);
            }
            // 3. If neither have permission, it's public
            return true;
          });

          // ❌ Hide entire route if no allowed subroutes
          if (allowedSubRoutes.length === 0) {
            return null;
          }

          // ✅ Show only the allowed subroutes
          return { ...route, subRoutes: allowedSubRoutes };
        }

        // Normal route (no subRoutes)
        if (!route.permission || permissions.includes(route.permission)) {
          return route;
        }

        return null;
      })
      .filter(Boolean); // Remove null/empty routes

    return filtered;
  }, [permissions, auth?.userState?.user_positions?.name, currentRoutes, isAdmin, location.search]);

  // Render link
  const renderLink = (route) => {
    const isActive = activeLink.name === route.name;
    const isHovered = hoveredLink === route.name;
    const Icon = route.icon;

    return (
      <Link
        key={route.name}
        to={route.redirectTo || route.path}
        onMouseEnter={() => setHoveredLink(route.name)}
        onMouseLeave={() => setHoveredLink("")}
        onClick={(e) => handleMainRouteClick(e, route)}
        className={`
          ${isActive ? "active" : ""}
          ${hideSide ? "justify-between" : "justify-center"}
          hover:rounded-xl pl-2 pr-1 hover:py-2 hover:bg-white
          hover:text-mainColor w-full flex items-center
          transition-all duration-300 group
        `}
      >
        <div className="flex items-center gap-x-2">
          {Icon && <Icon
            className={`${isActive || isHovered ? "text-[#9E090F]" : "text-[#fff]"
              } text-2xl ${route.name === "Delivery Man" ? "text-3xl" : ""}`}
          />}
          <span
            className={`
              ${hideSide ? "block" : "hidden"}
              ${isActive ? "text-mainColor" : "text-white"}
              text-lg font-[400] transition-all duration-300
              group-hover:text-mainColor
            `}
          >
            {t(route.name)}
          </span>
        </div>
        {route.subRoutes && hideSide && (
          <IoIosArrowForward
            className={`
              ${isActive ? "text-mainColor rotate-90" : "text-white rotate-0"}
              text-xl transition-all duration-300 group-hover:text-mainColor
            `}
          />
        )}
      </Link>
    );
  };

  // Render sub-routes
  const renderSubRoute = (sub) => {
    const isSubActive = activeLink.subRoute === sub.name;
    return (
      <Link key={sub.name} to={sub.path} onClick={(e) => handleSubRouteClick(e, sub)}>
        <li
          className={`${isSubActive ? "rounded-xl bg-white text-mainColor" : "text-white"
            } text-xl font-TextFontLight rounded-xl pl-3 pr-2 py-1 flex items-center justify-between hover:bg-white transition-all duration-300 hover:text-mainColor`}
        >
          <span>{t(sub.name)}</span>
          {sub.countKey && (
            <span className="bg-white text-mainColor px-2 rounded-full text-sm font-bold ml-2 transition-all duration-300">
              {counts[sub.countKey] || 0}
            </span>
          )}
        </li>
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-y-4">
      {/* Fetch real-time counts */}
      <OrderCountsComponent />
      {/* Creative "All Modules" Link */}
      {isAdmin && (
        <Link
          to="/dashboard"
          className={`
            flex items-center gap-x-2 p-1 mb-2 rounded-2xl
            bg-white/10 hover:bg-white hover:text-mainColor
            text-white font-bold transition-all duration-300 group
            shadow-sm border border-white/20
          `}
        >
          <MdDashboard className="text-2xl group-hover:scale-110 transition-transform" />
          <span className={`${hideSide ? "block" : "hidden"}`}>
            {t("All Modules")}
          </span>
        </Link>
      )}

      {filteredRoutes.map((route) => (
        <div key={route.name} className="flex flex-col gap-y-1">
          {renderLink(route)}
          {activeLink.name === route.name && route.subRoutes && hideSide && (
            <ul className="flex flex-col gap-y-1 pl-6 mt-1 transition-all duration-300">
              {route.subRoutes.map(renderSubRoute)}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
};

export default LinksSidebar;