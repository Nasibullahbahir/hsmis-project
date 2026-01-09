import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  Alert,
  Badge,
  Typography,
  Divider,
} from "antd";
import {
  SaveOutlined,
  DeleteOutlined,
  PrinterOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import MiningDocument from "./MiningDocument";

// Import from separate data files
import { getCars } from "../dummyData/carData";
import { getCompanies } from "../dummyData/companyData";
import { getContracts } from "../dummyData/contractData";
import { getMaktoobs } from "../dummyData/maktoobData";

const { Title, Text } = Typography;
const { Option } = Select;

const Home = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scaleWeight, setScaleWeight] = useState("18500787877");
  const [connectionStatus, setConnectionStatus] = useState("connected");

  // Form state
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedMineral, setSelectedMineral] = useState("");
  const [contractType, setContractType] = useState(""); // Combined transfer_type and contractSales
  const [maktoobNumber, setMaktoobNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  // Data state
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [minerals, setMinerals] = useState([]);
  const [maktoobs, setMaktoobs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Document data state
  const [documentData, setDocumentData] = useState({
    documentNumber: "31AF1",
    date: "",
    time: "",
    serialNumber: "32AG1W-37",
    companyName: "",
    driverName: "",
    carType: "",
    licensePlate: "",
    mineralType: "",
    emptyWeight: "000 kg",
    netMineralWeight: "0000 kg",
    loadedWeight: "0000 kg",
    contractInfo: "",
    customerName: "",
    maktoobNumber: "",
    plateNumber: "",
    contractType: "", // Added contract type to document data
  });

  // Date formatting functions
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

    const selectedOptions =
      languageOptions[i18n.language] || languageOptions.en;
    return date.toLocaleDateString(
      selectedOptions.locale,
      selectedOptions.formatOptions
    );
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

    const selectedOptions =
      languageOptions[i18n.language] || languageOptions.en;
    return date.toLocaleTimeString(
      selectedOptions.locale,
      selectedOptions.formatOptions
    );
  };

  // Load all data
  useEffect(() => {
    loadInitialData();

    const clockInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  const loadInitialData = () => {
    // Load vehicles (cars)
    const carsData = getCars();
    const formattedVehicles = carsData.map((car) => ({
      id: car.car_id,
      plateNumber: car.plate_number,
      driverName: car.driver_name,
      emptyWeight: car.empty_car_weight,
      carType: car.car_type,
      companyName: car.company_name,
    }));
    setVehicles(formattedVehicles);

    // Load companies
    const companiesData = getCompanies();
    setCompanies(companiesData);

    // Load maktoobs
    const maktoobsData = getMaktoobs();
    setMaktoobs(maktoobsData);

    // Mock minerals data
    setMinerals([
      { id: "1", name: t("coal") || "ذغال سنگ" },
      { id: "2", name: t("marble") || "مرمر" },
      { id: "3", name: t("copper") || "مس" },
      { id: "4", name: t("iron") || "آهن" },
    ]);

    setConnectionStatus("connected");

    // Initialize document data with current date/time
    updateDocumentData({
      date: formatDate(new Date()),
      time: formatTime(new Date()),
    });
  };

  // Handle contract type change (combined transfer_type and contractSales)
  const handleContractTypeChange = (value) => {
    setContractType(value);
    updateDocumentData({ contractType: value });

    // Auto-set maktoob number based on contract type if needed
    if (value && maktoobs.length > 0) {
      const relevantMaktoob = maktoobs.find(
        (m) =>
          m.maktoob_type &&
          m.maktoob_type.toLowerCase().includes(value.toLowerCase())
      );
      if (relevantMaktoob) {
        handleMaktoobNumberChange(relevantMaktoob.maktoob_number);
      }
    }
  };

  // Handle maktoob number change
  const handleMaktoobNumberChange = (value) => {
    setMaktoobNumber(value);

    // Find maktoob data and auto-populate related fields
    const selectedMaktoob = maktoobs.find((m) => m.maktoob_number === value);

    if (selectedMaktoob) {
      // Auto-populate company if maktoob has company info
      if (selectedMaktoob.company_name) {
        const company = companies.find(
          (c) => c.company_name === selectedMaktoob.company_name
        );
        if (company) {
          setSelectedCompany(company.company_id);
          updateDocumentData({
            companyName: company.company_name,
            customerName: company.leader_name,
          });
        }
      }

      // Update document with maktoob info
      updateDocumentData({
        maktoobNumber: selectedMaktoob.maktoob_number,
        contractInfo: selectedMaktoob.maktoob_type,
        description: selectedMaktoob.description,
      });

      // Auto-set contract type based on maktoob type if not already set
      if (!contractType && selectedMaktoob.maktoob_type) {
        const maktoobType = selectedMaktoob.maktoob_type.toLowerCase();
        if (maktoobType.includes("khosh") || maktoobType.includes("خوش")) {
          setContractType("khosh_kharid");
          updateDocumentData({ contractType: "khosh_kharid" });
        } else if (
          maktoobType.includes("process") ||
          maktoobType.includes("پروسس")
        ) {
          setContractType("process");
          updateDocumentData({ contractType: "process" });
        } else if (
          maktoobType.includes("control") ||
          maktoobType.includes("کنترول")
        ) {
          setContractType("control");
          updateDocumentData({ contractType: "control" });
        } else if (
          maktoobType.includes("contract") ||
          maktoobType.includes("قرارداد")
        ) {
          setContractType("contract");
          updateDocumentData({ contractType: "contract" });
        }
      }
    }
  };

  // Handle plate number change
  const handlePlateNumberChange = (value) => {
    setPlateNumber(value);

    // Find vehicle by plate number and auto-populate related fields
    const vehicle = vehicles.find((v) => v.plateNumber === value);

    if (vehicle) {
      setSelectedVehicle(vehicle.id);
      updateDocumentData({
        driverName: vehicle.driverName,
        licensePlate: vehicle.plateNumber,
        carType: vehicle.carType,
        emptyWeight: `${vehicle.emptyWeight} kg`,
        plateNumber: vehicle.plateNumber,
      });
    } else {
      // If no vehicle found, still update the plate number in document data
      updateDocumentData({
        plateNumber: value,
        licensePlate: value,
      });
    }
  };

  // Handle company change
  const handleCompanyChange = (value) => {
    setSelectedCompany(value);

    const company = companies.find((c) => c.company_id === value);
    if (company) {
      // Find contracts for this company
      const contractsData = getContracts();
      const companyContracts = contractsData.filter(
        (contract) =>
          contract.companyName === company.company_name ||
          contract.companyId === company.company_id
      );

      updateDocumentData({
        companyName: company.company_name,
        customerName: company.leader_name,
        contractInfo:
          companyContracts.length > 0
            ? `Contract: ${companyContracts[0].contractId} - ${companyContracts[0].area}`
            : "No contract found",
      });

      // Auto-select mineral type if available in contracts
      if (companyContracts.length > 0) {
        setSelectedMineral("1");
        updateDocumentData({ mineralType: t("coal") || "ذغال سنگ" });
      }
    }
  };

  // Handle vehicle change
  const handleVehicleChange = (value) => {
    setSelectedVehicle(value);

    const vehicle = vehicles.find((v) => v.id === value);
    if (vehicle) {
      setPlateNumber(vehicle.plateNumber);
      updateDocumentData({
        driverName: vehicle.driverName,
        licensePlate: vehicle.plateNumber,
        carType: vehicle.carType,
        emptyWeight: `${vehicle.emptyWeight} kg`,
        plateNumber: vehicle.plateNumber,
      });
    }
  };

  // Handle mineral change
  const handleMineralChange = (value) => {
    setSelectedMineral(value);

    const mineral = minerals.find((m) => m.id === value);
    if (mineral) {
      updateDocumentData({ mineralType: mineral.name });
    }
  };

  // Update document data helper function
  const updateDocumentData = (updates) => {
    setDocumentData((prev) => ({
      ...prev,
      ...updates,
      date: formatDate(currentDate),
      time: formatTime(currentDate),
    }));
  };

  const handleSaveWeight = async () => {
    try {
      // Validate inputs
      if (
        !selectedVehicle ||
        !selectedCompany ||
        !selectedMineral ||
        !contractType
      ) {
        addAlert(
          "error",
          t("fill_required_fields") || "لطفاً تمام فیلدهای ضروری را پر کنید"
        );
        return;
      }

      const selectedVehicleData = vehicles.find(
        (v) => v.id === selectedVehicle
      );
      const emptyWeight = selectedVehicleData?.emptyWeight || 0;
      const grossWeight = parseInt(scaleWeight);
      const netWeight = grossWeight - emptyWeight;

      if (netWeight <= 0) {
        addAlert("error", t("invalid_net_weight") || "وزن خالص نامعتبر است");
        return;
      }

      // Update document with weight data
      updateDocumentData({
        emptyWeight: `${emptyWeight} kg`,
        netMineralWeight: `${netWeight} kg`,
        loadedWeight: `${grossWeight} kg`,
      });

      // Prepare weight data
      const weightData = {
        id: `W-${Date.now()}`,
        vehicleId: selectedVehicle,
        companyId: selectedCompany,
        mineralId: selectedMineral,
        contractType,
        maktoobNumber,
        plateNumber,
        grossWeight,
        emptyWeight,
        netWeight,
        date: currentDate.toISOString(),
        status: "recorded",
        documentData: documentData,
      };

      console.log("ذخیره اطلاعات توزین:", weightData);

      addAlert(
        "success",
        t("weight_saved_success") || "اطلاعات توزین با موفقیت ثبت شد"
      );
    } catch (error) {
      addAlert("error", t("weight_save_error") || "خطا در ثبت اطلاعات توزین");
      console.error("Error saving weight:", error);
    }
  };

  const addAlert = (type, message) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 5000);
  };

  const resetForm = () => {
    setSelectedVehicle("");
    setSelectedCompany("");
    setSelectedMineral("");
    setContractType("");
    setMaktoobNumber("");
    setPlateNumber("");
    updateDocumentData({
      companyName: "",
      driverName: "",
      licensePlate: "",
      carType: "",
      mineralType: "",
      emptyWeight: "000 kg",
      netMineralWeight: "0000 kg",
      loadedWeight: "0000 kg",
      contractInfo: "",
      customerName: "",
      maktoobNumber: "",
      plateNumber: "",
      contractType: "",
    });
  };

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Alerts */}
      <div style={{ marginBottom: "16px" }}>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            showIcon
            closable
            style={{ marginBottom: "8px" }}
          />
        ))}
      </div>

      <Row gutter={[16, 16]} style={{ margin: 0, width: "100%" }}>
        {/* Main Content */}
        <Col xs={12} lg={24}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "black",
                color: "#fff",
                padding: "8px",
                borderRadius: "12px",
                textAlign: "center",
                fontSize: "42px",
                fontWeight: "bold",
                fontFamily: "monospace",
                minWidth: "200px",
                border:
                  connectionStatus === "connected"
                    ? "4px solid #52c41a"
                    : "4px solid #ff4d4f",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              {scaleWeight}
            </div>
          </div>

          <Card
            title={
              <span>
                <DashboardOutlined
                  style={{
                    marginLeft: i18n.language === "en" ? "0" : "8px",
                    marginRight: i18n.language === "en" ? "8px" : "0",
                  }}
                />
                {t("new_weight_registration")}
              </span>
            }
          >
            <Form layout="vertical">
              <Row gutter={15}>
                <Col xs={24} md={6}>
                  <Form.Item label={t("contract_type")} required>
                    <Select
                      value={contractType}
                      onChange={handleContractTypeChange}
                      placeholder={t("select_contract_type")}
                      allowClear
                    >
                      <Option value="khosh_kharid">{t("khosh_kharid")}</Option>
                      <Option value="process">{t("process")}</Option>
                      <Option value="control">{t("control")}</Option>
                      <Option value="contract">{t("contract")}</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label={t("plate_number")}>
                    <Select
                      value={plateNumber}
                      onChange={handlePlateNumberChange}
                      placeholder={t("select_plate_number")}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {vehicles.map((vehicle) => (
                        <Option key={vehicle.id} value={vehicle.plateNumber}>
                          {vehicle.plateNumber}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item label={t("customer_name")} required>
                    <Select
                      value={selectedCompany}
                      onChange={handleCompanyChange}
                      placeholder={t("customer_name")}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {companies.map((company) => (
                        <Option
                          key={company.company_id}
                          value={company.company_id}
                        >
                          {company.company_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={20}>
                <Col xs={24} md={12}>
                  <Form.Item label={t("mineral_type")} required>
                    <Select
                      value={selectedMineral}
                      onChange={handleMineralChange}
                      placeholder={t("select_mineral")}
                    >
                      {minerals.map((mineral) => (
                        <Option key={mineral.id} value={mineral.id}>
                          {mineral.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item
                style={{
                  textAlign: i18n.language === "en" ? "right" : "left",
                }}
              >
                <Button
                  icon={<DeleteOutlined />}
                  onClick={resetForm}
                  size="large"
                  danger
                >
                  {t("clear")}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Mining Document Preview */}
        <Col className="hidden">
          <Card>
            <MiningDocument documentData={documentData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
