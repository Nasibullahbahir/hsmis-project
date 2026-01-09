import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Divider, Row, Col, Input } from "antd";
import { QRCodeSVG } from "qrcode.react";
import "./MiningDocument.css";

const MiningDocument = ({ documentData = {} }) => {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    const languageOptions = {
      en: {
        locale: "en-US",
        formatOptions: { year: "numeric", month: "2-digit", day: "2-digit" },
      },
      ps: {
        locale: "fa-IR",
        formatOptions: { year: "numeric", month: "2-digit", day: "2-digit" },
      },
      dr: {
        locale: "fa-IR",
        formatOptions: { year: "numeric", month: "2-digit", day: "2-digit" },
      },
    };

    const { locale, formatOptions } =
      languageOptions[i18n.language] || languageOptions.en;
    return date.toLocaleDateString(locale, formatOptions);
  };

  const formatTime = (date) => {
    const languageOptions = {
      en: {
        locale: "en-US",
        formatOptions: {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        },
      },
      ps: {
        locale: "fa-IR",
        formatOptions: {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        },
      },
      dr: {
        locale: "fa-IR",
        formatOptions: {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        },
      },
    };

    const { locale, formatOptions } =
      languageOptions[i18n.language] || languageOptions.en;
    return date.toLocaleTimeString(locale, formatOptions);
  };

  // ADD THIS FUNCTION BACK
  const getDirection = () => {
    return i18n.language === "en" ? "ltr" : "rtl";
  };

  const defaultDocumentData = {
    documentNumber: "31AF1",
    date: formatDate(currentTime),
    time: formatTime(currentTime),
    serialNumber: "32AG1W-37",
    companyName: t("nasibullah") ,
    driverName: t("candidate") || "کاندید",
    carType: t("truck") || "لودر",
    licensePlate: t("candidate") || "کاندید",
    mineralType: t("coal") || "ذغال سنگ",
    emptyWeight: "000 kg",
    netMineralWeight: "0000 kg",
    loadedWeight: "0000 kg",
    customerName: "",
    contractInfo: "",
    maktoobNumber: "",
  };

  const mergedData = {
    ...defaultDocumentData,
    ...documentData,
    date: documentData.date || formatDate(currentTime),
    time: documentData.time || formatTime(currentTime),
  };

  const generateQRData = () => {
    return JSON.stringify({
      type: "mining_document",
      version: "1.0",
      data: mergedData,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    // ADD dir ATTRIBUTE BACK
    <div className="mining-document" dir={getDirection()}>
      {/* Header */}
      <div className="document-header">
        <Row gutter={[8, 8]} align="middle">
          <Col span={4}>
            <div className="logo-placeholder">{t("logo") || "لوگو"}</div>
          </Col>
          <Col span={16}>
            <div className="organization-name">
              {t("islamic_emirate_afghanistan") || "امارت اسلامی افغانستان"}
            </div>
            <div className="ministry-name">
              {t("ministry_mines_petroleum") || "وزارت معادن و پترولیوم"}
            </div>
            <div className="department-name">
              {t("badghis_mines_department") || "ریاست معادن بادغیس"}
            </div>
            <div className="management-name">
              {t("nekab_ismail_scale_management") ||
                "مدیریت تره بار نیک آباد اسماعیل"}{" "}
              (31AF1)
            </div>
          </Col>
          <Col span={4}>
            <div className="logo-placeholder">{t("image") || "عکس"}</div>
          </Col>
        </Row>
      </div>

      <Divider className="compact-divider" />

      {/* Document Info */}
      <div className="document-info">
        <Row justify="space-between" align="middle">
          <Col>
            <span className="label">{t("scale_number") || "نمبر ترازو"}: </span>
            <span className="value">{mergedData.documentNumber}</span>
          </Col>
          <Col>
            <span className="label">{t("date") || "تاریخ"}: </span>
            <span className="value">{mergedData.date}</span>
          </Col>
          <Col>
            <span className="label">{t("time") || "وقت"}: </span>
            <span className="value">{mergedData.time}</span>
          </Col>
        </Row>
      </div>

      <Divider className="compact-divider" />

      {/* Maktoob and Serial Number */}
      <div className="serial-number-row">
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <span className="label">
              {t("maktoob_number") || "نمبر مکتوب"}:
            </span>
            <span className="serial-value">
              {mergedData.maktoobNumber || "N/A"}
            </span>
          </Col>
          <Col span={12}>
            <span className="label">{t("serial_number") || "نمبر سریال"}:</span>
            <span className="serial-value">{mergedData.serialNumber}</span>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <div className="document-content">
        <Row className="content-row">
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("customer_company_name") || "نام شرکت مشتری"}:
            </span>
            <span className="field-value">{mergedData.companyName}</span>
          </Col>
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("customer_name") || "نام مشتری"}:
            </span>
            <span className="field-value">{mergedData.customerName}</span>
          </Col>
        </Row>

        <Row className="content-row">
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("driver_name") || "نام ډرایور"}:
            </span>
            <span className="field-value">{mergedData.driverName}</span>
          </Col>
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("vehicle_type") || "نوع موتر"}:
            </span>
            <span className="field-value">{mergedData.carType}</span>
          </Col>
        </Row>

        <Row className="content-row">
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("license_plate_number") || "نمبر پلیت"}:
            </span>
            <span className="field-value">{mergedData.licensePlate}</span>
          </Col>
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("mineral_type") || "نوع معدن"}:
            </span>
            <span className="field-value">{mergedData.mineralType}</span>
          </Col>
        </Row>

        <Row className="content-row">
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("contract_info") || "اطلاعات قرارداد"}:
            </span>
            <span className="field-value">{mergedData.contractInfo}</span>
          </Col>
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("empty_weight") || "وزن خالی"}:
            </span>
            <span className="field-value">{mergedData.emptyWeight}</span>
          </Col>
        </Row>

        <Row className="content-row">
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("net_mineral_weight") || "وزن خالص معدن"}:
            </span>
            <span className="field-value">{mergedData.netMineralWeight}</span>
          </Col>
          <Col span={12} className="field-group">
            <span className="field-label">
              {t("mineral_and_vehicle_weight") || "وزن معدن و موتر"}:
            </span>
            <span className="field-value">{mergedData.loadedWeight}</span>
          </Col>
        </Row>
      </div>

      {/* Signature Section */}
      <div className="signature-section">
        <Row gutter={[4, 4]}>
          <Col span={6}>
            <div className="signature-field">
              <label className="label">
                {t("program_number") || "نمبر برنامه"}
              </label>
              <Input className="signature-input" readOnly size="small" />
            </div>
          </Col>
          <Col span={6}>
            <div className="signature-field">
              <label className="label">
                {t("document_number") || "نمبر سند"}
              </label>
              <Input className="signature-input" readOnly size="small" />
            </div>
          </Col>
          <Col span={6}>
            <div className="signature-field">
              <label className="label">
                {t("attachment_number") || "نمبر ضمیمه"}
              </label>
              <Input className="signature-input" readOnly size="small" />
            </div>
          </Col>
          <Col span={6}>
            <div className="signature-field">
              <label className="label">{t("document_type") || "نوع سند"}</label>
              <Input className="signature-input" readOnly size="small" />
            </div>
          </Col>
        </Row>
        <div className="signature-label">
          : {t("officer_signature") || "امضای مامور"}
        </div>
      </div>

      {/* QR Code Section */}
      <div className="qr-section">
        <Row justify="center">
          <Col>
            <div className="qr-container">
              <QRCodeSVG
                value={generateQRData()}
                size={80}
                level="H"
                includeMargin
              />
              <p className="qr-text">{t("scan_qr_code") || "QR کد سکن کنید"}</p>
            </div>
          </Col>
        </Row>
      </div>

      {/* Notes Section */}
      <div className="notes-section">
        <div className="note">
          <strong>{t("note") || "یادداشت"}:</strong>{" "}
          {t("document_validity_note") ||
            "این سند فقط برای یک بار استفاده معتبر می باشد"}
        </div>
        <div className="validity">
          {t("document_validity_period") || "مدت اعتبار: 24 ساعت"}
        </div>
      </div>

      {/* Footer */}
      <div className="document-footer">
        <div className="developer-info">
          {t("developed_by") || "توسعه داده شده توسط"}: MIS Directorate,{" "}
          {t("phone") || "تلیفون"}: (+93) 0202927190, {t("email") || "ایمیل"}:
          mis@momp.gov.af
        </div>
      </div>
    </div>
  );
};

export default MiningDocument;
