// PurchaseTable.js - Fixed Pagination Version with Filtered Maktoobs
// ** React Imports
import { useState, Fragment, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ** Import AddNewPurchase Component
import AddNewPurchase from "./addContractSales/AddNewContractSales";

// ** Third Party Components
import ReactPaginate from "react-paginate";
import {
  ChevronDown,
  Plus,
  Filter,
  X,
  Edit,
  Trash2,
  Database,
  ArrowLeft,
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
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
} from "reactstrap";

import gregorianToShamsi from '../gregorianToShamsi';

// ** Styles
import "@styles/react/libs/flatpickr/flatpickr.scss";

// ** API Base URL
const API_URL = "http://127.0.0.1:8000/test1";

const PurchaseTable = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ** Get company data from navigation
  const { company: companyFromState, fromCompany: fromCompanyState } = location.state || {};
  
  // Get from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const companyIdFromUrl = searchParams.get("companyId");
  const companyNameFromUrl = searchParams.get("companyName");

  const company = companyFromState || 
    (companyIdFromUrl ? {
      id: parseInt(companyIdFromUrl),
      company_name: decodeURIComponent(companyNameFromUrl || ""),
    } : null);

  const fromCompany = fromCompanyState || !!companyIdFromUrl;

  // ** States
  const [searchArea, setSearchArea] = useState("");
  const [searchMineralAmount, setSearchMineralAmount] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [searchMineral, setSearchMineral] = useState("");
  const [searchDate, setSearchDate] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [allPurchasesLoaded, setAllPurchasesLoaded] = useState(false);

  // ** Current User State
  const [currentUser, setCurrentUser] = useState(null);

  // ** Dropdown Data States
  const [companies, setCompanies] = useState([]);
  const [allMaktoobs, setAllMaktoobs] = useState([]); // Store ALL maktoobs
  const [filteredMaktoobs, setFilteredMaktoobs] = useState([]); // Maktoobs filtered by company
  const [minerals, setMinerals] = useState([]);
  const [scales, setScales] = useState([]);
  const [units, setUnits] = useState([]);
  const [companiesMap, setCompaniesMap] = useState({});
  const [mineralsMap, setMineralsMap] = useState({});
  const [scalesMap, setScalesMap] = useState({});
  const [unitsMap, setUnitsMap] = useState({});
  const [maktoobsMap, setMaktoobsMap] = useState({});

  // ** Modal States
  const [addPurchaseModal, setAddPurchaseModal] = useState(false);
  const [editPurchaseModal, setEditPurchaseModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** Pagination states
  const itemsPerPage = 7;

  // ** Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  // ** Get current user from token or API
  const getCurrentUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return null;
      }

      // Decode token to get user info
      const tokenParts = token.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));

        if (payload.user_id || payload.userId || payload.sub) {
          const userId = payload.user_id || payload.userId || payload.sub;

          if (payload.username || payload.email) {
            return {
              id: userId,
              username: payload.username || payload.email?.split("@")[0] || `User_${userId}`,
              email: payload.email || `${payload.username}@example.com` || "",
              displayName: payload.username || payload.email?.split("@")[0] || `User ${userId}`,
            };
          }
        }
      }

      // If token doesn't have user info, fetch from API
      const config = getAxiosConfig();
      const response = await axios.get(`${API_URL}/auth/user/`, config);

      if (response.data) {
        return {
          id: response.data.id,
          username: response.data.username || response.data.email?.split("@")[0],
          email: response.data.email || "",
          displayName: response.data.username || response.data.email?.split("@")[0] || `User ${response.data.id}`,
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  };

  // ** Configure axios headers
  const getAxiosConfig = () => {
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
  };

  // ** Utility function to get display value for foreign keys
  const getDisplayValue = useCallback(
    (item, field = "name", fallbackFields = []) => {
      if (!item) return "N/A";

      if (typeof item === "object" && item !== null) {
        if (item[field] !== undefined && item[field] !== null) {
          return item[field].toString();
        }

        for (const fallbackField of fallbackFields) {
          if (item[fallbackField] !== undefined && item[fallbackField] !== null) {
            return item[fallbackField].toString();
          }
        }

        if (item.company_name !== undefined && item.company_name !== null)
          return item.company_name.toString();
        if (item.username !== undefined && item.username !== null)
          return item.username.toString();
        if (item.email !== undefined && item.email !== null)
          return item.email.toString();
        if (item.maktoob_number !== undefined && item.maktoob_number !== null)
          return `Maktoob #${item.maktoob_number}`;
        if (item.scale_number !== undefined && item.scale_number !== null)
          return `Scale #${item.scale_number}`;
        if (item.name !== undefined && item.name !== null)
          return item.name.toString();
        if (item.id !== undefined && item.id !== null) return `ID: ${item.id}`;

        return "N/A";
      }

      if (item !== null && item !== undefined) {
        return item.toString();
      }

      return "N/A";
    },
    [],
  );

  // ** Filter maktoobs by company ID
  const filterMaktoobsByCompany = useCallback((companyId, allMaktoobsData = allMaktoobs) => {
    if (!companyId || !allMaktoobsData || allMaktoobsData.length === 0) {
      return [];
    }

    const filtered = allMaktoobsData.filter(maktoob => {
      // Check if maktoob has company field
      if (maktoob.company) {
        if (typeof maktoob.company === 'object') {
          return maktoob.company.id === companyId;
        } else {
          return maktoob.company === companyId;
        }
      }
      return false;
    });

    console.log(`Filtered ${filtered.length} maktoobs for company ${companyId}`);
    return filtered;
  }, [allMaktoobs]);

  // ** Handle Back Button Click
  const handleBackClick = () => {
    navigate(-1);
  };

  // ** Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    setDropdownLoading(true);
    try {
      const config = getAxiosConfig();

      // Define all endpoints to fetch
      const endpoints = [
        { key: "companies", url: `${API_URL}/companies/`, type: "companies" },
        { key: "maktoobs", url: `${API_URL}/maktoobs/`, type: "maktoobs" },
        { key: "minerals", url: `${API_URL}/minerals/`, type: "minerals" },
        { key: "scales", url: `${API_URL}/scales/`, type: "scales" },
        { key: "units", url: `${API_URL}/units/`, type: "units" },
      ];

      // Fetch all data
      const fetchPromises = endpoints.map(async (endpoint) => {
        try {
          const response = await axios.get(endpoint.url, config);
          const data = response.data.results || response.data || [];
          return Array.isArray(data) ? data : [data];
        } catch (error) {
          console.error(`Error fetching ${endpoint.key}:`, error);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);

      // Extract data from results
      const companiesData = results[0];
      const maktoobsData = results[1];
      const mineralsData = results[2];
      const scalesData = results[3];
      const unitsData = results[4];

      // Store ALL maktoobs
      setAllMaktoobs(maktoobsData);

      // Filter maktoobs if we're in company view
      let filteredMaktoobsData = [];
      if (fromCompany && company && company.id) {
        filteredMaktoobsData = filterMaktoobsByCompany(company.id, maktoobsData);
      } else {
        filteredMaktoobsData = maktoobsData;
      }

      // Create mapping objects
      const createMapping = (data, type) => {
        const mapping = {};
        data.forEach((item) => {
          if (item && item.id) {
            mapping[item.id] = {
              ...item,
              displayName: (() => {
                switch (type) {
                  case "companies":
                    return (item.company_name || item.name || `Company #${item.id}`);
                  case "minerals":
                    return (item.name || item.mineral_name || `Mineral #${item.id}`);
                  case "scales":
                    return (item.name || item.scale_number || `Scale #${item.id}`);
                  case "units":
                    return (item.name || item.unit_name || item.unit_code || `Unit #${item.id}`);
                  case "maktoobs":
                    return item.maktoob_number
                      ? `Maktoob #${item.maktoob_number}`
                      : item.name || `Maktoob #${item.id}`;
                  default:
                    return item.name || `Item #${item.id}`;
                }
              })(),
            };
          }
        });
        return mapping;
      };

      const companiesMapping = createMapping(companiesData, "companies");
      const mineralsMapping = createMapping(mineralsData, "minerals");
      const scalesMapping = createMapping(scalesData, "scales");
      const unitsMapping = createMapping(unitsData, "units");
      const maktoobsMapping = createMapping(maktoobsData, "maktoobs");

      // Update all state
      setCompanies(companiesData);
      setFilteredMaktoobs(filteredMaktoobsData);
      setMinerals(mineralsData);
      setScales(scalesData);
      setUnits(unitsData);
      setCompaniesMap(companiesMapping);
      setMineralsMap(mineralsMapping);
      setScalesMap(scalesMapping);
      setUnitsMap(unitsMapping);
      setMaktoobsMap(maktoobsMapping);

      return {
        companiesData,
        maktoobsData,
        filteredMaktoobsData,
        mineralsData,
        scalesData,
        unitsData,
        companiesMapping,
        mineralsMapping,
        scalesMapping,
        unitsMapping,
        maktoobsMapping,
      };
    } catch (error) {
      toast.error("Failed to load dropdown data");
      return {
        companiesData: [],
        maktoobsData: [],
        filteredMaktoobsData: [],
        mineralsData: [],
        scalesData: [],
        unitsData: [],
        companiesMapping: {},
        mineralsMapping: {},
        scalesMapping: {},
        unitsMapping: {},
        maktoobsMapping: {},
      };
    } finally {
      setDropdownLoading(false);
    }
  }, [t, fromCompany, company, filterMaktoobsByCompany]);

  // ** Fetch ALL purchases for client-side filtering and pagination
  const fetchAllPurchases = useCallback(async (dropdownData = null) => {
    setLoading(true);
    try {
      const config = getAxiosConfig();

      // Build URL - fetch all purchases without pagination
      let url = `${API_URL}/purchases/`;

      // When in company view, try to filter server-side
      if (fromCompany && company) {
        url = `${API_URL}/purchases/`;
      }

      console.log("Fetching all purchases from:", url);

      // Fetch all data
      let allPurchases = [];
      let nextUrl = url;

      while (nextUrl) {
        try {
          const response = await axios.get(nextUrl, config);
          console.log("Purchases API response:", response.data);

          let pageData = [];
          if (response.data && response.data.results) {
            pageData = response.data.results;
            nextUrl = response.data.next;
          } else if (Array.isArray(response.data)) {
            pageData = response.data;
            nextUrl = null;
          } else {
            pageData = [];
            nextUrl = null;
          }

          allPurchases = [...allPurchases, ...pageData];
          console.log(`Fetched ${pageData.length} purchases, total: ${allPurchases.length}`);

          if (!nextUrl) break;
        } catch (error) {
          console.error("Error fetching purchases page:", error);
          break;
        }
      }

      console.log(`Total purchases fetched: ${allPurchases.length}`);

      // Use provided dropdown data or current state
      const companiesMapping = dropdownData?.companiesMapping || companiesMap;
      const mineralsMapping = dropdownData?.mineralsMapping || mineralsMap;
      const scalesMapping = dropdownData?.scalesMapping || scalesMap;
      const unitsMapping = dropdownData?.unitsMapping || unitsMap;
      const maktoobsMapping = dropdownData?.maktoobsMapping || maktoobsMap;

      // Enhance purchases with related objects
      const enhancedPurchases = allPurchases.map((purchase) => {
        // Helper function to extract data
        const extractData = (id, map, type = "object") => {
          if (!id) return null;

          if (type === "object" && typeof purchase[`${type}Obj`] === "object") {
            return purchase[`${type}Obj`];
          }

          return map[id] || null;
        };

        const companyObj = extractData(purchase.company, companiesMapping, "company");
        const mineralObj = extractData(purchase.mineral, mineralsMapping, "mineral");
        const userObj = purchase.user_obj || null;
        const scaleObj = extractData(purchase.scale, scalesMapping, "scale");
        const unitObj = extractData(purchase.unit, unitsMapping, "unit");
        const maktoobObj = extractData(purchase.maktoob, maktoobsMapping, "maktoob");

        // Get company ID for filtering
        let companyId = null;
        if (typeof purchase.company === 'object' && purchase.company.id) {
          companyId = purchase.company.id;
        } else if (purchase.company) {
          companyId = parseInt(purchase.company);
        }

        return {
          ...purchase,
          companyObj,
          mineralObj,
          userObj,
          scaleObj,
          unitObj,
          maktoobObj,
          company_id: companyId,
          companyDisplay: getDisplayValue(companyObj, "company_name", ["name"]),
          mineralDisplay: getDisplayValue(mineralObj, "name", ["mineral_name"]),
          userDisplay: getDisplayValue(userObj, "username", ["email"]),
          scaleDisplay: getDisplayValue(scaleObj, "name", ["scale_number"]),
          unitDisplay: getDisplayValue(unitObj, "name", ["unit_name", "unit_code"]),
          maktoobDisplay: getDisplayValue(maktoobObj, "maktoob_number", ["name"]),
        };
      });

      // Filter by company if needed
      let finalData = enhancedPurchases;
      
      if (fromCompany && company) {
        finalData = enhancedPurchases.filter((purchase) => {
          if (!purchase.company_id) {
            console.log(`Purchase ${purchase.id} has no company_id, skipping`);
            return false;
          }
          const matches = purchase.company_id === company.id;
          return matches;
        });
        
        console.log(`Filtered ${finalData.length} purchases for company ${company.company_name}`);
      }

      setPurchases(finalData);
      setFilteredData(finalData);
      setTotalPurchases(finalData.length);
      setTotalPages(Math.ceil(finalData.length / itemsPerPage));
      setAllPurchasesLoaded(true);

      return finalData;
    } catch (error) {
      console.error("Error fetching purchases:", error);
      if (error.response?.status === 404) {
        toast.error(t("Purchases endpoint not found. Check Django URLs."));
      } else if (error.response?.status === 401) {
        toast.error(t("Please login first to view purchases"));
      } else if (error.code === "ERR_NETWORK") {
        toast.error(t("Network error. Please check your connection."));
      } else {
        toast.error(t("Failed to load purchases"));
      }

      setPurchases([]);
      setFilteredData([]);
      setTotalPurchases(0);
      setTotalPages(0);
      return [];
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  }, [
    companiesMap,
    mineralsMap,
    scalesMap,
    unitsMap,
    maktoobsMap,
    getDisplayValue,
    t,
    fromCompany,
    company,
  ]);

  // ** Initialize data
  useEffect(() => {
    const initializeData = async () => {
      // First, get current user
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      } else {
        toast.error(t("Unable to identify current user. Please login again."));
      }

      // Then fetch dropdown data and all purchases
      const dropdownData = await fetchDropdownData();
      await fetchAllPurchases(dropdownData);
    };

    initializeData();
  }, []); // Empty dependency array to run only once on mount

  // ** Apply filters when search criteria change - CLIENT SIDE FILTERING
  useEffect(() => {
    if (!allPurchasesLoaded) return;

    let data = purchases;

    if (searchArea) {
      data = data.filter((purchase) =>
        purchase.area?.toLowerCase().includes(searchArea.toLowerCase()),
      );
    }

    if (searchMineralAmount) {
      data = data.filter((purchase) =>
        purchase.mineral_amount?.toString().includes(searchMineralAmount),
      );
    }

    // Only show company filter if not in company view
    if (searchCompany && !fromCompany) {
      data = data.filter((purchase) => {
        const companyDisplay = purchase.companyDisplay || 
          getDisplayValue(purchase.companyObj, "company_name", ["name"]);
        return companyDisplay.toLowerCase().includes(searchCompany.toLowerCase());
      });
    }

    if (searchMineral) {
      data = data.filter((purchase) => {
        const mineralDisplay = purchase.mineralDisplay || 
          getDisplayValue(purchase.mineralObj, "name", ["mineral_name"]);
        return mineralDisplay.toLowerCase().includes(searchMineral.toLowerCase());
      });
    }

    if (searchDate.length === 2) {
      const [start, end] = searchDate;
      data = data.filter((purchase) => {
        if (!purchase.create_at) return false;
        const createDate = new Date(purchase.create_at);
        return createDate >= start && createDate <= end;
      });
    }

    setFilteredData(data);
    setTotalPages(Math.ceil(data.length / itemsPerPage));
    setCurrentPage(0); // Reset to first page when filtering
  }, [
    searchArea,
    searchMineralAmount,
    searchCompany,
    searchMineral,
    searchDate,
    purchases,
    getDisplayValue,
    fromCompany,
    allPurchasesLoaded,
  ]);

  // ** Handle Edit Click
  const handleEdit = (purchase) => {
    setSelectedPurchase(purchase);
    setEditPurchaseModal(true);
  };

  // ** Handle Delete Click
  const handleDeleteClick = (purchaseId) => {
    const purchase = purchases.find((p) => p.id === purchaseId);
    setSelectedPurchase(purchase);
    setDeleteModal(true);
  };

  // ** Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (selectedPurchase) {
      try {
        const config = getAxiosConfig();
        await axios.delete(`${API_URL}/purchases/${selectedPurchase.id}/`, config);
        toast.success(t("Purchase deleted successfully!"));

        // Update state immediately for better UX
        const updatedPurchases = purchases.filter((p) => p.id !== selectedPurchase.id);
        setPurchases(updatedPurchases);
        setFilteredData(updatedPurchases.filter(purchase => {
          // Reapply current filters
          let passes = true;
          
          if (searchArea) {
            passes = passes && purchase.area?.toLowerCase().includes(searchArea.toLowerCase());
          }
          
          if (searchMineralAmount) {
            passes = passes && purchase.mineral_amount?.toString().includes(searchMineralAmount);
          }
          
          if (searchCompany && !fromCompany) {
            const companyDisplay = purchase.companyDisplay || 
              getDisplayValue(purchase.companyObj, "company_name", ["name"]);
            passes = passes && companyDisplay.toLowerCase().includes(searchCompany.toLowerCase());
          }
          
          if (searchMineral) {
            const mineralDisplay = purchase.mineralDisplay || 
              getDisplayValue(purchase.mineralObj, "name", ["mineral_name"]);
            passes = passes && mineralDisplay.toLowerCase().includes(searchMineral.toLowerCase());
          }
          
          if (searchDate.length === 2) {
            const [start, end] = searchDate;
            if (!purchase.create_at) return false;
            const createDate = new Date(purchase.create_at);
            passes = passes && (createDate >= start && createDate <= end);
          }
          
          return passes;
        }));
        setTotalPurchases(updatedPurchases.length);
        setTotalPages(Math.ceil(updatedPurchases.length / itemsPerPage));

        setDeleteModal(false);
        setSelectedPurchase(null);
      } catch (error) {
        toast.error(t("Failed to delete purchase"));
      }
    }
  };

  // ** Close All Modals
  const closeModals = () => {
    setAddPurchaseModal(false);
    setEditPurchaseModal(false);
    setDeleteModal(false);
    setSelectedPurchase(null);
    setIsSubmitting(false);
  };

  // ** Handle Add Purchase Submission
  const handleAddPurchase = async (purchaseData) => {
    if (!currentUser) {
      toast.error(t("Unable to identify current user. Please login again."));
      return;
    }

    setIsSubmitting(true);

    try {
      const config = getAxiosConfig();

      const formattedData = {
        area: purchaseData.area || "",
        mineral_amount: parseInt(purchaseData.mineral_amount) || 0,
        unit_price: parseFloat(purchaseData.unit_price) || 0,
        mineral_total_price: parseFloat(purchaseData.mineral_total_price) || 0,
        weighing_total_price: parseInt(purchaseData.weighing_total_price) || 0,
        royalty_receipt_number: purchaseData.royalty_receipt_number
          ? parseInt(purchaseData.royalty_receipt_number)
          : null,
        haq_wazan_receipt_number: purchaseData.haq_wazan_receipt_number
          ? parseInt(purchaseData.haq_wazan_receipt_number)
          : null,
        user: currentUser.id,
      };

      // Add foreign key fields
      if (fromCompany && company) {
        formattedData.company = company.id;
        console.log(`Adding purchase with company: ${company.id} (${company.company_name})`);
      } else if (purchaseData.company && purchaseData.company !== "") {
        formattedData.company = parseInt(purchaseData.company);
      }

      if (purchaseData.maktoob && purchaseData.maktoob !== "") {
        formattedData.maktoob = parseInt(purchaseData.maktoob);
      }

      if (purchaseData.mineral && purchaseData.mineral !== "") {
        formattedData.mineral = parseInt(purchaseData.mineral);
      }

      if (purchaseData.scale && purchaseData.scale !== "") {
        formattedData.scale = parseInt(purchaseData.scale);
      }

      if (purchaseData.unit && purchaseData.unit !== "") {
        formattedData.unit = parseInt(purchaseData.unit);
      }

      const response = await axios.post(`${API_URL}/purchases/`, formattedData, config);

      if (response.status === 201) {
        toast.success(t("Purchase added successfully!"));
        setAddPurchaseModal(false);
        
        // Refresh all purchases after adding new one
        await fetchAllPurchases();
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
      if (error.response?.data) {
        if (typeof error.response.data === "object") {
          Object.keys(error.response.data).forEach((key) => {
            if (Array.isArray(error.response.data[key])) {
              error.response.data[key].forEach((err) => {
                toast.error(`${key}: ${err}`);
              });
            } else {
              toast.error(`${key}: ${error.response.data[key]}`);
            }
          });
        } else {
          toast.error(error.response.data);
        }
      } else {
        toast.error(t("Failed to add purchase"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Handle Edit Purchase Submission
  const handleEditPurchase = async (purchaseData) => {
    setIsSubmitting(true);

    try {
      const config = getAxiosConfig();

      const formattedData = {
        area: purchaseData.area || "",
        mineral_amount: parseInt(purchaseData.mineral_amount) || 0,
        unit_price: parseFloat(purchaseData.unit_price) || 0,
        mineral_total_price: parseFloat(purchaseData.mineral_total_price) || 0,
        weighing_total_price: parseInt(purchaseData.weighing_total_price) || 0,
        royalty_receipt_number: purchaseData.royalty_receipt_number
          ? parseInt(purchaseData.royalty_receipt_number)
          : null,
        haq_wazan_receipt_number: purchaseData.haq_wazan_receipt_number
          ? parseInt(purchaseData.haq_wazan_receipt_number)
          : null,
        user: selectedPurchase?.user || currentUser?.id,
      };

      // Add foreign key fields
      if (purchaseData.company !== undefined && purchaseData.company !== "") {
        formattedData.company = purchaseData.company ? parseInt(purchaseData.company) : null;
      } else {
        formattedData.company = null;
      }

      if (purchaseData.maktoob !== undefined && purchaseData.maktoob !== "") {
        formattedData.maktoob = purchaseData.maktoob ? parseInt(purchaseData.maktoob) : null;
      } else {
        formattedData.maktoob = null;
      }

      if (purchaseData.mineral !== undefined && purchaseData.mineral !== "") {
        formattedData.mineral = purchaseData.mineral ? parseInt(purchaseData.mineral) : null;
      } else {
        formattedData.mineral = null;
      }

      if (purchaseData.scale !== undefined && purchaseData.scale !== "") {
        formattedData.scale = purchaseData.scale ? parseInt(purchaseData.scale) : null;
      } else {
        formattedData.scale = null;
      }

      if (purchaseData.unit !== undefined && purchaseData.unit !== "") {
        formattedData.unit = purchaseData.unit ? parseInt(purchaseData.unit) : null;
      } else {
        formattedData.unit = null;
      }

      const response = await axios.put(
        `${API_URL}/purchases/${selectedPurchase.id}/`,
        formattedData,
        config,
      );

      if (response.status === 200) {
        toast.success(t("Purchase updated successfully!"));
        setEditPurchaseModal(false);
        setSelectedPurchase(null);
        // Refresh all purchases after edit
        await fetchAllPurchases();
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
      if (error.response?.data) {
        if (typeof error.response.data === "object") {
          Object.keys(error.response.data).forEach((key) => {
            if (Array.isArray(error.response.data[key])) {
              error.response.data[key].forEach((err) => {
                toast.error(`${key}: ${err}`);
              });
            } else {
              toast.error(`${key}: ${error.response.data[key]}`);
            }
          });
        } else {
          toast.error(error.response.data);
        }
      } else {
        toast.error(t("Failed to update purchase"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ** Get current page data
  const getCurrentPageData = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // ** Purchase columns configuration
  const columns = [
    {
      name: t("ID"),
      selector: (row) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: t("Area"),
      selector: (row) => row.area || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("Mineral Amount"),
      selector: (row) => row.mineral_amount || 0,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span>
          {row.mineral_amount ? row.mineral_amount.toLocaleString() : "0"}
        </span>
      ),
    },
    {
      name: t("Unit Price"),
      selector: (row) => row.unit_price || 0,
      sortable: true,
      width: "100px",
      cell: (row) => (
        <span>
          {row.unit_price ? parseFloat(row.unit_price).toFixed(2) : "0.00"} AF
        </span>
      ),
    },
    {
      name: t("Total Price"),
      selector: (row) => row.mineral_total_price || 0,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <strong>
          {row.mineral_total_price
            ? parseFloat(row.mineral_total_price).toFixed(2)
            : "0.00"}{" "}
          AF
        </strong>
      ),
    },
    // Only show Company column if not in company view
    ...(!fromCompany
      ? [
          {
            name: t("Company"),
            selector: (row) =>
              row.companyDisplay ||
              getDisplayValue(row.companyObj, "company_name", ["name"]),
            sortable: true,
            minWidth: "150px",
            cell: (row) => {
              const companyName =
                row.companyDisplay ||
                getDisplayValue(row.companyObj, "company_name", ["name"]);
              return (
                <Badge
                  color="primary"
                  className="text-truncate"
                  style={{ maxWidth: "150px" }}
                >
                  {companyName}
                </Badge>
              );
            },
          },
        ]
      : []),
    {
      name: t("Mineral"),
      selector: (row) =>
        row.mineralDisplay ||
        getDisplayValue(row.mineralObj, "name", ["mineral_name"]),
      sortable: true,
      width: "120px",
    },
    {
      name: t("Royalty Receipt"),
      selector: (row) => row.royalty_receipt_number || "N/A",
      sortable: true,
      width: "130px",
    },
    {
      name: t("Weighing Total"),
      selector: (row) => row.weighing_total_price || 0,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span>
          {row.weighing_total_price
            ? row.weighing_total_price.toLocaleString()
            : "0"}{" "}
          AF
        </span>
      ),
    },
    {
      name: t("Haq Wazan"),
      selector: (row) => row.haq_wazan_receipt_number || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: t("Unit"),
      selector: (row) =>
        row.unitDisplay ||
        getDisplayValue(row.unitObj, "name", ["unit_name", "unit_code"]),
      sortable: true,
      width: "100px",
      cell: (row) => {
        const unitName =
          row.unitDisplay ||
          getDisplayValue(row.unitObj, "name", ["unit_name", "unit_code"]);
        return <Badge color="secondary">{unitName}</Badge>;
      },
    },
    {
      name: t("Maktoob"),
      selector: (row) =>
        row.maktoobDisplay ||
        getDisplayValue(row.maktoobObj, "maktoob_number", ["name"]),
      sortable: true,
      width: "130px",
      cell: (row) => {
        const maktoobValue =
          row.maktoobDisplay ||
          getDisplayValue(row.maktoobObj, "maktoob_number", ["name"]);
        return maktoobValue !== "N/A" ? (
          <Badge color="success" pill>
            {maktoobValue}
          </Badge>
        ) : (
          "N/A"
        );
      },
    },
    {
      name: t("Date"),
      selector: (row) =>
        row.create_at
          ? gregorianToShamsi(row.create_at)
          : "N/A",
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("Actions"),
      width: "120px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            color="primary"
            size="sm"
            onClick={() => handleEdit(row)}
            className="btn-icon"
            title={t("Edit")}
          >
            <Edit size={12} />
          </Button>
          <Button
            color="danger"
            size="sm"
            onClick={() => handleDeleteClick(row.id)}
            className="btn-icon"
            title={t("Delete")}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      ),
    },
  ];

  // ** Function to handle Pagination
  const handlePagination = (page) => {
    const newPage = page.selected;
    setCurrentPage(newPage);
  };

  // ** Custom Pagination
  const CustomPagination = () => {
    const pageCount = totalPages;

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

  // ** Toggle Filter Section
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // ** Clear All Filters
  const clearFilters = () => {
    setSearchArea("");
    setSearchMineralAmount("");
    setSearchCompany("");
    setSearchMineral("");
    setSearchDate([]);
  };

  // ** Handle Add Purchase Button Click
  const handleAddPurchaseClick = () => {
    if (!currentUser) {
      toast.error(t("Unable to identify current user. Please login again."));
      return;
    }
    setAddPurchaseModal(true);
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
              <div>
                <CardTitle tag="h4" className="mb-0 m-1">
                  {fromCompany && company
                    ? `${t("Purchase Management")} - ${company.company_name}`
                    : t("Purchase Management")}
                  {fromCompany && company && (
                    <Badge color="primary" className="ms-2">
                      {t("Company View")}
                    </Badge>
                  )}
                </CardTitle>
              </div>
              <div className="d-flex align-items-center mt-1">
                <Badge color="dark" className="p-1 me-2">
                  {filteredData.length} {t("Purchases")}
                  {filteredData.length !== purchases.length && (
                    <span className="ms-1">
                      (of {purchases.length} total)
                    </span>
                  )}
                </Badge>
              </div>
            </div>
            <div className="d-flex gap-1">
              <Button
                color="secondary"
                onClick={toggleFilter}
                className="d-flex align-items-center"
                disabled={loading}
              >
                <Filter size={14} className="me-50" />
                {t("Filter")}
                {filterOpen && <X size={14} className="ms-50" />}
              </Button>
              <Button
                color="primary"
                onClick={handleAddPurchaseClick}
                className="d-flex align-items-center"
                disabled={loading || dropdownLoading || !currentUser}
              >
                <Plus size={14} className="me-50" />
                {t("Add Purchase")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Section */}
        <Collapse isOpen={filterOpen}>
          <CardBody className="pt-0">
            <Row className="mt-1 mb-50">
              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="area">
                  {t("Area")}:
                </Label>
                <Input
                  id="area"
                  placeholder={t("Filter by Area")}
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                  disabled={loading}
                />
              </Col>

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="mineralAmount">
                  {t("Mineral Amount")}:
                </Label>
                <Input
                  id="mineralAmount"
                  type="number"
                  placeholder={t("Filter by Mineral Amount")}
                  value={searchMineralAmount}
                  onChange={(e) => setSearchMineralAmount(e.target.value)}
                  disabled={loading}
                />
              </Col>

              {/* Only show company filter if not in company view */}
              {!fromCompany && (
                <Col lg="3" md="6" className="mb-1">
                  <Label className="form-label" htmlFor="company">
                    {t("Company")}:
                  </Label>
                  <Input
                    id="company"
                    placeholder={t("Filter by Company")}
                    value={searchCompany}
                    onChange={(e) => setSearchCompany(e.target.value)}
                    disabled={loading}
                  />
                </Col>
              )}

              <Col lg="3" md="6" className="mb-1">
                <Label className="form-label" htmlFor="mineral">
                  {t("Mineral")}:
                </Label>
                <Input
                  id="mineral"
                  placeholder={t("Filter by Mineral")}
                  value={searchMineral}
                  onChange={(e) => setSearchMineral(e.target.value)}
                  disabled={loading}
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
                  disabled={loading}
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
              <p className="mt-2">{t("Loading purchases...")}</p>
            </div>
          ) : filteredData.length === 0 && purchases.length === 0 ? (
            <div className="text-center py-5">
              <h5>
                {fromCompany && company
                  ? t(`No purchases found for ${company.company_name}`)
                  : t("No purchases found")}
              </h5>
              <p className="text-muted">
                {fromCompany && company
                  ? t(`No purchases recorded for ${company.company_name} yet. Add the first purchase!`)
                  : ""}
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-5">
              <Database size={48} className="text-muted mb-3" />
              <h5>{t("No purchases match your filters")}</h5>
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
                paginationPerPage={itemsPerPage}
                className="react-dataTable"
                sortIcon={<ChevronDown size={10} />}
                paginationDefaultPage={currentPage + 1}
                paginationComponent={CustomPagination}
                data={getCurrentPageData()}
                paginationTotalRows={filteredData.length}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Purchase Modal */}
      <Modal isOpen={addPurchaseModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          <div className="d-flex align-items-center">
            <div>
              {fromCompany && company
                ? `${t("Add New Purchase")} - ${company.company_name}`
                : t("Add New Purchase")}
            </div>
            {dropdownLoading && (
              <Spinner size="sm" color="primary" className="ms-2" />
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          {dropdownLoading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">{t("Loading dropdown data...")}</p>
            </div>
          ) : (
            <AddNewPurchase
              onSuccess={handleAddPurchase}
              onCancel={closeModals}
              loading={isSubmitting}
              isEdit={false}
              companies={companies}
              maktoobs={filteredMaktoobs} // Pass filtered maktoobs
              minerals={minerals}
              scales={scales}
              units={units}
              selectedCompany={fromCompany ? company : null}
              currentUser={currentUser}
              hideUserField={true}
              hideScaleField={true}
            />
          )}
        </ModalBody>
      </Modal>

      {/* Edit Purchase Modal */}
      <Modal isOpen={editPurchaseModal} toggle={closeModals} size="lg">
        <ModalHeader toggle={closeModals}>
          <div>
            {t("Edit Purchase")} - ID: {selectedPurchase?.id}
          </div>
        </ModalHeader>
        <ModalBody>
          <AddNewPurchase
            initialData={selectedPurchase}
            onSuccess={handleEditPurchase}
            onCancel={closeModals}
            loading={isSubmitting}
            isEdit={true}
            companies={companies}
            maktoobs={filteredMaktoobs} // Pass filtered maktoobs
            minerals={minerals}
            scales={scales}
            units={units}
            currentUser={currentUser}
            hideUserField={true}
            hideScaleField={true}
          />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={closeModals}>
        <ModalHeader toggle={closeModals}>{t("Delete Purchase")}</ModalHeader>
        <ModalBody>
          <p>{t("Are you sure you want to delete this purchase?")}</p>
          {selectedPurchase && (
            <div className="mt-2">
              <strong>
                {t("Purchase ID")}: {selectedPurchase.id}
              </strong>
              <br />
              <small className="text-muted">
                {t("Area")}: {selectedPurchase.area || "N/A"} |
                {t("Mineral Amount")}: {selectedPurchase.mineral_amount || "0"} |
                {t("Total Price")}: $
                {selectedPurchase.mineral_total_price
                  ? parseFloat(selectedPurchase.mineral_total_price).toFixed(2)
                  : "0.00"}
              </small>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeModals}>
            {t("Cancel")}
          </Button>
          <Button color="danger" onClick={handleDeleteConfirm}>
            <Trash2 size={14} className="me-50" />
            {t("Delete")}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default PurchaseTable;