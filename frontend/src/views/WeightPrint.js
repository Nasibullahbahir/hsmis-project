// ** React Imports
import { Card, CardBody, CardText, Row, Col, Table } from "reactstrap";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState, useEffect } from "react";

// ** Import your logo images
import logoLeft from "../../src/assets/images/logo/logo1.png";
import logoRight from "../../src/assets/images/logo/logo2.jpeg";

const WeightPrint = ({
  weightData,
  company,
  vehicle,
  scale,
  mineral,
  unit,
  purchase,
  user,
  copies = 2,
}) => {
  const { t } = useTranslation();
  const [scaledContent, setScaledContent] = useState(null);

  // Enhanced QR data generation with comprehensive information
  const qrData = useMemo(() => {
    const data = {
      // Document Identification
      document_id: weightData?.id,
      bill_number: weightData?.bill_number,

      // Vehicle Information
      plate_number: weightData?.plate_number,
      vehicle_name: vehicle?.car_name || "N/A",
      driver_name: weightData?.driver_name || "N/A",

      // Company Information
      company_id: company?.id,
      company_name: company?.company_name,

      // Mineral Information
      mineral_id: mineral?.id,
      mineral_name: mineral?.name,

      // Purchase/Contract Information
      maktoob_number: purchase?.maktoob,
      royalty_receipt_number: purchase?.royalty_receipt_number,

      // Weight Information
      empty_weight: weightData?.empty_weight || 0,
      second_weight: weightData?.second_weight || 0,
      mineral_net_weight: weightData?.mineral_net_weight || 0,

      // Scale Information
      scale_id: scale?.id,

      // Location Information
      area: weightData?.area,
      discharge_place: weightData?.discharge_place,

      // Transaction Information
      transfor_type: weightData?.transfor_type,
    };

    return JSON.stringify(data);
  }, [weightData, company, vehicle, mineral, purchase, scale, unit]);

  // QR Code section component
  const QRCodeSection = () => (
    <div className="qr-section">
      <div className="qr-title">
        {t("Scan QR Code for Verification and Validation")}
      </div>
      <div className="qr-container">
        <QRCodeSVG
          value={qrData}
          size={180}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
    </div>
  );

  // ** Function to create a single bill copy (similar to Java's createComponentCopy)
  const createBillCopy = (copyIndex = 0, isSecondCopy = false) => {
    return (
      <div key={copyIndex} className="bill-container">
        {/* Copy Label - Add "کاپی" for second copy like Java */}
        {isSecondCopy && (
          <div 
            className="copy-label" 
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "10px",
              color: "#000"
            }}
          >
            کاپی {/* Copy label in Persian */}
          </div>
        )}

        <div className="bill-header">
          {/* Left Logo */}
          <img
            src={logoLeft}
            alt="Logo Left"
            className="header-logo header-logo-left"
          />

          {/* Center Content */}
          <div className="header-content">
            <h1 className="bill-title">
              {t("Da Afganistan Islami Imarat")}
            </h1>
            <h3 className="bill-subtitle">
              {t("Ministry of Petroleum and Mines")}
            </h3>
            <p>{t("Official Weight Measurement Document")}</p>
          </div>

          {/* Right Logo */}
          <img
            src={logoRight}
            alt="Logo Right"
            className="header-logo header-logo-right"
          />
        </div>

        {/* Main content with QR code on LEFT side and table on RIGHT side */}
        <div className="bill-details-container">
          {/* QR Code on LEFT Side */}
          <div className="qr-left">
            <QRCodeSection />
          </div>

          {/* Bill Details on RIGHT Side */}
          <div className="table-right">
            <table className="bill-details">
              <tbody>
                <tr>
                  <td className="label">{t("Weight ID")}:</td>
                  <td>{weightData.id || "N/A"}</td>
                  <td className="label">{t("Bill Number")}:</td>
                  <td>
                    <strong>{weightData.bill_number}</strong>
                  </td>
                </tr>

                <tr>
                  <td className="label">{t("Driver Name")}:</td>
                  <td>
                    {weightData.driver_name || vehicle?.driver_name || t("N/A")}
                  </td>
                  <td className="label">{t("Vehicle Plate No")}:</td>
                  <td>
                    <strong>{weightData.plate_number || vehicle?.plate_number || t("N/A")}</strong>
                  </td>
                </tr>

                <tr>
                  <td className="label">{t("Company Name")}:</td>
                  <td>{company?.company_name || t("N/A")}</td>
                  <td className="label">{t("Royalty Receipt")}:</td>
                  <td>#{purchase?.royalty_receipt_number || t("N/A")}</td>
                </tr>

                <tr>
                  <td className="label">{t("Vehicle Name")}:</td>
                  <td>{vehicle?.car_name || t("N/A")}</td>
                  <td className="label">{t("Date")}:</td>
                  <td>
                    {weightData.create_at ||
                      new Date().toISOString().split("T")[0]}
                  </td>
                </tr>

                {/* Mineral Information */}
                <tr>
                  <td className="label">{t("Mineral Type")}:</td>
                  <td>
                    <strong>{mineral?.name || t("N/A")}</strong>
                  </td>
                  <td className="label">{t("Transfer Type")}:</td>
                  <td>{t(weightData.transfor_type) || t("N/A")}</td>
                </tr>

                <tr>
                  <td className="label">{t("Empty Weight")}:</td>
                  <td>
                    <strong>
                      {weightData.empty_weight || 0} {t("KG")}
                    </strong>
                  </td>
                  <td className="label">{t("Second Weight")}:</td>
                  <td>
                    <strong>
                      {weightData.second_weight || 0} {t("KG")}
                    </strong>
                  </td>
                </tr>

                <tr>
                  <td className="label">{t("Net Weight")}:</td>
                  <td
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#28a745",
                    }}
                  >
                    {weightData.mineral_net_weight || 0} {unit?.name || ""}
                  </td>

                  <td className="label">{t("Maktoob Number")}:</td>
                  <td>
                    {(() => {
                      if (purchase?.maktoob) {
                        if (typeof purchase.maktoob === "object") {
                          return purchase.maktoob.maktoob_number || t("N/A");
                        } else {
                          return purchase.maktoob || t("N/A");
                        }
                      }
                      return t("N/A");
                    })()}
                  </td>
                </tr>

                {/* Control Weight */}
                {weightData.control_weight && (
                  <tr>
                    <td className="label">{t("Control Weight")}:</td>
                    <td colSpan="3">
                      {weightData.control_weight} {t("KG")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="clearfix"></div>

        {/* Signatures Section */}
        <div className="signature-section">
          <Row>
            <Col md="6" className="signature-box">
              <div
                style={{ height: "50px", borderBottom: "1px solid #000" }}
              ></div>
              <p style={{ marginTop: "5px" }}>
                <strong>{t("Driver's Signature")}</strong>
                <br />
                {t("Name")}:{" "}
                {weightData.driver_name || vehicle?.driver_name || t("N/A")}
              </p>
            </Col>
            <Col md="6" className="signature-box">
              <div
                style={{ height: "50px", borderBottom: "1px solid #000" }}
              ></div>
              <p style={{ marginTop: "5px" }}>
                <strong>{t("Weighmaster's Signature")}</strong>
                <br />
                {t("Name")}:{" "}
                {user?.name ||
                  localStorage.getItem("user_name") ||
                  t("Weighmaster")}
              </p>
            </Col>
          </Row>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "10px",
              color: "#666",
            }}
          >
            <p>
              {t(
                "This is an official document. Any alterations invalidate this bill.",
              )}
            </p>
            <p>
              {t("Printed on")}: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ** Function to create printable panel with multiple copies (like Java's printScalePaper)
  const createPrintablePanel = () => {
    const copiesArray = [];
    
    // First copy (Original)
    copiesArray.push(createBillCopy(0, false));
    
    // Add visual separation between copies (560px like Java)
    copiesArray.push(
      <div key="separator" style={{ 
        borderTop: "2px solid #000", 
        margin: "40px 0",
        height: "0"
      }}></div>
    );
    
    // Second copy (Duplicate with "کاپی" label)
    copiesArray.push(createBillCopy(1, true));
    
    return copiesArray;
  };

  // Check if data exists
  if (!weightData) {
    return (
      <Card>
        <CardBody>
          <CardText>{t("No data available for printing")}</CardText>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            /* Reset everything for printing */
            body * {
              visibility: hidden;
            }
            
            #print-section, 
            #print-section * {
              visibility: visible;
            }
            
            #print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              transform: scale(0.85); /* 85% scaling like Java's 0.7 */
              transform-origin: top left;
              margin: 0;
              padding: 0;
            }
            
            /* Prevent page breaks inside bill containers */
            .bill-container {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 0;
            }
            
            /* Add visual separation between copies */
            .copy-separator {
              border-top: 2px solid #000;
              margin: 20px 0;
              height: 0;
              break-before: avoid;
            }
            
            /* A4 page settings */
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            
            /* Hide non-print elements */
            .no-print {
              display: none !important;
            }
            
            /* Bill container styling */
            .bill-container {
              border: 2px solid #000;
              padding: 15px;
              margin-bottom: 20px;
              background: white;
            }
            
            .bill-header {
              text-align: center;
              border-bottom: 2px solid #000;
              margin-bottom: 15px;
              padding-bottom: 10px;
              position: relative;
              min-height: 100px;
            }
            
            .bill-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            
            .bill-subtitle {
              font-size: 18px;
              margin: 5px 0;
            }
            
            .header-logo {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              height: 70px;
              max-width: 100px;
              object-fit: contain;
            }
            
            .header-logo-left {
              left: 0;
            }
            
            .header-logo-right {
              right: 0;
            }
            
            .header-content {
              display: inline-block;
              max-width: 60%;
              margin: 0 auto;
            }
            
            /* QR Code Styles for Print */
            .qr-section {
              text-align: center;
              padding: 10px;
              border: 1px solid #000;
              background-color: #f9f9f9;
              page-break-inside: avoid;
              float: left;
              width: 220px;
              margin-right: 15px;
            }
            
            .qr-title {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 12px;
              color: #333;
            }
            
            .qr-container {
              margin: 5px auto;
              padding: 5px;
              background: white;
              border: 1px solid #ddd;
              border-radius: 2px;
              display: inline-block;
            }
            
            /* Table styling */
            .bill-details-container {
              overflow: hidden;
              margin-bottom: 15px;
            }
            
            .bill-details {
              width: calc(100% - 240px);
              border-collapse: collapse;
              float: right;
              margin: 0;
            }
            
            .bill-details td {
              padding: 6px;
              border: 1px solid #ddd;
              font-size: 11px;
            }
            
            .bill-details td.label {
              font-weight: bold;
              background-color: #f5f5f5;
              width: 35%;
            }
            
            /* Clear float */
            .clearfix {
              clear: both;
            }
            
            /* Signature section */
            .signature-section {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #000;
              page-break-inside: avoid;
            }
            
            .signature-box {
              display: inline-block;
              width: 48%;
              text-align: center;
            }
            
            /* Copy label styling */
            .copy-label {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 10px;
              color: #000;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
            }
          }
          
          /* Screen styles (unchanged) */
          .bill-container {
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
            background-color: white;
          }
          .bill-header {
            text-align: center;
            border-bottom: 2px solid #000;
            margin-bottom: 15px;
            padding-bottom: 10px;
            position: relative;
            min-height: 100px;
          }
          .bill-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          .bill-subtitle {
            font-size: 18px;
            margin: 5px 0;
          }
          .copy-label {
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          .header-logo {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 80px;
            max-width: 120px;
            object-fit: contain;
          }
          .header-logo-left {
            left: 0;
          }
          .header-logo-right {
            right: 0;
          }
          .header-content {
            display: inline-block;
            max-width: 60%;
            margin: 0 auto;
          }
          
          /* QR Code on left, table on right */
          .bill-details-container {
            display: flex;
            flex-direction: row;
            gap: 20px;
            margin-bottom: 20px;
            align-items: flex-start;
          }
          
          .qr-left {
            flex: 0 0 240px;
          }
          
          .table-right {
            flex: 1;
          }
          
          .bill-details {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
          }
          
          .bill-details td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          
          .bill-details td.label {
            font-weight: bold;
            background-color: #f5f5f5;
            width: 35%;
          }
          
          /* QR Code Styles for Screen */
          .qr-section {
            text-align: center;
            padding: 15px;
            border: 1px solid #000;
            background-color: #f9f9f9;
            height: 100%;
            box-sizing: border-box;
          }
          
          .qr-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
            color: #333;
          }
          
          .qr-container {
            margin: 10px auto;
            padding: 8px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            display: inline-block;
          }
          
          .clearfix {
            clear: both;
          }
          
          /* Print preview controls */
          .print-controls {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
          }
          
          /* Separator between copies */
          .copy-separator {
            border-top: 2px solid #000;
            margin: 40px 0;
            height: 0;
          }
        `}
      </style>

      {/* Print Preview Controls (only visible on screen) */}
      <div className="print-controls no-print">
        <h5>{t("Print Preview")}</h5>
        <p className="small text-muted">
          {t("Two copies (Original and Duplicate) will be printed on A4 paper.")}
        </p>
      </div>

      <div id="print-section">
        {/* Create printable panel with two copies */}
        {createPrintablePanel()}
      </div>
    </>
  );
};

export default WeightPrint;