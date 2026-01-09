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
    // {
    //   id: "khosh_kharid",
    //   title: t("navigation.contract_info"),
    //   icon: CheckSquare,
    //   navLink: "/khosh-kharid",
    //   className: "nav-link",
    // },
    {
      id: "car_management", // FIXED: Changed from "add_car" to "car_management"
      title: t("navigation.car_management"), // Update translation key
      icon: Truck,
      navLink: "/car-management", // FIXED: Point to car-management route
      className: "nav-link",
    },
    // {
    //   id: "maktoob",
    //   title: t("navigation.maktoob"),
    //   icon: FileText,
    //   navLink: "/maktoob",
    //   className: "nav-link",
    // },
  ];
};

export default useVerticalNavigation;
