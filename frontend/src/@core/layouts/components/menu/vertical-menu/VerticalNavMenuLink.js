// src/@core/layouts/components/menu/vertical-menu/VerticalNavMenuLink.js
import React from "react";
import { NavLink } from "react-router-dom";
import classnames from "classnames";
import { useTranslation } from "react-i18next";

// ** Reactstrap Imports
import { NavItem, NavLink as RSNavLink } from "reactstrap";

const VerticalNavMenuLink = ({ item, activeItem, setActiveItem, menuCollapsed }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ps' || i18n.language === 'dr';

  // ** Conditional Link Tag
  const LinkTag = item.externalLink ? "a" : NavLink;

  // ** Handle Link Click
  const handleLinkClick = () => {
    if (item.navLink && item.navLink.length) {
      setActiveItem(item.navLink);
    }
  };

  const Icon = item.icon;

  return (
    <NavItem
      className={classnames({
        active: activeItem && activeItem === item.navLink,
      })}
      onClick={(e) => {
        handleLinkClick();
      }}
    >
      <RSNavLink
        tag={LinkTag}
        className="d-flex align-items-center"
        target={item.newTab ? "_blank" : undefined}
        {...(item.externalLink === true
          ? {
              href: item.navLink || "/",
            }
          : {
              to: item.navLink || "/",
              className: ({ isActive }) => {
                if (isActive && !item.disabled) {
                  return "active";
                }
              },
            })}
        onClick={(e) => {
          if (
            item.navLink.length === 0 ||
            item.navLink === "#" ||
            item.disabled === true
          ) {
            e.preventDefault();
          }
        }}
        style={{
          padding: "0.75rem 1.5rem",
          textAlign: isRTL ? "right" : "left"
        }}
      >
        {Icon && React.createElement(Icon, {
          size: 14,
          className: "me-75",
          style: { 
            marginRight: isRTL ? "0" : "0.75rem",
            marginLeft: isRTL ? "0.75rem" : "0",
            flexShrink: 0 // Prevent icon from shrinking
          }
        })}
        <span 
          className="menu-item" 
          style={{ 
            whiteSpace: "nowrap",
            overflow: "visible", // Remove overflow hidden
            textOverflow: "clip", // Remove ellipsis
            flex: 1 // Take available space
          }}
        >
          {item.title}
        </span>
      </RSNavLink>
    </NavItem>
  );
};

export default VerticalNavMenuLink;