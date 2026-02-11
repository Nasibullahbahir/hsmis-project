// ** React Imports
import { useState, Fragment, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ** Third Party Components
import ReactPaginate from "react-paginate";
import {
  ChevronDown,
  Plus,
  Trash2,
  ArrowLeft,
  Filter,
  X,
  Edit,
  Database,
  AlertCircle,
  RefreshCw,
} from "react-feather";
import DataTable from "react-data-table-component";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ** Reactstrap Imports
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Input,
  Label,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Collapse,
  Spinner,
  Alert,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

// ** Import Weight Form Component
import WeightForm from "./Home.js";

import gregorianToShamsi from "./gregorianToShamsi.js";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

const WeightTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data
  const { company: companyFromState, fromCompany: fromCompanyState } =
    location.state || {};
  const searchParams = new URLSearchParams(location.search);
  const companyIdFromUrl = searchParams.get("companyId");
  const companyNameFromUrl = searchParams.get("companyName");

  const company =
    companyFromState ||
    (companyIdFromUrl
      ? {
          id: parseInt(companyIdFromUrl),
          company_name: decodeURIComponent(companyNameFromUrl || ""),
        }
      : null);
  const fromCompany = fromCompanyState || !!companyIdFromUrl;

  // ** States
  const [searchBillNumber, setSearchBillNumber] = useState("");
  const [searchVehicle, setSearchVehicle] = useState("");
  const [searchMineral, setSearchMineral] = useState("");
  const [searchCreateDate, setSearchCreateDate] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [searchTransferType, setSearchTransferType] = useState("");
  const [searchPurchaseNumber, setSearchPurchaseNumber] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [searchDriver, setSearchDriver] = useState("");
  const [searchPlateNumber, setSearchPlateNumber] = useState("");
  const [searchMaktoobType, setSearchMaktoobType] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [weights, setWeights] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalWeights, setTotalWeights] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [existingBillNumbers, setExistingBillNumbers] = useState([]);

  // ** Dropdown Data
  const [vehicles, setVehicles] = useState([]);
  const [scales, setScales] = useState([]);
  const [minerals, setMinerals] = useState([]);
  const [units, setUnits] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [maktoobs, setMaktoobs] = useState([]);
  
  // ** Get unique transfer types from maktoobs
  const [transferTypes, setTransferTypes] = useState([]);

  // ** Balance State
  const [availableBalance, setAvailableBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // ** Modal States
  const [addWeightModal, setAddWeightModal] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  // ** Configure axios headers
  const getAxiosConfig = useCallback(() => {
    const token = getAuthToken();
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      : {
          headers: {
            "Content-Type": "application/json",
          },
        };
  }, []);

  // ** Extract unique transfer types from maktoobs
  const extractTransferTypes = useCallback((maktoobsData) => {
    if (!maktoobsData || !Array.isArray(maktoobsData)) return [];
    
    // Get unique transfer types from maktoobs
    const types = [...new Set(maktoobsData
      .filter(m => m.transfer_type)
      .map(m => m.transfer_type))];
    
    // If no transfer types found in maktoobs, use default options
    if (types.length === 0) {
      return ["incoming", "outgoing", "internal"];
    }
    
    return types;
  }, []);

  // ** Fetch all existing bill numbers for validation
  const fetchAllBillNumbers = useCallback(async () => {
    try {
      const config = getAxiosConfig();
      let allWeights = [];
      let nextUrl = `${API_URL}/weights/`;

      while (nextUrl) {
        try {
          const response = await axios.get(nextUrl, config);

          let data = [];
          if (response.data && response.data.results) {
            data = response.data.results;
            nextUrl = response.data.next;
          } else if (Array.isArray(response.data)) {
            data = response.data;
            nextUrl = null;
          } else {
            data = [];
            nextUrl = null;
          }

          allWeights = [...allWeights, ...data];

          if (!response.data.next) {
            break;
          }
        } catch (error) {
          console.error("Error fetching weights page:", error);
          break;
        }
      }

      // Extract all bill numbers
      const billNumbers = allWeights
        .filter((w) => w.bill_number)
        .map((w) => w.bill_number.toString());

      setExistingBillNumbers(billNumbers);
      return billNumbers;
    } catch (error) {
      console.error("Error fetching bill numbers:", error);
      return [];
    }
  }, [getAxiosConfig]);

  // ** Fetch dropdown data - UPDATED to fetch all purchases
  const fetchDropdownData = useCallback(async () => {
    try {
      const config = getAxiosConfig();

      // Fetch companies
      const companiesRes = await axios.get(`${API_URL}/companies/`, config);
      const companiesData = Array.isArray(companiesRes.data)
        ? companiesRes.data
        : companiesRes.data.results || [];
      setCompanies(companiesData);

      // Fetch vehicles
      const vehiclesRes = await axios.get(`${API_URL}/vehicles/`, config);
      const vehiclesData = Array.isArray(vehiclesRes.data)
        ? vehiclesRes.data
        : vehiclesRes.data.results || [];
      setVehicles(vehiclesData);

      // Fetch scales
      const scalesRes = await axios.get(`${API_URL}/scales/`, config);
      const scalesData = Array.isArray(scalesRes.data)
        ? scalesRes.data
        : scalesRes.data.results || [];
      setScales(scalesData);

      // Fetch minerals
      const mineralsRes = await axios.get(`${API_URL}/minerals/`, config);
      const mineralsData = Array.isArray(mineralsRes.data)
        ? mineralsRes.data
        : mineralsRes.data.results || [];
      setMinerals(mineralsData);

      // Fetch units
      const unitsRes = await axios.get(`${API_URL}/units/`, config);
      const unitsData = Array.isArray(unitsRes.data)
        ? unitsRes.data
        : unitsRes.data.results || [];
      setUnits(unitsData);

      // ** CRITICAL FIX: Fetch purchases with ALL details including company and mineral
      try {
        let allPurchases = [];
        let nextUrl = `${API_URL}/purchases/?page_size=1000`;

        // Loop through pagination to get all purchases
        while (nextUrl) {
          const purchasesRes = await axios.get(nextUrl, config);
          
          let purchasesData = [];
          if (purchasesRes.data && purchasesRes.data.results) {
            purchasesData = purchasesRes.data.results;
            nextUrl = purchasesRes.data.next;
          } else if (Array.isArray(purchasesRes.data)) {
            purchasesData = purchasesRes.data;
            nextUrl = null;
          } else {
            purchasesData = [];
            nextUrl = null;
          }

          // Process each purchase to ensure company data is complete
          const processedPurchases = await Promise.all(
            purchasesData.map(async (purchase) => {
              // If company is just an ID, fetch the full company data
              if (purchase.company && typeof purchase.company === 'number') {
                try {
                  const companyRes = await axios.get(
                    `${API_URL}/companies/${purchase.company}/`,
                    config
                  );
                  purchase.company = companyRes.data;
                } catch (error) {
                  console.error(`Error fetching company ${purchase.company}:`, error);
                  // Keep as ID if fetch fails
                }
              }

              // If mineral is just an ID, fetch the full mineral data
              if (purchase.mineral && typeof purchase.mineral === 'number') {
                try {
                  const mineralRes = await axios.get(
                    `${API_URL}/minerals/${purchase.mineral}/`,
                    config
                  );
                  purchase.mineral = mineralRes.data;
                } catch (error) {
                  console.error(`Error fetching mineral ${purchase.mineral}:`, error);
                  // Keep as ID if fetch fails
                }
              }

              // If maktoob is just an ID, fetch the full maktoob data
              if (purchase.maktoob && typeof purchase.maktoob === 'number') {
                try {
                  const maktoobRes = await axios.get(
                    `${API_URL}/maktoobs/${purchase.maktoob}/`,
                    config
                  );
                  purchase.maktoob = maktoobRes.data;
                } catch (error) {
                  console.error(`Error fetching maktoob ${purchase.maktoob}:`, error);
                  // Keep as ID if fetch fails
                }
              }

              return purchase;
            })
          );

          allPurchases = [...allPurchases, ...processedPurchases];

          if (!purchasesRes.data.next) {
            break;
          }
        }

        setPurchases(allPurchases);
        console.log("Fetched purchases:", allPurchases.length);
        console.log("Sample purchase:", allPurchases[0]);
      } catch (purchaseError) {
        console.error("Error fetching purchases:", purchaseError);
        setPurchases([]);
      }

      // Fetch maktoobs
      try {
        const maktoobsRes = await axios.get(`${API_URL}/maktoobs/`, {
          ...config,
          params: {
            page_size: 1000,
          },
        });
        const maktoobsData = Array.isArray(maktoobsRes.data)
          ? maktoobsRes.data
          : maktoobsRes.data.results || [];
        
        setMaktoobs(maktoobsData);
        
        // Extract transfer types from maktoobs
        const transferTypesData = extractTransferTypes(maktoobsData);
        setTransferTypes(transferTypesData);
        
      } catch (maktoobError) {
        console.error("Error fetching maktoobs:", maktoobError);
        setMaktoobs([]);
        // Set default transfer types if maktoobs fetch fails
        setTransferTypes(["incoming", "outgoing", "internal"]);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error(t("Failed to load dropdown data"));
    }
  }, [getAxiosConfig, t, extractTransferTypes]);

  // ** Get purchases for a specific company - NEW FUNCTION
  const getPurchasesForCompany = useCallback((companyId) => {
    if (!companyId || !purchases.length) return [];
    
    // Filter purchases by company ID
    const companyPurchases = purchases.filter(purchase => {
      // Handle different data structures
      if (purchase.company) {
        if (typeof purchase.company === 'object') {
          return purchase.company.id === companyId;
        } else if (typeof purchase.company === 'number') {
          return purchase.company === companyId;
        }
      }
      return false;
    });

    console.log(`Purchases for company ${companyId}:`, companyPurchases.length);
    
    // Sort by ID descending to get the latest purchase first
    return companyPurchases.sort((a, b) => b.id - a.id);
  }, [purchases]);

  // ** Get the latest purchase for a company
  const getLatestPurchaseForCompany = useCallback((companyId) => {
    const companyPurchases = getPurchasesForCompany(companyId);
    if (companyPurchases.length > 0) {
      return companyPurchases[0]; // First item after sorting descending
    }
    return null;
  }, [getPurchasesForCompany]);

  // ** Debug balance for a purchase and mineral
  const debugBalance = useCallback(
    async (purchaseId, mineralId) => {
      if (!purchaseId || !mineralId) return null;

      try {
        const config = getAxiosConfig();

        // Get purchase details
        const purchaseRes = await axios.get(
          `${API_URL}/purchases/${purchaseId}/`,
          config,
        );
        const purchaseData = purchaseRes.data;

        // Get balance details
        const balanceRes = await axios.get(
          `${API_URL}/company-mineral-balance/${
            purchaseData.company.id || purchaseData.company
          }/${mineralId}/`,
          config,
        );

        return {
          purchase: purchaseData,
          balance: balanceRes.data,
        };
      } catch (error) {
        console.error("Error debugging balance:", error);
        return null;
      }
    },
    [getAxiosConfig],
  );

  // ** Check available balance for a purchase and mineral
  const checkAvailableBalance = useCallback(
    async (purchaseId, mineralId, netWeight = null) => {
      if (!purchaseId || !mineralId) return { isValid: true };

      setBalanceLoading(true);
      try {
        const config = getAxiosConfig();

        // First, get the purchase to find the company
        const purchaseRes = await axios.get(
          `${API_URL}/purchases/${purchaseId}/`,
          config,
        );
        const purchaseData = purchaseRes.data;
        const companyId = purchaseData.company?.id || purchaseData.company;

        if (!companyId) {
          return {
            isValid: false,
            message: "No company associated with this purchase",
            debug: { purchaseId, mineralId, companyId: null },
          };
        }

        // Get the balance for this company and mineral
        const balanceRes = await axios.get(
          `${API_URL}/company-mineral-balance/${companyId}/${mineralId}/`,
          config,
        );

        const balance = balanceRes.data.balance?.remaining_mineral_amount || 0;
        setAvailableBalance(balance);

        // Debug info
        const debugData = {
          purchaseId: purchaseId,
          mineralId: mineralId,
          purchaseCompany: companyId,
          purchaseMineralAmount: purchaseData.mineral_amount || 0,
          balanceAvailable: balance,
          netWeight: netWeight,
        };

        setDebugInfo(debugData);

        if (netWeight !== null) {
          if (balance < netWeight) {
            return {
              isValid: false,
              message: `Insufficient balance. Available: ${balance}, Required: ${netWeight}`,
              available: balance,
              debug: debugData,
            };
          }
          return {
            isValid: true,
            available: balance,
            debug: debugData,
          };
        }

        return {
          isValid: true,
          available: balance,
          debug: debugData,
        };
      } catch (error) {
        console.error("Error checking balance:", error);
        const errorMessage =
          error.response?.data?.message || "Could not verify balance";

        // Try to get debug info even on error
        try {
          const debugData = await debugBalance(purchaseId, mineralId);
          return {
            isValid: false,
            message: `${errorMessage}. Please check if purchase has been properly added to balance.`,
            debug: debugData || { purchaseId, mineralId },
          };
        } catch (debugError) {
          return {
            isValid: false,
            message: `${errorMessage}. Please check if purchase has been properly added to balance.`,
            debug: { purchaseId, mineralId },
          };
        }
      } finally {
        setBalanceLoading(false);
      }
    },
    [getAxiosConfig, debugBalance],
  );

  // ** Fetch weights from API with pagination
  const fetchWeights = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const config = getAxiosConfig();

        let url = `${API_URL}/weights/?page=${page}&page_size=10`;

        // Add company filter if in company view
        if (fromCompany && company) {
          url += `&company=${company.id}`;
        }

        const response = await axios.get(url, config);

        let data = [];
        let total = 0;

        if (response.data && response.data.results) {
          // Paginated response
          data = response.data.results;
          total = response.data.count || data.length;
        } else if (Array.isArray(response.data)) {
          // Non-paginated response
          data = response.data;
          total = data.length;
        } else {
          data = [];
          total = 0;
        }

        // Process weights to include all required data
        const processedData = data.map((weight) => {
          // Get purchase details
          const purchaseObj = purchases.find((p) => p.id === weight.purchase) || {};

          // Get vehicle details
          const vehicleObj = vehicles.find((v) => v.id === weight.vehicle) || {};

          // Get mineral details
          const mineralObj = minerals.find((m) => m.id === weight.mineral) || {};

          // Get maktoob details
          let maktoobType = "N/A";
          let maktoobNumber = "N/A";
          let transferType = weight.transfor_type || "N/A";

          if (purchaseObj.maktoob) {
            const maktoobObj = maktoobs.find(
              (m) => m.id === purchaseObj.maktoob,
            );
            if (maktoobObj) {
              maktoobType = maktoobObj.maktoob_type || "N/A";
              maktoobNumber = maktoobObj.maktoob_number || "N/A";
              transferType = maktoobObj.transfer_type || transferType;
            }
          }

          // Get company details from purchase
          let companyObj = {};
          if (purchaseObj.company) {
            if (typeof purchaseObj.company === "object") {
              companyObj = purchaseObj.company;
            } else {
              companyObj =
                companies.find((c) => c.id === purchaseObj.company) || {};
            }
          }

          return {
            ...weight,
            // Vehicle information
            vehicle_display: vehicleObj.car_name || vehicleObj.name || "N/A",
            driver_name: vehicleObj.driver_name || "N/A",
            plate_number: vehicleObj.plate_number || "N/A",

            // Mineral information
            mineral_display: mineralObj.name || "N/A",

            // Scale information
            scale_display: weight.scale?.name || "N/A",

            // Unit information
            unit_display: weight.unit?.name || "N/A",

            // Purchase information
            purchase_display: purchaseObj.id || "N/A",
            purchase_maktoob_number: maktoobNumber,
            purchase_maktoob_type: maktoobType,
            purchase_royalty: purchaseObj.royalty_receipt_number || "N/A",

            // Company information
            company_display: companyObj.company_name || "N/A",
            company_id: companyObj.id || null,

            // Transfer type
            transfor_type: transferType,

            // Weight details
            second_weight: weight.second_weight || 0,
            mineral_net_weight: weight.mineral_net_weight || 0,
            control_weight: weight.control_weight || 0,

            // Location details
            area: weight.area || "-",
            discharge_place: weight.discharge_place || "-",

            // Date
            create_at: weight.create_at || null,
          };
        });

        // If in company view, filter by company
        let finalData = processedData;
        let finalTotal = total;

        if (fromCompany && company) {
          finalData = processedData.filter((weight) => {
            return weight.company_id === company.id;
          });
          finalTotal = finalData.length;
        }

        setWeights(finalData);
        setFilteredData(finalData);
        setTotalWeights(finalTotal);
        setTotalPages(Math.ceil(finalTotal / 10));
      } catch (error) {
        console.error("Error fetching weights:", error);
        toast.error(t("Failed to load weights"));
        setWeights([]);
        setFilteredData([]);
        setTotalWeights(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    },
    [
      company,
      fromCompany,
      purchases,
      vehicles,
      minerals,
      companies,
      maktoobs,
      t,
      getAxiosConfig,
    ],
  );

  // ** Initialize data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch dropdown data first
        await fetchDropdownData();

        // Fetch all existing bill numbers for validation
        await fetchAllBillNumbers();

        // Now fetch weights with current page
        await fetchWeights(currentPage + 1);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ** Fetch weights when page changes
  useEffect(() => {
    if (dataLoaded) {
      fetchWeights(currentPage + 1);
    }
  }, [currentPage, fetchWeights, dataLoaded]);

  // ** Apply filters when search criteria change
  useEffect(() => {
    let data = weights;

    if (searchBillNumber) {
      data = data.filter((w) =>
        w.bill_number
          ?.toString()
          .toLowerCase()
          .includes(searchBillNumber.toLowerCase()),
      );
    }

    if (searchVehicle) {
      data = data.filter((w) =>
        (w.vehicle_display || "")
          .toLowerCase()
          .includes(searchVehicle.toLowerCase()),
      );
    }

    if (searchMineral) {
      data = data.filter((w) =>
        (w.mineral_display || "")
          .toLowerCase()
          .includes(searchMineral.toLowerCase()),
      );
    }

    if (searchCreateDate) {
      data = data.filter(
        (w) => w.create_at && w.create_at.includes(searchCreateDate),
      );
    }

    if (searchArea) {
      data = data.filter((w) =>
        (w.area || "").toLowerCase().includes(searchArea.toLowerCase()),
      );
    }

    if (searchTransferType) {
      data = data.filter((w) => w.transfor_type === searchTransferType);
    }

    if (searchPurchaseNumber) {
      data = data.filter((w) =>
        (w.purchase_display || "")
          .toLowerCase()
          .includes(searchPurchaseNumber.toLowerCase()),
      );
    }

    if (searchCompany && !fromCompany) {
      data = data.filter((w) =>
        (w.company_display || "")
          .toLowerCase()
          .includes(searchCompany.toLowerCase()),
      );
    }

    if (searchDriver) {
      data = data.filter((w) =>
        (w.driver_name || "")
          .toLowerCase()
          .includes(searchDriver.toLowerCase()),
      );
    }

    if (searchPlateNumber) {
      data = data.filter((w) =>
        (w.plate_number || "")
          .toLowerCase()
          .includes(searchPlateNumber.toLowerCase()),
      );
    }

    if (searchMaktoobType) {
      data = data.filter((w) =>
        (w.purchase_maktoob_type || "")
          .toLowerCase()
          .includes(searchMaktoobType.toLowerCase()),
      );
    }

    setFilteredData(data);
  }, [
    searchBillNumber,
    searchVehicle,
    searchMineral,
    searchCreateDate,
    searchArea,
    searchTransferType,
    searchPurchaseNumber,
    searchCompany,
    searchDriver,
    searchPlateNumber,
    searchMaktoobType,
    weights,
    fromCompany,
  ]);

  // ** Handle Back Button Click
  const handleBackClick = () => {
    navigate(-1);
  };

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchBillNumber("");
    setSearchVehicle("");
    setSearchMineral("");
    setSearchCreateDate("");
    setSearchArea("");
    setSearchTransferType("");
    setSearchPurchaseNumber("");
    setSearchCompany("");
    setSearchDriver("");
    setSearchPlateNumber("");
    setSearchMaktoobType("");
  };

  // ** Handle Add Weight Submission
  const handleAddWeightSubmit = async (weightData) => {
    setIsSubmitting(true);

    try {
      // Validate bill number uniqueness
      if (existingBillNumbers.includes(weightData.bill_number)) {
        toast.error(
          t("This Bill Number already exists. Please use a different number."),
        );
        setIsSubmitting(false);
        throw new Error("Bill number already exists");
      }

      const formattedData = {
        bill_number: weightData.bill_number,
        second_weight: weightData.second_weight,
        mineral_net_weight: weightData.mineral_net_weight,
        control_weight: weightData.control_weight,
        transfor_type: weightData.transfor_type,
        area: weightData.area,
        discharge_place: weightData.discharge_place,
        create_at: weightData.create_at,
        vehicle: weightData.vehicle || null,
        scale: weightData.scale || null,
        mineral: weightData.mineral || null,
        unit: weightData.unit || null,
        purchase: weightData.purchase || null,
        user: weightData.user || null,
      };

      const config = getAxiosConfig();
      const response = await axios.post(
        `${API_URL}/weights/`,
        formattedData,
        config,
      );

      if (response.status === 201) {
        // Add the new bill number to existing numbers list
        setExistingBillNumbers((prev) => [
          ...prev,
          weightData.bill_number.toString(),
        ]);

        toast.success(t("Weight added successfully! Balance updated."));

        // Reset to first page when adding new weight
        setCurrentPage(0);
        fetchWeights(1);

        // Return the saved data for printing
        return response.data;
      }
    } catch (error) {
      const errorMsg = error.response?.data;
      if (error.response?.status === 400) {
        if (errorMsg && typeof errorMsg === "object") {
          if (
            errorMsg.bill_number &&
            errorMsg.bill_number.includes("already exists")
          ) {
            toast.error(
              t(
                "This Bill Number already exists. Please use a different number.",
              ),
            );
          } else if (errorMsg.non_field_errors) {
            errorMsg.non_field_errors.forEach((msg) => {
              toast.error(msg);
            });
          } else {
            Object.keys(errorMsg).forEach((key) => {
              if (Array.isArray(errorMsg[key])) {
                errorMsg[key].forEach((msg) => {
                  toast.error(`${key}: ${msg}`);
                });
              } else {
                toast.error(`${key}: ${errorMsg[key]}`);
              }
            });
          }
        } else {
          toast.error(t("Invalid data. Please check all fields."));
        }
      } else if (error.response?.status === 401) {
        toast.error(t("Authentication required. Please login."));
      } else {
        toast.error(errorMsg || t("Failed to add weight"));
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Add Weight Button Click
  const handleAddWeightClick = () => {
    setAddWeightModal(true);
  };

  // ** Close Modals
  const closeModals = () => {
    setAddWeightModal(false);
    setSelectedWeight(null);
    setIsSubmitting(false);
    setAvailableBalance(null);
    setDebugInfo(null);
  };

  // ** Table columns configuration
  const columns = useMemo(
    () => [
      {
        name: t("ID"),
        selector: (row) => row.id,
        sortable: true,
        width: "70px",
      },
      ...(!fromCompany
        ? [
            {
              name: t("Company Name"),
              selector: (row) => row.company_display || "N/A",
              sortable: true,
              minWidth: "180px",
              cell: (row) => (
                <div>
                  <div>{row.company_display}</div>
                  {row.company_id && (
                    <small className="text-muted">ID: {row.company_id}</small>
                  )}
                </div>
              ),
            },
          ]
        : []),
      {
        name: t("Mineral Name"),
        selector: (row) => row.mineral_display,
        sortable: true,
        minWidth: "120px",
      },
      {
        name: t("Second Weight"),
        selector: (row) => row.second_weight || 0,
        sortable: true,
        minWidth: "100px",
        cell: (row) => <div className="text-center">{row.second_weight}</div>,
      },
      {
        name: t("Net Weight"),
        selector: (row) => row.mineral_net_weight || 0,
        sortable: true,
        minWidth: "100px",
        cell: (row) => (
          <Badge color="primary">{row.mineral_net_weight || 0}</Badge>
        ),
      },
      {
        name: t("Bill Number"),
        selector: (row) => row.bill_number || "N/A",
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <div className="font-weight-bold">#{row.bill_number}</div>
        ),
      },
      {
        name: t("Transfer Type"),
        selector: (row) => row.transfor_type || "N/A",
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <Badge color={row.transfor_type === 'incoming' ? 'success' : 
                      row.transfor_type === 'outgoing' ? 'danger' : 
                      'warning'} className="text-uppercase">
            {row.transfor_type}
          </Badge>
        ),
      },
      {
        name: t("Maktoob Type"),
        selector: (row) => row.purchase_maktoob_type || "N/A",
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <Badge color="info" className="text-uppercase">
            {row.purchase_maktoob_type}
          </Badge>
        ),
      },
      {
        name: t("Area"),
        selector: (row) => row.area || "-",
        sortable: true,
        minWidth: "100px",
      },
      {
        name: t("Discharge Place"),
        selector: (row) => row.discharge_place || "-",
        sortable: true,
        minWidth: "120px",
      },
      {
        name: t("Driver Name"),
        selector: (row) => row.driver_name || "N/A",
        sortable: true,
        minWidth: "120px",
      },
      {
        name: t("Plate Number"),
        selector: (row) => row.plate_number || "N/A",
        sortable: true,
        minWidth: "100px",
        cell: (row) => <div className="text-uppercase">{row.plate_number}</div>,
      },
      {
        name: t("Create Date"),
        selector: (row) =>
          row.create_at ? gregorianToShamsi(row.create_at) : "N/A",
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <div>
            <div>
              {row.create_at ? gregorianToShamsi(row.create_at) : "N/A"}
            </div>
            {row.create_at && (
              <small className="text-muted">
                ({row.create_at.substring(0, 10)})
              </small>
            )}
          </div>
        ),
      },
    ],
    [t, fromCompany],
  );

  // ** Function to handle Pagination
  const handlePagination = (page) => {
    const newPage = page.selected;
    setCurrentPage(newPage);
  };

  // ** Custom Pagination
  const CustomPagination = () => {
    const pageCount = totalPages || Math.ceil(totalWeights / 10);

    if (pageCount <= 1) return null;

    return (
      <ReactPaginate
        previousLabel={""}
        nextLabel={""}
        forcePage={currentPage}
        onPageChange={handlePagination}
        pageCount={pageCount}
        breakLabel={"..."}
        pageRangeDisplayed={2}
        marginPagesDisplayed={2}
        activeClassName="active"
        pageClassName="page-item"
        breakClassName="page-item"
        nextLinkClassName="page-link"
        pageLinkClassName="page-link"
        breakLinkClassName="page-link"
        previousLinkClassName="page-link"
        nextClassName="page-item next-item"
        previousClassName="page-item prev-item"
        containerClassName={
          "pagination react-paginate separated-pagination pagination-sm justify-content-end pe-1 mt-1"
        }
      />
    );
  };

  return (
    <Fragment>
      <ToastContainer position="top-left" autoClose={3000} />

      <Card>
        <CardHeader className="border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {fromCompany && (
                <Button
                  color="secondary"
                  onClick={handleBackClick}
                  className="me-2 d-flex align-items-center"
                >
                  <ArrowLeft size={14} className="me-50" />
                  {t("Back")}
                </Button>
              )}
              <CardTitle tag="h4" className="mb-0">
                {fromCompany && company
                  ? `${t("Weight Management")} - ${company.company_name}`
                  : t("Weight Management")}
                {fromCompany && (
                  <Badge color="primary" className="ms-2">
                    {t("Company View")}
                  </Badge>
                )}
                <Badge color="dark" className="ms-2 m-1 p-1">
                  {totalWeights} {t("Weights")}
                </Badge>
              </CardTitle>
            </div>
            <div className="d-flex gap-1">
              <Button
                color="secondary"
                onClick={toggleFilter}
                className="d-flex align-items-center"
              >
                <Filter size={14} className="me-50" />
                {t("Filter")}
                {filterOpen && <X size={14} className="ms-50" />}
              </Button>
              <Button
                color="primary"
                onClick={handleAddWeightClick}
                className="d-flex align-items-center"
                disabled={balanceLoading}
              >
                {balanceLoading ? (
                  <Spinner size="sm" className="me-50" />
                ) : (
                  <Plus size={14} className="me-50" />
                )}
                {t("Add Weight")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="billNumber">
                  {t("Bill Number")}:
                </Label>
                <Input
                  id="billNumber"
                  type="text"
                  placeholder={t("Filter by bill number")}
                  value={searchBillNumber}
                  onChange={(e) => setSearchBillNumber(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="vehicle">
                  {t("Vehicle")}:
                </Label>
                <Input
                  id="vehicle"
                  type="text"
                  placeholder={t("Filter by vehicle")}
                  value={searchVehicle}
                  onChange={(e) => setSearchVehicle(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="mineral">
                  {t("Mineral")}:
                </Label>
                <Input
                  id="mineral"
                  type="text"
                  placeholder={t("Filter by mineral")}
                  value={searchMineral}
                  onChange={(e) => setSearchMineral(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="createDate">
                  {t("Create Date")}:
                </Label>
                <Input
                  type="date"
                  id="createDate"
                  value={searchCreateDate}
                  onChange={(e) => setSearchCreateDate(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="area">
                  {t("Area")}:
                </Label>
                <Input
                  id="area"
                  type="text"
                  placeholder={t("Filter by area")}
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="transferType">
                  {t("Transfer Type")}:
                </Label>
                <Input
                  type="select"
                  id="transferType"
                  value={searchTransferType}
                  onChange={(e) => setSearchTransferType(e.target.value)}
                >
                  <option value="">{t("All Types")}</option>
                  {transferTypes.map((type) => (
                    <option key={type} value={type}>
                      {t(type.charAt(0).toUpperCase() + type.slice(1))}
                    </option>
                  ))}
                </Input>
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="purchaseNumber">
                  {t("Purchase Number")}:
                </Label>
                <Input
                  id="purchaseNumber"
                  type="text"
                  placeholder={t("Filter by purchase number")}
                  value={searchPurchaseNumber}
                  onChange={(e) => setSearchPurchaseNumber(e.target.value)}
                />
              </Col>

              {!fromCompany && (
                <Col lg="3" md="6" className="mb-1">
                  <Label className="form-label" htmlFor="company">
                    {t("Company")}:
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder={t("Filter by company")}
                    value={searchCompany}
                    onChange={(e) => setSearchCompany(e.target.value)}
                  />
                </Col>
              )}

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="driver">
                  {t("Driver Name")}:
                </Label>
                <Input
                  id="driver"
                  type="text"
                  placeholder={t("Filter by driver")}
                  value={searchDriver}
                  onChange={(e) => setSearchDriver(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="plateNumber">
                  {t("Plate Number")}:
                </Label>
                <Input
                  id="plateNumber"
                  type="text"
                  placeholder={t("Filter by plate number")}
                  value={searchPlateNumber}
                  onChange={(e) => setSearchPlateNumber(e.target.value)}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="maktoobType">
                  {t("Maktoob Type")}:
                </Label>
                <Input
                  id="maktoobType"
                  type="text"
                  placeholder={t("Filter by maktoob type")}
                  value={searchMaktoobType}
                  onChange={(e) => setSearchMaktoobType(e.target.value)}
                />
              </Col>

              <Col
                lg="12"
                className="mb-1 d-flex align-items-end justify-content-end"
              >
                <Button
                  color="outline-secondary"
                  onClick={clearFilters}
                  className="me-1"
                >
                  {t("Clear Filters")}
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Collapse>

        {/* Data Table */}
        <CardBody>
          {loading && !dataLoaded ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading weights...")}</p>
            </div>
          ) : filteredData.length === 0 && weights.length === 0 ? (
            <div className="text-center py-5">
              <h5>
                {fromCompany && company
                  ? t(`No weights found for ${company.company_name}`)
                  : t("No weights found")}
              </h5>
              <p className="text-muted">
                {fromCompany && company
                  ? t(
                      `No weights recorded for ${company.company_name} yet. Add the first weight!`,
                    )
                  : ""}
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-5">
              <Database size={48} className="text-muted mb-3" />
              <h5>{t("No weights match your filters")}</h5>
              <p className="text-muted">
                {t("Try clearing filters or adjust your search criteria.")}
              </p>
              <Button color="secondary" onClick={clearFilters}>
                {t("Clear Filters")}
              </Button>
            </div>
          ) : (
            <div className="react-dataTable">
              <DataTable
                noHeader
                pagination
                columns={columns}
                paginationPerPage={10}
                className="react-dataTable"
                sortIcon={<ChevronDown size={10} />}
                paginationDefaultPage={currentPage + 1}
                paginationComponent={CustomPagination}
                data={filteredData}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Weight Modal */}
      <Modal isOpen={addWeightModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          {t("Add New Weight")}
          {fromCompany && company && ` - ${company.company_name}`}
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading form data...")}</p>
            </div>
          ) : (
            <WeightForm
              onSuccess={handleAddWeightSubmit}
              onCancel={closeModals}
              selectedCompany={fromCompany ? company : null}
              loading={isSubmitting}
              isEdit={false}
              vehicles={vehicles}
              scales={scales}
              minerals={minerals}
              units={units}
              purchases={purchases}
              companies={companies}
              existingBillNumbers={existingBillNumbers}
              availableBalance={availableBalance}
              debugInfo={debugInfo}
              onCheckBalance={checkAvailableBalance}
              maktoobs={maktoobs}
              transferTypes={transferTypes}
              // Pass the new functions to WeightForm
              getPurchasesForCompany={getPurchasesForCompany}
              getLatestPurchaseForCompany={getLatestPurchaseForCompany}
            />
          )}
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default WeightTable;