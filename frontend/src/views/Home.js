// ** React Imports
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

// ** Third Party Components
import { AlertCircle, CheckCircle, Printer, X, Save } from "react-feather";

// ** Print Component Import
import WeightPreview from "./WeightPreview";

const WeightForm = ({
  onSuccess, // This prop receives handleAddWeightSubmit from WeightTable
  onCancel,
  initialData = null,
  loading = false,
  isEdit = false,
  vehicles = [],
  scales = [],
  minerals = [],
  units = [],
  purchases = [],
  companies = [],
  maktoobs = [],
  selectedCompany = null,
  existingBillNumbers = [],
  onCheckBalance = null,
  // New props from WeightTable
  transferTypes = [],
  getPurchasesForCompany = null,
  getLatestPurchaseForCompany = null,
}) => {
  const { t } = useTranslation();

  // ** Form States
  const [formData, setFormData] = useState({
    bill_number: "",
    empty_weight: "",
    second_weight: "",
    mineral_net_weight: "",
    control_weight: "",
    transfor_type: "incoming",
    area: "",
    discharge_place: "",
    create_at: new Date().toISOString().split("T")[0],
    company: selectedCompany ? selectedCompany.id : "",
    vehicle: "",
    plate_number: "",
    driver_name: "",
    scale: "",
    mineral: "",
    unit: "",
    purchase: "",
    user: localStorage.getItem("user_id") || "",
  });

  const [errors, setErrors] = useState({});
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [filteredMinerals, setFilteredMinerals] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [balanceInfo, setBalanceInfo] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [selectedPurchaseDetails, setSelectedPurchaseDetails] = useState(null);
  const [selectedMineralDetails, setSelectedMineralDetails] = useState(null);
  const [selectedUnitDetails, setSelectedUnitDetails] = useState(null);
  const [selectedCompanyDetails, setSelectedCompanyDetails] =
    useState(selectedCompany);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState(null);
  const [selectedScaleDetails, setSelectedScaleDetails] = useState(null);
  const [autoSelectedMineral, setAutoSelectedMineral] = useState(false);
  const [autoSelectedPurchase, setAutoSelectedPurchase] = useState(false);
  const [autoSelectedUnit, setAutoSelectedUnit] = useState(false);
  const [autoSelectedArea, setAutoSelectedArea] = useState(false);
  const [autoSelectedTransferType, setAutoSelectedTransferType] =
    useState(false);
  const [latestMaktoobInfo, setLatestMaktoobInfo] = useState(null);
  const [latestPurchaseInfo, setLatestPurchaseInfo] = useState(null);
  const [showAutoSelectionMessage, setShowAutoSelectionMessage] =
    useState(false);
  const [fieldLockStatus, setFieldLockStatus] = useState({
    mineral: false,
    purchase: false,
    unit: false,
    area: false,
    transfor_type: false,
  });

  // ** Print States
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);

  // ** Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Filter vehicles for selected company
  const filterVehiclesForCompany = useCallback((companyId) => {
    if (!companyId || !vehicles.length) return [];

    return vehicles.filter((vehicle) => {
      if (!vehicle) return false;

      if (vehicle.companies && Array.isArray(vehicle.companies)) {
        return vehicle.companies.some((comp) => {
          if (!comp) return false;
          if (typeof comp === "object") {
            return comp.id == companyId;
          } else {
            return comp == companyId;
          }
        });
      }
      return false;
    });
  }, [vehicles]);

  // ** Get latest purchase info for company - UPDATED
  const getLatestPurchaseInfo = useCallback((companyId) => {
    if (!companyId) return null;

    // Use the new function if available
    if (getLatestPurchaseForCompany) {
      return getLatestPurchaseForCompany(companyId);
    }

    // Fallback to original logic
    const companyPurchases = purchases.filter((purchase) => {
      if (!purchase) return false;
      
      let purchaseCompanyId;
      if (purchase.company) {
        if (typeof purchase.company === 'object') {
          purchaseCompanyId = purchase.company.id;
        } else {
          purchaseCompanyId = purchase.company;
        }
      }
      return purchaseCompanyId == companyId;
    });

    if (companyPurchases.length === 0) return null;

    const sortedPurchases = [...companyPurchases].sort((a, b) => {
      if (!a || !b) return 0;
      return (b.id || 0) - (a.id || 0);
    });
    
    const latestPurchase = sortedPurchases[0];

    const mineralObj = minerals.find(
      (m) => m && m.id == (latestPurchase.mineral?.id || latestPurchase.mineral),
    );
    const unitObj = units.find(
      (u) => u && u.id == (latestPurchase.unit?.id || latestPurchase.unit),
    );

    // Get maktoob details
    let maktoobObj = null;
    if (latestPurchase.maktoob) {
      if (typeof latestPurchase.maktoob === "object") {
        maktoobObj = latestPurchase.maktoob;
      } else {
        maktoobObj = maktoobs.find((m) => m && m.id == latestPurchase.maktoob);
      }
    }

    return {
      purchase: latestPurchase,
      id: latestPurchase.id,
      purchase_number: latestPurchase.purchase_number || latestPurchase.id,
      royalty_receipt_number: latestPurchase.royalty_receipt_number || "N/A",
      mineral: latestPurchase.mineral,
      mineral_name: mineralObj?.name || "N/A",
      mineral_id: mineralObj?.id || null,
      maktoob: latestPurchase.maktoob,
      maktoob_obj: maktoobObj,
      area: latestPurchase.area || "N/A",
      mineral_amount: latestPurchase.mineral_amount || 0,
      unit: latestPurchase.unit,
      unit_id: unitObj?.id || null,
      unit_name: unitObj?.name || "N/A",
      unit_price: latestPurchase.unit_price || "N/A",
      create_at:
        latestPurchase.create_at || new Date().toISOString().split("T")[0],
    };
  }, [purchases, minerals, units, maktoobs, getLatestPurchaseForCompany]);

  // ** Get maktoob info
  const getMaktoobInfo = useCallback((maktoob) => {
    if (!maktoob) return null;

    let maktoobObj;
    if (typeof maktoob === "object") {
      maktoobObj = maktoob;
    } else {
      maktoobObj = maktoobs.find((m) => m && m.id == maktoob);
    }

    if (!maktoobObj) return null;

    return {
      id: maktoobObj.id,
      maktoob_number: maktoobObj.maktoob_number || "N/A",
      maktoob_type: maktoobObj.maktoob_type || "N/A",
      source: maktoobObj.source || "N/A",
      sadir_date: maktoobObj.sadir_date || "N/A",
      start_date: maktoobObj.start_date || "N/A",
      end_date: maktoobObj.end_date || "N/A",
    };
  }, [maktoobs]);

  // ** Auto-set transfer type based on maktoob type
  const getTransferTypeFromMaktoob = useCallback((maktoobType) => {
    if (!maktoobType) return "incoming";

    const typeLower = maktoobType.toLowerCase();

    if (
      typeLower.includes("import") ||
      typeLower.includes("incoming") ||
      typeLower.includes("واردات")
    ) {
      return "incoming";
    } else if (
      typeLower.includes("export") ||
      typeLower.includes("outgoing") ||
      typeLower.includes("صادرات")
    ) {
      return "outgoing";
    } else if (typeLower.includes("internal") || typeLower.includes("داخلی")) {
      return "internal";
    }

    return "incoming";
  }, []);

  // ** AUTO-SELECT ALL FIELDS BASED ON LATEST PURCHASE
  const autoSelectAllFieldsFromLatestPurchase = useCallback((companyId) => {
    const latestPurchase = getLatestPurchaseInfo(companyId);
    if (!latestPurchase || !latestPurchase.purchase) return;

    setLatestPurchaseInfo(latestPurchase);

    // Get maktoob info
    if (latestPurchase.maktoob_obj || latestPurchase.maktoob) {
      const maktoobInfo = getMaktoobInfo(
        latestPurchase.maktoob_obj || latestPurchase.maktoob,
      );
      setLatestMaktoobInfo(maktoobInfo);

      if (maktoobInfo?.maktoob_type) {
        const transferType = getTransferTypeFromMaktoob(
          maktoobInfo.maktoob_type,
        );
        setFormData((prev) => ({
          ...prev,
          transfor_type: transferType,
        }));
        setAutoSelectedTransferType(true);
        setFieldLockStatus((prev) => ({ ...prev, transfor_type: true }));
      }
    }

    // Auto-select mineral if available
    if (latestPurchase.mineral_id && !formData.mineral) {
      setFormData((prev) => ({
        ...prev,
        mineral: latestPurchase.mineral_id.toString(),
      }));
      setSelectedMineralDetails(
        minerals.find((m) => m && m.id == latestPurchase.mineral_id),
      );
      setAutoSelectedMineral(true);
      setFieldLockStatus((prev) => ({ ...prev, mineral: true }));
    }

    // Auto-select unit if available
    if (latestPurchase.unit_id && !formData.unit) {
      setFormData((prev) => ({
        ...prev,
        unit: latestPurchase.unit_id.toString(),
      }));
      setSelectedUnitDetails(units.find((u) => u && u.id == latestPurchase.unit_id));
      setAutoSelectedUnit(true);
      setFieldLockStatus((prev) => ({ ...prev, unit: true }));
    }

    // Auto-select area from latest purchase
    if (
      latestPurchase.area &&
      latestPurchase.area !== "N/A" &&
      !formData.area
    ) {
      setFormData((prev) => ({
        ...prev,
        area: latestPurchase.area,
      }));
      setAutoSelectedArea(true);
      setFieldLockStatus((prev) => ({ ...prev, area: true }));
    }

    // Auto-select purchase
    if (latestPurchase.id && !formData.purchase) {
      setFormData((prev) => ({
        ...prev,
        purchase: latestPurchase.id.toString(),
      }));
      setSelectedPurchaseDetails(latestPurchase.purchase);
      setAutoSelectedPurchase(true);
      setFieldLockStatus((prev) => ({ ...prev, purchase: true }));
    }

    // Show auto-selection message
    setShowAutoSelectionMessage(true);
    setTimeout(() => {
      setShowAutoSelectionMessage(false);
    }, 5000);
  }, [getLatestPurchaseInfo, getMaktoobInfo, getTransferTypeFromMaktoob, minerals, units, formData]);

  // ** Initialize form
  useEffect(() => {
    if (isEdit && initialData) {
      const {
        bill_number,
        empty_weight,
        second_weight,
        mineral_net_weight,
        control_weight,
        transfor_type,
        area,
        discharge_place,
        create_at,
        company,
        vehicle,
        plate_number,
        driver_name,
        scale,
        mineral,
        unit,
        purchase,
        user,
      } = initialData;

      setFormData({
        bill_number: bill_number || "",
        empty_weight: empty_weight || "",
        second_weight: second_weight || "",
        mineral_net_weight: mineral_net_weight || "",
        control_weight: control_weight || "",
        transfor_type: transfor_type || "incoming",
        area: area || "",
        discharge_place: discharge_place || "",
        create_at: create_at
          ? create_at.split("T")[0]
          : new Date().toISOString().split("T")[0],
        company:
          company?.id || company || (selectedCompany ? selectedCompany.id : ""),
        vehicle: vehicle?.id || vehicle || "",
        plate_number: plate_number || "",
        driver_name: driver_name || "",
        scale: scale?.id || scale || "",
        mineral: mineral?.id || mineral || "",
        unit: unit?.id || unit || "",
        purchase: purchase?.id || purchase || "",
        user: user?.id || user || localStorage.getItem("user_id") || "",
      });

      if (company) {
        const companyId = company?.id || company;
        const companyObj = companies.find((c) => c && c.id == companyId);
        setSelectedCompanyDetails(companyObj || selectedCompany);
      }

      if (vehicle) {
        const vehicleId = vehicle?.id || vehicle;
        const vehicleObj = vehicles.find((v) => v && v.id == vehicleId);
        setSelectedVehicleDetails(vehicleObj || null);

        if (vehicleObj && !plate_number) {
          setFormData((prev) => ({
            ...prev,
            plate_number: vehicleObj.plate_number || "",
            driver_name: vehicleObj.driver_name || "",
            empty_weight: vehicleObj.empty_weight || "",
          }));
        }
      }

      if (scale) {
        const scaleId = scale?.id || scale;
        const scaleObj = scales.find((s) => s && s.id == scaleId);
        setSelectedScaleDetails(scaleObj || null);
      }

      if (mineral) {
        const mineralId = mineral?.id || mineral;
        const mineralObj = minerals.find((m) => m && m.id == mineralId);
        setSelectedMineralDetails(mineralObj || null);
      }

      if (unit) {
        const unitId = unit?.id || unit;
        const unitObj = units.find((u) => u && u.id == unitId);
        setSelectedUnitDetails(unitObj || null);
      }

      if (purchase) {
        const purchaseId = purchase?.id || purchase;
        const purchaseObj = purchases.find((p) => p && p.id == purchaseId);
        setSelectedPurchaseDetails(purchaseObj || null);
      }
    } else if (selectedCompany) {
      setSelectedCompanyDetails(selectedCompany);
      setFormData((prev) => ({
        ...prev,
        company: selectedCompany.id,
      }));

      // Auto-select fields after a short delay
      setTimeout(() => {
        autoSelectAllFieldsFromLatestPurchase(selectedCompany.id);
      }, 100);
    }
  }, [
    isEdit,
    initialData,
    minerals,
    units,
    purchases,
    companies,
    selectedCompany,
    vehicles,
    maktoobs,
    scales,
    autoSelectAllFieldsFromLatestPurchase,
  ]);

  // ** Update selected scale when form data changes
  useEffect(() => {
    if (formData.scale) {
      const scaleId = parseInt(formData.scale);
      const scaleObj = scales.find((s) => s && s.id == scaleId);
      setSelectedScaleDetails(scaleObj || null);
    } else {
      setSelectedScaleDetails(null);
    }
  }, [formData.scale, scales]);

  // ** Filter purchases when company changes - UPDATED
  useEffect(() => {
    if (formData.company) {
      const companyId = parseInt(formData.company);
      const companyObj = companies.find((c) => c && c.id == companyId);
      setSelectedCompanyDetails(companyObj || null);

      // Filter vehicles
      const companyVehicles = filterVehiclesForCompany(companyId);
      setFilteredVehicles(companyVehicles);

      // Filter purchases using new function if available
      let companyPurchases = [];
      if (getPurchasesForCompany) {
        companyPurchases = getPurchasesForCompany(companyId);
      } else {
        // Fallback to original logic
        companyPurchases = purchases.filter((purchase) => {
          if (!purchase) return false;
          
          let purchaseCompanyId;
          if (purchase.company) {
            if (typeof purchase.company === 'object') {
              purchaseCompanyId = purchase.company.id;
            } else {
              purchaseCompanyId = purchase.company;
            }
          }
          return purchaseCompanyId == companyId;
        });
      }

      console.log(`Company ${companyId} purchases:`, companyPurchases.length);

      // Get unique minerals from company's purchases
      const purchaseMinerals = companyPurchases.reduce((acc, purchase) => {
        const mineralId = purchase.mineral?.id || purchase.mineral;
        if (mineralId && !acc.some((m) => m && m.id == mineralId)) {
          const mineral = minerals.find((m) => m && m.id == mineralId);
          if (mineral) {
            acc.push(mineral);
          }
        }
        return acc;
      }, []);

      // Get unique units from company's purchases
      const purchaseUnits = companyPurchases.reduce((acc, purchase) => {
        const unitId = purchase.unit?.id || purchase.unit;
        if (unitId && !acc.some((u) => u && u.id == unitId)) {
          const unit = units.find((u) => u && u.id == unitId);
          if (unit) {
            acc.push(unit);
          }
        }
        return acc;
      }, []);

      setFilteredMinerals(purchaseMinerals);
      setFilteredUnits(purchaseUnits);

      // Sort purchases by ID descending
      companyPurchases.sort((a, b) => {
        if (!a || !b) return 0;
        return (b.id || 0) - (a.id || 0);
      });
      
      setFilteredPurchases(companyPurchases);

      // Auto-select mineral if only one available
      if (
        purchaseMinerals.length === 1 &&
        !formData.mineral &&
        !autoSelectedMineral
      ) {
        setFormData((prev) => ({
          ...prev,
          mineral: purchaseMinerals[0].id.toString(),
        }));
        setSelectedMineralDetails(purchaseMinerals[0]);
        setAutoSelectedMineral(true);
        setFieldLockStatus((prev) => ({ ...prev, mineral: true }));
      }

      // Auto-select unit if only one available
      if (purchaseUnits.length === 1 && !formData.unit) {
        setFormData((prev) => ({
          ...prev,
          unit: purchaseUnits[0].id.toString(),
        }));
        setSelectedUnitDetails(purchaseUnits[0]);
        setAutoSelectedUnit(true);
        setFieldLockStatus((prev) => ({ ...prev, unit: true }));
      }

      // Auto-select latest purchase if available
      if (companyPurchases.length > 0 && !formData.purchase) {
        const latestPurchase = companyPurchases[0];
        setFormData((prev) => ({
          ...prev,
          purchase: latestPurchase.id.toString(),
        }));
        setSelectedPurchaseDetails(latestPurchase);
        setAutoSelectedPurchase(true);
        setFieldLockStatus((prev) => ({ ...prev, purchase: true }));

        // Auto-select mineral from latest purchase
        const mineralId = latestPurchase.mineral?.id || latestPurchase.mineral;
        if (mineralId && mineralId != formData.mineral) {
          setFormData((prev) => ({
            ...prev,
            mineral: mineralId.toString(),
          }));
          const mineralObj = minerals.find((m) => m && m.id == mineralId);
          setSelectedMineralDetails(mineralObj);
          setAutoSelectedMineral(true);
          setFieldLockStatus((prev) => ({ ...prev, mineral: true }));
        }

        // Auto-select unit from latest purchase
        const unitId = latestPurchase.unit?.id || latestPurchase.unit;
        if (unitId && unitId != formData.unit) {
          setFormData((prev) => ({
            ...prev,
            unit: unitId.toString(),
          }));
          const unitObj = units.find((u) => u && u.id == unitId);
          setSelectedUnitDetails(unitObj);
          setAutoSelectedUnit(true);
          setFieldLockStatus((prev) => ({ ...prev, unit: true }));
        }

        // Get maktoob info
        if (latestPurchase.maktoob) {
          const maktoobInfo = getMaktoobInfo(latestPurchase.maktoob);
          setLatestMaktoobInfo(maktoobInfo);
          if (maktoobInfo) {
            const transferType = getTransferTypeFromMaktoob(
              maktoobInfo.maktoob_type,
            );
            setFormData((prev) => ({
              ...prev,
              transfor_type: transferType,
            }));
            setAutoSelectedTransferType(true);
            setFieldLockStatus((prev) => ({ ...prev, transfor_type: true }));
          }
        }

        // Auto-select area
        if (latestPurchase.area && !formData.area) {
          setFormData((prev) => ({
            ...prev,
            area: latestPurchase.area,
          }));
          setAutoSelectedArea(true);
          setFieldLockStatus((prev) => ({ ...prev, area: true }));
        }
      }
    } else {
      setSelectedCompanyDetails(null);
      setFilteredVehicles(vehicles);
      setFilteredMinerals(minerals);
      setFilteredUnits(units);
      setFilteredPurchases([]);
      setAutoSelectedMineral(false);
      setAutoSelectedPurchase(false);
      setAutoSelectedUnit(false);
      setAutoSelectedArea(false);
      setAutoSelectedTransferType(false);
      setLatestMaktoobInfo(null);
      setLatestPurchaseInfo(null);
      setFieldLockStatus({
        mineral: false,
        purchase: false,
        unit: false,
        area: false,
        transfor_type: false,
      });
    }
  }, [
    formData.company,
    companies,
    vehicles,
    purchases,
    minerals,
    units,
    maktoobs,
    filterVehiclesForCompany,
    getMaktoobInfo,
    getTransferTypeFromMaktoob,
    getPurchasesForCompany,
    formData.mineral,
    formData.unit,
    formData.purchase,
    formData.area,
    autoSelectedMineral,
    autoSelectedUnit,
  ]);

  // ** Filter purchases further when mineral is selected
  useEffect(() => {
    if (formData.company && formData.mineral) {
      const companyId = parseInt(formData.company);
      const mineralId = parseInt(formData.mineral);

      // First get all company purchases
      let companyPurchases = [];
      if (getPurchasesForCompany) {
        companyPurchases = getPurchasesForCompany(companyId);
      } else {
        companyPurchases = purchases.filter((purchase) => {
          if (!purchase) return false;
          
          let purchaseCompanyId;
          if (purchase.company) {
            if (typeof purchase.company === 'object') {
              purchaseCompanyId = purchase.company.id;
            } else {
              purchaseCompanyId = purchase.company;
            }
          }
          return purchaseCompanyId == companyId;
        });
      }

      // Then filter by mineral
      const filtered = companyPurchases.filter((purchase) => {
        if (!purchase) return false;
        const purchaseMineralId = purchase.mineral?.id || purchase.mineral;
        return purchaseMineralId == mineralId;
      });

      console.log(`Company ${companyId}, Mineral ${mineralId} purchases:`, filtered.length);

      // Sort by ID descending
      filtered.sort((a, b) => {
        if (!a || !b) return 0;
        return (b.id || 0) - (a.id || 0);
      });
      
      setFilteredPurchases(filtered);

      // Auto-select latest purchase if available
      if (filtered.length > 0 && !formData.purchase && !autoSelectedPurchase) {
        const latestPurchase = filtered[0];
        setFormData((prev) => ({
          ...prev,
          purchase: latestPurchase.id.toString(),
        }));
        setSelectedPurchaseDetails(latestPurchase);
        setAutoSelectedPurchase(true);
        setFieldLockStatus((prev) => ({ ...prev, purchase: true }));

        // Auto-select unit from latest purchase
        const unitId = latestPurchase.unit?.id || latestPurchase.unit;
        if (unitId && unitId != formData.unit) {
          const unitObj = units.find((u) => u && u.id == unitId);
          if (unitObj) {
            setFormData((prev) => ({
              ...prev,
              unit: unitId.toString(),
            }));
            setSelectedUnitDetails(unitObj);
            setAutoSelectedUnit(true);
            setFieldLockStatus((prev) => ({ ...prev, unit: true }));
          }
        }

        // Get maktoob info
        if (latestPurchase.maktoob) {
          const maktoobInfo = getMaktoobInfo(latestPurchase.maktoob);
          if (maktoobInfo) {
            const transferType = getTransferTypeFromMaktoob(
              maktoobInfo.maktoob_type,
            );
            setFormData((prev) => ({
              ...prev,
              transfor_type: transferType,
            }));
            setAutoSelectedTransferType(true);
            setFieldLockStatus((prev) => ({ ...prev, transfor_type: true }));
          }
        }
      }
    } else if (formData.company) {
      const companyId = parseInt(formData.company);
      
      let companyPurchases = [];
      if (getPurchasesForCompany) {
        companyPurchases = getPurchasesForCompany(companyId);
      } else {
        companyPurchases = purchases.filter((purchase) => {
          if (!purchase) return false;
          
          let purchaseCompanyId;
          if (purchase.company) {
            if (typeof purchase.company === 'object') {
              purchaseCompanyId = purchase.company.id;
            } else {
              purchaseCompanyId = purchase.company;
            }
          }
          return purchaseCompanyId == companyId;
        });
      }

      // Sort by ID descending
      companyPurchases.sort((a, b) => {
        if (!a || !b) return 0;
        return (b.id || 0) - (a.id || 0);
      });
      
      setFilteredPurchases(companyPurchases);
    }
  }, [formData.company, formData.mineral, purchases, units, maktoobs, getMaktoobInfo, getTransferTypeFromMaktoob, getPurchasesForCompany, formData.unit, formData.purchase, autoSelectedPurchase]);

  // ** Update selected details when form data changes
  useEffect(() => {
    if (formData.mineral) {
      const mineralId = parseInt(formData.mineral);
      const mineralObj = minerals.find((m) => m && m.id == mineralId);
      setSelectedMineralDetails(mineralObj || null);
    } else {
      setSelectedMineralDetails(null);
    }

    if (formData.unit) {
      const unitId = parseInt(formData.unit);
      const unitObj = units.find((u) => u && u.id == unitId);
      setSelectedUnitDetails(unitObj || null);
    } else {
      setSelectedUnitDetails(null);
    }

    if (formData.purchase) {
      const purchaseId = parseInt(formData.purchase);
      const purchaseObj = purchases.find((p) => p && p.id == purchaseId);
      setSelectedPurchaseDetails(purchaseObj || null);

      if (purchaseObj?.maktoob && !isEdit) {
        const maktoobInfo = getMaktoobInfo(purchaseObj.maktoob);
        if (maktoobInfo) {
          const transferType = getTransferTypeFromMaktoob(
            maktoobInfo.maktoob_type,
          );
          setFormData((prev) => ({
            ...prev,
            transfor_type: transferType,
          }));
        }
      }

      // Check balance when mineral and net weight are available
      if (formData.mineral && formData.mineral_net_weight) {
        checkMineralBalance(
          purchaseId,
          formData.mineral,
          formData.mineral_net_weight,
        );
      }
    } else {
      setSelectedPurchaseDetails(null);
    }
  }, [
    formData.mineral,
    formData.unit,
    formData.purchase,
    minerals,
    units,
    purchases,
    maktoobs,
    isEdit,
    getMaktoobInfo,
    getTransferTypeFromMaktoob,
    formData.mineral_net_weight,
  ]);

  // ** Handle company change
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;

    setAutoSelectedMineral(false);
    setAutoSelectedPurchase(false);
    setAutoSelectedUnit(false);
    setAutoSelectedArea(false);
    setAutoSelectedTransferType(false);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      vehicle: "",
      plate_number: "",
      driver_name: "",
      empty_weight: "",
      mineral: "",
      unit: "",
      purchase: "",
      area: "",
      transfor_type: "incoming",
    }));

    setSelectedVehicleDetails(null);
    setSelectedMineralDetails(null);
    setSelectedUnitDetails(null);
    setSelectedPurchaseDetails(null);
    setSelectedScaleDetails(null);
    setBalanceInfo(null);
    setLatestMaktoobInfo(null);
    setLatestPurchaseInfo(null);

    setFieldLockStatus({
      mineral: false,
      purchase: false,
      unit: false,
      area: false,
      transfor_type: false,
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (value) {
      setTimeout(() => {
        autoSelectAllFieldsFromLatestPurchase(value);
      }, 100);
    }
  };

  // ** Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "company") {
      handleCompanyChange(e);
      return;
    }

    // Check if field is locked (auto-selected)
    if (fieldLockStatus[name] && !isEdit) {
      return; // Don't allow changes if field is locked
    }

    if (name === "mineral") {
      setAutoSelectedMineral(false);
      setFieldLockStatus((prev) => ({ ...prev, mineral: false }));
    }

    if (name === "purchase") {
      setAutoSelectedPurchase(false);
      setFieldLockStatus((prev) => ({ ...prev, purchase: false }));
    }

    if (name === "unit") {
      setAutoSelectedUnit(false);
      setFieldLockStatus((prev) => ({ ...prev, unit: false }));
    }

    if (name === "area") {
      setAutoSelectedArea(false);
      setFieldLockStatus((prev) => ({ ...prev, area: false }));
    }

    if (name === "transfor_type") {
      setAutoSelectedTransferType(false);
      setFieldLockStatus((prev) => ({ ...prev, transfor_type: false }));
    }

    if (name === "scale") {
      const scaleObj = scales.find((s) => s && s.id == value);
      setSelectedScaleDetails(scaleObj || null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "mineral") {
      setFormData((prev) => ({
        ...prev,
        purchase: "",
      }));
      setBalanceInfo(null);
      setSelectedPurchaseDetails(null);
      setAutoSelectedPurchase(false);
      setFieldLockStatus((prev) => ({ ...prev, purchase: false }));
    }
  };

  // ** Function to handle vehicle selection by plate number
  const handlePlateNumberChange = (e) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      plate_number: value,
      vehicle: "",
      driver_name: "",
      empty_weight: "",
    }));

    const foundVehicle = filteredVehicles.find(
      (v) =>
        v && v.plate_number &&
        v.plate_number.toLowerCase() === value.toLowerCase().trim(),
    );

    if (foundVehicle) {
      setSelectedVehicleDetails(foundVehicle);
      setFormData((prev) => ({
        ...prev,
        vehicle: foundVehicle.id,
        driver_name: foundVehicle.driver_name || "",
        empty_weight: foundVehicle.empty_weight || "",
      }));

      if (errors.vehicle) {
        setErrors((prev) => ({
          ...prev,
          vehicle: "",
        }));
      }
    } else {
      setSelectedVehicleDetails(null);
    }
  };

  // ** Function to handle vehicle selection by dropdown
  const handleVehicleSelect = (e) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      vehicle: value,
      plate_number: "",
      driver_name: "",
      empty_weight: "",
    }));

    if (value) {
      const selectedVehicle = filteredVehicles.find((v) => v && v.id == value);
      if (selectedVehicle) {
        setSelectedVehicleDetails(selectedVehicle);
        setFormData((prev) => ({
          ...prev,
          plate_number: selectedVehicle.plate_number || "",
          driver_name: selectedVehicle.driver_name || "",
          empty_weight: selectedVehicle.empty_weight || "",
        }));
      }
    } else {
      setSelectedVehicleDetails(null);
    }

    if (errors.vehicle) {
      setErrors((prev) => ({
        ...prev,
        vehicle: "",
      }));
    }
  };

  // ** Function to auto-calculate net weight
  useEffect(() => {
    if (formData.empty_weight && formData.second_weight) {
      const empty = parseFloat(formData.empty_weight);
      const second = parseFloat(formData.second_weight);

      if (!isNaN(empty) && !isNaN(second) && second > empty) {
        const netWeight = second - empty;
        setFormData((prev) => ({
          ...prev,
          mineral_net_weight: netWeight.toString(),
        }));

        if (formData.purchase && formData.mineral) {
          checkMineralBalance(formData.purchase, formData.mineral, netWeight);
        }
      }
    }
  }, [formData.empty_weight, formData.second_weight]);

  // ** Function to check mineral balance
  const checkMineralBalance = async (
    purchaseId,
    mineralId,
    netWeight = null,
  ) => {
    if (!onCheckBalance || !purchaseId || !mineralId) {
      setBalanceInfo(null);
      return;
    }

    setBalanceLoading(true);
    try {
      const result = await onCheckBalance(purchaseId, mineralId, netWeight);
      setBalanceInfo(result);
    } catch (error) {
      console.error("Error checking balance:", error);
      setBalanceInfo({
        isValid: false,
        message: `Error checking balance: ${error.message}`,
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  // ** Get unit name from purchase
  const getUnitNameFromPurchase = useCallback((purchase) => {
    if (!purchase) return "N/A";

    if (typeof purchase.unit === "object" && purchase.unit) {
      return purchase.unit.name || purchase.unit.unit_name || "N/A";
    } else if (purchase.unit) {
      const unitId = purchase.unit;
      const unit = units.find((u) => u && u.id == unitId);
      return unit?.name || unit?.unit_name || "N/A";
    }

    return "N/A";
  }, [units]);

  // ** Get maktoob number from purchase
  const getMaktoobNumberFromPurchase = useCallback((purchase) => {
    if (!purchase || !purchase.maktoob) return "N/A";

    if (typeof purchase.maktoob === "object" && purchase.maktoob) {
      return purchase.maktoob.maktoob_number || "N/A";
    } else {
      const maktoobId = purchase.maktoob;
      const maktoob = maktoobs.find((m) => m && m.id == maktoobId);
      return maktoob?.maktoob_number || "N/A";
    }
  }, [maktoobs]);

  // ** Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.bill_number.trim()) {
      newErrors.bill_number = t("Bill number is required");
    } else if (isEdit) {
      if (
        formData.bill_number !== initialData?.bill_number &&
        existingBillNumbers.includes(formData.bill_number)
      ) {
        newErrors.bill_number = t("This bill number already exists");
      }
    } else {
      if (existingBillNumbers.includes(formData.bill_number)) {
        newErrors.bill_number = t("This bill number already exists");
      }
    }

    if (!selectedCompany && !formData.company) {
      newErrors.company = t("Company is required");
    }

    if (!formData.vehicle && !formData.plate_number) {
      newErrors.vehicle = t("Vehicle or Plate Number is required");
    }

    if (formData.company && filteredVehicles.length === 0) {
      newErrors.vehicle = t(
        "No vehicles found for this company. Please add vehicles to this company first.",
      );
    }

    if (!formData.empty_weight) {
      newErrors.empty_weight = t("Empty weight is required");
    }

    if (!formData.second_weight) {
      newErrors.second_weight = t("Second weight is required");
    } else if (formData.empty_weight && formData.second_weight) {
      const empty = parseFloat(formData.empty_weight);
      const second = parseFloat(formData.second_weight);

      if (second <= empty) {
        newErrors.second_weight = t(
          "Second weight must be greater than empty weight",
        );
      }
    }

    if (!formData.mineral_net_weight) {
      newErrors.mineral_net_weight = t("Net weight is required");
    }

    if (!formData.transfor_type) {
      newErrors.transfor_type = t("Transfer type is required");
    }

    if (!formData.mineral) {
      newErrors.mineral = t("Mineral is required");
    } else if (filteredMinerals.length === 0 && formData.company) {
      newErrors.mineral = t("No minerals available for this company");
    }

    if (!formData.unit) {
      newErrors.unit = t("Unit is required");
    }

    if (!formData.purchase) {
      newErrors.purchase = t("Purchase is required");
    } else if (
      filteredPurchases.length === 0 &&
      formData.company &&
      formData.mineral
    ) {
      newErrors.purchase = t(
        "No purchases available for this company and mineral",
      );
    }

    if (!formData.scale) {
      newErrors.scale = t("Scale is required");
    }

    if (!formData.area.trim()) {
      newErrors.area = t("Area is required");
    }

    if (!formData.create_at) {
      newErrors.create_at = t("Date is required");
    }

    if (balanceInfo && !balanceInfo.isValid) {
      newErrors.balance = balanceInfo.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ** Prepare data for printing
  const preparePrintData = (savedData = null) => {
    const dataToUse = savedData || formData;

    return {
      weightData: {
        ...dataToUse,
        id: savedData?.id || generateWeightId(),
        bill_number: dataToUse.bill_number,
        empty_weight: dataToUse.empty_weight,
        second_weight: dataToUse.second_weight,
        mineral_net_weight: dataToUse.mineral_net_weight,
        control_weight: dataToUse.control_weight || 0,
        transfor_type: dataToUse.transfor_type,
        area: dataToUse.area,
        discharge_place: dataToUse.discharge_place,
        create_at: dataToUse.create_at || new Date().toISOString(),
        plate_number:
          formData.plate_number || selectedVehicleDetails?.plate_number,
        driver_name:
          formData.driver_name || selectedVehicleDetails?.driver_name,
        status: "completed",
      },
      company: selectedCompanyDetails,
      vehicle: selectedVehicleDetails,
      scale: selectedScaleDetails,
      mineral: selectedMineralDetails,
      unit: selectedUnitDetails,
      purchase: selectedPurchaseDetails,
      user: {
        id: localStorage.getItem("user_id") || "1",
        name: localStorage.getItem("user_name") || "Admin",
        username: localStorage.getItem("username") || "admin",
      },
    };
  };

  // ** Generate weight ID
  const generateWeightId = () => {
    // Get scale ID from selected scale
    const scaleId = formData.scale
      ? scales.find((s) => s && s.id == formData.scale)?.id
      : "0000";
    const cleanScaleId = scaleId?.toString().replace(/-/g, "") || "0000";

    // Generate sequential number
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);

    // Format: SID + "W-" + number
    return `${cleanScaleId}W-${timestamp}${randomNum}`;
  };

  // ** Get second weight from scale
  const getSecondWeightFromScale = () => {
    // In production, this would read from the serial port
    // For now, we'll simulate with a fixed value or use the form value
    if (formData.second_weight) {
      return formData.second_weight;
    }
    
    // Simulate scale reading
    const simulatedWeight = Math.floor(Math.random() * 10000) + 1000;
    return simulatedWeight.toString();
  };

  // ** Print function
  const executePrint = () => {
    setPrintLoading(true);

    // Create print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print");
      setPrintLoading(false);
      return;
    }

    // Get print data
    const printData = preparePrintData();

    // Create a temporary container for the print content
    const tempContainer = document.createElement('div');
    tempContainer.id = 'print-temp-container';
    tempContainer.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';
    document.body.appendChild(tempContainer);

    // Render the WeightPreview component in the temp container
    const printStyles = `
      <style>
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }
          
          .print-container {
            width: 794px;
            margin: 0 auto;
            transform: scale(0.85);
            transform-origin: top left;
          }
          
          .bill-copy {
            width: 100%;
            min-height: 540px;
            border: 2px solid #000;
            padding: 10px;
            margin-bottom: 40px;
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          
          .copy-separator {
            border-top: 2px solid #000;
            margin: 40px 0;
            height: 0;
          }
          
          .copy-label {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #000;
          }
          
          /* Hide everything except print content */
          body * {
            visibility: hidden;
          }
          
          #print-content, #print-content * {
            visibility: visible;
          }
          
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        
        body {
          background: white;
        }
        
        .no-print {
          display: none;
        }
      </style>
    `;

    // Render the WeightPreview component
    tempContainer.innerHTML = `
      <div id="print-content" class="print-container">
        <!-- Original Copy -->
        <div class="bill-copy">
          ${renderBillCopyHTML(printData, false)}
        </div>
        
        <div class="copy-separator"></div>
        
        <!-- Duplicate Copy -->
        <div class="bill-copy">
          <div class="copy-label">کاپی</div>
          ${renderBillCopyHTML(printData, true)}
        </div>
      </div>
    `;

    // Create the full print HTML
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Weight Ticket - ${printData.weightData.bill_number}</title>
        ${printStyles}
      </head>
      <body>
        ${tempContainer.innerHTML}
        
        <script>
          // Auto-print
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 500);
          };
          
          // Fallback for print cancellation
          window.addEventListener('afterprint', function() {
            setTimeout(function() {
              window.close();
            }, 1000);
          });
        </script>
      </body>
      </html>
    `;

    // Clean up temp container
    document.body.removeChild(tempContainer);

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // ** Function to render bill copy HTML for printing
  const renderBillCopyHTML = (data, isCopy = false) => {
    const weightId = data.weightData.id || generateWeightId();
    const qrData = JSON.stringify({
      weight_id: weightId,
      bill_number: data.weightData.bill_number,
      plate_number: data.weightData.plate_number || data.vehicle?.plate_number,
      driver_name: data.weightData.driver_name || data.vehicle?.driver_name,
      company_name: data.company?.company_name,
      mineral_name: data.mineral?.name,
      empty_weight: data.weightData.empty_weight,
      second_weight: data.weightData.second_weight,
      net_weight: data.weightData.mineral_net_weight,
      date: data.weightData.create_at || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
    });

    return `
      <div style="font-family: Arial, sans-serif; font-size: 14px;">
        ${!isCopy ? '<h3 style="text-align: center; margin: 0; color: #000;">Original Copy</h3>' : ''}
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid #000; margin-bottom: 10px;">
          <!-- Left Logo -->
          <img src="/images/logo/logo1.png" alt="Logo" style="width: 70px; height: 70px; object-fit: contain;">
          
          <!-- Center Content -->
          <div style="text-align: center; flex: 1;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 5px 0;">امارت اسلامی افغانستان</h1>
            <h2 style="font-size: 18px; margin: 0 0 5px 0;">وزارت معادن و پطرولیم</h2>
            <h3 style="font-size: 16px; margin: 0;">مدیریت عمومی ترازوی شیدایی ولایت هرات (32AG)</h3>
          </div>
          
          <!-- Right Logo -->
          <img src="/images/logo/logo2.jpeg" alt="Logo" style="width: 70px; height: 70px; object-fit: contain;">
        </div>
        
        <!-- Scale Info -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 5px; background-color: #32a852; color: #fff; border-radius: 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-weight: bold;">نمبر ترازو:</span>
            <span>${data.scale?.id || '32AG'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <span style="font-weight: bold;">تاریخ:</span>
            <span>${data.weightData.create_at || new Date().toLocaleDateString('fa-IR')}</span>
            <span style="font-weight: bold;">زمان:</span>
            <span>${new Date().toLocaleTimeString('fa-IR')}</span>
          </div>
        </div>
        
        <!-- Main Content -->
        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
          <!-- QR Code -->
          <div style="flex: 0 0 140px; border: 1px solid #000; padding: 10px; text-align: center; background-color: #f9f9f9;">
            <div style="margin: 0 auto 10px auto;">
              <svg viewBox="0 0 21 21" width="120" height="120">
                <!-- QR Code would be generated here -->
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="8">QR Code</text>
              </svg>
            </div>
            <div style="font-size: 10px; color: #666; margin-top: 5px;">اسکن کنید برای تایید و اعتبارسنجی</div>
          </div>
          
          <!-- Details Table -->
          <div style="flex: 1;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tbody>
                <tr>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">نمبر مسلسل:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;" colspan="3"><strong>${weightId}</strong></td>
                </tr>
                <tr>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">نمبر پلیت موتر:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;"><strong>${data.weightData.plate_number || data.vehicle?.plate_number || ''}</strong></td>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">نام راننده:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">${data.weightData.driver_name || data.vehicle?.driver_name || ''}</td>
                </tr>
                <tr>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">نام مشتری شرکت:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">${data.company?.company_name || ''}</td>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">نوع منرال:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;">${data.mineral?.name || ''}</td>
                </tr>
                <tr>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">وزن خالی موتر:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;"><strong>${data.weightData.empty_weight || 0} KG</strong></td>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">وزن مع بار:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;"><strong>${data.weightData.second_weight || 0} KG</strong></td>
                </tr>
                <tr>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">وزن خالص منرال:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;" colspan="3">
                    <strong style="color: #28a745; font-size: 18px;">
                      ${data.weightData.mineral_net_weight || 0} ${data.unit?.name || 'KG'}
                    </strong>
                  </td>
                </tr>
                ${data.weightData.control_weight ? `
                <tr>
                  <td style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 25%; text-align: right;">وزن کنترول:</td>
                  <td style="border: 1px solid #ddd; padding: 8px; width: 25%;" colspan="3">${data.weightData.control_weight} KG</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Footer Text -->
        <div style="margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; text-align: center;">این پارچه از ساحه ترازو الی مقصد به تاریخ ذکر شده مدار اعتبار میباشد.</p>
          <p style="margin: 5px 0 0 0; font-size: 10px; text-align: center; color: #666;">نوت: پارچه های قلمی، فوتوکاپی، عکس گرفتگی وبیدون QR کود مدار اعتبار نمیباشد.</p>
        </div>
        
        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 15px; border-top: 1px solid #000;">
          <div style="width: 45%; text-align: center;">
            <div style="height: 40px; border-bottom: 1px solid #000; margin-bottom: 5px;"></div>
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 3px;">مهر و امضای مسئول توزین</div>
            <div style="font-size: 11px; color: #666;">${data.user?.name || 'مسئول توزین'}</div>
          </div>
          <div style="width: 45%; text-align: center;">
            <div style="height: 40px; border-bottom: 1px solid #000; margin-bottom: 5px;"></div>
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 3px;">امضای راننده</div>
            <div style="font-size: 11px; color: #666;">${data.weightData.driver_name || data.vehicle?.driver_name || ''}</div>
          </div>
        </div>
        
        <!-- Developer info -->
        <div style="margin-top: 10px; padding-top: 5px; border-top: 1px dashed #ddd;">
          <p style="margin: 0; font-size: 9px; text-align: center; color: #999;">Developed By: MIS Directorate , Phone: (+93) 0202927190 , Email: mis@momp.gov.af</p>
        </div>
      </div>
    `;
  };

  // ** SINGLE BUTTON HANDLER: Save and Print
  const handleSaveAndPrint = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      // Show error alert
      const errorAlert = document.createElement('div');
      errorAlert.className = 'alert alert-danger';
      errorAlert.innerHTML = t("Please fix the form errors before submitting.");
      document.body.appendChild(errorAlert);
      
      setTimeout(() => {
        document.body.removeChild(errorAlert);
      }, 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the submission data
      const submissionData = {
        bill_number: formData.bill_number,
        empty_weight: parseInt(formData.empty_weight) || 0,
        second_weight: parseInt(formData.second_weight) || 0,
        mineral_net_weight: parseInt(formData.mineral_net_weight) || 0,
        control_weight: formData.control_weight
          ? parseInt(formData.control_weight)
          : 0,
        transfor_type: formData.transfor_type,
        area: formData.area,
        discharge_place: formData.discharge_place,
        create_at: formData.create_at,
        vehicle: formData.vehicle ? parseInt(formData.vehicle) : null,
        scale: formData.scale ? parseInt(formData.scale) : null,
        mineral: formData.mineral ? parseInt(formData.mineral) : null,
        unit: formData.unit ? parseInt(formData.unit) : null,
        purchase: formData.purchase ? parseInt(formData.purchase) : null,
        user: formData.user ? parseInt(formData.user) : localStorage.getItem("user_id"),
      };

      // Add company if in company view
      if (selectedCompany) {
        submissionData.company = selectedCompany.id;
      } else if (formData.company) {
        submissionData.company = parseInt(formData.company);
      }

      console.log("Submitting data:", submissionData);

      // Call onSuccess (which is handleAddWeightSubmit from WeightTable)
      const savedData = await onSuccess(submissionData);

      if (savedData) {
        // Prepare print data with saved data from API
        const printData = preparePrintData(savedData);
        setPrintData(printData);

        // Show print modal
        setPrintModalOpen(true);

        // Auto-print after 1 second
        setTimeout(() => {
          executePrint();
        }, 1000);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      // Error is already handled in handleAddWeightSubmit
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle print preview
  const handlePrintPreview = () => {
    const printData = preparePrintData();
    setPrintData(printData);
    setPrintModalOpen(true);
  };

  return (
    <>
      <Form onSubmit={handleSaveAndPrint}>
        <Row>
          {/* Auto-selection notification */}
          {showAutoSelectionMessage && (
            <Col md="12">
              <Alert color="success" className="mb-3">
                <div className="d-flex align-items-center">
                  <CheckCircle size={20} className="me-2" />
                  <div>
                    <strong>{t("Auto-selection Applied!")}</strong>
                    <div className="mt-1">
                      {t(
                        "Fields have been automatically selected and locked based on the latest purchase.",
                      )}
                      {latestMaktoobInfo && (
                        <div className="mt-1">
                          {t("Maktoob")}: #{latestMaktoobInfo.maktoob_number} (
                          {latestMaktoobInfo.maktoob_type})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            </Col>
          )}

          {/* MAIN COLUMN - Manual Input Fields */}
          <Col md="6">
            <Card className="mb-3">
              <CardHeader>
                <CardTitle tag="h5">{t("Manual Input Fields")}</CardTitle>
              </CardHeader>
              <CardBody>
                {/* Second Weight - Connect to Scale Button */}
                <FormGroup>
                  <Label for="second_weight">
                    {t("Second Weight")} <span className="text-danger">*</span>
                  </Label>
                  <div className="d-flex">
                    <Input
                      id="second_weight"
                      name="second_weight"
                      type="number"
                      value={formData.second_weight}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormData((prev) => ({
                          ...prev,
                          second_weight: value,
                        }));
                      }}
                      placeholder={t("Enter second weight")}
                      invalid={!!errors.second_weight}
                      disabled={loading || isSubmitting}
                      min="0"
                      step="1"
                      className="me-2"
                    />
                    <Button
                      color="info"
                      onClick={() => {
                        const scaleReading = getSecondWeightFromScale();
                        setFormData(prev => ({
                          ...prev,
                          second_weight: scaleReading
                        }));
                      }}
                      disabled={loading || isSubmitting}
                    >
                      {t("Get from Scale")}
                    </Button>
                  </div>
                  {errors.second_weight && (
                    <span className="text-danger small">
                      {errors.second_weight}
                    </span>
                  )}
                  <small className="text-muted">
                    {t("Click 'Get from Scale' to read from connected scale")}
                  </small>
                </FormGroup>

                {/* Company - Only show if not in company view */}
                {!selectedCompany && (
                  <FormGroup>
                    <Label for="company">
                      {t("Company")} <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="select"
                      value={formData.company}
                      onChange={handleChange}
                      invalid={!!errors.company}
                      disabled={loading || isSubmitting}
                    >
                      <option value="">{t("Select company")}</option>
                      {companies.map((company) => {
                        if (!company) return null;
                        const vehicleCount = vehicles.filter(
                          (v) =>
                            v && v.companies &&
                            Array.isArray(v.companies) &&
                            v.companies.some(
                              (comp) =>
                                (typeof comp === "object" &&
                                  comp.id == company.id) ||
                                comp == company.id,
                            ),
                        ).length;

                        return (
                          <option key={company.id} value={company.id}>
                            {company.company_name}
                            {vehicleCount > 0 && ` (${vehicleCount} vehicles)`}
                          </option>
                        );
                      })}
                    </Input>
                    {errors.company && (
                      <span className="text-danger small">
                        {errors.company}
                      </span>
                    )}
                  </FormGroup>
                )}

                <FormGroup>
                  <Label for="vehicle">
                    {t("Select Vehicle")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="vehicle"
                    name="vehicle"
                    type="select"
                    value={formData.vehicle}
                    onChange={handleVehicleSelect}
                    invalid={!!errors.vehicle && !formData.plate_number}
                    disabled={loading || isSubmitting || !formData.company}
                  >
                    <option value="">{t("Select vehicle")}</option>
                    {filteredVehicles.map((vehicle) => (
                      vehicle && (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.car_name} - {vehicle.plate_number}
                        </option>
                      )
                    ))}
                  </Input>
                  {errors.vehicle && (
                    <span className="text-danger small">{errors.vehicle}</span>
                  )}
                </FormGroup>

                {/* Bill Number */}
                <FormGroup>
                  <Label for="bill_number">
                    {t("Bill Number")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="bill_number"
                    name="bill_number"
                    type="text"
                    value={formData.bill_number}
                    onChange={handleChange}
                    placeholder={t("Enter bill number")}
                    invalid={!!errors.bill_number}
                    disabled={loading || isSubmitting}
                  />
                  {errors.bill_number && (
                    <span className="text-danger small">
                      {errors.bill_number}
                    </span>
                  )}
                </FormGroup>

                {/* Control Weight */}
                <FormGroup>
                  <Label for="control_weight">{t("Control Weight")}</Label>
                  <Input
                    id="control_weight"
                    name="control_weight"
                    type="number"
                    value={formData.control_weight}
                    onChange={handleChange}
                    placeholder={t("Enter control weight")}
                    disabled={loading || isSubmitting}
                    min="0"
                    step="1"
                  />
                </FormGroup>

                {/* Discharge Place */}
                <FormGroup>
                  <Label for="discharge_place">{t("Discharge Place")}</Label>
                  <Input
                    id="discharge_place"
                    name="discharge_place"
                    type="text"
                    value={formData.discharge_place}
                    onChange={handleChange}
                    placeholder={t("Enter discharge place")}
                    disabled={loading || isSubmitting}
                  />
                </FormGroup>

                {/* Scale Selection */}
                <FormGroup>
                  <Label for="scale">
                    {t("Scale")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="scale"
                    name="scale"
                    type="select"
                    value={formData.scale}
                    onChange={handleChange}
                    invalid={!!errors.scale}
                    disabled={loading || isSubmitting}
                  >
                    <option value="">{t("Select scale")}</option>
                    {scales.map((scale) => (
                      scale && (
                        <option key={scale.id} value={scale.id}>
                          {scale.name} - {scale.location}
                        </option>
                      )
                    ))}
                  </Input>
                  {errors.scale && (
                    <span className="text-danger small">{errors.scale}</span>
                  )}
                </FormGroup>
              </CardBody>
            </Card>
          </Col>

          {/* AUTO-SELECTED COLUMN - Auto-filled/Auto-selected Fields */}
          <Col md="6">
            <Card className="mb-3">
              <CardHeader>
                <CardTitle tag="h5">{t("Auto-Selected Fields")}</CardTitle>
              </CardHeader>
              <CardBody>
                {/* Empty Weight (Auto-filled from vehicle) */}
                <FormGroup>
                  <Label for="empty_weight">
                    {t("Empty Weight")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="empty_weight"
                    name="empty_weight"
                    type="number"
                    value={formData.empty_weight}
                    onChange={handleChange}
                    placeholder={t("Auto-filled from vehicle data")}
                    invalid={!!errors.empty_weight}
                    disabled={true}
                    className="bg-light"
                    min="0"
                    step="1"
                  />
                  {errors.empty_weight && (
                    <span className="text-danger small">
                      {errors.empty_weight}
                    </span>
                  )}
                  <small className="text-muted">
                    {t("Auto-filled from selected vehicle")}
                  </small>
                </FormGroup>

                {/* Transfer Type - Auto-set based on maktoob */}
                <FormGroup>
                  <Label for="transfor_type">
                    {t("Transfer Type")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="transfor_type"
                    name="transfor_type"
                    type="select"
                    value={formData.transfor_type}
                    onChange={handleChange}
                    invalid={!!errors.transfor_type}
                    disabled={
                      loading ||
                      isSubmitting ||
                      (autoSelectedTransferType && !isEdit)
                    }
                    className={autoSelectedTransferType ? "bg-light" : ""}
                  >
                    <option value="incoming">{t("Incoming")}</option>
                    <option value="outgoing">{t("Outgoing")}</option>
                    <option value="internal">{t("Internal")}</option>
                  </Input>
                  {errors.transfor_type && (
                    <span className="text-danger small">
                      {errors.transfor_type}
                    </span>
                  )}
                  {autoSelectedTransferType && latestMaktoobInfo && (
                    <div className="mt-1 small text-info">
                      {latestMaktoobInfo.maktoob_number} (
                      {latestMaktoobInfo.maktoob_type})
                    </div>
                  )}
                </FormGroup>

                {/* Net Weight (Auto-calculated) */}
                <FormGroup>
                  <Label for="mineral_net_weight">
                    {t("Net Weight")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="mineral_net_weight"
                    name="mineral_net_weight"
                    type="number"
                    value={formData.mineral_net_weight}
                    onChange={(e) => {
                      const { value } = e.target;
                      setFormData((prev) => ({
                        ...prev,
                        mineral_net_weight: value,
                      }));
                    }}
                    placeholder={t("Auto-calculated: Second - Empty")}
                    invalid={!!errors.mineral_net_weight}
                    disabled={true}
                    className="bg-light"
                    min="0"
                    step="1"
                  />
                  {errors.mineral_net_weight && (
                    <span className="text-danger small">
                      {errors.mineral_net_weight}
                    </span>
                  )}
                </FormGroup>

                {/* Area - Auto-filled from latest purchase */}
                <FormGroup>
                  <Label for="area">
                    {t("Area")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="area"
                    name="area"
                    type="text"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder={t("Enter area")}
                    invalid={!!errors.area}
                    disabled={
                      loading || isSubmitting || (autoSelectedArea && !isEdit)
                    }
                    className={autoSelectedArea ? "bg-light" : ""}
                  />
                  {errors.area && (
                    <span className="text-danger small">{errors.area}</span>
                  )}
                  {autoSelectedArea && latestPurchaseInfo && (
                    <div className="mt-1 small text-success">
                      <CheckCircle size={12} className="me-1" />
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label for="driver_name">{t("Driver Name")}</Label>
                  <Input
                    id="driver_name"
                    name="driver_name"
                    type="text"
                    value={formData.driver_name}
                    onChange={handleChange}
                    placeholder={t("Auto-filled from vehicle data")}
                    disabled={true}
                    className="bg-light"
                  />
                  <small className="text-muted">
                    {t("Auto-filled from vehicle data")}
                  </small>
                </FormGroup>

                {/* Mineral - Auto-selected */}
                <FormGroup>
                  <Label for="mineral">
                    {t("Mineral")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="mineral"
                    name="mineral"
                    type="select"
                    value={formData.mineral}
                    onChange={handleChange}
                    invalid={!!errors.mineral}
                    disabled={
                      loading ||
                      isSubmitting ||
                      !formData.company ||
                      (autoSelectedMineral && !isEdit)
                    }
                    className={autoSelectedMineral ? "bg-light" : ""}
                  >
                    <option value="">{t("Select mineral")}</option>
                    {formData.company ? (
                      filteredMinerals.length > 0 ? (
                        filteredMinerals.map((mineral) => (
                          mineral && (
                            <option key={mineral.id} value={mineral.id}>
                              {mineral.name}
                              {mineral.unit_price && ` ($${mineral.unit_price})`}
                            </option>
                          )
                        ))
                      ) : (
                        <option value="" disabled>
                          {t("No minerals found for this company")}
                        </option>
                      )
                    ) : (
                      <option value="" disabled>
                        {t("Select company first")}
                      </option>
                    )}
                  </Input>
                  {errors.mineral && (
                    <span className="text-danger small">{errors.mineral}</span>
                  )}
                  {autoSelectedMineral && selectedMineralDetails && (
                    <div className="mt-1 small text-success">
                      <CheckCircle size={12} className="me-1" />
                    </div>
                  )}
                </FormGroup>

                {/* Purchase - Auto-selected with Royalty Receipt Number */}
                <FormGroup>
                  <Label for="purchase">
                    {t("Purchase (Royalty Receipt)")}{" "}
                    <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="purchase"
                    name="purchase"
                    type="select"
                    value={formData.purchase}
                    onChange={handleChange}
                    invalid={!!errors.purchase}
                    disabled={
                      loading ||
                      isSubmitting ||
                      !formData.company ||
                      !formData.mineral ||
                      (autoSelectedPurchase && !isEdit)
                    }
                    className={autoSelectedPurchase ? "bg-light" : ""}
                  >
                    <option value="">{t("Select purchase")}</option>
                    {formData.company && formData.mineral ? (
                      filteredPurchases.length > 0 ? (
                        filteredPurchases.map((purchase) => {
                          if (!purchase) return null;
                          const royaltyNumber =
                            purchase.royalty_receipt_number || "N/A";
                          const mineralAmount = purchase.mineral_amount || 0;
                          const unitName = getUnitNameFromPurchase(purchase);
                          const maktoobNumber =
                            getMaktoobNumberFromPurchase(purchase);

                          return (
                            <option key={purchase.id} value={purchase.id}>
                              RR#{royaltyNumber} - {mineralAmount} {unitName}
                              {maktoobNumber !== "N/A" &&
                                ` (Mkt: ${maktoobNumber})`}
                            </option>
                          );
                        })
                      ) : (
                        <option value="" disabled>
                          {t("No purchases found for this company and mineral")}
                        </option>
                      )
                    ) : (
                      <option value="" disabled>
                        {!formData.company
                          ? t("Select company first")
                          : t("Select mineral first")}
                      </option>
                    )}
                  </Input>
                  {errors.purchase && (
                    <span className="text-danger small">{errors.purchase}</span>
                  )}
                  {autoSelectedPurchase && selectedPurchaseDetails && (
                    <div className="mt-1 small text-success">
                      <CheckCircle size={12} className="me-1" />
                    </div>
                  )}
                </FormGroup>

                {/* Date */}
                <FormGroup>
                  <Label for="create_at">
                    {t("Date")} <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="create_at"
                    name="create_at"
                    type="date"
                    value={formData.create_at}
                    onChange={handleChange}
                    invalid={!!errors.create_at}
                    disabled={loading || isSubmitting}
                  />
                  {errors.create_at && (
                    <span className="text-danger small">
                      {errors.create_at}
                    </span>
                  )}
                </FormGroup>
              </CardBody>
            </Card>
          </Col>

          {/* Balance Information */}
          {balanceInfo && (
            <Col md="12">
              <Alert
                color={balanceInfo.isValid ? "success" : "danger"}
                className="mb-3"
              >
                <div className="d-flex align-items-center">
                  {balanceInfo.isValid ? (
                    <CheckCircle size={20} className="me-2" />
                  ) : (
                    <AlertCircle size={20} className="me-2" />
                  )}
                  <div>
                    <strong>
                      {balanceInfo.isValid
                        ? t("Balance OK")
                        : t("Balance Issue")}
                    </strong>
                    <div className="mt-1">{balanceInfo.message}</div>
                    {balanceInfo.remaining && (
                      <div className="mt-1">
                        <strong>{t("Remaining Balance")}:</strong>{" "}
                        {balanceInfo.remaining}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            </Col>
          )}

          {/* Form Actions */}
          <Col md="12">
            <div className="d-flex justify-content-between mt-3">
              <div>
                <Button
                  color="secondary"
                  onClick={onCancel}
                  disabled={loading || isSubmitting}
                  className="me-2"
                >
                  {t("Cancel")}
                </Button>

                <Button
                  type="button"
                  color="info"
                  onClick={handlePrintPreview}
                  disabled={loading || isSubmitting}
                >
                  <Printer size={16} className="me-1" />
                  {t("Print Preview")}
                </Button>
              </div>

              {/* Right side: SINGLE "Save & Print" button */}
              <div>
                <Button
                  type="submit"
                  color="success"
                  disabled={loading || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {t("Saving...")}
                    </>
                  ) : isEdit ? (
                    <>
                      <Save size={16} className="me-1" />
                      <Printer size={16} className="me-1" />
                      {t("Update & Print")}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-1" />
                      <Printer size={16} className="me-1" />
                      {t("Save and Print")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
      

      <Modal
        isOpen={printModalOpen}
        toggle={() => setPrintModalOpen(false)}
        size="lg"
        className="modal-dialog-centered"
        style={{ maxWidth: "900px" }}
      >
        <ModalHeader toggle={() => setPrintModalOpen(false)}>
          <div className="d-flex align-items-center">
            <Printer size={20} className="me-2" />
            {t("Print Preview")}
          </div>
        </ModalHeader>
        <ModalBody
          style={{ padding: "10px", maxHeight: "80vh", overflowY: "auto" }}
        >
          {printData && (
            <WeightPreview
              weightData={printData.weightData}
              company={printData.company}
              vehicle={printData.vehicle}
              scale={printData.scale}
              mineral={printData.mineral}
              unit={printData.unit}
              purchase={printData.purchase}
              user={printData.user}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setPrintModalOpen(false)}>
            <X size={16} className="me-1" />
            {t("Close")}
          </Button>
          <Button
            color="primary"
            onClick={executePrint}
            disabled={printLoading}
          >
            {printLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                {t("Printing...")}
              </>
            ) : (
              <>
                <Printer size={16} className="me-1" />
                {t("Print Now (2 Copies)")}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default WeightForm;