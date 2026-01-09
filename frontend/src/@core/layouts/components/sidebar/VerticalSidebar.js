// src/@core/layouts/components/sidebar/VerticalSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';

// ** Reactstrap Imports
import {
  Nav,
  NavItem,
  NavLink as RSNavLink,
} from 'reactstrap';

// ** Menu Items
import navigation from '../../../../navigation/vertical';

const VerticalSidebar = () => {
  const renderMenuItems = (items) => {
    return items.map((item) => (
      <NavItem key={item.id} className="nav-item">
        <RSNavLink
          tag={NavLink}
          to={item.navLink}
          className="d-flex align-items-center"
          activeClassName="active"
          style={{ 
            padding: '0.75rem 1.5rem',
            color: '#6e6b7b',
            textDecoration: 'none'
          }}
        >
          {item.icon && React.createElement(item.icon, { size: 16, className: "me-2" })}
          <span className="menu-title text-truncate">{item.title}</span>
        </RSNavLink>
      </NavItem>
    ));
  };

  return (
    <div className="main-menu menu-fixed menu-accordion menu-shadow">
      {/* Sidebar Header */}
      <div className="navbar-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #ddd' }}>
        <NavLink to="/" className="navbar-brand d-flex align-items-center">
          <span className="brand-logo me-2">
            <svg viewBox="0 0 139 95" version="1.1" height="28">
              <defs>
                <linearGradient x1="100%" y1="10.512%" x2="50%" y2="89.488%" id="linearGradient-1">
                  <stop stopColor="#000000" offset="0%"></stop>
                  <stop stopColor="#FFFFFF" offset="100%"></stop>
                </linearGradient>
              </defs>
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g transform="translate(-400.000000, -178.000000)">
                  <g transform="translate(400.000000, 178.000000)">
                    <path
                      className="text-primary"
                      d="M-5.68434189e-14,2.84217094e-14 L39.1816085,2.84217094e-14 L69.3453773,32.2519224 L101.428699,2.84217094e-14 L138.784583,2.84217094e-14 L138.784199,29.8015838 C137.931931,37.3510206 135.718352,42.5567762 132.260155,45.4188507 C128.804057,48.2809251 112.33867,64.5239941 83.0667527,94.1480575 L56.2750821,94.1480575 L6.71554594,44.4188507 C2.46876683,39.9813776 0.345377275,35.1089553 0.345377275,29.8015838 C0.345377275,24.4942122 0.230251516,14.560351 -5.68434189e-14,2.84217094e-14 Z"
                      style={{ fill: 'currentColor' }}
                    ></path>
                    <path
                      d="M69.3453773,32.2519224 L101.428699,1.42108547e-14 L138.784583,1.42108547e-14 L138.784199,29.8015838 C137.931931,37.3510206 135.718352,42.5567762 132.260155,45.4188507 C128.804057,48.2809251 112.33867,64.5239941 83.0667527,94.1480575 L56.2750821,94.1480575 L32.8435758,70.5039241 L69.3453773,32.2519224 Z"
                      fill="url(#linearGradient-1)"
                      opacity="0.2"
                    ></path>
                  </g>
                </g>
              </g>
            </svg>
          </span>
          <h2 className="brand-text mb-0" style={{ fontSize: '1.2rem', fontWeight: '600' }}>
            د مدیریت سیستم
          </h2>
        </NavLink>
      </div>

      {/* Menu Items */}
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <Nav className="navigation navigation-main" tag="ul" style={{ padding: 0 }}>
          {renderMenuItems(navigation)}
        </Nav>
      </PerfectScrollbar>
    </div>
  );
};

export default VerticalSidebar;