// src/@core/layouts/components/sidebar/HorizontalSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';

// ** Reactstrap Imports
import {
  Nav,
  NavItem,
  NavLink as RSNavLink,
} from 'reactstrap';

// ** Menu Items
import navigation from '../../../../navigation/vertical';

const HorizontalSidebar = () => {
  const renderMenuItems = (items) => {
    return items.map((item) => (
      <NavItem key={item.id} className="nav-item">
        <RSNavLink
          tag={NavLink}
          to={item.navLink}
          className="d-flex align-items-center"
          activeClassName="active"
        >
          {item.icon && React.createElement(item.icon, { size: 16, className: "me-1" })}
          <span className="menu-title text-truncate">{item.title}</span>
        </RSNavLink>
      </NavItem>
    ));
  };

  return (
    <div className="horizontal-menu-wrapper">
      <div className="navbar-header">
        <Nav className="navbar-nav" tag="ul">
          {renderMenuItems(navigation)}
        </Nav>
      </div>
    </div>
  );
};

export default HorizontalSidebar;