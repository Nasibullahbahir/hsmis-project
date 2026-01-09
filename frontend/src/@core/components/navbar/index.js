// src/@core/layouts/components/navbar/index.js
import React from 'react';

// ** Reactstrap Imports
import {
  Navbar as ReactstrapNavbar,
  Nav,
  NavItem,
} from 'reactstrap';

// ** Icons
import { Menu, Bell, User, Search } from 'react-feather';

// ** Custom Components
import IntlDropdown from './IntlDropdown';
import { useSidebar } from '../../../../contexts/SidebarContext';

const Navbar = () => {
  const { toggleSidebar, openMobileSidebar } = useSidebar();

  return (
    <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme">
      {/* Mobile Sidebar Toggle */}
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <a className="nav-item nav-link px-0 me-xl-4" onClick={openMobileSidebar}>
          <Menu className="icon icon-md" />
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        {/* Search Bar */}
        <div className="navbar-nav align-items-center">
          <div className="nav-item navbar-search-wrapper mb-0">
            <a className="nav-item nav-link search-toggler px-0">
              <Search className="icon icon-md" />
            </a>
          </div>
        </div>

        <Nav className="navbar-nav align-items-center ms-auto">
          {/* Language Dropdown */}
          <IntlDropdown />

          {/* Notification Dropdown */}
          <NavItem className="nav-item dropdown-notifications navbar-dropdown dropdown me-3 me-xl-1">
            <a className="nav-link dropdown-toggle hide-arrow" href="#">
              <Bell className="icon icon-md" />
              <span className="badge bg-danger rounded-pill badge-notifications">5</span>
            </a>
          </NavItem>

          {/* User Dropdown */}
          <NavItem className="nav-item navbar-dropdown dropdown-user dropdown">
            <a className="nav-link dropdown-toggle hide-arrow" href="#">
              <User className="icon icon-md" />
            </a>
          </NavItem>

          {/* Desktop Sidebar Toggle */}
          <NavItem className="nav-item d-none d-xl-block">
            <a className="nav-link style-switcher-toggle hide-arrow" onClick={toggleSidebar}>
              <Menu className="icon icon-md" />
            </a>
          </NavItem>
        </Nav>
      </div>
    </nav>
  );
};

export default Navbar;