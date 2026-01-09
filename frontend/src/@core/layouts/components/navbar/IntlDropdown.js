// src/@core/layouts/components/navbar/IntlDropdown.js
// import React, { useState } from "react";

// ** Third Party Components
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";

// ** Reactstrap Imports
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from "reactstrap";

const IntlDropdown = () => {
  const { i18n } = useTranslation();

  // ** Language Mapping
  const languages = {
    en: { name: "English", countryCode: "US" },
    ps: { name: "پښتو", countryCode: "AF" },
    dr: { name: "دری", countryCode: "AF" },
  };

  // ** Function to switch Language
  const handleLangUpdate = (e, lang) => {
    e.preventDefault();
    i18n.changeLanguage(lang);

    // Update document direction for RTL/LTR support
    const direction = lang === "en" ? "ltr" : "rtl";
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", lang);
  };

  return (
    <UncontrolledDropdown tag="li" className="dropdown-language nav-item">
      <DropdownToggle
        tag="a"
        className="nav-link"
        onClick={(e) => e.preventDefault()}
      >
        <ReactCountryFlag
          svg
          className="country-flag flag-icon"
          countryCode={languages[i18n.language]?.countryCode || "US"}
          style={{
            fontSize: "1.25rem",
            lineHeight: "1.25rem",
          }}
        />
        <span className="selected-language">
          {languages[i18n.language]?.name}
        </span>
      </DropdownToggle>

      <DropdownMenu className="mt-0" end>
        {Object.keys(languages).map((lang) => (
          <DropdownItem
            key={lang}
            tag="a"
            onClick={(e) => handleLangUpdate(e, lang)}
            className="d-flex align-items-center py-2"
          >
            <ReactCountryFlag
              svg
              className="country-flag me-1"
              countryCode={languages[lang].countryCode}
              style={{
                fontSize: "1.25rem",
                lineHeight: "1.25rem",
              }}
            />
            <span className="align-middle">{languages[lang].name}</span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default IntlDropdown;
