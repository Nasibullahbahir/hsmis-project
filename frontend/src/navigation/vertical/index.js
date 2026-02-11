// vertical/index.js
import { useTranslation } from "react-i18next";
import {
  Home,
  Briefcase,
  Info,
  CheckSquare,
  Truck,
  FileText,
  Users,
  Trash,
  Trash2,
} from "react-feather";

export const useVerticalNavigation = () => {
  const { t } = useTranslation();

  return [
    //     {
    //   id: "add-weight",
    //   title: t("navigation.addWeight"),
    //   icon: Plus, // You'll need to import Plus from react-feather
    //   navLink: "/add-weight",
    //   className: "nav-link",
    // },
    {
      id: "add-weight",

      title: t("navigation.addWeight"),
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
    {
      id: "user",
      title: t("navigation.user"),
      icon: Users,
      navLink: "/users",
      className: "nav-link",
    },
    {
      id: "maktoob",
      title: t("navigation.maktoob"),
      icon: FileText,
      navLink: "/maktoob",
      className: "nav-link",
    },
    {
      id: "purchases",
      title: t("navigation.contract_info"),
      icon: Briefcase,
      navLink: "/purchases",
      className: "nav-link",
    },
    {
      id: "addscale",
      title: t("navigation.addscale"),
      icon: Briefcase,
      navLink: "/addscale",
      className: "nav-link",
    },
    {
      id: "deletedrecord",
      title: t("delete_recored"),
      icon: Trash2,
      navLink: "/deletedrecord",
      className: "nav-link",
    },
    {
      id: "report",
      title: t("report"),
      icon: Trash2,
      navLink: "/report",
      className: "nav-link",
    },
       {
      id: "mineralreport",
      title: t("mineralreport"),
      icon: Trash2,
      navLink: "/mineralreport",
      className: "nav-link",
    },
  ];
};

export default useVerticalNavigation;
