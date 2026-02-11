import React, { useRef } from 'react';
import { Card, CardBody } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';

// If you're using Vite, you might need to adjust these imports
// Try these alternatives:

// Option 1: If logos are in public folder
// const logoLeft = "/images/logo/logo1.png";
// const logoRight = "/images/logo/logo2.jpeg";

// Option 2: If logos are in src/assets folder
// import logoLeft from "../../assets/images/logo/logo1.png";
// import logoRight from "../../assets/images/logo/logo2.jpeg";

// Option 3: If the above doesn't work, try this:
import logoLeft from "../assets/images/logo/logo1.png";
import logoRight from "../assets/images/logo/logo2.jpeg";

const WeightPreview = ({ 
  weightData, 
  company, 
  vehicle, 
  scale, 
  mineral, 
  unit, 
  purchase, 
  user 
}) => {
  const { t } = useTranslation();
  const printRef = useRef(null);

  // Generate weight ID like Java's WID format
  const generateWeightId = () => {
    if (weightData?.id) return weightData.id;
    
    // Simulate Java's ID format: SID + "W-" + sequential number
    const scaleId = scale?.id?.toString().replace(/-/g, '') || '0000';
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `${scaleId}W-${timestamp}${randomNum}`;
  };

  // Generate QR data
  const generateQRData = () => {
    const data = {
      weight_id: generateWeightId(),
      bill_number: weightData?.bill_number,
      plate_number: weightData?.plate_number || vehicle?.plate_number,
      driver_name: weightData?.driver_name || vehicle?.driver_name,
      company_name: company?.company_name,
      mineral_name: mineral?.name,
      empty_weight: weightData?.empty_weight,
      second_weight: weightData?.second_weight,
      net_weight: weightData?.mineral_net_weight,
      date: weightData?.create_at || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
    };
    return JSON.stringify(data);
  };

  // Function to safely get image source
  const getImageSrc = (path, altPath) => {
    try {
      // Try to require the image
      return path;
    } catch (error) {
      console.error('Error loading image:', error);
      // Return a placeholder or empty string
      return altPath || '';
    }
  };

  // Single copy component
  const renderBillCopy = (isCopy = false) => {
    const qrData = generateQRData();
    const weightId = generateWeightId();
    
    return (
      <div className="bill-copy" style={styles.billCopy}>
        {/* Copy Label (only for duplicate) */}
        {isCopy && (
          <div style={styles.copyLabel}>
            <h3 style={{ margin: 0, color: '#000', textAlign: 'center' }}>
              کاپی {/* Copy in Persian */}
            </h3>
          </div>
        )}

        {/* Header with logos - Java style */}
        <div style={styles.header}>
          {/* Left Logo */}
          {logoLeft && (
            <img 
              src={logoLeft} 
              alt="Logo" 
              style={styles.leftLogo}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          
          {/* Center Content */}
          <div style={styles.headerCenter}>
            <h1 style={styles.mainTitle}>امارت اسلامی افغانستان</h1>
            <h2 style={styles.subTitle}>وزارت معادن و پطرولیم</h2>
            <h3 style={styles.agencyTitle}>
              مدیریت عمومی ترازوی شیدایی ولایت هرات (32AG)
            </h3>
          </div>
          
          {/* Right Logo */}
          {logoRight && (
            <img 
              src={logoRight} 
              alt="Logo" 
              style={styles.rightLogo}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Scale ID and Date - Java style */}
        <div style={styles.scaleInfo}>
          <div style={styles.scaleInfoLeft}>
            <span style={styles.label}>نمبر ترازو:</span>
            <span style={styles.value}>{scale?.id || '32AG'}</span>
          </div>
          <div style={styles.scaleInfoRight}>
            <span style={styles.label}>تاریخ:</span>
            <span style={styles.value}>
              {weightData?.create_at || new Date().toLocaleDateString('fa-IR')}
            </span>
            <span style={styles.label}>زمان:</span>
            <span style={styles.value}>
              {new Date().toLocaleTimeString('fa-IR')}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* QR Code Section */}
          <div style={styles.qrSection}>
            <div style={styles.qrContainer}>
              <QRCodeSVG
                value={qrData}
                size={120}
                level="H"
                includeMargin={true}
              />
            </div>
            <div style={styles.qrNote}>
              اسکن کنید برای تایید و اعتبارسنجی
            </div>
          </div>

          {/* Details Table */}
          <div style={styles.detailsSection}>
            <table style={styles.detailsTable}>
              <tbody>
                <tr>
                  <td style={styles.tableLabel}>نمبر مسلسل:</td>
                  <td style={styles.tableValue} colSpan="3">
                    <strong>{weightId}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>نمبر پلیت موتر:</td>
                  <td style={styles.tableValue}>
                    <strong>{weightData?.plate_number || vehicle?.plate_number}</strong>
                  </td>
                  <td style={styles.tableLabel}>نام راننده:</td>
                  <td style={styles.tableValue}>
                    {weightData?.driver_name || vehicle?.driver_name}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>نام مشتری شرکت:</td>
                  <td style={styles.tableValue}>{company?.company_name}</td>
                  <td style={styles.tableLabel}>نوع منرال:</td>
                  <td style={styles.tableValue}>{mineral?.name}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>وزن خالی موتر:</td>
                  <td style={styles.tableValue}>
                    <strong>{weightData?.empty_weight || 0} KG</strong>
                  </td>
                  <td style={styles.tableLabel}>وزن مع بار:</td>
                  <td style={styles.tableValue}>
                    <strong>{weightData?.second_weight || 0} KG</strong>
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>وزن خالص منرال:</td>
                  <td style={styles.tableValue} colSpan="3">
                    <strong style={{ color: '#28a745', fontSize: '18px' }}>
                      {weightData?.mineral_net_weight || 0} {unit?.name || 'KG'}
                    </strong>
                  </td>
                </tr>
                {weightData?.control_weight && (
                  <tr>
                    <td style={styles.tableLabel}>وزن کنترول:</td>
                    <td style={styles.tableValue} colSpan="3">
                      {weightData.control_weight} KG
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Text */}
        <div style={styles.footerText}>
          <p style={{ margin: 0, fontSize: '12px', textAlign: 'center' }}>
            این پارچه از ساحه ترازو الی مقصد به تاریخ ذکر شده مدار اعتبار میباشد.
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '10px', textAlign: 'center', color: '#666' }}>
            نوت: پارچه های قلمی، فوتوکاپی، عکس گرفتگی وبیدون QR کود مدار اعتبار نمیباشد.
          </p>
        </div>

        {/* Signatures - Java style */}
        <div style={styles.signatureSection}>
          <div style={styles.signatureBox}>
            <div style={styles.signatureLine}></div>
            <div style={styles.signatureLabel}>
              مهر و امضای مسئول توزین
            </div>
            <div style={styles.signatureName}>
              {user?.name || 'مسئول توزین'}
            </div>
          </div>
          <div style={styles.signatureBox}>
            <div style={styles.signatureLine}></div>
            <div style={styles.signatureLabel}>
              امضای راننده
            </div>
            <div style={styles.signatureName}>
              {weightData?.driver_name || vehicle?.driver_name}
            </div>
          </div>
        </div>

        {/* Developer info */}
        <div style={styles.developerInfo}>
          <p style={{ margin: 0, fontSize: '9px', textAlign: 'center', color: '#999' }}>
            Developed By: MIS Directorate , Phone: (+93) 0202927190 , Email: mis@momp.gov.af
          </p>
        </div>
      </div>
    );
  };

  // Check if data exists
  if (!weightData) {
    return (
      <Card>
        <CardBody>
          <p>{t("No data available for printing")}</p>
        </CardBody>
      </Card>
    );
  }

  // Main render with two copies
  return (
    <div ref={printRef} style={styles.container}>
      {/* Original Copy */}
      {renderBillCopy(false)}
      
      {/* Separator between copies */}
      <div style={styles.copySeparator}></div>
      
      {/* Duplicate Copy */}
      {renderBillCopy(true)}
    </div>
  );
};

// Java-style inline styles
const styles = {
  container: {
    width: '794px',
    margin: '0 auto',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  },
  billCopy: {
    width: '100%',
    minHeight: '540px',
    border: '2px solid #000',
    padding: '10px',
    marginBottom: '20px',
    boxSizing: 'border-box',
    position: 'relative',
  },
  copyLabel: {
    textAlign: 'center',
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: '1px solid #000',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '2px solid #000',
    marginBottom: '10px',
    position: 'relative',
    minHeight: '100px',
  },
  leftLogo: {
    width: '70px',
    height: '70px',
    objectFit: 'contain',
  },
  rightLogo: {
    width: '70px',
    height: '70px',
    objectFit: 'contain',
  },
  headerCenter: {
    textAlign: 'center',
    flex: 1,
  },
  mainTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#000',
  },
  subTitle: {
    fontSize: '18px',
    margin: '0 0 5px 0',
    color: '#000',
  },
  agencyTitle: {
    fontSize: '16px',
    margin: 0,
    color: '#000',
  },
  scaleInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    padding: '5px',
    backgroundColor: '#32a852',
    color: '#fff',
    borderRadius: '4px',
  },
  scaleInfoLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  scaleInfoRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  value: {
    fontSize: '14px',
    marginLeft: '5px',
  },
  mainContent: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
  },
  qrSection: {
    flex: '0 0 140px',
    border: '1px solid #000',
    padding: '10px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  qrContainer: {
    margin: '0 auto 10px auto',
  },
  qrNote: {
    fontSize: '10px',
    color: '#666',
    marginTop: '5px',
  },
  detailsSection: {
    flex: 1,
  },
  detailsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  tableLabel: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    padding: '8px',
    fontWeight: 'bold',
    width: '25%',
    textAlign: 'right',
  },
  tableValue: {
    border: '1px solid #ddd',
    padding: '8px',
    width: '25%',
  },
  footerText: {
    margin: '15px 0',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  signatureSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #000',
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    height: '40px',
    borderBottom: '1px solid #000',
    marginBottom: '5px',
  },
  signatureLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '3px',
  },
  signatureName: {
    fontSize: '11px',
    color: '#666',
  },
  developerInfo: {
    marginTop: '10px',
    paddingTop: '5px',
    borderTop: '1px dashed #ddd',
  },
  copySeparator: {
    borderTop: '2px solid #000',
    margin: '40px 0',
    height: '0',
  },
};

export default WeightPreview;