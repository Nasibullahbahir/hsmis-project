// ** React Imports
import { Fragment } from "react";

// ** Custom Components
import NavbarUser from "./NavbarUser";
import IntlDropdown from "./IntlDropdown";

// ** Third Party Components
import { Sun, Moon, Menu } from "react-feather";

import { useTranslation } from "react-i18next";

// ** Reactstrap Imports
import { NavItem, NavLink } from "reactstrap";

const ThemeNavbar = ({ skin, setSkin, setMenuVisibility }) => {
  const { t } = useTranslation();
  // ** Function to toggle Theme (Light/Dark)
  const ThemeToggler = () => {
    if (skin === "dark") {
      return <Sun className="ficon" onClick={() => setSkin("light")} />;
    } else {
      return <Moon className="ficon" onClick={() => setSkin("dark")} />;
    }
  };

  return (
    <Fragment>
      {/* Left Side: Mobile Menu & Theme Toggler */}
      <div
        className="bookmark-wrapper d-flex align-items-center"
        style={{ height: "50px" }}
      >
        <ul className="navbar-nav d-xl-none">
          <NavItem className="mobile-menu me-auto">
            <NavLink
              className="nav-menu-main menu-toggle hidden-xs is-active"
              onClick={() => setMenuVisibility(true)}
            >
              <Menu className="ficon" />
            </NavLink>
          </NavItem>
        </ul>
        <NavItem className="d-none d-lg-block">
          <NavLink className="nav-link-style">
            <ThemeToggler />
          </NavLink>
        </NavItem>
      </div>

      {/* Middle: Title */}
      <div className="bookmark-wrapper d-flex align-items-center justify-content-center w-100">
        <span
          className="navbar-middle-text"
          style={{
            fontSize: "14px",
            fontWeight: 500,
            textAlign: "center",
            color: "#000",
          }}
        >
          {/* <h3>
           {t("title")} <br />
          {t("subtitle")}
          </h3> */}
        </span>
      </div>

      {/* Right Side: Language Dropdown & User Profile */}
      <div className="bookmark-wrapper d-flex align-items-center justify-content-end">
        <IntlDropdown />
        <NavbarUser skin={skin} setSkin={setSkin} />
      </div>
    </Fragment>
  );
};

export default ThemeNavbar;
