// ** React Imports
import { Fragment, lazy } from "react";
import { Navigate } from "react-router-dom";

// ** Layouts
import BlankLayout from "@layouts/BlankLayout";
import VerticalLayout from "@src/layouts/VerticalLayout";
import HorizontalLayout from "@src/layouts/HorizontalLayout";
import LayoutWrapper from "@src/@core/layouts/components/layout-wrapper";

// ** Route Components
import PublicRoute from "@components/routes/PublicRoute";
import PrivateRoute from "@components/routes/PrivateRoute";

// ** Utils
import { isObjEmpty } from "@utils";
import { element } from "prop-types";

const getLayout = {
  blank: <BlankLayout />,
  vertical: <VerticalLayout />,
  horizontal: <HorizontalLayout />,
};

// ** Document title
const TemplateTitle = "%s - Your App Name";

// ** Default Route (Redirect to login by default)
const DefaultRoute = "/login";

// ** Lazy Imports
const Home = lazy(() => import("../../views/Home.js"));
const Login = lazy(() => import("../../views/Login.js"));
const Register = lazy(() => import("../../views/Register.js"));
const ForgotPassword = lazy(() => import("../../views/ForgotPassword.js"));
const Error = lazy(() => import("../../views/Error.js"));
const DeletedRecords = lazy(() => import("../../views/DeletedRecords.js"));
const MineralReport = lazy(() => import("../../views/MineralReport.js"));

const Add_Maktoob = lazy(() =>
  import("../../views/maktoobManagment/addMaktoob/AddNewMaktoob.js")
);
const Add_KhoshKharid = lazy(() => import("../../views/Add_KhoshKharid.js"));
const CompanyTable = lazy(() =>
  import("../../views/companyManagement/CompanyTable.js")
);
const MaktoobTable = lazy(() =>
  import("../../views/maktoobManagment/MaktoobTable.js")
);
const CarTable = lazy(() => import("../../views/carManagement/CarTable.js"));
const ContractSalesTable = lazy(() =>
  import("../../views/contractSalesManagement/ContractSalesTable.js")
);
const UserTable = lazy(() => import("../../views/userManagement/UserTable.js"));
const ScaleTable = lazy(() => import("../../views/scaleManagement/ScaleTable.js"));
const Report = lazy(() => import("../../views/Reports.js"));

// ** Public Routes (no authentication required)
const publicRoutes = ["/login", "/register", "/forgot-password", "/error"];

// ** Route Configuration
const Routes = [
  {
    path: "/",
    index: true,
    element: <Navigate replace to={DefaultRoute} />,
  },
  {
    path: "/home",
    element: <Home />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/company-management",
    element: <CompanyTable />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/vehicles",
    element: <CarTable />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/purchases",
    element: <ContractSalesTable />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    element: <Login />,
    meta: {
      layout: "blank",
      requiresAuth: false,
    },
  },
  {
    path: "/register",
    element: <Register />,
    meta: {
      layout: "blank",
      requiresAuth: false,
    },
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    meta: {
      layout: "blank",
      requiresAuth: false,
    },
  },
  {
    path: "/error",
    element: <Error />,
    meta: {
      layout: "blank",
      requiresAuth: false,
    },
  },
  {
    path: "/maktoob-add",
    element: <Add_Maktoob />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/khosh-kharid",
    element: <Add_KhoshKharid />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/maktoob",
    element: <MaktoobTable />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/users",
    element: <UserTable />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/addscale",
    element: <ScaleTable />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    },
  },
  {
    path: "/deletedrecord",
    element: <DeletedRecords />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    }
  },
   {
    path: "/report",
    element: <Report />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    }
  },
  {
    path: "/mineralreport",
    element: <MineralReport />,
    meta: {
      layout: "vertical",
      requiresAuth: true,
    }
  },

  {
    path: "*",
    element: <Navigate to="/error" replace />,
  },
];

// ** Helper function to get route metadata
const getRouteMeta = (route) => {
  if (isObjEmpty(route.element.props) && route.meta) {
    return { routeMeta: route.meta };
  }
  return {};
};

// ** Merge Layout Routes
const MergeLayoutRoutes = (layout, defaultLayout) => {
  const LayoutRoutes = [];

  if (Routes) {
    Routes.forEach((route) => {
      let isBlank = false;
      
      // ** Checks if Route layout matches current layout
      const routeLayout = route.meta?.layout || defaultLayout;
      if (routeLayout !== layout) return;
      
      // Determine if layout is blank
      isBlank = routeLayout === "blank";
      
      // Determine if route requires authentication
      const requiresAuth = route.meta?.requiresAuth ?? true;
      
      // Choose appropriate route wrapper
      const RouteWrapper = requiresAuth ? PrivateRoute : PublicRoute;
      
      if (route.element) {
        // Choose appropriate layout wrapper
        const LayoutWrapperComponent = !isBlank && isObjEmpty(route.element.props) 
          ? LayoutWrapper 
          : Fragment;
        
        // Wrap the route element
        route.element = (
          <LayoutWrapperComponent {...(!isBlank ? getRouteMeta(route) : {})}>
            <RouteWrapper>
              {route.element}
            </RouteWrapper>
          </LayoutWrapperComponent>
        );
      }

      // Push route to LayoutRoutes (exclude catch-all from layout grouping)
      if (route.path !== "*") {
        LayoutRoutes.push(route);
      }
    });
  }
  return LayoutRoutes;
};

// ** Get all routes for different layouts
const getRoutes = (layout) => {
  const defaultLayout = layout || "vertical";
  const layouts = ["vertical", "horizontal", "blank"];

  const AllRoutes = [];

  layouts.forEach((layoutItem) => {
    const LayoutRoutes = MergeLayoutRoutes(layoutItem, defaultLayout);

    if (LayoutRoutes.length > 0) {
      AllRoutes.push({
        path: "/",
        element: getLayout[layoutItem] || getLayout[defaultLayout],
        children: LayoutRoutes,
      });
    }
  });
  
  // Add catch-all route separately
  const catchAllRoute = Routes.find(route => route.path === "*");
  if (catchAllRoute) {
    AllRoutes.push(catchAllRoute);
  }
  
  return AllRoutes;
};

export { DefaultRoute, TemplateTitle, Routes, getRoutes };