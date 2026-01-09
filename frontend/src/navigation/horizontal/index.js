import { Briefcase, Home, Info, FileText } from "react-feather";
import { useTranslation } from "react-i18next";

// Centralized configuration
const NAVIGATION_CONFIG = [
  {
    id: "home",
    icon: Home,
    navLink: "/home",
  },
  {
    id: "secondPage", 
    icon: Info,
    navLink: "/second-page",
  },
  {
    id: "company_add",
    icon: Briefcase,
    navLink: "/company_add",
  },
  {
    id: "addMaktoob",
    icon: FileText,
    navLink: "/add-maktoob",
  },
  {
    id: "maktoob",
    icon: FileText, 
    navLink: "/maktoob",
  },
];

// Hook for React components
export const useHorizontalNavigation = () => {
  const { t } = useTranslation();
  
  return NAVIGATION_CONFIG.map(item => ({
    ...item,
    title: t(`navigation.${item.id}`),
    icon: <item.icon size={item.id === "home" ? 20 : 18} />
  }));
};

// Static version for non-React contexts
export const getHorizontalNavigation = (t) => {
  return NAVIGATION_CONFIG.map(item => ({
    ...item,
    title: t(`navigation.${item.id}`),
    icon: <item.icon size={item.id === "home" ? 20 : 18} />
  }));
};

// Default export for backward compatibility
const horizontalNavigation = [
  {
    id: "home",
    title: "اصلی پاڼه",
    icon: <Home size={20} />,
    navLink: "/home",
  },
  {
    id: "secondPage",
    title: "د معلوماتو ثبتول", 
    icon: <Info size={18} />,
    navLink: "/second-page",
  },
  {
    id: "company_add",
    title: "د نوی کمپنی ثبت کول",
    icon: <Briefcase size={18} />,
    navLink: "/company_add",
  },
  {
    id: "maktoob",
    title: "د مکتوب مدیریت",
    icon: <FileText size={18} />,
    navLink: "/maktoob",
  },
];

export default horizontalNavigation;