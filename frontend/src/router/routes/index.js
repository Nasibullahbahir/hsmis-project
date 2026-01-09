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

// ** Utils
import { isObjEmpty } from "@utils";

const getLayout = {
  blank: <BlankLayout />,
  vertical: <VerticalLayout />,
  horizontal: <HorizontalLayout />,
};

// ** Document title
const TemplateTitle = "%s - Vuexy React Admin Template";

// ** Default Route
const DefaultRoute = "/home";

// ** Lazy Imports
const Home = lazy(() => import("../../views/Home.js"));
const Login = lazy(() => import("../../views/Login.js"));
const Register = lazy(() => import("../../views/Register.js"));
const ForgotPassword = lazy(() => import("../../views/ForgotPassword.js"));
const Error = lazy(() => import("../../views/Error.js"));

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

// ** Merge Routes
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
    },
  },
  {
    path: "/company-management",
    element: <CompanyTable />,
    meta: {
      layout: "vertical",
    },
  },
  {
    path: "/car-management",
    element: <CarTable />,
    meta: {
      layout: "vertical",
    },
  },
  {
    path: "/contract-sales",
    element: <ContractSalesTable />,
    meta: {
      layout: "vertical",
    },
  },
  {
    path: "/login",
    element: <Login />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/register",
    element: <Register />,
    meta: {
      layout: "blank",
    },
  },

  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/error",
    element: <Error />,
    meta: {
      layout: "blank",
    },
  },
  {
    path: "/maktoob-add",
    element: <Add_Maktoob />,
    meta: {
      layout: "vertical",
    },
  },
  {
    path: "/khosh-kharid",
    element: <Add_KhoshKharid />,
    meta: {
      layout: "vertical",
    },
  },

  {
    path: "/maktoob",
    element: <MaktoobTable />,
    meta: {
      layout: "vertical",
    },
  },
  // REMOVED: MaktoobManagment route since the file doesn't exist
];

const getRouteMeta = (route) => {
  if (isObjEmpty(route.element.props)) {
    if (route.meta) {
      return { routeMeta: route.meta };
    } else {
      return {};
    }
  }
};

// ** Return Filtered Array of Routes & Paths
const MergeLayoutRoutes = (layout, defaultLayout) => {
  const LayoutRoutes = [];

  if (Routes) {
    Routes.filter((route) => {
      let isBlank = false;
      // ** Checks if Route layout or Default layout matches current layout
      if (
        (route.meta && route.meta.layout && route.meta.layout === layout) ||
        ((route.meta === undefined || route.meta.layout === undefined) &&
          defaultLayout === layout)
      ) {
        const RouteTag = PublicRoute;

        // ** Check for public or private route
        if (route.meta) {
          route.meta.layout === "blank" ? (isBlank = true) : (isBlank = false);
        }
        if (route.element) {
          const Wrapper =
            // eslint-disable-next-line multiline-ternary
            isObjEmpty(route.element.props) && isBlank === false
              ? // eslint-disable-next-line multiline-ternary
                LayoutWrapper
              : Fragment;

          route.element = (
            <Wrapper {...(isBlank === false ? getRouteMeta(route) : {})}>
              <RouteTag route={route}>{route.element}</RouteTag>
            </Wrapper>
          );
        }

        // Push route to LayoutRoutes
        LayoutRoutes.push(route);
      }
      return LayoutRoutes;
    });
  }
  return LayoutRoutes;
};

const getRoutes = (layout) => {
  const defaultLayout = layout || "vertical";
  const layouts = ["vertical", "horizontal", "blank"];

  const AllRoutes = [];

  layouts.forEach((layoutItem) => {
    const LayoutRoutes = MergeLayoutRoutes(layoutItem, defaultLayout);

    AllRoutes.push({
      path: "/",
      element: getLayout[layoutItem] || getLayout[defaultLayout],
      children: LayoutRoutes,
    });
  });
  return AllRoutes;
};

export { DefaultRoute, TemplateTitle, Routes, getRoutes };
