// vertical/index.js
import { useTranslation } from "react-i18next";
import {
  Home,
  Briefcase,
  Info,
  CheckSquare,
  Truck,
  FileText,
} from "react-feather";

export const useVerticalNavigation = () => {
  const { t } = useTranslation();

  return [
    {
      id: "home",
      title: t("navigation.home"),
      icon: Home,
      navLink: "/home",
      className: "nav-link",
    },
    {
      id: "company-management",
      title: t("navigation.company-management"),
      icon: Info,
      navLink: "/company-management",
      className: "nav-link",
    },
   
    {
      id: "car_management", 
      title: t("navigation.car_management"),
      icon: Truck,
      navLink: "/vehicles",
      className: "nav-link",
    },
    //  {
    //   id: "vechicles", 
    //   title: t("navigation.vehicles"),
    //   icon: Truck,
    //   navLink: "/vechicles",
    //   className: "nav-link",
    // }
    
  ];
};

export default useVerticalNavigation;
