// src/@core/layouts/components/menu/vertical-menu/VerticalNavMenuGroup.js
import React, { useState } from "react";
import classnames from "classnames";
import { useTranslation } from "react-i18next";

// ** Reactstrap Imports
import { NavItem, NavLink as RSNavLink, Collapse } from "reactstrap";

// ** Icons
import { ChevronDown, ChevronRight } from "react-feather";

// ** Components
import VerticalNavMenuItems from "./VerticalNavMenuItems";

const VerticalNavMenuGroup = ({ item, activeItem, setActiveItem, groupOpen, setGroupOpen, menuCollapsed }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ps' || i18n.language === 'dr';

  const [open, setOpen] = useState(groupOpen.includes(item.id));

  // ** Toggle Open Group
  const toggleOpen = () => {
    const arr = groupOpen;
    if (arr.includes(item.id)) {
      arr.splice(arr.indexOf(item.id), 1);
    } else {
      arr.push(item.id);
    }
    setGroupOpen([...arr]);
    setOpen(!open);
  };

  const Icon = item.icon;

  const handleGroupClick = () => {
    toggleOpen();
  };

  return (
    <NavItem
      className={classnames("nav-group", {
        open: open,
      })}
    >
      <RSNavLink
        className="d-flex align-items-center justify-content-between"
        onClick={handleGroupClick}
        style={{
          cursor: 'pointer',
          padding: "0.75rem 1.5rem",
          textAlign: isRTL ? "right" : "left"
        }}
      >
        <div className="d-flex align-items-center">
          {Icon && (
            <Icon 
              className="menu-icon" 
              size={18} 
              style={{ 
                marginRight: isRTL ? "0" : "0.75rem",
                marginLeft: isRTL ? "0.75rem" : "0"
              }} 
            />
          )}
          <span className="menu-title text-truncate">{item.title}</span>
        </div>
        {isRTL ? (
          open ? <ChevronRight size={14} /> : <ChevronDown size={14} />
        ) : (
          open ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        )}
      </RSNavLink>

      <Collapse isOpen={open}>
        <ul className="nav-group-items list-unstyled">
          <VerticalNavMenuItems
            items={item.children}
            groupOpen={groupOpen}
            setGroupOpen={setGroupOpen}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            menuCollapsed={menuCollapsed}
          />
        </ul>
      </Collapse>
    </NavItem>
  );
};

export default VerticalNavMenuGroup;